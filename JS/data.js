const API_RETRY_BASE_DELAY_MS = 1500;
const API_RETRY_MAX_DELAY_MS = 30000;

async function loadAtlasData() {
  state.servantSidebarLoading = true; state.ceSidebarLoading = true; state.servantSidebarLoadingProgress = 20; state.ceSidebarLoadingProgress = 5; state.dataMode = "remote"; renderServantSidebar(); renderCESidebar();
  let loadedFromFallback = false;
  try {
    let servants;
    try {
      servants = await fetchJsonWithRetry(SERVANT_API_URL, { resourceLabel: "Servants", updateProgress: (attempt) => { state.servantSidebarLoadingProgress = Math.min(85, 20 + attempt * 10); renderServantSidebar(); } });
      setStatus("Servants loaded from Atlas Academy.\nLoading Craft Essences...", "secondary");
    } catch (_error) {
      servants = await fetchLocalJson(FALLBACK_SERVANT_JSON_URL, { resourceLabel: "Servants" }); loadedFromFallback = true;
      setStatus("Atlas servants unavailable. Loaded local servant fallback.\nLoading Craft Essences...", "warning");
    }
    state.servants = normalizeServants(servants); state.servantSidebarLoadingProgress = 50; state.ceSidebarLoadingProgress = 50; state.servantSidebarPage = 1; state.ceSidebarPage = 1; renderServantSidebar();
    setStatus("Loading local Craft Essence snapshot...", "secondary");
    const craftEssences = await fetchLocalJson(LOCAL_CE_JSON_URL, { resourceLabel: "Craft Essences" });
    state.ces = normalizeCEs(craftEssences); state.servantSidebarLoading = false; state.ceSidebarLoading = false; state.servantSidebarLoadingProgress = 100; state.ceSidebarLoadingProgress = 100; state.dataMode = loadedFromFallback ? "fallback" : "remote";
    setStatus(loadedFromFallback ? `Loaded ${state.servants.length.toLocaleString()} servants (local fallback) and ${state.ces.length.toLocaleString()} local Craft Essences.\nChecking Atlas for CE updates...` : `Loaded ${state.servants.length.toLocaleString()} servants and ${state.ces.length.toLocaleString()} local Craft Essences.\nChecking Atlas for CE updates...`, loadedFromFallback ? "warning" : "success");
    refreshCraftEssencesInBackground(); renderCESidebar();
  } catch (error) {
    state.servantSidebarLoading = false; state.ceSidebarLoading = false; state.servantSidebarLoadingProgress = 0; state.ceSidebarLoadingProgress = 0;
    setStatus(`Failed to load data from Atlas Academy and local fallbacks: ${error.message}`, "danger");
  }
}

async function refreshCraftEssencesInBackground() {
  try {
    const remoteCraftEssences = await fetchJsonWithRetry(CE_API_URL, { resourceLabel: "Craft Essence" });
    state.ces = normalizeCEs(remoteCraftEssences); state.ceSidebarPage = 1;
    setStatus(`Craft Essences updated from Atlas Academy (${state.ces.length.toLocaleString()} entries).`, "success");
    renderCESidebar();
  } catch (_error) {
    setStatus(`Using local Craft Essence snapshot (${state.ces.length.toLocaleString()} entries).\nAtlas update check failed.`, "warning");
  }
}

