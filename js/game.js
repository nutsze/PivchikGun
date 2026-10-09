/* Бой: спавн, урон, оружие, гранаты, ульты */
/* ---------- helpers ---------- */
function collideWorld(e,noObs){
  if(!noObs)for(const o of OBS){const dx=e.x-o.x,dy=e.y-o.y,d=Math.hypot(dx,dy)||1,m=o.r+e.r*.85;if(d<m){e.x=o.x+dx/d*m;e.y=o.y+dy/d*m;}}
  e.x=clamp(e.x,FENCE+e.r+6,WW-FENCE-e.r-6); e.y=clamp(e.y,FENCE+e.r+12,WH-FENCE-e.r-4);
  if(!noObs&&RIVER&&e._px!==undefined)waterBlock(e,e._px,e._py);
}
function onScreen(e,m=24){const vw=VW/SC,vh=VH/SC;return e.x>camX+m&&e.x<camX+vw-m&&e.y>camY+m+30&&e.y<camY+vh-m+10;}
function nearestTarget(){let bt=null,bd=1e9;for(const e of enemies){if(e.dead||!onScreen(e,0))continue;const d=Math.hypot(e.x-P.x,e.y-P.y);if(S.night&&d>NIGHT_R+20)continue;if(d<bd&&(ETYPE[e.type].fly||los(P.x,P.y,e.x,e.y))){bd=d;bt=e;}}return bt;}
function los(ax,ay,bx,by){
  const vx=bx-ax,vy=by-ay,l2=vx*vx+vy*vy||1;
  for(const o of OBS){let t=clamp(((o.x-ax)*vx+(o.y-ay)*vy)/l2,0,1);const px=ax+vx*t-o.x,py=ay+vy*t-o.y;if(px*px+py*py<(o.r*.85)**2)return false;}
  return true;
}
function feathers(x,y,col,n,force=1){for(let i=0;i<n;i++){const a=rand(0,TAU),sp=rand(40,160)*force;
  parts.push({k:'feather',x,y,z:rand(14,30),vx:Math.cos(a)*sp,vy:Math.sin(a)*sp*.6,vz:rand(60,170)*force,rot:rand(0,TAU),vr:rand(-8,8),t:0,max:rand(1.2,2.2),col});}}
function puff(x,y,col,n,size=1){for(let i=0;i<n;i++){const a=rand(0,TAU),sp=rand(10,60);
  parts.push({k:'puff',x:x+rand(-4,4),y,z:rand(4,20),vx:Math.cos(a)*sp,vy:Math.sin(a)*sp*.5,vz:rand(10,40),t:0,max:rand(.35,.7),r:rand(5,10)*size,col});}}
function splat(x,y,size=1){parts.push({k:'splat',x,y,t:0,max:3,r:rand(8,12)*size,seed:Math.random()});}
function ring(x,y,col,R=130,max=.35){parts.push({k:'ring',x,y,t:0,max,R,col});}
function ftext(x,y,txt,col='#fff',size=15){texts.push({x,y,txt,col,size,t:0,max:.8,vx:rand(-15,15)});}

