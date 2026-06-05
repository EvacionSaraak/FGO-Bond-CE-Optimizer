function servantSlotMarkup(servant, index, totalBonus) { const maxBondNote = state.selectedServantBond15[index] ? `<div class="badge text-bg-warning text-dark mt-1">Max bond reached</div>` : ""; return `
  <div class="slot-filled" data-servant-tooltip-id="${servant.id}">
    <img class="slot-image" src="${escapeHtml(servant.image)}" data-fallback-src="${escapeHtml(servant.fallbackImage)}" alt="${escapeHtml(servant.name)}">
    <div class="slot-content">
      <div class="slot-label">Servant ${index + 1}</div>
      <div class="slot-name">${escapeHtml(servant.name)}</div>
      <div class="slot-meta class-row"><img class="class-icon" src="${escapeHtml(servant.classIcon)}" alt="">${escapeHtml(toTitleCase(servant.className))}</div>
      ${maxBondNote}
      <div class="selection-total">Total bond bonus: ${formatPercent(totalBonus)}%</div>
    </div>
  </div>
`; }

function ceSlotMarkup(ce, index, isOwned) { const effectivePercent = isOwned && ce.ownPercent > 0 ? ce.ownPercent : ce.percent, basePercent = isOwned && ce.ownBasePercent > 0 ? ce.ownBasePercent : ce.basePercent; return `
  <div class="slot-filled" title="${escapeHtml(ce.detail || "")}">
    <img class="slot-image" src="${escapeHtml(ce.image)}" data-fallback-src="${escapeHtml(ce.fallbackImage)}" alt="${escapeHtml(ce.name)}">
    <div class="slot-content">
      <div class="slot-label">Craft Essence ${index + 1}</div>
      <div class="slot-name">${escapeHtml(ce.name)}</div>
      <div class="slot-meta">${escapeHtml(getCEEffectTag({ ...ce, basePercent, percent: effectivePercent }))}</div>
    </div>
  </div>
`; }

function emptySlotMarkup(kind, index) { return `
  <div class="slot-empty">
    <div class="slot-label">${kind} ${index + 1}</div>
    <div class="display-6">+</div>
    <div class="small">Click to choose a ${kind.toLowerCase()}.</div>
  </div>
`; }

function servantCardMarkup(servant, isAddDisabled = false) { return `
  <button type="button" class="sidebar-card ${isAddDisabled ? "sidebar-card-disabled" : ""} w-100 text-start p-0" data-add-servant="${servant.id}" data-servant-tooltip-id="${servant.id}" ${isAddDisabled ? "disabled" : ""}>
    <div class="sidebar-card-body">
      <div class="sidebar-card-header">
        <img class="sidebar-thumb" src="${escapeHtml(servant.image)}" data-fallback-src="${escapeHtml(servant.fallbackImage)}" alt="${escapeHtml(servant.name)}">
        <div>
          <div class="fw-semibold">${escapeHtml(servant.name)}</div>
          <div class="class-row small text-muted mt-1"><img class="class-icon" src="${escapeHtml(servant.classIcon)}" alt="">${escapeHtml(toTitleCase(servant.className))}</div>
          <div class="small text-muted mt-1">${escapeHtml(toTitleCase(servant.gender || "unknown"))} / ${escapeHtml(toTitleCase(servant.attribute || "unknown"))}</div>
          <span class="badge ${isAddDisabled ? "text-bg-secondary" : "text-bg-primary"} mt-2">${isAddDisabled ? "Max 2" : "Add"}</span>
        </div>
      </div>
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

function recommendationMarkup(ce) { const affectedServants = ce.affectedServants || []; return `
  <div class="recommendation-card" data-recommendation-id="${ce.id}" title="${escapeHtml(ce.detail || "")}">
    <div class="recommendation-card-body">
      <div class="recommendation-card-header">
        <img class="recommendation-thumb" src="${escapeHtml(ce.image)}" data-fallback-src="${escapeHtml(ce.fallbackImage)}" alt="${escapeHtml(ce.name)}">
        <div>
          <div class="fw-semibold">${escapeHtml(ce.name)}</div>
          <div class="small text-muted mt-1">${escapeHtml(getCEEffectTag(ce))}</div>
          <div class="recommendation-badges mt-2">
            <span class="badge badge-soft">${formatPercent(ce.percent)}% each MLB</span>
            <span class="badge text-bg-success">${formatPercent(Math.max(ce.totalBonus || 0, 0))}% total</span>
          </div>
          <div class="small text-muted mt-2">Affects ${affectedServants.length} selected servant${affectedServants.length === 1 ? "" : "s"}.</div>
          <button type="button" class="btn btn-sm btn-primary mt-2" data-add-recommended-ce="${ce.id}">Add</button>
        </div>
      </div>
    </div>
  </div>
`; }
