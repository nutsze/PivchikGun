/* Синтезированные звуки (Web Audio) */
/* ---------- audio ---------- */
let AC=null, noiseBuf=null;
function initAudio(){ if(AC){ if(AC.state==='suspended')AC.resume(); return;} try{AC=new (window.AudioContext||window.webkitAudioContext)();}catch(e){AC=null;} }
function tone(f,d,type,v,slide,delay=0){ if(!AC||muted)return; const t=AC.currentTime+delay; const o=AC.createOscillator(),g=AC.createGain();
  o.type=type; o.frequency.setValueAtTime(f,t); if(slide)o.frequency.exponentialRampToValueAtTime(slide,t+d);
  g.gain.setValueAtTime(v,t); g.gain.exponentialRampToValueAtTime(.001,t+d); o.connect(g).connect(AC.destination); o.start(t); o.stop(t+d+.03);}
function noise(d,v,freq){ if(!AC||muted)return; if(!noiseBuf){noiseBuf=AC.createBuffer(1,AC.sampleRate,AC.sampleRate);const a=noiseBuf.getChannelData(0);for(let i=0;i<a.length;i++)a[i]=Math.random()*2-1;}
  const t=AC.currentTime,s=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain(); s.buffer=noiseBuf; f.type='lowpass'; f.frequency.value=freq;
  g.gain.setValueAtTime(v,t); g.gain.exponentialRampToValueAtTime(.001,t+d); s.connect(f).connect(g).connect(AC.destination); s.start(t,Math.random()*.5); s.stop(t+d+.02);}
let lastSmg=0;
const SFX={
  shot(){noise(.09,.22,2600);tone(260,.06,'square',.05,110);},
  shotgun(){noise(.22,.38,1500);tone(140,.12,'square',.06,60);},
  smg(){const n=performance.now(); if(n-lastSmg<60)return; lastSmg=n; noise(.05,.14,3800);},
  pop(){tone(900,.05,'square',.05,300);noise(.05,.12,2400);},
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
