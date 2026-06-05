function getHypotheticalCEBonusForServant(ce,servant,servantSlotIndex,ceSlotIndex=-1,ignoreExceptSelf=true){
  if(!ce||!servant)return 0;
  if(state.selectedServantBond15[servantSlotIndex])return 0;
  if(!doesCEAffectServant(ce,servant,ceSlotIndex,servantSlotIndex,ignoreExceptSelf))return 0;
  return Number(getOptimizedCEBondPercent(ce))||0;
}

function getCEAssignedSlotScore(ce,ceSlotIndex){
  if(!state.selectedServants[ceSlotIndex])return 0;
  return state.selectedServants.reduce((sum,servant,servantSlotIndex)=>sum+getHypotheticalCEBonusForServant(ce,servant,servantSlotIndex,ceSlotIndex,false),0);
}

function getCEAffectedServantsForAssignedSlot(ce,ceSlotIndex){
  return state.selectedServants.map((servant,servantSlotIndex)=>({
    servant,
    slotIndex:servantSlotIndex,
    bonus:getHypotheticalCEBonusForServant(ce,servant,servantSlotIndex,ceSlotIndex,false)
  })).filter((entry)=>entry.servant&&entry.bonus>0);
}

function getCECandidateForOptimization(ce){
  const slotScores=Array(SLOT_COUNT).fill(0);
  for(let slotIndex=0;slotIndex<SLOT_COUNT;slotIndex+=1)slotScores[slotIndex]=getCEAssignedSlotScore(ce,slotIndex);
  const bestScore=Math.max(...slotScores);
  return bestScore>0?{ce,slotScores,bestScore}:null;
}

function cloneAssignmentEntry(entry){return{score:entry.score,items:entry.items.slice()};}

function compareAssignmentItems(left,right){
  const leftText=left.items.map((item)=>`${item.assignedSlot}:${item.name}`).join("|");
  const rightText=right.items.map((item)=>`${item.assignedSlot}:${item.name}`).join("|");
  return leftText.localeCompare(rightText);
}

function isBetterAssignment(candidate,current){
  if(!current)return true;
  if(candidate.score!==current.score)return candidate.score>current.score;
  if(candidate.items.length!==current.items.length)return candidate.items.length>current.items.length;
  return compareAssignmentItems(candidate,current)<0;
}

function buildCERecommendations(){
  const assignableSlots=state.selectedServants.map((servant,slotIndex)=>servant?slotIndex:null).filter((slotIndex)=>slotIndex!==null);
  if(!assignableSlots.length)return [];

  const candidates=state.ces.map(getCECandidateForOptimization).filter(Boolean).sort((left,right)=>right.bestScore-left.bestScore||left.ce.name.localeCompare(right.ce.name));
  const maxMask=1<<SLOT_COUNT;
  let dp=Array(maxMask).fill(null);
  dp[0]={score:0,items:[]};

  for(const candidate of candidates){
    const next=dp.map((entry)=>entry?cloneAssignmentEntry(entry):null);

    for(let mask=0;mask<maxMask;mask+=1){
      const base=dp[mask];
      if(!base)return;

      for(const slotIndex of assignableSlots){
        if(mask&(1<<slotIndex))continue;
        const slotScore=candidate.slotScores[slotIndex];
        if(slotScore<=0)continue;

        const newMask=mask|(1<<slotIndex);
        const affectedServants=getCEAffectedServantsForAssignedSlot(candidate.ce,slotIndex);
        const item={...candidate.ce,totalBonus:slotScore,assignedSlot:slotIndex,affectedServants};
        const proposed={score:base.score+slotScore,items:[...base.items,item]};

        if(isBetterAssignment(proposed,next[newMask]))next[newMask]=proposed;
      }
    }

    dp=next;
  }

  const best=dp.filter(Boolean).reduce((bestEntry,entry)=>isBetterAssignment(entry,bestEntry)?entry:bestEntry,null);
  return best?best.items.sort((left,right)=>left.assignedSlot-right.assignedSlot||right.totalBonus-left.totalBonus||left.name.localeCompare(right.name)):[];
}

function handleOptimizeCEs(){
  state.recommendations=buildCERecommendations();
  renderRecommendations();
}

function handleAddAllRecommendedCEs(){
  if(!state.recommendations.length)return;

  state.selectedCEs=Array(SLOT_COUNT).fill(null);
  state.selectedCEOwned=Array(SLOT_COUNT).fill(false);

  for(const ce of state.recommendations){
    const slotIndex=Number.isInteger(ce.assignedSlot)?ce.assignedSlot:firstOpenSlot(state.selectedCEs);
    state.selectedCEs[slotIndex]=ce;
    state.selectedCEOwned[slotIndex]=isDefaultOwnCE(ce);
  }

  state.activeCESlot=null;
  renderAll();
}
