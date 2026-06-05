function normalizeText(value) { return String(value || "").toLowerCase().replace(/[^a-z0-9\s'-]/g, " ").replace(/\s+/g, " ").trim(); }
function escapeHtml(value) { return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;/g").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;"); }
function toTitleCase(value) { return String(value || "").split(/\s+/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" "); }
function formatPercent(value) { const n = Number(value) || 0; return Number.isInteger(n) ? String(n) : String(Number(n.toFixed(2))); }
function toAsciiNumber(value) { return Number(String(value || "").replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xFEE0))); }
function firstOpenSlot(collection) { const emptyIndex = collection.findIndex((entry) => entry === null); return emptyIndex === -1 ? 0 : emptyIndex; }
function getTargetServantSlotIndex() { return state.activeServantSlot ?? firstOpenSlot(state.selectedServants); }
function canAddServantToSelection(servantId, targetIndex = getTargetServantSlotIndex()) { const currentServant = state.selectedServants[targetIndex], currentIsSameServant = currentServant?.id === servantId, existingCopies = state.selectedServants.filter((entry) => entry?.id === servantId).length, copiesAfterReplacingTarget = existingCopies - (currentIsSameServant ? 1 : 0); return copiesAfterReplacingTarget < 2; }
function humanizeTrait(traitName) { return normalizeText(String(traitName || "").replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[_-]/g, " ").replace(/\b(class|attribute|alignment)\b/gi, "")); }
function classAbbreviation(className) { return String(className || "").split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase(); }

function isBondGainFunction(func) { const type = normalizeText(func?.funcType || ""); return type === "servantfriendshipup" || type === "bondgain"; }
function extractBondPercent(detail) { const info = extractBondPercents(detail); return info.mlbPercent || 0; }
function extractBondPercentFromFunctions(skills) { if (!Array.isArray(skills)) return 0; let maxPercent = 0; for (const skill of skills) { for (const func of Array.isArray(skill.functions) ? skill.functions : []) { if (!isBondGainFunction(func)) continue; for (const sval of Array.isArray(func.svals) ? func.svals : []) { const raw = Number(sval?.Value ?? sval?.value ?? sval?.Rate ?? sval?.rate ?? sval?.val ?? 0); if (!raw) continue; const percent = raw > 100 ? raw / 100 : raw; if (percent > maxPercent) maxPercent = percent; } } } return maxPercent; }
function isBondBoostCE(detail) { const original = String(detail || ""), text = normalizeText(original); if (!original.trim()) return false; if (original.includes("絆")) return true; return text.includes("bond points") || text.includes("bond point") || text.includes("bond gained") || text.includes("bond gain") || text.includes("increases bond") || text.includes("friendship"); }
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
  const mlbMultiplier = getBondMLBMultiplier(ceName);
  const ownBasePercent = values.length ? Math.min(...values) : basePercent;
  const isSupportConditional = (supportValues.length > 0 && ownBasePercent !== basePercent) || normalizeText(ceName) === "chaldea teatime";
  return { basePercent, mlbPercent: basePercent * mlbMultiplier, ownBasePercent, ownMlbPercent: ownBasePercent * mlbMultiplier, isSupportConditional };
}

function isFlatBondPointCE(ceName = "") { return normalizeText(ceName).includes("portrait"); }
function isPremultipliedBondPercentCE(ceName = "") { const raw = String(ceName || ""), name = normalizeText(raw); return raw.includes("英霊極点") || name.includes("heroic spirit apex"); }
function getBondMLBMultiplier(ceName = "") { if (isPremultipliedBondPercentCE(ceName)) return 1; return 5; }
function getCEBondPercent(ce, ceSlotIndex = null) { if (!ce) return 0; const isOwned = ceSlotIndex !== null && Boolean(state.selectedCEOwned[ceSlotIndex]); if (isOwned && Number(ce.ownPercent) > 0) return ce.ownPercent; return ce.percent; }

