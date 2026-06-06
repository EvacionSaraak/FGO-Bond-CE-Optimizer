window.addEventListener("DOMContentLoaded",init);

async function init(){cacheDom();bindEvents();initServantTooltip();initCETooltip();renderAll();await loadAtlasData();renderAll();}

function cacheDom(){
  dom.loadingStatus=document.getElementById("loading-status");
  dom.servantSlots=document.getElementById("servant-slots");
  dom.ceSlots=document.getElementById("ce-slots");
  dom.servantSidebar=document.getElementById("servant-sidebar");
  dom.ceSidebar=document.getElementById("ce-sidebar");
  dom.servantSlotLabel=document.getElementById("servant-sidebar-slot-label");
  dom.ceSlotLabel=document.getElementById("ce-sidebar-slot-label");
  dom.servantSearch=document.getElementById("servant-search");
  dom.servantPageSize=document.getElementById("servant-page-size");
  dom.servantPagePrev=document.getElementById("servant-page-prev");
  dom.servantPageNext=document.getElementById("servant-page-next");
  dom.servantPageLabel=document.getElementById("servant-page-label");
  dom.ceSearch=document.getElementById("ce-search");
  dom.cePageSize=document.getElementById("ce-page-size");
  dom.cePagePrev=document.getElementById("ce-page-prev");
  dom.cePageNext=document.getElementById("ce-page-next");
  dom.cePageLabel=document.getElementById("ce-page-label");
  dom.servantResults=document.getElementById("servant-results");
  dom.ceResults=document.getElementById("ce-results");
  dom.servantFilterSummary=document.getElementById("servant-filter-summary");
  dom.ceFilterSummary=document.getElementById("ce-filter-summary");
  dom.recommendationArea=document.getElementById("recommendation-area");
  dom.optimizeCEsButton=document.getElementById("optimize-ces-btn");
  dom.optimizeServantsButton=document.getElementById("optimize-servants-btn");
  dom.clearAllButton=document.getElementById("clear-all-btn");
  dom.addAllRecommendedCEsButton=document.getElementById("add-all-recommended-ces-btn");
  dom.servantLineupTitle=document.getElementById("servant-lineup-title");
  dom.ceLineupTitle=document.getElementById("ce-lineup-title");
  dom.maxTotalCostInput=document.getElementById("max-total-cost-input");
}

function bindEvents(){
  dom.servantSearch.addEventListener("input",(event)=>{state.servantSearch=event.target.value.trim();state.servantSidebarPage=1;renderServantSidebar();});
  dom.servantPageSize.addEventListener("change",(event)=>{const parsed=Number(event.target.value);if(!Number.isFinite(parsed)||parsed<=0)return;state.servantSidebarPageSize=parsed;state.servantSidebarPage=1;renderServantSidebar();});
  dom.servantPagePrev.addEventListener("click",()=>{state.servantSidebarPage=Math.max(1,state.servantSidebarPage-1);renderServantSidebar();});
  dom.servantPageNext.addEventListener("click",()=>{state.servantSidebarPage+=1;renderServantSidebar();});
  dom.ceSearch.addEventListener("input",(event)=>{state.ceSearch=event.target.value.trim();state.ceSidebarPage=1;renderCESidebar();});
  dom.cePageSize?.addEventListener("change",(event)=>{const parsed=Number(event.target.value);if(!Number.isFinite(parsed)||parsed<=0)return;state.ceSidebarPageSize=parsed;state.ceSidebarPage=1;renderCESidebar();});
  dom.cePagePrev?.addEventListener("click",()=>{state.ceSidebarPage=Math.max(1,state.ceSidebarPage-1);renderCESidebar();});
  dom.cePageNext?.addEventListener("click",()=>{state.ceSidebarPage+=1;renderCESidebar();});
  dom.optimizeCEsButton.addEventListener("click",handleOptimizeCEs);
  dom.optimizeServantsButton.addEventListener("click",handleOptimizeServants);
  dom.clearAllButton.addEventListener("click",handleClearAll);
  dom.addAllRecommendedCEsButton?.addEventListener("click",handleAddAllRecommendedCEs);
  dom.maxTotalCostInput?.addEventListener("input",()=>{renderCostHeaders();if(Array.isArray(state.recommendations)&&state.recommendations.length)handleOptimizeCEs();});
}
