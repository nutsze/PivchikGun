/* Карты: земля, забор, препятствия, река с мостами */
/* ---------- world ---------- */
const WW=1500,WH=1500,FENCE=46;
let OBS=[], ground=null, RIVER=null, MAP='yard';
// Каждая карта: палитра земли, набор препятствий и своя река.
// river: axis 'h' — река течёт слева направо, 'v' — сверху вниз; bridges: [позиция вдоль реки, 1 = гнилой]
const MAPS={
  yard:{name:'Двор',grass:'#7cc451',tuft:['#5fa63b','#9ad866'],patch:'rgba(200,160,95,.55)',flowers:140,out:'#5f9e3c',seed:20261009,
    obs:['hay','hay','barrel','bush','rock','hay','bush','barrel'],bank:'#d8c38a',water:'#4aa8d8',deep:'#3a8fc2',
    river:{axis:'h',base:420,amp:55,freq:.0055,phase:.4,hw:40,bridges:[[230,0],[600,1],[960,0],[1290,1]]}},
  farm:{name:'Ферма',grass:'#82c653',tuft:['#63aa3c','#a2dc6c'],patch:'rgba(200,160,95,.6)',flowers:180,out:'#62a23e',seed:777101,
    obs:['hay','hay','hay','barrel','bush','rock','hay','barrel'],bank:'#dcc58c',water:'#4aa8d8',deep:'#3a8fc2',
    river:{axis:'v',base:1110,amp:70,freq:.005,phase:1.2,hw:42,bridges:[[260,1],[620,0],[980,1],[1300,0]]}},
  forest:{name:'Тёмный лес',grass:'#5e9e3e',tuft:['#4a8a30','#78b850'],patch:'rgba(90,70,40,.45)',flowers:60,out:'#3f7a2a',seed:555202,
    obs:['bush','bush','rock','bush','hay','bush','rock'],bank:'#a89060',water:'#3d8fb8',deep:'#2f7aa0',
    river:{axis:'h',base:1120,amp:90,freq:.006,phase:2.1,hw:44,bridges:[[200,0],[520,1],[860,1],[1180,0],[1380,1]]}},
  factory:{name:'Птицефабрика',grass:'#b9b5aa',tuft:['#a29e93','#cfcbc0'],patch:'rgba(50,50,50,.22)',flowers:0,out:'#8a867b',seed:333303,
    obs:['barrel','barrel','rock','barrel','hay','barrel'],bank:'#8f8b80',water:'#5f8f8a',deep:'#4d7a74',
    river:{axis:'v',base:400,amp:14,freq:.004,phase:.2,hw:38,bridges:[[300,0],[700,1],[1100,0],[1350,1]]}},
  mountain:{name:'Горы',grass:'#cfe0c2',tuft:['#b2c8a6','#eef6ea'],patch:'rgba(255,255,255,.65)',flowers:40,out:'#a7bd9f',seed:111404,
    obs:['rock','rock','bush','rock','rock','hay'],bank:'#b9b2a2',water:'#7cc8ea',deep:'#5fb2dc',
    river:{axis:'h',base:1010,amp:110,freq:.0045,phase:3.3,hw:36,bridges:[[240,1],[560,0],[900,1],[1230,0]]}}
};
const MAP_OF_CH=['farm','forest','factory','mountain'];
function seeded(s){return()=>{s=(s*16807)%2147483647;return(s-1)/2147483646;};}
function rand2(R,a,b){return a+R()*(b-a);}

