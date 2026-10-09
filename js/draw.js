/* Отрисовка: оружие, герои, враги, сундуки, кадр игры */
/* ---------- drawing ---------- */
function seg(c,x1,y1,x2,y2){c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();}
function rr(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}
function shadow(c,rx,ry){c.fillStyle='rgba(25,50,10,.28)';c.beginPath();c.ellipse(0,1,rx,ry,0,0,TAU);c.fill();}
function circ(c,x,y,r,f,s=true){c.fillStyle=f;c.beginPath();c.arc(x,y,r,0,TAU);c.fill();if(s)c.stroke();}
// фигурка: 0 звезда, 1 сердце, 2 кубик, 3 треугольник
function figShape(c,k,r){
  c.beginPath();
  if(k===0){for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,q=i%2?r*.45:r;c.lineTo(Math.cos(a)*q,Math.sin(a)*q);}}
  else if(k===1){c.moveTo(0,r*.9);c.bezierCurveTo(-r*1.5,-r*.1,-r*.6,-r*1.2,0,-r*.35);c.bezierCurveTo(r*.6,-r*1.2,r*1.5,-r*.1,0,r*.9);}
  else if(k===2){c.rect(-r*.75,-r*.75,r*1.5,r*1.5);}
  else{c.moveTo(0,-r);c.lineTo(r*.95,r*.7);c.lineTo(-r*.95,r*.7);}
  c.closePath();
}
const FIGCOL=['#ffe066','#ff6fa8','#6fd8ff','#9cf27a'];

