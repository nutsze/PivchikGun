/* Состояние боя, игрок и отряд */
/* ---------- state ---------- */
const S={mode:'menu',kind:'endless',lvIdx:0,L:null,diff:1,night:false,t:0,score:0,wave:0,toSpawn:0,spawnT:0,between:0,running:false,kills:0,goalKills:0,survT:0,boss:null,
  shake:0,combo:0,comboT:0,deadT:0,winT:0,coins:0,tokens:0,banked:true};
let P,enemies=[],bullets=[],parts=[],pickups=[],nades=[],bombs=[],texts=[],holes=[];
let camX=0,camY=0;
function lookFor(heroId){ // у каждого героя свой фирменный образ
  const h=HEROES[heroId];
  return {sp:h.sp, special:h.special, body:h.body, wing:h.wing, tail:h.tail||h.wing, head:h.head||h.body, hat:h.hat||'none'};
}
const heroLv=id=>(SAVE.heroes[id]&&SAVE.heroes[id].lv)||1;
const SLOT_PRICE=[50,100,250]; // места в отряде — только за золотые яйца
const gunOf=heroId=>SAVE.loadout[clsOf(heroId)]||CLASSES[clsOf(heroId)].start;
let allies=[], curTg=null;
function squadIds(){return SAVE.squad.filter(id=>SAVE.heroes[id]&&id!==SAVE.hero).slice(0,SAVE.slots);}
function gunForAlly(id){const g=SAVE.squadGun[id],c=clsOf(id);return (g&&WEAP[g]&&WEAP[g].cls===c&&SAVE.guns.includes(g))?g:gunOf(id);}
function allyRange(a){const W=WEAP[a.gun];if(W.special==='rail')return 520;if(W.special==='mortar')return 380;return Math.min(470,Math.max(200,W.spd*W.life*(a.cls==='sniper'?1.35:1)));}
let zones=[], strikes=[], puddles=[]; // puddles — лужи от Кря-волны, враги в них вязнут // strikes — зона яичного дождя (одна на ульту)
function makeAllies(){
  const ids=squadIds();
  allies=ids.map((id,i)=>{const H=HEROES[id],L=heroLv(id),C=H.cls;
    let hpM=.75,armor=H.armor,spd=H.spd*.95;
    if(C==='tank'){hpM*=1.25;armor+=.1;spd*=.92;} if(C==='sniper')hpM*=.9; if(C==='assault')spd*=1.1;
    const max=Math.round(H.hp*(1+.06*(L-1))*hpM);
    const a=(i/Math.max(1,ids.length))*TAU+Math.PI/2;
    const al={id,cls:C,lv:L,isAlly:true,x:P.x+Math.cos(a)*60,y:P.y+Math.sin(a)*60,r:H.r,hp:max,max,spd,armor,regen:H.regen+(C==='medic'?2:0),
      dmgMul:H.dmg*(1+.05*(L-1))*(C==='sniper'?1.2:1),rateMul:H.rate*(C==='assault'?1.1:1),
      look:lookFor(id),gun:gunForAlly(id),hop:id==='duck',kitT:8,cd:rand(0,.4),ult:rand(10,40),buff:null,buffT:0,fireT:0,ang:0,face:1,phase:rand(0,6),moving:false,flash:0,down:0,lastHit:-9,vx:0,vy:0};
    al.range=allyRange(al); return al;});
  if(S.mode==='menu')allies.forEach((a,i)=>{const side=i%2?1:-1,k=Math.floor(i/2)+1;a.x=P.x+side*(30+k*34);a.y=P.y-4-k*10;a.ang=side>0?0:Math.PI;a.face=side;});
}
function newPlayer(){
  const id=SAVE.hero, H=HEROES[id], L=heroLv(id);
  const C=H.cls, gun=gunOf(id), medMul=id==='nurse'&&L>=10?2:1;
  const max=Math.round(H.hp*(1+.06*(L-1))*(C==='tank'?1.25:C==='sniper'?.9:1));
  const armor=H.armor+(id==='duck'&&L>=5?.1:0)+(id==='goose'&&L>=10?.15:0)+(C==='tank'?.1:0);
  return{hid:id,cls:C,hlv:L,x:WW/2,y:WH/2+40,r:H.r,hp:max,max,spd:H.spd*(C==='assault'?1.1:C==='tank'?.92:1),dmgMul:H.dmg*(1+.05*(L-1))*(C==='sniper'?1.2:1),rateMul:H.rate*(C==='assault'?1.1:1)*(id==='guinea'&&L>=10?1.15:1),armor,regen:H.regen,medMul,
    medic:C==='medic',rangeMul:C==='sniper'?1.35:1,
    nades:Math.min(6,2+H.nade),hop:id==='duck',kitT:8,prim:gun,w:gun,ammo:Infinity,magnet:20,
    ult:0,ultRate:(id==='chick'&&L>=10)?1.4:1,buff:null,buffT:0,fireT:0,revive:id==='duck'&&L>=10,
    look:lookFor(id,SAVE.hat,SAVE.color),lastHit:-9,cd:0,ang:0,face:1,phase:0,moving:false,inv:0,flash:0,vx:0,vy:0,alive:true};
}
const hasP=n=>P&&P.hlv>=n;
