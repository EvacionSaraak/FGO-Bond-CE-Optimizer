function setStatus(message,tone="secondary"){dom.loadingStatus.className=`alert alert-${tone} py-2 small`;dom.loadingStatus.textContent=message;}
function renderAll(){renderServantSlots();renderCESlots();renderServantSidebar();renderCESidebar();renderRecommendations();bindImageFallbacks(document);}

function renderServantSlots(){
  dom.servantSlots.innerHTML=state.selectedServants.map((servant,index)=>{
    const totalBonus=getServantBondBonus(index),activeClass=state.activeServantSlot===index?"active-slot":"";
    return `<div class="selection-slot ${activeClass}" data-slot-type="servant" data-slot-index="${index}">
      ${servant?`<button type="button" class="btn-close remove-entry" data-remove-type="servant" data-remove-index="${index}" aria-label="Remove servant"></button>`:""}
      ${servant?servantSlotMarkup(servant,index,totalBonus):emptySlotMarkup("Servant",index)}
    </div>`;
  }).join("");
  bindSlotEvents(dom.servantSlots);
  dom.servantSlots.querySelectorAll("[data-servant-bond15-toggle]").forEach((button)=>{button.addEventListener("click",(event)=>{event.stopPropagation();const slotIndex=Number(event.currentTarget.dataset.servantBond15Toggle);state.selectedServantBond15[slotIndex]=!state.selectedServantBond15[slotIndex];renderAll();});});
  dom.servantSlots.querySelectorAll("[data-servant-bond-display-toggle]").forEach((button)=>{button.addEventListener("click",(event)=>{event.stopPropagation();const slotIndex=Number(event.currentTarget.dataset.servantBondDisplayToggle);state.selectedServantBondHidden[slotIndex]=!state.selectedServantBondHidden[slotIndex];renderAll();});});
}

function renderCESlots(){
  dom.ceSlots.innerHTML=state.selectedCEs.map((ce,index)=>{
    const activeClass=state.activeCESlot===index?"active-slot":"";
    return `<div class="selection-slot ${activeClass}" data-slot-type="ce" data-slot-index="${index}">
      ${ce?`<button type="button" class="btn-close remove-entry" data-remove-type="ce" data-remove-index="${index}" aria-label="Remove CE"></button>`:""}
      ${ce?ceSlotMarkup(ce,index,state.selectedCEOwned[index]):emptySlotMarkup("Craft Essence",index)}
      ${ce?.supportConditional?`<label class="small mt-2 d-flex gap-2 align-items-center slot-toggle"><input type="checkbox" data-ce-owned-toggle="${index}" ${state.selectedCEOwned[index]?"checked":""}> Own copy</label>`:""}
    </div>`;
  }).join("");
  bindSlotEvents(dom.ceSlots);
  dom.ceSlots.querySelectorAll("[data-ce-owned-toggle]").forEach((checkbox)=>{
    checkbox.addEventListener("click",(event)=>event.stopPropagation());
    checkbox.addEventListener("change",(event)=>{const slotIndex=Number(event.currentTarget.dataset.ceOwnedToggle);state.selectedCEOwned[slotIndex]=Boolean(event.currentTarget.checked);renderAll();});
  });
}

function bindSlotEvents(container){
  container.querySelectorAll("[data-slot-type]").forEach((button)=>{
    button.addEventListener("click",(event)=>{
      const type=event.currentTarget.dataset.slotType,index=Number(event.currentTarget.dataset.slotIndex);
      if(type==="servant"){state.activeServantSlot=index;state.activeCESlot=null;}else{state.activeCESlot=index;state.activeServantSlot=null;}
      renderAll();
    });
  });
  container.querySelectorAll(".remove-entry").forEach((button)=>{
    button.addEventListener("click",(event)=>{
      event.stopPropagation();
      const type=event.currentTarget.dataset.removeType,index=Number(event.currentTarget.dataset.removeIndex);
      if(type==="servant"){state.selectedServants[index]=null;state.selectedServantBond15[index]=false;state.selectedServantBondHidden[index]=false;}else{state.selectedCEs[index]=null;state.selectedCEOwned[index]=false;}
      renderAll();
    });
  });
}

function getNextEmptyServantSlotIndex(){return state.selectedServants.findIndex((entry)=>entry===null);}

