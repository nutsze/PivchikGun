/* Запуск игры и главный цикл кадров */
/* ---------- loop ---------- */
function verLabels(){
  const tag=PATCH_NOTES[0].tag;
  document.querySelectorAll('[data-ver]').forEach(e=>e.textContent='v'+GAME_VERSION+(tag?' '+tag:''));
  document.querySelectorAll('[data-ver-long]').forEach(e=>e.textContent=_t('Версия ')+GAME_VERSION+(tag?' ('+tag+')':''));
}
applyLang(); verLabels();
if(SAVE.refundMsg){const [rc,re]=SAVE.refundMsg;delete SAVE.refundMsg;persist();setTimeout(()=>toast(_t('Скины теперь у каждого героя свои — вернули за покупки: ')+(rc?fmt(rc)+_t(' зёрен'):'')+(rc&&re?', ':'')+(re?re+_t(' золотых яиц'):'')),800);}
// звук и музыка включаются с первого касания или клавиши (браузеры не дают играть звук без жеста)
['pointerdown','touchend','keydown'].forEach(ev=>addEventListener(ev,()=>initAudio(),{passive:true}));
buildWorld(menuMap()); P=newPlayer(); toMenu();
let last=performance.now();
function frame(now){
  let dt=(now-last)/1000; last=now; if(dt>.05)dt=.05; if(dt<0)dt=0;
  try{
  if(S.mode!=='paused')update(dt);
  if(S.mode==='menu'){for(const e of enemies){e.phase+=dt*3;e.ang=Math.atan2(P.y-e.y,P.x-e.x)+Math.sin(S.t+e.x)*.1;} P.ang=Math.sin(S.t*.8)*.6+(Math.sin(S.t*.3)>0?0:Math.PI);P.face=Math.cos(P.ang)>=0?1:-1;}
  if(S.mode==='play')updateUltUI();
  if(S.boss&&S.boss.dead){S.boss=null;$('bossBar').hidden=true;if(S.mode==='play')music('battle');}
  render();
  drawChestAnim(dt);
  }catch(err){console.error(err);}
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
