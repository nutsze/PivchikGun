/* Базовые утилиты, холст, размер экрана, защита от зума на iOS */
const GAME_VERSION='0.1'; // версия игры: показывается в меню, паузе и окне «Как играть»
const TAU=Math.PI*2, INK='#2b1d14';
const rand=(a,b)=>a+Math.random()*(b-a);
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const $=id=>document.getElementById(id);
const REDUCED=matchMedia('(prefers-reduced-motion: reduce)').matches;
const COARSE=matchMedia('(pointer: coarse)').matches;

const cv=$('cv'), ctx=cv.getContext('2d');
let DPR=1,VW=0,VH=0,SC=1;
function resize(){
  DPR=Math.min(2,window.devicePixelRatio||1); VW=window.innerWidth; VH=window.innerHeight;
  cv.width=Math.round(VW*DPR); cv.height=Math.round(VH*DPR);
  cv.style.width=VW+'px'; cv.style.height=VH+'px';
  SC=clamp(Math.min(VW,VH)/500,.58,1.3);
}
addEventListener('resize',resize); resize();
addEventListener('orientationchange',()=>{setTimeout(resize,250);});
if(window.visualViewport)visualViewport.addEventListener('resize',resize);
['gesturestart','gesturechange','gestureend'].forEach(t=>document.addEventListener(t,e=>e.preventDefault(),{passive:false}));
document.addEventListener('touchmove',e=>{if(!e.target.closest('.ov,.pbody,.tabs'))e.preventDefault();},{passive:false});
document.addEventListener('dblclick',e=>e.preventDefault(),{passive:false});
cv.addEventListener('touchstart',e=>e.preventDefault(),{passive:false});
$('hud').addEventListener('touchstart',e=>{if(e.target.closest('button'))e.preventDefault();},{passive:false});