function drawGun(c,type){
  c.strokeStyle=INK;c.lineWidth=2;c.lineJoin='round';
  const box=(x,y,w,h,r,f)=>{c.fillStyle=f;rr(c,x,y,w,h,r);c.fill();c.stroke();};
  if(type==='pistol'||type==='eggun'){
    box(3,-3.5,15,7,2,type==='eggun'?'#d9822b':'#3d3f4a'); box(5,0,5,8,1.5,type==='eggun'?'#a65e1c':'#2a2b33');
  } else if(type==='sheriff'){
    c.fillStyle='#8a5a2b';c.beginPath();c.moveTo(1,-1);c.lineTo(7,-1);c.lineTo(5,9);c.lineTo(-1,8);c.closePath();c.fill();c.stroke();
    box(9,-2.8,19,4.6,1.5,'#6b6f7c'); box(4,-5,9,8,3,'#4a4d58');
    c.strokeStyle='#2a2b33';c.lineWidth=1;seg(c,6.5,-4,6.5,2);seg(c,10,-4,10,2);
  } else if(type==='millet'){
    box(2,-4.5,21,8,2.5,'#e0a83a'); box(21,-2.5,8,4,1,'#3d3f4a');
    c.fillStyle='#8a5a2b';c.beginPath();c.arc(11,6,5,0,TAU);c.fill();c.stroke();
    c.fillStyle='#ffe066';[[9,5],[12.5,7],[11,4]].forEach(([x,y])=>{c.beginPath();c.arc(x,y,1.1,0,TAU);c.fill();});
  } else if(type==='sawed'){
    box(-5,-3,10,7.5,2,'#8a5a2b'); box(4,-5,16,4.5,1.5,'#3d3f4a'); box(4,-.6,16,4.5,1.5,'#3d3f4a');
  } else if(type==='popcorn'){
    box(0,-6,20,11,4,'#d8302a');
    c.fillStyle='#fff';[4,10,16].forEach(x=>c.fillRect(x,-5,2.6,9));
    c.strokeStyle=INK;c.lineWidth=2;rr(c,0,-6,20,11,4);c.stroke();
    box(19,-4,8,7,2,'#fff4dc');
    [[4,-8,3],[9,-9,3.4],[14,-8,3]].forEach(([x,y,r])=>circ(c,x,y,r,'#fffbe8'));
  } else if(type==='freeze'){
    box(0,-5,18,9,3,'#e6f6ff'); box(17,-3,9,5,1.5,'#7fd4ff'); circ(c,6,-9,4.5,'#9fe3ff');
    c.strokeStyle='#3b8fd1';c.lineWidth=1.2;for(let k=0;k<3;k++){const a=k*Math.PI/3;seg(c,6-Math.cos(a)*3,-9-Math.sin(a)*3,6+Math.cos(a)*3,-9+Math.sin(a)*3);}
  } else if(type==='flame'){
    box(-7,-6,9,13,4,'#e8322a'); box(1,-3.5,18,7,2,'#55585f'); box(18,-4.5,6,9,2,'#3d3f4a');
    c.fillStyle=Math.floor(S.t*20)%2?'#ffd23a':'#ff7a1a';c.beginPath();c.arc(27,0,2.6,0,TAU);c.fill();
  } else if(type==='minigun'){
    box(-3,-6,13,12,3,'#3d3f4a');
    const sp=(P&&P.w==='minigun'?(P.spin||0):0), off=(S.t*sp*30)%4;
    for(let k=0;k<3;k++){const y=-4.6+((k*4+off)%12)*.8;box(9,y-1.3,21,2.8,1,k===1?'#80848f':'#6b6f7c');}
    box(27,-5.5,3,11,1,'#2a2b33'); circ(c,3,8,5,'#c9a227');
  } else if(type==='mortar'){
    box(-5,-4,10,8,2,'#8a5a2b');
    c.fillStyle='#4a6430';c.beginPath();c.moveTo(4,-5);c.lineTo(22,-8);c.lineTo(22,8);c.lineTo(4,5);c.closePath();c.fill();c.stroke();
    c.fillStyle='#fffaf0';c.beginPath();c.ellipse(23.5,0,4,5,0,0,TAU);c.fill();c.stroke();
  } else if(type==='rail'){
    box(-5,-3,10,7,2,'#2a2b33'); box(4,-4,27,8,2,'#3d3f4a');
    [9,15,21].forEach(x=>{c.fillStyle='#4cc3ff';rr(c,x,-5.5,3,11,1);c.fill();c.stroke();});
    c.save();c.globalAlpha=.6+Math.sin(S.t*12)*.3;circ(c,32,0,3,'#bff4ff',false);c.restore();
  } else if(type==='turbocat'){
    box(9,-4.6,19,3.4,1,'#55585f'); box(9,.9,19,3.4,1,'#6b6f7c'); box(26,-5.8,3.5,11.5,1,'#2a2b33');
    c.fillStyle='#f39a3b';c.beginPath();c.moveTo(-3,-6);c.lineTo(-1,-12);c.lineTo(3,-6.5);c.closePath();c.fill();c.stroke();
    c.beginPath();c.moveTo(5,-6.5);c.lineTo(9,-12);c.lineTo(11,-6);c.closePath();c.fill();c.stroke();
    box(-5,-6.5,17,13,5,'#f39a3b');
    c.strokeStyle='#c9661d';c.lineWidth=1.6;seg(c,-1,-6,0,-2.5);seg(c,3.5,-6.4,3.5,-2.8);seg(c,8,-6,7,-2.5);
    c.fillStyle=INK;c.beginPath();c.arc(1,0,1.1,0,TAU);c.arc(6,0,1.1,0,TAU);c.fill();
    c.fillStyle='#ff9ec7';c.beginPath();c.arc(3.5,2.6,1.2,0,TAU);c.fill();
    c.strokeStyle=INK;c.lineWidth=.9;seg(c,-1,3,-5,2.4);seg(c,-1,4,-5,5);seg(c,8,3,12,2.4);
    c.lineWidth=2;circ(c,1,9,4,'#ff9ec7');
  } else if(type==='figure'){
    box(-7,-3,12,7,2.5,'#7b5cd6');
    c.fillStyle='#ff8fc8';c.beginPath();c.moveTo(4,-4.5);c.lineTo(20,-4.5);c.lineTo(27,-8.5);c.lineTo(27,8.5);c.lineTo(20,4.5);c.lineTo(4,4.5);c.closePath();c.fill();c.stroke();
    c.save();c.translate(11,0);c.fillStyle='#ffe066';c.lineWidth=1.2;figShape(c,0,3.6);c.fill();c.stroke();c.restore();
    c.save();c.translate(17,0);c.fillStyle='#6fd8ff';c.lineWidth=1.2;figShape(c,1,3);c.fill();c.stroke();c.restore();
  } else if(type==='zapper'){
    box(3,-3.5,15,7,2,'#6f7782'); box(5,0,5,8,1.5,'#4a4f58'); circ(c,19,0,2.4,'#ff4d2e',false);
  } else if(type==='granny'){
    box(-6,-3.5,12,8,2.5,'#a8743d'); box(5,-4.5,17,4,1.5,'#55585f'); box(5,-.8,17,4,1.5,'#55585f');
    c.fillStyle='#e8d3a8';c.fillRect(9,-5,3,8.5);c.strokeRect(9,-5,3,8.5);
  } else if(type==='cornrifle'){
    box(-7,-3,12,7,2,'#8a5a2b'); box(4,-2.6,29,4.6,1.5,'#6b4a2b');
    c.fillStyle='#f6c42d';c.beginPath();c.ellipse(13,-6.5,6,2.6,0,0,TAU);c.fill();c.stroke();
    c.fillStyle='#e0a91f';[9,12,15,18].forEach(x=>{c.beginPath();c.arc(x,-6.5,.8,0,TAU);c.fill();});
  } else if(type==='crossbow'){
    box(-4,-3,24,6,2,'#8a5a2b');
    c.strokeStyle=INK;c.lineWidth=3.2;c.beginPath();c.moveTo(16,-12);c.quadraticCurveTo(24,0,16,12);c.stroke();
    c.strokeStyle='#c9973f';c.lineWidth=1.8;c.stroke();
    c.strokeStyle='#fff4dc';c.lineWidth=1;seg(c,16,-12,8,0);seg(c,8,0,16,12);
    c.strokeStyle=INK;c.lineWidth=1.6;c.fillStyle='#e6e3d6';c.beginPath();c.moveTo(8,0);c.lineTo(30,0);c.stroke();c.beginPath();c.moveTo(30,-2.5);c.lineTo(34,0);c.lineTo(30,2.5);c.closePath();c.fill();c.stroke();
  } else if(type==='syringe'){
    box(-6,-1.5,6,3,1,'#c9d0d8'); box(-1,-4.5,4,9,1,'#c9d0d8');
    box(3,-4,18,8,3,'#e6f6ff'); c.fillStyle='#5fcf3f';c.fillRect(9,-2.6,11,5.2);
    c.strokeStyle=INK;c.lineWidth=1;[8,12,16].forEach(x=>seg(c,x,-4,x,-1.5));
    c.lineWidth=2;seg(c,21,0,29,0);
  } else if(type==='vitamin'){
    box(0,-5,21,10,3,'#ffffff'); box(20,-2.5,7,5,1.5,'#3d3f4a');
    c.fillStyle='#e8322a';c.fillRect(2,-5,9,10);c.strokeStyle=INK;c.lineWidth=2;rr(c,0,-5,21,10,3);c.stroke();
    circ(c,8,8,5,'#9cf27a'); c.fillStyle='#ffc93a';c.beginPath();c.ellipse(8,8,2.4,1.3,.5,0,TAU);c.fill();
  } else if(type==='shotgun'){
    box(-6,-3,11,7,2,'#8a5a2b'); box(4,-3.5,24,5,1.5,'#3d3f4a'); box(6,1,16,3.5,1,'#55585f');
  } else if(type==='smg'){
    box(2,-4.5,19,8,2,'#3d3f4a'); box(10,2,4.5,10,1,'#2a2b33'); box(20,-2.5,6,4,1,'#2a2b33');
  } else if(type==='blunder'){
    box(-6,-3,12,7,2,'#7a4a24');
    c.fillStyle='#c8a04a';c.beginPath();c.moveTo(4,-3.5);c.lineTo(22,-4);c.lineTo(28,-8);c.lineTo(28,6);c.lineTo(22,3);c.lineTo(4,3.5);c.closePath();c.fill();c.stroke();
  }
}
const SPEC={
  hen:{s:1,head:[9,-33,8.5],eye:[11.5,-33.5],gy:-19},
  rooster:{s:1.08,head:[9,-34,9],eye:[11.8,-34.5],gy:-20},
  chick:{s:.88,head:[7,-28,9],eye:[9.8,-28.5],gy:-15},
  duck:{s:1,head:[10,-33,8],eye:[12.4,-34.5],gy:-18},
  goose:{s:1.05,head:[14,-48,7.4],eye:[16,-49],gy:-19}
};
function drawHat(c,hat,hx,hy,hr,ex,ey,layer){
  if(!hat||hat==='none')return;
  c.strokeStyle=INK;c.lineWidth=2.2;c.lineJoin='round';
  if(layer==='over'){
    if(hat==='pirate'){c.lineWidth=1.4;seg(c,hx-hr+1,hy-4.5,ex+3,ey-3.5);circ(c,ex,ey,3.8,'#1d1d22');}
    return;
  }
  if(hat==='bandana'){
    c.fillStyle='#d8302a';c.beginPath();c.moveTo(hx-hr+.5,hy-4);c.quadraticCurveTo(hx,hy-hr-1.5,hx+hr-.5,hy-5.5);c.lineTo(hx+hr-.3,hy-2.5);c.quadraticCurveTo(hx,hy-hr+1.5,hx-hr+.5,hy-1);c.closePath();c.fill();c.stroke();
    c.beginPath();c.moveTo(hx-hr+1,hy-3);c.lineTo(hx-hr-8,hy-8);c.lineTo(hx-hr-6,hy-3.5);c.lineTo(hx-hr-10,hy);c.closePath();c.fill();c.stroke();
    c.fillStyle='#fff';[[hx-3,hy-5.5],[hx+2,hy-6.8]].forEach(([x,y])=>{c.beginPath();c.arc(x,y,.9,0,TAU);c.fill();});
  } else if(hat==='helmet'){
    c.fillStyle='#5c7a3a';c.beginPath();c.arc(hx,hy-1.5,hr+2.2,Math.PI*1.02,Math.PI*1.98);c.closePath();c.fill();c.stroke();
    c.fillStyle='#4a6430';rr(c,hx-hr-3,hy-3.2,2*hr+6,3.2,1.5);c.fill();c.stroke();
    c.fillStyle='#7d9b55';c.beginPath();c.ellipse(hx-2,hy-hr-.5,2.6,1.4,-.3,0,TAU);c.fill();
  } else if(hat==='cowboy'){
    c.fillStyle='#a8743d';c.beginPath();c.moveTo(hx-hr+2,hy-hr+2);c.lineTo(hx-hr+3,hy-hr-8);c.quadraticCurveTo(hx,hy-hr-5,hx+hr-3,hy-hr-8);c.lineTo(hx+hr-2,hy-hr+2);c.closePath();c.fill();c.stroke();
    c.fillStyle='#4a2a14';c.fillRect(hx-hr+2.4,hy-hr-1.6,2*hr-4.8,2.6);
    c.fillStyle='#8a5a2b';c.beginPath();c.ellipse(hx,hy-hr+2.2,hr+8,2.8,0,0,TAU);c.fill();c.stroke();
  } else if(hat==='crown'){
    c.fillStyle='#ffc93a';c.beginPath();c.moveTo(hx-hr+1.5,hy-hr+3);c.lineTo(hx-hr+1.5,hy-hr-7);c.lineTo(hx-hr/2,hy-hr-2);c.lineTo(hx,hy-hr-9.5);c.lineTo(hx+hr/2,hy-hr-2);c.lineTo(hx+hr-1.5,hy-hr-7);c.lineTo(hx+hr-1.5,hy-hr+3);c.closePath();c.fill();c.stroke();
    c.lineWidth=1.2;circ(c,hx,hy-hr-.3,1.8,'#e8322a');circ(c,hx-hr/2-1,hy-hr+.6,1.3,'#3fa7d6');circ(c,hx+hr/2+1,hy-hr+.6,1.3,'#3fa7d6');
  } else if(hat==='pirate'){
    c.fillStyle='#1d1d22';c.beginPath();c.arc(hx,hy-1,hr+.9,Math.PI*1.04,Math.PI*1.96);c.closePath();c.fill();c.stroke();
    c.beginPath();c.moveTo(hx-hr+1,hy-3);c.lineTo(hx-hr-7,hy-7);c.lineTo(hx-hr-6,hy-1);c.closePath();c.fill();c.stroke();
    circ(c,hx+1,hy-hr+3,1.8,'#fff',false);
  } else if(hat==='halo'){
    c.save();c.shadowColor='rgba(255,220,90,.9)';c.shadowBlur=8;c.strokeStyle=INK;c.lineWidth=5;c.beginPath();c.ellipse(hx,hy-hr-8,hr*.95,2.8,0,0,TAU);c.stroke();
    c.strokeStyle='#ffd23a';c.lineWidth=2.8;c.stroke();c.restore();
  } else if(hat==='ninja'){
    c.save();c.beginPath();c.arc(hx,hy,hr-1.1,0,TAU);c.clip();c.fillStyle='#1d1d22';c.fillRect(hx-hr,ey-3.6,2*hr,7.2);c.restore();
    c.fillStyle='#1d1d22';c.beginPath();c.moveTo(hx-hr+1,ey-1);c.lineTo(hx-hr-9,ey-6);c.lineTo(hx-hr-7,ey);c.lineTo(hx-hr-10,ey+4);c.closePath();c.fill();c.stroke();
  }
}
function drawBird(c,o){
  const sp=SPEC[o.sp]||SPEC.hen, s=sp.s, [hx,hy,hr]=sp.head, [ex,ey]=sp.eye;
  const adren=o.special==='adren';
  c.save(); c.translate(o.x,o.y);
  if(o.blink&&Math.floor(S.t*20)%2)c.globalAlpha=.55;
  shadow(c,14*s,5*s);
  if(o.buff==='fort'){c.save();c.globalAlpha=.35+Math.sin(S.t*10)*.1;c.fillStyle='#cfe8ff';c.strokeStyle='#ffffff';c.lineWidth=3;c.beginPath();c.ellipse(0,-22,34,38,0,0,TAU);c.fill();c.stroke();c.restore();}
  if(o.buff==='storm'){c.save();c.strokeStyle='rgba(255,255,255,.75)';c.lineWidth=3;for(let k=0;k<3;k++){const a0=S.t*9+k*TAU/3;c.beginPath();c.ellipse(0,-20,104,44,0,a0,a0+1.4);c.stroke();}
    c.fillStyle='rgba(134,188,220,.18)';c.beginPath();c.ellipse(0,-10,110,46,0,0,TAU);c.fill();c.restore();}
  if(o.kamikaze){}
  if(o.buff==='adren'){c.save();c.globalAlpha=.5+Math.sin(S.t*18)*.15;const g=c.createRadialGradient(0,-22,4,0,-22,42);g.addColorStop(0,'rgba(255,210,58,.7)');g.addColorStop(1,'rgba(255,60,30,0)');c.fillStyle=g;c.beginPath();c.arc(0,-22,42,0,TAU);c.fill();c.restore();}
  const bob=o.moving?Math.abs(Math.sin(o.phase))*3:0, lg=o.moving?Math.sin(o.phase)*5:0;
  c.save(); c.scale(o.face*s,s); c.lineCap='round'; c.lineJoin='round';
  const legTop=o.sp==='chick'?-8:-11, legCol=(o.sp==='duck'||o.sp==='goose')?'#f08a1f':'#f0a02a';
  c.strokeStyle=INK;c.lineWidth=5; seg(c,-4,legTop,-4+lg,0); seg(c,4,legTop,4-lg,0);
  c.strokeStyle=legCol;c.lineWidth=2.6; seg(c,-4,legTop,-4+lg,0); seg(c,4,legTop,4-lg,0);
  c.translate(0,-bob);
  const fl=o.flash>0, body=fl?'#fff':o.body, wing=fl?'#fff':o.wing, tail=fl?'#fff':(o.tail||o.wing), head=fl?'#fff':(o.head||o.body);
  c.strokeStyle=INK; c.lineWidth=2.4;
  c.fillStyle=tail; c.beginPath();
  if(o.sp==='rooster'){
    const cols=adren?['#e8322a','#ffd23a','#ff7a1a']:[tail,'#f2a33a',tail];
    for(let k=0;k<3;k++){const fl2=adren?Math.sin(S.t*14+k)*2:0;c.beginPath();c.moveTo(-10,-22+k*3);c.quadraticCurveTo(-32-k*3+fl2,-46+k*7,-28+k*3,-15+k*3);c.quadraticCurveTo(-22,-27+k*4,-12,-17+k*3);c.closePath();c.fillStyle=fl?'#fff':cols[k];c.fill();c.stroke();}
  } else if(o.sp==='chick'){c.moveTo(-10,-16);c.lineTo(-17,-21);c.lineTo(-12,-10);c.closePath();c.fill();c.stroke();}
  else if(o.sp==='duck'||o.sp==='goose'){c.moveTo(-12,-20);c.lineTo(-23,-28);c.lineTo(-17,-14);c.closePath();c.fill();c.stroke();}
  else{c.moveTo(-10,-22);c.lineTo(-23,-35);c.lineTo(-19,-25);c.lineTo(-26,-27);c.lineTo(-15,-15);c.closePath();c.fill();c.stroke();}
  c.fillStyle=body; c.beginPath();
  if(o.sp==='chick')c.ellipse(0,-16,13.5,12,0,0,TAU);
  else if(o.sp==='goose')c.ellipse(-1,-20,16.5,12.5,0,0,TAU);
  else if(o.sp==='duck')c.ellipse(0,-19,16,11.5,0,0,TAU);
  else if(o.sp==='rooster')c.ellipse(0,-21,15.5,13,0,0,TAU);
  else c.ellipse(0,-20,15,12.5,0,0,TAU);
  c.fill(); c.stroke();
  if(o.sp==='goose'){c.strokeStyle=INK;c.lineWidth=12;seg(c,6,-24,hx-2,hy+3);c.strokeStyle=fl?'#fff':o.body;c.lineWidth=7.4;seg(c,6,-24,hx-2,hy+3);c.strokeStyle=INK;c.lineWidth=2.4;}
  if(o.special==='quail'||o.special==='guinea'){c.save();c.beginPath();if(o.sp==='chick')c.ellipse(0,-16,13.5,12,0,0,TAU);else c.ellipse(0,-20,15,12.5,0,0,TAU);c.clip();
    c.fillStyle=o.special==='guinea'?'rgba(255,255,255,.85)':'rgba(255,240,210,.7)';
    for(let i=0;i<14;i++){const px=-13+(i*7.3)%26,py=(o.sp==='chick'?-26:-31)+((i*5.1)%22);c.beginPath();c.arc(px,py,o.special==='guinea'?1.5:1.2,0,TAU);c.fill();}c.restore();}
  const hatCoversComb=['helmet','cowboy','crown','pirate'].includes(o.hat)||o.special==='guinea'||o.special==='quail';
  if(!hatCoversComb){
    const comb=o.robo?'#6f7782':adren?'#ff3b1f':'#e8322a';
    if(o.sp==='hen')[[-4,-8.5,3.2],[.5,-10,3.6],[4.5,-7.5,3]].forEach(([x,y,r])=>circ(c,hx+x,hy+y,r,comb));
    else if(o.sp==='rooster')[[-6,-7.5,3.6],[-1.8,-10.5,4.4],[3,-11,4.4],[7,-7.5,3.6]].forEach(([x,y,r])=>circ(c,hx+x,hy+y,r,comb));
  }
  circ(c,hx,hy,hr,head);
  if(o.sp==='chick'&&!hatCoversComb){c.lineWidth=2;seg(c,hx-1,hy-hr+.5,hx-3,hy-hr-5);seg(c,hx+2,hy-hr+.5,hx+3.5,hy-hr-5);c.lineWidth=2.4;}
  if(o.sp==='duck'&&o.head!==o.body){c.fillStyle='#fff';c.beginPath();c.ellipse(hx-2,hy+hr-1.2,5.5,1.8,-.2,0,TAU);c.fill();}
  if(o.sp==='hen'){c.beginPath();c.fillStyle='#e8322a';c.ellipse(hx+6,hy+6.5,2.6,3.8,0,0,TAU);c.fill();c.stroke();}
  if(o.sp==='rooster'){c.beginPath();c.fillStyle='#e8322a';c.ellipse(hx+6.5,hy+7.5,3.2,5,0,0,TAU);c.fill();c.stroke();}
  if(o.sp==='duck'){c.fillStyle='#f39a2b';rr(c,hx+hr-3.5,hy-.5,11,5.5,2.7);c.fill();c.stroke();}
  else if(o.sp==='goose'){c.fillStyle='#f08a1f';c.beginPath();c.moveTo(hx+hr-2.5,hy-3);c.lineTo(hx+hr+8.5,hy+.5);c.lineTo(hx+hr-2.5,hy+3.5);c.closePath();c.fill();c.stroke();circ(c,hx+hr-1.6,hy-3,2.2,INK,false);}
  else if(o.sp==='chick'){c.fillStyle='#f6a723';c.beginPath();c.moveTo(hx+7.5,hy-1.5);c.lineTo(hx+13,hy+.8);c.lineTo(hx+7.5,hy+3);c.closePath();c.fill();c.stroke();}
  else{c.fillStyle='#f6a723';c.beginPath();c.moveTo(hx+6.5,hy-3);c.lineTo(hx+14.5,hy);c.lineTo(hx+6.5,hy+3);c.closePath();c.fill();c.stroke();}
  if(o.special==='quail'){c.fillStyle=fl?'#fff':'#2b1d14';c.beginPath();c.moveTo(hx-1,hy-hr+1);c.quadraticCurveTo(hx-2,hy-hr-11,hx+6,hy-hr-9);c.quadraticCurveTo(hx+2,hy-hr-6,hx+2,hy-hr+1);c.closePath();c.fill();
    c.strokeStyle='#fff4dc';c.lineWidth=1.2;seg(c,hx+2,hy-1,hx+hr-1,hy+2);c.strokeStyle=INK;c.lineWidth=2.4;}
  if(o.special==='guinea'){c.fillStyle='#c98a43';c.beginPath();c.moveTo(hx-3,hy-hr+1);c.lineTo(hx,hy-hr-7);c.lineTo(hx+3,hy-hr+1);c.closePath();c.fill();c.stroke();
    c.fillStyle='#e8322a';c.beginPath();c.ellipse(hx+5,hy+6,1.8,2.8,0,0,TAU);c.fill();c.stroke();}
  if(o.special==='nurse'&&(!o.hat||o.hat==='none'||o.hat==='bandana')){c.fillStyle='#ffffff';c.beginPath();c.moveTo(hx-hr+1,hy-3);c.lineTo(hx-hr+3,hy-hr-4);c.lineTo(hx+hr-2,hy-hr-4);c.lineTo(hx+hr-1,hy-3);c.closePath();c.fill();c.stroke();
    c.fillStyle='#e8322a';c.fillRect(hx-1.2,hy-hr-2.5,2.4,6.5);c.fillRect(hx-3.2,hy-hr-.4,6.4,2.4);}
  drawHat(c,o.special==='nurse'&&o.hat==='bandana'?'none':o.hat,hx,hy,hr,ex,ey,'under');
  c.lineWidth=1.5; circ(c,ex,ey,3.3,'#fff'); circ(c,ex+1.2,ey+.2,1.7,adren?'#e8322a':INK,false);
  if(o.kind!=='player'&&!o.robo){c.lineWidth=2.6;seg(c,ex-4,ey-5,ex+3.5,ey-2);}
  if(o.robo){c.strokeStyle=INK;c.lineWidth=1.6;c.fillStyle='#e8322a';rr(c,ex-5,ey-2.4,9.5,4.8,2);c.fill();c.stroke();c.fillStyle='rgba(255,220,200,.8)';c.fillRect(ex-3.5,ey-1.5,2,1.4);
    seg(c,hx-3,hy-hr+1,hx-6,hy-hr-9);circ(c,hx-6,hy-hr-10,2.2,'#e8322a');c.fillStyle='#6f7782';[[-6,3],[4,6]].forEach(([x,y])=>{c.beginPath();c.arc(x,-20+y*.5,1.2,0,TAU);c.fill();});}
  if(adren&&o.hat!=='pirate'&&o.hat!=='ninja'){ // shades
    c.fillStyle='#111';c.strokeStyle=INK;c.lineWidth=1.5;rr(c,ex-4.5,ey-3,9.5,5.5,2);c.fill();c.stroke();seg(c,ex-4.5,ey-1.5,hx-hr+1,ey-2.5);
    c.fillStyle='rgba(255,255,255,.7)';c.fillRect(ex-2.5,ey-2,2.2,1.4);
  }
  drawHat(c,o.hat,hx,hy,hr,ex,ey,'over');
  c.strokeStyle=INK;c.lineWidth=2.4;c.fillStyle=wing;c.beginPath();
  if(o.sp==='chick')c.ellipse(-2,-15,7,5.5,-.25,0,TAU); else c.ellipse(-2,-19,8,6,-.25,0,TAU);
  c.fill(); c.stroke();
  if(adren&&!fl){c.fillStyle='#ffd23a';c.lineWidth=1.2;c.beginPath();c.moveTo(0,-24);c.lineTo(-4,-18.5);c.lineTo(-1.5,-18.5);c.lineTo(-4,-14);c.lineTo(2,-20);c.lineTo(-.5,-20);c.closePath();c.fill();c.stroke();}
  c.restore();
  c.translate(o.face*3*s,sp.gy*s-bob); c.rotate(o.ang); if(Math.cos(o.ang)<0)c.scale(1,-1);
  drawGun(c,o.gun);
  c.strokeStyle=INK;c.lineWidth=2;circ(c,6,1,4.2,fl?'#fff':o.wing);
  c.restore();
}
function drawStars(c,x,y){c.save();c.translate(x,y);for(let i=0;i<3;i++){const a=S.t*4+i*TAU/3;c.save();c.translate(Math.cos(a)*12,Math.sin(a)*4);c.fillStyle='#ffe066';c.strokeStyle=INK;c.lineWidth=1.2;c.beginPath();
  for(let k=0;k<10;k++){const r=k%2?2:4.5,an=k/10*TAU-Math.PI/2;c.lineTo(Math.cos(an)*r,Math.sin(an)*r);}c.closePath();c.fill();c.stroke();c.restore();}c.restore();}
