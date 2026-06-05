const SERVANT_API_URL = "https://api.atlasacademy.io/export/JP/nice_servant_lang_en.json";
const CE_API_URL = "https://api.atlasacademy.io/export/JP/nice_equip_lang_en.json";
const SLOT_COUNT = 6;
const CLASS_ICON_SIZE = 64;

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

const state = {
  servants: [],
  ces: [],
  selectedServants: Array(SLOT_COUNT).fill(null),
  selectedServantBond15: Array(SLOT_COUNT).fill(false),
  selectedCEs: Array(SLOT_COUNT).fill(null),
  selectedCEOwned: Array(SLOT_COUNT).fill(false),
  activeServantSlot: null,
  activeCESlot: null,
  servantSearch: "",
  ceSearch: "",
  servantOptimizationEnabled: false,
  recommendations: [],
  dataMode: "remote"
};

const dom = {};
const classIconCache = new Map();
