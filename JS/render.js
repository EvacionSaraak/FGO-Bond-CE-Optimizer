function setStatus(message, tone = "secondary") {
  dom.loadingStatus.className = `alert alert-${tone} py-2 small`;
  dom.loadingStatus.textContent = message;
}

function renderAll() {
  renderServantSlots();
  renderCESlots();
  renderServantSidebar();
  renderCESidebar();
  renderRecommendations();
  bindImageFallbacks(document);
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
  dom.ceFilterSummary.textContent = `Showing ${visibleCEs.length} Craft Essences.`;

  dom.ceResults.innerHTML = visibleCEs.length
    ? visibleCEs.map((ce) => ceCardMarkup(ce)).join("")
    : `<div class="empty-state">No Craft Essences match the current search.</div>`;

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
  const recommendations = state.recommendations;

  if (!recommendations.length) {
    dom.recommendationArea.innerHTML = `<div class="empty-state">Click <strong>Optimize CEs</strong> to rank bond-focused Craft Essences for the servants currently in the lineup.</div>`;
    return;
  }

  dom.recommendationArea.innerHTML = recommendations
    .map((ce) => recommendationMarkup(ce))
    .join("");

  dom.recommendationArea.querySelectorAll("[data-recommendation-id]").forEach((card) => {
    const ceId = Number(card.dataset.recommendationId);
    const ce = recommendations.find((entry) => entry.id === ceId);
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