const FOXPAL={fox:{fur:'#e8742a',belly:'#fff1de',eye:'#ffe066',leg:'#4a2a14'},ataman:{fur:'#c95a1f',belly:'#fff1de',eye:'#ffe066',leg:'#4a2a14'},
  wolf:{fur:'#7f8794',belly:'#e3e6ea',eye:'#ffd23a',leg:'#3b3f47'},wolfboss:{fur:'#5d6470',belly:'#d5d9df',eye:'#ff5a3c',leg:'#2e3138'}};
function drawFox(c,e){
  const s=e.s||1, pal=FOXPAL[e.type]||FOXPAL.fox, wolf=e.type==='wolf'||e.type==='wolfboss';
  c.save(); c.translate(e.x,e.y); c.scale(s,s); shadow(c,17,5);
  const bob=e.moving?Math.abs(Math.sin(e.phase))*2.5:0, lg=e.moving?Math.sin(e.phase)*6:0;
  c.scale(e.face,1); c.lineCap='round'; c.lineJoin='round';
  const fl=e.flash>0, fur=fl?'#fff':pal.fur, belly=fl?'#fff':pal.belly;
  c.strokeStyle=INK; c.lineWidth=5; [[-9,lg],[-4,-lg],[6,-lg],[11,lg]].forEach(([x,l])=>seg(c,x,-10,x+l*.6,0));
  c.strokeStyle=pal.leg; c.lineWidth=3; [[-9,lg],[-4,-lg],[6,-lg],[11,lg]].forEach(([x,l])=>seg(c,x,-10,x+l*.6,0));
  c.translate(0,-bob); c.strokeStyle=INK; c.lineWidth=2.4;
  c.fillStyle=fur; c.beginPath(); c.moveTo(-12,-18); c.quadraticCurveTo(-34,-14,-32,-32); c.quadraticCurveTo(-22,-30,-12,-24); c.closePath(); c.fill(); c.stroke();
  c.fillStyle=belly; c.beginPath(); c.moveTo(-28,-25); c.quadraticCurveTo(-34,-27,-32,-32); c.quadraticCurveTo(-27,-31,-25,-29); c.closePath(); c.fill();
  c.fillStyle=fur; c.beginPath(); c.ellipse(0,-17,16,9.5,0,0,TAU); c.fill(); c.stroke();
  if(wolf){c.fillStyle=fl?'#fff':'rgba(40,44,52,.35)';c.beginPath();c.ellipse(-2,-23,11,3.5,0,0,TAU);c.fill();}
  c.fillStyle=belly; c.beginPath(); c.ellipse(2,-12.5,9,3.5,0,0,TAU); c.fill();
  c.fillStyle=fur; const et=wolf?-44:-42;
  c.beginPath(); c.moveTo(8,-31); c.lineTo(10,et); c.lineTo(15,-32); c.closePath(); c.fill(); c.stroke();
  c.beginPath(); c.moveTo(14,-31); c.lineTo(19,et+1); c.lineTo(20,-29); c.closePath(); c.fill(); c.stroke();
  c.beginPath(); c.arc(14,-25,8.5,0,TAU); c.fill(); c.stroke();
  c.fillStyle=belly; c.beginPath(); c.moveTo(15,-24); c.lineTo(wolf?29:28,-22); c.lineTo(16,-18); c.closePath(); c.fill(); c.stroke();
  c.fillStyle=INK; c.beginPath(); c.arc(wolf?28.5:27.5,-22,2,0,TAU); c.fill();
  c.fillStyle=pal.eye; c.lineWidth=1.4; c.beginPath(); c.ellipse(16,-27,2.6,2,0,0,TAU); c.fill(); c.stroke();
  c.fillStyle=INK; c.beginPath(); c.arc(16.8,-27,1.1,0,TAU); c.fill();
  c.lineWidth=2.4; seg(c,12,-31,19,-29);
  if(e.type==='ataman'){
    c.fillStyle='#1d1d22';rr(c,6,-46,17,11,4);c.fill();c.stroke();
    c.strokeStyle='#3a3a44';c.lineWidth=1.2;for(let i=0;i<4;i++)seg(c,8+i*4,-44,9+i*4,-37);
    c.strokeStyle=INK;c.lineWidth=2;c.fillStyle='#e8322a';rr(c,6,-37,17,3,1);c.fill();c.stroke();
    c.lineWidth=1.4;seg(c,9,-30,22,-25);circ(c,16.5,-27,3.4,'#1d1d22');
  }
  if(e.type==='wolfboss'){
    c.strokeStyle='#e8d6d0';c.lineWidth=1.8;seg(c,12,-33,20,-22);
    c.fillStyle=fur;c.strokeStyle=INK;c.lineWidth=2;[-8,-2,4].forEach(x=>{c.beginPath();c.moveTo(x-3,-25);c.lineTo(x,-32);c.lineTo(x+3,-25);c.closePath();c.fill();c.stroke();});
  }
  c.restore();
}
function drawTurkey(c,e){
  const s=e.s||1, metal=e.type==='steelturkey';
  c.save(); c.translate(e.x,e.y); c.scale(s,s); shadow(c,20,6);
  const bob=e.moving?Math.abs(Math.sin(e.phase))*2.5:0, lg=e.moving?Math.sin(e.phase)*5:0;
  c.save(); c.scale(e.face,1); c.lineCap='round'; c.lineJoin='round';
  c.strokeStyle=INK;c.lineWidth=5.5; seg(c,-5,-12,-5+lg,0); seg(c,5,-12,5-lg,0);
  c.strokeStyle=metal?'#8a939e':'#d9862a';c.lineWidth=3; seg(c,-5,-12,-5+lg,0); seg(c,5,-12,5-lg,0);
  c.translate(0,-bob); c.strokeStyle=INK; c.lineWidth=2.4;
  const fl=e.flash>0, fan=metal?['#6f7782','#c9d0d8','#8a939e','#c9d0d8','#6f7782','#c9d0d8','#8a939e']:['#7a4a26','#e8d3a8','#a3592a','#e8d3a8','#7a4a26','#e8d3a8','#a3592a'];
  for(let i=0;i<7;i++){const a0=Math.PI*.55+i*.16,a1=a0+.16;c.fillStyle=fl?'#fff':fan[i];c.beginPath();c.moveTo(-8,-26);c.arc(-8,-26,30,a0+Math.PI*.35,a1+Math.PI*.35);c.closePath();c.fill();c.stroke();}
  c.fillStyle=fl?'#fff':metal?'#7d8590':'#5b3a22'; c.beginPath(); c.ellipse(0,-23,18,14.5,0,0,TAU); c.fill(); c.stroke();
  c.fillStyle=fl?'#fff':metal?'#5f6670':'#46301d'; c.beginPath(); c.ellipse(-3,-22,9,7,-.3,0,TAU); c.fill(); c.stroke();
  if(metal){c.fillStyle='#c9d0d8';[[-12,-28],[-6,-14],[8,-30],[10,-16],[0,-34]].forEach(([x,y])=>{c.beginPath();c.arc(x,y,1.3,0,TAU);c.fill();});}
  if(e.type==='gturkey'){c.fillStyle='#ffc93a';rr(c,5,-31,7,3.5,1.5);c.fill();c.stroke();c.lineWidth=1;for(let i=0;i<3;i++)seg(c,6+i*2.5,-27.5,6+i*2.5,-25);c.lineWidth=2.4;}
  c.fillStyle=fl?'#fff':metal?'#b8c0ca':'#9db3d4'; c.beginPath(); c.moveTo(9,-30); c.quadraticCurveTo(12,-40,15,-44); c.lineTo(20,-41); c.quadraticCurveTo(17,-34,16,-28); c.closePath(); c.fill(); c.stroke();
  c.beginPath(); c.arc(17,-44,6.5,0,TAU); c.fill(); c.stroke();
  c.fillStyle='#d6312a'; c.beginPath(); c.ellipse(19,-35.5,3,5.5,.2,0,TAU); c.fill(); c.stroke();
  c.beginPath(); c.moveTo(21,-47); c.quadraticCurveTo(26,-44,24,-36); c.lineTo(22,-37); c.quadraticCurveTo(23,-43,20,-45); c.closePath(); c.fill(); c.stroke();
  c.fillStyle=metal?'#8a939e':'#f0b13a'; c.beginPath(); c.moveTo(22,-45); c.lineTo(27.5,-43); c.lineTo(22,-41); c.closePath(); c.fill(); c.stroke();
  if(metal){c.fillStyle='#ff3b1f';c.lineWidth=1.4;c.beginPath();c.arc(18,-46,2.8,0,TAU);c.fill();c.stroke();c.fillStyle='rgba(255,90,60,.4)';c.beginPath();c.arc(18,-46,5,0,TAU);c.fill();
    c.lineWidth=1.6;seg(c,14,-50,11,-58);circ(c,11,-59,2,'#ff3b1f');}
  else{c.fillStyle='#fff'; c.lineWidth=1.4; c.beginPath(); c.arc(18,-46,2.6,0,TAU); c.fill(); c.stroke();
    c.fillStyle=INK; c.beginPath(); c.arc(18.8,-46,1.3,0,TAU); c.fill();}
  c.lineWidth=2.4; seg(c,14.5,-50,21,-48);
  if(e.type==='gturkey'){c.fillStyle='#3e5a2c';c.beginPath();c.moveTo(10,-50);c.lineTo(24,-50);c.lineTo(22,-56);c.lineTo(12,-56);c.closePath();c.fill();c.stroke();rr(c,9,-51,18,3,1.5);c.fillStyle='#2e4420';c.fill();c.stroke();circ(c,17,-53.5,1.6,'#e8322a',false);}
  c.restore();
  c.translate(e.face*4,-20-bob); c.rotate(e.ang); if(Math.cos(e.ang)<0)c.scale(1,-1);
  drawGun(c,metal?'rail':'blunder');
  c.fillStyle=e.flash>0?'#fff':metal?'#7d8590':'#5b3a22'; c.strokeStyle=INK; c.lineWidth=2; c.beginPath(); c.arc(4,1,4.5,0,TAU); c.fill(); c.stroke();
  c.restore();
}
const CROWPAL={crow:{b:'#2e2a33',w:'#211e26',head:'#2e2a33',beak:'#f2b42c',eye:'#ffd23a'},eagle:{b:'#6b4a2b',w:'#553a20',head:'#f4f1e8',beak:'#f2b42c',eye:'#ffd23a'},
  eagleboss:{b:'#5a3a1e',w:'#3f2812',head:'#ffffff',beak:'#ffc93a',eye:'#ff5a3c'},emperor:{b:'#2a2238',w:'#1a1424',head:'#2a2238',beak:'#c9a227',eye:'#b06cff'}};
