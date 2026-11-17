/* Shared north is the default; old differences migrate to explicit floor overrides. */
(function(root){
 const angle=n=>((Math.round(Number(n)||0)%360)+360)%360;
 function normalize(state){const legacy=!Number.isFinite(state.sharedNorth),north=angle(legacy?state.floors[0]?.north:state.sharedNorth);state.sharedNorth=north;for(const f of state.floors){if(legacy&&f.northOverride===undefined&&angle(f.north)!==north)f.northOverride=true;if(f.northOverride===true)f.north=angle(f.north);else{f.northOverride=false;f.north=north}}return north}
 function set(state,index,value){normalize(state);const north=angle(value),f=state.floors[index];if(!f)return;if(f.northOverride)f.north=north;else{state.sharedNorth=north;for(const other of state.floors)if(!other.northOverride)other.north=north}}
 function override(state,index,enabled){normalize(state);const f=state.floors[index];if(!f)return;f.northOverride=!!enabled;if(!enabled)f.north=state.sharedNorth}
 function bearing(cx,cy,x,y){return angle(Math.atan2(x-cx,-(y-cy))*180/Math.PI)}
 function valid(state){return(state.sharedNorth===undefined||Number.isFinite(state.sharedNorth)&&state.sharedNorth>=0&&state.sharedNorth<360)&&state.floors.every(f=>f.northOverride===undefined||typeof f.northOverride==='boolean')}
 const api={angle,normalize,set,override,bearing,valid};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.NorthCompass=api;
})(typeof globalThis!=='undefined'?globalThis:this);
