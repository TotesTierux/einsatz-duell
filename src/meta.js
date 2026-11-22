/* ============================ BELOHNUNGEN · AUFTRÄGE · MONEYSINK ============================
   Rewards  – nach jedem Spiel: Auftragsfortschritt + mit kleiner Chance ein Gratis-Booster
   Quests   – tägliche (3) und wöchentliche (3) Aufträge mit Bonus, wenn alle erledigt sind
   Cosmetic – Kartenrücken und Spielfelder zum Kaufen (rein optisch, Moneysink)
   Refine   – Seltenheitsstufe eines Exemplars gegen Münzen veredeln (Moneysink)
   ========================================================================================== */
const DROP_CHANCE = {ki:.06, story:.10, story_hard:.15, online:.12, kombi1:.15, kombi2:.08};
const DROP_PACKS  = [["pol",30],["ver",30],["mix",25],["fus",10],["prem",5]];

const QUEST_POOL = {
  daily: [
    {id:"d_win",     ev:"win",        n:3,    text:"Gewinne 3 Duelle",                       coins:200, xp:80},
    {id:"d_play",    ev:"play",       n:5,    text:"Spiele 5 Duelle",                        coins:150, xp:60},
    {id:"d_summon",  ev:"summon",     n:10,   text:"Schicke 10 Charaktere ins Feld",         coins:120, xp:50},
    {id:"d_spell",   ev:"spell",      n:6,    text:"Setze 6 Maßnahmen oder Tricks ein",      coins:120, xp:50},
    {id:"d_dmg",     ev:"damage",     n:8000, text:"Füge insgesamt 8.000 LP Schaden zu",     coins:150, xp:60},
    {id:"d_story",   ev:"story_win",  n:1,    text:"Gewinne 1 Story-Kapitel",                coins:150, xp:60},
    {id:"d_online",  ev:"online_play",n:1,    text:"Spiele 1 Online-Duell",                  coins:200, xp:80},
    {id:"d_kombi",   ev:"kombi_play", n:1,    text:"Spiele 1 Kombi-Einsatz",                 coins:150, xp:60},
    {id:"d_booster", ev:"booster",    n:2,    text:"Öffne 2 Booster",                        coins:100, xp:40},
    {id:"d_fusion",  ev:"fusion",     n:1,    text:"Bilde 1 Fusion",                         coins:150, xp:60},
    {id:"d_direct",  ev:"direct",     n:3,    text:"Greife den Gegner 3× direkt an",         coins:120, xp:50},
    {id:"d_destroy", ev:"destroy",    n:8,    text:"Schalte 8 gegnerische Charaktere aus",   coins:150, xp:60},
  ],
  weekly: [
    {id:"w_win",     ev:"win",        n:15,    text:"Gewinne 15 Duelle",                     coins:1000, xp:400, pack:"mix"},
    {id:"w_story",   ev:"story_win",  n:5,     text:"Gewinne 5 Story-Kapitel",               coins:900,  xp:350},
    {id:"w_online",  ev:"online_win", n:5,     text:"Gewinne 5 Online-Duelle",               coins:1200, xp:450, pack:"prem"},
    {id:"w_kombi",   ev:"kombi_top",  n:3,     text:"Werde 3× Erster oder Zweiter im Kombi-Einsatz", coins:1000, xp:400},
    {id:"w_dmg",     ev:"damage",     n:60000, text:"Füge insgesamt 60.000 LP Schaden zu",   coins:900,  xp:350},
    {id:"w_spend",   ev:"coins_spent",n:5000,  text:"Gib 5.000 Münzen aus",                  coins:800,  xp:300},
    {id:"w_train",   ev:"train",      n:2,     text:"Trainiere 2× eine Karte",               coins:700,  xp:300},
    {id:"w_summon",  ev:"summon",     n:60,    text:"Schicke 60 Charaktere ins Feld",        coins:800,  xp:300},
    {id:"w_cel",     ev:"celestial",  n:3,     text:"Spiele 3 Celestial-Karten aus",         coins:1000, xp:400, pack:"fus"},
  ],
};
const QUEST_BONUS = {daily:{coins:250, pack:"mix", text:"Alle 3 Tagesaufträge"}, weekly:{coins:1500, pack:"prem", text:"Alle 3 Wochenaufträge"}};
const QUEST_REROLL = 200;