/* ---------- game flow ---------- */
function startGame(kind='endless',idx=0){
  const mk2=kind==='story'?MAP_OF_CH[STORY[idx].ch]:'yard'; buildWorld(mk2); lastBridge=null;
  P=newPlayer(); makeAllies(); enemies=[];bullets=[];parts=[];pickups=[];nades=[];bombs=[];texts=[];holes=[];zones=[];S.holeT=rand(8,12);
  const L=kind==='story'?STORY[idx]:null;
  Object.assign(S,{mode:'play',kind,lvIdx:idx,L,diff:L?L.diff:1,night:!!(L&&L.night),t:0,score:0,wave:0,toSpawn:0,spawnT:0,between:1.2,running:false,kills:0,goalKills:0,
    survT:L&&L.goal.type==='survive'?L.goal.t:0,boss:null,shake:0,combo:0,comboT:0,deadT:0,winT:0,coins:0,tokens:0,banked:false});
  sticks.move=sticks.aim=null;
  closePanels(); ['menu','over','pause','win','brief','chestOv'].forEach(i=>$(i).hidden=true); $('hud').hidden=false; $('bossBar').hidden=true;
  if(L)showBanner('Глава '+(L.ch+1)+' · '+(L.i+1)+'/20',L.name);
  updateHUD();
}
const isWaves=()=>S.kind==='endless'||S.L.goal.type==='waves';
function bankCoins(){ if(S.banked)return; S.banked=true; SAVE.coins+=S.coins; SAVE.tokens+=S.tokens; persist(); }
function startWave(){
  S.wave++;
  if(holesOn()){spawnHole();if(S.diff>=5)spawnHole();}
  if(S.kind==='endless'){const ms={10:5,15:10,20:15}[S.wave];if(ms&&!SAVE.eggMs['w'+S.wave]){SAVE.eggMs['w'+S.wave]=1;SAVE.eggs+=ms;persist();const w=S.wave;setTimeout(()=>toast('Волна '+w+' впервые! +'+ms+' золотых яиц'),900);}}
  if(S.kind==='endless')S.diff=S.wave;
  S.toSpawn=S.kind==='endless'?Math.min(4+S.wave*2,40):Math.min(Math.round(4+S.diff+S.wave*2),28); S.spawnT=.6;
  const sub=S.kind==='story'?'Волна '+S.wave+' из '+S.L.goal.n:(S.wave===1?'Защити курятник!':S.wave===2?'Лисы почуяли запах':S.wave===3?'Пришли индюки':S.wave===4?'Вороны в небе!':S.wave===5?'Еноты вышли на охоту':'Врагов всё больше');
  showBanner(S.kind==='story'?S.L.name:'Волна '+S.wave, sub);
  SFX.wave();
  if(S.wave>1){spawnPickupNear(['shotgun','smg','nade'][S.wave%3]); if(P.hid==='hen'&&hasP(5)){P.nades=Math.min(6,P.nades+1);ftext(P.x,P.y-50,'+1 яйцо','#ffc93a',14);}}
  updateHUD();
}
function spawnPickupNear(kind){
  for(let i=0;i<30;i++){const a=rand(0,TAU),d=rand(140,320);const x=P.x+Math.cos(a)*d,y=P.y+Math.sin(a)*d;
    if(x<FENCE+40||x>WW-FENCE-40||y<FENCE+40||y>WH-FENCE-40)continue;
    if(OBS.some(o=>Math.hypot(o.x-x,o.y-y)<o.r+24)||nearWater(x,y,24))continue;
    pickups.push({x,y,kind,t:16,ph:rand(0,6)});return;}
}
function pickFrom(mix){let tot=0;for(const k in mix)tot+=mix[k];let r=Math.random()*tot;for(const k in mix){r-=mix[k];if(r<=0)return k;}return Object.keys(mix)[0];}
function pickType(){
  if(S.kind==='story')return pickFrom(S.L.mix);
  const w=S.wave,mix={hen:1};
  if(w>=2){mix.fox=.35+w*.05;mix.rat=.2+w*.03;} if(w>=3)mix.turkey=.12+w*.035; if(w>=4)mix.crow=.25+w*.03; if(w>=5)mix.raccoon=.2+w*.03;
  if(w>=6)mix.wolf=.2+w*.03; if(w>=7)mix.owl=.15+w*.02; if(w>=8)mix.ferret=.2+w*.02; if(w>=9)mix.robohen=.15+w*.02; if(w>=10)mix.eagle=.12+w*.02;
  return pickFrom(mix);
}
function edgePoint(r){
  let x,y;
  for(let i=0;i<25;i++){
    const side=Math.floor(Math.random()*4),m=FENCE+30;
    x=side<2?rand(m,WW-m):side===2?m:WW-m; y=side>=2?rand(m,WH-m):side===0?m+10:WH-m;
    if(Math.hypot(x-P.x,y-P.y)>430&&!OBS.some(o=>Math.hypot(o.x-x,o.y-y)<o.r+r)&&!nearWater(x,y,r+16))break;
  }
  return [x,y];
}
function makeEnemy(type,x,y){
  const T=ETYPE[type], hpMul=T.boss?1:1+(S.diff-1)*.07;
  const e={type,x,y,r:T.r,hp:T.hp*hpMul,max:T.hp*hpMul,cd:rand(1.2,2.2),face:1,ang:0,phase:rand(0,6),moving:false,flash:0,
    strafe:Math.random()<.5?1:-1,strafeT:rand(1,3),bite:0,kx:0,ky:0,id:Math.random(),stun:0,burn:0,chill:0,burnDps:0,st:'walk',tellT:0,dashT:0,dx:0,dy:0,atkT:2.5,pat:-1,spin:0,spinA:0,burst:0,burstT:0,dashes:0};
  if(type==='hen'){const c=T.cols[Math.floor(Math.random()*T.cols.length)];e.body=c[0];e.wing=c[1];}
  if(T.s)e.s=T.s;
  enemies.push(e); puff(x,y,'#e9dcc0',8,T.boss?2:1.2); return e;
}
function spawnEnemy(type){
  const T=ETYPE[type]; const [x,y]=edgePoint(T.r);
  if(type==='rat'){const n=3+Math.floor(Math.random()*2);for(let i=0;i<n;i++)makeEnemy('rat',clamp(x+rand(-30,30),FENCE+20,WW-FENCE-20),clamp(y+rand(-30,30),FENCE+20,WH-FENCE-20));}
  else makeEnemy(type,x,y);
}
function spawnBoss(type){
  const [x,y]=dryPoint(P.x<WW/2?WW-FENCE-180:FENCE+180, P.y<WH/2?WH-FENCE-180:FENCE+180);
  S.boss=makeEnemy(type,x,y); S.boss.atkT=2;
  $('bossName').textContent=ETYPE[type].name; $('bossBar').hidden=false; updateBoss();
  showBanner(ETYPE[type].name,'Босс вышел на поле!'); SFX.gobble(); S.shake+=10;
}
function updateBoss(){ if(!S.boss)return; $('bossFill').style.width=Math.max(0,S.boss.hp/S.boss.max*100)+'%'; }
function hurtPlayer(d,src){
  if(!P.alive||P.inv>0||S.mode!=='play')return;
  if(P.buff==='fort'){ftext(P.x,P.y-50,'Блок','#cfe8ff',13);return;}
  if(src==='egg'&&P.hid==='chick'&&hasP(5)&&Math.random()<.15){ftext(P.x,P.y-50,'Мимо!','#ffe27a',14);return;}
  if(P.hid==='guinea'&&hasP(5)&&src!=='self'&&Math.random()<.1){ftext(P.x,P.y-50,'Уклон!','#cfe8ff',14);return;}
  d*=1-P.armor;
  P.hp-=d; P.inv=.3; P.flash=.15; P.lastHit=S.t; S.shake+=7; SFX.hurt(); buzz(25);
  feathers(P.x,P.y,P.look.body,3,.8);
  if(P.hp<=0){
    if(P.revive){P.revive=false;P.hp=P.max*.5;P.inv=1.5;ring(P.x,P.y,'#9cf27a',140,.5);showBanner('Второе дыхание!','Утка снова в строю');SFX.ult();updateHUD();return;}
    P.hp=0;P.alive=false;S.mode='dying';S.deadT=1.3;feathers(P.x,P.y,P.look.body,30,1.4);puff(P.x,P.y,'#ffffff',12,1.6);SFX.dead();buzz(120);sticks.move=sticks.aim=null;input.firing=false;P.buff=null;
  }
  updateHUD();
}
function hurtAlly(a,d){
  if(a.down>0||S.mode!=='play')return;
  if(a.buff==='fort')return;
  d*=1-a.armor; a.hp-=d; a.flash=.12; a.lastHit=S.t; feathers(a.x,a.y,a.look.body,2,.7);
  if(a.hp<=0){a.hp=0;a.down=P.hid==='nurse'&&hasP(5)?9:18;a.buff=null;feathers(a.x,a.y,a.look.body,16,1.1);puff(a.x,a.y,'#ffffff',8,1.1);ftext(a.x,a.y-50,HEROES[a.id].name.split(' ')[0]+' выбит','#ffb3a3',12);SFX.hurt();}
}
function hitTarget(tg,d,e){
  if(!tg||tg===P){hurtPlayer(d,'melee');if(P.hid==='rooster'&&hasP(5)&&P.alive&&e)hitEnemy(e,20,e.x-P.x,e.y-P.y);}
  else hurtAlly(tg,d);
}
function updateAllies(dt){
  const n=allies.length;
  allies.forEach((a,i)=>{
    if(a.down>0){a.down-=dt;if(a.down<=0){a.hp=a.max;a.x=clamp(P.x+rand(-40,40),FENCE+30,WW-FENCE-30);a.y=clamp(P.y+rand(-40,40),FENCE+30,WH-FENCE-30);puff(a.x,a.y,'#ffffff',8,1);ftext(a.x,a.y-50,'Снова в бою!','#9cf27a',12);}return;}
    if(a.flash>0)a.flash-=dt;
    if(a.regen&&(a.cls==='medic'||S.t-a.lastHit>3))a.hp=Math.min(a.max,a.hp+a.regen*dt);
    if(a.cls==='medic'){const hm=a.id==='nurse'&&a.lv>=10?2:1;if(P.alive&&Math.hypot(P.x-a.x,P.y-a.y)<200)P.hp=Math.min(P.max,P.hp+3*hm*dt);for(const b2 of allies)if(b2!==a&&b2.down<=0&&Math.hypot(b2.x-a.x,b2.y-a.y)<200)b2.hp=Math.min(b2.max,b2.hp+3*hm*dt);}
    const oa=(i/Math.max(1,n))*TAU+Math.PI/2+S.t*.15, fx=P.x+Math.cos(oa)*62, fy=P.y+Math.sin(oa)*52;
    let vx=fx-a.x,vy=fy-a.y; const fd=Math.hypot(vx,vy)||1;
    if(fd>620){a.x=fx;a.y=fy;puff(a.x,a.y,'#ffffff',5,.8);return;}
    let t=null,bd=S.night?220:a.range;
    for(const e of enemies){if(e.dead)continue;const d=Math.hypot(e.x-a.x,e.y-a.y);if(d<bd&&(ETYPE[e.type].fly||los(a.x,a.y,e.x,e.y))){bd=d;t=e;}}
    a.cd-=dt;
    if(a.buff){a.buffT-=dt;
      if(a.buff==='storm')stormAt(a,dt,.85,a.dmgMul*.8,false);
      if(a.buff==='adren'){a.fireT-=dt;if(a.fireT<=0){a.fireT=.32;const off=rand(0,TAU);for(let k=0;k<8;k++){const an=off+k/8*TAU;bullets.push({x:a.x+Math.cos(an)*16,y:a.y+Math.sin(an)*16,vx:Math.cos(an)*500,vy:Math.sin(an)*500,r:5,dmg:13*a.dmgMul,from:'p',life:.5,max:.5,kind:'fire',pierce:0,hits:null,ally:true,owner:a});}}}
      if(a.buff==='turbo'&&Math.random()<dt*20)puff(a.x,a.y,'#ffe066',1,.5);
      if(a.buffT<=0)a.buff=null;}
    if(!a.buff&&a.ult>=100){const nearN=enemies.filter(e=>!e.dead&&Math.hypot(e.x-a.x,e.y-a.y)<260).length;
      const needHeal=a.cls==='medic'&&(P.hp<P.max*.6||allies.some(b=>b.down>0||b.hp<b.max*.5));
      if(nearN>=2||(S.boss&&nearN>=1)||needHeal)allyUlt(a);}
    if(t){a.ang=Math.atan2(t.y-a.y,t.x-a.x);
      if(a.cd<=0){allyFire(a,a.ang,t);}
    }
    else if(fd>8)a.ang=Math.atan2(vy,vx);
    const ox=a.x,oy=a.y; a._px=ox; a._py=oy;
    {const nt=navTarget(a,fx,fy);if(nt&&fd>40){vx=nt[0]-a.x;vy=nt[1]-a.y;const nd=Math.hypot(vx,vy)||1;vx=vx/nd*fd;vy=vy/nd*fd;}}
    if(fd>26){const sp=a.spd*(fd>180?1.35:1)*Math.min(1,fd/60)*(a.buff==='turbo'?1.8:1);a.x+=vx/fd*sp*dt;a.y+=vy/fd*sp*dt;a.moving=true;a.phase+=dt*15;}else a.moving=false;
    for(const e of enemies){if(e.dead||ETYPE[e.type].fly)continue;const dx=a.x-e.x,dy=a.y-e.y,d=Math.hypot(dx,dy)||1,m=a.r+e.r;if(d<m){a.x+=dx/d*(m-d)*.5;a.y+=dy/d*(m-d)*.5;}}
    for(const b2 of allies){if(b2===a||b2.down>0)continue;const dx=a.x-b2.x,dy=a.y-b2.y,d=Math.hypot(dx,dy)||1,m=a.r+b2.r;if(d<m){a.x+=dx/d*(m-d)*.5;a.y+=dy/d*(m-d)*.5;}}
    {const dx=a.x-P.x,dy=a.y-P.y,d=Math.hypot(dx,dy)||1,m=a.r+P.r;if(d<m){a.x+=dx/d*(m-d);a.y+=dy/d*(m-d);}}
    collideWorld(a);
    a.vx=(a.x-ox)/Math.max(dt,.001);a.vy=(a.y-oy)/Math.max(dt,.001);
    a.face=Math.cos(a.ang)>=0?1:-1;
  });
}
function addUlt(v){ if(!P||P.buff||!P.alive)return; P.ult=Math.min(100,P.ult+v*P.ultRate); }
function hitEnemy(e,d,vx,vy,fromP=true,kbMul=1,quiet=false){
  if(e.dead||e.emerge>0)return;
  let crit=false;
  if(fromP&&P.hid==='rooster'&&hasP(10)&&Math.random()<.15){d*=2;crit=true;}
  if(fromP&&P.hid==='adren'&&hasP(5)&&P.hp<P.max*.5)d*=1.3;
  if(fromP&&P.hid==='quail'&&hasP(5)&&Math.hypot(e.x-P.x,e.y-P.y)>250)d*=1.25;
  e.hp-=d; e.flash=.09; const l=Math.hypot(vx,vy)||1, kb=(ETYPE[e.type].boss?8:90)*kbMul; e.kx+=vx/l*kb; e.ky+=vy/l*kb;
  if(!quiet||crit){ftext(e.x,e.y-44*(e.s||1),crit?'КРИТ '+Math.round(d):Math.round(d),crit?'#ffc93a':'#fff',crit?16:13); SFX.hit();}
  if(fromP)addUlt(d*.16);
  if(!quiet&&Math.random()<.4)feathers(e.x,e.y,featherCol(e),1,.6);
  if(e===S.boss)updateBoss();
  if(e.hp<=0){if(e.kami){e.dead=true;kamiBoom(e,false);killEnemy(e,true);}else killEnemy(e);return;}
  // камикадзе: мелкий шанс, что раненый враг пойдёт на таран
  if(!e.kami&&!e.kamiRolled&&e.hp<e.max*.3){e.kamiRolled=true;const T=ETYPE[e.type];
    if(!T.boss&&!T.fly&&!e.emerge&&Math.random()<.14){e.kami=true;e.kamiT=4.5;e.st='walk';e.burst=0;ftext(e.x,e.y-60*(e.s||1),'КАМИКАДЗЕ!','#ff5a3c',14);SFX.fuse();}}
}
function featherCol(e){return {hen:e.body,fox:'#e8742a',turkey:'#6b4428',gturkey:'#6b4428',ataman:'#e8742a',crow:'#2e2a33',raccoon:'#8b8f98',rat:'#7d746c',wolf:'#7f8794',wolfboss:'#5d6470',owl:'#8a6a45',ferret:'#d8b48a',drferret:'#d8b48a',robohen:'#9aa3ad',steelturkey:'#9aa3ad',eagle:'#6b4a2b',eagleboss:'#5a3a1e',emperor:'#2a2238',badger:'#8d8f94',mole:'#6b5a52'}[e.type]||'#fff';}
function kamiBoom(e,contact){
  blast(e.x,e.y,78,eDmg(contact?24:18),false,false);
  for(const f of enemies){if(f===e||f.dead)continue;const d=Math.hypot(f.x-e.x,f.y-e.y);if(d<78+f.r*.5)hitEnemy(f,40*(1-d/110),f.x-e.x,f.y-e.y,true);}
  ring(e.x,e.y,'#ff7a1a',90,.4);puff(e.x,e.y,'#ff9a1f',10,1.6);
}
function killEnemy(e,force){
  if(e.dead&&!force)return;
  e.dead=true; S.kills++; S.combo++; S.comboT=2.4;
  const T=ETYPE[e.type];
  const mult=Math.min(4,1+Math.floor((S.combo-1)/3));
  const pts=T.score*mult; S.score+=pts; S.coins+=T.coin; S.tokens+=T.tok;
  ftext(e.x,e.y-56,'+'+pts,mult>1?'#ffc93a':'#fff',17);
  addUlt(5);
  if(P.hid==='adren'&&hasP(10)&&P.alive){P.hp=Math.min(P.max,P.hp+3);}
  if(P.hid==='quail'&&hasP(10)&&Math.hypot(e.x-P.x,e.y-P.y)>250)P.ult=Math.min(100,P.ult+10);
  const tp=e.type;
  if(['fox','ataman','wolf','wolfboss'].includes(tp)){puff(e.x,e.y,tp.startsWith('wolf')?'#b9bfc8':'#f09a55',14,T.boss?2.4:1.3);feathers(e.x,e.y,featherCol(e),6,1);SFX.yelp();}
  else if(['raccoon','rat','ferret','drferret','badger','mole'].includes(tp)){puff(e.x,e.y,'#c9c4bb',tp==='rat'?6:T.boss?24:12,T.boss?2.2:1);SFX.squeak();}
  else if(tp==='robohen'||tp==='steelturkey'){puff(e.x,e.y,'#c9d0d8',T.boss?26:12,T.boss?2.2:1.1);puff(e.x,e.y,'#ffc93a',6,.8);SFX.zap();}
  else{feathers(e.x,e.y,featherCol(e),T.boss?50:tp==='turkey'?26:18,T.boss?1.8:1.2);puff(e.x,e.y,'#ffffff',8,1.1);
    (tp==='crow'||tp==='eagle'||tp==='eagleboss'||tp==='emperor')?SFX.caw():tp==='owl'?SFX.hoot():(tp==='turkey'||tp==='gturkey')?SFX.gobble():SFX.cluck();}
  if(T.boss){S.shake+=18;SFX.boom();ring(e.x,e.y,'#fff6c8',200,.6);}
  const r=Math.random(), cornCh=.17*(P.hid==='hen'&&hasP(10)?1.5:1);
  if((e.type!=='rat'||Math.random()<.3)&&!nearWater(e.x,e.y,12)){
    if(r<cornCh)pickups.push({x:e.x,y:e.y,kind:'corn',t:12,ph:0});
    else if(r<cornCh+.09)pickups.push({x:e.x,y:e.y,kind:Math.random()<.5?'shotgun':'smg',t:12,ph:0});
    else if(r<cornCh+.15)pickups.push({x:e.x,y:e.y,kind:'nade',t:12,ph:0});
  }
  if(S.kind==='story'&&S.mode==='play'){
    const g=S.L.goal;
    if(g.type==='kill'&&(g.what==='any'||g.what===e.type)){S.goalKills++;if(S.goalKills>=g.n)victory();}
    if(g.type==='boss'&&e===S.boss){S.boss=null;$('bossBar').hidden=true;victory();}
  }
  updateHUD();
}
function aimAssist(ang){
  let bestA=ang,bd=.26;
  for(const e of enemies){if(e.dead)continue;const dx=e.x-P.x,dy=e.y-P.y,d=Math.hypot(dx,dy);if(d>540)continue;
    const a=Math.atan2(dy,dx);let df=Math.abs(((a-ang+Math.PI*3)%TAU)-Math.PI);if(df<bd&&(ETYPE[e.type].fly||los(P.x,P.y,e.x,e.y))){bd=df;bestA=a;}}
  return bestA;
}
function pBullet(x,y,a,sp,dmg,r,life,kind,pierce=0){bullets.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,r,dmg,from:'p',life,max:life,kind,pierce,hits:pierce?[]:null});}
function shoot(){
  const W=WEAP[P.w]; const rm=P.rateMul*(P.buff==='turbo'?2:1);
  let rate=W.rate; if(W.special==='mini'){P.spin=Math.min(1,(P.spin||0)+.09);rate=.22-(.22-W.rate)*P.spin;}
  P.cd=rate/rm;
  let ang=input.mouse?P.ang:aimAssist(P.ang); P.ang=ang;
  if(W.special==='rail'){fireRail(ang);}
  else if(W.special==='mortar'){
    let tx,ty; const t=nearestTarget();
    if(input.mouse&&input.firing){tx=camX+input.mx/SC;ty=camY+input.my/SC;}
    else if(t){tx=t.x;ty=t.y;} else{tx=P.x+Math.cos(ang)*260;ty=P.y+Math.sin(ang)*260;}
    const d=Math.hypot(tx-P.x,ty-P.y); if(d>380){tx=P.x+(tx-P.x)/d*380;ty=P.y+(ty-P.y)/d*380;}
    bombs.push({x:clamp(tx,FENCE+10,WW-FENCE-10),y:clamp(ty,FENCE+10,WH-FENCE-10),t:.55,max:.55,r:72,dmg:W.dmg*P.dmgMul,from:'p',heal:W.heal||0,lob:true,sx:P.x,sy:P.y});
  } else {
    const kind=W.special==='flame'?'flame':W.special==='ice'?'ice':P.w;
    for(let i=0;i<W.pellets;i++){
      const a=ang+(Math.random()-.5)*W.spread, sp=W.spd*(W.pellets>1||kind==='flame'?rand(.85,1.12):1);
      pBullet(P.x+Math.cos(ang)*22,P.y+Math.sin(ang)*22,a,sp,W.dmg*P.dmgMul,kind==='flame'?7:W.pellets>1?3.5:(P.w==='sheriff'||P.w==='crossbow'||P.w==='cornrifle'?5:4.5),W.life*P.rangeMul*(W.pellets>1||kind==='flame'?rand(.8,1.1):1),kind,kind==='flame'?99:(W.pierce||0));
    }
  }
  if(W.special!=='flame'){const fl=(P.w==='shotgun'||P.w==='sawed'||P.w==='rail')?1.5:1;
    parts.push({k:'flash',x:P.x+Math.cos(ang)*28*fl,y:P.y+Math.sin(ang)*28*fl,z:19,t:0,max:.06,a:ang,s:fl});}
  SFX[W.sfx](); S.shake+=W.kick*.5; P.x-=Math.cos(ang)*W.kick*.6; P.y-=Math.sin(ang)*W.kick*.6;
  if(P.ammo!==Infinity){P.ammo--; if(P.ammo<=0){P.w=P.prim;P.ammo=Infinity;ftext(P.x,P.y-50,'Патроны кончились','#ffc93a',13);}}
  updateHUD();
}
function fireRail(ang){fireBeam(P.x,P.y,ang,WEAP.rail.dmg*P.dmgMul,true);}
function fireBeam(sx,sy,ang,dmg,fromP,owner){
  const ca=Math.cos(ang),sa=Math.sin(ang),x0=sx+ca*22,y0=sy+sa*22;
  let L=1000;
  if(ca>1e-4)L=Math.min(L,(WW-FENCE-x0)/ca); if(ca<-1e-4)L=Math.min(L,(FENCE-x0)/ca);
  if(sa>1e-4)L=Math.min(L,(WH-FENCE-y0)/sa); if(sa<-1e-4)L=Math.min(L,(FENCE-y0)/sa);
  L=Math.max(40,L);
  const x1=x0+ca*L,y1=y0+sa*L;
  for(const e of enemies.slice()){if(e.dead)continue;const t=clamp((e.x-x0)*ca+(e.y-y0)*sa,0,L);const px=x0+ca*t-e.x,py=y0+sa*t-e.y;
    if(px*px+py*py<(e.r+9)**2){hitEnemy(e,dmg,ca,sa,fromP,2);puff(e.x,e.y,'#bff4ff',4,.8);if(owner)owner.ult=Math.min(100,owner.ult+dmg*.08);}}
  parts.push({k:'beam',x:x0,y:y0,x2:x1,y2:y1,t:0,max:.3});
  for(let i=0;i<12;i++){const t=rand(0,L);parts.push({k:'puff',x:x0+ca*t,y:y0+sa*t,z:19,vx:rand(-20,20),vy:rand(-20,20),vz:rand(-10,20),t:0,max:rand(.25,.5),r:rand(2,4),col:'#bff4ff'});}
  SFX.rail();
}
function eBullet(x,y,a,sp,dmg,kind='egg'){bullets.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,r:kind==='fire'?6:kind==='rock'?7:kind==='pellet'?3.5:5,dmg,from:'e',life:2.4,kind});}
const eDmg=v=>v*(1+(S.diff-1)*.05);
function enemyShoot(e,T,spreadN,gap=.22,kind){
  const tg=curTg||P, lead=Math.hypot(tg.x-e.x,tg.y-e.y)/T.bspd*rand(.3,.9), vx=tg===P?(P.svx||0):(tg.vx||0), vy=tg===P?(P.svy||0):(tg.vy||0), tx=tg.x+vx*lead, ty=tg.y+vy*lead;
  const base=Math.atan2(ty-e.y,tx-e.x)+rand(-.07,.07);
  for(let i=0;i<spreadN;i++){const a=base+(i-(spreadN-1)/2)*gap;eBullet(e.x+Math.cos(a)*20,e.y+Math.sin(a)*20,a,T.bspd,eDmg(T.dmg),kind||T.bul||'egg');}
  e.ang=base; SFX.egg();
  parts.push({k:'flash',x:e.x+Math.cos(base)*26,y:e.y+Math.sin(base)*26,z:19,t:0,max:.05,a:base,s:.8});
}
function throwNade(){
  if(S.mode!=='play'||!P.alive||P.nades<=0)return;
  P.nades--; initAudio(); SFX.throw();
  let ang=P.ang,dist=240;
  if(input.mouse&&!pcAuto()){const wx=camX+input.mx/SC,wy=camY+input.my/SC;ang=Math.atan2(wy-P.y,wx-P.x);dist=clamp(Math.hypot(wx-P.x,wy-P.y),80,320);}
  else{const t=nearestTarget(); if(t){ang=Math.atan2(t.y-P.y,t.x-P.x);dist=clamp(Math.hypot(t.x-P.x,t.y-P.y),80,320);}else ang=aimAssist(ang);}
  const tt=.7;
  nades.push({x:P.x,y:P.y,z:24,vx:Math.cos(ang)*dist/tt,vy:Math.sin(ang)*dist/tt,vz:240,t:1.05,rot:0});
  updateHUD();
}
function healHit(v){
  if(!P||!P.alive||!v)return; P.hp=Math.min(P.max,P.hp+v);
  let best=null,bd=230;for(const a of allies){if(a.down>0||a.hp>=a.max)continue;const d=Math.hypot(a.x-P.x,a.y-P.y);if(d<bd){bd=d;best=a;}}
  if(best)best.hp=Math.min(best.max,best.hp+v);
  if(Math.random()<.25)parts.push({k:'puff',x:P.x+rand(-10,10),y:P.y,z:rand(20,40),vx:0,vy:0,vz:30,t:0,max:.5,r:3,col:'#9cf27a'});
}
function blast(x,y,R,dmg,fromP,selfDmg,heal=0){
  S.shake+=R>100?16:9; SFX.boom(); buzz(40);
  const n=R>100?16:9;
  for(let i=0;i<n;i++){const a=rand(0,TAU),sp=rand(60,260)*R/130;parts.push({k:'shell',x,y,z:10,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp*.6,vz:rand(120,300),rot:rand(0,TAU),vr:rand(-10,10),t:0,max:rand(.8,1.3)});}
  puff(x,y,'#fff7d6',R>100?18:10,R/60); puff(x,y,'#ffc93a',R>100?10:6,R/75);
  ring(x,y,fromP?'#fff6c8':'#ffb3a3',R,.35); splat(x,y,R/45);
  if(fromP){for(const e of enemies){if(e.dead)continue;const d=Math.hypot(e.x-x,e.y-y);if(d<R+e.r*.5){hitEnemy(e,Math.round(dmg*(1-d/(R*1.35))),e.x-x,e.y-y);if(heal)healHit(heal);if(!ETYPE[e.type].boss){e.kx+=(e.x-x)/(d||1)*260;e.ky+=(e.y-y)/(d||1)*260;}}}}
  const dp=Math.hypot(P.x-x,P.y-y);
  if(!fromP&&dp<R+P.r*.5)hurtPlayer(dmg,'bomb');
  if(!fromP)for(const a of allies)if(a.down<=0&&Math.hypot(a.x-x,a.y-y)<R+a.r*.5)hurtAlly(a,dmg*.7);
  if(fromP&&selfDmg&&dp<85)hurtPlayer(Math.round(18*(1-dp/110)),'self');
}
function collect(p){
  SFX.pick();
  if(p.kind==='corn'){const heal=P.hid==='hen'&&hasP(10)?60:30;const h=Math.min(heal,P.max-P.hp);P.hp=Math.min(P.max,P.hp+heal);ftext(P.x,P.y-50,'+'+Math.max(Math.round(h),0)+' здоровья','#7df05a',14);}
  else if(p.kind==='nade'){P.nades=Math.min(6,P.nades+1);ftext(P.x,P.y-50,'+1 яйцо','#ffc93a',14);}
  else{const W=WEAP[p.kind]; if(P.w===p.kind)P.ammo+=W.ammo; else{P.w=p.kind;P.ammo=W.ammo;} ftext(P.x,P.y-50,W.name,'#ffc93a',15);}
  updateHUD();
}

