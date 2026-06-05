function handleClearAll() {
  state.selectedServants = Array(SLOT_COUNT).fill(null);
  state.selectedServantBond15 = Array(SLOT_COUNT).fill(false);
  state.selectedCEs = Array(SLOT_COUNT).fill(null);
  state.selectedCEOwned = Array(SLOT_COUNT).fill(false);
  state.activeServantSlot = null;
  state.activeCESlot = null;
  state.recommendations = [];
  state.servantOptimizationEnabled = false;
  state.servantSidebarPage = 1;
  state.servantSidebarPageSize = SIDEBAR_PAGE_SIZE_OPTIONS[0];
  state.servantSearch = "";
  state.ceSearch = "";
  dom.servantSearch.value = "";
  dom.servantPageSize.value = String(SIDEBAR_PAGE_SIZE_OPTIONS[0]);
  dom.ceSearch.value = "";
  renderAll();
}
