const SERVANT_API_URL = "https://api.atlasacademy.io/export/JP/nice_servant_lang_en.json";
const CE_API_URL = "https://api.atlasacademy.io/export/JP/nice_equip_lang_en.json";
const SLOT_COUNT = 6;
const CLASS_ICON_SIZE = 64;

const FALLBACK_DATA = {
  servants: [
    {
      id: 1001,
      collectionNo: 1,
      name: "Artoria Pendragon",
      className: "saber",
      type: "normal",
      gender: "female",
      attribute: "earth",
      traits: [{ name: "dragon" }, { name: "king" }],
      extraAssets: {
        faces: {
          ascension: {
            1: "https://static.wikia.nocookie.net/fategrandorder/images/6/66/S001_Stage1.webp"
          }
        }
      }
    },
    {
      id: 1002,
      collectionNo: 2,
      name: "Mash Kyrielight",
      className: "shielder",
      type: "normal",
      gender: "female",
      attribute: "earth",
      traits: [{ name: "humanoid" }],
      extraAssets: {
        faces: {
          ascension: {
            1: "https://static.wikia.nocookie.net/fategrandorder/images/1/16/S001_Stage1Mash.webp"
          }
        }
      }
    },
    {
      id: 1003,
      collectionNo: 3,
      name: "Gilgamesh",
      className: "archer",
      type: "normal",
      gender: "male",
      attribute: "sky",
      traits: [{ name: "king" }, { name: "humanoid" }],
      extraAssets: {
        faces: {
          ascension: {
            1: "https://static.wikia.nocookie.net/fategrandorder/images/9/90/S012_Stage1.webp"
          }
        }
      }
    },
    {
      id: 1004,
      collectionNo: 4,
      name: "Heracles",
      className: "berserker",
      type: "normal",
      gender: "male",
      attribute: "earth",
      traits: [{ name: "greekMythologyMales" }, { name: "humanoid" }],
      extraAssets: {
        faces: {
          ascension: {
            1: "https://static.wikia.nocookie.net/fategrandorder/images/6/6e/S047_Stage1.webp"
          }
        }
      }
    },
    {
      id: 1005,
      collectionNo: 5,
      name: "Cu Chulainn",
      className: "lancer",
      type: "normal",
      gender: "male",
      attribute: "sky",
      traits: [{ name: "humanoid" }],
      extraAssets: {
        faces: {
          ascension: {
            1: "https://static.wikia.nocookie.net/fategrandorder/images/c/c0/S007_Stage1.webp"
          }
        }
      }
    },
    {
      id: 1006,
      collectionNo: 6,
      name: "Jeanne d'Arc",
      className: "ruler",
      type: "normal",
      gender: "female",
      attribute: "star",
      traits: [{ name: "humanoid" }],
      extraAssets: {
        faces: {
          ascension: {
            1: "https://static.wikia.nocookie.net/fategrandorder/images/4/41/S059_Stage1.webp"
          }
        }
      }
    },
    {
      id: 1007,
      collectionNo: 7,
      name: "EMIYA",
      className: "archer",
      type: "normal",
      gender: "male",
      attribute: "human",
      traits: [{ name: "humanoid" }],
      extraAssets: {
        faces: {
          ascension: {
            1: "https://static.wikia.nocookie.net/fategrandorder/images/e/eb/S011_Stage1.webp"
          }
        }
      }
    }
  ],
  ces: [
    {
      id: 2001,
      name: "Chaldea Lunchtime",
      detail: "Increase Bond gained by all allies except yourself by 10%.",
      extraAssets: { faces: { equip: { 2001: "https://static.wikia.nocookie.net/fategrandorder/images/7/7e/CE_583.png" } } }
    },
    {
      id: 2002,
      name: "Chaldea Teatime",
      detail: "Increase Bond gained by all allies except yourself by 15%.",
      extraAssets: { faces: { equip: { 2002: "https://static.wikia.nocookie.net/fategrandorder/images/5/50/CE_941.png" } } }
    },
    {
      id: 2003,
      name: "Heroic Spirit Portrait: Artoria",
      detail: "Increase Bond gained by Artoria Pendragon by 50%.",
      extraAssets: { faces: { equip: { 2003: "https://static.wikia.nocookie.net/fategrandorder/images/8/82/CE_1183.png" } } }
    },
    {
      id: 2004,
      name: "Field Guide to Sabers",
      detail: "Increase Bond gained by Saber-class Servants by 20%.",
      extraAssets: { faces: { equip: { 2004: "https://static.wikia.nocookie.net/fategrandorder/images/1/17/CE_048.png" } } }
    },
    {
      id: 2005,
      name: "Frontline Bond Notes",
      detail: "Increase Bond gained by all frontline allies by 5%.",
      extraAssets: { faces: { equip: { 2005: "https://static.wikia.nocookie.net/fategrandorder/images/4/49/CE_138.png" } } }
    },
    {
      id: 2006,
      name: "Male Bond Seminar",
      detail: "Increase Bond gained by male allies by 12%.",
      extraAssets: { faces: { equip: { 2006: "https://static.wikia.nocookie.net/fategrandorder/images/f/f5/CE_227.png" } } }
    },
    {
      id: 2007,
      name: "King's Attendance",
      detail: "Increase Bond gained by king allies by 18%.",
      extraAssets: { faces: { equip: { 2007: "https://static.wikia.nocookie.net/fategrandorder/images/b/bb/CE_667.png" } } }
    },
    {
      id: 2008,
      name: "Bella Lisa",
      detail: "Increase QP gained during quest clear by 15%.",
      extraAssets: { faces: { equip: { 2008: "https://static.wikia.nocookie.net/fategrandorder/images/7/71/CE_717.png" } } }
    }
  ]
};

