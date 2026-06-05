function handleClearAll() {
  state.selectedServants = Array(SLOT_COUNT).fill(null);
  state.selectedServantBond15 = Array(SLOT_COUNT).fill(false);
  state.selectedCEs = Array(SLOT_COUNT).fill(null);
  state.selectedCEOwned = Array(SLOT_COUNT).fill(false);
  state.activeServantSlot = null;
  state.activeCESlot = null;
  state.recommendations = [];
  state.servantOptimizationEnabled = false;
  state.servantSearch = "";
  state.ceSearch = "";
  dom.servantSearch.value = "";
  dom.ceSearch.value = "";
  renderAll();
}
