/* Синтезированные звуки и музыка (Web Audio): две шины — звуки и музыка, у каждой своя громкость */
/* ---------- audio ---------- */
let AC=null, noiseBuf=null, sfxBus=null, musBus=null;
function initAudio(){
  if(AC){ if(AC.state==='suspended')AC.resume(); return;}
  try{AC=new (window.AudioContext||window.webkitAudioContext)();}catch(e){AC=null;return;}
  sfxBus=AC.createGain(); musBus=AC.createGain(); sfxBus.connect(AC.destination); musBus.connect(AC.destination); applyVolume();
}
function applyVolume(){
  if(!AC)return; const t=AC.currentTime;
  sfxBus.gain.setTargetAtTime(muted?0:SET.sfx,t,.03);
  musBus.gain.setTargetAtTime(muted?0:SET.music*.55*MUS.duck,t,.08);
}
function _tone(bus,f,d,type,v,slide,t){ const o=AC.createOscillator(),g=AC.createGain();
  o.type=type; o.frequency.setValueAtTime(f,t); if(slide)o.frequency.exponentialRampToValueAtTime(slide,t+d);
  g.gain.setValueAtTime(v,t); g.gain.exponentialRampToValueAtTime(.001,t+d); o.connect(g).connect(bus); o.start(t); o.stop(t+d+.03);}
function _noise(bus,d,v,freq,t){ if(!noiseBuf){noiseBuf=AC.createBuffer(1,AC.sampleRate,AC.sampleRate);const a=noiseBuf.getChannelData(0);for(let i=0;i<a.length;i++)a[i]=Math.random()*2-1;}
  const s=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain(); s.buffer=noiseBuf; f.type='lowpass'; f.frequency.value=freq;
  g.gain.setValueAtTime(v,t); g.gain.exponentialRampToValueAtTime(.001,t+d); s.connect(f).connect(g).connect(bus); s.start(t,Math.random()*.5); s.stop(t+d+.02);}
function tone(f,d,type,v,slide,delay=0){ if(!AC||muted||SET.sfx<=0)return; _tone(sfxBus,f,d,type,v,slide,AC.currentTime+delay); }
function noise(d,v,freq){ if(!AC||muted||SET.sfx<=0)return; _noise(sfxBus,d,v,freq,AC.currentTime); }
let lastSmg=0;
const SFX={
  shot(){noise(.09,.22,2600);tone(260,.06,'square',.05,110);},
  shotgun(){noise(.22,.38,1500);tone(140,.12,'square',.06,60);},
  smg(){const n=performance.now(); if(n-lastSmg<60)return; lastSmg=n; noise(.05,.14,3800);},
  pop(){tone(900,.05,'square',.05,300);noise(.05,.12,2400);},
  meow(){tone(700,.09,'triangle',.06,1100);tone(1100,.16,'triangle',.05,520,.08);},
  egg(){tone(520,.08,'triangle',.05,260);},
  hit(){tone(880,.04,'square',.035,520);},
  cluck(){tone(620,.06,'square',.06,980);tone(760,.08,'square',.05,1150,.08);},
  caw(){tone(420,.14,'sawtooth',.06,300);},
  squeak(){tone(1600,.06,'square',.03,2200);},
  yelp(){tone(900,.12,'sawtooth',.05,500);},
  gobble(){tone(300,.05,'square',.06,420);tone(280,.05,'square',.06,420,.06);tone(260,.07,'square',.06,400,.12);},
  hurt(){tone(340,.16,'sawtooth',.07,130);},
  boom(){noise(.7,.5,520);tone(95,.45,'sine',.3,38);},
  pick(){tone(660,.07,'triangle',.08,990);tone(990,.09,'triangle',.07,1320,.07);},
  buy(){tone(784,.08,'square',.05);tone(1047,.08,'square',.05,0,.08);tone(1568,.14,'triangle',.06,0,.16);},
  wave(){tone(523,.12,'square',.05);tone(659,.12,'square',.05,0,.12);tone(784,.2,'square',.05,0,.24);},
  win(){[523,659,784,1047].forEach((f,i)=>tone(f,.18,'square',.05,0,i*.13));},
  ult(){tone(220,.4,'sawtooth',.07,880);noise(.3,.2,1800);},
  crow(){tone(500,.12,'square',.07,900);tone(700,.3,'square',.07,1400,.12);},
  dead(){tone(500,.5,'sawtooth',.07,90);},
  throw(){tone(400,.12,'triangle',.06,800);},
  fuse(){noise(.4,.12,5000);tone(900,.12,'square',.04,1400);},
  beep(){tone(1500,.05,'square',.04);},
  creak(){tone(190,.45,'sawtooth',.05,105);tone(260,.3,'square',.025,150,.15);},
  crack(){noise(.45,.35,900);tone(130,.4,'sawtooth',.07,45);noise(.6,.22,2600);},
  hoot(){tone(380,.12,'sine',.07,300);tone(330,.18,'sine',.07,260,.14);},
  zap(){tone(1200,.1,'sawtooth',.05,300);},
  flame(){const n=performance.now(); if(n-lastSmg<70)return; lastSmg=n; noise(.09,.12,900);},
  ice(){const n=performance.now(); if(n-lastSmg<70)return; lastSmg=n; tone(1500,.05,'triangle',.03,2300);},
  rail(){tone(2000,.28,'sawtooth',.06,180);noise(.22,.25,5000);},
  chest(){noise(.15,.2,900);tone(392,.1,'square',.05,0,.05);}
};
function buzz(ms){try{navigator.vibrate&&navigator.vibrate(ms);}catch(e){}}

