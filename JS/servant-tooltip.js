function initServantTooltip(){
  if(window.__servantTooltipInitialized)return;
  window.__servantTooltipInitialized=true;
  let tooltip=document.getElementById("servant-tooltip");
  if(!tooltip){tooltip=document.createElement("div");tooltip.id="servant-tooltip";tooltip.className="servant-tooltip";document.body.appendChild(tooltip);}

  const renderTooltip=(servant)=>{
    const alignment=Array.isArray(servant.alignment)&&servant.alignment.length?servant.alignment.map(toTitleCase).join(", "):"Unknown",traits=Array.isArray(servant.traits)&&servant.traits.length?servant.traits.slice(0,28).map(toTitleCase).join(", "):"None";
    tooltip.innerHTML=`
      <div class="servant-tooltip-name">${escapeHtml(servant.name)}</div>
      <div class="servant-tooltip-row"><span class="servant-tooltip-label">Class</span><span class="servant-tooltip-value">${escapeHtml(toTitleCase(servant.className))}</span></div>
      <div class="servant-tooltip-row"><span class="servant-tooltip-label">Gender</span><span class="servant-tooltip-value">${escapeHtml(toTitleCase(servant.gender||"unknown"))}</span></div>
      <div class="servant-tooltip-row"><span class="servant-tooltip-label">Attribute</span><span class="servant-tooltip-value">${escapeHtml(toTitleCase(servant.attribute||"unknown"))}</span></div>
      <div class="servant-tooltip-row"><span class="servant-tooltip-label">Alignment</span><span class="servant-tooltip-value">${escapeHtml(alignment)}</span></div>
      <div class="servant-tooltip-traits"><span class="servant-tooltip-label">Traits</span><span class="servant-tooltip-value">${escapeHtml(traits)}</span></div>
    `;
  };

  const moveTooltip=(event)=>{
    if(!tooltip.classList.contains("visible"))return;
    const margin=16,rect=tooltip.getBoundingClientRect();
    let left=event.clientX+margin,top=event.clientY+margin;
    if(left+rect.width>window.innerWidth-margin)left=event.clientX-rect.width-margin;
    if(top+rect.height>window.innerHeight-margin)top=event.clientY-rect.height-margin;
    tooltip.style.left=`${Math.max(margin,left)}px`;
    tooltip.style.top=`${Math.max(margin,top)}px`;
  };

  document.addEventListener("mouseover",(event)=>{
    const trigger=event.target.closest("[data-servant-id],[data-servant-tooltip-id]");
    if(!trigger)return;
    const servantId=Number(trigger.dataset.servantId||trigger.dataset.servantTooltipId),servant=state.servants.find((entry)=>entry.id===servantId)||state.selectedServants.find((entry)=>entry?.id===servantId);
    if(!servant)return;
    renderTooltip(servant);
    tooltip.classList.add("visible");
    moveTooltip(event);
  });

  document.addEventListener("mousemove",moveTooltip);
  document.addEventListener("mouseout",(event)=>{if(event.target.closest("[data-servant-id],[data-servant-tooltip-id]"))tooltip.classList.remove("visible");});
}

function initCETooltip(){
  if(window.__ceTooltipInitialized)return;
  window.__ceTooltipInitialized=true;
  let tooltip=document.getElementById("ce-tooltip");
  if(!tooltip){tooltip=document.createElement("div");tooltip.id="ce-tooltip";tooltip.className="servant-tooltip ce-tooltip";document.body.appendChild(tooltip);}

  const findCE=(id)=>state.recommendations.find((entry)=>entry.id===id)||state.ces.find((entry)=>entry.id===id)||state.selectedCEs.find((entry)=>entry?.id===id);
  const enrichCE=(ce)=>{
    if(!ce)return null;
    if(Array.isArray(ce.affectedServants))return ce;
    const affectedServants=state.selectedServants.map((servant,slotIndex)=>({servant,slotIndex,bonus:getHypotheticalCEBonusForServant(ce,servant,slotIndex)})).filter((entry)=>entry.servant&&entry.bonus>0),totalBonus=affectedServants.reduce((sum,entry)=>sum+entry.bonus,0);
    return{...ce,affectedServants,totalBonus};
  };

  const renderTooltip=(rawCE)=>{
    const ce=enrichCE(rawCE),tag=getCEEffectTag(ce),total=formatPercent(Number(ce.totalBonus)||0),affected=ce.affectedServants||[],effective=formatPercent(getOptimizedCEBondPercent(ce)),english=translateJapaneseCEDetail(ce.detail||"");
    const affectedHtml=affected.length?affected.map(({servant,slotIndex,bonus})=>`
      <div class="ce-tooltip-affected-row">
        <span>Slot ${slotIndex+1}</span>
        <strong>${escapeHtml(servant.name)}</strong>
        <b>+${formatPercent(bonus)}%</b>
      </div>
    `).join(""):`<div class="ce-tooltip-muted">Affects no selected servants.</div>`;

    tooltip.innerHTML=`
      <div class="ce-tooltip-head">
        <img src="${escapeHtml(ce.image)}" data-fallback-src="${escapeHtml(ce.fallbackImage)}" alt="${escapeHtml(ce.name)}">
        <div>
          <div class="servant-tooltip-name">${escapeHtml(ce.name)}</div>
          <div class="ce-tooltip-tag">${escapeHtml(tag)}</div>
        </div>
      </div>
      <div class="servant-tooltip-row"><span class="servant-tooltip-label">Effective</span><span class="servant-tooltip-value">+${effective}%${isDefaultOwnCE(ce)?" own copy default":""}</span></div>
      <div class="servant-tooltip-row"><span class="servant-tooltip-label">Total</span><span class="servant-tooltip-value">+${total}% hypothetical</span></div>
      <div class="ce-tooltip-section"><div class="servant-tooltip-label">Affected</div><div class="ce-tooltip-affected">${affectedHtml}</div></div>
      <div class="ce-tooltip-section"><div class="servant-tooltip-label">English</div><div class="ce-tooltip-detail">${escapeHtml(english)}</div></div>
      <div class="ce-tooltip-section"><div class="servant-tooltip-label">Japanese</div><div class="ce-tooltip-detail">${escapeHtml(ce.detail||"No detail text.")}</div></div>
    `;
    bindImageFallbacks(tooltip);
  };

  const moveTooltip=(event)=>{
    if(!tooltip.classList.contains("visible"))return;
    const margin=16,rect=tooltip.getBoundingClientRect();
    let left=event.clientX+margin,top=event.clientY+margin;
    if(left+rect.width>window.innerWidth-margin)left=event.clientX-rect.width-margin;
    if(top+rect.height>window.innerHeight-margin)top=event.clientY-rect.height-margin;
    tooltip.style.left=`${Math.max(margin,left)}px`;
    tooltip.style.top=`${Math.max(margin,top)}px`;
  };

  document.addEventListener("mouseover",(event)=>{
    const trigger=event.target.closest("[data-ce-tooltip-id]");
    if(!trigger)return;
    const ce=findCE(Number(trigger.dataset.ceTooltipId));
    if(!ce)return;
    renderTooltip(ce);
    tooltip.classList.add("visible");
    moveTooltip(event);
  });

  document.addEventListener("mousemove",moveTooltip);
  document.addEventListener("mouseout",(event)=>{if(event.target.closest("[data-ce-tooltip-id]"))tooltip.classList.remove("visible");});
}
