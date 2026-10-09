/* Сохранение прогресса и настроек в localStorage */
/* ---------- save ---------- */
function today(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
const DEF={v:2,coins:100,tokens:0,btokens:0,eggs:0,eggMs:{},slots:0,squad:[],squadGun:{},bigDay:'',hero:'hen',heroes:{hen:{lv:1,cards:0}},hat:'bandana',hats:['none','bandana'],color:'native',colors:['native'],loadout:{assault:'pistol',tank:'granny',sniper:'cornrifle',medic:'syringe'},guns:['pistol','granny','cornrifle','syringe'],best:{score:0,wave:0},story:{done:[]},skinRefund:0,wlv:{},schests:0,menuBg:'yard'};
function loadSave(){
  let s=null; try{s=JSON.parse(localStorage.getItem('kur_save')||'null');}catch(e){}
  const o=JSON.parse(JSON.stringify(DEF));
  if(s&&typeof s==='object'){
    for(const k in o)if(s[k]!==undefined&&s[k]!==null)o[k]=s[k];
    if(Array.isArray(s.heroes)){o.heroes={};s.heroes.forEach(id=>{if(HEROES[id])o.heroes[id]={lv:1,cards:0};});}
    if(s.cards&&typeof s.cards==='object'&&!s.v){ // refund the old global upgrade cards
      const old={hp:80,dmg:120,rate:120,spd:90,nade:150,greed:100,magnet:70};let ref=0;
      for(const k in s.cards){const b=old[k]||0;for(let i=0;i<(s.cards[k]|0);i++)ref+=b*(i+1);}
      o.coins+=ref;
    }
  }
  try{const b=JSON.parse(localStorage.getItem('kur_best')||'null');if(b&&typeof b.score==='number'&&b.score>o.best.score)o.best=b;}catch(e){}
  ['coins','tokens','btokens','eggs'].forEach(k=>{if(typeof o[k]!=='number'||!isFinite(o[k]))o[k]=DEF[k];});
  if(!o.eggMs||typeof o.eggMs!=='object')o.eggMs={};
  o.slots=clamp(o.slots|0,0,3); if(!Array.isArray(o.squad))o.squad=[];
  if(!o.squadGun||typeof o.squadGun!=='object')o.squadGun={};
  o.squad=o.squad.filter((id,i,a)=>HEROES[id]&&a.indexOf(id)===i).slice(0,o.slots);
  if(!o.heroes||typeof o.heroes!=='object'||Array.isArray(o.heroes))o.heroes={hen:{lv:1,cards:0}};
  for(const id in o.heroes){if(!HEROES[id])delete o.heroes[id];else{const h=o.heroes[id];h.lv=clamp(h.lv|0||1,1,10);h.cards=Math.max(0,h.cards|0);}}
  if(!o.heroes.hen)o.heroes.hen={lv:1,cards:0};
  ['hats','colors','guns'].forEach(k=>{if(!Array.isArray(o[k]))o[k]=DEF[k].slice();});
  if(!o.heroes[o.hero])o.hero='hen';
  if(!o.skinRefund){ // скины больше не продаются: возвращаем потраченное на шапки и окрасы
    let rc=0,re=0; o.hats.concat(o.colors).forEach(id=>{const it=HATS[id]||COLORS[id];if(it){rc+=it.price||0;re+=it.eggs||0;}});
    if(s&&(rc||re)){o.coins+=rc;o.eggs+=re;o.refundMsg=[rc,re];}
    o.hats=['none','bandana'];o.colors=['native'];o.hat='bandana';o.color='native';o.skinRefund=1;}
  if(!HATS[o.hat]||!o.hats.includes(o.hat))o.hat='bandana';
  if(!COLORS[o.color]||!o.colors.includes(o.color))o.color='native';
  CLASS_ORDER.forEach(k=>{const st=CLASSES[k].start;if(!o.guns.includes(st))o.guns.push(st);});
  if(!o.loadout||typeof o.loadout!=='object')o.loadout={};
  if(s&&s.gun&&WEAP[s.gun]&&WEAP[s.gun].cls&&o.guns.includes(s.gun)&&!o.loadout[WEAP[s.gun].cls])o.loadout[WEAP[s.gun].cls]=s.gun;
  CLASS_ORDER.forEach(k=>{const g=o.loadout[k];if(!WEAP[g]||WEAP[g].cls!==k||!o.guns.includes(g))o.loadout[k]=CLASSES[k].start;});
  delete o.gun;
  if(!o.story||!Array.isArray(o.story.done))o.story={done:[]};
  if(!o.wlv||typeof o.wlv!=='object'||Array.isArray(o.wlv))o.wlv={};
  for(const id in o.wlv){const w=o.wlv[id];if(!WEAP[id]||!WEAP[id].rar||!w||typeof w!=='object')delete o.wlv[id];else{w.lv=clamp(w.lv|0||1,1,10);w.cards=Math.max(0,w.cards|0);}}
  o.schests=Math.max(0,o.schests|0); if(typeof o.menuBg!=='string')o.menuBg='yard';
  o.v=2; return o;
}
let SAVE=loadSave();
function persist(){try{localStorage.setItem('kur_save',JSON.stringify(SAVE));}catch(e){}}
persist();
let muted=false; try{muted=localStorage.getItem('kur_mute')==='1';}catch(e){}
let autoAim=true; try{autoAim=localStorage.getItem('kur_auto')!=='0';}catch(e){}
const pcAuto=()=>autoAim&&!COARSE;
function wRec(id){return SAVE.wlv[id]||(SAVE.wlv[id]={lv:1,cards:0});}
const wLv=id=>(SAVE.wlv[id]&&SAVE.wlv[id].lv)||1;
const wMul=id=>WEAP[id]&&WEAP[id].rar?1+W_STEP*(wLv(id)-1):1;
