const API_RETRY_BASE_DELAY_MS = 1500;
const API_RETRY_MAX_DELAY_MS = 30000;

async function loadAtlasData() {
  // Load servants first so the sidebar is usable while CEs are still downloading.
  state.servantSidebarLoading = true;
  state.ceSidebarLoading = true;
  state.servantSidebarLoadingProgress = 20;
  state.ceSidebarLoadingProgress = 5;
  state.dataMode = "remote";
  renderServantSidebar();
  renderCESidebar();

  let loadedFromFallback = false;
  try {
    let servants;
    try {
      servants = await fetchJsonWithRetry(SERVANT_API_URL, {
        resourceLabel: "Servants",
        updateProgress: (attempt) => {
          state.servantSidebarLoadingProgress = Math.min(85, 20 + attempt * 10);
          renderServantSidebar();
        }
      });
      setStatus("Servants loaded from Atlas Academy. Loading Craft Essences...", "secondary");
    } catch (_error) {
      servants = await fetchLocalJson(FALLBACK_SERVANT_JSON_URL, { resourceLabel: "Servants" });
      loadedFromFallback = true;
      setStatus("Atlas servants unavailable. Loaded local servant fallback. Loading Craft Essences...", "warning");
    }

    state.servants = normalizeServants(servants);
    state.servantSidebarLoading = false;
    state.servantSidebarLoadingProgress = 100;
    state.ceSidebarLoadingProgress = 40;
    renderServantSidebar();

    // Load the lore CE export so profile comments are available for bond CE detection.
    let craftEssences;
    try {
      craftEssences = await fetchJsonWithRetry(CE_API_URL, {
        resourceLabel: "Craft Essence",
        updateProgress: (attempt) => {
          state.ceSidebarLoadingProgress = Math.min(95, 50 + attempt * 8);
          renderCESidebar();
        }
      });
    } catch (_error) {
      craftEssences = await fetchLocalJson(FALLBACK_CE_JSON_URL, { resourceLabel: "Craft Essences" });
      loadedFromFallback = true;
      setStatus("Atlas Craft Essences unavailable. Loaded local CE fallback.", "warning");
    }

    state.ces = normalizeCEs(craftEssences);
    state.ceSidebarLoading = false;
    state.ceSidebarLoadingProgress = 100;
    state.dataMode = loadedFromFallback ? "fallback" : "remote";
    setStatus(
      loadedFromFallback
        ? `Loaded ${state.servants.length.toLocaleString()} servants and ${state.ces.length.toLocaleString()} Craft Essences with local fallback data.`
        : `Loaded ${state.servants.length.toLocaleString()} servants and ${state.ces.length.toLocaleString()} Craft Essences from Atlas Academy.`,
      loadedFromFallback ? "warning" : "success"
    );
    renderCESidebar();
  } catch (error) {
    state.servantSidebarLoading = false;
    state.ceSidebarLoading = false;
    state.servantSidebarLoadingProgress = 0;
    state.ceSidebarLoadingProgress = 0;
    setStatus(`Failed to load data from Atlas Academy and local fallbacks: ${error.message}`, "danger");
  }
}

async function fetchJsonWithRetry(url, { resourceLabel, updateProgress }) {
  let attempt = 1;
  let delayMs = API_RETRY_BASE_DELAY_MS;
  while (attempt <= API_RETRY_MAX_ATTEMPTS) {
    updateProgress?.(attempt);
    try {
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.json();
    } catch (_error) {
      if (attempt >= API_RETRY_MAX_ATTEMPTS) {
        throw new Error(`${resourceLabel} request failed after ${API_RETRY_MAX_ATTEMPTS} attempts.`);
      }
      const retrySeconds = Math.max(1, Math.round(delayMs / 1000));
      setStatus(`${resourceLabel} request failed (attempt ${attempt}). Retrying in ${retrySeconds}s...`, "warning");
      await wait(delayMs);
      attempt += 1;
      delayMs = Math.min(delayMs * 2, API_RETRY_MAX_DELAY_MS);
    }
  }
  throw new Error(`${resourceLabel} request failed after ${API_RETRY_MAX_ATTEMPTS} attempts.`);
}

