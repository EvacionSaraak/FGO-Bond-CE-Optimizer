function servantSlotMarkup(servant, index, totalBonus) {
  return `
    <div class="slot-filled" data-servant-id="${servant.id}">
      <img class="slot-image" src="${servant.image}" data-fallback-src="${servant.fallbackImage}" alt="${escapeHtml(servant.name)}" />
      <div class="slot-content">
        <div class="slot-label">Servant ${index + 1}</div>
        <div class="slot-name">${escapeHtml(servant.name)}</div>
        <div class="slot-meta class-row">
          <img class="class-icon" src="${servant.classIcon}" alt="${escapeHtml(servant.className)} icon" />
          <span>${escapeHtml(toTitleCase(servant.className))}</span>
        </div>
        <div class="selection-total">Total bond bonus: ${totalBonus}%</div>
      </div>
    </div>
  `;
}

function ceSlotMarkup(ce, index, isOwned) {
  const effectivePercent = isOwned && ce.ownPercent > 0 ? ce.ownPercent : ce.percent;
  return `
    <div class="slot-filled">
      <img class="slot-image" src="${ce.image}" data-fallback-src="${ce.fallbackImage}" alt="${escapeHtml(ce.name)}" />
      <div class="slot-content">
        <div class="slot-label">Craft Essence ${index + 1}</div>
        <div class="slot-name">${escapeHtml(ce.name)}</div>
        <div class="percent-note">Bond bonus: ${effectivePercent}%</div>
      </div>
    </div>
  `;
}

function emptySlotMarkup(kind, index) {
  return `
    <div class="slot-empty">
      <div class="slot-label">${kind} ${index + 1}</div>
      <div class="fs-4">+</div>
      <div>Click to choose a ${kind.toLowerCase()}.</div>
    </div>
  `;
}

function servantCardMarkup(servant, isAddDisabled = false) {
  return `
    <article class="sidebar-card ${isAddDisabled ? "sidebar-card-disabled" : ""}" data-servant-id="${servant.id}">
      <div class="sidebar-card-body">
        <div class="sidebar-card-header">
          <img class="sidebar-thumb" src="${servant.image}" data-fallback-src="${servant.fallbackImage}" alt="${escapeHtml(servant.name)}" />
          <div>
            <div class="fw-semibold mb-1">${escapeHtml(servant.name)}</div>
            <div class="class-row mb-3">
              <img class="class-icon" src="${servant.classIcon}" alt="${escapeHtml(servant.className)} icon" />
              <span class="small text-secondary">${escapeHtml(toTitleCase(servant.className))}</span>
            </div>
            <button class="btn btn-sm btn-primary" type="button" data-add-servant="${servant.id}" ${isAddDisabled ? "disabled" : ""}>Add</button>
          </div>
        </div>
      </div>
    </article>
  `;
}

function ceCardMarkup(ce) {
  return `
    <article class="sidebar-card" title="${escapeHtml(ce.detail)}">
      <div class="sidebar-card-body">
        <div class="sidebar-card-header">
          <img class="sidebar-thumb" src="${ce.image}" data-fallback-src="${ce.fallbackImage}" alt="${escapeHtml(ce.name)}" />
          <div>
            <div class="fw-semibold mb-1">${escapeHtml(ce.name)}</div>
            <div class="detail-clamp mb-2">${escapeHtml(ce.detail)}</div>
            <div class="recommendation-badges mb-3">
              <span class="badge rounded-pill badge-soft">${ce.percent}% bond (MLB)</span>
            </div>
            <button class="btn btn-sm btn-warning" type="button" data-add-ce="${ce.id}">Add</button>
          </div>
        </div>
      </div>
    </article>
  `;
}

function recommendationMarkup(ce) {
  const affectedServants = ce.affectedServants || [];
  return `
    <article class="recommendation-card" data-recommendation-id="${ce.id}" title="${escapeHtml(ce.detail)}">
      <div class="recommendation-card-body">
        <div class="recommendation-card-header mb-3">
          <img class="recommendation-thumb" src="${ce.image}" data-fallback-src="${ce.fallbackImage}" alt="${escapeHtml(ce.name)}" />
          <div>
            <div class="fw-semibold mb-2">${escapeHtml(ce.name)}</div>
            <div class="recommendation-badges mb-2">
              <span class="badge rounded-pill badge-soft">${ce.percent}% each (MLB)</span>
              <span class="badge rounded-pill text-bg-primary">${Math.max(ce.totalBonus || 0, 0)}% total</span>
            </div>
            <div class="small text-secondary">Affects ${affectedServants.length} selected servant${affectedServants.length === 1 ? "" : "s"}.</div>
          </div>
        </div>
        <div class="detail-clamp mb-3">${escapeHtml(ce.detail)}</div>
        <button class="btn btn-sm btn-outline-light" type="button" data-add-recommended-ce="${ce.id}">Add</button>
      </div>
    </article>
  `;
}