function drawCrow(c,e){
  const s=e.s||1,pal=CROWPAL[e.type]||CROWPAL.crow,fz=(e.st==='dash'?18:34+Math.sin(e.phase*.4)*5), flap=Math.sin(e.phase*1.4);
  c.save(); c.translate(e.x,e.y); c.fillStyle='rgba(25,50,10,.22)';c.beginPath();c.ellipse(0,1,11*s,4*s,0,0,TAU);c.fill();
  c.scale(s,s); c.translate(0,-fz); c.scale(e.face,1); c.lineJoin='round'; c.strokeStyle=INK; c.lineWidth=2.2;
  const fl=e.flash>0, b=fl?'#fff':pal.b, w=fl?'#fff':pal.w, hd=fl?'#fff':pal.head;
  if(e.type==='emperor'){c.fillStyle=fl?'#fff':'#6a2c91';c.beginPath();c.moveTo(-2,-12);c.lineTo(-26,8);c.lineTo(8,6);c.closePath();c.fill();c.stroke();}
  c.fillStyle=w;c.beginPath();c.moveTo(-2,-8);c.lineTo(-14,-8-14*flap);c.lineTo(4,-6);c.closePath();c.fill();c.stroke();
  c.fillStyle=b;c.beginPath();c.moveTo(-12,-6);c.lineTo(-23,-11);c.lineTo(-22,-2);c.closePath();c.fill();c.stroke();
  c.beginPath();c.ellipse(0,-6,13,8,0,0,TAU);c.fill();c.stroke();
  circ(c,11,-12,6.5,hd);
  c.fillStyle=pal.beak;c.beginPath();
  if(e.type==='crow'||e.type==='emperor'){c.moveTo(16,-14.5);c.lineTo(25,-11.5);c.lineTo(16,-9);}
  else{c.moveTo(15.5,-15);c.quadraticCurveTo(25,-15,23,-8);c.lineTo(20,-10);c.lineTo(15.5,-9);}
  c.closePath();c.fill();c.stroke();
  c.lineWidth=1.2;circ(c,13,-13.5,2.4,pal.eye);circ(c,13.6,-13.5,1.1,INK,false);c.lineWidth=2;seg(c,10,-17,16,-15);
  if(e.type==='emperor'){c.fillStyle='#ffc93a';c.lineWidth=1.6;c.beginPath();c.moveTo(6,-17);c.lineTo(6,-24);c.lineTo(9,-20);c.lineTo(11.5,-26);c.lineTo(14,-20);c.lineTo(17,-24);c.lineTo(17,-17);c.closePath();c.fill();c.stroke();circ(c,11.5,-19,1.2,'#e8322a',false);}
  c.fillStyle=w;c.lineWidth=2.2;c.beginPath();c.moveTo(-3,-7);c.lineTo(-16,-7+14*flap*.8);c.lineTo(5,-4);c.closePath();c.fill();c.stroke();
  c.restore();
}
function drawOwl(c,e){
  const s=e.s||1; c.save(); c.translate(e.x,e.y); c.scale(s,s); shadow(c,13,5); c.scale(e.face,1); c.lineJoin='round'; c.strokeStyle=INK; c.lineWidth=2.4;
  const fl=e.flash>0, b=fl?'#fff':'#8a6a45', d=fl?'#fff':'#6b4f31', bl=fl?'#fff':'#e8d6b0';
  c.strokeStyle=INK;c.lineWidth=4;seg(c,-3,-3,-3,0);seg(c,4,-3,4,0);c.strokeStyle='#f2b42c';c.lineWidth=2;seg(c,-3,-3,-3,0);seg(c,4,-3,4,0);c.strokeStyle=INK;c.lineWidth=2.4;
  c.fillStyle=b;c.beginPath();c.moveTo(-5,-32);c.lineTo(-2,-41);c.lineTo(2,-32);c.closePath();c.fill();c.stroke();c.beginPath();c.moveTo(9,-32);c.lineTo(13,-41);c.lineTo(15,-31);c.closePath();c.fill();c.stroke();
  c.beginPath();c.ellipse(4,-19,14,17,0,0,TAU);c.fill();c.stroke();
  c.fillStyle=bl;c.beginPath();c.ellipse(6,-14,8,10,0,0,TAU);c.fill();
  c.strokeStyle=d;c.lineWidth=1.3;[[3,-16],[8,-14],[5,-10],[9,-8]].forEach(([x,y])=>{c.beginPath();c.moveTo(x-2,y-1);c.lineTo(x,y+1);c.lineTo(x+2,y-1);c.stroke();});
  c.strokeStyle=INK;c.lineWidth=2.4;c.fillStyle=d;c.beginPath();c.ellipse(-6,-17,5.5,11,.15,0,TAU);c.fill();c.stroke();
  c.lineWidth=1.6;[[2.5,-26],[10.5,-26]].forEach(([x,y])=>{circ(c,x,y,4.6,'#fff');circ(c,x+.6,y,3,e.st==='aim'?'#ff5a3c':'#ff9f1c',false);circ(c,x+.9,y,1.4,INK,false);});
  c.fillStyle='#f2b42c';c.beginPath();c.moveTo(5,-23);c.lineTo(8,-23);c.lineTo(6.5,-19);c.closePath();c.fill();c.stroke();
  c.lineWidth=2;seg(c,-1,-31,5,-29);seg(c,8,-29,14,-31);
  c.restore();
}
function drawFerret(c,e){
  const s=e.s||1, dr=e.type==='drferret';
  c.save(); c.translate(e.x,e.y); c.scale(s,s); shadow(c,17,4.5);
  const bob=e.moving?Math.abs(Math.sin(e.phase))*2:0, lg=e.moving?Math.sin(e.phase)*5:0;
  c.save(); c.scale(e.face,1); c.lineCap='round'; c.lineJoin='round';
  const fl=e.flash>0, fur=fl?'#fff':'#d8b48a', dk=fl?'#fff':'#8a5a3a';
  c.strokeStyle=INK;c.lineWidth=4.5;[[-10,lg],[-4,-lg],[6,-lg],[11,lg]].forEach(([x,l])=>seg(c,x,-7,x+l*.5,0));
  c.strokeStyle=dk;c.lineWidth=2.6;[[-10,lg],[-4,-lg],[6,-lg],[11,lg]].forEach(([x,l])=>seg(c,x,-7,x+l*.5,0));
  c.translate(0,-bob);c.strokeStyle=INK;c.lineWidth=2.2;
  c.fillStyle=dk;c.beginPath();c.ellipse(-22,-12,10,3.6,-.3,0,TAU);c.fill();c.stroke();
  c.fillStyle=fur;c.beginPath();c.ellipse(0,-12,18,7.5,0,0,TAU);c.fill();c.stroke();
  c.fillStyle=dk;c.beginPath();c.ellipse(-2,-17,13,2.6,0,0,TAU);c.fill();
  if(dr){c.fillStyle='#fdfdfb';c.beginPath();c.moveTo(-14,-18);c.lineTo(10,-19);c.lineTo(12,-5);c.lineTo(-16,-5);c.closePath();c.fill();c.stroke();c.strokeStyle='#c9d0d8';c.lineWidth=1.2;seg(c,-2,-18,-2,-6);c.strokeStyle=INK;c.lineWidth=2.2;}
  c.fillStyle=fur;circ(c,17,-17,7,fur);
  c.fillStyle=dk;c.beginPath();c.ellipse(19,-18,5,2.6,.1,0,TAU);c.fill();
  c.fillStyle=fur;c.beginPath();c.arc(12,-23,2.6,0,TAU);c.fill();c.stroke();
  c.fillStyle='#f2b8c0';c.beginPath();c.arc(24,-16,1.6,0,TAU);c.fill();
  c.lineWidth=1.2;circ(c,19.5,-18.3,1.8,'#fff');circ(c,20,-18.3,.9,INK,false);
  if(dr){c.lineWidth=1.8;circ(c,15,-24,3.4,'#7fd4ff');circ(c,21,-24,3.4,'#7fd4ff');c.fillStyle='rgba(255,255,255,.7)';c.fillRect(13.6,-25.6,1.6,1.4);}
  else{c.fillStyle='#4a6430';c.lineWidth=2;c.beginPath();c.arc(17,-20,7.4,Math.PI*1.05,Math.PI*1.95);c.closePath();c.fill();c.stroke();}
  c.restore();
  c.translate(e.face*6,-13-bob); c.rotate(e.ang); if(Math.cos(e.ang)<0)c.scale(1,-1);
  drawGun(c,dr?'rail':'pistol');
  c.restore();
}
function drawBadger(c,e){
  const s=e.s||1; c.save(); c.translate(e.x,e.y); c.scale(s,s); shadow(c,22,6);
  const bob=e.moving?Math.abs(Math.sin(e.phase))*2:0, lg=e.moving?Math.sin(e.phase)*5:0;
  c.scale(e.face,1); c.lineCap='round'; c.lineJoin='round';
  const fl=e.flash>0, fur=fl?'#fff':'#8d8f94', dk=fl?'#fff':'#2b2b30';
  c.strokeStyle=INK;c.lineWidth=6;[[-12,lg],[-5,-lg],[7,-lg],[13,lg]].forEach(([x,l])=>seg(c,x,-9,x+l*.5,0));
  c.strokeStyle=dk;c.lineWidth=3.6;[[-12,lg],[-5,-lg],[7,-lg],[13,lg]].forEach(([x,l])=>seg(c,x,-9,x+l*.5,0));
  c.strokeStyle='#e8e2d8';c.lineWidth=1.6;[13,7].forEach(x=>{seg(c,x+lg*.5,0,x+3+lg*.5,1);});
  c.translate(0,-bob);c.strokeStyle=INK;c.lineWidth=2.4;
  c.fillStyle=fur;c.beginPath();c.ellipse(0,-15,21,12,0,0,TAU);c.fill();c.stroke();
  c.strokeStyle='rgba(43,29,20,.35)';c.lineWidth=1.4;for(let x=-14;x<12;x+=5)seg(c,x,-25,x-2,-19);c.strokeStyle=INK;c.lineWidth=2.4;
  c.fillStyle='#f4f1e8';c.beginPath();c.ellipse(19,-18,10,8,0,0,TAU);c.fill();c.stroke();
  c.save();c.beginPath();c.ellipse(19,-18,9,7,0,0,TAU);c.clip();c.fillStyle=dk;c.fillRect(12,-26,4,16);c.fillRect(21,-26,4,16);c.restore();
  c.fillStyle=INK;c.beginPath();c.arc(29,-17,2.2,0,TAU);c.fill();
  c.lineWidth=1.2;circ(c,22.5,-20,1.8,'#ff5a3c');c.lineWidth=2.2;seg(c,20,-24,26,-22);
  c.fillStyle='#f4f1e8';c.beginPath();c.arc(16,-26,2.6,0,TAU);c.fill();c.stroke();
  c.restore();
}
function drawRaccoon(c,e){
  c.save(); c.translate(e.x,e.y);
  if(e.st==='tell'){c.translate(rand(-1.5,1.5),0);}
  shadow(c,16,5);
  const bob=e.moving?Math.abs(Math.sin(e.phase))*2.5:0, lg=e.moving?Math.sin(e.phase)*6:0;
  c.scale(e.face,1); c.lineCap='round'; c.lineJoin='round';
  const fl=e.flash>0, fur=fl?'#fff':'#8b8f98', lt=fl?'#fff':'#c9ccd2';
  c.strokeStyle=INK;c.lineWidth=5;[[-8,lg],[-3,-lg],[6,-lg],[10,lg]].forEach(([x,l])=>seg(c,x,-9,x+l*.6,0));
  c.strokeStyle='#3b3d44';c.lineWidth=3;[[-8,lg],[-3,-lg],[6,-lg],[10,lg]].forEach(([x,l])=>seg(c,x,-9,x+l*.6,0));
  c.translate(0,-bob);c.strokeStyle=INK;c.lineWidth=2.4;
  c.save();c.translate(-14,-18);c.rotate(-.7);c.fillStyle=fur;c.beginPath();c.ellipse(-8,0,12,5.5,0,0,TAU);c.fill();c.stroke();
  c.fillStyle=fl?'#fff':'#3b3d44';[-14,-8,-2].forEach(x=>c.fillRect(x,-5,2.6,10));c.strokeStyle=INK;c.beginPath();c.ellipse(-8,0,12,5.5,0,0,TAU);c.stroke();c.restore();
  c.fillStyle=fur;c.beginPath();c.ellipse(0,-15,15,10,0,0,TAU);c.fill();c.stroke();
  c.fillStyle=lt;c.beginPath();c.ellipse(2,-11,8,3.5,0,0,TAU);c.fill();
  c.fillStyle=fur;c.beginPath();c.moveTo(7,-29);c.lineTo(8,-36);c.lineTo(13,-30);c.closePath();c.fill();c.stroke();c.beginPath();c.moveTo(14,-30);c.lineTo(18,-36);c.lineTo(19,-28);c.closePath();c.fill();c.stroke();
  circ(c,13,-23,8.5,fur);
  c.fillStyle=lt;c.beginPath();c.moveTo(14,-21);c.lineTo(25,-20);c.lineTo(15,-16);c.closePath();c.fill();c.stroke();
  c.fillStyle=INK;c.beginPath();c.arc(24.5,-20,1.8,0,TAU);c.fill();
  c.fillStyle='#1d1d22';c.beginPath();c.ellipse(15,-25,6,3.2,.15,0,TAU);c.fill();
  c.lineWidth=1.2;circ(c,16,-25.3,1.9,'#fff');circ(c,16.6,-25.3,.9,INK,false);
  c.restore();
}
function drawRat(c,e){
  c.save(); c.translate(e.x,e.y); shadow(c,10,3.5);
  const bob=e.moving?Math.abs(Math.sin(e.phase))*1.5:0;
  c.scale(e.face,1); c.lineCap='round'; c.lineJoin='round'; c.translate(0,-bob);
  const fl=e.flash>0, fur=fl?'#fff':'#7d746c';
  c.strokeStyle='#e89aa6';c.lineWidth=2;c.beginPath();c.moveTo(-9,-6);c.quadraticCurveTo(-20,-4,-22,-12+Math.sin(e.phase)*2);c.stroke();
  c.strokeStyle=INK;c.lineWidth=2;c.fillStyle=fur;c.beginPath();c.ellipse(0,-7,10,6,0,0,TAU);c.fill();c.stroke();
  c.beginPath();c.moveTo(6,-11);c.lineTo(16,-6);c.lineTo(6,-3);c.closePath();c.fill();c.stroke();
  circ(c,15.5,-6,1.4,'#e89aa6',false);
  c.lineWidth=1.5;circ(c,5,-12,3,'#f2b8c0');circ(c,9.5,-8.5,1.3,'#e8322a',false);
  c.restore();
}
function drawObstacle(c,o){
  c.save(); c.translate(o.x,o.y); c.strokeStyle=INK; c.lineWidth=2.4; c.lineJoin='round';
  const r=o.r;
  if(o.type==='hay'){
    const h=r*1.05, ry=r*.42;
    c.fillStyle='rgba(25,50,10,.3)'; c.beginPath(); c.ellipse(7,3,r*1.08,ry*1.1,0,0,TAU); c.fill();
    c.fillStyle='#e3b23f'; c.beginPath(); c.moveTo(-r,-h); c.lineTo(-r,0); c.ellipse(0,0,r,ry,0,Math.PI,0,true); c.lineTo(r,-h); c.closePath(); c.fill(); c.stroke();
    c.strokeStyle='#b8862a'; c.lineWidth=1.6; for(let i=-2;i<=2;i++){seg(c,i*r*.38,-h+ry*.9,i*r*.38,ry*.9*Math.sqrt(1-(i*.38)**2)-1);}
    c.strokeStyle=INK; c.lineWidth=2.4; c.fillStyle='#f6d46e'; c.beginPath(); c.ellipse(0,-h,r,ry,0,0,TAU); c.fill(); c.stroke();
    c.strokeStyle='#c99a35'; c.lineWidth=1.6; c.beginPath(); for(let a=0;a<TAU*2.6;a+=.25){const q=a/(TAU*2.6);c.lineTo(Math.cos(a)*r*.85*q,-h+Math.sin(a)*ry*.85*q);} c.stroke();
    c.strokeStyle='#c0392b'; c.lineWidth=2.2; c.beginPath(); c.moveTo(-r,-h*.55); c.quadraticCurveTo(0,-h*.55+ry*1.9,r,-h*.55); c.stroke();
  } else if(o.type==='barrel'){
    const h=r*1.7, ry=r*.42;
    c.fillStyle='rgba(25,50,10,.3)'; c.beginPath(); c.ellipse(6,3,r*1.1,ry*1.1,0,0,TAU); c.fill();
    c.fillStyle='#a8622f'; c.beginPath(); c.moveTo(-r,-h); c.quadraticCurveTo(-r*1.15,-h/2,-r,0); c.ellipse(0,0,r,ry,0,Math.PI,0,true); c.quadraticCurveTo(r*1.15,-h/2,r,-h); c.closePath(); c.fill(); c.stroke();
    c.strokeStyle='#7a4320'; c.lineWidth=1.5; seg(c,-r*.4,-h+ry,-r*.42,ry*.8); seg(c,r*.4,-h+ry,r*.42,ry*.8);
    c.strokeStyle='#55555c'; c.lineWidth=3; [.25,.75].forEach(f=>{c.beginPath();c.ellipse(0,-h*f,r*1.1,ry,0,0,Math.PI);c.stroke();});
    c.strokeStyle=INK; c.lineWidth=2.4; c.fillStyle='#8a4f25'; c.beginPath(); c.ellipse(0,-h,r,ry,0,0,TAU); c.fill(); c.stroke();
    c.strokeStyle='#6a3b1b'; c.lineWidth=1.4; c.beginPath(); c.ellipse(0,-h,r*.6,ry*.6,0,0,TAU); c.stroke();
  } else if(o.type==='stump'){
    const h=r*.75, ry=r*.42;
    c.fillStyle='rgba(25,50,10,.3)'; c.beginPath(); c.ellipse(6,3,r*1.15,ry*1.15,0,0,TAU); c.fill();
    c.fillStyle='#7a4a24'; c.beginPath(); c.moveTo(-r,-h); c.lineTo(-r-4,0); c.ellipse(0,0,r+4,ry+1,0,Math.PI,0,true); c.lineTo(r,-h); c.closePath(); c.fill(); c.stroke();
    c.strokeStyle='#5a3418'; c.lineWidth=1.6; for(let i=-2;i<=2;i++){seg(c,i*r*.35,-h+ry*.8,i*r*.38,ry*.6);}
    c.strokeStyle=INK; c.lineWidth=2.2; c.fillStyle='#7a4a24'; [[-r-6,1,-r-14,4],[r+5,0,r+13,5]].forEach(([a,b,cx,cy])=>{c.beginPath();c.moveTo(a,b-5);c.quadraticCurveTo(cx,cy-6,cx,cy);c.lineTo(a+2,b+2);c.closePath();c.fill();c.stroke();});
    c.fillStyle='#e8c690'; c.beginPath(); c.ellipse(0,-h,r,ry,0,0,TAU); c.fill(); c.stroke();
    c.strokeStyle='#b88a52'; c.lineWidth=1.3; [.72,.48,.24].forEach(k=>{c.beginPath();c.ellipse(0,-h,r*k,ry*k,0,0,TAU);c.stroke();});
    c.strokeStyle='#5a3418'; c.lineWidth=1.4; seg(c,0,-h,r*.6,-h-ry*.3);
    c.fillStyle='#6db343'; c.strokeStyle=INK; c.lineWidth=1.4; c.beginPath(); c.ellipse(-r*.55,-h*.4,4,2.4,-.6,0,TAU); c.fill(); c.stroke();
  } else if(o.type==='bush'){
    c.fillStyle='rgba(25,50,10,.3)'; c.beginPath(); c.ellipse(6,3,r*1.15,r*.45,0,0,TAU); c.fill();
    const blobs=[[-r*.55,-r*.45,r*.62],[r*.5,-r*.42,r*.6],[0,-r*.95,r*.7],[-r*.2,-r*.35,r*.6],[r*.15,-r*.5,r*.55]];
    c.fillStyle='#4f8f2c'; blobs.forEach(([x,y,b])=>{c.beginPath();c.arc(x,y,b,0,TAU);c.fill();c.stroke();});
    blobs.forEach(([x,y,b])=>{c.beginPath();c.arc(x,y,b-2.4,0,TAU);c.fill();});
    c.fillStyle='#6db343'; blobs.forEach(([x,y,b])=>{c.beginPath();c.arc(x-b*.25,y-b*.3,b*.45,0,TAU);c.fill();});
    c.fillStyle='#e8322a'; [[-r*.5,-r*.6],[r*.35,-r*.9],[r*.55,-r*.35],[-r*.05,-r*1.2]].forEach(([x,y])=>{c.beginPath();c.arc(x,y,2.6,0,TAU);c.fill();});
  } else {
    c.fillStyle='rgba(25,50,10,.3)'; c.beginPath(); c.ellipse(6,3,r*1.1,r*.42,0,0,TAU); c.fill();
    c.fillStyle='#a9a39a'; c.beginPath(); c.moveTo(-r,0); c.lineTo(-r*.95,-r*.55); c.lineTo(-r*.45,-r*1.05); c.lineTo(r*.3,-r*1.1); c.lineTo(r*.95,-r*.6); c.lineTo(r,0); c.quadraticCurveTo(0,r*.4,-r,0); c.closePath(); c.fill(); c.stroke();
    c.fillStyle='#c8c2b8'; c.beginPath(); c.moveTo(-r*.75,-r*.55); c.lineTo(-r*.4,-r*.95); c.lineTo(r*.25,-r*1); c.lineTo(r*.1,-r*.6); c.closePath(); c.fill();
    c.strokeStyle='#7f796f'; c.lineWidth=1.5; seg(c,r*.1,-r*.6,r*.5,-r*.2);
  }
  c.restore();
}
function drawPickup(c,p){
  const bob=Math.sin(p.ph*4)*3; if(p.t<3&&Math.floor(p.t*8)%2)return;
  c.save(); c.translate(p.x,p.y);
  c.strokeStyle='rgba(255,236,150,'+(.5+Math.sin(p.ph*6)*.3)+')'; c.lineWidth=3; c.beginPath(); c.ellipse(0,0,18,7,0,0,TAU); c.stroke();
  c.translate(0,-14+bob); c.strokeStyle=INK; c.lineWidth=2.2; c.lineJoin='round';
  if(p.kind==='corn'){
    c.rotate(-.5); c.fillStyle='#f6c42d'; c.beginPath(); c.ellipse(0,0,6,12,0,0,TAU); c.fill(); c.stroke();
    c.fillStyle='#e0a91f'; for(let y=-8;y<=8;y+=4)for(let x=-3;x<=3;x+=3){c.beginPath();c.arc(x,y,1,0,TAU);c.fill();}
    c.fillStyle='#6db343'; c.beginPath(); c.moveTo(0,12); c.quadraticCurveTo(-11,6,-8,-6); c.quadraticCurveTo(-4,4,0,8); c.closePath(); c.fill(); c.stroke();
    c.beginPath(); c.moveTo(0,12); c.quadraticCurveTo(11,6,8,-6); c.quadraticCurveTo(4,4,0,8); c.closePath(); c.fill(); c.stroke();
  } else if(p.kind==='nade'){
    c.fillStyle='#fffaf0'; c.beginPath(); c.ellipse(0,0,8,10.5,0,0,TAU); c.fill(); c.stroke();
    c.fillStyle='#c0392b'; c.fillRect(-7.6,-1.5,15.2,4); c.strokeRect(-7.6,-1.5,15.2,4);
  } else {
    c.fillStyle='#b97c47'; rr(c,-13,-9,26,18,3); c.fill(); c.stroke();
    c.strokeStyle='#8a5a2b'; c.lineWidth=1.6; seg(c,-13,-3,13,-3); seg(c,-13,3,13,3);
    c.save(); c.translate(-10,-12); c.scale(.62,.62); drawGun(c,p.kind); c.restore();
  }
  c.restore();
}
function drawParts(c,ground){
  for(const p of parts){
    const a=1-p.t/p.max;
    if(ground!==(p.k==='splat'))continue;
    if(p.k==='splat'){c.save();c.globalAlpha=Math.min(1,a*2);c.translate(p.x,p.y);
      c.fillStyle='#fffaf0';c.beginPath();for(let i=0;i<9;i++){const an=i/9*TAU,q=p.r*(.75+((p.seed*97*(i+1))%1)*.5);c.lineTo(Math.cos(an)*q,Math.sin(an)*q*.5);}c.closePath();c.fill();
      c.fillStyle='#ffb21f';c.beginPath();c.ellipse(1,0,p.r*.42,p.r*.24,0,0,TAU);c.fill();c.restore();}
    else if(p.k==='feather'){c.save();c.globalAlpha=Math.min(1,a*3);c.translate(p.x,p.y-p.z);c.rotate(p.rot);
      c.fillStyle=p.col;c.strokeStyle=INK;c.lineWidth=1;c.beginPath();c.ellipse(0,0,5.5,2.2,0,0,TAU);c.fill();c.stroke();c.restore();}
    else if(p.k==='puff'){c.globalAlpha=a*.85;c.fillStyle=p.col;c.beginPath();c.arc(p.x,p.y-p.z,p.r*(1+p.t/p.max),0,TAU);c.fill();c.globalAlpha=1;}
    else if(p.k==='shell'){c.save();c.translate(p.x,p.y-p.z);c.rotate(p.rot);c.globalAlpha=Math.min(1,a*3);c.fillStyle=p.dirt?'#8a5a2b':'#fffaf0';c.strokeStyle=INK;c.lineWidth=1;c.beginPath();c.moveTo(-4,-2);c.lineTo(4,-3);c.lineTo(2,3);c.closePath();c.fill();c.stroke();c.restore();}
    else if(p.k==='flash'){c.save();c.translate(p.x,p.y-p.z);c.rotate(p.a);c.scale(p.s,p.s);c.fillStyle='#fff3a0';c.beginPath();
      for(let i=0;i<8;i++){const an=i/8*TAU,q=i%2?4:11;c.lineTo(Math.cos(an)*q*1.3,Math.sin(an)*q*.8);}c.closePath();c.fill();c.fillStyle='#fff';c.beginPath();c.arc(0,0,3.5,0,TAU);c.fill();c.restore();}
    else if(p.k==='plus'){c.save();c.globalAlpha=Math.min(1,a*2);c.translate(p.x,p.y-p.z);c.fillStyle='#5fcf3f';c.strokeStyle=INK;c.lineWidth=1.4;c.beginPath();c.rect(-2,-6,4,12);c.rect(-6,-2,12,4);c.fill();c.fillStyle='#9cf27a';c.fillRect(-1.2,-5,2.4,10);c.fillRect(-5,-1.2,10,2.4);c.restore();}
    else if(p.k==='beam'){c.save();c.lineCap='round';c.globalAlpha=a;c.strokeStyle='rgba(120,230,255,.55)';c.lineWidth=16*a+2;seg(c,p.x,p.y-19,p.x2,p.y2-19);c.strokeStyle='#ffffff';c.lineWidth=4.5*a+1;seg(c,p.x,p.y-19,p.x2,p.y2-19);c.restore();}
    else if(p.k==='ring'){const R=p.R||130,f=1-a*a*.6;c.globalAlpha=a;c.strokeStyle=p.col||'#fff6c8';c.lineWidth=6*a+1;c.beginPath();c.ellipse(p.x,p.y,R*f,R*.42*f,0,0,TAU);c.stroke();c.globalAlpha=1;}
  }
}
function drawEnemy(c,e){
  const T=ETYPE[e.type], s=e.s||1;
  if(e.st==='tell'){
    const len=(T.dash||520)*(e.dashLen||.5);
    c.save();c.globalAlpha=.25+Math.sin(S.t*30)*.1;c.translate(e.x,e.y);c.rotate(Math.atan2(e.dy,e.dx));c.fillStyle='#e8322a';c.fillRect(0,-e.r*.8,len,e.r*1.6);c.restore();
  }
  const t=e.type;
  if(t==='fox'||t==='ataman'||t==='wolf'||t==='wolfboss')drawFox(c,e);
  else if(t==='turkey'||t==='gturkey'||t==='steelturkey')drawTurkey(c,e);
  else if(t==='crow'||t==='eagle'||t==='eagleboss'||t==='emperor')drawCrow(c,e);
  else if(t==='raccoon')drawRaccoon(c,e);
  else if(t==='rat')drawRat(c,e);
  else if(t==='owl')drawOwl(c,e);
  else if(t==='ferret'||t==='drferret')drawFerret(c,e);
  else if(t==='badger')drawBadger(c,e);
  else if(t==='mole')drawMole(c,e);
  else if(t==='robohen')drawBird(c,{...e,sp:'hen',kind:'hen',gun:'zapper',robo:true,body:'#9aa3ad',wing:'#6f7782'});
  else drawBird(c,{...e,sp:'hen',kind:'hen',gun:'eggun'});
  const top=T.fly?-(60*s):-(t==='rat'?22:t==='ferret'?32:52)*s;
  if(e.chill>0){c.save();c.globalAlpha=.32;c.fillStyle='#9fdcff';c.beginPath();c.ellipse(e.x,e.y+(T.fly?-38*s:-18*s),e.r*1.3,e.r*1.15,0,0,TAU);c.fill();c.restore();}
  if(e.stun>0)drawStars(c,e.x,e.y+top+4);
  if(e.kami){const bl=Math.floor(S.t*(e.kamiT<1.2?16:8))%2;c.save();c.globalAlpha=bl?.5:.15;c.fillStyle='#ff3b1f';c.beginPath();c.ellipse(e.x,e.y-18*s,e.r*1.4,e.r*1.3,0,0,TAU);c.fill();c.restore();
    const bx=e.x,by=e.y+top-6;c.fillStyle='#2b2b33';c.strokeStyle=INK;c.lineWidth=1.8;c.beginPath();c.arc(bx,by,6,0,TAU);c.fill();c.stroke();
    c.strokeStyle='#c9973f';c.lineWidth=2;c.beginPath();c.moveTo(bx+3,by-4);c.quadraticCurveTo(bx+7,by-10,bx+10,by-9);c.stroke();
    c.fillStyle=bl?'#ffd23a':'#ff7a1a';c.beginPath();c.arc(bx+10,by-9,2.6+Math.random()*1.2,0,TAU);c.fill();}
  if(e.st==='tell'||e.st==='aim'){c.font='900 18px Rubik, system-ui, sans-serif';c.textAlign='center';c.lineWidth=4;c.strokeStyle=INK;c.strokeText('!',e.x,e.y+top-4);c.fillStyle=e.st==='aim'?'#ff5a3c':'#ffc93a';c.fillText('!',e.x,e.y+top-4);}
}
function drawWarnings(c){
  for(const e of enemies){if(e.dead||e.st!=='aim')continue;const s=e.s||1,a=.45+Math.sin(S.t*30)*.25;
    c.save();c.globalAlpha=a;c.strokeStyle='#ff3b2e';c.lineWidth=2.2;c.setLineDash([10,6]);seg(c,e.x,e.y-20*s,e.x+e.dx*720,e.y-20*s+e.dy*720);c.setLineDash([]);c.restore();}
  if(S.night){
    for(const b of bombs){if(b.from!=='e')continue;c.save();c.globalAlpha=.9;c.strokeStyle='#ff5a3c';c.lineWidth=2.5;c.beginPath();c.ellipse(b.x,b.y,b.r,b.r*.42,0,0,TAU);c.stroke();c.restore();}
    for(const e of enemies){if(e.dead||e.st!=='tell')continue;const len=(ETYPE[e.type].dash||520)*(e.dashLen||.5);c.save();c.globalAlpha=.3;c.translate(e.x,e.y);c.rotate(Math.atan2(e.dy,e.dx));c.fillStyle='#e8322a';c.fillRect(0,-e.r*.8,len,e.r*1.6);c.restore();}
  }
}
function playerSprite(){return {x:P.x,y:P.y,face:P.face,ang:P.ang,phase:P.phase,moving:P.moving,flash:P.flash,kind:'player',gun:P.w,blink:P.inv>0,buff:P.buff,...P.look};}
function render(){
  const c=ctx;
  c.setTransform(DPR,0,0,DPR,0,0);
  c.fillStyle=MAPS[MAP].out; c.fillRect(0,0,VW,VH);
  const Z=S.mode==='menu'?SC*MENU_ZOOM:SC;
  c.save(); c.scale(Z,Z);
  let sx=0,sy=0; if(S.shake>0&&!REDUCED){sx=(Math.random()-.5)*S.shake;sy=(Math.random()-.5)*S.shake;}
  c.translate(-camX+sx,-camY+sy);
  c.drawImage(ground,0,0);
  drawRiverDyn(c);
  drawParts(c,true);
  for(const h of holes)drawHole(c,h);
  for(const z of zones){const k=Math.min(1,z.t/.4),a=.22+Math.sin(S.t*6)*.06;c.save();c.globalAlpha=a*k;c.fillStyle='#9cf27a';c.beginPath();c.ellipse(z.x,z.y,z.r,z.r*.45,0,0,TAU);c.fill();
    c.globalAlpha=.85*k;c.strokeStyle='#5fcf3f';c.lineWidth=3;c.setLineDash([12,8]);c.lineDashOffset=-S.t*30;c.stroke();c.setLineDash([]);
    c.fillStyle='#ffffff';c.strokeStyle=INK;c.lineWidth=1.5;for(let i=0;i<4;i++){const an=S.t*.8+i*TAU/4,px=z.x+Math.cos(an)*z.r*.55,py=z.y+Math.sin(an)*z.r*.25-8-Math.sin(S.t*3+i)*4;c.fillRect(px-2,py-6,4,12);c.fillRect(px-6,py-2,12,4);}
    c.restore();}
  for(const p of pickups)drawPickup(c,p);
  for(const b of bombs){const k=1-b.t/b.max;c.save();c.translate(b.x,b.y);
    c.globalAlpha=.25+k*.35;c.fillStyle=b.from==='p'?'#ffc93a':'#e8322a';c.beginPath();c.ellipse(0,0,b.r*k,b.r*.42*k,0,0,TAU);c.fill();
    c.globalAlpha=.9;c.strokeStyle=b.from==='p'?'#fff3b0':'#ff5a3c';c.lineWidth=2.5;c.beginPath();c.ellipse(0,0,b.r,b.r*.42,0,0,TAU);c.stroke();
    c.globalAlpha=1;if(b.lob){c.translate((b.sx-b.x)*(1-k),(b.sy-b.y)*(1-k));c.translate(0,-(Math.sin(k*Math.PI)*130+14));}else{const z=(1-k)*190+8;c.translate(0,-z);}c.fillStyle='#fffaf0';c.strokeStyle=INK;c.lineWidth=2;c.beginPath();c.ellipse(0,0,6,7.5,0,0,TAU);c.fill();c.stroke();c.restore();}
  for(const n of nades){c.fillStyle='rgba(25,50,10,.3)';c.beginPath();c.ellipse(n.x,n.y,7,3,0,0,TAU);c.fill();}
  const list=[];
  for(const o of OBS)list.push({y:o.y,f:()=>drawObstacle(c,o)});
  for(const e of enemies)list.push({y:e.y+(ETYPE[e.type].fly?60:0),f:()=>drawEnemy(c,e)});
  if(P.alive)list.push({y:P.y,f:()=>drawBird(c,playerSprite())});
  for(const a of allies){if(a.down>0)continue;list.push({y:a.y,f:()=>{if(a.cls==='medic'&&S.mode!=='menu'){c.save();c.globalAlpha=.18+Math.sin(S.t*3)*.05;c.strokeStyle='#5fcf3f';c.lineWidth=2;c.setLineDash([8,8]);c.beginPath();c.ellipse(a.x,a.y,240,100,0,0,TAU);c.stroke();c.restore();}c.save();c.strokeStyle='rgba(95,207,63,.9)';c.lineWidth=2.5;c.beginPath();c.ellipse(a.x,a.y+1,16,6,0,0,TAU);c.stroke();c.restore();
    drawBird(c,{x:a.x,y:a.y,face:a.face,ang:a.ang,phase:a.phase,moving:a.moving,flash:a.flash,kind:'player',gun:a.gun,buff:a.buff,...a.look});}});}
  for(const n of nades)list.push({y:n.y,f:()=>{c.save();c.translate(n.x,n.y-n.z-8);c.rotate(n.rot);c.fillStyle=n.t<.35&&Math.floor(S.t*20)%2?'#ffd34d':'#fffaf0';c.strokeStyle=INK;c.lineWidth=2;
    c.beginPath();c.ellipse(0,0,6,7.5,0,0,TAU);c.fill();c.stroke();c.fillStyle='#c0392b';c.fillRect(-5.6,-1,11.2,3);c.restore();}});
  list.sort((a,b)=>a.y-b.y); for(const it of list)it.f();
  for(const b of bullets){
    if(b.from==='p'&&b.kind==='flame'){const q=1-b.life/(b.max||.36);c.globalAlpha=Math.max(0,.9-q*.8);c.fillStyle=q<.3?'#fff2a0':q<.65?'#ff9a1f':'#e8322a';c.beginPath();c.arc(b.x,b.y-19,4+q*17,0,TAU);c.fill();c.globalAlpha=1;continue;}
    if(b.from==='p'&&b.kind==='ice'){c.save();c.translate(b.x,b.y-19);c.rotate(Math.atan2(b.vy,b.vx));c.fillStyle='#e6f8ff';c.strokeStyle='#3b8fd1';c.lineWidth=1.4;c.beginPath();c.moveTo(9,0);c.lineTo(-6,-3.2);c.lineTo(-3,0);c.lineTo(-6,3.2);c.closePath();c.fill();c.stroke();c.restore();continue;}
    if(b.from==='e'&&b.kind==='bolt'){c.save();c.translate(b.x,b.y-19);c.rotate(Math.atan2(b.vy,b.vx));c.fillStyle='rgba(255,60,40,.35)';c.beginPath();c.ellipse(0,0,13,6,0,0,TAU);c.fill();c.fillStyle='#ff4d2e';c.strokeStyle=INK;c.lineWidth=1.4;c.beginPath();c.ellipse(0,0,8,3,0,0,TAU);c.fill();c.stroke();c.restore();continue;}
    if(b.from==='e'&&b.kind==='feather'){c.save();c.translate(b.x,b.y-19);c.rotate(Math.atan2(b.vy,b.vx));c.fillStyle='#f4e9d2';c.strokeStyle=INK;c.lineWidth=1.3;c.beginPath();c.ellipse(0,0,10,2.8,0,0,TAU);c.fill();c.stroke();c.fillStyle='#8a6a45';c.fillRect(-10,-1,5,2);c.restore();continue;}
    if(b.from==='e'&&(b.kind==='rock'||b.kind==='pellet'||b.kind==='dirt')){c.fillStyle=b.kind==='rock'?'#8d8a85':b.kind==='dirt'?'#8a5a2b':'#c9c2b5';c.strokeStyle=INK;c.lineWidth=1.6;c.beginPath();c.arc(b.x,b.y-19,b.r,0,TAU);c.fill();c.stroke();c.fillStyle='rgba(25,50,10,.2)';c.beginPath();c.ellipse(b.x,b.y,b.r*.8,b.r*.3,0,0,TAU);c.fill();continue;}
    if(b.from==='p'&&b.kind==='yarn'){c.save();c.translate(b.x,b.y-19);
      c.strokeStyle='rgba(255,111,168,.55)';c.lineWidth=2;c.beginPath();const a=Math.atan2(b.vy,b.vx);c.moveTo(-Math.cos(a)*8,-Math.sin(a)*8);c.quadraticCurveTo(-Math.cos(a)*18+Math.sin(b.spin)*5,-Math.sin(a)*18,-Math.cos(a)*28,-Math.sin(a)*28+Math.cos(b.spin)*4);c.stroke();
      c.rotate(b.spin);c.strokeStyle=INK;c.lineWidth=2;circ(c,0,0,b.r,'#ff7fb6');
      c.strokeStyle='#c2407e';c.lineWidth=1.3;for(let i=-1;i<=1;i++){c.beginPath();c.ellipse(0,i*2.6,b.r*.85,1.8,0,0,TAU);c.stroke();}
      c.restore();continue;}
    if(b.from==='p'&&b.kind==='figure'){c.save();c.translate(b.x,b.y-19);c.rotate(S.t*9+(b.shape||0));c.fillStyle=FIGCOL[b.shape||0];c.strokeStyle=INK;c.lineWidth=1.4;figShape(c,b.shape||0,7.5);c.fill();c.stroke();c.restore();continue;}
    if(b.from==='p'){
      const k=b.kind;
      const col=k==='turbocat'?'rgba(255,170,90,.65)':k==='syringe'||k==='vitamin'?'rgba(156,242,122,.65)':k==='crossbow'||k==='cornrifle'?'rgba(255,255,255,.75)':k==='fire'?'rgba(255,122,26,.65)':k==='popcorn'?'rgba(255,255,255,.6)':k==='millet'?'rgba(255,224,102,.6)':k==='refl'?'rgba(207,232,255,.7)':'rgba(255,243,170,.55)';
      c.strokeStyle=col;c.lineWidth=b.r*1.2;c.lineCap='round';seg(c,b.x-b.vx*.025,b.y-19-b.vy*.025,b.x,b.y-19);
      c.fillStyle=k==='turbocat'?'#ffb35c':k==='syringe'?'#e6f6ff':k==='vitamin'?(Math.floor(b.x)%2?'#e8322a':'#9cf27a'):k==='fire'?'#ffd23a':k==='popcorn'?'#fffbe8':k==='millet'?'#ffe066':k==='refl'?'#cfe8ff':'#fff8c8';c.strokeStyle=INK;c.lineWidth=1.5;c.beginPath();c.arc(b.x,b.y-19,b.r*(k==='popcorn'?1.1:.8),0,TAU);c.fill();c.stroke();}
    else if(b.kind==='fire'){c.fillStyle='rgba(255,90,40,.35)';c.beginPath();c.arc(b.x,b.y-19,b.r*1.8,0,TAU);c.fill();c.fillStyle='#ff7a1a';c.strokeStyle=INK;c.lineWidth=1.8;c.beginPath();c.arc(b.x,b.y-19,b.r,0,TAU);c.fill();c.stroke();c.fillStyle='#ffe066';c.beginPath();c.arc(b.x-1,b.y-20,b.r*.45,0,TAU);c.fill();}
    else{c.save();c.translate(b.x,b.y-19);c.rotate(Math.atan2(b.vy,b.vx));c.fillStyle='#fffaf0';c.strokeStyle=INK;c.lineWidth=1.8;c.beginPath();c.ellipse(0,0,6.5,5,0,0,TAU);c.fill();c.stroke();c.restore();
      c.fillStyle='rgba(25,50,10,.2)';c.beginPath();c.ellipse(b.x,b.y,4,1.6,0,0,TAU);c.fill();}
  }
  drawParts(c,false);
  for(const t of texts){const a=1-t.t/t.max;c.globalAlpha=Math.min(1,a*2.5);c.font='900 '+t.size+'px Rubik, system-ui, sans-serif';c.textAlign='center';c.lineJoin='round';
    c.strokeStyle=INK;c.lineWidth=4;c.strokeText(t.txt,t.x,t.y);c.fillStyle=t.col;c.fillText(t.txt,t.x,t.y);c.globalAlpha=1;}
  for(const a of allies){if(a.down>0||S.mode==='menu')continue;const w=28,y=a.y-56;c.fillStyle=INK;c.fillRect(a.x-w/2-1.5,y-1.5,w+3,11);c.fillStyle='#8e2a21';c.fillRect(a.x-w/2,y,w,5);c.fillStyle='#5fcf3f';c.fillRect(a.x-w/2,y,w*Math.max(0,a.hp/a.max),5);
    c.fillStyle='#4a3a2a';c.fillRect(a.x-w/2,y+6,w,2.5);c.fillStyle=a.ult>=100?(Math.floor(S.t*8)%2?'#fff':'#ffc93a'):'#ffc93a';c.fillRect(a.x-w/2,y+6,w*Math.min(1,a.ult/100),2.5);}
  for(const e of enemies){if(e.hp<e.max&&!ETYPE[e.type].boss){const w=e.type==='rat'?20:30,h=5,y=e.y+(e.type==='crow'?-66:e.type==='rat'?-26:e.type==='turkey'?-62:-52);c.fillStyle=INK;c.fillRect(e.x-w/2-1.5,y-1.5,w+3,h+3);c.fillStyle='#8e2a21';c.fillRect(e.x-w/2,y,w,h);c.fillStyle='#ffc93a';c.fillRect(e.x-w/2,y,w*Math.max(0,e.hp/e.max),h);}}
  c.restore();
  if(S.night){
    const px=(P.x-camX)*SC,py=(P.y-24-camY)*SC, fl=P.buff==='adren'?1.25:1;
    const g=c.createRadialGradient(px,py,70*SC*fl,px,py,NIGHT_R*SC*fl);g.addColorStop(0,'rgba(8,10,30,0)');g.addColorStop(.55,'rgba(8,10,30,.55)');g.addColorStop(1,'rgba(8,10,30,.97)');
    c.fillStyle=g;c.fillRect(0,0,VW,VH);
  }
  c.save();c.scale(Z,Z);c.translate(-camX+sx,-camY+sy);drawWarnings(c);c.restore();
  if(S.mode==='play'){
    if(!S.night)for(const e of enemies){const sx2=(e.x-camX)*SC,sy2=(e.y-20-camY)*SC;if(sx2>-10&&sx2<VW+10&&sy2>-10&&sy2<VH+10)continue;
      const cx=VW/2,cy=VH/2,a=Math.atan2(sy2-cy,sx2-cx),m=26;const px=clamp(sx2,m,VW-m),py=clamp(sy2,m+60,VH-m-60);
      const T=ETYPE[e.type];
      c.save();c.translate(px,py);c.rotate(a);c.fillStyle=T.boss?'#ffc93a':e.type==='fox'?'#e8742a':e.type==='turkey'?'#8a5a2b':e.type==='crow'?'#2e2a33':'#c0392b';c.strokeStyle=INK;c.lineWidth=2.5;
      const s=T.boss?1.6:1;c.beginPath();c.moveTo(11*s,0);c.lineTo(-7*s,-8*s);c.lineTo(-7*s,8*s);c.closePath();c.fill();c.stroke();c.restore();}
    drawSticks(c);
  }
  if(P&&(P.flash>0||(S.mode==='play'&&P.hp<P.max*.3))){
    const k=P.flash>0?.45:.18+Math.sin(S.t*6)*.08;
    const g=c.createRadialGradient(VW/2,VH/2,Math.min(VW,VH)*.35,VW/2,VH/2,Math.max(VW,VH)*.75);
    g.addColorStop(0,'rgba(192,57,43,0)');g.addColorStop(1,'rgba(192,57,43,'+k+')');c.fillStyle=g;c.fillRect(0,0,VW,VH);
  }
}
function drawSticks(c){
  const show=(s,def,label)=>{
    let ox,oy,kx,ky,act=!!s;
    if(s){ox=s.ox;oy=s.oy;const v=stickVal(s);kx=ox+v.x*STICK_R;ky=oy+v.y*STICK_R;}
    else{if(!COARSE)return;ox=def[0];oy=def[1];kx=ox;ky=oy;}
    c.globalAlpha=act?1:.55;
    c.fillStyle='rgba(43,29,20,.18)';c.strokeStyle='rgba(255,255,255,.7)';c.lineWidth=3;c.beginPath();c.arc(ox,oy,STICK_R,0,TAU);c.fill();c.stroke();
    c.fillStyle=label==='огонь'?'rgba(192,57,43,.85)':'rgba(255,255,255,.85)';c.strokeStyle=INK;c.lineWidth=3;c.beginPath();c.arc(kx,ky,24,0,TAU);c.fill();c.stroke();
    if(!act){c.font='800 12px Rubik, system-ui, sans-serif';c.textAlign='center';c.fillStyle=label==='огонь'?'#fff':INK;c.fillText(label,ox,oy+4);}
    c.globalAlpha=1;
  };
  const land=VW>VH, by=VH-(land?Math.max(100,VH*.28):Math.max(130,VH*.17));
  show(sticks.move,[land?Math.max(130,VW*.16):Math.max(86,VW*.22),by],'бег');
  show(sticks.aim,[VW-(land?Math.max(150,VW*.17):Math.max(96,VW*.25)),by],'огонь');
}
const fr=i=>{const v=Math.sin(i*12.9898+78.233)*43758.5453;return v-Math.floor(v);};
function chestRays(c,cx,cy,open){
  if(open<=0)return; c.save(); c.translate(cx,cy); c.globalAlpha=open;
  for(let i=0;i<12;i++){const a=-Math.PI/2+(i-5.5)*.24+Math.sin(S.t*2)*.05;c.fillStyle=i%2?'rgba(255,230,140,.65)':'rgba(255,255,255,.45)';
    c.beginPath();c.moveTo(0,0);c.lineTo(Math.cos(a-.07)*190,Math.sin(a-.07)*190);c.lineTo(Math.cos(a+.07)*190,Math.sin(a+.07)*190);c.closePath();c.fill();}
  c.restore();
}
function drawChest(c,tier,open,shake,crack=0){
  const big=tier>=1, sup=tier===2;
  c.save(); c.rotate(shake); c.lineJoin='round'; c.lineCap='round';
  c.fillStyle='rgba(60,30,0,.22)'; c.beginPath(); c.ellipse(0,3,big?82:64,10,0,0,TAU); c.fill();
  if(!big){
    // wicker basket of a laying hen, covered with a checkered cloth
    const w=104,h=54;
    chestRays(c,0,-h-6,open);
    c.strokeStyle=INK;c.lineWidth=8;c.beginPath();c.moveTo(-w*.4,-h-2);c.bezierCurveTo(-w*.4,-h-54,w*.4,-h-54,w*.4,-h-2);c.stroke();
    c.strokeStyle='#c98a43';c.lineWidth=4.5;c.stroke();
    c.strokeStyle='#8a5a2b';c.lineWidth=1.2;c.setLineDash([4,4]);c.stroke();c.setLineDash([]);
    if(open>0){
      c.strokeStyle='#e8c26a';c.lineWidth=2;for(let i=0;i<14;i++){const x=-w*.42+fr(i)*w*.84;seg(c,x,-h-2,x+(fr(i+7)-.5)*14,-h-10-fr(i+3)*8);}
      [[-24,-h-6,'#fffaf0'],[0,-h-11,'#f1d3a8'],[24,-h-6,'#fffaf0']].forEach(([x,y,col])=>{c.fillStyle=col;c.strokeStyle=INK;c.lineWidth=2.4;c.beginPath();c.ellipse(x,y,11,14,0,0,TAU);c.fill();c.stroke();
        c.fillStyle='rgba(255,255,255,.8)';c.beginPath();c.ellipse(x-4,y-5,2.5,4,-.3,0,TAU);c.fill();});
    }
    const body=()=>{c.beginPath();c.moveTo(-w/2,-h);c.lineTo(w/2,-h);c.lineTo(w*.39,-5);c.quadraticCurveTo(w*.37,0,w*.31,0);c.lineTo(-w*.31,0);c.quadraticCurveTo(-w*.37,0,-w*.39,-5);c.closePath();};
    body();c.fillStyle='#d39a4f';c.fill();
    c.save();body();c.clip();
    for(let r=0,y=-h+6;y<6;y+=9,r++)for(let k=0,x=-w/2-7+(r%2)*7;x<w/2+8;x+=14,k++){c.fillStyle=(r+k)%2?'#e6b465':'#b97a35';c.beginPath();c.ellipse(x,y,6.6,3.7,0,0,TAU);c.fill();}
    c.strokeStyle='rgba(110,65,25,.6)';c.lineWidth=1.4;for(let x=-w/2;x<=w/2;x+=14)seg(c,x,-h,x*.8,0);
    c.restore();
    body();c.strokeStyle=INK;c.lineWidth=3;c.stroke();
    c.fillStyle='#b97a35';rr(c,-w/2-5,-h-6,w+10,11,5.5);c.fill();c.stroke();
    c.strokeStyle='#8a5a2b';c.lineWidth=1.5;for(let x=-w/2;x<w/2+2;x+=8)seg(c,x,-h-4,x+5,-h+3);
    c.save(); c.translate(open*40,-open*78); c.rotate(open*.75); c.globalAlpha=1-open*.55;
    const cloth=()=>{c.beginPath();c.moveTo(-w/2-7,-h-2);c.quadraticCurveTo(-w*.3,-h-31,0,-h-29);c.quadraticCurveTo(w*.3,-h-31,w/2+7,-h-2);c.lineTo(w/2+2,-h+17);c.lineTo(w*.34,-h+3);c.lineTo(-w*.34,-h+3);c.lineTo(-w/2-2,-h+17);c.closePath();};
    cloth();c.fillStyle='#fff4dc';c.fill();
    c.save();cloth();c.clip();c.fillStyle='#e8322a';
    for(let iy=0;iy<8;iy++)for(let ix=0;ix<15;ix++)if((ix+iy)%2===0)c.fillRect(-w/2-12+ix*9,-h-36+iy*9,9,9);
    c.fillStyle='rgba(232,50,42,.35)';for(let iy=0;iy<8;iy++)for(let ix=0;ix<15;ix++)if((ix+iy)%2===1&&ix%2===0)c.fillRect(-w/2-12+ix*9,-h-36+iy*9,9,9);
    c.restore();
    cloth();c.strokeStyle=INK;c.lineWidth=3;c.stroke();
    c.strokeStyle='rgba(43,29,20,.35)';c.lineWidth=1.6;seg(c,-w*.2,-h-25,-w*.27,-h+3);seg(c,w*.18,-h-26,w*.25,-h+3);
    if(open<.5){c.save();c.translate(w*.3,-h-17);c.rotate(-.9);c.fillStyle='#fff';c.strokeStyle=INK;c.lineWidth=1.8;c.beginPath();c.ellipse(0,-10,5,12,0,0,TAU);c.fill();c.stroke();seg(c,0,3,0,-21);c.restore();}
    c.restore();
  } else {
    // большой — золотое яйцо в гнезде, сверхбольшой — аметистовое яйцо с короной
    const EY=-62,RX=38,RY=48;
    chestRays(c,0,EY,open);
    c.fillStyle='#a87430';c.strokeStyle=INK;c.lineWidth=3;c.beginPath();c.ellipse(0,-20,76,24,0,Math.PI,TAU);c.closePath();c.fill();c.stroke();
    c.lineWidth=2;for(let i=0;i<26;i++){const a=Math.PI+.15+fr(i)*(Math.PI-.3),x=Math.cos(a)*68,y=-20+Math.sin(a)*20;c.strokeStyle=['#e8c26a','#c9973f','#f2d27a'][i%3];seg(c,x-7,y+2,x+7,y-3);}
    const egg=()=>{c.beginPath();c.ellipse(0,EY,RX,RY,0,0,TAU);};
    const paintEgg=()=>{
      c.save();egg();c.clip();
      const g=c.createLinearGradient(-RX,EY-RY,RX,EY+RY);const pal=sup?['#f6e6ff','#b46cff','#5a2aa8']:['#fff3b0','#ffc93a','#d9861a'];g.addColorStop(0,pal[0]);g.addColorStop(.45,pal[1]);g.addColorStop(1,pal[2]);c.fillStyle=g;c.fillRect(-RX-2,EY-RY-2,RX*2+4,RY*2+4);
      c.fillStyle=sup?'rgba(255,255,255,.3)':'rgba(205,120,20,.45)';[[-15,-86,5],[17,-70,6],[-9,-42,4.5],[21,-40,3.5],[-24,-62,3.2],[6,-96,3]].forEach(([x,y,r])=>{c.beginPath();c.arc(x,y,r,0,TAU);c.fill();});
      c.fillStyle=sup?'#ffc93a':'#e8322a';c.fillRect(-6,EY-RY,12,RY*2);c.fillStyle='rgba(255,255,255,.3)';c.fillRect(-6,EY-RY,3,RY*2);
      c.fillStyle='rgba(255,255,255,.78)';c.beginPath();c.ellipse(-17,EY-22,6.5,13,-.4,0,TAU);c.fill();
      c.restore(); egg(); c.strokeStyle=INK; c.lineWidth=3; c.stroke();
      c.lineWidth=2;seg(c,-6,EY-RY+1,-6,EY+RY-1);seg(c,6,EY-RY+1,6,EY+RY-1);
    };
    const bow=()=>{c.strokeStyle=INK;c.lineWidth=2.4;
      if(sup){const y=EY-RY+4;c.fillStyle='#ffc93a';c.beginPath();c.moveTo(-15,y);c.lineTo(-17,y-16);c.lineTo(-8,y-8);c.lineTo(0,y-20);c.lineTo(8,y-8);c.lineTo(17,y-16);c.lineTo(15,y);c.closePath();c.fill();c.stroke();
        c.lineWidth=1.4;circ(c,0,y-6,2.6,'#e8322a');circ(c,-9,y-4,1.9,'#4cc3ff');circ(c,9,y-4,1.9,'#4cc3ff');return;}
      c.fillStyle='#e8322a';
      c.beginPath();c.ellipse(-11,EY-RY-6,11,6.5,.35,0,TAU);c.fill();c.stroke();c.beginPath();c.ellipse(11,EY-RY-6,11,6.5,-.35,0,TAU);c.fill();c.stroke();
      c.fillStyle='#c0392b';c.beginPath();c.arc(0,EY-RY-3,5,0,TAU);c.fill();c.stroke();};
    const Z=[];for(let i=0;i<=8;i++)Z.push([-RX-6+i*(2*RX+12)/8,EY-2+(i%2?-7:6)]);
    const zig=(close)=>{c.beginPath();c.moveTo(Z[0][0],Z[0][1]);for(const p of Z)c.lineTo(p[0],p[1]);if(close==='top'){c.lineTo(RX+12,EY-RY-40);c.lineTo(-RX-12,EY-RY-40);c.closePath();}else if(close==='bot'){c.lineTo(RX+12,EY+RY+12);c.lineTo(-RX-12,EY+RY+12);c.closePath();}};
    if(open<=0){
      paintEgg(); bow();
      if(crack>.35){const n=Math.floor((crack-.35)/.65*8)+1;c.strokeStyle=INK;c.lineWidth=2.2;c.beginPath();c.moveTo(Z[0][0]+8,Z[0][1]);for(let i=1;i<=Math.min(8,n);i++)c.lineTo(Z[i][0]*.92,Z[i][1]);c.stroke();}
    } else {
      c.save();zig('bot');c.clip();paintEgg();
      c.globalAlpha=open;c.fillStyle='#ffe066';c.beginPath();c.ellipse(0,EY+2,RX*.82,9,0,0,TAU);c.fill();c.globalAlpha=1;c.restore();
      c.save();c.translate(-open*20,-open*60);c.rotate(-open*.55);
      c.save();zig('top');c.clip();paintEgg();c.restore();bow();c.restore();
    }
    c.fillStyle='#c9973f';c.strokeStyle=INK;c.lineWidth=3;c.beginPath();c.ellipse(0,-16,78,25,0,0,Math.PI);c.ellipse(0,-23,60,11,0,Math.PI,0,true);c.closePath();c.fill();c.stroke();
    c.lineWidth=2.2;for(let i=0;i<34;i++){const a=.12+fr(i+40)*(Math.PI-.24),x=Math.cos(a)*68,y=-17+Math.sin(a)*18;c.strokeStyle=['#f2d27a','#a87430','#e8c26a'][i%3];c.beginPath();c.moveTo(x-8,y-2);c.quadraticCurveTo(x,y+3,x+8,y-1);c.stroke();}
    c.strokeStyle='#e8c26a';c.lineWidth=2.2;seg(c,-74,-16,-88,-26);seg(c,72,-14,90,-22);seg(c,-60,4,-70,10);
    if(sup)[[-58,-92,0],[56,-104,1.7],[-44,-128,3.1],[62,-52,4.4],[-66,-46,5.2]].forEach(([x,y,ph])=>{const k=.5+.5*Math.sin(S.t*4+ph),r=4+k*5;
      c.save();c.translate(x,y);c.globalAlpha=.4+k*.6;c.fillStyle='#fff';c.strokeStyle='#b46cff';c.lineWidth=1.3;c.beginPath();
      for(let i=0;i<8;i++){const a=i*Math.PI/4,q=i%2?r*.3:r;c.lineTo(Math.cos(a)*q,Math.sin(a)*q);}c.closePath();c.fill();c.stroke();c.restore();});
  }
  c.restore();
}

