function getHypotheticalCEBonusForServant(ce, servant, servantSlotIndex) { if (!ce || !servant) return 0; if (state.selectedServantBond15[servantSlotIndex]) return 0; if (!doesCEAffectServant(ce, servant, -1, servantSlotIndex, true)) return 0; return Number(ce.percent) || 0; }

function buildCERecommendations() {
  const selectedServants = state.selectedServants.map((servant, slotIndex) => ({ servant, slotIndex })).filter((entry) => entry.servant && !state.selectedServantBond15[entry.slotIndex]);
  return state.ces.map((ce) => {
    const affectedServants = selectedServants.map((entry) => ({ ...entry, bonus: getHypotheticalCEBonusForServant(ce, entry.servant, entry.slotIndex) })).filter((entry) => entry.bonus > 0);
    const totalBonus = affectedServants.reduce((sum, entry) => sum + entry.bonus, 0);
    return { ...ce, totalBonus, affectedServants };
  }).filter((ce) => ce.totalBonus > 0).sort((left, right) => right.totalBonus - left.totalBonus || right.percent - left.percent || left.name.localeCompare(right.name)).slice(0, SLOT_COUNT);
}

function handleOptimizeCEs() { state.recommendations = buildCERecommendations(); renderRecommendations(); }

function handleAddAllRecommendedCEs() {
  if (!state.recommendations.length) return;
  for (let index = 0; index < SLOT_COUNT; index += 1) { state.selectedCEs[index] = state.recommendations[index] || null; state.selectedCEOwned[index] = false; }
  state.activeCESlot = null;
  renderAll();
}