async function fetchLocalJson(url, { resourceLabel }) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`${resourceLabel} fallback HTTP ${response.status}`);
  }
  return await response.json();
}

function wait(milliseconds) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}

function normalizeServants(servants) {
  return (Array.isArray(servants) ? servants : [])
    .filter((servant) => servant && servant.name && servant.type !== "enemy" && servant.collectionNo !== 0)
    .map((servant) => ({
      id: servant.id,
      name: servant.name,
      normalizedName: normalizeText(servant.name),
      className: servant.className || "unknown",
      fallbackImage: createTextImage(servant.name, "#1d3557"),
      image: extractPrimaryImage(servant, "servant"),
      classIcon: createClassIcon(servant.className || "unknown"),
      gender: normalizeText(servant.gender || "unknown"),
      attribute: normalizeText(servant.attribute || "unknown"),
      alignment: (() => {
        if (Array.isArray(servant.alignment) && servant.alignment.length) {
          return servant.alignment.map((a) => humanizeTrait(String(a || ""))).filter(Boolean);
        }
        // Live API: alignment is encoded in traits as e.g. "alignmentLawful", "alignmentGood"
        if (Array.isArray(servant.traits)) {
          return servant.traits
            .filter((t) => String(t?.name || "").toLowerCase().startsWith("alignment"))
            .map((t) => humanizeTrait(String(t.name)))
            .filter(Boolean);
        }
        return [];
      })(),
      traits: Array.isArray(servant.traits)
        ? servant.traits.map((trait) => humanizeTrait(trait?.name || ""))
        : [],
      raw: servant
    }))
    .sort((left, right) => left.id - right.id);
}

function normalizeCEs(craftEssences) {
  return (Array.isArray(craftEssences) ? craftEssences : [])
    .filter((ce) => ce && ce.name)
    .map((ce) => {
      // Atlas Academy stores the CE skill description in skills[0].detail.
      // The top-level ce.detail is often empty; fall back through available fields.
      const detail =
        ce.skills?.[0]?.detail ||
        ce.detail ||
        ce.profile?.comments?.[0]?.comment ||
        "";
      const percentInfo = extractBondPercents(detail, ce.name);
      // If the live API uses {0}% format strings in skill detail, text extraction yields 0.
      // Fall back to reading the actual values from the functions/svals data.
      const parsedPercent = percentInfo.mlbPercent || extractBondPercentFromFunctions(ce.skills);
      const mlbPercent = isFlatBondPointCE(ce.name) ? 0 : parsedPercent;
      const normalizedName = normalizeText(ce.name);
      const hasTeatimeOwnPenalty = normalizedName === "chaldea teatime" && mlbPercent >= 15;
      const ownPercent = hasTeatimeOwnPenalty ? 5 : percentInfo.ownPercent || mlbPercent;
      const supportConditional = hasTeatimeOwnPenalty || percentInfo.isSupportConditional;
      return {
        id: ce.id,
        name: ce.name,
        normalizedName,
        detail,
        normalizedDetail: normalizeText(detail),
        percent: mlbPercent,
        ownPercent,
        supportConditional,
        fallbackImage: createTextImage(ce.name, "#5a189a"),
        image: extractPrimaryImage(ce, "ce"),
        raw: ce
      };
    })
    .filter((ce) => {
      const hasBondText = isBondBoostCE(ce.detail);
      const hasBondFunction = (ce.raw?.skills ?? []).some((s) =>
        (s.functions ?? []).some((f) => f.funcType === "bondGain")
      );
      return ce.percent > 0 && (hasBondText || hasBondFunction) && !isServantPersonalBondCE(ce.detail, ce.raw);
    })
    .sort((left, right) => left.id - right.id);
}
