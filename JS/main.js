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
  dom.servantPageSize = document.getElementById("servant-page-size");
  dom.servantPagePrev = document.getElementById("servant-page-prev");
  dom.servantPageNext = document.getElementById("servant-page-next");
  dom.servantPageLabel = document.getElementById("servant-page-label");
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
    state.servantSidebarPage = 1;
    renderServantSidebar();
  });

  dom.servantPageSize.addEventListener("change", (event) => {
    const parsed = Number(event.target.value);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return;
    }
    state.servantSidebarPageSize = parsed;
    state.servantSidebarPage = 1;
    renderServantSidebar();
  });

  dom.servantPagePrev.addEventListener("click", () => {
    state.servantSidebarPage = Math.max(1, state.servantSidebarPage - 1);
    renderServantSidebar();
  });

  dom.servantPageNext.addEventListener("click", () => {
    state.servantSidebarPage += 1;
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