const JP_CE_CONDITION_ALIASES = {
  "秩序": { label: "Lawful", aliases: ["lawful"] },
  "混沌": { label: "Chaotic", aliases: ["chaotic"] },
  "中立": { label: "Neutral", aliases: ["neutral"] },
  "善": { label: "Good", aliases: ["good"] },
  "悪": { label: "Evil", aliases: ["evil"] },
  "中庸": { label: "Balanced", aliases: ["balanced"] },
  "狂": { label: "Madness", aliases: ["madness"] },
  "夏": { label: "Summer", aliases: ["summer"] },
  "男性": { label: "Male", aliases: ["male"] },
  "女性": { label: "Female", aliases: ["female"] },
  "性別不明": { label: "Unknown", aliases: ["unknown"] },
  "天": { label: "Sky", aliases: ["sky"] },
  "地": { label: "Earth", aliases: ["earth"] },
  "人": { label: "Man", aliases: ["man"] },
  "星": { label: "Star", aliases: ["star"] },
  "獣": { label: "Beast", aliases: ["beast"] },
  "七騎士": { label: "Seven Knights", aliases: ["seven knights", "standard class", "standard classes"], classes: ["saber", "archer", "lancer", "rider", "caster", "assassin", "berserker"] },
  "ケモノ科": { label: "Animal Characteristic", aliases: ["animal characteristic", "animal characteristics", "animal characteristics servant", "animal trait", "kemono"] },
  "衣装持ち": { label: "Costume-Owning", aliases: ["costume owning", "costume-owning", "costume owning trait", "has costume", "costume"] },
  "霊衣": { label: "Costume-Owning", aliases: ["costume owning", "costume-owning", "costume owning trait", "has costume", "costume"] },
  "セイバー": { label: "Saber", aliases: ["saber"] },
  "アーチャー": { label: "Archer", aliases: ["archer"] },
  "ランサー": { label: "Lancer", aliases: ["lancer"] },
  "ライダー": { label: "Rider", aliases: ["rider"] },
  "キャスター": { label: "Caster", aliases: ["caster"] },
  "アサシン": { label: "Assassin", aliases: ["assassin"] },
  "バーサーカー": { label: "Berserker", aliases: ["berserker"] },
  "ルーラー": { label: "Ruler", aliases: ["ruler"] },
  "アヴェンジャー": { label: "Avenger", aliases: ["avenger"] },
  "ムーンキャンサー": { label: "Moon Cancer", aliases: ["moon cancer", "mooncancer"] },
  "アルターエゴ": { label: "Alter Ego", aliases: ["alter ego", "alterego"] },
  "フォーリナー": { label: "Foreigner", aliases: ["foreigner"] },
  "プリテンダー": { label: "Pretender", aliases: ["pretender"] }
};

function getJapaneseBondConditionGroups(detail) {
  const text = String(detail || ""), groups = [];
  for (const match of text.matchAll(/〔([^〕]+)〕[^。]*?絆/g)) {
    const alternatives = String(match[1] || "").split(/(?:または|又は| or )/i);
    for (const alternative of alternatives) {
      const conditions = Object.entries(JP_CE_CONDITION_ALIASES).filter(([jp]) => alternative.includes(jp)).map(([, entry]) => entry.label);
      if (conditions.length) groups.push([...new Set(conditions)]);
    }
  }
  return groups;
}