const state = {
  servants: [],
  ces: [],
  selectedServants: Array(SLOT_COUNT).fill(null),
  selectedCEs: Array(SLOT_COUNT).fill(null),
  activeServantSlot: null,
  activeCESlot: null,
  servantSearch: "",
  ceSearch: "",
  servantOptimizationEnabled: false,
  recommendationIds: [],
  dataMode: "remote"
};

const dom = {};
const classIconCache = new Map();

const CLASS_COLORS = {
  saber: "#3cb179",
  archer: "#e0a800",
  lancer: "#0dcaf0",
  rider: "#6f42c1",
  caster: "#0d6efd",
  assassin: "#6c757d",
  berserker: "#dc3545",
  shielder: "#20c997",
  ruler: "#f8f9fa",
  avenger: "#6610f2",
  mooncancer: "#fd7e14",
  alterego: "#d63384",
  foreigner: "#198754",
  pretender: "#adb5bd",
  beast: "#b02a37"
};

window.addEventListener("DOMContentLoaded", init);

async function init() {
  cacheDom();
  bindEvents();
  renderAll();
  await loadAtlasData();
  renderAll();
}

function cacheDom() {
  dom.loadingStatus = document.getElementById("loading-status");
  dom.servantSlots = document.getElementById("servant-slots");
  dom.ceSlots = document.getElementById("ce-slots");
  dom.servantSidebar = document.getElementById("servant-sidebar");
  dom.ceSidebar = document.getElementById("ce-sidebar");
  dom.servantSlotLabel = document.getElementById("servant-sidebar-slot-label");
  dom.ceSlotLabel = document.getElementById("ce-sidebar-slot-label");
  dom.servantSearch = document.getElementById("servant-search");
  dom.ceSearch = document.getElementById("ce-search");
  dom.servantResults = document.getElementById("servant-results");
  dom.ceResults = document.getElementById("ce-results");
  dom.servantFilterSummary = document.getElementById("servant-filter-summary");
  dom.ceFilterSummary = document.getElementById("ce-filter-summary");
  dom.recommendationArea = document.getElementById("recommendation-area");
  dom.optimizeCEsButton = document.getElementById("optimize-ces-btn");
  dom.optimizeServantsButton = document.getElementById("optimize-servants-btn");
  dom.clearAllButton = document.getElementById("clear-all-btn");
}

