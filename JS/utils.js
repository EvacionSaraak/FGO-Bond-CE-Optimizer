function formatPercent(value) { const n = Number(value) || 0; return Number.isInteger(n) ? String(n) : String(Number(n.toFixed(2))); }

function toAsciiNumber(value) { return Number(String(value || "").replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xFEE0))); }

function isBondGainFunction(func) { const type = normalizeText(func?.funcType || ""); return type === "servantfriendshipup" || type === "bondgain"; }

function extractBondPercentFromFunctions(skills) {
  if (!Array.isArray(skills)) return 0;
  let maxPercent = 0;
  for (const skill of skills) {
    for (const func of Array.isArray(skill.functions) ? skill.functions : []) {
      if (!isBondGainFunction(func)) continue;
      for (const sval of Array.isArray(func.svals) ? func.svals : []) {
        const raw = Number(sval?.Value ?? sval?.value ?? sval?.Rate ?? sval?.rate ?? sval?.val ?? 0);
        if (!raw) continue;
        const percent = raw > 100 ? raw / 100 : raw;
        if (percent > maxPercent) maxPercent = percent;
      }
    }
  }
  return maxPercent;
}

function isBondBoostCE(detail) {
  const original = String(detail || ""), text = normalizeText(original);
  if (!original.trim()) return false;
  if (original.includes("絆")) return true;
  return text.includes("bond points") || text.includes("bond point") || text.includes("bond gained") || text.includes("bond gain") || text.includes("increases bond") || text.includes("friendship");
}

function isServantPersonalBondCE(_detail, rawCE = null) { return Number(rawCE?.bondEquipOwner ?? 0) > 0; }

function extractBondPercents(detail, ceName = "") {
  const original = String(detail || "");
  if (!isBondBoostCE(original)) return { basePercent: 0, mlbPercent: 0, ownBasePercent: 0, ownMlbPercent: 0, isSupportConditional: false };
  const jpBondMatches = [...original.matchAll(/絆[^0-9０-９]*(\d+|[０-９]+)\s*[%％]/g)];
  const enBondMatches = [...original.matchAll(/(?:bond|friendship)[^0-9]*(\d+)\s*[%％]/gi)];
  const supportMatches = [...original.matchAll(/(?:サポート|support)[^0-9０-９]*(\d+|[０-９]+)\s*[%％]/gi)];
  const values = [...jpBondMatches, ...enBondMatches].map((m) => toAsciiNumber(m[1])).filter(Boolean);
  const supportValues = supportMatches.map((m) => toAsciiNumber(m[1])).filter(Boolean);
  const basePercent = supportValues.length ? Math.max(...supportValues) : values.length ? Math.max(...values) : 0;
  const ownBasePercent = values.length ? Math.min(...values) : basePercent;
  const isSupportConditional = (supportValues.length > 0 && ownBasePercent !== basePercent) || normalizeText(ceName) === "chaldea teatime";
  return { basePercent, mlbPercent: basePercent * 5, ownBasePercent, ownMlbPercent: ownBasePercent * 5, isSupportConditional };
}

function isFlatBondPointCE(ceName = "") { return normalizeText(ceName).includes("portrait"); }

function getCEBondPercent(ce, ceSlotIndex = null) {
  if (!ce) return 0;
  const isOwned = ceSlotIndex !== null && Boolean(state.selectedCEOwned[ceSlotIndex]);
  if (isOwned && Number(ce.ownPercent) > 0) return ce.ownPercent;
  return ce.percent;
}

const JP_CE_CONDITION_ALIASES = { "秩序": "Lawful", "混沌": "Chaotic", "中立": "Neutral", "善": "Good", "悪": "Evil", "中庸": "Balanced", "狂": "Madness", "夏": "Summer", "男性": "Male", "女性": "Female", "性別不明": "Unknown", "天": "Sky", "地": "Earth", "人": "Man", "星": "Star", "獣": "Beast", "セイバー": "Saber", "アーチャー": "Archer", "ランサー": "Lancer", "ライダー": "Rider", "キャスター": "Caster", "アサシン": "Assassin", "バーサーカー": "Berserker", "ルーラー": "Ruler", "アヴェンジャー": "Avenger", "ムーンキャンサー": "Moon Cancer", "アルターエゴ": "Alter Ego", "フォーリナー": "Foreigner", "プリテンダー": "Pretender" };

