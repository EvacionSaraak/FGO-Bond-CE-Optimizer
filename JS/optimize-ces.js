function getHypotheticalCEBonusForServant(ce,servant,servantSlotIndex,ceSlotIndex=-1,ignoreExceptSelf=true){if(!ce||!servant)return 0;if(state.selectedServantBond15[servantSlotIndex])return 0;if(!doesCEAffectServant(ce,servant,ceSlotIndex,servantSlotIndex,ignoreExceptSelf))return 0;return Number(getOptimizedCEBondPercent(ce))||0;}
function getCEAssignedSlotScore(ce,ceSlotIndex){const selectedServants=Array.isArray(state.selectedServants)?state.selectedServants:[];return selectedServants.reduce((sum,servant,servantSlotIndex)=>sum+getHypotheticalCEBonusForServant(ce,servant,servantSlotIndex,ceSlotIndex,false),0);}
function getCEAffectedServantsForAssignedSlot(ce,ceSlotIndex){const selectedServants=Array.isArray(state.selectedServants)?state.selectedServants:[];return selectedServants.map((servant,servantSlotIndex)=>({servant,slotIndex:servantSlotIndex,bonus:getHypotheticalCEBonusForServant(ce,servant,servantSlotIndex,ceSlotIndex,false)})).filter((entry)=>entry.servant&&entry.bonus>0);}
function getCECandidateForOptimization(ce){const slotScores=Array(SLOT_COUNT).fill(0);for(let slotIndex=0;slotIndex<SLOT_COUNT;slotIndex+=1)slotScores[slotIndex]=getCEAssignedSlotScore(ce,slotIndex);const bestScore=Math.max(...slotScores),cost=getCECostByRarity(ce.rarity);return bestScore>0?{ce,slotScores,bestScore,cost}:null;}
function cloneAssignmentEntry(entry){return{score:entry.score,cost:entry.cost,items:entry.items.slice()};}
function compareAssignmentItems(left,right){const leftText=left.items.map((item)=>`${item.assignedSlot}:${item.name}`).join("|"),rightText=right.items.map((item)=>`${item.assignedSlot}:${item.name}`).join("|");return leftText.localeCompare(rightText);}
function isBetterAssignment(candidate,current){if(!current)return true;if(candidate.score!==current.score)return candidate.score>current.score;if(candidate.items.length!==current.items.length)return candidate.items.length>current.items.length;if(candidate.cost!==current.cost)return candidate.cost<current.cost;return compareAssignmentItems(candidate,current)<0;}

function buildCERecommendations(){
  const selectedServants=Array.isArray(state.selectedServants)?state.selectedServants:[];if(!selectedServants.some(Boolean))return [];
  const maxTotalCost=getMaxTotalCost(),servantCost=getSelectedServantCost();if(Number.isFinite(maxTotalCost)&&servantCost>=maxTotalCost)return [];
  const maxPossibleCECost=SLOT_COUNT*12,ceBudget=Number.isFinite(maxTotalCost)?Math.max(0,maxTotalCost-servantCost):maxPossibleCECost;if(ceBudget<=0)return [];
  const assignableSlots=Array.from({length:SLOT_COUNT},(_,index)=>index);
  const candidates=(Array.isArray(state.ces)?state.ces:[]).map(getCECandidateForOptimization).filter((candidate)=>candidate&&candidate.cost<=ceBudget).sort((left,right)=>right.bestScore-left.bestScore||left.cost-right.cost||left.ce.name.localeCompare(right.ce.name));
  const maxMask=1<<SLOT_COUNT;
  let dp=Array.from({length:maxMask},()=>Array(ceBudget+1).fill(null));
  dp[0][0]={score:0,cost:0,items:[]};

  for(const candidate of candidates){
    const next=dp.map((row)=>row.map((entry)=>entry?cloneAssignmentEntry(entry):null));
    for(let mask=0;mask<maxMask;mask+=1){
      for(let currentCost=0;currentCost<=ceBudget;currentCost+=1){
        const base=dp[mask][currentCost];if(!base)continue;
        for(const slotIndex of assignableSlots){
          if(mask&(1<<slotIndex))continue;
          const slotScore=candidate.slotScores[slotIndex];if(slotScore<=0)continue;
          const newCost=currentCost+candidate.cost;if(newCost>ceBudget)continue;
          const newMask=mask|(1<<slotIndex),affectedServants=getCEAffectedServantsForAssignedSlot(candidate.ce,slotIndex),item={...candidate.ce,totalBonus:slotScore,assignedSlot:slotIndex,affectedServants},proposed={score:base.score+slotScore,cost:newCost,items:[...base.items,item]};
          if(isBetterAssignment(proposed,next[newMask][newCost]))next[newMask][newCost]=proposed;
        }
      }
    }
    dp=next;
  }

  let best=null;for(const row of dp)for(const entry of row)if(entry&&isBetterAssignment(entry,best))best=entry;
  return best?best.items.sort((left,right)=>left.assignedSlot-right.assignedSlot||right.totalBonus-left.totalBonus||left.name.localeCompare(right.name)):[];
}

function handleOptimizeCEs(){state.recommendations=buildCERecommendations();if(!Array.isArray(state.recommendations))state.recommendations=[];renderRecommendations();}
function handleAddAllRecommendedCEs(){if(!Array.isArray(state.recommendations)||!state.recommendations.length)return;state.selectedCEs=Array(SLOT_COUNT).fill(null);state.selectedCEOwned=Array(SLOT_COUNT).fill(false);for(const ce of state.recommendations){const slotIndex=Number.isInteger(ce.assignedSlot)?ce.assignedSlot:firstOpenSlot(state.selectedCEs);state.selectedCEs[slotIndex]=ce;state.selectedCEOwned[slotIndex]=isDefaultOwnCE(ce);}state.activeCESlot=null;renderAll();}