/* --- река: центр, стороны, вода, мосты --- */
function rc(u){const R=RIVER;return R.base+R.amp*Math.sin(u*R.freq+R.phase)+R.amp*.35*Math.sin(u*R.freq*2.3+1.7);}
function toUV(x,y){return RIVER.axis==='h'?[x,y]:[y,x];}
function fromUV(u,v){return RIVER.axis==='h'?[u,v]:[v,u];}
function bridgeAt(x,y){
  if(!RIVER)return null; const [u,v]=toUV(x,y);
  for(const b of RIVER.bridges){if(b.broken)continue;if(Math.abs(u-b.u)<b.hw&&Math.abs(v-rc(u))<RIVER.hw+14)return b;}
  return null;
}
function inWater(x,y){
  if(!RIVER)return false; const [u,v]=toUV(x,y);
  if(Math.abs(v-rc(u))>=RIVER.hw-3)return false;
  for(const b of RIVER.bridges)if(!b.broken&&Math.abs(u-b.u)<b.hw-2)return false;
  return true;
}
function nearWater(x,y,m){if(!RIVER)return false;const [u,v]=toUV(x,y);return Math.abs(v-rc(u))<RIVER.hw+m;}
function sideOf(x,y){const [u,v]=toUV(x,y);return v<rc(u)?-1:1;}
function waterBlock(e,ox,oy){ // ходить по воде нельзя: откатываем шаг, а если занесло в воду — на ближний берег
  if(!inWater(e.x,e.y))return;
  if(!inWater(e.x,oy))e.y=oy; else if(!inWater(ox,e.y))e.x=ox; else {e.x=ox;e.y=oy;}
  if(inWater(e.x,e.y)){const [u,v]=toUV(e.x,e.y),c=rc(u),p=fromUV(u,c+(v<c?-1:1)*(RIVER.hw+3));e.x=p[0];e.y=p[1];}
}
function dryPoint(x,y){if(!RIVER||!nearWater(x,y,50))return [x,y];const [u,v]=toUV(x,y),c=rc(u);return fromUV(u,c+(v<c?-1:1)*(RIVER.hw+70));}
function navTarget(e,tx,ty,alt=0){ // куда идти, чтобы попасть на другой берег через целый мост
  if(!RIVER)return null;
  const st=sideOf(tx,ty), [ue,ve]=toUV(e.x,e.y);
  const onB=bridgeAt(e.x,e.y);
  if(onB){const c=rc(onB.u);if(Math.abs(ve-c)<RIVER.hw+10)return fromUV(onB.u,c+st*(RIVER.hw+34));return null;}
  const se=sideOf(e.x,e.y); if(se===st)return null;
  const ut=toUV(tx,ty)[0];
  const ok=RIVER.bridges.filter(b=>!b.broken).sort((a,b)=>(Math.abs(a.u-ue)+Math.abs(a.u-ut)*.5)-(Math.abs(b.u-ue)+Math.abs(b.u-ut)*.5));
  if(!ok.length)return null; const best=ok[alt%ok.length];
  const c=rc(best.u), nearV=c+se*(RIVER.hw+26);
  if(Math.abs(ue-best.u)<best.hw*.55&&Math.abs(ve-nearV)<45)return fromUV(best.u,c+st*(RIVER.hw+34));
  return fromUV(best.u,nearV);
}
function sidePoint(side){ // сухая точка у края карты на нужном берегу, подальше от игрока
  for(let i=0;i<40;i++){const p=edgePoint(16);if(sideOf(p[0],p[1])===side&&!nearWater(p[0],p[1],30))return p;}
  return null;
}
function bridgeSpan(b){let lo=1e9,hi=-1e9;for(let u=b.u-b.hw;u<=b.u+b.hw;u+=4){const c=rc(u);lo=Math.min(lo,c);hi=Math.max(hi,c);}return [lo-RIVER.hw-12,hi+RIVER.hw+12];}

