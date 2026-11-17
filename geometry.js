/* Shared planar geometry. Coordinates are in the image's 1000 × 800 workspace. */
(function(root){
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,n)),mod=n=>(n%360+360)%360;
 function at(w,t){const u=1-t;return w.c?{x:u*u*w.a.x+2*u*t*w.c.x+t*t*w.b.x,y:u*u*w.a.y+2*u*t*w.c.y+t*t*w.b.y}:{x:w.a.x+(w.b.x-w.a.x)*t,y:w.a.y+(w.b.y-w.a.y)*t}}
 function tangent(w,t){return w.c?{x:2*((1-t)*(w.c.x-w.a.x)+t*(w.b.x-w.c.x)),y:2*((1-t)*(w.c.y-w.a.y)+t*(w.b.y-w.c.y))}:{x:w.b.x-w.a.x,y:w.b.y-w.a.y}}
 function section(w,start=0,end=1,n=32){return Array.from({length:n+1},(_,i)=>at(w,start+(end-start)*i/n))}
 function length(w){const p=section(w);return p.slice(1).reduce((sum,b,i)=>sum+Math.hypot(b.x-p[i].x,b.y-p[i].y),0)}
 function edges(outline){return outline.map((p,i)=>({id:'e'+i,exterior:true,a:{x:p.x,y:p.y},b:{x:outline[(i+1)%outline.length].x,y:outline[(i+1)%outline.length].y},...(p.c?{c:{...p.c}}:{})}))}
 function flatten(outline){return outline.length<2?outline:edges(outline).flatMap(w=>section(w,0,1,w.c?32:1).slice(0,-1))}
 function area(poly){return poly.reduce((a,p,i)=>{let q=poly[(i+1)%poly.length];return a+p.x*q.y-q.x*p.y},0)/2}
 function bounds(outline){const p=flatten(outline);if(!p.length)return{x:500,y:400,w:800,h:600};let xs=p.map(p=>p.x),ys=p.map(p=>p.y),x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys);return{x:(x0+x1)/2,y:(y0+y1)/2,w:x1-x0,h:y1-y0}}
 function contains(poly,p){let inside=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){let a=poly[i],b=poly[j];const cross=(p.x-a.x)*(b.y-a.y)-(p.y-a.y)*(b.x-a.x);if(Math.abs(cross)<.01&&p.x>=Math.min(a.x,b.x)-.01&&p.x<=Math.max(a.x,b.x)+.01&&p.y>=Math.min(a.y,b.y)-.01&&p.y<=Math.max(a.y,b.y)+.01)return true;if((a.y>p.y)!==(b.y>p.y)&&p.x<(b.x-a.x)*(p.y-a.y)/(b.y-a.y)+a.x)inside=!inside}return inside}
 function validOutline(outline){if(outline.length<3)return false;const p=flatten(outline);if(Math.abs(area(p))<500)return false;const orient=(a,b,c)=>(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);for(let i=0;i<p.length;i++){let a=p[i],b=p[(i+1)%p.length];if(Math.hypot(a.x-b.x,a.y-b.y)<.001)return false;for(let j=i+2;j<p.length;j++){if(i===0&&j===p.length-1)continue;let c=p[j],d=p[(j+1)%p.length];if(orient(a,b,c)*orient(a,b,d)<0&&orient(c,d,a)*orient(c,d,b)<0)return false}}return true}
 function project(w,p){let best={t:0,d:Infinity};for(let i=0;i<=160;i++){const t=i/160,q=at(w,t),d=Math.hypot(q.x-p.x,q.y-p.y);if(d<best.d)best={t,d,point:q}}return best}
 function openingRange(mid,width){width=clamp(width,.02,1);const start=clamp(mid-width/2,0,1-width);return{start,end:start+width}}
 function normal(w,t,outline){let d=tangent(w,t);const sign=area(flatten(outline))>=0?1:-1,m=Math.hypot(d.x,d.y)||1;return{x:sign*d.y/m,y:-sign*d.x/m}}
 function isLit(w,t,outline,sun,north){if(sun.alt<=0||!w.exterior||outline.length<3)return false;const n=normal(w,t,outline),a=(sun.az+north)*Math.PI/180;return n.x*Math.sin(a)-n.y*Math.cos(a)>.15}
 function exposure(w,opening,outline,sun,north){let lit=0;for(let i=0;i<20;i++)if(isLit(w,opening.start+(opening.end-opening.start)*(i+.5)/20,outline,sun,north))lit++;return lit/20}
 function sector(p,outline,north){const c=bounds(outline);if(Math.abs(p.x-c.x)<c.w/6&&Math.abs(p.y-c.y)<c.h/6)return'Centre';const angle=mod(Math.atan2(p.x-c.x,c.y-p.y)*180/Math.PI-north);return['N','NE','E','SE','S','SW','W','NW'][Math.round(angle/45)%8]}
 function axisPoint(a,p){return Math.abs(p.x-a.x)>=Math.abs(p.y-a.y)?{x:p.x,y:a.y}:{x:a.x,y:p.y}}
 function openingBetween(w,a,b){const t0=project(w,a).t,t1=project(w,b).t;return{start:Math.min(t0,t1),end:Math.max(t0,t1)}}
 function openingFits(openings,o){return o.end-o.start>=.006&&o.start>=0&&o.end<=1&&!openings.some(x=>x.id!==o.id&&x.wallId===o.wallId&&Math.max(x.start,o.start)<Math.min(x.end,o.end)-.0001)}
 const api={at,tangent,section,length,edges,flatten,area,bounds,contains,validOutline,project,openingRange,normal,isLit,exposure,sector,clamp,mod,axisPoint,openingBetween,openingFits};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.PlanGeometry=api;
})(typeof globalThis!=='undefined'?globalThis:this);
