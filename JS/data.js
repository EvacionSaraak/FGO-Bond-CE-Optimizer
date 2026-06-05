async function loadAtlasData() {
  // Load servants first so the sidebar is usable while CEs are still downloading.
  try {
    const servantResponse = await fetch(SERVANT_API_URL);
    if (!servantResponse.ok) {
      throw new Error("Atlas Academy servant request failed.");
    }
    state.servants = normalizeServants(await servantResponse.json());
    renderServantSidebar();
    setStatus("Servants loaded. Loading Craft Essences...", "secondary");
  } catch (_error) {
    await loadFallbackData();
    return;
  }

  // Load CEs from the targeted search endpoint (bond-gain CEs only, much smaller).
  try {
    const ceResponse = await fetch(CE_API_URL);
    if (!ceResponse.ok) {
      throw new Error("Atlas Academy CE request failed.");
    }
    state.ces = normalizeCEs(await ceResponse.json());
    state.dataMode = "remote";
    setStatus(
      `Loaded ${state.servants.length.toLocaleString()} servants and ${state.ces.length.toLocaleString()} Craft Essences from Atlas Academy.`,
      "success"
    );
    renderCESidebar();
  } catch (_error) {
    // Servants already loaded; only fall back the CE portion.
    try {
      const ceResponse = await fetch("JSON/fallback-ces.json");
      state.ces = normalizeCEs(await ceResponse.json());
    } catch (_fallbackError) {
      state.ces = [];
    }
    setStatus(
      "Servants loaded from Atlas Academy. Craft Essence data fell back to the local dataset.",
      "warning"
    );
    renderCESidebar();
  }
}

async function loadFallbackData() {
  try {
    const [servantResponse, ceResponse] = await Promise.all([
      fetch("JSON/fallback-servants.json"),
      fetch("JSON/fallback-ces.json")
    ]);
    const [servants, craftEssences] = await Promise.all([
      servantResponse.json(),
      ceResponse.json()
    ]);
    state.servants = normalizeServants(servants);
    state.ces = normalizeCEs(craftEssences);
    state.dataMode = "fallback";
    setStatus(
      "Atlas Academy data could not be reached in this environment, so a small embedded fallback dataset is being used for local verification. The page still fetches the live API during normal use.",
      "warning"
    );
  } catch (_error) {
    state.servants = [];
    state.ces = [];
    state.dataMode = "fallback";
    setStatus("Failed to load any data. Please refresh the page.", "danger");
  }
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
      const mlbPercent = percentInfo.mlbPercent || extractBondPercentFromFunctions(ce.skills);
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
