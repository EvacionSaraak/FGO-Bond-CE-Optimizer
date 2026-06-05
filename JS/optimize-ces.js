function buildCERecommendations() {
  const selectedServants = state.selectedServants
    .map((servant, slotIndex) => ({ servant, slotIndex }))
    .filter((entry) => entry.servant);

  return state.ces
    .map((ce) => {
      const affectedServants = selectedServants.filter((entry) =>
        doesCEAffectServant(ce, entry.servant, -1, entry.slotIndex, true)
      );
      const baseTotal = affectedServants.length * ce.percent;
      const totalBonus =
        baseTotal - (isExceptSelfCE(ce.detail) && affectedServants.length ? ce.percent : 0);

      return {
        ...ce,
        totalBonus: Math.max(totalBonus, 0),
        affectedServants
      };
    })
    .sort(
      (left, right) =>
        right.totalBonus - left.totalBonus ||
        right.percent - left.percent ||
        left.name.localeCompare(right.name)
    )
    .slice(0, SLOT_COUNT);
}

function handleOptimizeCEs() {
  state.recommendations = buildCERecommendations();
  renderRecommendations();
}
