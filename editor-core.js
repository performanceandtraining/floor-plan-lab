/* Floor ordering and wall removal preserve all the drawing data on each floor. */
(function(root){
 const G=typeof module!=='undefined'&&module.exports?require('./geometry.js'):root.PlanGeometry;
 function insert(state,slot,floor){if(!Number.isInteger(slot)||slot<0||slot>state.floors.length||state.floors.length>=12)return false;state.floors.splice(slot,0,floor);state.activeFloor=slot;return true}
 function targetIndex(from,slot){return slot>from?slot-1:slot}
 function move(state,from,slot){const list=state.floors;if(!Number.isInteger(from)||!Number.isInteger(slot)||from<0||from>=list.length||slot<0||slot>list.length)return false;const target=targetIndex(from,slot);if(target===from)return false;const active=list[state.activeFloor],item=list.splice(from,1)[0];list.splice(target,0,item);state.activeFloor=list.indexOf(active);return true}
 function hideOutside(floor,wallId){if(!G.edges(floor.outline).some(w=>w.id===wallId)||(floor.removedEdges||[]).includes(wallId))return false;floor.removedEdges=[...(floor.removedEdges||[]),wallId];floor.openings=floor.openings.filter(o=>o.wallId!==wallId);return true}
 function validRemoved(floor){const list=floor.removedEdges;if(list===undefined)return true;return Array.isArray(list)&&list.length<=floor.outline.length&&new Set(list).size===list.length&&list.every(id=>G.edges(floor.outline).some(w=>w.id===id))&&!floor.openings.some(o=>list.includes(o.wallId))}
 const api={insert,move,targetIndex,hideOutside,validRemoved};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.PlanEditor=api;
})(typeof globalThis!=='undefined'?globalThis:this);
