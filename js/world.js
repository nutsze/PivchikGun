/* Генерация двора: земля, забор, препятствия */
/* ---------- world ---------- */
const WW=1500,WH=1500,FENCE=46;
let OBS=[], ground=null;
function seeded(s){return()=>{s=(s*16807)%2147483647;return(s-1)/2147483646;};}
function rand2(R,a,b){return a+R()*(b-a);}
function buildWorld(){
  const R=seeded(20261009); OBS=[];
  const kinds=['hay','hay','barrel','bush','rock','hay','bush','barrel'];
  let tries=0;
  while(OBS.length<18&&tries<900){
    tries++;
    const k=kinds[OBS.length%kinds.length];
    const r=k==='hay'?rand2(R,32,40):k==='barrel'?rand2(R,20,24):k==='bush'?rand2(R,26,34):rand2(R,22,30);
    const x=FENCE+90+R()*(WW-2*FENCE-180), y=FENCE+90+R()*(WH-2*FENCE-180);
    if(Math.hypot(x-WW/2,y-WH/2)<190)continue;
    if(OBS.some(o=>Math.hypot(o.x-x,o.y-y)<o.r+r+80))continue;
    OBS.push({x,y,r,type:k});
  }
  ground=document.createElement('canvas'); ground.width=WW; ground.height=WH;
  const g=ground.getContext('2d');
  g.fillStyle='#7cc451'; g.fillRect(0,0,WW,WH);
  const G=seeded(77);
  for(let i=0;i<26;i++){g.fillStyle=G()<.5?'rgba(255,255,200,.07)':'rgba(30,80,10,.07)';g.beginPath();g.ellipse(G()*WW,G()*WH,60+G()*160,40+G()*110,G()*3,0,TAU);g.fill();}
  for(let i=0;i<9;i++){
    const x=FENCE+G()*(WW-2*FENCE), y=FENCE+G()*(WH-2*FENCE);
    g.fillStyle='rgba(200,160,95,.55)'; g.beginPath(); g.ellipse(x,y,40+G()*60,24+G()*34,G()*3,0,TAU); g.fill();
    g.fillStyle='rgba(170,130,75,.35)'; for(let j=0;j<6;j++){g.beginPath();g.arc(x+(G()-.5)*60,y+(G()-.5)*30,3+G()*4,0,TAU);g.fill();}
  }
  g.lineCap='round';
  for(let i=0;i<2600;i++){const x=G()*WW,y=G()*WH;g.strokeStyle=G()<.5?'#5fa63b':'#9ad866';g.lineWidth=1.6;
    g.beginPath();g.moveTo(x,y);g.lineTo(x-2+G()*1,y-5-G()*3);g.moveTo(x+2,y);g.lineTo(x+3+G()*2,y-4-G()*3);g.stroke();}
  for(let i=0;i<140;i++){const x=G()*WW,y=G()*WH;g.fillStyle=G()<.6?'#ffffff':'#ffe066';
    for(let p=0;p<5;p++){g.beginPath();g.arc(x+Math.cos(p*1.256)*2.6,y+Math.sin(p*1.256)*2.6,1.8,0,TAU);g.fill();}
    g.fillStyle='#f2a91f';g.beginPath();g.arc(x,y,1.4,0,TAU);g.fill();}
  const post=(x,y)=>{g.fillStyle='rgba(0,0,0,.18)';g.fillRect(x-4,y-2,12,6);g.fillStyle='#9b6537';g.strokeStyle=INK;g.lineWidth=2;g.beginPath();g.rect(x-5,y-22,10,24);g.fill();g.stroke();g.fillStyle='#b97c47';g.fillRect(x-3,y-20,3,20);};
  const railH=(y)=>{g.fillStyle='#b97c47';g.strokeStyle=INK;g.lineWidth=2;[-16,-8].forEach(o=>{g.beginPath();g.rect(FENCE,y+o,WW-2*FENCE,5);g.fill();g.stroke();});};
  railH(FENCE); railH(WH-FENCE);
  g.fillStyle='#b97c47'; g.strokeStyle=INK; g.lineWidth=2;
  [FENCE,WW-FENCE].forEach(x=>{g.beginPath();g.rect(x-3,FENCE-16,6,WH-2*FENCE+16);g.fill();g.stroke();});
  for(let x=FENCE;x<=WW-FENCE;x+=48){post(x,FENCE);post(x,WH-FENCE);}
  for(let y=FENCE+48;y<WH-FENCE;y+=48){post(FENCE,y);post(WW-FENCE,y);}
}
