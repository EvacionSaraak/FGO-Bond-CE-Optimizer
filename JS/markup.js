function servantSlotMarkup(servant, index, totalBonus) { const isMaxBond = Boolean(state.selectedServantBond15[index]); return `
  <div class="slot-filled servant-slot-basic ${isMaxBond ? "slot-max-bond" : ""}" data-servant-id="${servant.id}" title="${escapeHtml(servant.name)} | ${escapeHtml(toTitleCase(servant.className))} | Total bond bonus: ${formatPercent(totalBonus)}%">
    <img class="slot-image servant-basic-image" src="${escapeHtml(servant.image)}" data-fallback-src="${escapeHtml(servant.fallbackImage)}" alt="${escapeHtml(servant.name)}">
    <div class="servant-basic-overlay">
      <button type="button" class="max-bond-toggle ${isMaxBond ? "active" : ""}" data-servant-bond15-toggle="${index}" aria-pressed="${isMaxBond ? "true" : "false"}" title="${isMaxBond ? "Unmark Max Bond" : "Mark Max Bond"}">${isMaxBond ? "MAX" : "BOND"}</button>
    </div>
  </div>
`; }

function ceSlotMarkup(ce, index, isOwned) { const effectivePercent = isOwned && ce.ownPercent > 0 ? ce.ownPercent : ce.percent, basePercent = isOwned && ce.ownBasePercent > 0 ? ce.ownBasePercent : ce.basePercent, tag = getCEEffectTag({ ...ce, basePercent, percent: effectivePercent }); return `
  <div class="slot-filled ce-slot-basic" title="${escapeHtml(ce.name)} | ${escapeHtml(tag)} | ${escapeHtml(ce.detail || "")}">
    <img class="slot-image ce-basic-image" src="${escapeHtml(ce.image)}" data-fallback-src="${escapeHtml(ce.fallbackImage)}" alt="${escapeHtml(ce.name)}">
    <div class="ce-basic-label">${escapeHtml(ce.name)}</div>
  </div>
`; }

function emptySlotMarkup(kind, index) { return `
  <div class="slot-empty" title="Click to choose a ${kind.toLowerCase()}.">
    <div class="slot-label">${kind} ${index + 1}</div>
    <div class="display-6">+</div>
  </div>
`; }

function servantCardMarkup(servant, isAddDisabled = false) { const gender = toTitleCase(servant.gender || "unknown"), attribute = toTitleCase(servant.attribute || "unknown"), alignment = Array.isArray(servant.alignment) && servant.alignment.length ? servant.alignment.map(toTitleCase).join(" / ") : "Unknown"; return `
  <button type="button" class="sidebar-card servant-sidebar-card ${isAddDisabled ? "sidebar-card-disabled" : ""} w-100 text-start p-0" data-add-servant="${servant.id}" data-servant-id="${servant.id}" ${isAddDisabled ? "disabled" : ""}>
    <div class="sidebar-card-body">
      <div class="servant-card-top">
        <img class="sidebar-thumb servant-card-thumb" src="${escapeHtml(servant.image)}" data-fallback-src="${escapeHtml(servant.fallbackImage)}" alt="${escapeHtml(servant.name)}">
        <div class="servant-card-main">
          <div class="fw-semibold servant-card-name">${escapeHtml(servant.name)}</div>
          <div class="class-row small text-muted mt-1"><img class="class-icon" src="${escapeHtml(servant.classIcon)}" alt="">${escapeHtml(toTitleCase(servant.className))}</div>
        </div>
      </div>
      <div class="servant-card-details small mt-2">
        <div><span>Gender</span><strong>${escapeHtml(gender)}</strong></div>
        <div><span>Attribute</span><strong>${escapeHtml(attribute)}</strong></div>
        <div><span>Alignment</span><strong>${escapeHtml(alignment)}</strong></div>
      </div>
      <span class="badge ${isAddDisabled ? "text-bg-secondary" : "text-bg-primary"} mt-2">${isAddDisabled ? "Max 2 / Full" : "Add"}</span>
    </div>
  </button>
`; }

function ceCardMarkup(ce) { return `
  <button type="button" class="sidebar-card w-100 text-start p-0" data-add-ce="${ce.id}" title="${escapeHtml(ce.detail || "")}">
    <div class="sidebar-card-body">
      <div class="sidebar-card-header">
        <img class="sidebar-thumb" src="${escapeHtml(ce.image)}" data-fallback-src="${escapeHtml(ce.fallbackImage)}" alt="${escapeHtml(ce.name)}">
        <div>
          <div class="fw-semibold">${escapeHtml(ce.name)}</div>
          <div class="small text-muted mt-1">${escapeHtml(getCEEffectTag(ce))}</div>
          <div class="recommendation-badges mt-2">
            <span class="badge badge-soft">Base ${formatPercent(ce.basePercent)}%</span>
            <span class="badge text-bg-primary">MLB ${formatPercent(ce.percent)}%</span>
          </div>
        </div>
      </div>
    </div>
  </button>
`; }

function recommendationAffectedServantsMarkup(ce) {
  const affectedServants = ce.affectedServants || [];
  if (!affectedServants.length) return `<div class="small text-muted mt-2">Affects no selected servants.</div>`;
  return `<div class="affected-servant-list small mt-2">${affectedServants.map(({ servant, slotIndex, bonus }) => `
    <div class="affected-servant-row" data-servant-id="${servant.id}">
      <span class="text-muted">Slot ${slotIndex + 1}</span>
      <span>${escapeHtml(servant.name)}</span>
      <span class="fw-semibold">+${formatPercent(bonus)}%</span>
    </div>
  `).join("")}</div>`;
}

function recommendationMarkup(ce, index = 0) { const affectedServants = ce.affectedServants || [], hypotheticalTotal = Number(ce.totalBonus) || 0; return `
  <div class="recommendation-card" data-recommendation-id="${ce.id}" title="${escapeHtml(ce.detail || "")}">
    <div class="recommendation-card-body">
      <div class="recommendation-card-header">
        <img class="recommendation-thumb" src="${escapeHtml(ce.image)}" data-fallback-src="${escapeHtml(ce.fallbackImage)}" alt="${escapeHtml(ce.name)}">
        <div>
          <div class="d-flex flex-wrap align-items-center gap-2">
            <span class="badge text-bg-secondary">#${index + 1}</span>
            <div class="fw-semibold">${escapeHtml(ce.name)}</div>
          </div>
          <div class="small text-muted mt-1">${escapeHtml(getCEEffectTag(ce))}</div>
          <div class="recommendation-badges mt-2">
            <span class="badge badge-soft">${formatPercent(ce.percent)}% each MLB</span>
            <span class="badge text-bg-success">Hypothetical affected total +${formatPercent(hypotheticalTotal)}%</span>
          </div>
          <div class="small text-muted mt-2">Affects ${affectedServants.length} selected servant${affectedServants.length === 1 ? "" : "s"}.</div>
          ${recommendationAffectedServantsMarkup(ce)}
          <button type="button" class="btn btn-sm btn-primary mt-2" data-add-recommended-ce="${ce.id}">Add</button>
        </div>
      </div>
    </div>
  </div>
`; }