function buildWorld(key='yard'){
  MAP=MAPS[key]?key:'yard'; const M=MAPS[MAP];
  RIVER={...M.river,bridges:M.river.bridges.map(([u,rot])=>({u,hw:32,rotten:!!rot,passes:0,broken:false,wob:0}))};
  const R=seeded(M.seed); OBS=[];
  const kinds=M.obs, sx=WW/2, sy=WH/2+40;
  let tries=0;
  while(OBS.length<18&&tries<1400){
    tries++;
    const k=kinds[OBS.length%kinds.length];
    const r=k==='hay'?rand2(R,32,40):k==='barrel'?rand2(R,20,24):k==='bush'?rand2(R,26,34):rand2(R,22,30);
    const x=FENCE+90+R()*(WW-2*FENCE-180), y=FENCE+90+R()*(WH-2*FENCE-180);
    if(Math.hypot(x-sx,y-sy)<190)continue;
    if(nearWater(x,y,r+34))continue;
    if(OBS.some(o=>Math.hypot(o.x-x,o.y-y)<o.r+r+80))continue;
    OBS.push({x,y,r,type:k});
  }
  ground=document.createElement('canvas'); ground.width=WW; ground.height=WH;
  const g=ground.getContext('2d');
  g.fillStyle=M.grass; g.fillRect(0,0,WW,WH);
  const G=seeded(77+M.seed%97);
  for(let i=0;i<26;i++){g.fillStyle=G()<.5?'rgba(255,255,200,.07)':'rgba(30,80,10,.07)';g.beginPath();g.ellipse(G()*WW,G()*WH,60+G()*160,40+G()*110,G()*3,0,TAU);g.fill();}
  for(let i=0;i<9;i++){
    const x=FENCE+G()*(WW-2*FENCE), y=FENCE+G()*(WH-2*FENCE);
    g.fillStyle=M.patch; g.beginPath(); g.ellipse(x,y,40+G()*60,24+G()*34,G()*3,0,TAU); g.fill();
    g.fillStyle='rgba(120,90,50,.2)'; for(let j=0;j<6;j++){g.beginPath();g.arc(x+(G()-.5)*60,y+(G()-.5)*30,3+G()*4,0,TAU);g.fill();}
  }
  g.lineCap='round';
  for(let i=0;i<2600;i++){const x=G()*WW,y=G()*WH;g.strokeStyle=G()<.5?M.tuft[0]:M.tuft[1];g.lineWidth=1.6;
    g.beginPath();g.moveTo(x,y);g.lineTo(x-2+G()*1,y-5-G()*3);g.moveTo(x+2,y);g.lineTo(x+3+G()*2,y-4-G()*3);g.stroke();}
  for(let i=0;i<M.flowers;i++){const x=G()*WW,y=G()*WH;g.fillStyle=G()<.6?'#ffffff':'#ffe066';
    for(let p=0;p<5;p++){g.beginPath();g.arc(x+Math.cos(p*1.256)*2.6,y+Math.sin(p*1.256)*2.6,1.8,0,TAU);g.fill();}
    g.fillStyle='#f2a91f';g.beginPath();g.arc(x,y,1.4,0,TAU);g.fill();}
  // река
  const L=RIVER.axis==='h'?WW:WH, band=(off)=>{g.beginPath();for(let u=-20;u<=L+20;u+=8){const p=fromUV(u,rc(u)-off);u===-20?g.moveTo(p[0],p[1]):g.lineTo(p[0],p[1]);}
    for(let u=L+20;u>=-20;u-=8){const p=fromUV(u,rc(u)+off);g.lineTo(p[0],p[1]);}g.closePath();};
  band(RIVER.hw+11); g.fillStyle=M.bank; g.fill(); g.strokeStyle='rgba(43,29,20,.35)'; g.lineWidth=2; g.stroke();
  band(RIVER.hw); g.fillStyle=M.water; g.fill(); g.strokeStyle=INK; g.lineWidth=2.5; g.stroke();
  band(RIVER.hw*.45); g.fillStyle=M.deep; g.fill();
  g.strokeStyle='rgba(255,255,255,.45)'; g.lineWidth=2;
  for(let i=0;i<60;i++){const u=G()*L,off=(G()-.5)*RIVER.hw*1.4,a=fromUV(u,rc(u)+off),b=fromUV(u+14,rc(u+14)+off);g.beginPath();g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1]);g.stroke();}
  for(let i=0;i<40;i++){const u=G()*L,sd=G()<.5?-1:1,p=fromUV(u,rc(u)+sd*(RIVER.hw+6+G()*4));g.fillStyle='rgba(120,100,70,.5)';g.beginPath();g.arc(p[0],p[1],2+G()*2.5,0,TAU);g.fill();}
  // забор
  const post=(x,y)=>{g.fillStyle='rgba(0,0,0,.18)';g.fillRect(x-4,y-2,12,6);g.fillStyle='#9b6537';g.strokeStyle=INK;g.lineWidth=2;g.beginPath();g.rect(x-5,y-22,10,24);g.fill();g.stroke();g.fillStyle='#b97c47';g.fillRect(x-3,y-20,3,20);};
  const railH=(y)=>{g.fillStyle='#b97c47';g.strokeStyle=INK;g.lineWidth=2;[-16,-8].forEach(o=>{g.beginPath();g.rect(FENCE,y+o,WW-2*FENCE,5);g.fill();g.stroke();});};
  railH(FENCE); railH(WH-FENCE);
  g.fillStyle='#b97c47'; g.strokeStyle=INK; g.lineWidth=2;
  [FENCE,WW-FENCE].forEach(x=>{g.beginPath();g.rect(x-3,FENCE-16,6,WH-2*FENCE+16);g.fill();g.stroke();});
  for(let x=FENCE;x<=WW-FENCE;x+=48){post(x,FENCE);post(x,WH-FENCE);}
  for(let y=FENCE+48;y<WH-FENCE;y+=48){post(FENCE,y);post(WW-FENCE,y);}
}

