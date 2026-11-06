import test from 'node:test';
import assert from 'node:assert/strict';
import {GEAR_MODULE,GEAR_STROKE,gearTrain,gearPolygon} from '../src/views/gear-geometry.js';
const angleAt=(g,t)=>g.phase+g.direction*2*Math.PI*t/g.period;
const positioned=(g,t)=>gearPolygon(g.teeth).map(([x,y])=>{const a=angleAt(g,t);return[x*Math.cos(a)-y*Math.sin(a)+g.x,x*Math.sin(a)+y*Math.cos(a)+g.y]});
const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
function intersects(a,b,c,d){
 if(Math.max(a[0],b[0])<=Math.min(c[0],d[0])||Math.max(c[0],d[0])<=Math.min(a[0],b[0])||Math.max(a[1],b[1])<=Math.min(c[1],d[1])||Math.max(c[1],d[1])<=Math.min(a[1],b[1]))return false;
 return cross(a,b,c)*cross(a,b,d)<0&&cross(c,d,a)*cross(c,d,b)<0;
}
test('Соседние шестерёнки сохраняют фазу зуб–впадина и одинаковую окружную скорость',()=>{
 for(const gear of gearTrain.filter(g=>g.parent)){
  const parent=gearTrain.find(g=>g.id===gear.parent);
  assert.ok(Math.abs(Math.hypot(gear.x-parent.x,gear.y-parent.y)-GEAR_MODULE/2*(gear.teeth+parent.teeth))<1e-8);
  assert.equal(gear.direction,-parent.direction);
  assert.ok(Math.abs(gear.teeth/gear.period-parent.teeth/parent.period)<1e-8);
  const direction=Math.atan2(gear.y-parent.y,gear.x-parent.x);
  for(const time of [0,.5,1.2,10,100,10000]){
   const phase=parent.teeth*(direction-angleAt(parent,time))+gear.teeth*(direction+Math.PI-angleAt(gear,time));
   assert.ok(Math.abs(Math.cos(phase)+1)<1e-8);
  }
 }
});
function pointDistance(p,a,b){
 const dx=b[0]-a[0],dy=b[1]-a[1];
 const t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy||1)));
 return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy);
}
test('Зубья и их чёрные контуры не пересекаются на всём цикле зацепления',()=>{
 for(let frame=0;frame<120;frame++){
  const time=frame*(gearTrain[0].period/gearTrain[0].teeth)/120;
  const polygons=gearTrain.map(g=>positioned(g,time));
  for(let i=0;i<gearTrain.length;i++)for(let j=i+1;j<gearTrain.length;j++){
   const a=polygons[i],b=polygons[j];
   for(let k=0;k<a.length;k++)for(let l=0;l<b.length;l++){
    const message=`${gearTrain[i].id}/${gearTrain[j].id}, t=${time}`;
    assert.ok(!intersects(a[k],a[(k+1)%a.length],b[l],b[(l+1)%b.length]),message);
    const clearance=Math.min(pointDistance(a[k],b[l],b[(l+1)%b.length]),pointDistance(b[l],a[k],a[(k+1)%a.length]));
    assert.ok(clearance>GEAR_STROKE,message+'; outline clearance '+clearance);
   }
  }
 }
});