/* ---------- музыка: короткие чиптюн-петли для меню, боя и босса ---------- */
const MUS={want:null,cur:null,next:0,step:0,duck:1};
const mf=m=>440*Math.pow(2,(m-69)/12);
const TRACKS={
  menu:{bpm:104,lead:'triangle',lv:.05,
    roots:[48,41,45,43],
    mel:[76,79,84,79,76,79,81,79, 77,81,84,81,77,76,74,72, 76,81,84,88,86,84,83,81, 79,83,86,83,79,0,74,0],
    bass:[0,0,7,0,12,0,7,0],kick:[1,0,0,0,0,0,0,0],snare:[0,0,0,0,1,0,0,0],hat:[0,0,1,0,0,0,1,0]},
  battle:{bpm:138,lead:'square',lv:.028,
    roots:[45,41,48,43],
    mel:[69,72,76,81,79,76,72,76, 77,81,84,81,79,77,76,77, 76,79,84,79,76,79,76,74, 74,79,83,86,83,79,74,71],
    bass:[0,12,0,12,0,12,0,12],kick:[1,0,0,0,1,0,0,0],snare:[0,0,1,0,0,0,1,0],hat:[0,1,0,1,0,1,0,1]},
  boss:{bpm:152,lead:'square',lv:.03,
    roots:[45,45,41,40],
    mel:[69,72,76,81,76,72,69,72, 69,72,77,81,77,72,69,72, 77,81,84,81,77,74,72,74, 76,80,83,88,83,80,76,71],
    bass:[0,12,0,12,0,12,7,12],kick:[1,0,1,0,1,0,1,0],snare:[0,0,1,0,0,0,1,1],hat:[1,1,1,1,1,1,1,1]}
};
function music(name){MUS.want=name;}
function musicDuck(k){MUS.duck=k;applyVolume();}
function musicTick(){
  if(!AC||AC.state!=='running')return;
  if(MUS.want!==MUS.cur){MUS.cur=MUS.want;MUS.step=0;MUS.next=AC.currentTime+.08;}
  const T=TRACKS[MUS.cur]; if(!T||muted||SET.music<=0){MUS.next=AC.currentTime+.05;return;}
  const e8=60/T.bpm/2;
  while(MUS.next<AC.currentTime+.25){
    const s=MUS.step%32, bar=Math.floor(s/8), b=s%8, t=MUS.next, r=T.roots[bar];
    const m=T.mel[s]; if(m)_tone(musBus,mf(m),e8*.9,T.lead,T.lv,0,t);
    if(b%2===0||T.bass[b]!==T.bass[b-1])_tone(musBus,mf(r+T.bass[b]),e8*.95,'triangle',.11,0,t);
    if(T.kick[b])_tone(musBus,120,.14,'sine',.22,40,t);
    if(T.snare[b])_noise(musBus,.1,.09,1900,t);
    if(T.hat[b])_noise(musBus,.03,.025,8000,t);
    MUS.next+=e8; MUS.step++;
  }
}
setInterval(musicTick,60);