function renderServantSidebar(){
  dom.servantSidebar.classList.remove("d-none");
  const isLoading=state.servantSidebarLoading;
  dom.servantSidebar.classList.toggle("sidebar-loading",isLoading);
  dom.servantSearch.disabled=isLoading;
  dom.servantPageSize.disabled=isLoading;
  dom.servantSearch.setAttribute("aria-busy",String(isLoading));
  dom.servantResults.classList.toggle("sidebar-loading-results",isLoading);
  const emptySlotIndex=getNextEmptyServantSlotIndex();
  dom.servantSlotLabel.textContent=emptySlotIndex===-1?"No Empty Slots":`Next Empty Slot ${emptySlotIndex+1}`;
  const visibleServants=isLoading?[]:getVisibleServantsForSidebar(-1),totalServants=visibleServants.length,pageSize=Math.max(1,Number(state.servantSidebarPageSize)||SIDEBAR_PAGE_SIZE_OPTIONS[0]),totalPages=Math.max(1,Math.ceil(totalServants/pageSize)),currentPage=Math.min(Math.max(1,state.servantSidebarPage),totalPages);
  state.servantSidebarPage=currentPage;
  const pageStart=totalServants?(currentPage-1)*pageSize:0,pagedServants=visibleServants.slice(pageStart,pageStart+pageSize);
  dom.servantPageSize.value=String(pageSize);
  dom.servantPageLabel.textContent=`Page ${currentPage} of ${totalPages}`;
  dom.servantPagePrev.disabled=isLoading||currentPage<=1;
  dom.servantPageNext.disabled=isLoading||currentPage>=totalPages;
  dom.servantFilterSummary.textContent=state.servantOptimizationEnabled?`Showing ${pagedServants.length} of ${totalServants} servants affected by all selected Craft Essences.`:`Showing ${pagedServants.length} of ${totalServants} servants matching the current search.`;
  if(isLoading){dom.servantFilterSummary.textContent="Loading servants...";dom.servantResults.innerHTML=sidebarLoadingMarkup("Loading servants",state.servantSidebarLoadingProgress);dom.servantPageLabel.textContent="Page 1 of 1";dom.servantPagePrev.disabled=true;dom.servantPageNext.disabled=true;return;}
  dom.servantResults.innerHTML=pagedServants.length?pagedServants.map((servant)=>servantCardMarkup(servant,emptySlotIndex===-1||!canAddServantToSelection(servant.id,emptySlotIndex))).join(""):`<div class="empty-state">No servants match the current search and CE filters.</div>`;
  dom.servantResults.querySelectorAll("[data-add-servant]").forEach((button)=>{button.addEventListener("click",()=>{const servantId=Number(button.dataset.addServant),servant=state.servants.find((entry)=>entry.id===servantId),targetIndex=getNextEmptyServantSlotIndex();if(!servant||targetIndex===-1)return;if(!canAddServantToSelection(servantId,targetIndex))return;state.selectedServants[targetIndex]=servant;state.selectedServantBond15[targetIndex]=false;state.selectedServantBondHidden[targetIndex]=false;state.activeServantSlot=null;state.servantOptimizationEnabled=false;renderAll();});});
}

