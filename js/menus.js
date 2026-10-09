/* Экраны: магазин, герои и отряд, сюжет, сундуки */
/* ---------- boards ---------- */
function mk(tag,cls,html){const e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e;}
function preview(w,h,fn){const cvs=document.createElement('canvas');const d=Math.min(2,devicePixelRatio||1);cvs.width=w*d;cvs.height=h*d;cvs.style.width=w+'px';cvs.style.height=h+'px';
  const c=cvs.getContext('2d');c.scale(d,d);fn(c,w,h);return cvs;}
function birdPv(look,gun,w=140,h=100,k=1.55){if(look.sp==='goose')k*=.86;return preview(w,h,(c)=>{c.translate(w/2-6,h-14);c.scale(k,k);drawBird(c,{x:0,y:0,face:1,ang:-.18,phase:0,moving:false,flash:0,kind:'player',gun,...look});});}
function heroPv(id,w,h,k){return birdPv(lookFor(id,SAVE.hat,SAVE.color),gunOf(id),w,h,k);}
function clsBadge(c){const C=CLASSES[c];const b=mk('span','rar',C.name);b.style.setProperty('--c',C.c);return b;}
function coinTag(n){return '<i class="coin"></i>'+fmt(n);}
function rarBadge(id){const r=RAR[HEROES[id].rar];const b=mk('span','rar',r.name);b.style.setProperty('--c',r.c);return b;}
function priceTag(n,cur){return (cur==='eggs'?'<i class="gegg"></i>':'<i class="coin"></i>')+fmt(n);}
function actBtn(owned,equipped,price,onBuy,onEquip,cur='coins'){
  const b=mk('button','pbtn');
  if(equipped){b.textContent=_t('Выбрано');b.classList.add('on');b.disabled=true;}
  else if(owned){b.textContent=_t('Выбрать');b.classList.add('eq');b.onclick=onEquip;}
  else{b.innerHTML=priceTag(price,cur);b.classList.add('buy');if((cur==='eggs'?SAVE.eggs:SAVE.coins)<price)b.classList.add('poor');b.onclick=()=>buy(price,onBuy,cur);}
  return b;
}
function buy(price,fn,cur='coins'){
  initAudio();
  const have=cur==='eggs'?SAVE.eggs:SAVE.coins;
  if(have<price){toast(cur==='eggs'?_t('Не хватает ')+(price-have)+_t(' золотых яиц'):_t('Не хватает ')+fmt(price-have)+_t(' зёрен'));SFX.hurt();return;}
  if(cur==='eggs')SAVE.eggs-=price; else SAVE.coins-=price;
  fn(); persist(); SFX.buy(); toast(_t('Куплено!')); afterChange();
}
function equip(fn,msg){fn();persist();initAudio();SFX.pick();toast(msg||_t('Выбрано'));afterChange();}
function afterChange(){
  refreshMenu();
  if(S.mode==='menu'){const x=P.x,y=P.y;P=newPlayer();P.x=x;P.y=y;makeAllies();}
  if(!$('shop').hidden)renderShop(); if(!$('heroes').hidden)renderHeroes(); if(!$('chestP').hidden)renderChests(); if(!$('storyP').hidden)renderStory();
}
let shopTab='guns';
function renderShop(){
  const body=$('shopBody'), st=body.scrollTop; body.innerHTML='';
  document.querySelectorAll('#shop .tab').forEach(t=>{t.classList.toggle('on',t.dataset.tab===shopTab);t.setAttribute('aria-selected',String(t.dataset.tab===shopTab));});
  if(shopTab==='gems'){
    renderGems(body);
  } else {
    const myC=clsOf(SAVE.hero);
    body.appendChild(mk('p','note',_t('У каждого класса своё оружие: герой берёт в бой только стволы своего класса. Сейчас в бою ')+HEROES[SAVE.hero].name+_t(' — класс «')+CLASSES[myC].name+_t('». Патроны у основного ствола бесконечные.')));
    const order=[myC].concat(CLASS_ORDER.filter(k=>k!==myC));
    let g;
    order.forEach((ck,oi)=>{
      const C=CLASSES[ck];
      const sec=mk('div','sect',C.name+(ck===myC?_t(' · твой класс'):'')+' — '+C.desc);body.appendChild(sec);
      g=mk('div','grid');
      const ids=PRIMARY.filter(w=>WEAP[w].cls===ck).sort((a,b)=>WRAR_ORDER.indexOf(WEAP[a].rar)-WRAR_ORDER.indexOf(WEAP[b].rar)||((WEAP[a].eggs||0)*30+WEAP[a].price)-((WEAP[b].eggs||0)*30+WEAP[b].price));
      for(const id of ids){const W=WEAP[id],owned=SAVE.guns.includes(id),eq=SAVE.loadout[ck]===id,WR=WRAR[W.rar],lv=wLv(id);
        const card=mk('div','item gun'+(eq?' sel':''));card.style.setProperty('--rc',WR.c);const pv=mk('div','pv');
        pv.appendChild(preview(140,90,(c,w,h)=>{c.translate(w/2-32,h/2+2);c.scale(2.1,2.1);drawGun(c,id);}));
        if(owned)pv.appendChild(mk('span','lvl',_t('Ур. ')+lv));card.appendChild(pv);
        const bd=mk('div','badges');bd.appendChild(clsBadge(ck));const rb=mk('span','rar',WR.name);rb.style.setProperty('--c',WR.c);bd.appendChild(rb);card.appendChild(bd);
        card.appendChild(mk('h4','',W.name));card.appendChild(mk('p','',W.desc));
        const dps=Math.round(W.dmg*W.pellets/W.rate);
        card.appendChild(mk('div','meta',W.meta||(_t('Урон ')+W.dmg+(W.pellets>1?'×'+W.pellets:'')+' · '+(1/W.rate).toFixed(1)+_t(' выстр/с · ≈')+dps+_t(' в сек'))));
        if(owned){
          card.appendChild(mk('div','meta up',_t('Уровень ')+lv+_t(' из 10')+(lv>1?_t(' · урон +')+Math.round(W_STEP*(lv-1)*100)+'%':'')));
          if(lv<10){const nc=wNeed(id,lv),co=wCost(id,lv),have=wRec(id).cards;
            const pr=mk('div','');pr.innerHTML=_t('<div class="progt"><span>Карты оружия</span><span>')+have+' / '+nc+'</span></div>';
            const bar=mk('div','prog');bar.style.setProperty('--c',have>=nc?'#5fcf3f':WR.c);const f=mk('i');f.style.width=Math.min(100,have/nc*100)+'%';bar.appendChild(f);pr.appendChild(bar);card.appendChild(pr);}
        }
        card.appendChild(mk('div','grow'));
        const sel=actBtn(owned,eq,W.eggs||W.price,()=>{SAVE.guns.push(id);SAVE.loadout[ck]=id;},()=>equip(()=>{SAVE.loadout[ck]=id;},C.name+': '+W.name),W.eggs?'eggs':'coins');
        if(owned&&lv<10){const nc=wNeed(id,lv),co=wCost(id,lv),ok=wRec(id).cards>=nc&&SAVE.coins>=co;
          const row=mk('div','brow');row.appendChild(sel);
          const ub=mk('button','pbtn '+(ok?'go':'poor'),_t('Улучшить · ')+coinTag(co));ub.onclick=()=>upgradeGun(id);row.appendChild(ub);card.appendChild(row);}
        else card.appendChild(sel);
        g.appendChild(card);}
      if(oi<order.length-1)body.appendChild(g);
    });
    body.appendChild(g);
  }
  body.scrollTop=st;
}
/* ---------- донат и обмен: золотые яйца за деньги (пока закрыто) и зёрна за яйца ---------- */
const GEM_PACKS=[
  {name:'Горстка яиц',eggs:39},{name:'Корзинка яиц',eggs:79},{name:'Лукошко яиц',eggs:179},
  {name:'Ящик яиц',eggs:309},{name:'Телега яиц',eggs:749,tag:'Хит'},{name:'Золотой курятник',eggs:1999,tag:'Выгодно'}];