async function fetchJsonWithRetry(url, { resourceLabel, updateProgress }) {
  let attempt = 1, delayMs = API_RETRY_BASE_DELAY_MS;
  while (attempt <= API_RETRY_MAX_ATTEMPTS) {
    updateProgress?.(attempt);
    try {
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (_error) {
      if (attempt >= API_RETRY_MAX_ATTEMPTS) throw new Error(`${resourceLabel} request failed after ${API_RETRY_MAX_ATTEMPTS} attempts.`);
      const retrySeconds = Math.max(1, Math.round(delayMs / 1000));
      setStatus(`${resourceLabel} request failed (attempt ${attempt}).\nRetrying in ${retrySeconds}s...`, "warning");
      await wait(delayMs); attempt += 1; delayMs = Math.min(delayMs * 2, API_RETRY_MAX_DELAY_MS);
    }
  }
  throw new Error(`${resourceLabel} request failed after ${API_RETRY_MAX_ATTEMPTS} attempts.`);
}

async function fetchLocalJson(url, { resourceLabel }) { const response = await fetch(url, { cache: "no-store" }); if (!response.ok) throw new Error(`${resourceLabel} fallback HTTP ${response.status}`); return await response.json(); }
function wait(milliseconds) { return new Promise((resolve) => window.setTimeout(resolve, milliseconds)); }

function normalizeServants(servants) {
  return (Array.isArray(servants) ? servants : [])
    .filter((servant) => servant && servant.name && servant.type !== "enemy" && servant.collectionNo !== 0)
    .map((servant) => ({
      id: servant.id,
      name: servant.name,
      normalizedName: normalizeText(servant.name),
      className: normalizeText(servant.className || "unknown"),
      fallbackImage: createTextImage(servant.name, "#1d3557"),
      image: extractPrimaryImage(servant, "servant"),
      classIcon: createClassIcon(servant.className || "unknown"),
      gender: normalizeText(servant.gender || "unknown"),
      attribute: normalizeText(servant.attribute || "unknown"),
      alignment: (() => {
        if (Array.isArray(servant.alignment) && servant.alignment.length) return servant.alignment.map((a) => humanizeTrait(String(a || ""))).filter(Boolean);
        if (Array.isArray(servant.traits)) return servant.traits.filter((t) => String(t?.name || "").toLowerCase().startsWith("alignment")).map((t) => humanizeTrait(String(t.name))).filter(Boolean);
        return [];
      })(),
      traits: Array.isArray(servant.traits) ? servant.traits.map((trait) => humanizeTrait(trait?.name || "")).filter(Boolean) : [],
      raw: servant
    }))
    .sort((left, right) => left.id - right.id);
}

function hasBondGainFunction(skills) { return Array.isArray(skills) && skills.some((skill) => (skill.functions ?? []).some((func) => isBondGainFunction(func))); }

function normalizeCEs(craftEssences) {
  return (Array.isArray(craftEssences) ? craftEssences : [])
    .filter((ce) => ce && ce.name)
    .map((ce) => {
      const detail = ce.skills?.[0]?.detail || ce.detail || ce.profile?.comments?.[0]?.comment || "";
      const hasBondText = isBondBoostCE(detail), hasBondFunction = hasBondGainFunction(ce.skills);
      if (!hasBondText && !hasBondFunction) return null;
      if (isServantPersonalBondCE(detail, ce)) return null;
      const percentInfo = extractBondPercents(detail, ce.name);
      const parsedPercent = percentInfo.mlbPercent || extractBondPercentFromFunctions(ce.skills);
      const mlbPercent = isFlatBondPointCE(ce.name) ? 0 : parsedPercent;
      if (mlbPercent <= 0) return null;
      const normalizedName = normalizeText(ce.name), hasTeatimeOwnPenalty = normalizedName === "chaldea teatime" && mlbPercent >= 15;
      const ownPercent = hasTeatimeOwnPenalty ? 5 : percentInfo.ownPercent || mlbPercent;
      const supportConditional = hasTeatimeOwnPenalty || percentInfo.isSupportConditional;
      return { id: ce.id, name: ce.name, normalizedName, detail, normalizedDetail: normalizeText(detail), percent: mlbPercent, ownPercent, supportConditional, fallbackImage: createTextImage(ce.name, "#5a189a"), image: extractPrimaryImage(ce, "ce"), raw: ce };
    })
    .filter(Boolean)
    .sort((left, right) => left.id - right.id);
}