function compactTrait(value) { return normalizeText(String(value || "").replace(/[\s_-]+/g, "")); }
function getConditionAliases(condition) { const entry = Object.values(JP_CE_CONDITION_ALIASES).find((item) => item.label === condition); return [condition, ...(entry?.aliases || [])]; }
function servantMatchesCECondition(servant, condition) {
  const entry = Object.values(JP_CE_CONDITION_ALIASES).find((item) => item.label === condition);
  if (entry?.classes?.length) return entry.classes.includes(normalizeText(servant.className));
  const servantValues = [servant.name, servant.normalizedName, servant.className, servant.gender, servant.attribute, ...(Array.isArray(servant.alignment) ? servant.alignment : []), ...(Array.isArray(servant.traits) ? servant.traits : [])].filter(Boolean);
  const valueSet = new Set(servantValues.flatMap((value) => [normalizeText(value), compactTrait(value)]));
  return getConditionAliases(condition).some((alias) => valueSet.has(normalizeText(alias)) || valueSet.has(compactTrait(alias)));
}
function isGenericJapaneseBondCE(detail) { const text = String(detail || ""); return text.includes("絆") && !getJapaneseBondConditionGroups(text).length; }
function getCEEffectTag(ce) { const groups = getJapaneseBondConditionGroups(ce?.detail || ""), base = formatPercent(ce?.basePercent ?? (Number(ce?.percent || 0) / getBondMLBMultiplier(ce?.name || ""))), mlb = formatPercent(ce?.percent || 0), target = groups.length ? groups.map((group) => group.join(" ")).join(" / ") : "All"; return `${target} +${base}% (${mlb}% MLB)`; }

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
function getServantBondBonus(servantSlotIndex) {
  const servant = state.selectedServants[servantSlotIndex];
  if (!servant) return 0;
  const partyBond15Bonus = state.selectedServants.reduce((sum, selectedServant, selectedSlotIndex) => {
    if (!selectedServant || selectedSlotIndex === servantSlotIndex || !state.selectedServantBond15[selectedSlotIndex]) return sum;
    return sum + 25;
  }, 0);
  const ceBonus = state.selectedCEs.reduce((sum, ce, ceSlotIndex) => {
    if (!ce || !doesCEAffectServant(ce, servant, ceSlotIndex, servantSlotIndex)) return sum;
    return sum + getCEBondPercent(ce, ceSlotIndex);
  }, 0);
  return ceBonus + partyBond15Bonus;
}

function extractPrimaryImage(entry, type) {
  const groups = [entry?.extraAssets?.faces?.ascension, entry?.extraAssets?.faces?.equip, entry?.extraAssets?.equipFace?.equip, entry?.extraAssets?.charaGraph?.equip, entry?.extraAssets?.charaGraph?.ascension, entry?.extraAssets?.image?.story].filter(Boolean);
  for (const group of groups) { const value = firstImageFromGroup(group); if (value) return value; }
  return createTextImage(type === "servant" ? "SVT" : "CE", type === "servant" ? "#1d3557" : "#5a189a");
}
function firstImageFromGroup(group) { if (!group) return ""; if (typeof group === "string") return group; for (const value of Object.values(group)) { const image = firstImageFromGroup(value); if (image) return image; } return ""; }
function createClassIcon(className) {
  const normalized = normalizeText(className || "unknown") || "unknown";
  if (classIconCache.has(normalized)) return classIconCache.get(normalized);
  const canvas = document.createElement("canvas");
  canvas.width = CLASS_ICON_SIZE; canvas.height = CLASS_ICON_SIZE;
  const context = canvas.getContext("2d"), fill = CLASS_COLORS[normalized] || "#495057";
  context.fillStyle = fill; context.beginPath(); context.arc(CLASS_ICON_SIZE / 2, CLASS_ICON_SIZE / 2, 28, 0, Math.PI * 2); context.fill();
  context.strokeStyle = "rgba(255,255,255,0.85)"; context.lineWidth = 3; context.stroke();
  context.fillStyle = normalized === "ruler" ? "#212529" : "#ffffff"; context.font = "bold 18px sans-serif"; context.textAlign = "center"; context.textBaseline = "middle"; context.fillText(classAbbreviation(normalized), CLASS_ICON_SIZE / 2, CLASS_ICON_SIZE / 2 + 1);
  const dataUrl = canvas.toDataURL("image/png");
  classIconCache.set(normalized, dataUrl);
  return dataUrl;
}
function createTextImage(label, color) { const safeLabel = escapeHtml(String(label || "").split(/\s+/).filter(Boolean).slice(0, 2).join(" ").slice(0, 18) || "FGO"); const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128"><rect width="100%" height="100%" rx="18" fill="${color}"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="18" font-weight="700">${safeLabel}</text></svg>`; return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`; }
function bindImageFallbacks(root) { root.querySelectorAll("img[data-fallback-src]").forEach((image) => { image.addEventListener("error", () => { if (image.dataset.fallbackSrc && image.src !== image.dataset.fallbackSrc) image.src = image.dataset.fallbackSrc; }, { once: true }); }); }
