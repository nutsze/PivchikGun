/* Интерфейс боя, меню, победа и поражение */
/* ---------- HUD / UI ---------- */
const hc={};
function setT(id,v){if(hc[id]!==v){hc[id]=v;$(id).textContent=v;}}
function goalLabel(long){
  if(S.kind==='endless')return 'Волна '+Math.max(1,S.wave);
  const g=S.L.goal;
  if(g.type==='waves')return 'Волна '+Math.max(1,S.wave)+'/'+g.n;
  if(g.type==='kill'){const w=KILLN[g.what]||ETYPE[g.what].name;return long?'Победи: '+w.toLowerCase()+' ×'+g.n:w+' '+S.goalKills+'/'+g.n;}
  if(g.type==='survive'){const t=Math.ceil(S.survT);return (long?'Продержись ':'Держись ')+Math.floor(t/60)+':'+String(t%60).padStart(2,'0');}
  if(g.type==='boss')return long?'Победи босса':'Босс: '+ETYPE[g.boss].name;
  return '';
}
function updateHUD(){
  if(!P)return;
  setT('hpText',Math.ceil(P.hp)+' / '+P.max);
  $('hpFill').style.width=(P.hp/P.max*100)+'%';
  $('hpFill').style.background=P.hp<P.max*.3?'#ff5a3c':'var(--hp)';
  setT('goalText',goalLabel(false));
  setT('scoreText',S.score.toLocaleString('ru-RU')+' очк.');
  setT('coinText',String(S.coins)); setT('tokText',String(S.tokens));
  const mult=Math.min(4,1+Math.floor((S.combo-1)/3));
  $('multText').hidden=!(S.combo>=4); setT('multText','Комбо ×'+mult);
  setT('wName',WEAP[P.w].name); setT('wAmmo',P.ammo===Infinity?'∞':String(P.ammo));
  setT('nadeCnt',String(P.nades)); $('nadeBtn').classList.toggle('empty',P.nades<=0);
}
let lastUltP=-1,lastUltState='';
function updateUltUI(){
  if(!P)return; const b=$('ultBtn'); const p=Math.floor(P.ult);
  const st=P.buff?'live':p>=100?'ready':'charge';
  if(p!==lastUltP){b.style.setProperty('--p',p);lastUltP=p;}
  if(st!==lastUltState||st==='live'){lastUltState=st;b.classList.toggle('ready',st==='ready');b.classList.toggle('live',st==='live');
    setT('ultLbl',st==='live'?Math.ceil(P.buffT)+' с':st==='ready'?'УЛЬТА':p+'%');}
  else if(st==='charge')setT('ultLbl',p+'%');
}
function showBanner(big,small){
  const b=$('banner'); $('banBig').textContent=big; $('banSmall').textContent=small||'';
  b.classList.remove('show'); void b.offsetWidth; b.classList.add('show');
}
let toastT=0;
function toast(msg){const t=$('toast');t.textContent=msg;t.classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('show'),1800);}
function fmt(n){return Math.round(n).toLocaleString('ru-RU');}
function purseHTML(){return '<span class="pill"><i class="coin"></i><b>'+fmt(SAVE.coins)+'</b></span><span class="pill"><i class="tok"></i><b>'+fmt(SAVE.tokens)+'</b></span><span class="pill"><i class="btok"></i><b>'+SAVE.btokens+'</b></span><span class="pill"><i class="gegg"></i><b>'+SAVE.eggs+'</b></span>';}
function refreshMenu(){
  $('menuCoins').textContent=fmt(SAVE.coins); $('menuTok').textContent=fmt(SAVE.tokens); $('menuBtok').textContent=SAVE.btokens; $('menuEggs').textContent=SAVE.eggs;
  const H=HEROES[SAVE.hero];
  const sq=squadIds().length;
  $('heroName').textContent=H.name;
  $('heroLine').textContent='Ур. '+heroLv(SAVE.hero)+' · '+WEAP[gunOf(SAVE.hero)].name+(sq?' · отряд: '+sq:'');
  const hb=$('heroBadges'); hb.innerHTML='';
  [[RAR[H.rar].name,RAR[H.rar].c],[CLASSES[H.cls].name,CLASSES[H.cls].c]].forEach(([t,c])=>{const b=document.createElement('span');b.className='rar';b.textContent=t;b.style.setProperty('--c',c);hb.appendChild(b);});
  const done=SAVE.story.done.length;
  if(done>=STORY.length)$('storySub').textContent='Все 4 главы пройдены · можно переигрывать';
  else{const L=STORY[done<STORY.length?STORY.findIndex(l=>!SAVE.story.done.includes(l.gid)):0];$('storySub').textContent='Глава '+(L.ch+1)+' «'+CHAPTERS[L.ch].name+'» · '+CHAPTERS[L.ch].levels.filter(l=>SAVE.story.done.includes(l.gid)).length+'/20';}
  $('bestText').textContent=SAVE.best.score>0?'Рекорд: волна '+SAVE.best.wave+' · '+fmt(SAVE.best.score)+' очк.':'Рекорда пока нет — поставь первый';
  $('chestBadge').hidden=!(SAVE.tokens>=100||SAVE.btokens>=10);
  document.querySelectorAll('.purse').forEach(e=>e.innerHTML=purseHTML());
}
function toMenu(){
  if(['play','paused','dying'].includes(S.mode))bankCoins();
  S.mode='menu'; S.night=false; $('hud').hidden=true; ['pause','over','win','brief'].forEach(i=>$(i).hidden=true); $('menu').hidden=false;
  if(MAP!=='yard')buildWorld('yard');
  P=newPlayer(); makeAllies(); enemies=[];bullets=[];nades=[];bombs=[];pickups=[];texts=[];parts=[];holes=[];zones=[];
  refreshMenu();
}
function demoEnemies(){
  const add=(type,dx,dy,face)=>{const T=ETYPE[type];const e={type,x:P.x+dx,y:P.y+dy,r:T.r,hp:1,max:1,face,ang:face>0?0:Math.PI,phase:0,moving:false,flash:0,st:'walk',stun:0};
    if(type==='hen'){e.body=T.cols[0][0];e.wing=T.cols[0][1];} enemies.push(e);};
  add('fox',-150,30,1); add('hen',160,-20,-1); add('turkey',120,90,-1); add('crow',-90,-110,1); add('raccoon',-170,120,1);
}
function pauseGame(){if(S.mode!=='play')return;S.mode='paused';$('pause').hidden=false;sticks.move=sticks.aim=null;input.firing=false;}
function resumeGame(){if(S.mode!=='paused')return;S.mode='play';$('pause').hidden=true;last=performance.now();}
function gameOver(){
  S.mode='over'; $('hud').hidden=true;
  bankCoins();
  let rec=false;
  if(S.kind==='endless'){rec=S.score>SAVE.best.score; if(rec){SAVE.best={score:S.score,wave:S.wave};persist();}}
  $('oScore').textContent=fmt(S.score); $('oKills').textContent=S.kills;
  if(S.kind==='story'){$('oWave').textContent=S.lvIdx+1;$('oWaveL').textContent='Уровень';$('overLead').textContent='Уровень «'+S.L.name+'» не пройден. Попробуй ещё раз!';}
  else{$('oWave').textContent=S.wave;$('oWaveL').textContent='Волна';$('overLead').textContent='Курятник пал на волне '+S.wave+'.';}
  $('overEarn').innerHTML='Заработано: <i class="coin"></i>'+S.coins+' зёрен · <i class="tok"></i>'+S.tokens+' жетонов';
  $('oRec').hidden=!rec; $('over').hidden=false;
}
function victory(){
  if(S.mode!=='play')return;
  S.mode='won'; S.winT=1.4; SFX.win(); P.buff=null; P.inv=99;
  for(const e of enemies){if(!e.dead){puff(e.x,e.y,'#ffffff',6,1);e.dead=true;}} S.cleanup=true;
  holes.forEach(h=>{if(h.state!=='close'){h.state='close';h.ct=0;}});
  $('bossBar').hidden=true; S.boss=null;
  showBanner('Победа!',S.L.name); sticks.move=sticks.aim=null; input.firing=false;
}
function showWin(){
  S.mode='result'; $('hud').hidden=true;
  const i=S.lvIdx, L=S.L, first=!SAVE.story.done.includes(i);
  const lc=first?L.coins:Math.round(L.coins*.4), lt=first?L.tokens:Math.round(L.tokens*.5);
  bankCoins();
  SAVE.coins+=lc; SAVE.tokens+=lt; const le=first?L.eggs:0; SAVE.eggs+=le;
  let big=false; if(SAVE.bigDay!==today()){SAVE.bigDay=today();SAVE.btokens+=1;big=true;}
  if(first)SAVE.story.done.push(i);
  persist();
  $('winEyebrow').textContent='Глава '+(L.ch+1)+' · уровень '+(L.i+1)+' из 20';
  $('winLead').textContent=L.i===19&&first?CHAPTERS[L.ch].outro:'«'+L.name+'» пройден.';
  const R=$('winRewards'); R.innerHTML='';
  const row=(html,sub,d)=>{const r=mk('div','rw',html+(sub?'<small>'+sub+'</small>':''));r.style.animationDelay=d+'s';R.appendChild(r);};
  row('<i class="coin"></i>+'+(lc+S.coins)+' зёрен',first?'награда за первое прохождение':'повторное прохождение',0);
  row('<i class="tok"></i>+'+(lt+S.tokens)+' жетонов','на обычный сундук: '+Math.min(SAVE.tokens,100)+'/100',.12);
  if(le)row('<i class="gegg"></i>+'+le+' золотых яиц','только за первое прохождение',.18);
  if(big)row('<i class="btok"></i>+1 большой жетон','на большой сундук: '+SAVE.btokens+'/10 · следующий завтра',.24);
  else row('<i class="btok"></i>Большой жетон уже получен сегодня','завтра пройди уровень ещё раз',.24);
  $('nextBtn').hidden=i>=STORY.length-1; $('nextBtn').textContent=L.i===19?'Глава '+(L.ch+2):'Уровень '+(L.i+2);
  if(L.i===19&&first)storyCh=-1;
  $('win').hidden=false; refreshMenu();
}
