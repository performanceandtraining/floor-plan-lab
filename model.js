(function(root){
 const G=typeof module!=='undefined'&&module.exports?require('./geometry.js'):root.PlanGeometry;
 const S=typeof module!=='undefined'&&module.exports?require('./stairs-geometry.js'):root.PlanStairs;
 function cameraPosition(yaw=45,elevation=50,radius=25){const a=yaw*Math.PI/180,b=elevation*Math.PI/180;return{x:radius*Math.cos(b)*Math.sin(a),y:radius*Math.sin(b),z:radius*Math.cos(b)*Math.cos(a)}}
 function build(floor,options={}){
  const bounds=G.bounds(floor.outline),width=options.width||12,height=options.height||2.8,scale=width/Math.max(bounds.w,1),sill=Math.min(options.sill??.8,height*.6),head=Math.min(options.head??2.3,height-.08),doorHead=Math.min(options.doorHeight??2.1,height-.08),pieces=[];
  const world=p=>({x:(p.x-bounds.x)*scale,z:(p.y-bounds.y)*scale});
  const all=[...G.edges(floor.outline).filter(w=>!(floor.removedEdges||[]).includes(w.id)),...floor.walls.map(w=>({...w,exterior:false}))];
  for(const w of all){const openings=floor.openings.filter(o=>o.wallId===w.id).sort((a,b)=>a.start-b.start),breaks=new Set([0,1]);for(let i=1;i<(w.c?48:1);i++)breaks.add(i/48);openings.forEach(o=>{breaks.add(o.start);breaks.add(o.end)});const ts=[...breaks].sort((a,b)=>a-b);
   for(let i=0;i<ts.length-1;i++){const a=ts[i],b=ts[i+1],mid=(a+b)/2,o=openings.find(o=>mid>=o.start&&mid<=o.end),base={a:world(G.at(w,a)),b:world(G.at(w,b)),wallId:w.id,exterior:w.exterior,t:mid,openingId:o?.id};
    const add=(kind,low,high)=>{if(high>low+.001)pieces.push({...base,kind,low,high})};
    if(!o)add('wall',0,height);else if(o.kind==='window'){add('wall',0,sill);add('glass',sill,head);add('wall',head,height)}else{add('door',0,doorHead);add('wall',doorHead,height)}
   }
  }
  const stairs=(floor.stairs||[]).filter(S.stored).map(s=>({id:s.id,direction:s.direction,footprint:S.footprint(s).map(world),centre:world(G.at(s,.5)),treads:S.treads(s,height).map(t=>({...t,a:world(t.a),b:world(t.b),width:t.width*scale}))})),holes=stairs.filter(s=>s.direction==='down').map(s=>s.footprint),minY=holes.length?-height-.16:0,maxY=height;
  return{boundary:G.flatten(floor.outline).map(world),pieces,stairs,holes,minY,maxY,scale,bounds,width,height,sill,head,doorHead,world};
 }
 const api={build,cameraPosition};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.PlanModel=api;
})(typeof globalThis!=='undefined'?globalThis:this);
