/* Состояние боя, игрок и отряд */
/* ---------- state ---------- */
const S={mode:'menu',kind:'endless',lvIdx:0,L:null,diff:1,night:false,t:0,score:0,wave:0,toSpawn:0,spawnT:0,between:0,running:false,kills:0,goalKills:0,survT:0,boss:null,
  shake:0,combo:0,comboT:0,deadT:0,winT:0,coins:0,tokens:0,banked:true};
let P,enemies=[],bullets=[],parts=[],pickups=[],nades=[],bombs=[],texts=[];
let camX=0,camY=0;
function lookFor(heroId,hat,color){
  const h=HEROES[heroId], col=COLORS[color];
  return {sp:h.sp, special:h.special, body:col.body||h.body, wing:col.wing||h.wing, tail:col.body?col.wing:(h.tail||h.wing), head:col.body?col.body:(h.head||h.body), hat};
}
const heroLv=id=>(SAVE.heroes[id]&&SAVE.heroes[id].lv)||1;
const SLOT_PRICE=[600,1800,4500];
const ALLY_GUN={hen:'pistol',chick:'millet',rooster:'sawed',duck:'freeze',goose:'sheriff',adren:'minigun'};
let allies=[], curTg=null;
function squadIds(){return SAVE.squad.filter(id=>SAVE.heroes[id]&&id!==SAVE.hero).slice(0,SAVE.slots);}
function makeAllies(){
  const ids=squadIds();
  allies=ids.map((id,i)=>{const H=HEROES[id],L=heroLv(id),max=Math.round(H.hp*(1+.06*(L-1))*.85);
    const a=(i/Math.max(1,ids.length))*TAU+Math.PI/2;
    return {id,isAlly:true,x:P.x+Math.cos(a)*60,y:P.y+Math.sin(a)*60,r:H.r,hp:max,max,spd:H.spd*.95,dmg:15*H.dmg*(1+.05*(L-1)),rate:.38/H.rate,armor:H.armor,regen:H.regen,
      look:lookFor(id,'helmet','native'),gun:ALLY_GUN[id]||'pistol',cd:rand(0,.4),ang:0,face:1,phase:rand(0,6),moving:false,flash:0,down:0,lastHit:-9,vx:0,vy:0};});
}
function newPlayer(){
  const id=SAVE.hero, H=HEROES[id], L=heroLv(id);
  const max=Math.round(H.hp*(1+.06*(L-1)));
  const armor=H.armor+(id==='duck'&&L>=5?.1:0)+(id==='goose'&&L>=10?.15:0);
  return{hid:id,hlv:L,x:WW/2,y:WH/2+40,r:H.r,hp:max,max,spd:H.spd,dmgMul:H.dmg*(1+.05*(L-1)),rateMul:H.rate,armor,regen:H.regen,
    nades:Math.min(6,2+H.nade),prim:SAVE.gun,w:SAVE.gun,ammo:Infinity,magnet:20,
    ult:0,ultRate:(id==='chick'&&L>=10)?1.4:1,buff:null,buffT:0,fireT:0,revive:id==='duck'&&L>=10,
    look:lookFor(id,SAVE.hat,SAVE.color),lastHit:-9,cd:0,ang:0,face:1,phase:0,moving:false,inv:0,flash:0,vx:0,vy:0,alive:true};
}
const hasP=n=>P&&P.hlv>=n;
