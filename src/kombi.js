/* ============================ KOMBI-EINSATZ ============================
   Rundenbasierter Auto-Kampf für 4 Spieler (angelehnt an „Kombotaktiken“ aus Clash Royale):
   - Jede Runde: Aufstellungsphase (Einsatzmittel ausgeben, Einheiten kaufen/verkaufen/platzieren)
     und Kampfphase (die Einheiten kämpfen automatisch gegen das Team eines Mitspielers).
   - Zwei gleiche Einheiten gleicher Stufe verschmelzen automatisch zur nächsten Stufe (★ → ★★ …).
   - Merkmale: Einheiten derselben Einheit-Art (Streife, SEK, Bande …) geben ab 2 bzw. 4 auf dem Feld Boni.
   - Wer verliert, verliert Lebenspunkte – wer zuletzt übrig ist, gewinnt. Platz 1 und 2 zählen als Sieg.
   ========================================================================= */
const KB = {
  HP:15, BENCH:5, SHOP:3, INCOME:5, MAXTEAM:6, MAXEL:20, BATTLE_MS:30000, FRENZY_MS:10000,
  COPIES:{2:8,3:6,4:4,5:4},                       // Exemplare je Einheit im gemeinsamen Pool
  STARMUL:[1,1,1.8,3.2,5.6],                      // Werte je Stufe
  NEED:[0,1,2,4,8],                               // Exemplare je Stufe
  RANGED:{kripo:1,verkehr:1,betrug:1,hehler:1},
  ODDS:[ [70,30,0,0],[55,35,10,0],[45,35,15,5],[35,33,22,10],[30,32,25,13],[25,30,28,17] ],
};
const KB_TRAITS = {
  streife:{d:"+15 % / +35 % Lebenspunkte", hp:[.15,.35]},
  kripo:  {d:"Fernkampf · +20 % / +45 % Schaden", dmg:[.2,.45]},
  sek:    {d:"Erster Angriff trifft dreifach / vierfach", first:[3,4]},
  verkehr:{d:"Fernkampf · Schild +400 / +900 zu Kampfbeginn", shield:[400,900]},
  hunde:  {d:"+25 % / +60 % Angriffstempo", spd:[.25,.6]},
  bepo:   {d:"−20 % / −40 % erlittener Schaden", armor:[.2,.4]},
  dieb:   {d:"20 % / 40 % Ausweichen", dodge:[.2,.4]},
  betrug: {d:"Fernkampf · Getroffene machen −15 % / −30 % Schaden", weaken:[.15,.3]},
  bande:  {d:"Ganzes Team +10 % / +20 % Schaden und LP", team:[.1,.2]},
  hehler: {d:"Fernkampf · +1 / +3 Einsatzmittel pro Runde", income:[1,3]},
  raub:   {d:"Heilt sich um 25 % / 50 % des Schadens", steal:[.25,.5]},
  drogen: {d:"Vergiftet: 60 / 150 Schaden pro Sekunde", poison:[60,150]},
};
const KB_RULERS = [
  {id:"praes", name:"Präsidentin Hartmann", emoji:"👩‍✈️", d:"Nach jeder verlorenen Runde +4 Einsatzmittel."},
  {id:"pate",  name:"Der Pate",             emoji:"🎩",  d:"Jede Kombination bringt +1 zusätzliches Einsatzmittel."},
  {id:"wolf",  name:"Einsatzleiter Wolf",   emoji:"🧭",  d:"Ein Mal pro Runde gratis neu mischen, +1 Bankplatz."},
];
const KB_MODS = [
  {id:"budget", name:"Sonderbudget",   d:"+2 Einsatzmittel pro Runde."},
  {id:"preis",  name:"Einheitspreis",  d:"Alle Einheiten kosten 3."},
  {id:"gross",  name:"Großeinsatz",    d:"Das Team ist von Anfang an um 1 größer."},
  {id:"rase",   name:"Blaulicht",      d:"Die Raserei (doppeltes Tempo) beginnt schon nach 10 Sekunden."},
  {id:"kombi",  name:"Doppelkombi",    d:"Jede Kombination bringt +2 statt +1 Einsatzmittel."},
  {id:"stern",  name:"Sternstart",     d:"Alle starten mit einer ★★-Einheit."},
];
const KB_PRIZE = {1:{coins:300,xp:220},2:{coins:160,xp:140},3:{coins:70,xp:80},4:{coins:30,xp:50}};

