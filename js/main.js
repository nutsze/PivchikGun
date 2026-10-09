/* Запуск игры и главный цикл кадров */
/* ---------- loop ---------- */
document.querySelectorAll('[data-ver]').forEach(e=>e.textContent='v'+GAME_VERSION);
document.querySelectorAll('[data-ver-long]').forEach(e=>e.textContent='Версия '+GAME_VERSION);
buildWorld(); P=newPlayer(); toMenu();
let last=performance.now();
function frame(now){
  let dt=(now-last)/1000; last=now; if(dt>.05)dt=.05; if(dt<0)dt=0;
  try{
  if(S.mode!=='paused')update(dt);
  if(S.mode==='menu'){for(const e of enemies){e.phase+=dt*3;e.ang=Math.atan2(P.y-e.y,P.x-e.x)+Math.sin(S.t+e.x)*.1;} P.ang=Math.sin(S.t*.8)*.6+(Math.sin(S.t*.3)>0?0:Math.PI);P.face=Math.cos(P.ang)>=0?1:-1;}
  if(S.mode==='play')updateUltUI();
  if(S.boss&&S.boss.dead){S.boss=null;$('bossBar').hidden=true;}
  render();
  drawChestAnim(dt);
  }catch(err){console.error(err);}
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
