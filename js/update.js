/* Игровой цикл: поток уровня, игрок, отряд, ИИ врагов и боссов, пули */
/* ---------- update ---------- */
function update(dt){
  S.t+=dt;
  if(S.mode==='play'||S.mode==='dying'||S.mode==='won'){
    if(S.mode==='play'){updatePlayer(dt);updateBuff(dt);updateAllies(dt);}
    if(S.mode!=='won')updateEnemies(dt);
    updateBullets(dt); updateNades(dt); updateBombs(dt);
    if(S.cleanup){S.cleanup=false;enemies=enemies.filter(e=>!e.dead);bullets=bullets.filter(b=>b.from==='p');bombs=bombs.filter(b=>b.from==='p');}
    if(S.mode==='play')updateFlow(dt);
    if(S.mode==='dying'){S.deadT-=dt;if(S.deadT<=0)gameOver();}
    if(S.mode==='won'){S.winT-=dt;if(Math.random()<dt*20)feathers(P.x+rand(-200,200),P.y+rand(-150,100),['#ffc93a','#fff','#e8322a','#7fd4ff'][Math.floor(Math.random()*4)],1,.4);if(S.winT<=0)showWin();}
  }
  updateParts(dt);
  S.shake*=Math.pow(.004,dt); if(S.shake<.1)S.shake=0;
  const vw=VW/SC,vh=VH/SC, tx=P.x-vw/2, ty=P.y-28-vh/2;
  const k=S.mode==='menu'?1:Math.min(1,dt*7);
  camX+=(tx-camX)*k; camY+=(ty-camY)*k;
  camX=vw<WW+80?clamp(camX,-40,WW-vw+40):(WW-vw)/2;
  camY=vh<WH+80?clamp(camY,-60,WH-vh+40):(WH-vh)/2;
}
let hudTick=0;
function updateFlow(dt){
  if(isWaves()){
    if(S.between>0){S.between-=dt;if(S.between<=0)startWave();}
    else{
      S.spawnT-=dt;
      if(S.spawnT<=0&&S.toSpawn>0&&enemies.length<Math.min(5+S.diff,14)){spawnEnemy(pickType());S.toSpawn--;S.spawnT=Math.max(.35,1.3-S.diff*.08);}
      if(S.toSpawn===0&&enemies.length===0&&S.wave>0){
        if(S.kind==='story'&&S.wave>=S.L.goal.n){victory();return;}
        S.between=3; const h=Math.min(20,P.max-P.hp); P.hp+=h;
        const bonus=5+S.wave*3; S.coins+=bonus; S.tokens+=3;
        showBanner('Двор чист!','+'+bonus+' зёрен · +3 жетона'+(h>0?' · +'+Math.round(h)+' здоровья':'')); SFX.pick(); updateHUD();
      }
    }
  } else {
    const g=S.L.goal;
    if(S.between>0){S.between-=dt;if(S.between<=0){S.running=true;showBanner(S.L.name,goalLabel(true));SFX.wave();if(g.type==='boss')spawnBoss(g.boss);}}
    else if(S.running){
      S.spawnT-=dt;
      const cap=g.type==='boss'?Math.min(2+Math.floor(S.diff/2),6):Math.min(Math.round(4+S.diff),13);
      const alive=enemies.filter(e=>!ETYPE[e.type].boss).length;
      if(S.spawnT<=0&&alive<cap){spawnEnemy(pickType());S.spawnT=Math.max(.45,(g.type==='boss'?2.6:1.5)-S.diff*.08);}
      if(g.type==='survive'){S.survT-=dt;hudTick+=dt;if(hudTick>.25){hudTick=0;updateHUD();}if(S.survT<=0){S.survT=0;victory();return;}}
    }
  }
  if(S.comboT>0){S.comboT-=dt;if(S.comboT<=0){S.combo=0;updateHUD();}}
  for(let i=pickups.length-1;i>=0;i--){const p=pickups[i];p.t-=dt;p.ph+=dt;
    if(Math.hypot(p.x-P.x,p.y-P.y)<P.r+P.magnet){collect(p);pickups.splice(i,1);continue;}
    if(p.t<=0)pickups.splice(i,1);}
}
let regenTick=0;
function updatePlayer(dt){
  let mx=0,my=0;
  if(sticks.move){const v=stickVal(sticks.move);mx=v.x;my=v.y;}
  const K=input.keys;
  if(K.KeyA||K.ArrowLeft)mx-=1; if(K.KeyD||K.ArrowRight)mx+=1; if(K.KeyW||K.ArrowUp)my-=1; if(K.KeyS||K.ArrowDown)my+=1;
  let ml=Math.hypot(mx,my); if(ml>1){mx/=ml;my/=ml;ml=1;}
  if(ml<.12){mx=my=0;ml=0;}
  const ox=P.x, oy=P.y, spd=P.spd*(P.buff==='turbo'?2:P.buff==='adren'?1.4:1)*(P.w==='minigun'&&P.wasFiring?.72:1);
  P.x+=mx*spd*dt; P.y+=my*spd*dt; P.moving=ml>0; if(P.moving)P.phase+=dt*15*Math.max(.5,ml);
  let firing=false;
  if(sticks.aim){const a=stickVal(sticks.aim),m=Math.hypot(a.x,a.y);
    if(m>.2){P.ang=Math.atan2(a.y,a.x);firing=m>.38;}
    else{const t=nearestTarget();if(t){P.ang=Math.atan2(t.y-P.y,t.x-P.x);firing=true;}}
  }
  else if(input.mouse&&input.firing){const wx=camX+input.mx/SC,wy=camY+input.my/SC;P.ang=Math.atan2(wy-(P.y-19),wx-P.x);firing=true;}
  else if(pcAuto()){const t=nearestTarget();if(t){P.ang=Math.atan2(t.y-P.y,t.x-P.x);firing=true;}else if(P.moving)P.ang=Math.atan2(my,mx);
    else if(input.mouse){const wx=camX+input.mx/SC,wy=camY+input.my/SC;P.ang=Math.atan2(wy-(P.y-19),wx-P.x);}}
  else if(input.mouse){const wx=camX+input.mx/SC,wy=camY+input.my/SC;P.ang=Math.atan2(wy-(P.y-19),wx-P.x);}
  else if(P.moving)P.ang=Math.atan2(my,mx);
  P.face=Math.cos(P.ang)>=0?1:-1;
  for(const e of enemies){if(ETYPE[e.type].fly)continue;const dx=P.x-e.x,dy=P.y-e.y,d=Math.hypot(dx,dy)||1,m=P.r+e.r;if(d<m){P.x+=dx/d*(m-d)*.5;P.y+=dy/d*(m-d)*.5;}}
  collideWorld(P);
  P.vx=(P.x-ox)/Math.max(dt,.001); P.vy=(P.y-oy)/Math.max(dt,.001);
  P.cd-=dt; if(P.inv>0)P.inv-=dt; if(P.flash>0)P.flash-=dt;
  if(P.medic&&P.hp<P.max){P.hp=Math.min(P.max,P.hp+2*dt);for(const a of allies)if(a.down<=0&&Math.hypot(a.x-P.x,a.y-P.y)<200)a.hp=Math.min(a.max,a.hp+3*dt);}
  else if(P.medic)for(const a of allies)if(a.down<=0&&Math.hypot(a.x-P.x,a.y-P.y)<200)a.hp=Math.min(a.max,a.hp+3*dt);
  if(P.regen&&S.t-P.lastHit>3&&P.hp<P.max){P.hp=Math.min(P.max,P.hp+P.regen*dt);regenTick+=dt;if(regenTick>.5){regenTick=0;updateHUD();if(Math.random()<.5)parts.push({k:'puff',x:P.x+rand(-10,10),y:P.y,z:rand(20,40),vx:0,vy:0,vz:30,t:0,max:.5,r:3,col:'#9cf27a'});}}
  if(firing&&P.cd<=0)shoot();
  if(!firing||P.w!=='minigun')P.spin=Math.max(0,(P.spin||0)-dt*1.4);
  P.wasFiring=firing;
  if(P.moving&&Math.random()<dt*8)puff(P.x-mx*8,P.y,'#e9dcc0',1,.5);
}
function bite(e,dmg,cd){
  if(e.bite>0)return; e.bite=cd; hitTarget(curTg,eDmg(dmg),e);
}
function startDash(e,tell,dur){const tg=curTg||P;e.st='tell';e.tellT=tell;const dx=tg.x-e.x,dy=tg.y-e.y,d=Math.hypot(dx,dy)||1;e.dx=dx/d;e.dy=dy/d;e.dashLen=dur;e.hitThis=false;}
function startAim(e,t){const tg=curTg||P;e.st='aim';e.tellT=t;const dx=tg.x-e.x,dy=tg.y-e.y,d=Math.hypot(dx,dy)||1;e.dx=dx/d;e.dy=dy/d;}
function updateEnemies(dt){
  const alive=P.alive;
  const gooseSlow=P.hid==='goose'&&hasP(5)&&alive;
  for(const e of enemies){
    if(e.dead)continue;
    const T=ETYPE[e.type];
    let tg=P;
    if(alive&&allies.length){e.tgT=(e.tgT||0)-dt;if(e.tgT<=0){e.tgT=.6;let best=null,bd=Math.hypot(P.x-e.x,P.y-e.y)*.75;
      for(const a of allies){if(a.down>0)continue;const da=Math.hypot(a.x-e.x,a.y-e.y);if(da<bd){bd=da;best=a;}}e.tgt=best;}
      if(e.tgt&&e.tgt.down<=0)tg=e.tgt;else e.tgt=null;}
    curTg=tg;
    const dx=tg.x-e.x,dy=tg.y-e.y,d=Math.hypot(dx,dy)||1;
    if(e.bite>0)e.bite-=dt;
    if(e.flash>0)e.flash-=dt;
    if(e.burn>0){e.burn-=dt;e.burnTick=(e.burnTick||0)-dt;
      if(Math.random()<dt*14)parts.push({k:'puff',x:e.x+rand(-8,8),y:e.y,z:rand(10,30)*(e.s||1),vx:0,vy:0,vz:50,t:0,max:.35,r:rand(2,4),col:Math.random()<.5?'#ff7a1a':'#ffd23a'});
      if(e.burnTick<=0){e.burnTick=.33;hitEnemy(e,e.burnDps*.33,0,0,true,0,true);if(e.dead)continue;}}
    let spdMul=1,noSep=false;
    if(e.chill>0){e.chill-=dt;spdMul*=.5;}
    if(e.stun>0){e.stun-=dt;e.moving=false;e.x+=e.kx*dt;e.y+=e.ky*dt;e.kx*=Math.pow(.002,dt);e.ky*=Math.pow(.002,dt);collideWorld(e,T.fly);continue;}
    let vx=0,vy=0;
    const see=alive&&(T.fly||los(e.x,e.y,tg.x,tg.y));
    if(!alive){vx=-dx/d*.4;vy=-dy/d*.4;}
    else if(e.st==='tell'){e.tellT-=dt*(e.chill>0?.6:1);spdMul=0;if(e.tellT<=0){e.st='dash';e.dashT=e.dashLen;}}
    else if(e.st==='aim'){
      spdMul=0;e.tellT-=dt;
      if(e.tellT>.18){e.dx=dx/d;e.dy=dy/d;}
      if(e.tellT<=0){e.st='walk';const a=Math.atan2(e.dy,e.dx);eBullet(e.x+e.dx*20,e.y+e.dy*20,a,T.bspd,eDmg(T.dmg),T.bul);e.ang=a;e.cd=rand(T.cd[0],T.cd[1]);e.type==='owl'?SFX.hoot():SFX.zap();}
    }
    else if(e.st==='dash'){
      noSep=true; const sp=(T.dash||520)*(e.chill>0?.6:1);
      e.x+=e.dx*sp*dt; e.y+=e.dy*sp*dt; e.dashT-=dt; e.phase+=dt*24; e.moving=true;
      if(!T.fly&&Math.random()<dt*30)puff(e.x,e.y,'#e9dcc0',1,.7);
      if(!e.hitThis&&d<e.r+tg.r+6){e.hitThis=true;hitTarget(tg,eDmg(T.melee||15),e);}
      if(e.dashT<=0){e.st='walk';e.cd=T.cd?rand(T.cd[0],T.cd[1]):rand(2,3);if(T.boss&&e.dashes>0){e.dashes--;startDash(e,.45,.55);}}
      collideWorld(e,T.fly); e.face=e.dx>=0?1:-1; continue;
    }
    else if(e.type==='fox'||e.type==='rat'||e.type==='wolf'){
      vx=dx/d;vy=dy/d; const z=Math.sin(S.t*5+e.phase)*(e.type==='rat'?.25:.45); vx+=-dy/d*z; vy+=dx/d*z;
      if(e.type==='wolf'){e.cd-=dt;if(d<170&&d>50&&e.cd<=0&&see)startDash(e,.32,.3);}
      if(d<e.r+tg.r+5)bite(e,T.melee,e.type==='rat'?.6:.75);
    } else if(e.type==='hen'||e.type==='ferret'||e.type==='robohen'||e.type==='owl'){
      const keep=(enemies.length<=3&&S.toSpawn===0)||(S.night&&d>NIGHT_R)?Math.min(T.keep,S.night?NIGHT_R-60:150):T.keep; // stragglers come to you
      if(!see||d>keep+50){vx=dx/d;vy=dy/d;} else if(d<keep-60){vx=-dx/d;vy=-dy/d;}
      vx+=-dy/d*e.strafe*.75; vy+=dx/d*e.strafe*.75;
      e.strafeT-=dt; if(e.strafeT<=0){e.strafe*=-1;e.strafeT=rand(1,2.8);}
      if(e.burst>0){e.burstT-=dt;if(e.burstT<=0){e.burstT=.12;e.burst--;enemyShoot(e,T,1,0,T.bul);}}
      e.cd-=dt; if(e.cd<=0){
        if(see&&d<T.range&&onScreen(e)){
          if(e.type==='hen'){enemyShoot(e,T,1);e.cd=rand(T.cd[0],T.cd[1])*Math.max(.6,1-(S.diff-1)*.04);}
          else if(e.type==='ferret'){e.burst=3;e.burstT=0;e.cd=rand(T.cd[0],T.cd[1]);}
          else{startAim(e,e.type==='owl'?.75:.55);e.cd=9;}
        } else e.cd=.3;
      }
    } else if(e.type==='turkey'){
      if(d>110){vx=dx/d;vy=dy/d;}
      if(d<e.r+tg.r+5)bite(e,T.melee,.9);
      e.cd-=dt; if(e.cd<=0){if(see&&d<T.range&&onScreen(e)){enemyShoot(e,T,3);e.cd=rand(T.cd[0],T.cd[1]);}else e.cd=.4;}
    } else if(e.type==='crow'||e.type==='eagle'){
      const want=e.type==='eagle'?210:175; vx=dx/d*(d-want)/55+(-dy/d)*e.strafe; vy=dy/d*(d-want)/55+(dx/d)*e.strafe;
      e.strafeT-=dt; if(e.strafeT<=0){e.strafe*=-1;e.strafeT=rand(2,4);}
      e.cd-=dt;
      if(e.cd<=0){
        if(!onScreen(e,0))e.cd=.4;
        else if(e.type==='crow'){const tx=P.x+P.vx*.5,ty=P.y+P.vy*.5;bombs.push({x:clamp(tx,FENCE+10,WW-FENCE-10),y:clamp(ty,FENCE+10,WH-FENCE-10),t:1.1,max:1.1,r:58,dmg:eDmg(T.dmg),from:'e'});SFX.caw();e.cd=rand(T.cd[0],T.cd[1])*Math.max(.6,1-(S.diff-1)*.03);}
        else{startDash(e,.55,.5);SFX.caw();}
      }
      noSep=true;
    } else if(e.type==='raccoon'){
      vx=dx/d;vy=dy/d; e.cd-=dt;
      if(d<240&&e.cd<=0&&see)startDash(e,.6,.42);
      if(d<e.r+tg.r+5)bite(e,10,.8);
    } else if(T.boss){
      const want=T.fly?220:(e.type==='gturkey'||e.type==='steelturkey')?170:200;
      if(d>want+40){vx=dx/d;vy=dy/d;}else if(d<want-60){vx=-dx/d*.6;vy=-dy/d*.6;}
      vx+=-dy/d*e.strafe*.5; vy+=dx/d*e.strafe*.5; e.strafeT-=dt; if(e.strafeT<=0){e.strafe*=-1;e.strafeT=rand(2,4);}
      if(d<e.r+tg.r+5)bite(e,T.melee,1);
      bossAI(e,T,dt,d);
      if(T.fly)noSep=true;
    }
    if(gooseSlow&&d<110)spdMul*=.7;
    if(!T.fly)for(const o of OBS){const ox=e.x-o.x,oy=e.y-o.y,od=Math.hypot(ox,oy);if(od<o.r+e.r+26){vx+=ox/od*.9;vy+=oy/od*.9;}}
    curTg=null;
    if(!noSep)for(const f of enemies){if(f===e||f.dead||ETYPE[f.type].fly)continue;const fx=e.x-f.x,fy=e.y-f.y,fd=Math.hypot(fx,fy)||1;if(fd<e.r+f.r+6){vx+=fx/fd*.8;vy+=fy/fd*.8;}}
    const l=Math.hypot(vx,vy); const spd=T.spd*(1+(S.diff-1)*.025)*spdMul;
    if(l>.05&&spd>0){const m=Math.min(1,l);vx=vx/l*spd*(T.fly?Math.max(.5,m):1);vy=vy/l*spd*(T.fly?Math.max(.5,m):1);e.moving=true;e.phase+=dt*(e.type==='fox'||e.type==='rat'||e.type==='wolf'?18:13);}else{vx=vy=0;e.moving=false;}
    if(T.fly)e.phase+=dt*10;
    e.x+=(vx+e.kx)*dt; e.y+=(vy+e.ky)*dt; e.kx*=Math.pow(.002,dt); e.ky*=Math.pow(.002,dt);
    if(e.st!=='tell'&&e.st!=='aim')e.face=dx>=0?1:-1; else if(e.st==='aim')e.face=e.dx>=0?1:-1;
    if(e.type!=='fox'&&e.st!=='aim'&&e.cd>.25)e.ang=Math.atan2(dy,dx);
    if(e.st==='aim')e.ang=Math.atan2(e.dy,e.dx);
    collideWorld(e,T.fly);
  }
  for(let i=enemies.length-1;i>=0;i--)if(enemies[i].dead)enemies.splice(i,1);
  curTg=null;
}
function bossAI(e,T,dt,d){
  const enr=e.hp<e.max*.5?.72:1, bul=T.bul||'egg';
  if(e.spin>0){e.spin-=dt;e.burstT-=dt;if(e.burstT<=0){e.burstT=.07;e.spinA+=.38;for(let k=0;k<2;k++){const a=e.spinA+k*Math.PI;eBullet(e.x+Math.cos(a)*30,e.y+Math.sin(a)*30,a,T.bspd*.85,eDmg(T.dmg),bul);}}return;}
  if(e.burst>0){e.burstT-=dt;if(e.burstT<=0){e.burstT=.3;e.burst--;enemyShoot(e,T,3,.16,bul);}return;}
  e.atkT-=dt; if(e.atkT>0)return;
  e.pat=(e.pat+1)%T.pats.length; e.atkT=2.3*enr;
  const p=T.pats[e.pat];
  if(p==='fan'){const base=Math.atan2(P.y-e.y,P.x-e.x);for(let i=0;i<9;i++){const a=base+(i-4)*.13;eBullet(e.x+Math.cos(a)*34,e.y+Math.sin(a)*34,a,T.bspd,eDmg(T.dmg),bul);}SFX.egg();}
  else if(p==='burst'){e.burst=3;e.burstT=0;}
  else if(p==='summon'){const n=e.type==='emperor'?3:2;for(let i=0;i<n;i++){const k=T.summon[Math.floor(Math.random()*T.summon.length)];makeEnemy(k,clamp(e.x+rand(-80,80),FENCE+30,WW-FENCE-30),clamp(e.y+rand(-60,60),FENCE+30,WH-FENCE-30));}ftext(e.x,e.y-90,T.taunt||'В атаку!','#fff',13);SFX.gobble();}
  else if(p==='dash'){e.dashes=1;startDash(e,.75,.55);}
  else if(p==='spiral'){e.spin=1.5;e.burstT=0;e.spinA=rand(0,TAU);}
  else if(p==='ring'){const off=rand(0,TAU);for(let i=0;i<18;i++){const a=off+i/18*TAU;eBullet(e.x+Math.cos(a)*30,e.y+Math.sin(a)*30,a,T.bspd*.9,eDmg(T.dmg),bul);}SFX.boom();}
  else if(p==='rain'){for(let i=0;i<5;i++){const a=rand(0,TAU),r=i===0?0:rand(50,140),tt=.9+i*.18;bombs.push({x:clamp(P.x+Math.cos(a)*r,FENCE+10,WW-FENCE-10),y:clamp(P.y+Math.sin(a)*r,FENCE+10,WH-FENCE-10),t:tt,max:tt,r:62,dmg:eDmg(T.dmg*1.5),from:'e'});}ftext(e.x,e.y-90,'Берегись неба!','#ffc93a',13);}
}
function updateBullets(dt){
  for(let i=bullets.length-1;i>=0;i--){
    const b=bullets[i]; if(!b)continue; b.x+=b.vx*dt; b.y+=b.vy*dt; b.life-=dt;
    let dead=b.life<=0||b.x<FENCE||b.x>WW-FENCE||b.y<FENCE||b.y>WH-FENCE;
    if(!dead)for(const o of OBS){if((b.x-o.x)**2+(b.y-o.y)**2<o.r*o.r){dead=true;
      if(b.from==='e'){splat(b.x,b.y,.7);}else puff(b.x,b.y,o.type==='hay'?'#f3d36e':o.type==='bush'?'#5f9e35':o.type==='rock'?'#b8b2a6':'#a87547',3,.6);break;}}
    if(!dead){
      if(b.from==='p'){for(const e of enemies){if(e.dead||(b.hits&&b.hits.includes(e.id)))continue;
        const er=e.r*(e.s?1:1);
        if((b.x-e.x)**2+(b.y-e.y)**2<(er+b.r)**2){const k=b.kind;hitEnemy(e,b.dmg,b.vx,b.vy,!b.ally,k==='flame'?.06:k==='ice'?.4:1,k==='flame');
          if(k==='flame'){e.burn=2.2;e.burnDps=9*P.dmgMul;}else if(k==='ice')e.chill=1.6;
          if(!b.ally&&WEAP[k]&&WEAP[k].heal)healHit(WEAP[k].heal);
          if(b.pierce>0){b.pierce--;b.hits.push(e.id);}else{dead=true;}break;}}}
      else if(P.alive){
        const d2=(b.x-P.x)**2+(b.y-P.y)**2;
        if(P.buff==='fort'&&d2<(P.r+34)**2){b.from='p';b.vx*=-1.15;b.vy*=-1.15;b.dmg=30*P.dmgMul;b.life=1.2;b.kind='refl';b.pierce=0;b.hits=null;puff(b.x,b.y,'#cfe8ff',2,.6);continue;}
        if(d2<(P.r+b.r-2)**2){hurtPlayer(b.dmg,'egg');splat(b.x,b.y,.8);dead=true;}
      }
      if(!dead&&b.from==='e')for(const a of allies){if(a.down>0)continue;if((b.x-a.x)**2+(b.y-a.y)**2<(a.r+b.r-2)**2){hurtAlly(a,b.dmg);splat(b.x,b.y,.6);dead=true;break;}}
    }
    if(dead)bullets.splice(i,1);
  }
}
function updateNades(dt){
  for(let i=nades.length-1;i>=0;i--){const n=nades[i];
    n.x+=n.vx*dt;n.y+=n.vy*dt;n.z+=n.vz*dt;n.vz-=720*dt;n.rot+=dt*(Math.hypot(n.vx,n.vy)/20);
    if(n.z<0){n.z=0;n.vz*=-.35;n.vx*=.55;n.vy*=.55;}
    for(const o of OBS){const dx=n.x-o.x,dy=n.y-o.y,d=Math.hypot(dx,dy)||1;if(d<o.r+5){n.x=o.x+dx/d*(o.r+5);n.y=o.y+dy/d*(o.r+5);const dot=(n.vx*dx+n.vy*dy)/d;n.vx-=1.6*dot*dx/d;n.vy-=1.6*dot*dy/d;}}
    n.x=clamp(n.x,FENCE+6,WW-FENCE-6);n.y=clamp(n.y,FENCE+6,WH-FENCE-6);
    n.t-=dt; if(n.t<=0){blast(n.x,n.y,130,110*P.dmgMul,true,true);nades.splice(i,1);}
  }
}
function updateBombs(dt){
  for(let i=bombs.length-1;i>=0;i--){const b=bombs[i];if(!b)continue;b.t-=dt;if(b.t<=0){bombs.splice(i,1);if(b.from==='e'&&S.mode!=='play')continue;blast(b.x,b.y,b.r,b.dmg,b.from==='p',false,b.heal||0);}}
}
function updateParts(dt){
  for(let i=parts.length-1;i>=0;i--){const p=parts[i];p.t+=dt;
    if(p.k==='feather'){p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;p.vz=Math.max(p.vz-320*dt,-34);p.vx*=Math.pow(.3,dt);p.vy*=Math.pow(.3,dt);p.x+=Math.sin(p.t*7+p.rot)*14*dt;p.rot+=p.vr*dt;if(p.z<0){p.z=0;p.vz=0;p.vr=0;}}
    else if(p.k==='puff'){p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;}
    else if(p.k==='shell'){p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;p.vz-=700*dt;p.rot+=p.vr*dt;if(p.z<0){p.z=0;p.vz*=-.3;p.vx*=.5;p.vy*=.5;p.vr*=.5;}}
    if(p.t>=p.max)parts.splice(i,1);
  }
  if(parts.length>520)parts.splice(0,parts.length-520);
  for(let i=texts.length-1;i>=0;i--){const t=texts[i];t.t+=dt;t.y-=40*dt;t.x+=t.vx*dt;if(t.t>=t.max)texts.splice(i,1);}
}
