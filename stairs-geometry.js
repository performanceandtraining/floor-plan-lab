/* Stair footprints and treads use drawing proportions, with no measured dimensions. */
(function(root){
 const G=typeof module!=='undefined'&&module.exports?require('./geometry.js'):root.PlanGeometry;
 function footprint(s){const dx=s.b.x-s.a.x,dy=s.b.y-s.a.y,len=Math.hypot(dx,dy)||1,nx=-dy/len*s.width/2,ny=dx/len*s.width/2;return[{x:s.a.x+nx,y:s.a.y+ny},{x:s.b.x+nx,y:s.b.y+ny},{x:s.b.x-nx,y:s.b.y-ny},{x:s.a.x-nx,y:s.a.y-ny}]}
 function overlaps(a,b){for(const poly of [a,b])for(let i=0;i<poly.length;i++){const p=poly[i],q=poly[(i+1)%poly.length],nx=-(q.y-p.y),ny=q.x-p.x,pa=a.map(p=>p.x*nx+p.y*ny),pb=b.map(p=>p.x*nx+p.y*ny);if(Math.max(...pa)<=Math.min(...pb)+.01||Math.max(...pb)<=Math.min(...pa)+.01)return false}return true}
 function valid(f,s){if(!s||!['up','down'].includes(s.direction)||!Number.isFinite(s.width)||s.width<8||s.width>350||![s.a,s.b].every(p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y))||G.length(s)<18)return false;const poly=footprint(s),outline=G.flatten(f.outline);if(!poly.every(p=>G.contains(outline,p))||!G.edges(poly).every(w=>G.section(w,0,1,20).every(p=>G.contains(outline,p))))return false;return !(f.stairs||[]).some(other=>other.id!==s.id&&overlaps(poly,footprint(other)))}
 function treads(s,height=2.8,count=12){return Array.from({length:count},(_,i)=>({a:G.at(s,i/count),b:G.at(s,(i+1)/count),top:(s.direction==='down'?-1:1)*height*((i+1)/count),bottom:s.direction==='down'?-height-.16:0,width:s.width}))}
 function stored(s){return s&&typeof s.id==='string'&&s.id.length<=40&&['up','down'].includes(s.direction)&&Number.isFinite(s.width)&&s.width>=8&&s.width<=350&&[s.a,s.b].every(p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.x>=0&&p.x<=1000&&p.y>=0&&p.y<=800)&&G.length(s)>=18}
 const api={footprint,overlaps,valid,treads,stored};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.PlanStairs=api;
})(typeof globalThis!=='undefined'?globalThis:this);
