window.addEventListener("DOMContentLoaded", init);

async function init() {
  cacheDom();
  bindEvents();
  initServantTooltip();
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

  dom.optimizeCEsButton.addEventListener("click", handleOptimizeCEs);
  dom.optimizeServantsButton.addEventListener("click", handleOptimizeServants);
  dom.clearAllButton.addEventListener("click", handleClearAll);
}