const GRAIN_PACKS=[{name:'Мешочек зерна',eggs:10,coins:500},{name:'Мешок зерна',eggs:50,coins:2750},{name:'Амбар зерна',eggs:150,coins:9000}];
function drawEggPile(c,n){
  const pos=[[0,0],[-14,2],[14,2],[-7,-12],[7,-12],[-24,6],[24,6],[0,-24],[-20,-8],[20,-8],[-30,-2],[30,-2]];
  c.fillStyle='#c9973f';c.strokeStyle=INK;c.lineWidth=2.5;c.beginPath();c.ellipse(0,14,44,12,0,0,Math.PI);c.ellipse(0,8,36,7,0,Math.PI,0,true);c.closePath();c.fill();c.stroke();
  pos.slice(0,n).sort((a,b)=>a[1]-b[1]).forEach(([x,y])=>{const g=c.createLinearGradient(x-8,y-14,x+8,y+6);g.addColorStop(0,'#fff3b0');g.addColorStop(.5,'#ffc93a');g.addColorStop(1,'#d9861a');
    c.fillStyle=g;c.lineWidth=2;c.beginPath();c.ellipse(x,y,8.5,11,0,0,TAU);c.fill();c.stroke();c.fillStyle='rgba(255,255,255,.75)';c.beginPath();c.ellipse(x-3,y-4,2,3.5,-.4,0,TAU);c.fill();});
}
function drawSack(c,k){
  const s=.8+k*.18; c.scale(s,s); c.strokeStyle=INK;c.lineWidth=2.5;
  c.fillStyle='#d9b77a';c.beginPath();c.moveTo(-22,12);c.quadraticCurveTo(-30,-14,-12,-22);c.lineTo(12,-22);c.quadraticCurveTo(30,-14,22,12);c.quadraticCurveTo(0,20,-22,12);c.closePath();c.fill();c.stroke();
  c.fillStyle='#b8925a';c.beginPath();c.moveTo(-12,-22);c.lineTo(-16,-30);c.lineTo(16,-30);c.lineTo(12,-22);c.closePath();c.fill();c.stroke();
  c.fillStyle='#ffe066';[[-8,-30],[0,-33],[8,-30],[4,-36],[-4,-35]].forEach(([x,y])=>{c.beginPath();c.ellipse(x,y,2.6,1.8,.4,0,TAU);c.fill();});
  c.fillStyle='#8a5a2b';c.font='900 13px Rubik, system-ui, sans-serif';c.textAlign='center';c.fillText('✿',0,2);
}
function renderGems(body){
  body.appendChild(mk('div','sect',_t('Золотые яйца')));
  body.appendChild(mk('p','note',_t('Наборы золотых яиц появятся позже — пока кнопки закрыты.')));
  const g=mk('div','grid gems');
  GEM_PACKS.forEach((p,i)=>{const card=mk('div','item gem');
    const pv=mk('div','pv gold');pv.appendChild(preview(140,86,(c,w,h)=>{c.translate(w/2,h-24);drawEggPile(c,[1,2,3,5,8,12][i]);}));
    if(p.tag)pv.appendChild(mk('span','lvl',_t(p.tag)));
    card.appendChild(pv); card.appendChild(mk('h4','','<i class="gegg"></i>'+fmt(p.eggs)));card.appendChild(mk('p','',p.name));
    card.appendChild(mk('div','grow'));
    const b=mk('button','pbtn poor locked','<i class="lockic" aria-hidden="true"></i>'+_t('Скоро'));b.setAttribute('aria-disabled','true');
    b.onclick=()=>{toast(_t('Донат пока закрыт — скоро откроем'));};card.appendChild(b);g.appendChild(card);});
  body.appendChild(g);
  body.appendChild(mk('div','sect',_t('Зёрна за золотые яйца')));
  body.appendChild(mk('p','note',_t('Обменяй золотые яйца на зёрна: чем больше набор, тем выгоднее.')));
  const g2=mk('div','grid gems');
  GRAIN_PACKS.forEach((p,i)=>{const card=mk('div','item gem');
    const pv=mk('div','pv nest');pv.appendChild(preview(140,86,(c,w,h)=>{c.translate(w/2,h/2+10);drawSack(c,i);}));
    const bonus=Math.round((p.coins/p.eggs/(GRAIN_PACKS[0].coins/GRAIN_PACKS[0].eggs)-1)*100); if(bonus>0)pv.appendChild(mk('span','bonus','+'+bonus+'%'));
    card.appendChild(pv); card.appendChild(mk('h4','','<i class="coin"></i>'+fmt(p.coins)));card.appendChild(mk('p','',p.name));
    card.appendChild(mk('div','grow'));
    const ok=SAVE.eggs>=p.eggs, b=mk('button','pbtn '+(ok?'buy':'buy poor'),priceTag(p.eggs,'eggs'));
    b.onclick=()=>buy(p.eggs,()=>{SAVE.coins+=p.coins;},'eggs');card.appendChild(b);g2.appendChild(card);});
  body.appendChild(g2);
}
function upgradeGun(id){
  const lv=wLv(id); if(lv>=10||!SAVE.guns.includes(id))return;
  const r=wRec(id), nc=wNeed(id,lv), co=wCost(id,lv);
  initAudio();
  if(r.cards<nc){toast(_t('Нужно ещё ')+(nc-r.cards)+_t(' карт оружия — они падают из сундуков'));SFX.hurt();return;}
  if(SAVE.coins<co){toast(_t('Не хватает ')+fmt(co-SAVE.coins)+_t(' зёрен'));SFX.hurt();return;}
  r.cards-=nc; SAVE.coins-=co; r.lv=lv+1; persist(); SFX.buy();
  toast(WEAP[id].name+_t(': уровень ')+r.lv+_t(' · урон +')+Math.round(W_STEP*(r.lv-1)*100)+'%');
  afterChange();
}
function upgradeHero(id){
  const h=SAVE.heroes[id]; if(!h||h.lv>=10)return;
  const nc=needCards(id,h.lv), co=needCoins(id,h.lv);
  initAudio();
  if(h.cards<nc){toast(_t('Нужно ещё ')+(nc-h.cards)+_t(' карт — открывай сундуки'));SFX.hurt();return;}
  if(SAVE.coins<co){toast(_t('Не хватает ')+fmt(co-SAVE.coins)+_t(' зёрен'));SFX.hurt();return;}
  h.cards-=nc; SAVE.coins-=co; h.lv++; const eg=h.lv===5?3:h.lv===10?10:0; SAVE.eggs+=eg; persist(); SFX.buy();
  const H=HEROES[id];
  toast(h.lv===5?_t('Уровень 5! Пассивка «')+H.p5[0]+_t('» и +3 золотых яйца'):h.lv===10?_t('Уровень 10! Пассивка «')+H.p10[0]+_t('» и +10 золотых яиц'):H.name+_t(': уровень ')+h.lv);
  afterChange();
}
function renderHeroes(){
  const body=$('heroBody'), st=body.scrollTop; body.innerHTML='';
  body.appendChild(mk('p','note',_t('Новых героев выбивают из сундуков. Карты героя из сундуков вместе с зёрнами повышают его уровень: +6% здоровья и +5% урона за уровень. На 5-м уровне открывается первая пассивка, на 10-м вторая.')));
  body.appendChild(mk('div','sect',_t('Отряд')));
  body.appendChild(mk('p','note',_t('Бойцы отряда (зелёный круг под ногами) идут рядом, стреляют из выбранного оружия, сами применяют ульту (жёлтая полоска под здоровьем) и принимают удары на себя. Если бойца выбили, через 18 секунд он возвращается, а рядом с живым медиком — вдвое быстрее. Сила зависит от уровня героя. Места в отряде открываются за золотые яйца.')));
  const sg=mk('div','grid sq');
  for(let k=0;k<3;k++){
    const card=mk('div','item');
    if(k<SAVE.slots){
      const id=SAVE.squad[k];
      if(id&&SAVE.heroes[id]&&id!==SAVE.hero){
        const pv=mk('div','pv');pv.appendChild(birdPv(lookFor(id,'helmet','native'),gunForAlly(id),140,92,1.45));pv.appendChild(mk('span','lvl',_t('Ур. ')+heroLv(id)));card.appendChild(pv);
        card.appendChild(mk('h4','',HEROES[id].name));card.appendChild(mk('p','',_t('Место ')+(k+1)+' · '+CLASSES[clsOf(id)].name+_t(' · ульта: ')+HEROES[id].ult[0]));
        const g0=gunForAlly(id), opts=PRIMARY.filter(w=>WEAP[w].cls===clsOf(id)&&SAVE.guns.includes(w));
        card.appendChild(mk('div','meta',_t('Оружие: <b>')+WEAP[g0].name+'</b>'+(opts.length>1?'':_t(' · купи ещё стволы класса в магазине'))));
        card.appendChild(mk('div','grow'));
        const row=mk('div','brow');
        const wb=mk('button','pbtn '+(opts.length>1?'go':'poor'),_t('Сменить оружие'));
        wb.onclick=()=>{if(opts.length<2){toast(_t('У класса «')+CLASSES[clsOf(id)].name+_t('» пока один ствол — купи ещё в магазине'));return;}const nx=opts[(opts.indexOf(g0)+1)%opts.length];equip(()=>{SAVE.squadGun[id]=nx;},HEROES[id].name+': '+WEAP[nx].name);};
        row.appendChild(wb);
        const b=mk('button','pbtn eq thin',_t('Убрать из отряда'));b.onclick=()=>equip(()=>{SAVE.squad.splice(k,1);},_t('Боец ушёл из отряда'));row.appendChild(b);card.appendChild(row);
      } else {
        const pv=mk('div','pv');pv.style.height='92px';pv.appendChild(mk('span','meta',_t('Свободно')));card.appendChild(pv);
        card.appendChild(mk('h4','',_t('Место ')+(k+1)));card.appendChild(mk('p','',_t('Нажми «В отряд» у героя ниже')));
      }
    } else {
      const pv=mk('div','pv dark');pv.style.height='92px';pv.appendChild(mk('span','lock',_t('Закрыто')));card.appendChild(pv);
      card.appendChild(mk('h4','',_t('Место ')+(k+1)));
      card.appendChild(mk('div','grow'));
      if(k===SAVE.slots){const price=SLOT_PRICE[k];const b=mk('button','pbtn '+(SAVE.eggs>=price?'buy':'buy poor'),_t('Открыть · ')+priceTag(price,'eggs'));b.onclick=()=>buy(price,()=>{SAVE.slots=k+1;},'eggs');card.appendChild(b);}
      else card.appendChild(mk('div','meta',_t('Сначала открой место ')+k));
    }
    sg.appendChild(card);
  }
  body.appendChild(sg);
  body.appendChild(mk('div','sect',_t('Герои')));
  const g=mk('div','grid wide');
  const ids=HERO_IDS.slice().sort((a,b)=>(SAVE.heroes[b]?1:0)-(SAVE.heroes[a]?1:0));
  for(const id of ids){
    const H=HEROES[id],own=SAVE.heroes[id],eq=SAVE.hero===id,R=RAR[H.rar];
    const card=mk('div','item'+(eq?' sel':''));
    const pv=mk('div','pv'+(own?'':' dark'));pv.appendChild(heroPv(id,200,120,1.85));
    if(own)pv.appendChild(mk('span','lvl',_t('Ур. ')+own.lv));else pv.appendChild(mk('span','lock',_t('Не открыт')));
    card.appendChild(pv);
    {const bw=mk('div','');bw.style.display='flex';bw.style.gap='6px';bw.style.flexWrap='wrap';bw.appendChild(rarBadge(id));bw.appendChild(clsBadge(H.cls));card.appendChild(bw);}
    card.appendChild(mk('h4','',H.name));
    card.appendChild(mk('p','',H.perk+' · '+H.hp+_t(' здоровья')));
    card.appendChild(mk('div','ab','<span class="k">'+CLASSES[H.cls].name.toUpperCase()+'</span>'+CLASSES[H.cls].desc+_t('. Оружие: <b>')+WEAP[gunOf(id)].name+'</b>'));
    const ab=mk('div','abil');
    ab.appendChild(mk('div','ab ul',_t('<span class="k">УЛЬТА</span><b>')+H.ult[0]+'.</b> '+H.ult[1]));
    const lv=own?own.lv:0;
    ab.appendChild(mk('div','ab'+(lv>=5?'':' off'),_t('<span class="k">УР. 5</span><b>')+H.p5[0]+'.</b> '+H.p5[1]));
    ab.appendChild(mk('div','ab'+(lv>=10?'':' off'),_t('<span class="k">УР. 10</span><b>')+H.p10[0]+'.</b> '+H.p10[1]));
    card.appendChild(ab);
    if(own){
      if(own.lv<10){
        const nc=needCards(id,own.lv),co=needCoins(id,own.lv);
        const pr=mk('div','');pr.innerHTML=_t('<div class="progt"><span>Карты до ур. ')+(own.lv+1)+'</span><span>'+own.cards+' / '+nc+'</span></div>';
        const bar=mk('div','prog');bar.style.setProperty('--c',R.c);const fill=mk('i');fill.style.width=Math.min(100,own.cards/nc*100)+'%';bar.appendChild(fill);pr.appendChild(bar);card.appendChild(pr);
      } else card.appendChild(mk('div','meta',_t('Максимальный уровень · карт в запасе: ')+own.cards));
      card.appendChild(mk('div','grow'));
      const row=mk('div','brow');
      const sel=mk('button','pbtn '+(eq?'on':'eq'),eq?_t('Выбрано'):_t('Выбрать')); if(eq)sel.disabled=true; else sel.onclick=()=>equip(()=>{SAVE.hero=id;SAVE.squad=SAVE.squad.filter(x=>x!==id);},_t('В бой идёт ')+H.name);
      row.appendChild(sel);
      if(own.lv<10){const nc=needCards(id,own.lv),co=needCoins(id,own.lv),ok=own.cards>=nc&&SAVE.coins>=co;
        const up=mk('button','pbtn '+(ok?'go':'poor'),_t('Ур. ')+(own.lv+1)+' · '+coinTag(co));up.onclick=()=>upgradeHero(id);row.appendChild(up);}
      else{const m=mk('button','pbtn max',_t('Максимум'));m.disabled=true;row.appendChild(m);}
      card.appendChild(row);
      if(!eq&&SAVE.slots>0){
        const inSq=SAVE.squad.includes(id), free=SAVE.squad.filter(x=>SAVE.heroes[x]&&x!==SAVE.hero).length<SAVE.slots;
        const sb=mk('button','pbtn '+(inSq?'eq':free?'go':'poor'),inSq?_t('Убрать из отряда'):free?_t('В отряд'):_t('В отряде нет мест'));
        sb.onclick=()=>{if(inSq)equip(()=>{SAVE.squad=SAVE.squad.filter(x=>x!==id);},_t('Боец ушёл из отряда'));
          else if(free)equip(()=>{SAVE.squad=SAVE.squad.filter(x=>SAVE.heroes[x]&&x!==SAVE.hero);SAVE.squad.push(id);},H.name+_t(' в отряде!'));
          else toast(_t('Купи ещё место для отряда'));};
        card.appendChild(sb);
      }
    } else {
      card.appendChild(mk('div','grow'));
      card.appendChild(mk('div','meta',_t('Выпадает как «')+RAR[H.rar].name.toLowerCase()+_t('» герой: ')+pct(RAR[H.rar].chance[0])+_t(' в обычном сундуке, ')+pct(RAR[H.rar].chance[1])+_t(' в большом')));
      const b=mk('button','pbtn go',_t('К сундукам'));b.onclick=()=>openPanel('chestP');card.appendChild(b);
    }
    g.appendChild(card);
  }
  body.appendChild(g);
  body.scrollTop=st;
}
let storyCh=-1;
const chapterOpen=k=>k===0||SAVE.story.done.includes(k*20-1);
function renderStory(){
  const body=$('storyBody'), st=body.scrollTop; body.innerHTML='';
  if(storyCh<0){storyCh=0;for(let k=0;k<CHAPTERS.length;k++)if(chapterOpen(k))storyCh=k;}
  const tabs=mk('div','tabs');
  CHAPTERS.forEach((C,k)=>{const b=mk('button','tab'+(k===storyCh?' on':''),_t('Глава ')+(k+1));if(!chapterOpen(k))b.style.opacity='.55';b.onclick=()=>{storyCh=k;$('storyBody').scrollTop=0;renderStory();};tabs.appendChild(b);});
  body.appendChild(tabs);
  const C=CHAPTERS[storyCh], open=chapterOpen(storyCh), doneN=C.levels.filter(L=>SAVE.story.done.includes(L.gid)).length;
  const head=mk('div','item');head.style.marginBottom='14px';
  head.appendChild(mk('p','eyebrow',_t('Глава ')+(storyCh+1)+_t(' из ')+CHAPTERS.length+_t(' · пройдено ')+doneN+'/20'));
  head.appendChild(mk('h4','',C.name));
  head.appendChild(mk('p','',C.intro));
  const bar=mk('div','prog');const f=mk('i');f.style.width=(doneN/20*100)+'%';bar.appendChild(f);head.appendChild(bar);
  if(doneN===20)head.appendChild(mk('div','ab ul',_t('<span class="k">ФИНАЛ ГЛАВЫ</span>')+C.outro));
  if(!open)head.appendChild(mk('div','ab off',_t('Глава откроется после победы над финальным боссом главы ')+storyCh+'.'));
  body.appendChild(head);
  const g=mk('div','grid wide');
  C.levels.forEach(L=>{
    const done=SAVE.story.done.includes(L.gid), lopen=L.gid===0||SAVE.story.done.includes(L.gid-1)||done, boss=L.goal.type==='boss';
    const b=mk('button','item lvcard'+(done?' done':'')+(boss?' boss':'')+(lopen?'':' locked'));
    b.innerHTML='<div class="top"><span class="num">'+(L.i+1)+'</span><div><h4>'+L.name+'</h4><span class="st">'+(done?_t('Пройден'):lopen?(boss?_t('Босс'):_t('Доступен')):_t('Закрыт'))+(L.night?_t(' · ночь'):'')+'</span></div></div>'+
      '<p>'+goalText(L)+'</p><div class="meta"><i class="coin"></i>'+L.coins+' · <i class="tok"></i>'+L.tokens+(done?_t(' · повтор: меньше'):' · <i class="gegg"></i>'+L.eggs)+'</div>';
    if(lopen)b.onclick=()=>openBrief(L.gid); else b.disabled=true;
    g.appendChild(b);
  });
  body.appendChild(g); body.scrollTop=st;
}
function goalText(L){const g=L.goal;
  if(g.type==='waves')return LANG==='en'?'Clear '+g.n+' waves':'Пройди '+g.n+' волн'+(g.n<5?'ы':'');
  if(g.type==='kill')return _t('Победи: ')+(g.what==='any'?_t('любых врагов'):(KILLN[g.what]||ETYPE[g.what].name).toLowerCase())+' ×'+g.n;
  if(g.type==='survive')return _t('Продержись ')+g.t+_t(' секунд');
  return _t('Победи босса: ')+ETYPE[g.boss].name;
}
let briefIdx=0;
function openBrief(i){
  briefIdx=i; const L=STORY[i];
  $('briefNum').textContent=_t('Глава ')+(L.ch+1)+_t(' · уровень ')+(L.i+1)+_t(' из 20'); $('briefName').textContent=L.name; $('briefText').textContent=L.text;
  const foes=[...new Set(Object.keys(L.mix).concat(L.goal.boss?[L.goal.boss]:[]))].map(k=>ETYPE[k].name.toLowerCase()).join(', ');
  $('briefGoal').innerHTML=_t('<span>Цель: ')+goalText(L)+_t('</span><small>Карта: ')+MAPS[MAP_OF_CH[L.ch]].name+_t(' · река с мостами, гнилые рушатся после второго прохода</small><small>Враги: ')+foes+(L.night?_t('. Ночь — обзор меньше'):'')+_t('</small><small>Награда: ')+L.coins+_t(' зёрен, ')+L.tokens+_t(' жетонов</small>');
  $('briefHero').textContent=_t('Боец: ')+HEROES[SAVE.hero].name+' ('+CLASSES[clsOf(SAVE.hero)].name.toLowerCase()+_t(') · ур. ')+heroLv(SAVE.hero)+' · '+WEAP[gunOf(SAVE.hero)].name;
  $('brief').hidden=false;
}
$('briefGo').addEventListener('click',()=>{initAudio();$('brief').hidden=true;startGame('story',briefIdx);});
$('briefBack').addEventListener('click',()=>{$('brief').hidden=true;});