const Rewards = {
  side(){ return Store.get("lastSide","polizei"); },
  /* nach einem Spiel: mode = ki | story | online | kombi; extra.hard / extra.place */
  result(mode, won, extra={}){
    Quests.track("play_any");
    if(mode!=="kombi"){ Quests.track("play"); if(won) Quests.track("win"); }
    if(mode==="story" && won) Quests.track("story_win");
    if(mode==="online"){ Quests.track("online_play"); if(won) Quests.track("online_win"); }
    if(mode==="kombi"){ Quests.track("kombi_play"); if(extra.place<=2) Quests.track("kombi_top"); }
    let key=null;
    if(mode==="kombi") key = extra.place===1?"kombi1":extra.place===2?"kombi2":null;
    else if(won) key = mode==="story"&&extra.hard?"story_hard":mode;
    const ch=key?DROP_CHANCE[key]:0;
    if(ch && Math.random()<ch*(1+.1*Prog.skill(this.side(),"luck"))) setTimeout(()=>this.givePack(this.pickPack(),"Glücksfund nach dem Sieg!"),2200);
  },
  pickPack(){ const tot=DROP_PACKS.reduce((s,x)=>s+x[1],0); let r=Math.random()*tot; for(const [id,w] of DROP_PACKS){ r-=w; if(r<=0) return id; } return "mix"; },
  givePack(id, why){
    const p=PACKS.find(x=>x.id===id); if(!p) return;
    Player.packs=Player.packs||{}; Player.packs[id]=(Player.packs[id]||0)+1; Player.save();
    banner("🎁 BOOSTER!"); toast(`${why||""} ${p.icon} ${p.name} – öffne ihn gratis im Shop`.trim());
    UI.badges();
  },
  packCount(){ return Object.values(Player.packs||{}).reduce((a,b)=>a+b,0); },
};