/* ---------- ultimates ---------- */
function useUlt(){
  if(S.mode!=='play'||!P.alive||P.ult<100||P.buff)return;
  P.ult=0; SFX.ult(); buzz(50);
  const id=P.hid, U=HEROES[id].ult[0];
  ftext(P.x,P.y-62,U.toUpperCase(),'#ffc93a',16);
  if(id==='hen'){
    const tg=enemies.filter(e=>!e.dead&&onScreen(e,0)).sort((a,b)=>Math.hypot(a.x-P.x,a.y-P.y)-Math.hypot(b.x-P.x,b.y-P.y)).slice(0,8);
    for(let i=0;i<8;i++){let x,y;const e=tg[i%Math.max(1,tg.length)];
      if(e&&i<Math.max(tg.length,4)){x=e.x+rand(-20,20);y=e.y+rand(-20,20);}else{const a=rand(0,TAU),d=rand(110,260);x=P.x+Math.cos(a)*d;y=P.y+Math.sin(a)*d;}
      const tt=.55+i*.12; bombs.push({x:clamp(x,FENCE+10,WW-FENCE-10),y:clamp(y,FENCE+10,WH-FENCE-10),t:tt,max:tt,r:85,dmg:70*P.dmgMul,from:'p'});}
  } else if(id==='chick'){P.buff='turbo';P.buffT=4;ring(P.x,P.y,'#ffe066',120,.4);}
  else if(id==='rooster'){
    showBanner('КУКАРЕКУ!',''); SFX.crow(); S.shake+=10;
    ring(P.x,P.y,'#ff6b4a',280,.5); ring(P.x,P.y,'#ffc93a',200,.4);
    for(const e of enemies){if(e.dead)continue;const d=Math.hypot(e.x-P.x,e.y-P.y);if(d<280){hitEnemy(e,45*P.dmgMul,e.x-P.x,e.y-P.y);e.stun=ETYPE[e.type].boss?.8:2.5;if(!ETYPE[e.type].boss){e.kx+=(e.x-P.x)/(d||1)*300;e.ky+=(e.y-P.y)/(d||1)*300;}}}
  } else if(id==='duck'){
    const h=Math.min(P.max*.5,P.max-P.hp); P.hp+=h; ftext(P.x,P.y-50,'+'+Math.round(h),'#7df05a',16);
    for(const a of allies)if(!a.down&&Math.hypot(a.x-P.x,a.y-P.y)<260)a.hp=Math.min(a.max,a.hp+a.max*.5);
    ring(P.x,P.y,'#7fd4ff',240,.5); ring(P.x,P.y,'#ffffff',160,.4);
    for(let i=bullets.length-1;i>=0;i--){const b=bullets[i];if(b.from==='e'&&Math.hypot(b.x-P.x,b.y-P.y)<340){puff(b.x,b.y,'#ffffff',2,.5);bullets.splice(i,1);}}
    for(const e of enemies){if(e.dead)continue;const d=Math.hypot(e.x-P.x,e.y-P.y);if(d<240){hitEnemy(e,30*P.dmgMul,e.x-P.x,e.y-P.y);if(!ETYPE[e.type].boss){e.kx+=(e.x-P.x)/(d||1)*420;e.ky+=(e.y-P.y)/(d||1)*420;}}}
  } else if(id==='goose'){P.buff='fort';P.buffT=5;ring(P.x,P.y,'#cfe8ff',100,.4);}
  else if(id==='quail'){const tg=enemies.filter(e=>!e.dead&&onScreen(e,0)).sort((a,b)=>b.hp-a.hp).slice(0,3);
    if(!tg.length)fireBeam(P.x,P.y,P.ang,200*P.dmgMul,true); tg.forEach(e=>fireBeam(P.x,P.y,Math.atan2(e.y-P.y,e.x-P.x),200*P.dmgMul,true)); S.shake+=8;}
  else if(id==='guinea'){P.buff='storm';P.buffT=4;ring(P.x,P.y,'#cfe8ff',120,.4);}
  else if(id==='nurse'){P.buff='hosp';P.buffT=6;zones.push({x:P.x,y:P.y,t:6,r:130});ring(P.x,P.y,'#9cf27a',140,.5);}
  else if(id==='adren'){P.buff='adren';P.buffT=6+(hasP(10)?2:0);P.fireT=0;ring(P.x,P.y,'#ff4d2e',200,.5);S.shake+=8;}
  updateHUD();
}
function updateBuff(dt){
  if(!P.buff)return;
  P.buffT-=dt;
  if(P.buff==='turbo'&&Math.random()<dt*30)puff(P.x,P.y,'#ffe066',1,.6);
  if(P.buff==='adren'){
    P.fireT-=dt; if(Math.random()<dt*25)parts.push({k:'puff',x:P.x+rand(-12,12),y:P.y,z:rand(5,40),vx:0,vy:0,vz:60,t:0,max:.4,r:rand(3,6),col:Math.random()<.5?'#ff7a1a':'#ffd23a'});
    if(P.fireT<=0){P.fireT=.28;const off=rand(0,TAU);for(let i=0;i<10;i++){const a=off+i/10*TAU;pBullet(P.x+Math.cos(a)*16,P.y+Math.sin(a)*16,a,520,16*P.dmgMul,5,.55,'fire');}SFX.pop();}
  }
  if(P.buff==='storm')stormAt(P,dt,1,P.dmgMul,true);
  if(P.buffT<=0){P.buff=null;updateHUD();}
}
function stormAt(c,dt,R,dmgMul,fromP){
  const rad=115*R;
  for(const e of enemies){if(e.dead)continue;const d=Math.hypot(e.x-c.x,e.y-c.y);if(d<rad+e.r){hitEnemy(e,70*dmgMul*dt,e.x-c.x,e.y-c.y,fromP,0,true);if(!ETYPE[e.type].boss){e.kx+=(e.x-c.x)/(d||1)*900*dt;e.ky+=(e.y-c.y)/(d||1)*900*dt;}}}
  for(let i=bullets.length-1;i>=0;i--){const b=bullets[i];if(b.from==='e'&&Math.hypot(b.x-c.x,b.y-c.y)<rad){puff(b.x,b.y,'#ffffff',1,.5);bullets.splice(i,1);}}
  if(Math.random()<dt*30){const a=rand(0,TAU);parts.push({k:'feather',x:c.x+Math.cos(a)*rad*.8,y:c.y+Math.sin(a)*rad*.4,z:rand(10,40),vx:-Math.sin(a)*160,vy:Math.cos(a)*70,vz:40,rot:rand(0,TAU),vr:10,t:0,max:.6,col:'#fff'});}
}
function updateZones(dt){
  for(let i=zones.length-1;i>=0;i--){const z=zones[i];z.t-=dt;
    const heal=25*dt*(P.medMul||1);
    if(P.alive&&Math.hypot(P.x-z.x,P.y-z.y)<z.r)P.hp=Math.min(P.max,P.hp+heal);
    for(const a of allies){if(Math.hypot(a.x-z.x,a.y-z.y)>z.r+400&&a.down<=0)continue;
      if(a.down>0){a.down=0;a.hp=a.max*.6;a.x=clamp(z.x+rand(-30,30),FENCE+30,WW-FENCE-30);a.y=clamp(z.y+rand(-20,20),FENCE+30,WH-FENCE-30);ftext(a.x,a.y-50,'Поднят!','#9cf27a',12);puff(a.x,a.y,'#9cf27a',6,1);}
      else if(Math.hypot(a.x-z.x,a.y-z.y)<z.r)a.hp=Math.min(a.max,a.hp+heal);}
    if(z.t<=0)zones.splice(i,1);}
}
/* ---------- оружие и ульты отряда ---------- */
function allyFire(a,ang,t){
  const W=WEAP[a.gun]||WEAP.pistol, turbo=a.buff==='turbo'?2:1;
  let rate=W.rate; if(W.special==='mini')rate=.09;
  a.cd=rate*1.25/(a.rateMul*turbo)*rand(.9,1.1);
  const dmg=W.dmg*a.dmgMul*.75;
  if(W.special==='rail'){fireBeam(a.x,a.y,ang,dmg,false,a);return;}
  if(W.special==='mortar'){let tx=t?t.x:a.x+Math.cos(ang)*260,ty=t?t.y:a.y+Math.sin(ang)*260;bombs.push({x:clamp(tx,FENCE+10,WW-FENCE-10),y:clamp(ty,FENCE+10,WH-FENCE-10),t:.55,max:.55,r:66,dmg,from:'p',lob:true,sx:a.x,sy:a.y,heal:W.heal||0});SFX.throw();return;}
  const kind=W.special==='flame'?'flame':W.special==='ice'?'ice':a.gun, multi=W.pellets>1||kind==='flame';
  for(let i=0;i<W.pellets;i++){const a2=ang+(Math.random()-.5)*W.spread,sp=W.spd*(multi?rand(.85,1.12):1),life=W.life*(a.cls==='sniper'?1.35:1)*(multi?rand(.8,1.1):1);
    bullets.push({x:a.x+Math.cos(ang)*20,y:a.y+Math.sin(ang)*20,vx:Math.cos(a2)*sp,vy:Math.sin(a2)*sp,r:kind==='flame'?7:W.pellets>1?3.5:4.2,dmg,from:'p',life,max:life,kind,
      pierce:kind==='flame'?99:(W.pierce||0),hits:(kind==='flame'||W.pierce)?[]:null,ally:true,owner:a});}
  if(kind!=='flame')parts.push({k:'flash',x:a.x+Math.cos(ang)*26,y:a.y+Math.sin(ang)*26,z:19,t:0,max:.05,a:ang,s:.8});
}
function allyUlt(a){
  a.ult=0; const H=HEROES[a.id], m=a.dmgMul;
  ftext(a.x,a.y-64,H.ult[0].toUpperCase(),'#ffc93a',13); SFX.ult();
  const near=enemies.filter(e=>!e.dead&&Math.hypot(e.x-a.x,e.y-a.y)<300);
  if(a.id==='hen'){near.slice(0,5).forEach((e,i)=>{const tt=.5+i*.12;bombs.push({x:e.x,y:e.y,t:tt,max:tt,r:75,dmg:55*m,from:'p'});});}
  else if(a.id==='chick'){a.buff='turbo';a.buffT=4;}
  else if(a.id==='rooster'){SFX.crow();ring(a.x,a.y,'#ff6b4a',220,.5);for(const e of near){if(Math.hypot(e.x-a.x,e.y-a.y)<220){hitEnemy(e,35*m,e.x-a.x,e.y-a.y,false);e.stun=ETYPE[e.type].boss?.6:2;}}}
  else if(a.id==='duck'){ring(a.x,a.y,'#7fd4ff',240,.5);if(Math.hypot(P.x-a.x,P.y-a.y)<240)P.hp=Math.min(P.max,P.hp+P.max*.4);for(const b of allies)if(b.down<=0&&Math.hypot(b.x-a.x,b.y-a.y)<240)b.hp=Math.min(b.max,b.hp+b.max*.4);
    for(let i=bullets.length-1;i>=0;i--){const b=bullets[i];if(b.from==='e'&&Math.hypot(b.x-a.x,b.y-a.y)<260)bullets.splice(i,1);}
    for(const e of near){const d=Math.hypot(e.x-a.x,e.y-a.y)||1;if(d<240&&!ETYPE[e.type].boss){e.kx+=(e.x-a.x)/d*380;e.ky+=(e.y-a.y)/d*380;}}}
  else if(a.id==='goose'){a.buff='fort';a.buffT=5;ring(a.x,a.y,'#cfe8ff',90,.4);}
  else if(a.id==='adren'){a.buff='adren';a.buffT=4;a.fireT=0;}
  else if(a.id==='quail'){near.sort((p,q)=>q.hp-p.hp).slice(0,2).forEach(e=>fireBeam(a.x,a.y,Math.atan2(e.y-a.y,e.x-a.x),160*m,false,null));}
  else if(a.id==='guinea'){a.buff='storm';a.buffT=3;}
  else if(a.id==='nurse'){zones.push({x:a.x,y:a.y,t:5,r:120});ring(a.x,a.y,'#9cf27a',130,.5);}
}