function bindEvents() {
  dom.servantSearch.addEventListener("input", (event) => {
    state.servantSearch = event.target.value.trim();
    renderServantSidebar();
  });

  dom.ceSearch.addEventListener("input", (event) => {
    state.ceSearch = event.target.value.trim();
    renderCESidebar();
  });

  dom.optimizeCEsButton.addEventListener("click", () => {
    state.recommendationIds = buildCERecommendations().map((ce) => ce.id);
    renderRecommendations();
  });

  dom.optimizeServantsButton.addEventListener("click", () => {
    state.servantOptimizationEnabled = true;
    if (state.activeServantSlot === null) {
      state.activeServantSlot = firstOpenSlot(state.selectedServants);
      state.activeCESlot = null;
    }
    renderAll();
  });

  dom.clearAllButton.addEventListener("click", () => {
    state.selectedServants = Array(SLOT_COUNT).fill(null);
    state.selectedCEs = Array(SLOT_COUNT).fill(null);
    state.activeServantSlot = null;
    state.activeCESlot = null;
    state.recommendationIds = [];
    state.servantOptimizationEnabled = false;
    state.servantSearch = "";
    state.ceSearch = "";
    dom.servantSearch.value = "";
    dom.ceSearch.value = "";
    renderAll();
  });
}

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
    setStatus(`Loaded ${state.servants.length.toLocaleString()} servants and ${state.ces.length.toLocaleString()} bond-related CEs from Atlas Academy.`, "success");
  } catch (error) {
    state.servants = normalizeServants(FALLBACK_DATA.servants);
    state.ces = normalizeCEs(FALLBACK_DATA.ces);
    state.dataMode = "fallback";
    setStatus("Atlas Academy data could not be reached in this environment, so a small embedded fallback dataset is being used for local verification. The page still fetches the live API during normal use.", "warning");
  }
}

function setStatus(message, tone = "secondary") {
  dom.loadingStatus.className = `alert alert-${tone} py-2 small`;
  dom.loadingStatus.textContent = message;
}

function normalizeServants(servants) {
  return (Array.isArray(servants) ? servants : [])
    .filter((servant) => servant && servant.name && servant.type !== "enemy" && servant.collectionNo !== 0)
    .map((servant) => ({
      id: servant.id,
      name: servant.name,
      normalizedName: normalizeText(servant.name),
      className: servant.className || "unknown",
      image: extractPrimaryImage(servant, "servant"),
      classIcon: createClassIcon(servant.className || "unknown"),
      gender: normalizeText(servant.gender || "unknown"),
      attribute: normalizeText(servant.attribute || "unknown"),
      traits: Array.isArray(servant.traits) ? servant.traits.map((trait) => humanizeTrait(trait?.name || "")) : [],
      raw: servant
    }))
    .sort((left, right) => left.name.localeCompare(right.name));
}

function normalizeCEs(craftEssences) {
  return (Array.isArray(craftEssences) ? craftEssences : [])
    .filter((ce) => ce && ce.name && ce.detail)
    .map((ce) => {
      const detail = ce.detail || ce.profile?.comments?.[0] || "";
      const percent = extractBondPercent(detail);
      return {
        id: ce.id,
        name: ce.name,
        normalizedName: normalizeText(ce.name),
        detail,
        normalizedDetail: normalizeText(detail),
        percent,
        image: extractPrimaryImage(ce, "ce"),
        raw: ce
      };
    })
    .filter((ce) => isBondBoostCE(ce.detail) && ce.percent > 0)
    .sort((left, right) => right.percent - left.percent || left.name.localeCompare(right.name));
}

function renderAll() {
  renderServantSlots();
  renderCESlots();
  renderServantSidebar();
  renderCESidebar();
  renderRecommendations();
}

function renderServantSlots() {
  dom.servantSlots.innerHTML = state.selectedServants
    .map((servant, index) => {
      const totalBonus = getServantBondBonus(index);
      const activeClass = state.activeServantSlot === index ? "active-slot" : "";
      return `
        <div class="selection-slot ${activeClass}" data-slot-type="servant" data-slot-index="${index}">
          ${servant ? `<button class="remove-entry" type="button" data-remove-type="servant" data-remove-index="${index}" aria-label="Clear servant">×</button>` : ""}
          <button class="slot-button" type="button" data-slot-type="servant" data-slot-index="${index}">
            ${servant ? servantSlotMarkup(servant, index, totalBonus) : emptySlotMarkup("Servant", index)}
          </button>
        </div>
      `;
    })
    .join("");

  bindSlotEvents(dom.servantSlots, "servant");
}

function renderCESlots() {
  dom.ceSlots.innerHTML = state.selectedCEs
    .map((ce, index) => {
      const activeClass = state.activeCESlot === index ? "active-slot" : "";
      return `
        <div class="selection-slot ${activeClass}" data-slot-type="ce" data-slot-index="${index}">
          ${ce ? `<button class="remove-entry" type="button" data-remove-type="ce" data-remove-index="${index}" aria-label="Clear craft essence">×</button>` : ""}
          <button class="slot-button" type="button" data-slot-type="ce" data-slot-index="${index}">
            ${ce ? ceSlotMarkup(ce, index) : emptySlotMarkup("Craft Essence", index)}
          </button>
        </div>
      `;
    })
    .join("");

  bindSlotEvents(dom.ceSlots, "ce");
}