function drawHole(c,h){
  const k=h.state==='dig'?Math.min(1,h.t/.6):h.state==='close'?Math.max(0,1-h.ct):1;
  if(k<=0)return;
  c.save(); c.translate(h.x,h.y); c.scale(k,k); c.strokeStyle=INK; c.lineWidth=2.2;
  c.fillStyle='#9a6b3c'; c.beginPath(); c.ellipse(0,2,31,13,0,0,TAU); c.fill(); c.stroke();
  c.fillStyle='#b8834c'; [[-24,-2,6],[22,-1,5.5],[-8,10,6],[13,9,5],[0,-9,5]].forEach(([x,y,r])=>{c.beginPath();c.arc(x,y,r,0,TAU);c.fill();c.stroke();});
  c.fillStyle='#2b1d14'; c.beginPath(); c.ellipse(0,1,19,8,0,0,TAU); c.fill();
  c.fillStyle='rgba(255,255,255,.08)'; c.beginPath(); c.ellipse(-4,-1,10,3,0,0,TAU); c.fill();
  c.restore();
}
function drawMole(c,e){
  const s=e.s||1, em=e.emerge>0?Math.max(.05,1-e.emerge/.6):1;
  c.save(); c.translate(e.x,e.y);
  if(em>=1)shadow(c,13,4.5);
  c.scale(1,em); c.scale(s*e.face,s); c.lineCap='round'; c.lineJoin='round'; c.strokeStyle=INK; c.lineWidth=2.3;
  const fl=e.flash>0, fur=fl?'#fff':'#6b5a52', lt=fl?'#fff':'#8a776d', pink=fl?'#fff':'#f2b8c0';
  const bob=e.moving?Math.abs(Math.sin(e.phase))*2:0; c.translate(0,-bob);
  c.fillStyle=fur; c.beginPath(); c.ellipse(0,-13,13,13,0,0,TAU); c.fill(); c.stroke();
  c.fillStyle=lt; c.beginPath(); c.ellipse(2,-9,8,7,0,0,TAU); c.fill();
  c.fillStyle=pink; c.beginPath(); c.ellipse(13,-14,5.5,3.8,0,0,TAU); c.fill(); c.stroke();
  c.fillStyle='#e8708a'; c.beginPath(); c.arc(17.5,-14.5,2.2,0,TAU); c.fill();
  c.fillStyle=INK; [[6,-19],[10,-19.5]].forEach(([x,y])=>{c.beginPath();c.arc(x,y,1.2,0,TAU);c.fill();});
  const sw=e.moving?Math.sin(e.phase)*2:0;
  [[9,-5+sw],[-6,-4-sw]].forEach(([x,y])=>{c.fillStyle=pink;c.beginPath();c.ellipse(x,y,5,3.2,0,0,TAU);c.fill();c.stroke();
    c.lineWidth=1.2;for(let i=-1;i<=1;i++)seg(c,x+3,y+i*1.6,x+6,y+i*1.8);c.lineWidth=2.3;});
  c.fillStyle=fl?'#fff':'#ffc93a'; c.beginPath(); c.arc(0,-21,10.5,Math.PI*1.05,Math.PI*1.95); c.closePath(); c.fill(); c.stroke();
  c.fillStyle=fl?'#fff':'#e0a91f'; c.fillRect(-11,-22.5,22,2.6); c.strokeRect(-11,-22.5,22,2.6);
  c.fillStyle='#fff6a0'; c.beginPath(); c.arc(8.5,-27,3,0,TAU); c.fill(); c.stroke();
  if(!fl){c.globalAlpha=.25;c.fillStyle='#fff6a0';c.beginPath();c.moveTo(10,-28);c.lineTo(34,-36);c.lineTo(34,-18);c.closePath();c.fill();c.globalAlpha=1;}
  c.restore();
}
