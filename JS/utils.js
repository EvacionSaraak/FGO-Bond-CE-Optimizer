function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function toTitleCase(value) {
  return String(value || "")
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function firstOpenSlot(collection) {
  const emptyIndex = collection.findIndex((entry) => entry === null);
  return emptyIndex === -1 ? 0 : emptyIndex;
}

function humanizeTrait(traitName) {
  return normalizeText(
    String(traitName || "")
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/[_-]/g, " ")
      .replace(/\b(class|attribute|alignment)\b/gi, "")
  );
}

function classAbbreviation(className) {
  return className
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function extractBondPercent(detail) {
  const matches = [...String(detail || "").matchAll(/(\d+)\s*[%％]/g)].map((match) => Number(match[1]));
  return matches.length ? Math.max(...matches) : 0;
}

function isBondBoostCE(detail) {
  const lowered = String(detail || "").toLowerCase();
  const hasBondKeyword = lowered.includes("bond") || lowered.includes("絆");
  const hasBoostKeyword = /(increase|boost|gain|gained|up|アップ|増加|獲得)/.test(lowered);
  return hasBondKeyword && hasBoostKeyword;
}

function isServantPersonalBondCE(detail, rawCE = null) {
  // Atlas Academy sets bondEquipOwner to the servant's numeric ID (> 0) for Bond Level 10 CEs.
  // Regular CEs have bondEquipOwner set to 0, so only treat positive values as personal.
  if (rawCE != null && rawCE.bondEquipOwner > 0) {
    return true;
  }

  if (!isBondBoostCE(detail)) {
    return false;
  }

  const normalized = normalizeText(detail || "");

  // Party-wide or group-targeted CEs are not personal bond CEs.
  if (matchesPartyWideBondRule(normalized)) {
    return false;
  }

  // These terms only appear in descriptions that target a group, never a single servant.
  const groupTerms = [
    "allies", "party", "frontline", "members", "servants",
    "class", "male", "female", "サーヴァント", "味方"
  ];
  if (groupTerms.some((term) => normalized.includes(term))) {
    return false;
  }

  // A bond boost CE with no group terms targets a single specific servant.
  return true;
}

function extractBondPercents(detail, ceName = "") {
  const values = [...String(detail || "").matchAll(/(\d+)\s*[%％]/g)].map((match) => Number(match[1]));
  const mlbPercent = values.length ? Math.max(...values) : 0;
  const lowered = String(detail || "").toLowerCase();
  const isSupportConditional =
    /\bsupport\b|サポート/.test(lowered) || normalizeText(ceName) === "chaldea teatime";
  const ownPercent = isSupportConditional && values.length > 1 ? Math.min(...values) : mlbPercent;
  return {
    mlbPercent,
    ownPercent,
    isSupportConditional: isSupportConditional && ownPercent !== mlbPercent
  };
}

function getCEBondPercent(ce, ceSlotIndex = null) {
  if (!ce) {
    return 0;
  }
  const isOwned = ceSlotIndex !== null && Boolean(state.selectedCEOwned[ceSlotIndex]);
  if (isOwned && Number(ce.ownPercent) > 0) {
    return ce.ownPercent;
  }
  return ce.percent;
}

function matchesPartyWideBondRule(description) {
  return [
    "all allies",
    "all party members",
    "party members",
    "all party",
    "frontline allies",
    "frontline servants",
    "frontline party",
    "all frontline",
    "including sub members"
  ].some((phrase) => description.includes(phrase));
}

function isExceptSelfCE(description) {
  return /(except yourself|except self|except equipped servant|excluding yourself|excluding the equipped servant)/.test(description);
}

function doesCEAffectServant(ce, servant, ceSlotIndex, servantSlotIndex, ignoreExceptSelf = false) {
  if (!ce || !servant) {
    return false;
  }

  const description = ce.normalizedDetail || normalizeText(ce.detail || "");
  const exceptSelf = isExceptSelfCE(description);
  if (!ignoreExceptSelf && exceptSelf && ceSlotIndex === servantSlotIndex) {
    return false;
  }

  if (matchesPartyWideBondRule(description)) {
    return true;
  }

  if (description.includes(servant.normalizedName)) {
    return true;
  }

  if (
    description.includes(`${servant.className} class`) ||
    description.includes(`${servant.className}-class`) ||
    description.includes(`${servant.className} allies`) ||
    description.includes(`${servant.className} servants`)
  ) {
    return true;
  }

  if (
    servant.gender !== "unknown" &&
    (description.includes(`${servant.gender} allies`) ||
      description.includes(`${servant.gender} servants`) ||
      description.includes(`${servant.gender} party`))
  ) {
    return true;
  }

  if (
    servant.attribute !== "unknown" &&
    (description.includes(`${servant.attribute} allies`) ||
      description.includes(`${servant.attribute} servants`) ||
      description.includes(`${servant.attribute} attribute`))
  ) {
    return true;
  }

  return servant.traits.some((trait) => trait && description.includes(trait));
}

function getServantBondBonus(servantSlotIndex) {
  const servant = state.selectedServants[servantSlotIndex];
  if (!servant) {
    return 0;
  }

  return state.selectedCEs.reduce((sum, ce, ceSlotIndex) => {
    if (!ce || !doesCEAffectServant(ce, servant, ceSlotIndex, servantSlotIndex)) {
      return sum;
    }
    return sum + getCEBondPercent(ce, ceSlotIndex);
  }, 0);
}

function extractPrimaryImage(entry, type) {
  const groups = [
    entry?.extraAssets?.faces?.ascension,
    entry?.extraAssets?.faces?.equip,
    entry?.extraAssets?.equipFace?.equip,
    entry?.extraAssets?.charaGraph?.equip,
    entry?.extraAssets?.charaGraph?.ascension,
    entry?.extraAssets?.image?.story
  ].filter(Boolean);

  for (const group of groups) {
    const value = firstImageFromGroup(group);
    if (value) {
      return value;
    }
  }

  const label = type === "servant" ? "SVT" : "CE";
  return createTextImage(label, type === "servant" ? "#1d3557" : "#5a189a");
}

function firstImageFromGroup(group) {
  if (!group) {
    return "";
  }

  if (typeof group === "string") {
    return group;
  }

  const values = Object.values(group);
  for (const value of values) {
    const image = firstImageFromGroup(value);
    if (image) {
      return image;
    }
  }

  return "";
}

function createClassIcon(className) {
  const normalized = normalizeText(className || "unknown") || "unknown";
  if (classIconCache.has(normalized)) {
    return classIconCache.get(normalized);
  }
  const canvas = document.createElement("canvas");
  canvas.width = CLASS_ICON_SIZE;
  canvas.height = CLASS_ICON_SIZE;
  const context = canvas.getContext("2d");
  const fill = CLASS_COLORS[normalized] || "#495057";

  context.fillStyle = fill;
  context.beginPath();
  context.arc(CLASS_ICON_SIZE / 2, CLASS_ICON_SIZE / 2, 28, 0, Math.PI * 2);
  context.fill();
  context.strokeStyle = "rgba(255,255,255,0.85)";
  context.lineWidth = 3;
  context.stroke();
  context.fillStyle = normalized === "ruler" ? "#212529" : "#ffffff";
  context.font = "bold 18px sans-serif";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(classAbbreviation(normalized), CLASS_ICON_SIZE / 2, CLASS_ICON_SIZE / 2 + 1);

  const dataUrl = canvas.toDataURL("image/png");
  classIconCache.set(normalized, dataUrl);
  return dataUrl;
}

function createTextImage(label, color) {
  const safeLabel = escapeHtml(
    String(label || "")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .join(" ")
      .slice(0, 18) || "FGO"
  );
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" rx="24" fill="${color}"/><text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" fill="white" font-family="Arial, sans-serif" font-size="24" font-weight="700">${safeLabel}</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function bindImageFallbacks(root) {
  root.querySelectorAll("img[data-fallback-src]").forEach((image) => {
    image.addEventListener(
      "error",
      () => {
        if (image.dataset.fallbackSrc && image.src !== image.dataset.fallbackSrc) {
          image.src = image.dataset.fallbackSrc;
        }
      },
      { once: true }
    );
  });
}
