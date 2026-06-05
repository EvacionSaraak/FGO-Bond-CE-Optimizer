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

    const selectedCEs = state.selectedCEs
      .map((ce, ceSlotIndex) => (ce ? { ce, ceSlotIndex } : null))
      .filter(Boolean);
    if (!selectedCEs.length) {
      return true;
    }

    return selectedCEs.every(({ ce, ceSlotIndex }) =>
      doesCEAffectServant(ce, servant, ceSlotIndex, slotIndex)
    );
  });
}

function handleOptimizeServants() {
  state.servantOptimizationEnabled = true;
  state.servantSidebarPage = 1;
  if (state.activeServantSlot === null) {
    state.activeServantSlot = firstOpenSlot(state.selectedServants);
    state.activeCESlot = null;
  }
  renderAll();
}