function bindSlotEvents(container) {
  container.querySelectorAll("[data-slot-type]").forEach((button) => {
    button.addEventListener("click", (event) => {
      const type = event.currentTarget.dataset.slotType;
      const index = Number(event.currentTarget.dataset.slotIndex);
      if (type === "servant") {
        state.activeServantSlot = index;
        state.activeCESlot = null;
      } else {
        state.activeCESlot = index;
        state.activeServantSlot = null;
      }
      renderAll();
    });
  });

  container.querySelectorAll(".remove-entry").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      const type = event.currentTarget.dataset.removeType;
      const index = Number(event.currentTarget.dataset.removeIndex);
      if (type === "servant") {
        state.selectedServants[index] = null;
      } else {
        state.selectedCEs[index] = null;
      }
      renderAll();
    });
  });
}

function renderServantSidebar() {
  const visible = state.activeServantSlot !== null;
  dom.servantSidebar.classList.toggle("d-none", !visible);

  if (!visible) {
    return;
  }

  const slotIndex = state.activeServantSlot;
  dom.servantSlotLabel.textContent = `Slot ${slotIndex + 1}`;
  const visibleServants = getVisibleServantsForSidebar(slotIndex);
  dom.servantFilterSummary.textContent = state.servantOptimizationEnabled
    ? `Showing ${visibleServants.length} servants affected by all selected Craft Essences.`
    : `Showing ${visibleServants.length} servants matching the current search.`;

  dom.servantResults.innerHTML = visibleServants.length
    ? visibleServants.map((servant) => servantCardMarkup(servant)).join("")
    : `<div class="empty-state">No servants match the current search and CE filters.</div>`;

  dom.servantResults.querySelectorAll("[data-add-servant]").forEach((button) => {
    button.addEventListener("click", () => {
      const servantId = Number(button.dataset.addServant);
      const servant = state.servants.find((entry) => entry.id === servantId);
      if (!servant) {
        return;
      }
      const targetIndex = state.activeServantSlot ?? firstOpenSlot(state.selectedServants);
      state.selectedServants[targetIndex] = servant;
      state.servantOptimizationEnabled = false;
      renderAll();
    });
  });
}

function renderCESidebar() {
  const visible = state.activeCESlot !== null;
  dom.ceSidebar.classList.toggle("d-none", !visible);

  if (!visible) {
    return;
  }

  const slotIndex = state.activeCESlot;
  dom.ceSlotLabel.textContent = `CE Slot ${slotIndex + 1}`;
  const search = normalizeText(state.ceSearch);
  const visibleCEs = state.ces.filter((ce) => !search || ce.normalizedName.includes(search));
  dom.ceFilterSummary.textContent = `Showing ${visibleCEs.length} bond-related Craft Essences.`;

  dom.ceResults.innerHTML = visibleCEs.length
    ? visibleCEs.map((ce) => ceCardMarkup(ce)).join("")
    : `<div class="empty-state">No bond-related Craft Essences match the current search.</div>`;

  dom.ceResults.querySelectorAll("[data-add-ce]").forEach((button) => {
    button.addEventListener("click", () => {
      const ceId = Number(button.dataset.addCe);
      const ce = state.ces.find((entry) => entry.id === ceId);
      if (!ce) {
        return;
      }
      const targetIndex = state.activeCESlot ?? firstOpenSlot(state.selectedCEs);
      state.selectedCEs[targetIndex] = ce;
      renderAll();
    });
  });
}

