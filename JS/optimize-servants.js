function getSelectedCEsForServantOptimization(){
  return (Array.isArray(state.selectedCEs)?state.selectedCEs:[]).filter(Boolean);
}

function ceHasServantRestriction(ce){
  if(!ce)return false;
  if(getJapaneseBondConditionGroups(ce.detail||"").length)return true;
  const description=ce.normalizedDetail||normalizeText(ce.detail||"");
  if(isGenericJapaneseBondCE(ce.detail||""))return false;
  if(matchesPartyWideBondRule(description))return false;
  return true;
}

function doesServantMatchOptimizationCE(servant,ce){
  if(!servant||!ce)return false;
  return doesCEAffectServant(ce,servant,-1,-1,true);
}

function doesServantMatchAllSelectedCEs(servant){
  const selectedCEs=getSelectedCEsForServantOptimization();
  if(!selectedCEs.length)return true;
  return selectedCEs.every((ce)=>doesServantMatchOptimizationCE(servant,ce));
}

function getServantOptimizationRequirements(){
  const selectedCEs=getSelectedCEsForServantOptimization();
  const restrictedCEs=selectedCEs.filter(ceHasServantRestriction);
  if(!selectedCEs.length)return "No Craft Essences selected.";
  if(!restrictedCEs.length)return "Selected Craft Essences do not restrict servant traits.";
  return restrictedCEs.map((ce)=>`${ce.name}: ${getCEEffectTag(ce).replace(/\s+\+\d+.*$/,"")}`).join(" | ");
}

function getVisibleServantsForSidebar(_slotIndex=null){
  const search=normalizeText(state.servantSearch);
  let servants=(Array.isArray(state.servants)?state.servants:[]).filter((servant)=>!search||servant.normalizedName.includes(search));

  if(state.servantOptimizationEnabled){
    servants=servants.filter(doesServantMatchAllSelectedCEs);
    servants.sort((left,right)=>{
      const leftScore=getServantOptimizationScore(left),rightScore=getServantOptimizationScore(right);
      if(leftScore!==rightScore)return rightScore-leftScore;
      return left.id-right.id;
    });
  }

  return servants;
}

function getServantOptimizationScore(servant){
  const selectedCEs=getSelectedCEsForServantOptimization();
  return selectedCEs.reduce((sum,ce)=>sum+(doesServantMatchOptimizationCE(servant,ce)?getOptimizedCEBondPercent(ce):0),0);
}

function handleOptimizeServants(){
  state.servantOptimizationEnabled=true;
  state.servantSidebarPage=1;
  renderServantSidebar();
}

function handleClearServantOptimization(){
  state.servantOptimizationEnabled=false;
  state.servantSidebarPage=1;
  renderServantSidebar();
}