function getJapaneseBondConditionGroups(detail) {
  const text = String(detail || ""), groups = [];
  for (const match of text.matchAll(/〔([^〕]+)〕[^。]*?絆/g)) {
    const alternatives = String(match[1] || "").split(/(?:または|又は| or )/i);
    for (const alternative of alternatives) {
      const conditions = Object.entries(JP_CE_CONDITION_ALIASES).filter(([jp]) => alternative.includes(jp)).map(([, value]) => value);
      if (conditions.length) groups.push([...new Set(conditions)]);
    }
  }
  return groups;
}

function conditionForMatching(condition) { return normalizeText(condition.replace(/\s+/g, "")); }

function servantMatchesCECondition(servant, condition) {
  const values = new Set([normalizeText(servant.name), servant.normalizedName, normalizeText(servant.className), servant.gender, servant.attribute, ...(Array.isArray(servant.alignment) ? servant.alignment : []), ...(Array.isArray(servant.traits) ? servant.traits : [])].filter(Boolean).flatMap((v) => [normalizeText(v), normalizeText(String(v).replace(/\s+/g, ""))]));
  return values.has(conditionForMatching(condition));
}

function getCEEffectTag(ce) {
  const groups = getJapaneseBondConditionGroups(ce?.detail || "");
  const base = formatPercent(ce?.basePercent ?? (Number(ce?.percent || 0) / 5));
  const mlb = formatPercent(ce?.percent || 0);
  const target = groups.length ? groups.map((group) => group.join(" ")).join(" / ") : "All";
  return `${target} +${base}% (${mlb}% MLB)`;
}

function isGenericJapaneseBondCE(detail) { const text = String(detail || ""); return text.includes("絆") && !getJapaneseBondConditionGroups(text).length; }

function matchesPartyWideBondRule(description) { return ["all allies", "all party members", "party members", "all party", "frontline allies", "frontline servants", "frontline party", "all frontline", "including sub members"].some((phrase) => description.includes(phrase)); }

function isExceptSelfCE(description) { return /(except yourself|except self|except equipped servant|excluding yourself|excluding the equipped servant)/.test(description); }

function doesCEAffectServant(ce, servant, ceSlotIndex, servantSlotIndex, ignoreExceptSelf = false) {
  if (!ce || !servant) return false;
  const jpConditionGroups = getJapaneseBondConditionGroups(ce.detail || "");
  if (jpConditionGroups.length) return jpConditionGroups.some((group) => group.every((condition) => servantMatchesCECondition(servant, condition)));
  if (isGenericJapaneseBondCE(ce.detail || "")) return true;
  const description = ce.normalizedDetail || normalizeText(ce.detail || ""), exceptSelf = isExceptSelfCE(description);
  if (!ignoreExceptSelf && exceptSelf && ceSlotIndex === servantSlotIndex) return false;
  if (matchesPartyWideBondRule(description)) return true;
  if (description.includes(servant.normalizedName)) return true;
  if (description.includes(`${servant.className} class`) || description.includes(`${servant.className}-class`) || description.includes(`${servant.className} allies`) || description.includes(`${servant.className} servants`)) return true;
  if (servant.gender !== "unknown" && (description.includes(`${servant.gender} allies`) || description.includes(`${servant.gender} servants`) || description.includes(`${servant.gender} party`))) return true;
  if (servant.attribute !== "unknown" && (description.includes(`${servant.attribute} allies`) || description.includes(`${servant.attribute} servants`) || description.includes(`${servant.attribute} attribute`))) return true;
  return servant.traits.some((trait) => trait && description.includes(trait));
}