function renderRecommendations() {
  const recommendations = state.recommendationIds.length
    ? state.recommendationIds
        .map((id) => state.ces.find((ce) => ce.id === id))
        .filter(Boolean)
    : [];

  if (!recommendations.length) {
    dom.recommendationArea.innerHTML = `<div class="empty-state">Click <strong>Optimize CEs</strong> to rank bond-focused Craft Essences for the servants currently in the lineup.</div>`;
    return;
  }

  dom.recommendationArea.innerHTML = recommendations
    .map((ce) => recommendationMarkup(ce))
    .join("");

  dom.recommendationArea.querySelectorAll("[data-recommendation-id]").forEach((card) => {
    const ceId = Number(card.dataset.recommendationId);
    const ce = state.ces.find((entry) => entry.id === ceId);
    if (!ce) {
      return;
    }
    card.addEventListener("mouseenter", () => highlightAffectedServants(ce));
    card.addEventListener("mouseleave", clearHighlightedServants);
  });

  dom.recommendationArea.querySelectorAll("[data-add-recommended-ce]").forEach((button) => {
    button.addEventListener("click", () => {
      const ceId = Number(button.dataset.addRecommendedCe);
      const ce = state.ces.find((entry) => entry.id === ceId);
      if (!ce) {
        return;
      }
      const targetIndex = state.activeCESlot ?? firstOpenSlot(state.selectedCEs);
      state.selectedCEs[targetIndex] = ce;
      renderAll();
    });
  });
}

function getVisibleServantsForSidebar(slotIndex) {
  const search = normalizeText(state.servantSearch);
  return state.servants.filter((servant) => {
    const matchesSearch = !search || servant.normalizedName.includes(search);
    if (!matchesSearch) {
      return false;
    }

    if (!state.servantOptimizationEnabled) {
      return true;
    }

    const selectedCEs = state.selectedCEs.filter(Boolean);
    if (!selectedCEs.length) {
      return true;
    }

    return selectedCEs.every((ce, ceIndex) => doesCEAffectServant(ce, servant, ceIndex, slotIndex));
  });
}

function buildCERecommendations() {
  const selectedServants = state.selectedServants
    .map((servant, slotIndex) => ({ servant, slotIndex }))
    .filter((entry) => entry.servant);

  return state.ces
    .map((ce) => ({
      ...ce,
      totalBonus: selectedServants.reduce((sum, entry) => {
        if (!doesCEAffectServant(ce, entry.servant, -1, entry.slotIndex, true)) {
          return sum;
        }
        return sum + ce.percent;
      }, 0) - (isExceptSelfCE(ce.detail) && selectedServants.length ? ce.percent : 0),
      affectedServants: selectedServants.filter((entry) => doesCEAffectServant(ce, entry.servant, -1, entry.slotIndex, true))
    }))
    .sort((left, right) => right.totalBonus - left.totalBonus || right.percent - left.percent || left.name.localeCompare(right.name))
    .slice(0, SLOT_COUNT);
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
    return sum + ce.percent;
  }, 0);
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

  if (description.includes(`${servant.className} class`) || description.includes(`${servant.className}-class`) || description.includes(`${servant.className} allies`) || description.includes(`${servant.className} servants`)) {
    return true;
  }

  if (servant.gender !== "unknown" && (description.includes(`${servant.gender} allies`) || description.includes(`${servant.gender} servants`) || description.includes(`${servant.gender} party`))) {
    return true;
  }

  if (servant.attribute !== "unknown" && (description.includes(`${servant.attribute} allies`) || description.includes(`${servant.attribute} servants`) || description.includes(`${servant.attribute} attribute`))) {
    return true;
  }

  return servant.traits.some((trait) => trait && description.includes(trait));
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

function isBondBoostCE(detail) {
  const normalized = normalizeText(detail || "");
  return normalized.includes("bond") && /(increase|boost|gain|gained|up)/.test(normalized);
}

function extractBondPercent(detail) {
  const matches = [...String(detail || "").matchAll(/(\d+)\s*%/g)].map((match) => Number(match[1]));
  return matches.length ? Math.max(...matches) : 0;
}

function highlightAffectedServants(ce) {
  clearHighlightedServants();
  state.selectedServants.forEach((servant, servantSlotIndex) => {
    if (!servant) {
      return;
    }
    if (doesCEAffectServant(ce, servant, -1, servantSlotIndex, true)) {
      const slot = dom.servantSlots.querySelector(`.selection-slot[data-slot-index="${servantSlotIndex}"]`);
      slot?.classList.add("highlighted-slot");
    }
  });
}

function clearHighlightedServants() {
  dom.servantSlots.querySelectorAll(".highlighted-slot").forEach((slot) => slot.classList.remove("highlighted-slot"));
}