/* ---------- chests ---------- */
// Три сундука: 0 обычный (корзинка), 1 большой (золотое яйцо), 2 сверхбольшой (аметистовое яйцо)
const CHESTS=[
  {name:'Обычный сундук',sub:'корзинка несушки',coins:[25,50],hpacks:2,wpacks:1,hcard:[3,6],wcard:[3,6],egg:[.08,1,3],
    hb:{common:1,rare:1,epic:.8,legendary:.6},wb:{common:1,rare:.6,legendary:.25}},
  {name:'Большой сундук',sub:'золотое яйцо',coins:[150,250],hpacks:4,wpacks:2,hcard:[8,14],wcard:[8,14],egg:[.3,2,5],
    hb:{common:1,rare:1,epic:1,legendary:1},wb:{common:1,rare:.8,legendary:.45}},
  {name:'Сверхбольшой сундук',sub:'аметистовое яйцо',coins:[500,800],hpacks:6,wpacks:4,hcard:[14,22],wcard:[15,25],egg:[1,5,12],sure:true,
    hb:{common:.8,rare:1,epic:1.2,legendary:1.5},wb:{common:1,rare:1,legendary:.8}}
];
const EGG_PRICE=80, SUPER_PRICE=200;
function pickW(pool,wf){let tot=0;pool.forEach(x=>tot+=wf(x));let r=Math.random()*tot;for(const x of pool){r-=wf(x);if(r<=0)return x;}return pool[pool.length-1];}
function rollChest(tier){
  const C=CHESTS[tier], res={tier,coins:Math.round(rand(C.coins[0],C.coins[1])),cards:{},wcards:{},hero:null};
  for(const rk of RAR_ORDER){
    const pool=HERO_IDS.filter(id=>!SAVE.heroes[id]&&HEROES[id].chance&&HEROES[id].rar===rk);
    if(pool.length&&Math.random()*100<RAR[rk].chance[tier]){res.hero=pool[Math.floor(Math.random()*pool.length)];break;}
  }
  if(!res.hero&&C.sure){const pool=HERO_IDS.filter(id=>!SAVE.heroes[id]&&HEROES[id].chance);if(pool.length)res.hero=pickW(pool,id=>RAR[HEROES[id].rar].w);}
  res.eggs=Math.random()<C.egg[0]?Math.round(rand(C.egg[1],C.egg[2])):0;
  for(let i=0;i<C.hpacks;i++){
    const pool=Object.keys(SAVE.heroes).filter(id=>SAVE.heroes[id].lv<10);
    if(!pool.length){res.coins+=10*(tier+1);continue;}
    const pick=pickW(pool,id=>RAR[HEROES[id].rar].w*C.hb[HEROES[id].rar]);
    res.cards[pick]=(res.cards[pick]||0)+Math.max(1,Math.round(rand(C.hcard[0],C.hcard[1])*RAR[HEROES[pick].rar].card));
  }
  for(let i=0;i<C.wpacks;i++){
    const pool=PRIMARY.filter(id=>SAVE.guns.includes(id)&&wLv(id)<10);
    if(!pool.length){res.coins+=10*(tier+1);continue;}
    const pick=pickW(pool,id=>WRAR[WEAP[id].rar].w*C.wb[WEAP[id].rar]);
    res.wcards[pick]=(res.wcards[pick]||0)+Math.max(1,Math.round(rand(C.wcard[0],C.wcard[1])*WRAR[WEAP[pick].rar].card));
  }
  SAVE.coins+=res.coins; SAVE.eggs+=res.eggs;
  for(const id in res.cards)SAVE.heroes[id].cards+=res.cards[id];
  for(const id in res.wcards)wRec(id).cards+=res.wcards[id];
  if(res.hero)SAVE.heroes[res.hero]={lv:1,cards:0};
  persist(); return res;
}
const pct=v=>String(v).replace('.',',')+'%';
const chestN=[1,1,1]; // сколько сундуков открыть за раз: ×1, ×3 или ×10
function chestCost(tier,pay,n){ // что и сколько списать; null — не хватает
  if(pay==='eggs'){const p=(tier===2?SUPER_PRICE:EGG_PRICE)*n;return {have:SAVE.eggs,need:p,cur:'eggs'};}
  if(tier===2)return {have:SAVE.schests,need:n,cur:'sch'};
  if(tier===1)return {have:SAVE.btokens,need:10*n,cur:'btok'};
  return {have:SAVE.tokens,need:100*n,cur:'tok'};
}
function chestCard(tier){
  const C=CHESTS[tier], card=mk('div','item chest t'+tier);
  const pv=mk('div','pv '+['nest','gold','amet'][tier]);pv.appendChild(preview(220,150,(c,w,h)=>{c.translate(w/2,h-12);c.scale(.9,.9);drawChest(c,tier,0,0);}));
  const ib=mk('button','propbtn',_t('<b>i</b>Свойства'));ib.setAttribute('aria-label',_t('Свойства: ')+C.name);ib.onclick=()=>openChestInfo(tier);pv.appendChild(ib);card.appendChild(pv);
  card.appendChild(mk('h4','',C.name));
  const eggTxt=C.egg[0]>=1?C.egg[1]+'–'+C.egg[2]+_t(' золотых яиц'):_t('шанс золотых яиц');
  card.appendChild(mk('p','',C.coins[0]+'–'+C.coins[1]+_t(' зёрен · ')+C.hpacks+_t(' пачки карт героев · ')+C.wpacks+(C.wpacks>1?_t(' пачки'):_t(' пачка'))+_t(' карт оружия · ')+eggTxt+(C.sure?_t(' · <b>гарантированный новый герой</b>, пока есть закрытые'):'')));
  const bar=(have,need,ic,label,col)=>{const pr=mk('div','');pr.innerHTML='<div class="progt"><span>'+ic+label+'</span><span>'+Math.min(have,need)+' / '+need+'</span></div>';
    const b=mk('div','prog');b.style.setProperty('--c',col);const f=mk('i');f.style.width=Math.min(100,have/need*100)+'%';b.appendChild(f);pr.appendChild(b);return pr;};
  if(tier===0){card.appendChild(bar(SAVE.tokens,100,'<i class="tok"></i>',_t('Жетоны'),'var(--tok)'));card.appendChild(mk('div','meta',_t('Жетоны дают за врагов, волны и уровни сюжета.')));}
  else if(tier===1){card.appendChild(bar(SAVE.btokens,10,'<i class="btok"></i>',_t('Большие жетоны'),'var(--btok)'));card.appendChild(mk('div','meta',_t('Большой жетон дают за первое прохождение каждого уровня сюжета и за каждые 10 волн в бесконечном бою.')));}
  else card.appendChild(mk('div','meta','<b>'+_t('Есть: ')+SAVE.schests+'</b>'+_t(' · по одному за каждого финального босса главы (20-й уровень, первое прохождение) и за 25-ю волну в бесконечном бою.')));
  card.appendChild(mk('div','grow'));
  // выбор количества
  const seg=mk('div','cnt');seg.setAttribute('role','group');seg.setAttribute('aria-label',_t('Сколько открыть'));
  [1,3,10].forEach(n=>{const b=mk('button',chestN[tier]===n?'on':'','×'+n);b.setAttribute('aria-pressed',String(chestN[tier]===n));b.onclick=()=>{chestN[tier]=n;renderChests();};seg.appendChild(b);});
  card.appendChild(seg);
  const n=chestN[tier], row=mk('div','brow');
  const own=chestCost(tier,null,n), ok=own.have>=own.need, ic={tok:'<i class="tok"></i>',btok:'<i class="btok"></i>',sch:'<i class="sch"></i>'}[own.cur];
  const b=mk('button','pbtn '+(ok?'go':'poor'),ok?_t('Открыть')+(n>1?' ×'+n:''):ic+_t('ещё ')+(own.need-own.have));
  b.onclick=()=>{if(!ok){toast(tier===0?_t('Нужно ещё ')+(own.need-own.have)+_t(' жетонов'):tier===1?_t('Большие жетоны: за первое прохождение уровня сюжета и каждые 10 волн в бесконечном бою'):_t('Победи финального босса главы — получишь сверхбольшой сундук'));return;}openChest(tier,'own',n);};
  row.appendChild(b);
  if(tier>0){const eg=chestCost(tier,'eggs',n), eok=eg.have>=eg.need;
    const b2=mk('button','pbtn '+(eok?'buy':'poor'),_t('Купить · <i class="gegg"></i>')+eg.need);
    b2.onclick=()=>{if(!eok){toast(_t('Нужно ещё ')+(eg.need-eg.have)+_t(' золотых яиц'));SFX.hurt();return;}openChest(tier,'eggs',n);};row.appendChild(b2);}
  else row.style.gridTemplateColumns='1fr';
  card.appendChild(row);
  return card;
}
function renderChests(){
  const body=$('chestBody'), st=body.scrollTop; body.innerHTML='';
  const g=mk('div','grid wide chests');
  [0,1,2].forEach(t=>g.appendChild(chestCard(t)));
  body.appendChild(g);
  body.appendChild(mk('p','note',_t('У каждого сундука свои шансы — нажми «Свойства» на картинке сундука. Герои выпадают только из сундуков. Карты героев падают только для открытых героев, карты оружия — только для купленных стволов.')));
  body.appendChild(mk('div','sect',_t('Золотые яйца')));
  body.appendChild(mk('p','note',_t('Редкая валюта: у тебя <b>')+SAVE.eggs+_t('</b>. Большой сундук стоит ')+EGG_PRICE+_t(', сверхбольшой — ')+SUPER_PRICE+_t('. Где взять: первое прохождение уровней сюжета (3–15 за уровень), волны 10, 15 и 20 в бесконечном бою (один раз), 5-й и 10-й уровень героя, сундуки. Ещё за яйца продаются Нимб, Платиновый окрас и Рельсотрон.')));
  body.scrollTop=st;
}
/* «Свойства» сундука: что внутри и с каким шансом — считается от текущего прогресса */
function chestOdds(tier){
  const C=CHESTS[tier], o={hero:{},anyHero:0,hcards:{},wcards:{}};
  let miss=1;
  for(const rk of RAR_ORDER){const left=HERO_IDS.filter(id=>!SAVE.heroes[id]&&HEROES[id].chance&&HEROES[id].rar===rk).length;
    const p=left?RAR[rk].chance[tier]/100:0; o.hero[rk]={p:miss*p,left}; miss*=1-p;}
  const lockedAny=HERO_IDS.some(id=>!SAVE.heroes[id]&&HEROES[id].chance);
  if(C.sure&&lockedAny){const tot=RAR_ORDER.reduce((s,rk)=>s+HERO_IDS.filter(id=>!SAVE.heroes[id]&&HEROES[id].chance&&HEROES[id].rar===rk).length*RAR[rk].w,0);
    for(const rk of RAR_ORDER){const n=HERO_IDS.filter(id=>!SAVE.heroes[id]&&HEROES[id].chance&&HEROES[id].rar===rk).length;o.hero[rk].p+=miss*n*RAR[rk].w/tot;} miss=0;}
  o.anyHero=lockedAny?1-miss:0;
  const share=(ids,wf,keys,key)=>{const t=ids.reduce((s,id)=>s+wf(id),0);const r={};keys.forEach(k=>r[k]=0);ids.forEach(id=>r[key(id)]+=t?wf(id)/t:0);return r;};
  const hp=Object.keys(SAVE.heroes).filter(id=>SAVE.heroes[id].lv<10), wp=PRIMARY.filter(id=>SAVE.guns.includes(id)&&wLv(id)<10);
  o.hcards=share(hp,id=>RAR[HEROES[id].rar].w*C.hb[HEROES[id].rar],['common','rare','epic','legendary'],id=>HEROES[id].rar);
  o.wcards=share(wp,id=>WRAR[WEAP[id].rar].w*C.wb[WEAP[id].rar],WRAR_ORDER,id=>WEAP[id].rar);
  return o;
}
const pc=v=>{const x=v*100;return (x===0?'0':x>=10?Math.round(x):x>=1?x.toFixed(1):x.toFixed(2)).toString().replace('.',',')+'%';};
let ciTier=null;
function openChestInfo(tier){
  ciTier=tier;
  initAudio(); SFX.pick();
  const C=CHESTS[tier], o=chestOdds(tier), B=$('ciBody'); B.innerHTML='';
  $('ciName').textContent=C.name; $('ciSub').textContent=C.sub[0].toUpperCase()+C.sub.slice(1);
  const pv=mk('div','ci-pv '+['nest','gold','amet'][tier]);pv.appendChild(preview(200,128,(c,w,h)=>{c.translate(w/2,h-10);c.scale(.78,.78);drawChest(c,tier,0,0);}));B.appendChild(pv);
  const tbl=(head,rows)=>{const w=mk('div','tblwrap');const t=mk('table','tbl');t.innerHTML='<thead><tr>'+head.map((h,i)=>'<th'+(i?' class="n"':'')+'>'+h+'</th>').join('')+'</tr></thead><tbody>'+rows.map(r=>'<tr>'+r.map((x,i)=>'<td'+(i?' class="n"':'')+'>'+x+'</td>').join('')+'</tr>').join('')+'</tbody>';w.appendChild(t);return w;};
  const rb=(R)=>'<span class="rar" style="--c:'+R.c+'">'+R.name+'</span>';
  B.appendChild(mk('h3','ci-h',_t('Всегда внутри')));
  B.appendChild(tbl([_t('Награда'),_t('Сколько')],[
    [_t('<i class="coin"></i>Зёрна'),C.coins[0]+'–'+C.coins[1]],
    [_t('Пачки карт героев'),C.hpacks+' × '+C.hcard[0]+'–'+C.hcard[1]+_t(' карт*')],
    [_t('Пачки карт оружия'),C.wpacks+' × '+C.wcard[0]+'–'+C.wcard[1]+_t(' карт*')],
    [_t('<i class="gegg"></i>Золотые яйца'),(C.egg[0]>=1?_t('всегда'):_t('шанс ')+pc(C.egg[0]))+' · '+C.egg[1]+'–'+C.egg[2]]]));
  B.appendChild(mk('h3','ci-h',_t('Новый герой')+(C.sure?_t(' · гарантирован'):'')));
  B.appendChild(tbl([_t('Редкость'),_t('Шанс'),_t('Ещё закрыто')],['legendary','epic','rare','common'].map(rk=>[rb(RAR[rk]),pc(o.hero[rk].p),String(o.hero[rk].left)]).concat([[_t('<b>Хоть какой-то герой</b>'),'<b>'+pc(o.anyHero)+'</b>','']])));
  B.appendChild(mk('h3','ci-h',_t('Кому достанется пачка карт')));
  B.appendChild(tbl([_t('Карты героя'),_t('Шанс пачки'),_t('Карт в пачке')],['common','rare','epic','legendary'].map(rk=>[rb(RAR[rk]),pc(o.hcards[rk]),Math.max(1,Math.round(C.hcard[0]*RAR[rk].card))+'–'+Math.max(1,Math.round(C.hcard[1]*RAR[rk].card))])));
  B.appendChild(tbl([_t('Карты оружия'),_t('Шанс пачки'),_t('Карт в пачке')],WRAR_ORDER.map(rk=>[rb(WRAR[rk]),pc(o.wcards[rk]),Math.max(1,Math.round(C.wcard[0]*WRAR[rk].card))+'–'+Math.max(1,Math.round(C.wcard[1]*WRAR[rk].card))])));
  B.appendChild(mk('p','ci-note',_t('Шансы считаются от твоего прогресса: уже открытые герои и стволы на максимальном уровне не выпадают. Сначала проверяется самая высокая редкость героя. * Чем выше редкость, тем меньше карт в пачке.')));
  $('chestInfoOv').hidden=false;
}
$('ciClose').addEventListener('click',()=>{$('chestInfoOv').hidden=true;});
let chestAnim=null;
function openChest(tier,pay,n=1){
  initAudio();
  const c=chestCost(tier,pay==='eggs'?'eggs':null,n); if(c.have<c.need)return;
  if(c.cur==='eggs')SAVE.eggs-=c.need; else if(c.cur==='sch')SAVE.schests-=c.need; else if(c.cur==='btok')SAVE.btokens-=c.need; else SAVE.tokens-=c.need;
  const res={tier,n,coins:0,eggs:0,cards:{},wcards:{},heroes:[]};
  for(let i=0;i<n;i++){const r=rollChest(tier);res.coins+=r.coins;res.eggs+=r.eggs;if(r.hero)res.heroes.push(r.hero);
    for(const id in r.cards)res.cards[id]=(res.cards[id]||0)+r.cards[id];for(const id in r.wcards)res.wcards[id]=(res.wcards[id]||0)+r.wcards[id];}
  chestAnim={tier,res,t:0,state:'shake'};
  $('chestTitle').textContent=CHESTS[tier].name+(n>1?' ×'+n:'')+' · '+CHESTS[tier].sub;
  $('chestRewards').innerHTML=''; $('chestTake').textContent=_t('Открыть'); $('chestOv').hidden=false;
  refreshMenu(); SFX.chest();
}
function gunPv(id,w=56,h=46,k=1.15){return preview(w,h,(c,W,H)=>{c.translate(W/2-14*k,H/2+2);c.scale(k,k);drawGun(c,id);});}
function revealChest(){
  if(!chestAnim||chestAnim.state!=='shake')return;
  chestAnim.state='open'; chestAnim.t=0; SFX.boom(); SFX.win();
  const res=chestAnim.res, R=$('chestRewards'); R.innerHTML=''; let d=0;
  const add=(el)=>{el.style.animationDelay=d+'s';d+=Math.max(.05,.12-res.n*.006);R.appendChild(el);};
  for(const id of res.heroes){const H=HEROES[id],Rr=RAR[H.rar];const r=mk('div','rw new');r.style.setProperty('--c',Rr.c);
    r.appendChild(mk('span','t',_t('Новый герой · ')+Rr.name));r.appendChild(heroPv(id,150,96,1.6));r.appendChild(mk('span','n',H.name));add(r);}
  add(mk('div','rw','<i class="coin"></i>+'+res.coins+_t(' зёрен')));
  if(res.eggs)add(mk('div','rw','<i class="gegg"></i>+'+res.eggs+_t(' золотых яиц')+(res.tier<2?_t('<small>редкая находка!</small>'):'')));
  for(const id in res.cards){const H=HEROES[id],h=SAVE.heroes[id];const r=mk('div','rw');r.appendChild(heroPv(id,56,46,.9));
    const nc=h.lv<10?needCards(id,h.lv):0;
    r.appendChild(mk('div','','+'+res.cards[id]+_t(' карт · ')+H.name+'<small>'+(h.lv<10?h.cards+' / '+nc+_t(' до ур. ')+(h.lv+1):_t('макс. уровень'))+'</small>'));add(r);}
  for(const id in res.wcards){const W=WEAP[id],lv=wLv(id),wr=wRec(id);const r=mk('div','rw wcard');r.style.setProperty('--c',WRAR[W.rar].c);r.appendChild(gunPv(id));
    const nc=lv<10?wNeed(id,lv):0;
    r.appendChild(mk('div','','+'+res.wcards[id]+_t(' карт · ')+W.name+'<small>'+(lv<10?wr.cards+' / '+nc+_t(' до ур. ')+(lv+1)+_t(' · улучшай в магазине'):_t('макс. уровень'))+'</small>'));add(r);}
  if(!res.heroes.length){const lockedLeft=HERO_IDS.filter(id=>!SAVE.heroes[id]).length;if(lockedLeft)add(mk('div','rw',_t('<small>Героя в этот раз нет. Ещё не открыто: ')+lockedLeft+'</small>'));}
  $('chestTake').textContent=_t('Забрать');
}
$('chestTake').addEventListener('click',()=>{if(!chestAnim)return;if(chestAnim.state==='shake'){revealChest();return;}chestAnim=null;$('chestOv').hidden=true;afterChange();});
$('chestCv').addEventListener('click',()=>revealChest());
function drawChestAnim(dt){
  if(!chestAnim)return; chestAnim.t+=dt;
  const cvs=$('chestCv'),d=Math.min(2,devicePixelRatio||1);if(cvs.width!==240*d){cvs.width=240*d;cvs.height=170*d;}
  const c=cvs.getContext('2d');c.setTransform(d,0,0,d,0,0);c.clearRect(0,0,240,170);
  c.translate(120,150);
  if(chestAnim.state==='shake'){const k=Math.min(1,chestAnim.t/1.2);const sh=Math.sin(chestAnim.t*40)*.07*k;drawChest(c,chestAnim.tier,0,sh,k);if(chestAnim.t>1.3)revealChest();}
  else drawChest(c,chestAnim.tier,Math.min(1,chestAnim.t/.35),0);
}

