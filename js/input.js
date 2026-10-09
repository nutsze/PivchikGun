/* Управление: стики, мышь, клавиатура */
/* ---------- input ---------- */
const input={mouse:false,mx:0,my:0,firing:false,keys:{}};
const sticks={move:null,aim:null};
const STICK_R=56;
function stickVal(s){let dx=s.x-s.ox,dy=s.y-s.oy;const l=Math.hypot(dx,dy);if(l>STICK_R){dx*=STICK_R/l;dy*=STICK_R/l;}return{x:dx/STICK_R,y:dy/STICK_R};}
cv.addEventListener('pointerdown',e=>{
  initAudio(); if(S.mode!=='play')return;
  if(e.pointerType==='mouse'){input.mouse=true;input.mx=e.clientX;input.my=e.clientY;if(e.button===2){throwNade();return;}input.firing=true;return;}
  input.mouse=false;
  const st={id:e.pointerId,ox:e.clientX,oy:e.clientY,x:e.clientX,y:e.clientY};
  if(e.clientX<VW/2){ if(!sticks.move)sticks.move=st; else if(!sticks.aim)sticks.aim=st; }
  else { if(!sticks.aim)sticks.aim=st; else if(!sticks.move)sticks.move=st; }
  try{cv.setPointerCapture(e.pointerId);}catch(_){}
  e.preventDefault();
});
cv.addEventListener('pointermove',e=>{
  if(e.pointerType==='mouse'){input.mouse=true;input.mx=e.clientX;input.my=e.clientY;return;}
  for(const k of ['move','aim']){const s=sticks[k]; if(s&&s.id===e.pointerId){s.x=e.clientX;s.y=e.clientY;
    const dx=s.x-s.ox,dy=s.y-s.oy,l=Math.hypot(dx,dy); if(l>STICK_R*1.4){const ex=l-STICK_R*1.4;s.ox+=dx/l*ex;s.oy+=dy/l*ex;}}}
});
function endPtr(e){
  if(e.pointerType==='mouse'){input.firing=false;return;}
  for(const k of ['move','aim'])if(sticks[k]&&sticks[k].id===e.pointerId)sticks[k]=null;
}
cv.addEventListener('pointerup',endPtr); cv.addEventListener('pointercancel',endPtr); cv.addEventListener('lostpointercapture',endPtr);
cv.addEventListener('contextmenu',e=>e.preventDefault());
addEventListener('keydown',e=>{input.keys[e.code]=true;
  if(S.mode==='play'){if(e.code==='KeyQ'||e.code==='KeyE'||e.code==='Space'){throwNade();e.preventDefault();} if(e.code==='KeyR')useUlt();}
  if(e.code==='KeyT')toggleAuto();
  if(e.code==='Escape'){if(anyPanel()){closePanels();refreshMenu();return;}}
  if(e.code==='Escape'||e.code==='KeyP'){if(S.mode==='play')pauseGame();else if(S.mode==='paused')resumeGame();}});
addEventListener('keyup',e=>{input.keys[e.code]=false;});
addEventListener('blur',()=>{input.keys={};input.firing=false;});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&S.mode==='play')pauseGame();});