function servantSlotMarkup(servant, index, totalBonus) {
  return `
    <div class="slot-filled">
      <img class="slot-image" src="${servant.image}" alt="${escapeHtml(servant.name)}" />
      <div class="slot-content">
        <div class="slot-label">Servant ${index + 1}</div>
        <div class="slot-name">${escapeHtml(servant.name)}</div>
        <div class="slot-meta class-row">
          <img class="class-icon" src="${servant.classIcon}" alt="${escapeHtml(servant.className)} icon" />
          <span>${escapeHtml(toTitleCase(servant.className))}</span>
        </div>
        <div class="selection-total">Total bond bonus: ${totalBonus}%</div>
      </div>
    </div>
  `;
}

function ceSlotMarkup(ce, index) {
  return `
    <div class="slot-filled">
      <img class="slot-image" src="${ce.image}" alt="${escapeHtml(ce.name)}" />
      <div class="slot-content">
        <div class="slot-label">Craft Essence ${index + 1}</div>
        <div class="slot-name">${escapeHtml(ce.name)}</div>
        <div class="percent-note">Bond bonus: ${ce.percent}%</div>
      </div>
    </div>
  `;
}

function emptySlotMarkup(kind, index) {
  return `
    <div class="slot-empty">
      <div class="slot-label">${kind} ${index + 1}</div>
      <div class="fs-4">+</div>
      <div>Click to choose a ${kind.toLowerCase()}.</div>
    </div>
  `;
}

function servantCardMarkup(servant) {
  return `
    <article class="sidebar-card">
      <div class="sidebar-card-body">
        <div class="sidebar-card-header">
          <img class="sidebar-thumb" src="${servant.image}" alt="${escapeHtml(servant.name)}" />
          <div>
            <div class="fw-semibold mb-1">${escapeHtml(servant.name)}</div>
            <div class="class-row mb-3">
              <img class="class-icon" src="${servant.classIcon}" alt="${escapeHtml(servant.className)} icon" />
              <span class="small text-secondary">${escapeHtml(toTitleCase(servant.className))}</span>
            </div>
            <button class="btn btn-sm btn-primary" type="button" data-add-servant="${servant.id}">Add</button>
          </div>
        </div>
      </div>
    </article>
  `;
}

function ceCardMarkup(ce) {
  return `
    <article class="sidebar-card" title="${escapeHtml(ce.detail)}">
      <div class="sidebar-card-body">
        <div class="sidebar-card-header">
          <img class="sidebar-thumb" src="${ce.image}" alt="${escapeHtml(ce.name)}" />
          <div>
            <div class="fw-semibold mb-1">${escapeHtml(ce.name)}</div>
            <div class="detail-clamp mb-2">${escapeHtml(ce.detail)}</div>
            <div class="recommendation-badges mb-3">
              <span class="badge rounded-pill badge-soft">${ce.percent}% bond</span>
            </div>
            <button class="btn btn-sm btn-warning" type="button" data-add-ce="${ce.id}">Add</button>
          </div>
        </div>
      </div>
    </article>
  `;
}

function recommendationMarkup(ce) {
  const affectedServants = state.selectedServants.filter((servant, slotIndex) => doesCEAffectServant(ce, servant, -1, slotIndex, true));
  return `
    <article class="recommendation-card" data-recommendation-id="${ce.id}" title="${escapeHtml(ce.detail)}">
      <div class="recommendation-card-body">
        <div class="recommendation-card-header mb-3">
          <img class="recommendation-thumb" src="${ce.image}" alt="${escapeHtml(ce.name)}" />
          <div>
            <div class="fw-semibold mb-2">${escapeHtml(ce.name)}</div>
            <div class="recommendation-badges mb-2">
              <span class="badge rounded-pill badge-soft">${ce.percent}% each</span>
              <span class="badge rounded-pill text-bg-primary">${Math.max(ce.totalBonus || 0, 0)}% total</span>
            </div>
            <div class="small text-secondary">Affects ${affectedServants.length} selected servant${affectedServants.length === 1 ? "" : "s"}.</div>
          </div>
        </div>
        <div class="detail-clamp mb-3">${escapeHtml(ce.detail)}</div>
        <button class="btn btn-sm btn-outline-light" type="button" data-add-recommended-ce="${ce.id}">Add</button>
      </div>
    </article>
  `;
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
  return `https://placehold.co/400x400/10141c/e9ecef?text=${label}`;
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

function classAbbreviation(className) {
  return className
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function humanizeTrait(traitName) {
  return normalizeText(
    String(traitName || "")
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/[_-]/g, " ")
      .replace(/\b(class|attribute|alignment)\b/gi, "")
  );
}

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
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

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
