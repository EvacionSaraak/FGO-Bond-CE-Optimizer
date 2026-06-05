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
          ${servant ? `<label class="form-check-label small mt-2 d-inline-flex align-items-center"><input class="form-check-input me-1" type="checkbox" data-servant-bond15-toggle="${index}" ${state.selectedServantBond15[index] ? "checked" : ""}>Max bond reached (Bond 15, +25% to other party members)</label>` : ""}
        </div>
      `;
    })
    .join("");

  bindSlotEvents(dom.servantSlots, "servant");
  dom.servantSlots.querySelectorAll("[data-servant-bond15-toggle]").forEach((checkbox) => {
    checkbox.addEventListener("click", (event) => event.stopPropagation());
    checkbox.addEventListener("change", (event) => {
      const slotIndex = Number(event.currentTarget.dataset.servantBond15Toggle);
      state.selectedServantBond15[slotIndex] = Boolean(event.currentTarget.checked);
      renderAll();
    });
  });
}

function renderCESlots() {
  dom.ceSlots.innerHTML = state.selectedCEs
    .map((ce, index) => {
      const activeClass = state.activeCESlot === index ? "active-slot" : "";
      return `
        <div class="selection-slot ${activeClass}" data-slot-type="ce" data-slot-index="${index}">
          ${ce ? `<button class="remove-entry" type="button" data-remove-type="ce" data-remove-index="${index}" aria-label="Clear craft essence">×</button>` : ""}
          <button class="slot-button" type="button" data-slot-type="ce" data-slot-index="${index}">
            ${ce ? ceSlotMarkup(ce, index, state.selectedCEOwned[index]) : emptySlotMarkup("Craft Essence", index)}
          </button>
          ${ce?.supportConditional ? `<label class="form-check-label small mt-2 d-inline-flex align-items-center"><input class="form-check-input me-1" type="checkbox" data-ce-owned-toggle="${index}" ${state.selectedCEOwned[index] ? "checked" : ""}>Own copy</label>` : ""}
        </div>
      `;
    })
    .join("");

  bindSlotEvents(dom.ceSlots, "ce");
  dom.ceSlots.querySelectorAll("[data-ce-owned-toggle]").forEach((checkbox) => {
    checkbox.addEventListener("click", (event) => event.stopPropagation());
    checkbox.addEventListener("change", (event) => {
      const slotIndex = Number(event.currentTarget.dataset.ceOwnedToggle);
      state.selectedCEOwned[slotIndex] = Boolean(event.currentTarget.checked);
      renderAll();
    });
  });
}

function bindSlotEvents(container) {
  container.querySelectorAll("[data-slot-type]").forEach((button) => {
    button.addEventListener("click", (event) => {
      const type = event.currentTarget.dataset.slotType;
      const index = Number(event.currentTarget.dataset.slotIndex);
      if (type === "servant") {
        state.activeServantSlot = index;
      } else {
        state.activeCESlot = index;
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
        state.selectedServantBond15[index] = false;
      } else {
        state.selectedCEs[index] = null;
        state.selectedCEOwned[index] = false;
      }
      renderAll();
    });
  });
}

function renderServantSidebar() {
  dom.servantSidebar.classList.remove("d-none");
  const isLoading = state.servantSidebarLoading;
  dom.servantSidebar.classList.toggle("sidebar-loading", isLoading);
  dom.servantSearch.disabled = isLoading;
  dom.servantPageSize.disabled = isLoading;
  dom.servantSearch.setAttribute("aria-busy", String(isLoading));
  dom.servantResults.classList.toggle("sidebar-loading-results", isLoading);

  const slotIndex = state.activeServantSlot;
  dom.servantSlotLabel.textContent = slotIndex !== null ? `Slot ${slotIndex + 1}` : "Any Slot";
  const visibleServants = isLoading ? [] : getVisibleServantsForSidebar(slotIndex ?? -1);
  const totalServants = visibleServants.length;
  const pageSize = Math.max(1, Number(state.servantSidebarPageSize) || SIDEBAR_PAGE_SIZE_OPTIONS[0]);
  const totalPages = Math.max(1, Math.ceil(totalServants / pageSize));
  const currentPage = Math.min(Math.max(1, state.servantSidebarPage), totalPages);
  state.servantSidebarPage = currentPage;
  const pageStart = totalServants ? (currentPage - 1) * pageSize : 0;
  const pageEnd = pageStart + pageSize;
  const pagedServants = visibleServants.slice(pageStart, pageEnd);
  dom.servantPageSize.value = String(pageSize);
  dom.servantPageLabel.textContent = `Page ${currentPage} of ${totalPages}`;
  dom.servantPagePrev.disabled = isLoading || currentPage <= 1;
  dom.servantPageNext.disabled = isLoading || currentPage >= totalPages;
  dom.servantFilterSummary.textContent = state.servantOptimizationEnabled
    ? `Showing ${pagedServants.length} of ${totalServants} servants affected by all selected Craft Essences.`
    : `Showing ${pagedServants.length} of ${totalServants} servants matching the current search.`;

  if (isLoading) {
    dom.servantFilterSummary.textContent = "Loading servants...";
    dom.servantResults.innerHTML = sidebarLoadingMarkup("Loading servants", state.servantSidebarLoadingProgress);
    dom.servantPageLabel.textContent = "Page 1 of 1";
    dom.servantPagePrev.disabled = true;
    dom.servantPageNext.disabled = true;
    return;
  }

  const targetIndex = getTargetServantSlotIndex();
  dom.servantResults.innerHTML = pagedServants.length
    ? pagedServants
        .map((servant) => servantCardMarkup(servant, !canAddServantToSelection(servant.id, targetIndex)))
        .join("")
    : `<div class="empty-state">No servants match the current search and CE filters.</div>`;

  dom.servantResults.querySelectorAll("[data-add-servant]").forEach((button) => {
    button.addEventListener("click", () => {
      const servantId = Number(button.dataset.addServant);
      const servant = state.servants.find((entry) => entry.id === servantId);
      if (!servant) {
        return;
      }
      const targetIndex = getTargetServantSlotIndex();
      if (!canAddServantToSelection(servantId, targetIndex)) {
        return;
      }
      const previousServantId = state.selectedServants[targetIndex]?.id;
      state.selectedServants[targetIndex] = servant;
      if (previousServantId !== servantId) {
        state.selectedServantBond15[targetIndex] = false;
      }
      state.servantOptimizationEnabled = false;
      renderAll();
    });
  });
}

function renderCESidebar() {
  dom.ceSidebar.classList.remove("d-none");
  const isLoading = state.ceSidebarLoading;
  dom.ceSidebar.classList.toggle("sidebar-loading", isLoading);
  dom.ceSearch.disabled = isLoading;
  dom.ceSearch.setAttribute("aria-busy", String(isLoading));
  dom.ceResults.classList.toggle("sidebar-loading-results", isLoading);

  const slotIndex = state.activeCESlot;
  dom.ceSlotLabel.textContent = slotIndex !== null ? `CE Slot ${slotIndex + 1}` : "Any Slot";
  if (isLoading) {
    dom.ceFilterSummary.textContent = "Loading Craft Essences...";
    dom.ceResults.innerHTML = sidebarLoadingMarkup("Loading Craft Essences", state.ceSidebarLoadingProgress);
    return;
  }

  if (!state.ces.length) {
    dom.ceFilterSummary.textContent = "No Craft Essences available.";
    dom.ceResults.innerHTML = `<div class="empty-state">No Craft Essences are currently available from Atlas Academy.</div>`;
    return;
  }

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
      state.selectedCEOwned[targetIndex] = false;
      renderAll();
    });
  });
}

function sidebarLoadingMarkup(label, progress) {
  const clampedProgress = Math.max(0, Math.min(100, Math.round(Number(progress) || 0)));
  return `
    <div class="empty-state sidebar-loading-indicator" role="status" aria-live="polite">
      <span class="sidebar-loading-ring" style="--loading-progress:${clampedProgress}" aria-hidden="true">
        <span class="sidebar-loading-ring-core">${clampedProgress}%</span>
      </span>
      <span>${label}...</span>
    </div>
  `;
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
      state.selectedCEOwned[targetIndex] = false;
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