/* --- мосты: скрип и обрушение гнилых --- */
let lastBridge=null;
function updateBridges(dt){
  if(!RIVER)return;
  for(const b of RIVER.bridges)if(b.wob>0)b.wob-=dt;
  const b=P.alive?bridgeAt(P.x,P.y):null;
  if(b===lastBridge)return;
  if(lastBridge&&lastBridge.rotten&&!lastBridge.broken){lastBridge.passes++;if(lastBridge.passes>=2)breakBridge(lastBridge);}
  if(b&&b.rotten&&!b.broken){b.wob=.6;SFX.creak();S.shake+=2;ftext(P.x,P.y-52,b.passes===0?'Скрип… мост гнилой':'Трещит! Сейчас рухнет','#e8d3a8',12);}
  lastBridge=b;
}
function breakBridge(b){
  b.broken=true; SFX.crack(); S.shake+=9; buzz(50);
  const [lo,hi]=bridgeSpan(b);
  for(let v=lo;v<hi;v+=16){const p=fromUV(b.u+rand(-b.hw,b.hw),v);
    parts.push({k:'shell',x:p[0],y:p[1],z:6,vx:rand(-60,60),vy:rand(-40,40),vz:rand(80,200),rot:rand(0,TAU),vr:rand(-8,8),t:0,max:rand(.6,1),dirt:true});
    puff(p[0],p[1],'#bfe6ff',2,1);}
  const m=fromUV(b.u,rc(b.u)); ftext(m[0],m[1]-30,'Мост рухнул!','#ffb3a3',15);
}
function drawRiverDyn(c){
  if(!RIVER)return;
  const L=RIVER.axis==='h'?WW:WH;
  c.save(); c.strokeStyle='rgba(255,255,255,.55)'; c.lineWidth=2; c.lineCap='round';
  for(let i=0;i<26;i++){const u=((i*61+S.t*28)%(L+40))-20,off=Math.sin(i*2.7)*RIVER.hw*.6,a=fromUV(u,rc(u)+off),b=fromUV(u+10,rc(u+10)+off);c.globalAlpha=.4+.3*Math.sin(S.t*2+i);c.beginPath();c.moveTo(a[0],a[1]);c.lineTo(b[0],b[1]);c.stroke();}
  c.restore();
  for(const b of RIVER.bridges){
    const [lo,hi]=bridgeSpan(b), h=b.hw, wob=b.wob>0?Math.sin(S.t*60)*1.5:0;
    c.save(); if(RIVER.axis==='v')c.transform(0,1,1,0,0,0); c.translate(wob,0); c.strokeStyle=INK; c.lineJoin='round';
    if(b.broken){
      c.fillStyle='#6b5a40';c.lineWidth=2;[[lo+2],[hi-12]].forEach(([v])=>{[-h,h-7].forEach(x=>{c.beginPath();c.rect(b.u+x,v,7,10);c.fill();c.stroke();});});
      const mid=rc(b.u);
      for(let k=0;k<3;k++){c.save();c.translate(b.u+(k-1)*16+Math.sin(S.t*1.5+k)*5,mid+(k-1)*10+Math.cos(S.t+k)*4);c.rotate(.4*k+Math.sin(S.t+k)*.2);c.fillStyle='#7f7a5a';c.beginPath();c.rect(-14,-4,28,8);c.fill();c.stroke();c.restore();}
      c.restore(); continue;
    }
    c.fillStyle='rgba(0,0,0,.18)'; c.fillRect(b.u-h+4,lo+6,2*h,hi-lo);
    const plank=b.rotten?['#8a8360','#7a7350','#948c66']:['#b07a45','#a06d3c','#bd8650'];
    let i=0;
    for(let v=lo;v<hi-4;v+=11,i++){
      const gap=b.rotten&&((i*7+Math.round(b.u))%6===0||(b.passes>0&&(i*5+Math.round(b.u))%4===0));
      if(gap)continue;
      const sag=b.rotten&&b.passes>0?Math.sin(i*1.7)*1.5:0;
      c.fillStyle=plank[i%3]; c.lineWidth=1.8; c.beginPath(); c.rect(b.u-h,v+sag,2*h,9); c.fill(); c.stroke();
      if(b.rotten){c.strokeStyle='rgba(43,29,20,.55)';c.lineWidth=1.2;c.beginPath();c.moveTo(b.u-h+6+(i*9)%20,v+2);c.lineTo(b.u-h+14+(i*9)%20,v+7);c.stroke();c.strokeStyle=INK;}
    }
    c.fillStyle=b.rotten?'#5f5a40':'#8a5a2b'; c.lineWidth=2;
    [-h-4,h-2].forEach(x=>{c.beginPath();c.rect(b.u+x,lo-4,6,hi-lo+8);c.fill();c.stroke();});
    c.restore();
  }
}