/* ---------- кротовые ямки ---------- */
const holesOn=()=>S.kind==='endless'?S.wave>=2:S.diff>=2;
function holeActive(){return isWaves()?(S.between<=0&&S.toSpawn>0):S.running;}
function spawnHole(){
  if(holes.filter(h=>h.state!=='close').length>=3)return;
  for(let i=0;i<30;i++){
    const a=rand(0,TAU),d=rand(170,420),x=P.x+Math.cos(a)*d,y=P.y+Math.sin(a)*d;
    if(x<FENCE+50||x>WW-FENCE-50||y<FENCE+60||y>WH-FENCE-50)continue;
    if(OBS.some(o=>Math.hypot(o.x-x,o.y-y)<o.r+40)||holes.some(h=>Math.hypot(h.x-x,h.y-y)<90)||nearWater(x,y,50))continue;
    holes.push({x,y,t:0,state:'dig',ct:0,life:rand(10,14),spawnT:rand(.8,1.6),made:0,max:2+(S.diff>6?1:0)});
    for(let k=0;k<14;k++){const an=rand(0,TAU),sp=rand(60,170);parts.push({k:'shell',x,y,z:6,vx:Math.cos(an)*sp,vy:Math.sin(an)*sp*.6,vz:rand(120,240),rot:rand(0,TAU),vr:rand(-8,8),t:0,max:rand(.6,1),dirt:true});}
    puff(x,y,'#9a6b3c',8,1.2); SFX.chest(); return;
  }
}
function updateHoles(dt){
  if(holesOn()&&holeActive()){S.holeT-=dt;if(S.holeT<=0){S.holeT=rand(14,20);spawnHole();}}
  const canSpawn=holeActive()&&enemies.length<16;
  for(let i=holes.length-1;i>=0;i--){const h=holes[i];h.t+=dt;
    if(h.state==='dig'&&h.t>.6)h.state='open';
    if(h.state==='open'){
      h.spawnT-=dt;
      if(h.spawnT<=0&&h.made<h.max&&canSpawn){const e=makeEnemy('mole',h.x,h.y);e.emerge=.6;e.cd=rand(1,1.8);h.made++;h.spawnT=rand(2.5,4);puff(h.x,h.y,'#9a6b3c',6,1);}
      if(h.t>h.life||(isWaves()&&S.toSpawn===0)||(h.made>=h.max&&h.spawnT<-1.5)){h.state='close';h.ct=0;}
    }
    if(h.state==='close'){h.ct+=dt;if(h.ct>1){holes.splice(i,1);puff(h.x,h.y,'#9a6b3c',4,.8);}}
  }
}
