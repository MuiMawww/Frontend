// Broad, flat-ended teeth match the original illustration's eight-tooth wheels.
export const GEAR_MODULE = 35;
export const GEAR_STROKE = 5;
const TOOTH_SECONDS = 4.2;
function drivenGear(parent, id, teeth, dx, dy, color) {
 const direction = Math.atan2(dy, dx);
 const distance = GEAR_MODULE * (parent.teeth + teeth) / 2;
 const phase = direction + Math.PI + parent.teeth / teeth * (direction - parent.phase) - Math.PI / teeth;
 return {id,teeth,color,x:parent.x+distance*Math.cos(direction),y:parent.y+distance*Math.sin(direction),phase,
  direction:-parent.direction,period:teeth*TOOTH_SECONDS,parent:parent.id};
}
const upper={id:'upper',teeth:8,x:462,y:322,color:'#7f8184',phase:-Math.PI/2,direction:1,period:8*TOOTH_SECONDS};
const left=drivenGear(upper,'left',8,-266,113,'#a1a3a6');
const lower=drivenGear(left,'lower',7,64,265,'#494b50');
const right={...drivenGear(upper,'right',6,228,113,'#bbc0c8'),holeRatio:.20};
export const gearTrain=[left,upper,lower,right];

export function gearPolygon(teeth) {
 const pitch=GEAR_MODULE*teeth/2;
 const root=pitch-GEAR_MODULE*.72;
 const tip=pitch+GEAR_MODULE*.45;
 const halfWidth=GEAR_MODULE*.60;
 const baseAngle=Math.asin(halfWidth/root);
 const step=2*Math.PI/teeth;
 const points=[];
 const add=(x,y,angle)=>points.push([x*Math.cos(angle)-y*Math.sin(angle),x*Math.sin(angle)+y*Math.cos(angle)]);
 for(let tooth=0;tooth<teeth;tooth++) {
  const angle=tooth*step;
  add(root*Math.cos(baseAngle),-halfWidth,angle);
  add(tip,-halfWidth,angle);
  add(tip,halfWidth,angle);
  add(root*Math.cos(baseAngle),halfWidth,angle);
  for(let sample=1;sample<=12;sample++) {
   const arc=baseAngle+(step-2*baseAngle)*sample/12;
   add(root*Math.cos(arc),root*Math.sin(arc),angle);
  }
 }
 return points;
}

export function gearOutline(teeth, holeRatio = .265) {
 const hole=GEAR_MODULE*teeth*holeRatio;
 const outline=gearPolygon(teeth).map(point=>point.map(value=>value.toFixed(3)).join(' ')).join('L');
 return 'M'+outline+'Z M'+hole+' 0 A'+hole+' '+hole+' 0 1 0 '+(-hole)+' 0 A'+hole+' '+hole+' 0 1 0 '+hole+' 0Z';
}