function renderCESidebar(){
  dom.ceSidebar.classList.remove("d-none");
  const isLoading=state.ceSidebarLoading;
  dom.ceSidebar.classList.toggle("sidebar-loading",isLoading);
  dom.ceSearch.disabled=isLoading;
  if(dom.cePageSize)dom.cePageSize.disabled=isLoading;
  dom.ceSearch.setAttribute("aria-busy",String(isLoading));
  dom.ceResults.classList.toggle("sidebar-loading-results",isLoading);
  const slotIndex=state.activeCESlot;
  dom.ceSlotLabel.textContent=slotIndex!==null?`CE Slot ${slotIndex+1}`:"Any Slot";
  if(isLoading){dom.ceFilterSummary.textContent="Loading Craft Essences...";dom.ceResults.innerHTML=sidebarLoadingMarkup("Loading Craft Essences",state.ceSidebarLoadingProgress);if(dom.cePageLabel)dom.cePageLabel.textContent="Page 1 of 1";if(dom.cePagePrev)dom.cePagePrev.disabled=true;if(dom.cePageNext)dom.cePageNext.disabled=true;return;}
  if(!state.ces.length){dom.ceFilterSummary.textContent="No Craft Essences available.";dom.ceResults.innerHTML=`<div class="empty-state">No Craft Essences are currently available from Atlas Academy.</div>`;if(dom.cePageLabel)dom.cePageLabel.textContent="Page 1 of 1";if(dom.cePagePrev)dom.cePagePrev.disabled=true;if(dom.cePageNext)dom.cePageNext.disabled=true;return;}
  const search=normalizeText(state.ceSearch),visibleCEs=state.ces.filter((ce)=>!search||ce.normalizedName.includes(search)),totalCEs=visibleCEs.length,pageSize=Math.max(1,Number(state.ceSidebarPageSize)||SIDEBAR_PAGE_SIZE_OPTIONS[0]),totalPages=Math.max(1,Math.ceil(totalCEs/pageSize)),currentPage=Math.min(Math.max(1,state.ceSidebarPage),totalPages);
  state.ceSidebarPage=currentPage;
  const pageStart=totalCEs?(currentPage-1)*pageSize:0,pagedCEs=visibleCEs.slice(pageStart,pageStart+pageSize);
  if(dom.cePageSize)dom.cePageSize.value=String(pageSize);
  if(dom.cePageLabel)dom.cePageLabel.textContent=`Page ${currentPage} of ${totalPages}`;
  if(dom.cePagePrev)dom.cePagePrev.disabled=currentPage<=1;
  if(dom.cePageNext)dom.cePageNext.disabled=currentPage>=totalPages;
  dom.ceFilterSummary.textContent=`Showing ${pagedCEs.length} of ${totalCEs} Craft Essences.`;
  dom.ceResults.innerHTML=pagedCEs.length?pagedCEs.map((ce)=>ceCardMarkup(ce)).join(""):`<div class="empty-state">No Craft Essences match the current search.</div>`;
  dom.ceResults.querySelectorAll("[data-add-ce]").forEach((button)=>{button.addEventListener("click",()=>{const ceId=Number(button.dataset.addCe),ce=state.ces.find((entry)=>entry.id===ceId);if(!ce)return;const targetIndex=state.activeCESlot??firstOpenSlot(state.selectedCEs);state.selectedCEs[targetIndex]=ce;state.selectedCEOwned[targetIndex]=isDefaultOwnCE(ce);renderAll();});});
}

function sidebarLoadingMarkup(label,progress){const clampedProgress=Math.max(0,Math.min(100,Math.round(Number(progress)||0)));return `<div class="sidebar-loading-indicator" style="--loading-progress:${clampedProgress}"><div class="sidebar-loading-ring"><span class="sidebar-loading-ring-core">${clampedProgress}%</span></div><div class="small text-muted">${label}...</div></div>`;}

function renderRecommendations(){
  const recommendations=state.recommendations;
  if(dom.addAllRecommendedCEsButton)dom.addAllRecommendedCEsButton.disabled=recommendations.length===0;
  if(!recommendations.length){dom.recommendationArea.innerHTML=`<div class="empty-state">Click Optimize CEs to rank bond-focused Craft Essences.</div>`;return;}
  dom.recommendationArea.innerHTML=recommendations.map((ce,index)=>recommendationMarkup(ce,index)).join("");
  dom.recommendationArea.querySelectorAll("[data-recommendation-id]").forEach((card)=>{const ceId=Number(card.dataset.recommendationId),ce=recommendations.find((entry)=>entry.id===ceId);if(!ce)return;card.addEventListener("mouseenter",()=>highlightAffectedServants(ce));card.addEventListener("mouseleave",clearHighlightedServants);});
  dom.recommendationArea.querySelectorAll("[data-add-recommended-ce]").forEach((button)=>{button.addEventListener("click",()=>{const ceId=Number(button.dataset.addRecommendedCe),ce=state.ces.find((entry)=>entry.id===ceId);if(!ce)return;const targetIndex=state.activeCESlot??firstOpenSlot(state.selectedCEs);state.selectedCEs[targetIndex]=ce;state.selectedCEOwned[targetIndex]=isDefaultOwnCE(ce);renderAll();});});
}

function highlightAffectedServants(ce){clearHighlightedServants();state.selectedServants.forEach((servant,servantSlotIndex)=>{if(!servant)return;if(doesCEAffectServant(ce,servant,-1,servantSlotIndex,true))dom.servantSlots.querySelector(`.selection-slot[data-slot-index="${servantSlotIndex}"]`)?.classList.add("highlighted-slot");});}
function clearHighlightedServants(){dom.servantSlots.querySelectorAll(".highlighted-slot").forEach((slot)=>slot.classList.remove("highlighted-slot"));}