const Quests = {
  day(){ const d=new Date(); return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`; },
  week(){ const d=new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate()-((d.getDay()+6)%7)); return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`; },
  pick(kind,n,exclude=[]){ return shuffle(QUEST_POOL[kind].filter(q=>!exclude.includes(q.id))).slice(0,n).map(q=>({id:q.id,p:0,claimed:false})); },
  state(){
    const Q=Player.quests=Player.quests||{};
    if(Q.day!==this.day()){ Q.day=this.day(); Q.daily=this.pick("daily",3); Q.dailyBonus=false; Q.rerolled=false; }
    if(Q.week!==this.week()){ Q.week=this.week(); Q.weekly=this.pick("weekly",3); Q.weeklyBonus=false; }
    return Q;
  },
  def(kind,id){ return QUEST_POOL[kind].find(q=>q.id===id); },
  track(ev,n=1){
    const Q=this.state(); let done=false;
    ["daily","weekly"].forEach(kind=>Q[kind].forEach(q=>{ const d=this.def(kind,q.id); if(!d||d.ev!==ev||q.claimed||q.p>=d.n) return;
      q.p=Math.min(d.n,q.p+n); if(q.p>=d.n) done=d; }));
    if(done){ toast(`📋 Auftrag erledigt: ${done.text}`); }
    this._dirty=true; clearTimeout(this._t); this._t=setTimeout(()=>{ Player.save(); UI.badges(); },400);
  },
  claimable(){ const Q=this.state(); let n=0; ["daily","weekly"].forEach(k=>Q[k].forEach(q=>{ const d=this.def(k,q.id); if(d&&!q.claimed&&q.p>=d.n) n++; }));
    if(Q.daily.every(q=>q.claimed)&&!Q.dailyBonus) n++; if(Q.weekly.every(q=>q.claimed)&&!Q.weeklyBonus) n++; return n; },
  claim(kind,i){
    const Q=this.state(), q=Q[kind][i], d=this.def(kind,q.id); if(!d||q.claimed||q.p<d.n) return;
    q.claimed=true; Prog.reward(Rewards.side(), d.coins, d.xp);
    if(d.pack) setTimeout(()=>Rewards.givePack(d.pack,"Auftragsbelohnung:"),900);
    Player.save(); this.render();
  },
  claimBonus(kind){
    const Q=this.state(), key=kind+"Bonus"; if(Q[key]||!Q[kind].every(q=>q.claimed)) return;
    Q[key]=true; const b=QUEST_BONUS[kind]; Prog.reward(Rewards.side(), b.coins, 0); setTimeout(()=>Rewards.givePack(b.pack,"Bonus:"),900);
    banner(kind==="daily"?"TAGESBONUS!":"WOCHENBONUS!"); Player.save(); this.render();
  },
  async reroll(i){
    const Q=this.state(); if(Q.rerolled) return toast("Heute schon getauscht");
    if(Player.coins<QUEST_REROLL) return toast("Nicht genug Münzen");
    if(!await UI.ask(`Diesen Tagesauftrag für ${QUEST_REROLL} Münzen gegen einen neuen tauschen?`)) return;
    Player.coins-=QUEST_REROLL; this.track("coins_spent",QUEST_REROLL);
    Q.daily[i]=this.pick("daily",1,Q.daily.map(q=>q.id))[0]; Q.rerolled=true; Player.save(); UI.coins(); this.render();
  },
  left(kind){
    const now=new Date(), end=new Date(now); end.setHours(24,0,0,0);
    if(kind==="weekly") end.setDate(end.getDate()+((7-((now.getDay()+6)%7))-1));
    const ms=end-now, h=Math.floor(ms/36e5), m=Math.floor(ms%36e5/6e4);
    return h>=24?`${Math.floor(h/24)} T ${h%24} Std`:`${h} Std ${m} Min`;
  },
  render(){
    if(UI.current!=="quests") return;
    const Q=this.state();
    const row=(kind,q,i)=>{ const d=this.def(kind,q.id); if(!d) return ""; const pct=Math.round(q.p/d.n*100), ok=q.p>=d.n;
      return `<div class="qrow ${q.claimed?"done":ok?"ready":""}"><div class="qt"><b>${esc(d.text)}</b>
        <div class="qbar"><i style="width:${pct}%"></i><span>${q.p.toLocaleString("de-DE")} / ${d.n.toLocaleString("de-DE")}</span></div>
        <small>🪙 ${d.coins} · ${d.xp} XP${d.pack?` · 🎁 ${PACKS.find(p=>p.id===d.pack).name}`:""}</small></div>
        ${q.claimed?`<span class="qok">✅</span>`:ok?`<button class="small green" data-claim="${kind}:${i}">Abholen</button>`
          :kind==="daily"&&!Q.rerolled?`<button class="small ghost" data-reroll="${i}" title="Tauschen">🔄</button>`:""}</div>`; };
    const bonus=kind=>{ const b=QUEST_BONUS[kind], all=Q[kind].every(q=>q.claimed), got=Q[kind+"Bonus"];
      return `<div class="qbonus ${got?"done":all?"ready":""}">🎁 <b>${b.text}:</b> 🪙 ${b.coins} + ${PACKS.find(p=>p.id===b.pack).name}
        ${got?" ✅":all?`<button class="small red" data-bonus="${kind}">Bonus holen</button>`:""}</div>`; };
    $("questMain").innerHTML=`
      <h3 class="qh">📅 Tagesaufträge <small>neu in ${this.left("daily")}</small></h3>
      ${Q.daily.map((q,i)=>row("daily",q,i)).join("")}${bonus("daily")}
      <p class="muted" style="font-size:12px">🔄 Einen Tagesauftrag pro Tag kannst du für ${QUEST_REROLL} Münzen tauschen.</p>
      <h3 class="qh">🗓️ Wochenaufträge <small>neu in ${this.left("weekly")}</small></h3>
      ${Q.weekly.map((q,i)=>row("weekly",q,i)).join("")}${bonus("weekly")}`;
    $("questMain").querySelectorAll("[data-claim]").forEach(b=>b.onclick=()=>{ const [k,i]=b.dataset.claim.split(":"); this.claim(k,+i); });
    $("questMain").querySelectorAll("[data-bonus]").forEach(b=>b.onclick=()=>this.claimBonus(b.dataset.bonus));
    $("questMain").querySelectorAll("[data-reroll]").forEach(b=>b.onclick=()=>this.reroll(+b.dataset.reroll));
  },
};

