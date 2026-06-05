async function loadAtlasData() {
  try {
    const [servantResponse, ceResponse] = await Promise.all([
      fetch(SERVANT_API_URL),
      fetch(CE_API_URL)
    ]);

    if (!servantResponse.ok || !ceResponse.ok) {
      throw new Error("Atlas Academy request failed.");
    }

    const [servants, craftEssences] = await Promise.all([
      servantResponse.json(),
      ceResponse.json()
    ]);

    state.servants = normalizeServants(servants);
    state.ces = normalizeCEs(craftEssences);
    state.dataMode = "remote";
    setStatus(
      `Loaded ${state.servants.length.toLocaleString()} servants and ${state.ces.length.toLocaleString()} Craft Essences from Atlas Academy.`,
      "success"
    );
  } catch (_error) {
    await loadFallbackData();
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
        const policy = servant.profile?.stats?.policy || servant.limits?.[0]?.policy;
        const personality = servant.profile?.stats?.personality || servant.limits?.[0]?.personality;
        return [policy, personality]
          .map((a) => humanizeTrait(String(a || "")))
          .filter((a) => a && a !== "none");
      })(),
      traits: Array.isArray(servant.traits)
        ? servant.traits.map((trait) => humanizeTrait(trait?.name || ""))
        : [],
      raw: servant
    }))
    .sort((left, right) => left.name.localeCompare(right.name));
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
      const percent = extractBondPercent(detail);
      return {
        id: ce.id,
        name: ce.name,
        normalizedName: normalizeText(ce.name),
        detail,
        normalizedDetail: normalizeText(detail),
        percent,
        fallbackImage: createTextImage(ce.name, "#5a189a"),
        image: extractPrimaryImage(ce, "ce"),
        raw: ce
      };
    })
    .sort((left, right) => right.percent - left.percent || left.name.localeCompare(right.name));
}
