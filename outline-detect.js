/* Local raster perimeter proposals. No model, network request or existing trace needed. */
(function(root){
 const G=typeof module!=='undefined'&&module.exports?require('./geometry.js'):root.PlanGeometry;
 function morph(src,w,h,r,dilate){const stride=w+1,sum=new Int32Array((w+1)*(h+1)),out=new Uint8Array(w*h);for(let y=0;y<h;y++){let row=0;for(let x=0;x<w;x++){row+=src[y*w+x];sum[(y+1)*stride+x+1]=sum[y*stride+x+1]+row}}for(let y=0;y<h;y++)for(let x=0;x<w;x++){const x0=Math.max(0,x-r),y0=Math.max(0,y-r),x1=Math.min(w,x+r+1),y1=Math.min(h,y+r+1),n=sum[y1*stride+x1]-sum[y0*stride+x1]-sum[y1*stride+x0]+sum[y0*stride+x0];out[y*w+x]=dilate?n>0:n===(x1-x0)*(y1-y0)}return out}
 function simplify(points,tolerance){if(points.length<3)return points;let best=0,index=0;const a=points[0],b=points[points.length-1];for(let i=1;i<points.length-1;i++){const d=G.project({a,b},points[i]).d;if(d>best){best=d;index=i}}return best>tolerance?[...simplify(points.slice(0,index+1),tolerance).slice(0,-1),...simplify(points.slice(index),tolerance)]:[a,b]}
 function traceMask(rgba,w,h,gapRadius){const ink=new Uint8Array(w*h),radius=Math.max(2,gapRadius??Math.round(w/100));for(let i=0;i<ink.length;i++){const k=i*4;ink[i]=rgba[k+3]>100&&rgba[k]*.299+rgba[k+1]*.587+rgba[k+2]*.114<185?1:0}const thick=morph(ink,w,h,radius,true),outside=new Uint8Array(w*h),queue=new Int32Array(w*h);let head=0,tail=0;const add=i=>{if(!thick[i]&&!outside[i]){outside[i]=1;queue[tail++]=i}};for(let x=0;x<w;x++){add(x);add((h-1)*w+x)}for(let y=0;y<h;y++){add(y*w);add(y*w+w-1)}while(head<tail){const i=queue[head++],x=i%w;if(x)add(i-1);if(x<w-1)add(i+1);if(i>=w)add(i-w);if(i<w*(h-1))add(i+w)}const filled=morph(outside.map(v=>1-v),w,h,radius,false),seen=new Uint8Array(w*h),candidates=[];
  for(let seed=0;seed<filled.length;seed++){if(!filled[seed]||seen[seed])continue;head=0;tail=1;queue[0]=seed;seen[seed]=1;let minX=w,maxX=0,minY=h,maxY=0;while(head<tail){const i=queue[head++],x=i%w,y=Math.floor(i/w);minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);for(const n of [x?i-1:-1,x<w-1?i+1:-1,y?i-w:-1,y<h-1?i+w:-1])if(n>=0&&filled[n]&&!seen[n]){seen[n]=1;queue[tail++]=n}}if(tail<w*h*.018||maxX-minX<w*.1||maxY-minY<h*.1||minX<=1||minY<=1||maxX>=w-2||maxY>=h-2)continue;
   const edges=new Map(),put=(x,y,a,b)=>edges.set(y*(w+1)+x,[a,b]);for(let j=0;j<tail;j++){const i=queue[j],x=i%w,y=Math.floor(i/w);if(!y||!filled[i-w])put(x,y,x+1,y);if(x===w-1||!filled[i+1])put(x+1,y,x+1,y+1);if(y===h-1||!filled[i+w])put(x+1,y+1,x,y+1);if(!x||!filled[i-1])put(x,y+1,x,y)}const start=edges.keys().next().value;let key=start,points=[];for(let j=0;j<=edges.size;j++){points.push({x:key%(w+1)*1000/w,y:Math.floor(key/(w+1))*800/h});const next=edges.get(key);if(!next)break;key=next[1]*(w+1)+next[0];if(key===start)break}if(key!==start)continue;let far=1;for(let i=2;i<points.length;i++)if(Math.hypot(points[i].x-points[0].x,points[i].y-points[0].y)>Math.hypot(points[far].x-points[0].x,points[far].y-points[0].y))far=i;const polygon=[...simplify(points.slice(0,far+1),4).slice(0,-1),...simplify([...points.slice(far),points[0]],4).slice(0,-1)];if(polygon.length<=100&&G.validOutline(polygon)&&Math.abs(G.area(polygon))>15000)candidates.push(polygon);
  }return candidates.sort((a,b)=>Math.abs(G.area(b))-Math.abs(G.area(a))).slice(0,12)
 }

 function workingImage(rgba,w,h,region){
  const r=region?{x:G.clamp(region.x,0,1000),y:G.clamp(region.y,0,800),w:G.clamp(region.w,20,1000-region.x),h:G.clamp(region.h,20,800-region.y)}:{x:0,y:0,w:1000,h:800};
  const x0=r.x/1000*w,y0=r.y/800*h,rw=r.w/1000*w,rh=r.h/800*h,scale=Math.min(w/rw,h/rh),ox=(w-rw*scale)/2,oy=(h-rh*scale)/2,out=new Uint8ClampedArray(w*h*4).fill(255),ink=new Uint8Array(w*h);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){if(x<ox||y<oy||x>=w-ox||y>=h-oy)continue;const sx=Math.min(w-1,Math.max(0,Math.floor(x0+(x-ox)/scale))),sy=Math.min(h-1,Math.max(0,Math.floor(y0+(y-oy)/scale))),k=(sy*w+sx)*4,gray=rgba[k]*.299+rgba[k+1]*.587+rgba[k+2]*.114;if(rgba[k+3]>100&&gray<225){const i=(y*w+x)*4;out[i]=out[i+1]=out[i+2]=0;ink[y*w+x]=1}}
  return{rgba:out,ink,map:p=>({x:((p.x/1000*w-ox)/scale+x0)/w*1000,y:((p.y/800*h-oy)/scale+y0)/h*800})};
 }
 function solid(poly){const b=G.bounds(poly);return Math.abs(G.area(poly))/Math.max(1,b.w*b.h)>.32}
 function adaptive(rgba,w,h){const base=Math.max(2,Math.round(w/100));for(const radius of [...new Set([base,base*2,base*3,base*5])]){const found=traceMask(rgba,w,h,radius).filter(solid);if(found.length)return found}return[]}
 function separateFrame(poly,ink,w,h){
  const b=G.bounds(poly);if(b.w<800||b.h<640||Math.abs(G.area(poly))<560000||Math.abs(G.area(poly))/(b.w*b.h)<.94)return null;
  const x0=Math.max(0,Math.floor((b.x-b.w/2)/1000*w)),x1=Math.min(w-1,Math.ceil((b.x+b.w/2)/1000*w)-1),y0=Math.max(0,Math.floor((b.y-b.h/2)/800*h)),y1=Math.min(h-1,Math.ceil((b.y+b.h/2)/800*h)-1),band=Math.max(3,Math.round(w*.005));
  let seed=-1;for(let y=y0;y<=Math.min(y1,y0+band)&&seed<0;y++)for(let x=x0;x<=x1;x++)if(ink[y*w+x]){seed=y*w+x;break}if(seed<0)return null;
  const seen=new Uint8Array(w*h),queue=[seed];seen[seed]=1;for(let i=0;i<queue.length;i++){const at=queue[i],x=at%w,y=Math.floor(at/w);if(x>x0+band&&x<x1-band&&y>y0+band&&y<y1-band)return null;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=w||ny>=h)continue;const n=ny*w+nx;if(ink[n]&&!seen[n]){seen[n]=1;queue.push(n)}}}
  return{x0:x0+band+1,x1:x1-band-1,y0:y0+band+1,y1:y1-band-1};
 }
 function detect(rgba,w,h,options={}){
  const working=workingImage(rgba,w,h,options.region),found=adaptive(working.rgba,w,h);let result=found;
  if(found.length===1){const frame=separateFrame(found[0],working.ink,w,h);if(frame){const inner=working.rgba.slice();for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(x<frame.x0||x>frame.x1||y<frame.y0||y>frame.y1){const k=(y*w+x)*4;inner[k]=inner[k+1]=inner[k+2]=255}const nested=adaptive(inner,w,h);if(nested.reduce((n,p)=>n+Math.abs(G.area(p)),0)>144000)result=nested}}
  return result.map(poly=>poly.map(working.map)).filter(G.validOutline);
 }
 const api={detect};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.OutlineDetect=api;
})(typeof globalThis!=='undefined'?globalThis:this);