/* ---------- panels ---------- */
const PANELS=['shop','heroes','storyP','chestP'];
function anyPanel(){return PANELS.some(p=>!$(p).hidden);}
function openPanel(id){initAudio();closePanels();$(id).hidden=false;refreshMenu();
  if(id==='shop')renderShop();else if(id==='heroes')renderHeroes();else if(id==='storyP')renderStory();else renderChests();}
function closePanels(){PANELS.forEach(p=>$(p).hidden=true);}
document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>{closePanels();refreshMenu();}));
document.querySelectorAll('#shop .tab').forEach(t=>t.addEventListener('click',()=>{shopTab=t.dataset.tab;$('shopBody').scrollTop=0;renderShop();}));
$('shopBtn').addEventListener('click',()=>openPanel('shop'));
$('heroSwap').addEventListener('click',()=>openPanel('heroes'));
/* ---------- фон главного меню ---------- */
function mapPv(key,w,h){return preview(w,h,(c)=>{
  const M=MAPS[key],R=seeded(M.seed);c.fillStyle=M.grass;c.fillRect(0,0,w,h);
  for(let i=0;i<5;i++){c.fillStyle=M.patch;c.beginPath();c.ellipse(R()*w,R()*h,10+R()*18,6+R()*10,R()*3,0,TAU);c.fill();}
  for(let i=0;i<40;i++){c.fillStyle=M.tuft[i%2];c.fillRect(R()*w,R()*h,2,3);}
  const vert=M.river.axis==='v', L=vert?h:w, base=(vert?w:h)*M.river.base/WW;
  const pt=t=>{const v=base+Math.sin(t/L*TAU*1.2+M.river.phase)*(vert?w:h)*.07;return vert?[v,t]:[t,v];};
  const path=()=>{c.beginPath();for(let t=-4;t<=L+4;t+=4){const [x,y]=pt(t);t<0?c.moveTo(x,y):c.lineTo(x,y);}};
  const B=M.branch, bpath=()=>{if(!B)return;const bv=B.axis==='v',bL=bv?h:w,bb=(bv?w:h)*B.base/WW,j=bv?pt(bb*w/w)[1]:pt(bb)[0];c.beginPath();
    for(let t=0;t<=1.0001;t+=.05){const u=B.end==='hi'?j+(bL+4-j)*t:j*(1-t)-4*t,v=bb+Math.sin(u/bL*TAU+B.phase)*(bv?w:h)*.04;const [x,y]=bv?[v,u]:[u,v];t?c.lineTo(x,y):c.moveTo(x,y);}};
  c.lineCap='round';
  path();c.strokeStyle=M.bank;c.lineWidth=20;c.stroke();bpath();c.lineWidth=16;c.stroke();
  bpath();c.strokeStyle=M.water;c.lineWidth=10;c.stroke();path();c.lineWidth=13;c.stroke();
  bpath();c.strokeStyle=M.deep;c.lineWidth=3.5;c.stroke();path();c.lineWidth=5;c.stroke();
  const [bx,by]=pt(L*.42);c.save();c.translate(bx,by);if(!vert)c.rotate(Math.PI/2);c.fillStyle='#a8743d';c.strokeStyle=INK;c.lineWidth=1.5;rr(c,-14,-6,28,12,2);c.fill();c.stroke();
  c.strokeStyle='rgba(43,29,20,.5)';c.lineWidth=1;for(let x=-10;x<=10;x+=5)seg(c,x,-6,x,6);c.restore();
  const spots=vert?[[w*.2,h*.3],[w*.38,h*.75],[w*.9,h*.2]]:[[w*.2,h*.78],[w*.62,h*.72],[w*.86,h*.12]];
  spots.forEach(([x,y],i)=>{c.save();c.translate(x,y);c.scale(.42,.42);drawObstacle(c,{x:0,y:0,r:30,type:M.obs[i*2%M.obs.length]});c.restore();});
});}
function renderBg(){
  const g=$('bgGrid'); g.innerHTML='';
  for(const key in MAPS){const M=MAPS[key],on=menuMap()===key;
    const b=mk('button','bgopt'+(on?' on':''));b.setAttribute('aria-pressed',String(on));
    b.appendChild(mapPv(key,132,78));b.appendChild(mk('span','',M.name+(on?' ✓':'')));
    b.onclick=()=>{SAVE.menuBg=key;persist();initAudio();SFX.pick();if(MAP!==key){buildWorld(key);const x=P.x,y=P.y;P=newPlayer();P.x=x;P.y=y;makeAllies();}renderBg();};
    g.appendChild(b);}
}
$('bgBtn').addEventListener('click',()=>{initAudio();renderBg();$('bgOv').hidden=false;});
$('bgClose').addEventListener('click',()=>{$('bgOv').hidden=true;toast(_t('Фон меню: ')+MAPS[menuMap()].name);});
$('helpBtn').addEventListener('click',()=>{initAudio();$('helpOv').hidden=false;});
function openInfo(){
  initAudio();
  const cl=$('creditsList'); cl.innerHTML=''; CREDITS.forEach(([n,full,r])=>cl.appendChild(mk('li','','<b>'+n+' <small>'+full+'</small></b><span>'+r+'</span>')));
  const pn=$('patchNotes'); pn.innerHTML='';
  PATCH_NOTES.forEach(N=>{const box=mk('div','note-v');box.appendChild(mk('h4','',_t('Версия ')+N.v+(N.tag?' <i>'+N.tag+'</i>':'')));
    const ul=mk('ul');N.items.forEach(t=>{const li=document.createElement('li');li.textContent=t;ul.appendChild(li);});box.appendChild(ul);pn.appendChild(box);});
  $('infoOv').hidden=false;
}
$('infoBtn').addEventListener('click',openInfo);
$('verBtn').addEventListener('click',openInfo);
$('infoClose').addEventListener('click',()=>{$('infoOv').hidden=true;});
$('helpClose').addEventListener('click',()=>{$('helpOv').hidden=true;});
$('mpBtn').addEventListener('click',()=>{toast(_t('Многопользовательская игра появится в одном из следующих обновлений'));});
$('skBtn').addEventListener('click',()=>{toast(_t('Режим Soul Knight пока в разработке — следи за обновлениями'));});
$('heroesBtn').addEventListener('click',()=>openPanel('heroes'));
$('chestBtn').addEventListener('click',()=>openPanel('chestP'));
$('storyBtn').addEventListener('click',()=>openPanel('storyP'));
$('endlessBtn').addEventListener('click',()=>{initAudio();startGame('endless');});
$('againBtn').addEventListener('click',()=>{initAudio();startGame(S.kind,S.lvIdx);});
$('restartBtn').addEventListener('click',()=>{initAudio();bankCoins();startGame(S.kind,S.lvIdx);});
$('menuBtn').addEventListener('click',toMenu);
$('winMenuBtn').addEventListener('click',toMenu);
$('nextBtn').addEventListener('click',()=>{const n=S.lvIdx+1;toMenu();if(n<STORY.length)openBrief(n);});
$('quitBtn').addEventListener('click',toMenu);
$('resumeBtn').addEventListener('click',resumeGame);
$('pauseBtn').addEventListener('click',pauseGame);
$('nadeBtn').addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();throwNade();});
$('ultBtn').addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();useUlt();});
/* ---------- настройки ---------- */
function syncSettings(){
  document.querySelectorAll('#langSeg button').forEach(b=>{const on=b.dataset.lang===SET.lang;b.classList.toggle('on',on);b.setAttribute('aria-pressed',String(on));});
  $('musVol').value=Math.round(SET.music*100); $('musVal').textContent=Math.round(SET.music*100)+'%';
  $('sfxVol').value=Math.round(SET.sfx*100); $('sfxVal').textContent=Math.round(SET.sfx*100)+'%';
  const tg=(b,on)=>{b.classList.toggle('on',on);b.setAttribute('aria-checked',String(on));};
  tg($('shakeTog'),SET.shake); tg($('autoTog'),autoAim); $('autoRow').hidden=COARSE;
}
function openSettings(){initAudio();syncSettings();$('setOv').hidden=false;}
function toggleAuto(){if(COARSE)return;autoAim=!autoAim;try{localStorage.setItem('kur_auto',autoAim?'1':'0');}catch(e){}syncSettings();toast(autoAim?_t('Автонаводка включена'):_t('Автонаводка выключена: целься мышью'));}
$('setBtn').addEventListener('click',openSettings);
$('pauseSetBtn').addEventListener('click',openSettings);
$('setClose').addEventListener('click',()=>{$('setOv').hidden=true;});
$('musVol').addEventListener('input',e=>{SET.music=e.target.value/100;saveSet();applyVolume();syncSettings();});
$('sfxVol').addEventListener('input',e=>{SET.sfx=e.target.value/100;saveSet();applyVolume();syncSettings();});
$('sfxVol').addEventListener('change',()=>SFX.pick());
$('shakeTog').addEventListener('click',()=>{SET.shake=!SET.shake;saveSet();syncSettings();if(SET.shake)S.shake=Math.max(S.shake,6);});
$('autoTog').addEventListener('click',toggleAuto);
document.querySelectorAll('#langSeg button').forEach(b=>b.addEventListener('click',()=>{
  if(b.dataset.lang===SET.lang)return; setLang(b.dataset.lang);
}));
function setLang(l){ // язык меняется сразу, окно настроек и текущий бой остаются на месте
  SET.lang=l; LANG=l; saveSet(); applyLang(); verLabels();
  refreshMenu(); afterChange(); syncSettings(); syncMute();
  if(!$('infoOv').hidden)openInfo();
  if(!$('brief').hidden)openBrief(briefIdx);
  if(!$('chestInfoOv').hidden&&ciTier!=null)openChestInfo(ciTier);
  if(!$('bgOv').hidden)renderBg();
  if(P&&S.mode!=='menu'){updateHUD();if(S.boss)$('bossName').textContent=ETYPE[S.boss.type].name;}
  SFX.pick();
}
syncSettings();
const muteBtn=$('muteBtn');
function syncMute(){muteBtn.classList.toggle('off',muted);muteBtn.setAttribute('aria-pressed',String(muted));}
muteBtn.addEventListener('click',()=>{muted=!muted;try{localStorage.setItem('kur_mute',muted?'1':'0');}catch(e){}initAudio();applyVolume();syncMute();});
syncMute();
