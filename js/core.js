/* Базовые утилиты, холст, размер экрана, защита от зума на iOS */
const TAU=Math.PI*2, INK='#2b1d14';
const rand=(a,b)=>a+Math.random()*(b-a);
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const $=id=>document.getElementById(id);
const REDUCED=matchMedia('(prefers-reduced-motion: reduce)').matches;
const COARSE=matchMedia('(pointer: coarse)').matches;
/* Настройки: язык, громкость музыки и звуков, тряска экрана */
const SET=(()=>{const nl=(navigator.language||'ru').toLowerCase(),d={lang:/^(ru|uk|be|kk)/.test(nl)?'ru':'en',music:.6,sfx:.8,shake:true};
  try{const s=JSON.parse(localStorage.getItem('kur_set')||'null');if(s&&typeof s==='object'){if(s.lang==='ru'||s.lang==='en')d.lang=s.lang;
    if(typeof s.music==='number')d.music=Math.min(1,Math.max(0,s.music));if(typeof s.sfx==='number')d.sfx=Math.min(1,Math.max(0,s.sfx));if(typeof s.shake==='boolean')d.shake=s.shake;}}catch(e){}
  return d;})();
function saveSet(){try{localStorage.setItem('kur_set',JSON.stringify(SET));}catch(e){}}
const LANG=SET.lang;
document.documentElement.lang=LANG;
// _t('текст') — перевод строки интерфейса; словарь EN лежит в js/lang.js
function _t(s){return LANG==='en'&&typeof EN!=='undefined'&&EN[s]!==undefined?EN[s]:s;}

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