const Kombi = {
  g:null, sel:null, anim:null, speed:1,

  /* ---------------- Einheiten ---------------- */
  cost(c){ if(this.g&&this.g.mod.id==="preis") return 3; const l=c.level||1; return l<=3?2:l===4?3:l<=6?4:5; },
  tier(c){ const l=c.level||1; return l<=3?2:l===4?3:l<=6?4:5; },
  card(u){ return DB.byId(u.id); },
  unit(id,star=1){ return {u:"u"+Math.random().toString(36).slice(2,9), id, star}; },
  value(u){ return this.cost(this.card(u))*KB.NEED[u.star]; },
  power(u){ const c=this.card(u); return ((c.atk||0)+(c.def||0))*KB.STARMUL[u.star]; },

  /* ---------------- Spielstart ---------------- */
  render(){ if(this.g) return this.draw(); this.lobby(); },
  lobby(){
    const st=Player.kombi||{n:0,w:0,best:0};
    $("kbMain").innerHTML=`<div class="panel kb-intro">
      <p>Vier Einsatzleiter treten gegeneinander an. Kaufe Einheiten, <b>kombiniere zwei gleiche</b> zu einer stärkeren
      und aktiviere <b>Merkmale</b> mit mehreren Einheiten derselben Art. Die Kämpfe laufen automatisch.
      Verlierst du, kostet dich jede überlebende gegnerische Einheit Lebenspunkte. Platz 1 und 2 zählen als Sieg.</p>
      <p class="muted">Gespielt: ${st.n} · Siege: ${st.w}${st.best?` · Bester Platz: ${st.best}`:""}</p></div>
      <h3 class="kb-h">Wähle deinen Einsatzleiter</h3>
      <div class="kb-rulers">${KB_RULERS.map(r=>`<button class="kb-ruler" data-r="${r.id}"><span class="em">${r.emoji}</span><b>${esc(r.name)}</b><small>${esc(r.d)}</small></button>`).join("")}</div>`;
    $("kbMain").querySelectorAll("[data-r]").forEach(b=>b.onclick=()=>this.start(b.dataset.r));
    $("kbBar").innerHTML=""; $("kbTitle").textContent="Kombi-Einsatz";
  },
  pickPool(){
    // je Einheiten-Art 2 Karten → 24 Einheiten im Spiel, gemischt über alle Kostenstufen
    const chars=DB.cards.filter(c=>c.type==="monster" && ROLES[c.faction] && ROLES[c.faction][c.attr] && c.atk>0);
    const ids=[];
    Object.keys(KB_TRAITS).forEach(role=>{
      const list=shuffle(chars.filter(c=>c.attr===role));
      const byTier={}; list.forEach(c=>(byTier[this.tier(c)]=byTier[this.tier(c)]||[]).push(c));
      const tiers=shuffle(Object.keys(byTier)); const pick=[];
      for(const t of tiers){ if(pick.length<2) pick.push(byTier[t][0]); }
      for(const c of list){ if(pick.length>=2) break; if(!pick.includes(c)) pick.push(c); }
      pick.forEach(c=>ids.push(c.id));
    });
    const pool={}; ids.forEach(id=>pool[id]=KB.COPIES[this.tier(DB.byId(id))]); return pool;
  },
  start(rulerId){
    const mod=KB_MODS[Math.floor(Math.random()*KB_MODS.length)];
    const names=shuffle(["KI Kommissar Klaus","KI Bandenchef Bruno","KI Hauptmeisterin Hanna","KI Phantom Paula","KI Hehler Horst","KI Streifenführer Sven"]).slice(0,3);
    const mk=(name,ai,ruler)=>({name,ai,ruler,hp:KB.HP,el:0,board:Array(KB.MAXTEAM).fill(null),bench:Array(KB.BENCH+2).fill(null),shop:[],free:0,place:0,lost:false,streak:0,merges:0});
    this.g={round:0,mod,pool:null,phase:"deploy",log:[],
      players:[mk(Store.get("nick","")||"Du",false,rulerId), ...names.map(n=>mk(n,true,KB_RULERS[Math.floor(Math.random()*3)].id))]};
    this.g.pool=this.pickPool(); this.sel=null;
    // Startaufstellung: eine zufällige günstige Einheit (bei „Sternstart“ ★★)
    const cheap=Object.keys(this.g.pool).filter(id=>this.tier(DB.byId(id))===2);
    this.g.players.forEach(p=>{ const id=cheap[Math.floor(Math.random()*cheap.length)]; const star=mod.id==="stern"?2:1;
      if(this.take(id,KB.NEED[star])) p.board[0]=this.unit(id,star); });
    this.dialog([`🎲 Sonderregel: ${mod.name}`, mod.d],"Los geht's!");
    this.nextRound();
  },
  take(id,n=1){ if((this.g.pool[id]||0)<n) return false; this.g.pool[id]-=n; return true; },
  give(u){ this.g.pool[u.id]=(this.g.pool[u.id]||0)+KB.NEED[u.star]; },
  me(){ return this.g.players[0]; },
  alive(){ return this.g.players.filter(p=>!p.lost); },
  team(p){ return Math.min(KB.MAXTEAM, 1+this.g.round+(this.g.mod.id==="gross"?1:0)); },
  benchSize(p){ return KB.BENCH+(p.ruler==="wolf"?1:0); },

  nextRound(){
    const g=this.g; g.round++; g.phase="deploy";
    g.players.filter(p=>!p.lost).forEach(p=>{
      const tr=this.traits(p.board);
      p.el=Math.min(KB.MAXEL, p.el+KB.INCOME+(g.mod.id==="budget"?2:0)+(tr.hehler?KB_TRAITS.hehler.income[tr.hehler-1]:0));
      p.free = p.ruler==="wolf"?1:0;
      this.roll(p);
    });
    g.players.filter(p=>p.ai&&!p.lost).forEach(p=>this.aiTurn(p));
    this.sel=null; this.draw();
  },

  /* ---------------- Laden ---------------- */
  roll(p){
    const odds=KB.ODDS[Math.min(this.g.round-1,KB.ODDS.length-1)];
    const ids=Object.keys(this.g.pool);
    p.shop=[];
    for(let i=0;i<KB.SHOP;i++){
      let r=Math.random()*100, t=2; for(let k=0;k<4;k++){ if(r<odds[k]){ t=k+2; break; } r-=odds[k]; }
      let cand=ids.filter(id=>this.tier(DB.byId(id))===t && this.g.pool[id]>0);
      if(!cand.length) cand=ids.filter(id=>this.g.pool[id]>0);
      if(!cand.length) break;
      // gewichtet nach verbliebenen Exemplaren
      const tot=cand.reduce((s,id)=>s+this.g.pool[id],0); let x=Math.random()*tot, pick=cand[0];
      for(const id of cand){ x-=this.g.pool[id]; if(x<=0){ pick=id; break; } }
      p.shop.push(pick);
    }
  },
  reroll(p=this.me()){
    if(this.g.phase!=="deploy") return;
    if(p.free>0) p.free--; else { if(p.el<1) return p.ai||toast("Nicht genug Einsatzmittel"); p.el--; }
    this.roll(p); if(!p.ai) this.draw();
  },
  buy(i,p=this.me()){
    const g=this.g, id=p.shop[i]; if(!id||g.phase!=="deploy") return false;
    const c=DB.byId(id), cost=this.cost(c);
    if(p.el<cost){ if(!p.ai) toast("Nicht genug Einsatzmittel"); return false; }
    const free=p.bench.slice(0,this.benchSize(p)).indexOf(null);
    const wouldMerge=[...p.board,...p.bench].filter(u=>u&&u.id===id&&u.star===1).length>=1;
    if(free<0 && !wouldMerge){ if(!p.ai) toast("Deine Bank ist voll – verkaufe oder platziere erst eine Einheit"); return false; }
    if(!this.take(id)){ if(!p.ai) toast("Diese Einheit ist ausverkauft"); return false; }
    p.el-=cost; p.shop[i]=null;
    const u=this.unit(id,1);
    if(free>=0) p.bench[free]=u; else p.bench[this.benchSize(p)]=u;   // Zwischenplatz nur zum Kombinieren
    this.merge(p);
    if(!p.ai) this.draw();
    return true;
  },
  sell(where,i,p=this.me()){
    const arr=where==="b"?p.board:p.bench, u=arr[i]; if(!u||this.g.phase!=="deploy") return;
    if(where==="b" && p.board.filter(Boolean).length<=1) return toast("Mindestens eine Einheit muss im Einsatz bleiben");
    arr[i]=null; this.give(u); p.el=Math.min(KB.MAXEL,p.el+Math.max(1,this.value(u)-(u.star>1?1:0)));
    if(!p.ai){ this.sel=null; this.draw(); }
  },
  /* Zwei gleiche Einheiten gleicher Stufe → nächste Stufe (wiederholt, falls dadurch erneut ein Paar entsteht) */
  merge(p){
    let again=true, n=0;
    while(again){ again=false;
      const all=[...p.board.map((u,i)=>u&&{u,w:"b",i}),...p.bench.map((u,i)=>u&&{u,w:"n",i})].filter(Boolean);
      for(const a of all){ if(a.u.star>=4) continue;
        const b=all.find(x=>x!==a&&x.u.id===a.u.id&&x.u.star===a.u.star); if(!b) continue;
        const keep = a.w==="b"?a:(b.w==="b"?b:a), drop = keep===a?b:a;
        (drop.w==="b"?p.board:p.bench)[drop.i]=null;
        keep.u.star++; n++; again=true;
        if(!p.ai) this.mergeFx(keep.u);
        break; }
    }
    // Zwischenplatz räumen
    const extra=p.bench[this.benchSize(p)]; if(extra){ p.bench[this.benchSize(p)]=null; const f=p.bench.indexOf(null); if(f>=0&&f<this.benchSize(p)) p.bench[f]=extra; else { this.give(extra); p.el+=this.cost(this.card(extra)); } }
    if(n){ const bonus=(this.g.mod.id==="kombi"?2:1)+(p.ruler==="pate"?1:0); p.el=Math.min(KB.MAXEL,p.el+n*bonus); p.merges+=n;
      if(!p.ai) toast(`Kombiniert! +${n*bonus} Einsatzmittel`); }
  },
  mergeFx(u){ this._fx=u.u; setTimeout(()=>{ if(this._fx===u.u) this._fx=null; },900); banner(`${"★".repeat(u.star)} KOMBI!`); },

  /* ---------------- Platzieren ---------------- */
  tap(where,i){
    const g=this.g, p=this.me(); if(g.phase!=="deploy") return;
    const arr=w=>w==="b"?p.board:p.bench;
    const u=arr(where)[i];
    if(this.sel){
      const s=this.sel; this.sel=null;
      if(s.w===where&&s.i===i){ return this.info(where,i); }
      const A=arr(s.w), B=arr(where), x=A[s.i], y=B[i];
      if(where==="b" && s.w==="n" && !y && p.board.filter(Boolean).length>=this.team(p)) { toast(`Teamgröße ${this.team(p)} erreicht – tausche eine Einheit aus`); return this.draw(); }
      if(s.w==="b" && where==="n" && !y && p.board.filter(Boolean).length<=1){ toast("Mindestens eine Einheit muss im Einsatz bleiben"); return this.draw(); }
      A[s.i]=y; B[i]=x; return this.draw();
    }
    if(u){ this.sel={w:where,i}; this.draw(); }
  },
  info(where,i){
    const p=this.me(), u=(where==="b"?p.board:p.bench)[i]; if(!u) return;
    const c=this.card(u), s=this.stats(u,{}), tr=KB_TRAITS[c.attr];
    UI.modal(c,[[`${"★".repeat(u.star)} · ${roleName(c.faction,c.attr)} · ${KB.RANGED[c.attr]?"Fernkampf":"Nahkampf"}`,null,"ghost"],
      [`❤️ ${s.hp} · 💥 ${s.dmg} pro Angriff`,null,"ghost"],
      [`Merkmal ${roleName(c.faction,c.attr)}: ${tr.d}`,null,"ghost"],
      [`Verkaufen (+${Math.max(1,this.value(u)-(u.star>1?1:0))} ⚡)`,()=>{ UI.closeModal(); this.sell(where,i); },"red"]]);
  },
  /* Bank automatisch auf freie Feldplätze verteilen (stärkste zuerst) */
  autoPlace(p){
    const room=()=>this.team(p)-p.board.filter(Boolean).length;
    const bench=p.bench.map((u,i)=>u&&{u,i}).filter(Boolean).sort((a,b)=>this.power(b.u)-this.power(a.u));
    for(const b of bench){ if(room()<=0) break;
      const ranged=KB.RANGED[this.card(b.u).attr];
      const order=ranged?[3,4,5,0,1,2]:[0,1,2,3,4,5]; const z=order.find(k=>!p.board[k]);
      if(z==null) break; p.board[z]=b.u; p.bench[b.i]=null; }
    // stärkere Bankeinheiten gegen schwächere auf dem Feld tauschen
    for(let k=0;k<6;k++){
      const weakest=p.board.map((u,i)=>u&&{u,i}).filter(Boolean).sort((a,b)=>this.power(a.u)-this.power(b.u))[0];
      const best=p.bench.map((u,i)=>u&&{u,i}).filter(Boolean).sort((a,b)=>this.power(b.u)-this.power(a.u))[0];
      if(!weakest||!best||this.power(best.u)<=this.power(weakest.u)*1.05) break;
      p.board[weakest.i]=best.u; p.bench[best.i]=weakest.u;
    }
  },

  /* ---------------- KI ---------------- */
  aiTurn(p){
    for(let guard=0;guard<12;guard++){
      const own=[...p.board,...p.bench].filter(Boolean);
      // 1. Kauf, der eine Kombination ergibt  2. teuerste bezahlbare Einheit, solange Platz
      let idx=p.shop.findIndex(id=>id&&own.some(u=>u.id===id&&u.star===1)&&p.el>=this.cost(DB.byId(id)));
      if(idx<0){ const free=p.bench.slice(0,this.benchSize(p)).filter(x=>!x).length;
        const cands=p.shop.map((id,i)=>id&&{i,c:DB.byId(id)}).filter(x=>x&&p.el>=this.cost(x.c)&&free>0)
          .sort((a,b)=>this.cost(b.c)-this.cost(a.c)+(Math.random()-.5)); if(cands.length) idx=cands[0].i; }
      if(idx>=0 && this.buy(idx,p)) continue;
      if(p.el>=4 || (p.free>0)) { this.reroll(p); continue; }
      break;
    }
    this.autoPlace(p);
    // Bank überfüllt? Schwächste verkaufen, wenn kein Paar möglich
    const bench=p.bench.map((u,i)=>u&&{u,i}).filter(Boolean);
    if(bench.length>=this.benchSize(p)){ const w=bench.sort((a,b)=>this.power(a.u)-this.power(b.u))[0]; this.sell("n",w.i,p); }
  },

  /* ---------------- Merkmale & Werte ---------------- */
  traits(board){
    const cnt={}; board.filter(Boolean).forEach(u=>{ const r=this.card(u).attr; cnt[r]=(cnt[r]||0)+1; });
    const lv={}; Object.entries(cnt).forEach(([r,n])=>{ if(n>=4) lv[r]=2; else if(n>=2) lv[r]=1; });
    lv._cnt=cnt; return lv;
  },
  stats(u,tr){
    const c=this.card(u), m=KB.STARMUL[u.star], T=(k,f)=>tr[k]?KB_TRAITS[k][f][tr[k]-1]:0;
    let hp=((c.def||0)+1000)*m, dmg=(c.atk||0)*0.18*m;
    const team=T("bande","team"); hp*=1+team; dmg*=1+team;
    if(c.attr==="streife") hp*=1+T("streife","hp");
    if(c.attr==="kripo") dmg*=1+T("kripo","dmg");
    return {hp:Math.round(hp), dmg:Math.round(dmg),
      as: 1000/(1+(c.attr==="hunde"?T("hunde","spd"):0)),
      shield: c.attr==="verkehr"?T("verkehr","shield"):0,
      armor: c.attr==="bepo"?T("bepo","armor"):0,
      dodge: c.attr==="dieb"?T("dieb","dodge"):0,
      weaken: c.attr==="betrug"?T("betrug","weaken"):0,
      steal: c.attr==="raub"?T("raub","steal"):0,
      poison: c.attr==="drogen"?T("drogen","poison"):0,
      first: c.attr==="sek"?T("sek","first"):0,
      ranged: !!KB.RANGED[c.attr] };
  },

  /* ---------------- Kampf ---------------- */
  /* Körperform einer Einheit aus Name, Emoji und Art (für Laufweg und 3D-Figur) */
  body(c){
    const t=(c.name+" "+((c.art&&c.art.emoji)||"")).toLowerCase();
    if(/hubschrauber|heli|libelle|drohne|🚁|🛸/.test(t)) return "heli";
    if(c.attr==="hunde"||/hund|🐕|🐶|🐺|🐩|🦮|🐕‍🦺/.test(t)) return "dog";
    if(/wagen|fahrzeug|auto\b|transporter|bus\b|lkw|motorrad|roller|🚓|🚔|🚗|🏎|🚙|🚐|🚚|🛻|📹|🏍|🛵|🚑/.test(t)) return "car";
    return "human";
  },
  /* Spielfeld: x links/rechts (−4,5…4,5), z von unten (−8, eigene Seite) nach oben (+8). Fluss bei |z|<0,6, Brücken bei x=±2,7 */
  fighters(p,side){
    const tr=this.traits(p.board), sg=side==="a"?-1:1;
    return p.board.map((u,slot)=>{ if(!u) return null; const s=this.stats(u,tr), c=this.card(u), body=this.body(c);
      const col=slot%3, row=slot<3?0:1;
      return Object.assign(s,{u,side,slot,body,maxhp:s.hp,cd:200+Math.random()*500,weak:0,weakT:0,pois:0,poisT:0,usedFirst:false,hit:0,
        x:-(col-1)*2.6+(Math.random()-.5)*.3, z:sg*(2.7+row*2), rad:body==="car"?.6:.42,
        range:s.ranged?5:(body==="car"?1.25:1.0), speed:body==="dog"?2.4:body==="car"?2.0:body==="heli"?2.1:1.55, fly:body==="heli", tgt:null, moving:false}); }).filter(Boolean);
  },
  target(f,enemies){
    if(f.tgt && f.tgt.hp>0) return f.tgt;
    const alive=enemies.filter(e=>e.hp>0); if(!alive.length) return null;
    const d=e=>Math.hypot(e.x-f.x,e.z-f.z)+(!f.fly&&!e.fly&&Math.sign(e.z)!==Math.sign(f.z)?Math.min(Math.abs(f.x-2.7),Math.abs(f.x+2.7)):0);
    f.tgt=alive.sort((a,b)=>d(a)-d(b))[0]; return f.tgt;
  },
  /* nächster Wegpunkt: über eine Brücke, wenn das Ziel auf der anderen Flussseite liegt */
  waypoint(f,g){
    if(f.fly) return g;
    const sf=Math.sign(f.z)||1, sg=Math.sign(g.z)||1, onRiver=Math.abs(f.z)<.6;
    if(!onRiver && sf===sg) return g;
    const bx = Math.abs(f.x-2.7)+Math.abs(g.x-2.7) < Math.abs(f.x+2.7)+Math.abs(g.x+2.7) ? 2.7 : -2.7;
    if(onRiver) return {x:bx, z:sg*1.0};
    if(Math.abs(f.x-bx)>.3) return {x:bx, z:sf*.95};
    return {x:bx, z:-sf*1.0};
  },
  /* ein Simulationsschritt (dt ms); liefert Ereignisse für die Anzeige */
  step(B,dt){
    const ev=[]; B.t+=dt; const frenzyAt=KB.BATTLE_MS-(this.g&&this.g.mod.id==="rase"?20000:KB.FRENZY_MS);
    const sp=B.t>=frenzyAt?2:1; B.frenzy=sp>1;
    const all=[...B.a,...B.b];
    all.forEach(f=>{ if(f.hp<=0) return;
      if(f.poisT>0){ f.poisT-=dt; f.hp-=f.pois*dt/1000; if(f.hp<=0){ f.hp=0; ev.push({k:"die",f}); return; } }
      if(f.weakT>0) f.weakT-=dt;
      f.cd=Math.max(0,f.cd-dt*sp);
      const foes=f.side==="a"?B.b:B.a;
      const t=this.target(f,foes); if(!t){ f.moving=false; return; }
      const dist=Math.hypot(t.x-f.x,t.z-f.z);
      if(dist>f.range+t.rad){
        const w=this.waypoint(f,t), dx=w.x-f.x, dz=w.z-f.z, l=Math.hypot(dx,dz)||1, mv=Math.min(l,f.speed*dt/1000*sp);
        f.x+=dx/l*mv; f.z+=dz/l*mv; f.dir=Math.atan2(dx,dz); f.moving=true; return;
      }
      f.moving=false; f.dir=Math.atan2(t.x-f.x,t.z-f.z);
      if(f.cd>0) return; f.cd=f.as;
      if(t.dodge && Math.random()<t.dodge){ ev.push({k:"miss",f:t,by:f}); return; }
      let d=f.dmg*(f.weakT>0?1-f.weak:1);
      if(f.first && !f.usedFirst){ d*=f.first; f.usedFirst=true; }
      d*=1-t.armor; d=Math.round(d);
      if(t.shield>0){ const a=Math.min(t.shield,d); t.shield-=a; d-=a; }
      t.hp-=d; f.hit=B.t; ev.push({k:"hit",f,t,d});
      if(f.steal) f.hp=Math.min(f.maxhp,f.hp+d*f.steal);
      if(f.weaken){ t.weak=f.weaken; t.weakT=3000; }
      if(f.poison){ t.pois=f.poison; t.poisT=3000; }
      if(t.hp<=0){ t.hp=0; ev.push({k:"die",f:t}); }
    });
    // nicht übereinander stehen; Fluss nur über Brücken
    const live=all.filter(f=>f.hp>0);
    for(let i=0;i<live.length;i++) for(let j=i+1;j<live.length;j++){
      const a=live[i], b=live[j]; if(a.fly!==b.fly) continue;
      const dx=b.x-a.x, dz=b.z-a.z, l=Math.hypot(dx,dz)||.01, min=a.rad+b.rad;
      if(l<min){ const push=(min-l)/2, ux=dx/l, uz=dz/l; a.x-=ux*push; a.z-=uz*push; b.x+=ux*push; b.z+=uz*push; } }
    live.forEach(f=>{ f.x=Math.max(-4.3,Math.min(4.3,f.x)); f.z=Math.max(-7.4,Math.min(7.4,f.z));
      if(!f.fly && Math.abs(f.z)<.6){ const bx=f.x>0?2.7:-2.7; if(Math.abs(f.x-bx)>.62) f.z=(Math.sign(f.z)||(f.side==="a"?-1:1))*.6; } });
    const aAlive=B.a.some(f=>f.hp>0), bAlive=B.b.some(f=>f.hp>0);
    if(!aAlive||!bAlive||B.t>=KB.BATTLE_MS) B.done=true;
    return ev;
  },
  newBattle(pa,pb){ return {pa,pb,a:this.fighters(pa,"a"),b:this.fighters(pb,"b"),t:0,done:false,frenzy:false}; },
  /* Ergebnis anwenden: Verlierer verliert LP = überlebende Gegner (Sterne zählen) + 1 für den Einsatzleiter */
  settle(B){
    const sa=B.a.filter(f=>f.hp>0), sb=B.b.filter(f=>f.hp>0), res={};
    const dmg=list=>list.reduce((s,f)=>s+f.u.star,0)+1;
    const hurt=(p,n,ghost)=>{ if(ghost) return; p.hp=Math.max(0,p.hp-n); p.streak=0; if(p.ruler==="praes") p.el=Math.min(KB.MAXEL,p.el+4); };
    if(sa.length&&!sb.length){ res.win="a"; res.dmg=dmg(sa); hurt(B.pb,res.dmg,B.ghostB); }
    else if(sb.length&&!sa.length){ res.win="b"; res.dmg=dmg(sb); hurt(B.pa,res.dmg,B.ghostA); }
    else { res.win=null; res.dmgA=dmg(sb); res.dmgB=dmg(sa); hurt(B.pa,res.dmgA,B.ghostA); hurt(B.pb,res.dmgB,B.ghostB); }
    return res;
  },
  fight(){
    const g=this.g; if(g.phase!=="deploy") return;
    const me=this.me(); if(!me.board.some(Boolean)) return toast("Stelle mindestens eine Einheit auf das Feld");
    g.phase="battle"; this.sel=null;
    // Paarungen: zufällig unter den Lebenden; bei ungerader Zahl kämpft einer gegen eine Kopie (zählt für die Kopie nicht)
    const alive=shuffle(this.alive()); const pairs=[];
    while(alive.length>=2) pairs.push([alive.pop(),alive.pop()]);
    if(alive.length){ const p=alive.pop(); const others=this.alive().filter(x=>x!==p); pairs.push([p,others[Math.floor(Math.random()*others.length)],true]); }
    const battles=pairs.map(([a,b,ghost])=>{ const B=this.newBattle(a,b); B.ghostB=!!ghost; return B; });
    // eigenes Match: ich immer auf Seite a (als Kopie-Gegner eines anderen zähle ich nicht)
    let mine=battles.find(B=>B.pa===me) || battles.find(B=>B.pb===me&&!B.ghostB);
    if(mine.pb===me){ const i=battles.indexOf(mine); const B=this.newBattle(me,mine.pa); battles[i]=B; mine=B; }
    // andere Kämpfe sofort ausrechnen
    const results=[];
    battles.filter(B=>B!==mine).forEach(B=>{ while(!B.done) this.step(B,100); results.push([B,this.settle(B)]); });
    this.anim={B:mine,results}; this.draw(); this.run();
  },
  run(){
    const A=this.anim; if(!A) return;
    clearInterval(this._t);
    this._t=setInterval(()=>{
      if(!this.anim||this.anim!==A){ clearInterval(this._t); return; }
      let ev=[]; for(let k=0;k<this.speed;k++){ if(A.B.done) break; ev=ev.concat(this.step(A.B,100)); }
      this.drawBattle(ev);
      if(A.B.done){ clearInterval(this._t); setTimeout(()=>this.afterBattle(),700); }
    },60);
  },
  skip(){ const A=this.anim; if(!A) return; while(!A.B.done) this.step(A.B,100); clearInterval(this._t); this.drawBattle([]); setTimeout(()=>this.afterBattle(),200); },
  hud3d(){ const A=this.anim; if(!A||!$("kb3hud")) return; const B=A.B;
    $("kb3hud").innerHTML=`<span style="white-space:nowrap">⚔️ gegen <b>${esc(B.pb.name.replace(/^KI /,""))}</b></span> ${B.frenzy?`<span class="frenzy">🚨 RASEREI</span>`:""}<span class="tm">${Math.max(0,Math.ceil((KB.BATTLE_MS-B.t)/1000))} s</span>`;
    $("kb3spd").textContent=this.speed===1?"⏩ Schneller":"▶ Normal"; },
  set3d(on){ Store.set("kb3d",on); if(on) Arena.ok=null; this._3d=null; Arena.unmount(); if(this.anim) this.drawBattle([]); },
  afterBattle(){
    const A=this.anim; if(!A||A.over) return; A.over=true;
    setTimeout(()=>{ if(!this.anim){ Arena.unmount(); this._3d=null; } },50);
    const g=this.g, me=this.me(), r=this.settle(A.B), opp=A.B.pb;
    let msg;
    if(r.win==="a") msg=`Sieg gegen ${opp.name}! ${opp.name} verliert ${r.dmg} LP.`;
    else if(r.win==="b") msg=`Niederlage gegen ${opp.name}. Du verlierst ${r.dmg} LP.`;
    else msg=`Unentschieden – beide verlieren Lebenspunkte.`;
    const others=A.results.map(([B,x])=>x.win==="a"?`${B.pa.name} besiegt ${B.pb.name}`:x.win==="b"?`${B.pb.name} besiegt ${B.pa.name}`:`${B.pa.name} und ${B.pb.name}: unentschieden`);
    // Ausgeschiedene
    const out=g.players.filter(p=>!p.lost&&p.hp<=0).sort((a,b)=>a.hp-b.hp);
    out.forEach(p=>{ p.lost=true; p.place=this.alive().length+1; p.board.forEach(u=>u&&this.give(u)); p.bench.forEach(u=>u&&this.give(u)); p.board.fill(null); p.bench.fill(null); });
    this.anim=null;
    const left=this.alive();
    if(me.lost || left.length<=1){
      if(left.length===1) left[0].place=1;
      return this.finish(msg);
    }
    banner(r.win==="a"?"SIEG!":r.win==="b"?"NIEDERLAGE":"UNENTSCHIEDEN");
    g.phase="result"; g.summary=[msg,...others,...out.filter(p=>p!==me).map(p=>`❌ ${p.name} ist ausgeschieden`)];
    this.dialog(g.summary,"Nächste Runde ▶",()=>this.weiter());
    this.draw();
  },
  weiter(){ if(this.g && this.g.phase==="result"){ UI.closeModal(); this.nextRound(); } },
  finish(msg){
    const g=this.g, me=this.me();
    // verbleibende Plätze nach LP vergeben, falls ich vorzeitig raus bin
    const rest=this.alive().sort((a,b)=>b.hp-a.hp); rest.forEach((p,i)=>p.place=p.place||i+1);
    const place=me.place, pr=KB_PRIZE[place];
    const fac={}; [...me.board,...me.bench].filter(Boolean).forEach(u=>{ const f=this.card(u).faction; fac[f]=(fac[f]||0)+u.star; });
    const side=Object.keys(fac).sort((a,b)=>fac[b]-fac[a])[0]||"polizei";
    Prog.reward(side, pr.coins, pr.xp);
    const st=Player.kombi=Player.kombi||{n:0,w:0,best:0}; st.n++; if(place<=2) st.w++; st.best=st.best?Math.min(st.best,place):place; Player.save();
    banner(place===1?"EINSATZSIEG!":`PLATZ ${place}!`);
    const ranking=[...g.players].sort((a,b)=>a.place-b.place).map(p=>`${p.place}. ${p.name}${p.ai?"":" (du)"}`);
    this.g=null;
    this.dialog([msg,`Platz ${place}${place<=2?" – zählt als Sieg!":""} · +${pr.coins} 🪙 · +${pr.xp} XP`,...ranking],"Fertig");
    this.lobby();
  },
  async leave(){
    if(this.g && !await UI.ask("Kombi-Einsatz abbrechen? Das Spiel zählt dann als 4. Platz ohne Belohnung.")) return;
    clearInterval(this._t); this.anim=null; this.g=null; Arena.unmount(); this._3d=null; UI.show("home");
  },

  /* Hinweisfenster: Textzeilen + ein Knopf; jede Art des Schließens führt weiter */
  dialog(lines,label,fn){
    let done=false; const go=()=>{ if(done) return; done=true; fn&&fn(); };
    UI.modal(null,[],null,go,label);
    $("modalCard").innerHTML=`<div class="panel kb-dlg">${lines.map(l=>`<p>${esc(l)}</p>`).join("")}</div>`;
  },
  /* ---------------- Anzeige ---------------- */
  slot(u,attrs,extra=""){
    if(!u) return `<div class="kb-slot empty" ${attrs}></div>`;
    const c=this.card(u), a=c.art||{};
    return `<div class="kb-slot u ${c.faction} ${extra} ${this._fx===u.u?"merge":""}" ${attrs} style="--c1:${a.c1||"#eee"};--c2:${a.c2||"#888"}">
      <span class="em">${a.emoji||"❓"}</span><span class="st s${u.star}">${"★".repeat(u.star)}</span>
      <span class="ro">${(ROLES[c.faction][c.attr]||["",""])[1]}</span><span class="nm">${esc(c.name.split(" ").slice(-1)[0])}</span></div>`;
  },
  draw(){
    const g=this.g; if(!g) return this.lobby(); if(UI.current!=="kombi") return;
    const me=this.me();
    $("kbTitle").textContent=`Runde ${g.round}`;
    $("kbBar").innerHTML=g.players.map(p=>`<div class="kb-pl ${p.lost?"out":""} ${p===me?"me":""}"><b>${esc(p.name.replace(/^KI /,""))}</b><span>${p.lost?`Platz ${p.place}`:p.hp+" ❤️"}</span></div>`).join("");
    if(g.phase==="battle"&&this.anim) return this.drawBattle([]);
    if(g.phase==="battle"&&!this.anim) g.phase="deploy";                 // Sicherheitsnetz
    if(g.phase==="result"){
      $("kbMain").innerHTML=`<div class="panel kb-dlg">${(g.summary||[]).map(l=>`<p>${esc(l)}</p>`).join("")}</div>
        <button class="red" style="width:100%;margin-top:12px" onclick="Kombi.weiter()">Nächste Runde ▶</button>`;
      return; }
    const tr=this.traits(me.board), team=this.team(me), n=me.board.filter(Boolean).length;
    const sel=(w,i)=>this.sel&&this.sel.w===w&&this.sel.i===i?"sel":"";
    $("kbMain").innerHTML=`
      <div class="kb-mod">🎲 ${esc(g.mod.name)}: ${esc(g.mod.d)}</div>
      <div class="kb-rowlbl"><span>▲ vordere Reihe (wird zuerst angegriffen)</span><span class="${n>team?"bad":""}">Team ${n}/${team}</span></div>
      <div class="kb-board mine">${[0,1,2,3,4,5].map(i=>this.slot(me.board[i],`data-w="b" data-i="${i}"`,sel("b",i))).join("")}</div>
      <div class="kb-rowlbl"><span>▼ hintere Reihe (gut für 🎯 Fernkampf)</span></div>
      <div class="kb-traits">${Object.entries(tr._cnt).sort((a,b)=>b[1]-a[1]).map(([r,c])=>{ const f=Object.keys(ROLES).find(k=>ROLES[k][r]); const lv=tr[r]||0;
        return `<span class="kb-tr l${lv}" data-tr="${r}">${ROLES[f][r][1]} ${ROLES[f][r][0]} <b>${c}</b>/${c>=2?4:2}</span>`; }).join("")||`<span class="muted">Merkmale: 2 bzw. 4 Einheiten gleicher Art geben Boni</span>`}</div>
      <div class="kb-sub">Bank</div>
      <div class="kb-bench">${me.bench.slice(0,this.benchSize(me)).map((u,i)=>this.slot(u,`data-w="n" data-i="${i}"`,sel("n",i))).join("")}</div>
      <div class="kb-shopbar"><span class="kb-el">⚡ ${me.el}</span>
        <button class="small ghost" onclick="Kombi.reroll()">🔄 Neu ${me.free>0?"(gratis)":"(1 ⚡)"}</button>
        <button class="small red" onclick="Kombi.fight()">⚔️ Kampf!</button></div>
      <div class="kb-shop">${me.shop.map((id,i)=>{ if(!id) return `<div class="kb-offer empty"></div>`; const c=DB.byId(id), a=c.art||{}, cost=this.cost(c);
        const have=[...me.board,...me.bench].some(u=>u&&u.id===id);
        return `<div class="kb-offer ${me.el<cost?"poor":""} ${have?"have":""}" data-buy="${i}" style="--c1:${a.c1||"#eee"};--c2:${a.c2||"#888"}">
          <span class="em">${a.emoji||"❓"}</span><span class="nm">${esc(c.name)}</span>
          <span class="ro">${ROLES[c.faction][c.attr][1]} ${ROLES[c.faction][c.attr][0]}${KB.RANGED[c.attr]?" · 🎯":""}</span>
          <span class="cost">⚡${cost}</span>${have?`<span class="pair">Kombi!</span>`:""}</div>`; }).join("")}</div>
      <p class="muted kb-help">Tippe eine Einheit an und dann ein Feld, um sie zu verschieben. Zweimal tippen zeigt Werte und „Verkaufen“.</p>`;
    $("kbMain").querySelectorAll("[data-w]").forEach(el=>el.onclick=()=>this.tap(el.dataset.w,+el.dataset.i));
    $("kbMain").querySelectorAll("[data-buy]").forEach(el=>el.onclick=()=>this.buy(+el.dataset.buy));
    $("kbMain").querySelectorAll("[data-tr]").forEach(el=>el.onclick=()=>{ const r=el.dataset.tr, f=Object.keys(ROLES).find(k=>ROLES[k][r]); toast(`${ROLES[f][r][0]}: ${KB_TRAITS[r].d}`); });
  },
  drawBattle(ev){
    const A=this.anim; if(!A||UI.current!=="kombi") return; const B=A.B;
    if(Arena.enabled()){
      try{
        if(this._3d!==B){ this._3d=B;
          $("kbMain").innerHTML=`<div class="kb-vs" id="kb3hud"></div><div class="kb3d" id="kb3d"></div>
            <div class="row" style="justify-content:center;margin-top:8px">
              <button class="small ghost" id="kb3spd" onclick="Kombi.speed=Kombi.speed===1?3:1;Kombi.hud3d()"></button>
              <button class="small ghost" onclick="Kombi.skip()">⏭ Ergebnis</button>
              <button class="small ghost" onclick="Kombi.set3d(false)">2D</button></div>`;
          Arena.mount($("kb3d"),B); }
        this.hud3d(); Arena.onEvents(ev); return;
      }catch(e){ console.error("3D:",e); Arena.ok=false; this._3d=null; }
    }
    const hits={}; ev.forEach(e=>{ if(e.k==="hit") hits[e.t.u.u]=(hits[e.t.u.u]||0)+e.d; if(e.k==="miss") hits[e.f.u.u]="MISS"; });
    const cell=(list,slot)=>{ const f=list.find(x=>x.slot===slot); if(!f) return `<div class="kb-slot empty"></div>`;
      const pct=Math.max(0,f.hp/f.maxhp*100), dead=f.hp<=0, h=hits[f.u.u];
      return this.slot(f.u,"",`${dead?"dead":""} ${h?"hurt":""} ${B.t-f.hit<150?"atk":""}`).replace("</div>",
        `<i class="hp"><i style="width:${pct}%"></i></i>${f.shield>0?`<i class="sh">🛡</i>`:""}${h?`<span class="dmg">${h==="MISS"?"weg!":"-"+h}</span>`:""}</div>`); };
    $("kbMain").innerHTML=`
      <div class="kb-vs">⚔️ gegen <b>${esc(B.pb.name)}</b> ${B.frenzy?`<span class="frenzy">🚨 RASEREI</span>`:""}<span class="tm">${Math.max(0,Math.ceil((KB.BATTLE_MS-B.t)/1000))} s</span></div>
      <div class="kb-board foe">${[3,4,5,0,1,2].map(i=>cell(B.b,i)).join("")}</div>
      <div class="kb-mid"></div>
      <div class="kb-board mine">${[0,1,2,3,4,5].map(i=>cell(B.a,i)).join("")}</div>
      <div class="row" style="justify-content:center;margin-top:10px">
        <button class="small ghost" onclick="Kombi.speed=Kombi.speed===1?3:1;Kombi.drawBattle([])">${this.speed===1?"⏩ Schneller":"▶ Normal"}</button>
        <button class="small ghost" onclick="Kombi.skip()">⏭ Ergebnis</button>${Arena.supported()?`<button class="small ghost" onclick="Kombi.set3d(true)">3D</button>`:""}</div>`;
  },
};
