(function () {
  let tooltipEl = null;

  function createTooltipElement() {
    tooltipEl = document.createElement("div");
    tooltipEl.id = "servant-tooltip";
    tooltipEl.className = "servant-tooltip";
    tooltipEl.setAttribute("aria-hidden", "true");
    document.body.appendChild(tooltipEl);
  }

  function buildTooltipHTML(servant) {
    const alignmentText =
      servant.alignment && servant.alignment.length
        ? servant.alignment.map(toTitleCase).join(" ")
        : "Unknown";

    const traitsText =
      servant.traits && servant.traits.length
        ? servant.traits.map(toTitleCase).filter(Boolean).join(", ")
        : "None";

    return `
      <div class="servant-tooltip-name">${escapeHtml(servant.name)}</div>
      <div class="servant-tooltip-row">
        <span class="servant-tooltip-label">Class</span>
        <span class="servant-tooltip-value">${escapeHtml(toTitleCase(servant.className))}</span>
      </div>
      <div class="servant-tooltip-row">
        <span class="servant-tooltip-label">Gender</span>
        <span class="servant-tooltip-value">${escapeHtml(toTitleCase(servant.gender))}</span>
      </div>
      <div class="servant-tooltip-row">
        <span class="servant-tooltip-label">Attribute</span>
        <span class="servant-tooltip-value">${escapeHtml(toTitleCase(servant.attribute))}</span>
      </div>
      <div class="servant-tooltip-row">
        <span class="servant-tooltip-label">Alignment</span>
        <span class="servant-tooltip-value">${escapeHtml(alignmentText)}</span>
      </div>
      <div class="servant-tooltip-traits">
        <span class="servant-tooltip-label">Traits</span>
        <span class="servant-tooltip-value">${escapeHtml(traitsText)}</span>
      </div>
    `;
  }

  function positionTooltip(clientX, clientY) {
    const offsetX = 18;
    const offsetY = 14;
    const margin = 10;
    const tooltipWidth = tooltipEl.offsetWidth || 240;
    const tooltipHeight = tooltipEl.offsetHeight || 160;

    let left = clientX + offsetX;
    let top = clientY + offsetY;

    if (left + tooltipWidth > window.innerWidth - margin) {
      left = clientX - tooltipWidth - offsetX;
    }
    if (top + tooltipHeight > window.innerHeight - margin) {
      top = clientY - tooltipHeight - offsetY;
    }

    tooltipEl.style.left = `${Math.max(margin, left)}px`;
    tooltipEl.style.top = `${Math.max(margin, top)}px`;
  }

  function showTooltip(servant, clientX, clientY) {
    tooltipEl.innerHTML = buildTooltipHTML(servant);
    tooltipEl.classList.add("visible");
    positionTooltip(clientX, clientY);
  }

  function hideTooltip() {
    tooltipEl.classList.remove("visible");
  }

  function getServantIdFromTarget(target) {
    const el = target ? target.closest("[data-servant-id]") : null;
    return el ? el.dataset.servantId : null;
  }

  function findServantById(id) {
    return state.servants.find((s) => s.id === Number(id)) || null;
  }

  function initServantTooltip() {
    createTooltipElement();

    document.addEventListener("mouseover", (event) => {
      const servantId = getServantIdFromTarget(event.target);
      if (!servantId) {
        return;
      }
      const servant = findServantById(servantId);
      if (servant) {
        showTooltip(servant, event.clientX, event.clientY);
      }
    });

    document.addEventListener("mousemove", (event) => {
      if (!tooltipEl.classList.contains("visible")) {
        return;
      }
      const servantId = getServantIdFromTarget(event.target);
      if (servantId) {
        positionTooltip(event.clientX, event.clientY);
      } else {
        hideTooltip();
      }
    });

    document.addEventListener("mouseout", (event) => {
      const fromServantId = getServantIdFromTarget(event.target);
      if (!fromServantId) {
        return;
      }
      const toServantId = getServantIdFromTarget(event.relatedTarget);
      if (toServantId !== fromServantId) {
        hideTooltip();
      }
    });
  }

  window.initServantTooltip = initServantTooltip;
})();
