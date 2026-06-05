function servantSlotMarkup(servant, index, totalBonus) { const maxBondNote = state.selectedServantBond15[index] ? `<div class="badge text-bg-warning text-dark mt-1">Max bond reached</div>` : ""; return `
  <div class="slot-content">
    <img src="${escapeHtml(servant.image)}" data-fallback-src="${escapeHtml(servant.fallbackImage)}" alt="${escapeHtml(servant.name)}">
    <div>
      <div class="small text-muted">Servant ${index + 1}</div>
      <div class="fw-semibold">${escapeHtml(servant.name)}</div>
      <div class="small">${escapeHtml(toTitleCase(servant.className))}</div>
      ${maxBondNote}
      <div class="small mt-1">Total bond bonus: ${totalBonus}%</div>
    </div>
  </div>
`; }

function ceSlotMarkup(ce, index, isOwned) { const effectivePercent = isOwned && ce.ownPercent > 0 ? ce.ownPercent : ce.percent, basePercent = isOwned && ce.ownBasePercent > 0 ? ce.ownBasePercent : ce.basePercent; return `
  <div class="slot-content">
    <img src="${escapeHtml(ce.image)}" data-fallback-src="${escapeHtml(ce.fallbackImage)}" alt="${escapeHtml(ce.name)}">
    <div>
      <div class="small text-muted">Craft Essence ${index + 1}</div>
      <div class="fw-semibold">${escapeHtml(ce.name)}</div>
      <div class="small">${escapeHtml(getCEEffectTag({ ...ce, basePercent, percent: effectivePercent }))}</div>
    </div>
  </div>
`; }

function emptySlotMarkup(kind, index) { return `
  <div class="empty-slot">
    <div class="small text-muted">${kind} ${index + 1}</div>
    <div class="display-6">+</div>
    <div class="small">Click to choose a ${kind.toLowerCase()}.</div>
  </div>
`; }

function servantCardMarkup(servant, isAddDisabled = false) { return `
  <button type="button" class="result-card" data-add-servant="${servant.id}" ${isAddDisabled ? "disabled" : ""}>
    <img src="${escapeHtml(servant.image)}" data-fallback-src="${escapeHtml(servant.fallbackImage)}" alt="${escapeHtml(servant.name)}">
    <span>
      <span class="fw-semibold d-block">${escapeHtml(servant.name)}</span>
      <span class="small text-muted d-block">${escapeHtml(toTitleCase(servant.className))}</span>
    </span>
    <span class="badge text-bg-primary">${isAddDisabled ? "Max 2" : "Add"}</span>
  </button>
`; }

function ceCardMarkup(ce) { return `
  <button type="button" class="result-card" data-add-ce="${ce.id}">
    <img src="${escapeHtml(ce.image)}" data-fallback-src="${escapeHtml(ce.fallbackImage)}" alt="${escapeHtml(ce.name)}">
    <span>
      <span class="fw-semibold d-block">${escapeHtml(ce.name)}</span>
      <span class="small text-muted d-block">${escapeHtml(getCEEffectTag(ce))}</span>
    </span>
    <span class="badge text-bg-primary">Add</span>
  </button>
`; }

function recommendationMarkup(ce) { const affectedServants = ce.affectedServants || []; return `
  <div class="recommendation-card" data-recommendation-id="${ce.id}">
    <div class="d-flex align-items-start gap-2">
      <img src="${escapeHtml(ce.image)}" data-fallback-src="${escapeHtml(ce.fallbackImage)}" alt="${escapeHtml(ce.name)}">
      <div class="flex-grow-1">
        <div class="fw-semibold">${escapeHtml(ce.name)}</div>
        <div class="small text-muted">${escapeHtml(getCEEffectTag(ce))}</div>
        <div class="small">${Math.max(ce.totalBonus || 0, 0)}% total</div>
        <div class="small text-muted">Affects ${affectedServants.length} selected servant${affectedServants.length === 1 ? "" : "s"}.</div>
      </div>
      <button type="button" class="btn btn-sm btn-primary" data-add-recommended-ce="${ce.id}">Add</button>
    </div>
  </div>
`; }