/* ---------------- Kosmetik (Moneysink) ---------------- */
const COSMETICS = {
  back: [
    {id:"std",   name:"Standard",          price:0},
    {id:"blau",  name:"Blaulicht",         price:1500},
    {id:"unter", name:"Unterwelt",         price:2500},
    {id:"akte",  name:"Geheimakte",        price:3500},
    {id:"neon",  name:"Neon-Stadt",        price:5000},
    {id:"gold",  name:"Goldene Marke",     price:8000},
    {id:"stern", name:"Sternenhimmel",     price:12000},
  ],
  board: [
    {id:"std",    name:"Standard",         price:0},
    {id:"wache",  name:"Polizeiwache",     price:3000},
    {id:"nacht",  name:"Großstadt bei Nacht", price:4000},
    {id:"hafen",  name:"Hafen im Nebel",   price:5000},
    {id:"tresor", name:"Tresorraum",       price:7500},
    {id:"all",    name:"Weltall",          price:15000},
  ],
};
const Cosmetic = {
  data(){ const c=Player.cosmetics=Player.cosmetics||{}; c.own=c.own||{back:["std"],board:["std"]}; c.back=c.back||"std"; c.board=c.board||"std"; return c; },
  apply(){ const c=this.data(); document.body.className=document.body.className.replace(/\b(cb|bt)-\S+/g,"").trim();
    if(c.back!=="std") document.body.classList.add("cb-"+c.back); if(c.board!=="std") document.body.classList.add("bt-"+c.board); },
  async buy(kind,id){
    const c=this.data(), it=COSMETICS[kind].find(x=>x.id===id); if(!it) return;
    if(c.own[kind].includes(id)){ c[kind]=id; Player.save(); this.apply(); this.render(); return toast(`${it.name} ausgewählt`); }
    if(Player.coins<it.price) return toast("Nicht genug Münzen");
    if(!await UI.ask(`„${it.name}“ für ${it.price.toLocaleString("de-DE")} Münzen kaufen?`)) return;
    Player.coins-=it.price; Quests.track("coins_spent",it.price); c.own[kind].push(id); c[kind]=id; Player.save(); UI.coins(); this.apply(); banner("GEKAUFT!"); this.render();
  },
  render(){
    const el=$("cosmetics"); if(!el) return; const c=this.data();
    const tile=(kind,it)=>{ const own=c.own[kind].includes(it.id), on=c[kind]===it.id;
      return `<div class="cos ${on?"on":""}" data-k="${kind}" data-id="${it.id}">
        ${kind==="back"?`<div class="cardback cb-prev-${it.id}" style="--w:56px"></div>`:`<div class="bprev bp-${it.id}"></div>`}
        <b>${esc(it.name)}</b><small>${on?"✅ aktiv":own?"Auswählen":`🪙 ${it.price.toLocaleString("de-DE")}`}</small></div>`; };
    el.innerHTML=`<h3 class="qh">🎨 Kartenrücken</h3><div class="cosrow">${COSMETICS.back.map(it=>tile("back",it)).join("")}</div>
      <h3 class="qh">🏟️ Spielfeld</h3><div class="cosrow">${COSMETICS.board.map(it=>tile("board",it)).join("")}</div>`;
    el.querySelectorAll(".cos").forEach(t=>t.onclick=()=>this.buy(t.dataset.k,t.dataset.id));
  },
};

/* ---------------- Veredelung der Seltenheitsstufe (Moneysink) ---------------- */
const REFINE_COST = {C:300, R:1000, SP:3000, SE:8000, GH:20000};
const Refine = {
  next(k){ const i=PRINTS.findIndex(x=>x.k===k); return i>=0&&i<PRINTS.length-1?PRINTS[i+1].k:null; },
  /* das angezeigte Exemplar eine Stufe höher veredeln */
  can(id){ const k=Player.display(id), nx=this.next(k); return !!(Player.has(id) && nx && Player.coins>=REFINE_COST[k]); },
  async run(id){
    const k=Player.display(id), nx=this.next(k), cost=REFINE_COST[k], c=DB.byId(id);
    if(!nx) return; if(Player.coins<cost) return toast("Nicht genug Münzen");
    if(!await UI.ask(`Ein Exemplar „${c.name}“ von ${PRINT[k].name} zu ${PRINT[nx].name} veredeln? Kosten: ${cost.toLocaleString("de-DE")} Münzen.`)) return setTimeout(()=>UI.cardInfo(id),50);
    if(!Player.remove(id,k,1)) return toast("Veredeln nicht möglich");
    Player.add(id,1,nx); Player.show[id]=nx; Player.coins-=cost; Quests.track("coins_spent",cost); Player.save(); UI.coins();
    banner(`${PRINT[nx].name.toUpperCase()}!`); UI.renderCollection(); setTimeout(()=>UI.cardInfo(id),500);
  },
};

setTimeout(()=>{ try{ Cosmetic.apply(); UI.badges(); }catch(e){ console.error(e); } },0);
