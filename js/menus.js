/* Экраны: магазин, герои и отряд, сюжет, сундуки */
/* ---------- boards ---------- */
function mk(tag,cls,html){const e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e;}
function preview(w,h,fn){const cvs=document.createElement('canvas');const d=Math.min(2,devicePixelRatio||1);cvs.width=w*d;cvs.height=h*d;cvs.style.width=w+'px';cvs.style.height=h+'px';
  const c=cvs.getContext('2d');c.scale(d,d);fn(c,w,h);return cvs;}
function birdPv(look,gun,w=140,h=100,k=1.55){return preview(w,h,(c)=>{c.translate(w/2-6,h-14);c.scale(k,k);drawBird(c,{x:0,y:0,face:1,ang:-.18,phase:0,moving:false,flash:0,kind:'player',gun,...look});});}
function heroPv(id,w,h,k){return birdPv(lookFor(id,SAVE.hat,SAVE.color),gunOf(id),w,h,k);}
function clsBadge(c){const C=CLASSES[c];const b=mk('span','rar',C.name);b.style.setProperty('--c',C.c);return b;}
function coinTag(n){return '<i class="coin"></i>'+fmt(n);}
function rarBadge(id){const r=RAR[HEROES[id].rar];const b=mk('span','rar',r.name);b.style.setProperty('--c',r.c);return b;}
function priceTag(n,cur){return (cur==='eggs'?'<i class="gegg"></i>':'<i class="coin"></i>')+fmt(n);}
function actBtn(owned,equipped,price,onBuy,onEquip,cur='coins'){
  const b=mk('button','pbtn');
  if(equipped){b.textContent='Выбрано';b.classList.add('on');b.disabled=true;}
  else if(owned){b.textContent='Выбрать';b.classList.add('eq');b.onclick=onEquip;}
  else{b.innerHTML=priceTag(price,cur);b.classList.add('buy');if((cur==='eggs'?SAVE.eggs:SAVE.coins)<price)b.classList.add('poor');b.onclick=()=>buy(price,onBuy,cur);}
  return b;
}
function buy(price,fn,cur='coins'){
  initAudio();
  const have=cur==='eggs'?SAVE.eggs:SAVE.coins;
  if(have<price){toast(cur==='eggs'?'Не хватает '+(price-have)+' золотых яиц':'Не хватает '+fmt(price-have)+' зёрен');SFX.hurt();return;}
  if(cur==='eggs')SAVE.eggs-=price; else SAVE.coins-=price;
  fn(); persist(); SFX.buy(); toast('Куплено!'); afterChange();
}
function equip(fn,msg){fn();persist();initAudio();SFX.pick();toast(msg||'Выбрано');afterChange();}
function afterChange(){
  refreshMenu();
  if(S.mode==='menu'){const x=P.x,y=P.y;P=newPlayer();P.x=x;P.y=y;makeAllies();}
  if(!$('shop').hidden)renderShop(); if(!$('heroes').hidden)renderHeroes(); if(!$('chestP').hidden)renderChests(); if(!$('storyP').hidden)renderStory();
}
let shopTab='skins';
function renderShop(){
  const body=$('shopBody'), st=body.scrollTop; body.innerHTML='';
  document.querySelectorAll('#shop .tab').forEach(t=>{t.classList.toggle('on',t.dataset.tab===shopTab);t.setAttribute('aria-selected',String(t.dataset.tab===shopTab));});
  if(shopTab==='skins'){
    body.appendChild(mk('div','sect','Шапки'));
    const g1=mk('div','grid');
    for(const id in HATS){const it=HATS[id],owned=SAVE.hats.includes(id),eq=SAVE.hat===id;
      const card=mk('div','item'+(eq?' sel':''));const pv=mk('div','pv');pv.appendChild(birdPv(lookFor(SAVE.hero,id,SAVE.color),gunOf(SAVE.hero)));card.appendChild(pv);
      card.appendChild(mk('h4','',it.name));card.appendChild(mk('div','grow'));
      card.appendChild(actBtn(owned,eq,it.eggs||it.price,()=>{SAVE.hats.push(id);SAVE.hat=id;},()=>equip(()=>{SAVE.hat=id;},'Надето: '+it.name),it.eggs?'eggs':'coins'));
      g1.appendChild(card);}
    body.appendChild(g1);
    body.appendChild(mk('div','sect','Окрас'));
    const g2=mk('div','grid');
    for(const id in COLORS){const it=COLORS[id],owned=SAVE.colors.includes(id),eq=SAVE.color===id;
      const card=mk('div','item'+(eq?' sel':''));const pv=mk('div','pv');pv.appendChild(birdPv(lookFor(SAVE.hero,SAVE.hat,id),gunOf(SAVE.hero)));card.appendChild(pv);
      card.appendChild(mk('h4','',it.name));card.appendChild(mk('div','grow'));
      card.appendChild(actBtn(owned,eq,it.eggs||it.price,()=>{SAVE.colors.push(id);SAVE.color=id;},()=>equip(()=>{SAVE.color=id;},'Окрас: '+it.name),it.eggs?'eggs':'coins'));
      g2.appendChild(card);}
    body.appendChild(g2);
  } else {
    const myC=clsOf(SAVE.hero);
    body.appendChild(mk('p','note','У каждого класса своё оружие: герой берёт в бой только стволы своего класса. Сейчас в бою '+HEROES[SAVE.hero].name+' — класс «'+CLASSES[myC].name+'». Патроны у основного ствола бесконечные.'));
    const order=[myC].concat(CLASS_ORDER.filter(k=>k!==myC));
    let g;
    order.forEach((ck,oi)=>{
      const C=CLASSES[ck];
      const sec=mk('div','sect',C.name+(ck===myC?' · твой класс':'')+' — '+C.desc);body.appendChild(sec);
      g=mk('div','grid');
      for(const id of PRIMARY.filter(w=>WEAP[w].cls===ck)){const W=WEAP[id],owned=SAVE.guns.includes(id),eq=SAVE.loadout[ck]===id;
        const card=mk('div','item'+(eq?' sel':''));const pv=mk('div','pv');
        pv.appendChild(preview(140,90,(c,w,h)=>{c.translate(w/2-32,h/2+2);c.scale(2.1,2.1);drawGun(c,id);}));card.appendChild(pv);
        card.appendChild(clsBadge(ck));
        card.appendChild(mk('h4','',W.name));card.appendChild(mk('p','',W.desc));
        const dps=Math.round(W.dmg*W.pellets/W.rate);
        card.appendChild(mk('div','meta',W.meta||('Урон '+W.dmg+(W.pellets>1?'×'+W.pellets:'')+' · '+(1/W.rate).toFixed(1)+' выстр/с · ≈'+dps+' в сек')));
        card.appendChild(mk('div','grow'));
        card.appendChild(actBtn(owned,eq,W.eggs||W.price,()=>{SAVE.guns.push(id);SAVE.loadout[ck]=id;},()=>equip(()=>{SAVE.loadout[ck]=id;},C.name+': '+W.name),W.eggs?'eggs':'coins'));
        g.appendChild(card);}
      if(oi<order.length-1)body.appendChild(g);
    });
    body.appendChild(g);
  }
  body.scrollTop=st;
}
function upgradeHero(id){
  const h=SAVE.heroes[id]; if(!h||h.lv>=10)return;
  const nc=needCards(id,h.lv), co=needCoins(id,h.lv);
  initAudio();
  if(h.cards<nc){toast('Нужно ещё '+(nc-h.cards)+' карт — открывай сундуки');SFX.hurt();return;}
  if(SAVE.coins<co){toast('Не хватает '+fmt(co-SAVE.coins)+' зёрен');SFX.hurt();return;}
  h.cards-=nc; SAVE.coins-=co; h.lv++; const eg=h.lv===5?3:h.lv===10?10:0; SAVE.eggs+=eg; persist(); SFX.buy();
  const H=HEROES[id];
  toast(h.lv===5?'Уровень 5! Пассивка «'+H.p5[0]+'» и +3 золотых яйца':h.lv===10?'Уровень 10! Пассивка «'+H.p10[0]+'» и +10 золотых яиц':H.name+': уровень '+h.lv);
  afterChange();
}
function renderHeroes(){
  const body=$('heroBody'), st=body.scrollTop; body.innerHTML='';
  body.appendChild(mk('p','note','Новых героев выбивают из сундуков. Карты героя из сундуков вместе с зёрнами повышают его уровень: +6% здоровья и +5% урона за уровень. На 5-м уровне открывается первая пассивка, на 10-м вторая.'));
  body.appendChild(mk('div','sect','Отряд'));
  body.appendChild(mk('p','note','Бойцы отряда в армейских касках идут рядом, стреляют из выбранного оружия, сами применяют ульту (жёлтая полоска под здоровьем) и принимают удары на себя. Если бойца выбили, через 18 секунд он возвращается, а рядом с живым медиком — вдвое быстрее. Сила зависит от уровня героя.'));
  const sg=mk('div','grid sq');
  for(let k=0;k<3;k++){
    const card=mk('div','item');
    if(k<SAVE.slots){
      const id=SAVE.squad[k];
      if(id&&SAVE.heroes[id]&&id!==SAVE.hero){
        const pv=mk('div','pv');pv.appendChild(birdPv(lookFor(id,'helmet','native'),gunForAlly(id),140,92,1.45));pv.appendChild(mk('span','lvl','Ур. '+heroLv(id)));card.appendChild(pv);
        card.appendChild(mk('h4','',HEROES[id].name));card.appendChild(mk('p','','Место '+(k+1)+' · '+CLASSES[clsOf(id)].name+' · ульта: '+HEROES[id].ult[0]));
        const g0=gunForAlly(id), opts=PRIMARY.filter(w=>WEAP[w].cls===clsOf(id)&&SAVE.guns.includes(w));
        card.appendChild(mk('div','meta','Оружие: <b>'+WEAP[g0].name+'</b>'+(opts.length>1?'':' · купи ещё стволы класса в магазине')));
        card.appendChild(mk('div','grow'));
        const row=mk('div','brow');
        const wb=mk('button','pbtn '+(opts.length>1?'go':'poor'),'Сменить оружие');
        wb.onclick=()=>{if(opts.length<2){toast('У класса «'+CLASSES[clsOf(id)].name+'» пока один ствол — купи ещё в магазине');return;}const nx=opts[(opts.indexOf(g0)+1)%opts.length];equip(()=>{SAVE.squadGun[id]=nx;},HEROES[id].name+': '+WEAP[nx].name);};
        row.appendChild(wb);
        const b=mk('button','pbtn eq thin','Убрать из отряда');b.onclick=()=>equip(()=>{SAVE.squad.splice(k,1);},'Боец ушёл из отряда');row.appendChild(b);card.appendChild(row);
      } else {
        const pv=mk('div','pv');pv.style.height='92px';pv.appendChild(mk('span','meta','Свободно'));card.appendChild(pv);
        card.appendChild(mk('h4','','Место '+(k+1)));card.appendChild(mk('p','','Нажми «В отряд» у героя ниже'));
      }
    } else {
      const pv=mk('div','pv dark');pv.style.height='92px';pv.appendChild(mk('span','lock','Закрыто'));card.appendChild(pv);
      card.appendChild(mk('h4','','Место '+(k+1)));
      card.appendChild(mk('div','grow'));
      if(k===SAVE.slots){const price=SLOT_PRICE[k];const b=mk('button','pbtn '+(SAVE.coins>=price?'buy':'buy poor'),'Открыть · '+coinTag(price));b.onclick=()=>buy(price,()=>{SAVE.slots=k+1;});card.appendChild(b);}
      else card.appendChild(mk('div','meta','Сначала открой место '+k));
    }
    sg.appendChild(card);
  }
  body.appendChild(sg);
  body.appendChild(mk('div','sect','Герои'));
  const g=mk('div','grid wide');
  const ids=HERO_IDS.slice().sort((a,b)=>(SAVE.heroes[b]?1:0)-(SAVE.heroes[a]?1:0));
  for(const id of ids){
    const H=HEROES[id],own=SAVE.heroes[id],eq=SAVE.hero===id,R=RAR[H.rar];
    const card=mk('div','item'+(eq?' sel':''));
    const pv=mk('div','pv'+(own?'':' dark'));pv.appendChild(heroPv(id,200,120,1.85));
    if(own)pv.appendChild(mk('span','lvl','Ур. '+own.lv));else pv.appendChild(mk('span','lock','Не открыт'));
    card.appendChild(pv);
    {const bw=mk('div','');bw.style.display='flex';bw.style.gap='6px';bw.style.flexWrap='wrap';bw.appendChild(rarBadge(id));bw.appendChild(clsBadge(H.cls));card.appendChild(bw);}
    card.appendChild(mk('h4','',H.name));
    card.appendChild(mk('p','',H.perk+' · '+H.hp+' здоровья'));
    card.appendChild(mk('div','ab','<span class="k">'+CLASSES[H.cls].name.toUpperCase()+'</span>'+CLASSES[H.cls].desc+'. Оружие: <b>'+WEAP[gunOf(id)].name+'</b>'));
    const ab=mk('div','abil');
    ab.appendChild(mk('div','ab ul','<span class="k">УЛЬТА</span><b>'+H.ult[0]+'.</b> '+H.ult[1]));
    const lv=own?own.lv:0;
    ab.appendChild(mk('div','ab'+(lv>=5?'':' off'),'<span class="k">УР. 5</span><b>'+H.p5[0]+'.</b> '+H.p5[1]));
    ab.appendChild(mk('div','ab'+(lv>=10?'':' off'),'<span class="k">УР. 10</span><b>'+H.p10[0]+'.</b> '+H.p10[1]));
    card.appendChild(ab);
    if(own){
      if(own.lv<10){
        const nc=needCards(id,own.lv),co=needCoins(id,own.lv);
        const pr=mk('div','');pr.innerHTML='<div class="progt"><span>Карты до ур. '+(own.lv+1)+'</span><span>'+own.cards+' / '+nc+'</span></div>';
        const bar=mk('div','prog');bar.style.setProperty('--c',R.c);const fill=mk('i');fill.style.width=Math.min(100,own.cards/nc*100)+'%';bar.appendChild(fill);pr.appendChild(bar);card.appendChild(pr);
      } else card.appendChild(mk('div','meta','Максимальный уровень · карт в запасе: '+own.cards));
      card.appendChild(mk('div','grow'));
      const row=mk('div','brow');
      const sel=mk('button','pbtn '+(eq?'on':'eq'),eq?'Выбрано':'Выбрать'); if(eq)sel.disabled=true; else sel.onclick=()=>equip(()=>{SAVE.hero=id;SAVE.squad=SAVE.squad.filter(x=>x!==id);},'В бой идёт '+H.name);
      row.appendChild(sel);
      if(own.lv<10){const nc=needCards(id,own.lv),co=needCoins(id,own.lv),ok=own.cards>=nc&&SAVE.coins>=co;
        const up=mk('button','pbtn '+(ok?'go':'poor'),'Ур. '+(own.lv+1)+' · '+coinTag(co));up.onclick=()=>upgradeHero(id);row.appendChild(up);}
      else{const m=mk('button','pbtn max','Максимум');m.disabled=true;row.appendChild(m);}
      card.appendChild(row);
      if(!eq&&SAVE.slots>0){
        const inSq=SAVE.squad.includes(id), free=SAVE.squad.filter(x=>SAVE.heroes[x]&&x!==SAVE.hero).length<SAVE.slots;
        const sb=mk('button','pbtn '+(inSq?'eq':free?'go':'poor'),inSq?'Убрать из отряда':free?'В отряд':'В отряде нет мест');
        sb.onclick=()=>{if(inSq)equip(()=>{SAVE.squad=SAVE.squad.filter(x=>x!==id);},'Боец ушёл из отряда');
          else if(free)equip(()=>{SAVE.squad=SAVE.squad.filter(x=>SAVE.heroes[x]&&x!==SAVE.hero);SAVE.squad.push(id);},H.name+' в отряде!');
          else toast('Купи ещё место для отряда');};
        card.appendChild(sb);
      }
    } else {
      card.appendChild(mk('div','grow'));
      card.appendChild(mk('div','meta','Выпадает как «'+RAR[H.rar].name.toLowerCase()+'» герой: '+pct(RAR[H.rar].chance[0])+' в обычном сундуке, '+pct(RAR[H.rar].chance[1])+' в большом'));
      const b=mk('button','pbtn go','К сундукам');b.onclick=()=>openPanel('chestP');card.appendChild(b);
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
  CHAPTERS.forEach((C,k)=>{const b=mk('button','tab'+(k===storyCh?' on':''),'Глава '+(k+1));if(!chapterOpen(k))b.style.opacity='.55';b.onclick=()=>{storyCh=k;$('storyBody').scrollTop=0;renderStory();};tabs.appendChild(b);});
  body.appendChild(tabs);
  const C=CHAPTERS[storyCh], open=chapterOpen(storyCh), doneN=C.levels.filter(L=>SAVE.story.done.includes(L.gid)).length;
  const head=mk('div','item');head.style.marginBottom='14px';
  head.appendChild(mk('p','eyebrow','Глава '+(storyCh+1)+' из '+CHAPTERS.length+' · пройдено '+doneN+'/20'));
  head.appendChild(mk('h4','',C.name));
  head.appendChild(mk('p','',C.intro));
  const bar=mk('div','prog');const f=mk('i');f.style.width=(doneN/20*100)+'%';bar.appendChild(f);head.appendChild(bar);
  if(doneN===20)head.appendChild(mk('div','ab ul','<span class="k">ФИНАЛ ГЛАВЫ</span>'+C.outro));
  if(!open)head.appendChild(mk('div','ab off','Глава откроется после победы над финальным боссом главы '+storyCh+'.'));
  body.appendChild(head);
  const g=mk('div','grid wide');
  C.levels.forEach(L=>{
    const done=SAVE.story.done.includes(L.gid), lopen=L.gid===0||SAVE.story.done.includes(L.gid-1)||done, boss=L.goal.type==='boss';
    const b=mk('button','item lvcard'+(done?' done':'')+(boss?' boss':'')+(lopen?'':' locked'));
    b.innerHTML='<div class="top"><span class="num">'+(L.i+1)+'</span><div><h4>'+L.name+'</h4><span class="st">'+(done?'Пройден':lopen?(boss?'Босс':'Доступен'):'Закрыт')+(L.night?' · ночь':'')+'</span></div></div>'+
      '<p>'+goalText(L)+'</p><div class="meta"><i class="coin"></i>'+L.coins+' · <i class="tok"></i>'+L.tokens+(done?' · повтор: меньше':' · <i class="gegg"></i>'+L.eggs)+'</div>';
    if(lopen)b.onclick=()=>openBrief(L.gid); else b.disabled=true;
    g.appendChild(b);
  });
  body.appendChild(g); body.scrollTop=st;
}
function goalText(L){const g=L.goal;
  if(g.type==='waves')return 'Пройди '+g.n+' волн'+(g.n<5?'ы':'');
  if(g.type==='kill')return 'Победи: '+(g.what==='any'?'любых врагов':(KILLN[g.what]||ETYPE[g.what].name).toLowerCase())+' ×'+g.n;
  if(g.type==='survive')return 'Продержись '+g.t+' секунд';
  return 'Победи босса: '+ETYPE[g.boss].name;
}
let briefIdx=0;
function openBrief(i){
  briefIdx=i; const L=STORY[i];
  $('briefNum').textContent='Глава '+(L.ch+1)+' · уровень '+(L.i+1)+' из 20'; $('briefName').textContent=L.name; $('briefText').textContent=L.text;
  const foes=[...new Set(Object.keys(L.mix).concat(L.goal.boss?[L.goal.boss]:[]))].map(k=>ETYPE[k].name.toLowerCase()).join(', ');
  $('briefGoal').innerHTML='<span>Цель: '+goalText(L)+'</span><small>Карта: '+MAPS[MAP_OF_CH[L.ch]].name+' · река с мостами, гнилые рушатся после второго прохода</small><small>Враги: '+foes+(L.night?'. Ночь — обзор меньше':'')+'</small><small>Награда: '+L.coins+' зёрен, '+L.tokens+' жетонов</small>';
  $('briefHero').textContent='Боец: '+HEROES[SAVE.hero].name+' ('+CLASSES[clsOf(SAVE.hero)].name.toLowerCase()+') · ур. '+heroLv(SAVE.hero)+' · '+WEAP[gunOf(SAVE.hero)].name;
  $('brief').hidden=false;
}
$('briefGo').addEventListener('click',()=>{initAudio();$('brief').hidden=true;startGame('story',briefIdx);});
$('briefBack').addEventListener('click',()=>{$('brief').hidden=true;});

/* ---------- chests ---------- */
function rollChest(big){
  const res={coins:Math.round(big?rand(150,250):rand(25,50)),cards:{},hero:null};
  for(const rk of RAR_ORDER){
    const pool=HERO_IDS.filter(id=>!SAVE.heroes[id]&&HEROES[id].chance&&HEROES[id].rar===rk);
    if(pool.length&&Math.random()*100<RAR[rk].chance[big?1:0]){res.hero=pool[Math.floor(Math.random()*pool.length)];break;}
  }
  res.eggs=Math.random()<(big?.3:.08)?Math.round(big?rand(2,5):rand(1,3)):0;
  const rolls=big?4:2;
  for(let i=0;i<rolls;i++){
    const pool=Object.keys(SAVE.heroes).filter(id=>SAVE.heroes[id].lv<10);
    if(!pool.length){res.coins+=big?40:10;continue;}
    let tot=0;pool.forEach(id=>tot+=RAR[HEROES[id].rar].w);let r=Math.random()*tot,pick=pool[0];
    for(const id of pool){r-=RAR[HEROES[id].rar].w;if(r<=0){pick=id;break;}}
    const amt=Math.max(1,Math.round((big?rand(8,14):rand(3,6))*RAR[HEROES[pick].rar].card));
    res.cards[pick]=(res.cards[pick]||0)+amt;
  }
  SAVE.coins+=res.coins; SAVE.eggs+=res.eggs;
  for(const id in res.cards)SAVE.heroes[id].cards+=res.cards[id];
  if(res.hero)SAVE.heroes[res.hero]={lv:1,cards:0};
  persist(); return res;
}
const pct=v=>String(v).replace('.',',')+'%';
function renderChests(){
  const body=$('chestBody'), st=body.scrollTop; body.innerHTML='';
  const g=mk('div','grid wide');
  const chest=(big)=>{
    const have=big?SAVE.btokens:SAVE.tokens, need=big?10:100, ok=have>=need;
    const card=mk('div','item');
    const pv=mk('div','pv '+(big?'gold':'nest'));pv.appendChild(preview(220,140,(c,w,h)=>{c.translate(w/2,h-14);c.scale(.92,.92);drawChest(c,big,0,0);}));card.appendChild(pv);
    card.appendChild(mk('h4','',big?'Большой сундук':'Обычный сундук'));
    card.appendChild(mk('p','',big?'Золотое яйцо в гнезде: 150–250 зёрен, 4 пачки карт героев, высокий шанс нового героя и шанс золотых яиц':'Плетёная корзинка несушки: 25–50 зёрен, 2 пачки карт героев и шанс нового героя'));
    const pr=mk('div','');pr.innerHTML='<div class="progt"><span>'+(big?'<i class="btok"></i>Большие жетоны':'<i class="tok"></i>Жетоны')+'</span><span>'+Math.min(have,need)+' / '+need+'</span></div>';
    const bar=mk('div','prog');bar.style.setProperty('--c',big?'var(--btok)':'var(--tok)');const f=mk('i');f.style.width=Math.min(100,have/need*100)+'%';bar.appendChild(f);pr.appendChild(bar);card.appendChild(pr);
    card.appendChild(mk('div','meta',big?(SAVE.bigDay===today()?'Большой жетон сегодня уже получен, следующий — завтра. Или купи сундук за золотые яйца.':'Пройди уровень сюжета сегодня — получишь большой жетон.'):'Жетоны дают за врагов, волны и уровни сюжета.'));
    card.appendChild(mk('div','grow'));
    const open=mk('button','pbtn '+(ok?'go':'poor'),ok?'Открыть':(big?'<i class="btok"></i>':'<i class="tok"></i>')+'ещё '+(need-have));
    open.onclick=()=>{if(!ok){toast(big?'Большие жетоны: 1 в день за пройденный уровень сюжета':'Нужно ещё '+(need-have)+' жетонов');return;}openChest(big);};
    if(big){
      const row=mk('div','brow');row.appendChild(open);
      const eggOk=SAVE.eggs>=EGG_PRICE;
      const b2=mk('button','pbtn '+(eggOk?'buy':'poor'),'Купить · <i class="gegg"></i>'+EGG_PRICE);
      b2.onclick=()=>{if(!eggOk){toast('Нужно ещё '+(EGG_PRICE-SAVE.eggs)+' золотых яиц');SFX.hurt();return;}openChest(true,'eggs');};
      row.appendChild(b2);card.appendChild(row);
    } else card.appendChild(open);
    return card;
  };
  g.appendChild(chest(false)); g.appendChild(chest(true));
  body.appendChild(g);
  body.appendChild(mk('div','sect','Шансы выпадения героя'));
  const wrap=mk('div','tblwrap');const t=mk('table','tbl');
  t.innerHTML='<thead><tr><th>Редкость</th><th class="n">Обычный</th><th class="n">Большой</th><th class="n">Открыто</th></tr></thead>';
  const tb=mk('tbody');
  ['common','rare','epic','legendary'].forEach(rk=>{const R=RAR[rk];
    const all=HERO_IDS.filter(id=>HEROES[id].rar===rk&&HEROES[id].chance), got=all.filter(id=>SAVE.heroes[id]).length;
    const tr=mk('tr');tr.innerHTML='<td><span class="rar" style="--c:'+R.c+'">'+R.name+'</span></td><td class="n">'+pct(R.chance[0])+'</td><td class="n">'+pct(R.chance[1])+'</td><td class="n">'+got+' / '+all.length+'</td>';tb.appendChild(tr);});
  t.appendChild(tb);wrap.appendChild(t);body.appendChild(wrap);
  body.appendChild(mk('p','note','Сначала проверяется самая высокая редкость. Если все герои этой редкости уже открыты, она не выпадает. Карты падают только для открытых героев: чем выше редкость, тем меньше карт в пачке.'));
  body.appendChild(mk('div','sect','Золотые яйца'));
  body.appendChild(mk('p','note','Редкая валюта: у тебя <b>'+SAVE.eggs+'</b>. Большой сундук стоит '+EGG_PRICE+'. Где взять: первое прохождение уровней сюжета (3–15 за уровень), волны 10, 15 и 20 в бесконечном бою (один раз), 5-й и 10-й уровень героя, иногда — внутри сундуков. Ещё за яйца продаются Нимб и Платиновый окрас.'));
  body.scrollTop=st;
}
let chestAnim=null;
const EGG_PRICE=80;
function openChest(big,pay){
  initAudio();
  if(pay==='eggs'){if(SAVE.eggs<EGG_PRICE)return;SAVE.eggs-=EGG_PRICE;}
  else if(big){if(SAVE.btokens<10)return;SAVE.btokens-=10;}else{if(SAVE.tokens<100)return;SAVE.tokens-=100;}
  const res=rollChest(big);
  chestAnim={big,res,t:0,state:'shake'};
  $('chestTitle').textContent=big?'Большой сундук · золотое яйцо':'Обычный сундук · корзинка несушки';
  $('chestRewards').innerHTML=''; $('chestTake').textContent='Открыть'; $('chestOv').hidden=false;
  refreshMenu(); SFX.chest();
}
function revealChest(){
  if(!chestAnim||chestAnim.state!=='shake')return;
  chestAnim.state='open'; chestAnim.t=0; SFX.boom(); SFX.win();
  const res=chestAnim.res, R=$('chestRewards'); R.innerHTML=''; let d=0;
  const add=(el)=>{el.style.animationDelay=d+'s';d+=.14;R.appendChild(el);};
  if(res.hero){const H=HEROES[res.hero],Rr=RAR[H.rar];const r=mk('div','rw new');r.style.setProperty('--c',Rr.c);
    r.appendChild(mk('span','t','Новый герой · '+Rr.name));r.appendChild(heroPv(res.hero,150,96,1.6));r.appendChild(mk('span','n',H.name));add(r);}
  add(mk('div','rw','<i class="coin"></i>+'+res.coins+' зёрен'));
  if(res.eggs)add(mk('div','rw','<i class="gegg"></i>+'+res.eggs+' золотых яиц<small>редкая находка!</small>'));
  for(const id in res.cards){const H=HEROES[id],h=SAVE.heroes[id];const r=mk('div','rw');r.appendChild(heroPv(id,56,46,.9));
    const nc=h.lv<10?needCards(id,h.lv):0;
    r.appendChild(mk('div','','+'+res.cards[id]+' карт · '+H.name+'<small>'+(h.lv<10?h.cards+' / '+nc+' до ур. '+(h.lv+1):'макс. уровень')+'</small>'));add(r);}
  if(!res.hero){const lockedLeft=HERO_IDS.filter(id=>!SAVE.heroes[id]).length;if(lockedLeft)add(mk('div','rw','<small>Героя в этот раз нет. Ещё не открыто: '+lockedLeft+'</small>'));}
  $('chestTake').textContent='Забрать';
}
$('chestTake').addEventListener('click',()=>{if(!chestAnim)return;if(chestAnim.state==='shake'){revealChest();return;}chestAnim=null;$('chestOv').hidden=true;afterChange();});
$('chestCv').addEventListener('click',()=>revealChest());
function drawChestAnim(dt){
  if(!chestAnim)return; chestAnim.t+=dt;
  const cvs=$('chestCv'),d=Math.min(2,devicePixelRatio||1);if(cvs.width!==240*d){cvs.width=240*d;cvs.height=170*d;}
  const c=cvs.getContext('2d');c.setTransform(d,0,0,d,0,0);c.clearRect(0,0,240,170);
  c.translate(120,150);
  if(chestAnim.state==='shake'){const k=Math.min(1,chestAnim.t/1.2);const sh=Math.sin(chestAnim.t*40)*.07*k;drawChest(c,chestAnim.big,0,sh,k);if(chestAnim.t>1.3)revealChest();}
  else drawChest(c,chestAnim.big,Math.min(1,chestAnim.t/.35),0);
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
$('helpBtn').addEventListener('click',()=>{initAudio();$('helpOv').hidden=false;});
function openInfo(){
  initAudio();
  const cl=$('creditsList'); cl.innerHTML=''; CREDITS.forEach(([n,r])=>cl.appendChild(mk('li','','<b>'+n+'</b><span>'+r+'</span>')));
  const pn=$('patchNotes'); pn.innerHTML='';
  PATCH_NOTES.forEach(N=>{const box=mk('div','note-v');box.appendChild(mk('h4','','Версия '+N.v+(N.tag?' <i>'+N.tag+'</i>':'')));
    const ul=mk('ul');N.items.forEach(t=>{const li=document.createElement('li');li.textContent=t;ul.appendChild(li);});box.appendChild(ul);pn.appendChild(box);});
  $('infoOv').hidden=false;
}
$('infoBtn').addEventListener('click',openInfo);
$('verBtn').addEventListener('click',openInfo);
$('infoClose').addEventListener('click',()=>{$('infoOv').hidden=true;});
$('helpClose').addEventListener('click',()=>{$('helpOv').hidden=true;});
$('mpBtn').addEventListener('click',()=>{toast('Многопользовательская игра появится в одном из следующих обновлений');});
$('skBtn').addEventListener('click',()=>{toast('Режим Soul Knight пока в разработке — следи за обновлениями');});
$('heroesBtn').addEventListener('click',()=>openPanel('heroes'));
$('chestBtn').addEventListener('click',()=>openPanel('chestP'));
$('storyBtn').addEventListener('click',()=>openPanel('storyP'));
$('endlessBtn').addEventListener('click',()=>{initAudio();startGame('endless');});
$('againBtn').addEventListener('click',()=>{initAudio();startGame(S.kind,S.lvIdx);});
$('menuBtn').addEventListener('click',toMenu);
$('winMenuBtn').addEventListener('click',toMenu);
$('nextBtn').addEventListener('click',()=>{const n=S.lvIdx+1;toMenu();if(n<STORY.length)openBrief(n);});
$('quitBtn').addEventListener('click',toMenu);
$('resumeBtn').addEventListener('click',resumeGame);
$('pauseBtn').addEventListener('click',pauseGame);
$('nadeBtn').addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();throwNade();});
$('ultBtn').addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();useUlt();});
function syncAuto(){const b=$('autoBtn');b.hidden=COARSE;b.classList.toggle('off',!autoAim);b.setAttribute('aria-pressed',String(autoAim));
  const pb=$('autoPauseBtn');pb.hidden=COARSE;pb.textContent='Автонаводка: '+(autoAim?'вкл':'выкл');}
function toggleAuto(){if(COARSE)return;autoAim=!autoAim;try{localStorage.setItem('kur_auto',autoAim?'1':'0');}catch(e){}syncAuto();toast(autoAim?'Автонаводка включена':'Автонаводка выключена: целься мышью');}
$('autoBtn').addEventListener('click',toggleAuto);
$('autoPauseBtn').addEventListener('click',toggleAuto);
syncAuto();
const muteBtn=$('muteBtn');
function syncMute(){muteBtn.classList.toggle('off',muted);muteBtn.setAttribute('aria-pressed',String(muted));}
muteBtn.addEventListener('click',()=>{muted=!muted;try{localStorage.setItem('kur_mute',muted?'1':'0');}catch(e){}initAudio();syncMute();});
syncMute();
