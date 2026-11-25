/* ============================ FREUNDE & ORGANISATION (Clan) ============================
   Alles läuft über die Firebase Realtime Database (Cloud.req), Pfade:
     profiles/{uid}            Nickname, Freundescode, Organisation, zuletzt online
     fcodes/{CODE}             Freundescode → uid
     freq/{an}/{von}           offene Freundschaftsanfragen
     friends/{uid}/{fid}       Freundesliste (beidseitig)
     invites/{an}/{von}        Duell-Einladungen ohne Code (enthalten den Raumcode)
     clans/{cid}               Organisation mit Mitgliedern, Auftrags-Fortschritt, Beiträgen
     clanlist/{cid}            Kurzinfo für die Suche;  clannames/{name} → cid (Name eindeutig)
   ============================================================================================ */
const CLAN_MAX=25, CLAN_COST=1500, ONLINE_MS=4*60e3, INVITE_MS=5*60e3;
const CLAN_EMBLEMS=["🚔","🚓","👮","🕵️","🐕‍🦺","🚁","🛡️","⚖️","🦹","💰","🎭","🗝️","🃏","🐀","🦊","💎"];
/* Schwere Organisations-Aufträge: jede Woche 3, gemeinsam von allen Mitgliedern zu erfüllen */
const CLAN_QUESTS=[
  {id:"c_win",    n:80,  xp:400, coins:400, p:"Klärt gemeinsam 80 Fälle auf (Duelle gewinnen)",              v:"Zieht gemeinsam 80 Dinger durch (Duelle gewinnen)"},
  {id:"c_online", n:30,  xp:500, coins:500, p:"Gewinnt 30 Online-Duelle gegen echte Gegner",                  v:"Legt 30 echte Gegner online rein"},
  {id:"c_hard",   n:20,  xp:500, coins:500, p:"Schließt 20 Story-Kapitel der Stufe ★★★ ab",                 v:"Meistert 20 Story-Kapitel der Stufe ★★★"},
  {id:"c_lp",     n:15,  xp:500, coins:500, p:"Gewinnt 15 Duelle mit mindestens 3000 LP übrig",             v:"Gewinnt 15 Duelle ohne Kratzer (mind. 3000 LP übrig)"},
  {id:"c_kills",  n:400, xp:450, coins:450, p:"Nehmt 400 gegnerische Charaktere fest",                      v:"Schaltet 400 gegnerische Charaktere aus"},
  {id:"c_fast",   n:20,  xp:500, coins:500, p:"Gewinnt 20 Duelle in höchstens 7 Runden (Blitzeinsatz)",     v:"Gewinnt 20 Duelle in höchstens 7 Runden (Blitz-Coup)"},
  {id:"c_cel",    n:30,  xp:450, coins:450, p:"Bringt 30× Celestial-Karten zum Einsatz",                    v:"Spielt 30× Celestial-Karten aus"},
  {id:"c_pol",    n:40,  xp:400, coins:400, p:"Gewinnt 40 Duelle auf Seiten der Polizei",                   v:"Gewinnt 40 Duelle als Polizei (Tarnung!)"},
  {id:"c_ver",    n:40,  xp:400, coins:400, p:"Gewinnt 40 Duelle verdeckt als Verbrecher",                  v:"Gewinnt 40 Duelle auf Seiten der Unterwelt"},
  {id:"c_tour",   n:25,  xp:550, coins:550, p:"Gewinnt 25 Turnier-Duelle",                                  v:"Gewinnt 25 Turnier-Duelle"},
];
function clanLevel(xp){ let lvl=1, need=1000, rest=xp||0; while(rest>=need && lvl<20){ rest-=need; lvl++; need=Math.round(need*1.25/50)*50; } return {lvl, rest, need}; }

const Social = {
  tab:"friends", me:null, prof:null, friends:[], reqs:[], invites:[], clan:null, clanId:null, list:null, _es:[], _seenT:null, _gen:0,
  ok(){ return Cloud.enabled(); },
  nick(){ return Store.get("nick","")||""; },
  /* ---------- Start: Profil pflegen, Einladungen/Anfragen live empfangen ---------- */
  async start(){
    if(!this.ok()) return;
    try{
      this.me=await Cloud.uid(); if(!this.me) return;
      await this.ensureCode();
      await this.touch(true);
      this.listen();
      clearInterval(this._seenT); this._seenT=setInterval(()=>{ if(!document.hidden) this.touch(); },120e3);
      document.addEventListener("visibilitychange",()=>{ if(!document.hidden) this.touch(); });
    }catch(e){ console.warn("Social:",e.message); }
  },
  async ensureCode(){
    const st=Store.get("fcode",null); if(st&&st.uid===this.me){ this.code=st.code; return; }
    const prof=await Cloud.req("profiles/"+this.me)||{};
    if(prof.code){ this.code=prof.code; Store.set("fcode",{uid:this.me,code:this.code}); return; }
    const A="ABCDEFGHJKMNPQRSTUVWXYZ23456789";
    for(let i=0;i<8;i++){ const c=Array.from({length:6},()=>A[Math.floor(Math.random()*A.length)]).join("");
      if(await Cloud.req("fcodes/"+c)) continue;
      await Cloud.req("fcodes/"+c,"PUT",this.me); this.code=c; Store.set("fcode",{uid:this.me,code:c}); return; }
    throw new Error("Kein freier Freundescode");
  },
  /* Profil aktualisieren (zuletzt online, Nickname, Organisation) */
  async touch(full){
    if(!this.me) return;
    const nick=this.nick()||"Spieler";
    const up={seen:{".sv":"timestamp"}, nick, nickLower:nick.toLowerCase(), code:this.code||"", side:Store.get("lastSide","polizei"), reg:Account.loggedIn()};
    await Cloud.req("profiles/"+this.me,"PATCH",up).catch(()=>{});
    if(full){ this.prof=await Cloud.req("profiles/"+this.me).catch(()=>null)||{}; this.clanId=this.prof.clan||null; }
  },
  online(p){ return p && p.seen && Date.now()-p.seen<ONLINE_MS; },
  /* Live-Kanäle: Duell-Einladungen + Freundschaftsanfragen */
  async listen(){
    this._es.forEach(e=>{ try{ e.close(); }catch(_){} }); this._es=[]; const gen=++this._gen;
    const t=await Cloud.token(), base=Cloud.url();
    const open=(path,fn)=>{ const es=new EventSource(`${base}/${path}.json?auth=${encodeURIComponent(t)}`);
      const on=()=>fn(); es.addEventListener("put",on); es.addEventListener("patch",on);
      es.addEventListener("auth_revoked",()=>{ if(gen===this._gen) setTimeout(()=>this.listen(),1000); });
      es.onerror=()=>{ if(gen!==this._gen) return; try{ es.close(); }catch(_){} if(es._retry) return; es._retry=1; setTimeout(()=>{ if(gen===this._gen) this.listen(); },15000); };
      this._es.push(es); };
    open("invites/"+this.me, ()=>this.loadInvites(true));
    open("freq/"+this.me, ()=>this.loadReqs(true));
    open("clanInv/"+this.me, ()=>this.loadClanInv(true));
  },
  /* ---------- Freunde ---------- */
  async loadReqs(live){
    const d=await Cloud.req("freq/"+this.me).catch(()=>null)||{};
    const before=this.reqs.length; this.reqs=Object.entries(d).map(([uid,v])=>({uid,...v}));
    if(live && this.reqs.length>before) toast(`👥 Freundschaftsanfrage von ${this.reqs[this.reqs.length-1].nick||"jemandem"}`);
    this.badge(); if(UI.current==="social") this.render();
  },
  async loadFriends(){
    const d=await Cloud.req("friends/"+this.me).catch(()=>null)||{};
    const ids=Object.keys(d);
    const profs=await Promise.all(ids.map(id=>Cloud.req("profiles/"+id).catch(()=>null)));
    this.friends=ids.map((id,i)=>({uid:id, nick:(profs[i]&&profs[i].nick)||d[id].nick||"?", seen:profs[i]&&profs[i].seen, clanTag:profs[i]&&profs[i].clanTag||""}))
      .sort((a,b)=>(this.online(b)-this.online(a))||a.nick.localeCompare(b.nick));
  },
  async addFriend(){
    const code=($("soCode").value||"").trim().toUpperCase().replace(/[^A-Z0-9]/g,"");
    if(code.length!==6) return toast("Der Freundescode hat 6 Zeichen");
    if(code===this.code) return toast("Das ist dein eigener Code 😉");
    try{
      const fid=await Cloud.req("fcodes/"+code); if(!fid) return toast("Kein Spieler mit diesem Code gefunden");
      if(this.friends.some(f=>f.uid===fid)) return toast("Ihr seid schon befreundet");
      $("soCode").value=""; await this.request(fid);
    }catch(e){ toast(this.err(e)); }
  },
  /* Freundschaftsanfrage direkt an eine Nutzer-ID (aus Code oder Spielerliste) */
  async request(fid){
    if(fid===this.me) return toast("Das bist du selbst 😉");
    if(this.friends.some(f=>f.uid===fid)) return toast("Ihr seid schon befreundet");
    if(this.reqs.find(r=>r.uid===fid)) return this.accept(fid);
    try{
      await Cloud.req(`freq/${fid}/${this.me}`,"PUT",{nick:this.nick()||"Spieler", t:{".sv":"timestamp"}});
      const sent=Store.get("sentReq",{}); sent[fid]=Date.now(); Store.set("sentReq",sent);
      toast("Anfrage gesendet ✉️"); if(UI.current==="social") this.render();
    }catch(e){ toast(this.err(e)); }
  },
  /* ---------- Spieler finden: registrierte Spieler, zuletzt aktive zuerst ---------- */
  players:null, pq:"",
  async loadPlayers(){
    let d=null;
    try{ d=await Cloud.req("profiles","GET",undefined,'&orderBy="seen"&limitToLast=200'); }
    catch(e){ d=await Cloud.req("profiles").catch(()=>null); }      // ohne Index: alles laden
    this.players=this.clean(Object.entries(d||{}).map(([uid,p])=>({uid,...p})));
  },
  /* Nur registrierte Spieler (keine Gäste), ohne Standardnamen, pro Name nur der zuletzt aktive Eintrag */
  clean(list){
    const best=new Map();
    list.filter(p=>p.uid!==this.me && p.reg===true && p.nick && p.nick!=="Spieler").forEach(p=>{
      const k=String(p.nick).trim().toLowerCase(), o=best.get(k);
      if(!o || (p.seen||0)>(o.seen||0)) best.set(k,p); });
    const myNick=(this.nick()||"").trim().toLowerCase(); best.delete(myNick);
    return [...best.values()].sort((a,b)=>(this.online(b)-this.online(a))||(b.seen||0)-(a.seen||0));
  },
  async searchPlayers(){
    const q=($("soFind")?$("soFind").value:"").trim().toLowerCase(); this.pq=q;
    if(q.length>=2){ try{ const d=await Cloud.req("profiles","GET",undefined,`&orderBy="nickLower"&startAt=${encodeURIComponent(JSON.stringify(q))}&endAt=${encodeURIComponent(JSON.stringify(q+"\uf8ff"))}&limitToFirst=50`);
        this.players=this.clean([...(this.players||[]),...Object.entries(d||{}).map(([uid,p])=>({uid,...p}))]); }catch(e){} }
    this.render();
  },
  playerList(){
    const q=this.pq, sent=Store.get("sentReq",{}), fr=new Set(this.friends.map(f=>f.uid)), inc=new Set(this.reqs.map(r=>r.uid));
    const L=(this.players||[]).filter(p=>!q||String(p.nick).toLowerCase().includes(q)).slice(0,60);
    if(!this.players) return `<p class="muted">Lade Spieler …</p>`;
    if(!L.length) return `<p class="muted">${q?"Kein Spieler mit diesem Namen gefunden.":"Noch keine registrierten Spieler sichtbar."}</p>`;
    return `<small class="muted">${(this.players||[]).length} Spieler insgesamt${q?` · ${L.length} Treffer`:""}</small>`+L.map(p=>`<div class="sorow">${this.dot(p)}<b>${esc(p.nick)}</b>${p.clanTag?` <small class="muted">[${esc(p.clanTag)}]</small>`:""}<span class="sp"></span>
      ${fr.has(p.uid)?`<small class="muted">✓ Freund</small>`:inc.has(p.uid)?`<button class="small green" data-act="accept|${p.uid}">Annehmen</button>`
        :sent[p.uid]?`<small class="muted">✉️ gesendet</small>`:`<button class="small blue" data-act="request|${p.uid}">＋ Anfrage</button>`}</div>`).join("");
  },
  async accept(fid){
    const r=this.reqs.find(x=>x.uid===fid)||{};
    try{
      await Cloud.req(`friends/${this.me}/${fid}`,"PUT",{nick:r.nick||"Freund", t:{".sv":"timestamp"}});
      await Cloud.req(`friends/${fid}/${this.me}`,"PUT",{nick:this.nick()||"Spieler", t:{".sv":"timestamp"}});
      await Cloud.req(`freq/${this.me}/${fid}`,"DELETE");
      toast(`${r.nick||"Freund"} ist jetzt dein Freund 🤝`); await this.loadReqs(); await this.loadFriends(); this.render();
    }catch(e){ toast(this.err(e)); }
  },
  async decline(fid){ await Cloud.req(`freq/${this.me}/${fid}`,"DELETE").catch(()=>{}); this.loadReqs(); },
  async unfriend(fid){
    const f=this.friends.find(x=>x.uid===fid); if(!await UI.ask(`${(f&&f.nick)||"Freund"} aus der Freundesliste entfernen?`)) return;
    await Cloud.req(`friends/${this.me}/${fid}`,"DELETE").catch(()=>{}); await Cloud.req(`friends/${fid}/${this.me}`,"DELETE").catch(()=>{});
    this.friends=this.friends.filter(x=>x.uid!==fid); this.render();
  },
  shareCode(){
    const t=`👥 Füge mich bei Einsatz-Duell als Freund hinzu! Mein Freundescode: ${this.code}`;
    if(window.AndroidBridge&&AndroidBridge.share) return AndroidBridge.share(t);
    if(navigator.share) return navigator.share({title:"Einsatz-Duell",text:t}).catch(()=>{});
    if(navigator.clipboard) navigator.clipboard.writeText(this.code).then(()=>toast("Code kopiert")).catch(()=>{});
  },
  /* ---------- Direkt-Einladungen (ohne Code eintippen) ---------- */
  async challenge(uid, nick){
    if(UI.current==="duel" && Duel.online && !Duel.over) return toast("Du bist gerade in einem Duell");
    let name=this.nick(); if(!name){ name=await UI.prompt("Dein Spielername:",""); if(!name||!name.trim()) return; name=name.trim().slice(0,16); Store.set("nick",name); }
    const side=await new Promise(res=>UI.dialog(`⚔️ ${esc(nick)} herausfordern<br><small style="font-weight:400">Welche Seite spielst du? ${esc(nick)} bekommt die andere.</small>`,
      [["👮 Polizei",()=>res("polizei"),"blue"],["🦹 Verbrecher",()=>res("verbrecher"),"red"],["Abbrechen",()=>res(null),"ghost"]],()=>res(null)));
    if(!side) return;
    UI.show("online"); Lobby.side=side; Lobby.render(); Duel._ended=false;
    await Net.host(side,name);
    if(Net.role!=="host"||!Net.code) return;
    try{
      await Cloud.req(`invites/${uid}/${this.me}`,"PUT",{nick:name, room:Net.code, side, t:{".sv":"timestamp"}});
      Lobby.status(`✉️ Einladung an ${nick} gesendet – warte auf Annahme … (Code zur Sicherheit: ${Net.code})`);
      this._pending={uid, room:Net.code};
    }catch(e){ toast(this.err(e)); }
  },
  async loadInvites(live){
    const d=await Cloud.req("invites/"+this.me).catch(()=>null)||{}, now=Date.now();
    const all=Object.entries(d).map(([uid,v])=>({uid,...v}));
    // Absagen auf eigene Einladungen
    all.filter(i=>i.declined).forEach(i=>{ toast(`${i.nick||"Dein Freund"} kann gerade nicht 🙁`); Cloud.req(`invites/${this.me}/${i.uid}`,"DELETE").catch(()=>{});
      if(this._pending&&this._pending.uid===i.uid&&Net.role==="host"&&!Duel.online) Lobby.status(`${i.nick||"Dein Freund"} hat abgelehnt. Du kannst den Code auch anders teilen: ${Net.code}`); });
    this.invites=all.filter(i=>!i.declined && i.room && (!i.t||now-i.t<INVITE_MS));
    all.filter(i=>!i.declined && i.t && now-i.t>=INVITE_MS).forEach(i=>Cloud.req(`invites/${this.me}/${i.uid}`,"DELETE").catch(()=>{}));
    this.badge(); if(UI.current==="social") this.render();
    if(live && this.invites.length) this.popInvite();
  },
  popInvite(){
    const inv=this.invites[0]; if(!inv) return;
    if((UI.current==="duel"&&!Duel.over) || $("modal").classList.contains("show")){ toast(`⚔️ ${inv.nick} fordert dich heraus – siehe Freunde`); return; }
    const mySide=OTHER[inv.side]||"verbrecher";
    UI.dialog(`⚔️ ${esc(inv.nick)} fordert dich heraus!<br><small style="font-weight:400">Du spielst ${FACTIONS[mySide][1]} ${FACTIONS[mySide][0]}.</small>`,
      [["✅ Annehmen",()=>this.acceptInvite(inv.uid),"green"],["Ablehnen",()=>this.declineInvite(inv.uid),"ghost"]]);
  },
  async acceptInvite(uid){
    const inv=this.invites.find(i=>i.uid===uid); if(!inv) return toast("Einladung ist abgelaufen");
    await Cloud.req(`invites/${this.me}/${uid}`,"DELETE").catch(()=>{});
    if(UI.current==="duel"&&Duel.online) Net.close();
    if(!this.nick()) Store.set("nick","Spieler");
    UI.show("online"); $("onJoin").value=inv.room; Lobby.join();
  },
  async declineInvite(uid){
    await Cloud.req(`invites/${this.me}/${uid}`,"DELETE").catch(()=>{});
    await Cloud.req(`invites/${uid}/${this.me}`,"PUT",{nick:this.nick()||"Spieler", declined:true, t:{".sv":"timestamp"}}).catch(()=>{});
    this.invites=this.invites.filter(i=>i.uid!==uid); this.badge(); if(UI.current==="social") this.render();
  },
  badge(){ if(UI.current==="home") UI.badges(); },
  err(e){ const m=String(e&&e.message||e); return /401|403/.test(m)?"Keine Berechtigung – Firebase-Regeln für Freunde/Organisation fehlen noch":/NETWORK|Failed to fetch/i.test(m)?"Keine Internetverbindung":"Fehler: "+m; },

  /* ---------- Organisation ---------- */
  async loadClan(){
    this.clan=null; if(!this.clanId) return;
    const c=await Cloud.req("clans/"+this.clanId).catch(()=>null);
    if(!c || !c.members || !c.members[this.me]){             // aufgelöst oder entfernt
      this.clanId=null; await Cloud.req("profiles/"+this.me,"PATCH",{clan:null, clanTag:null}).catch(()=>{});
      if(c) toast("Du bist nicht mehr Mitglied dieser Organisation"); return; }
    this.clan=c; Store.set("clanCache",{id:this.clanId, tag:c.tag, xp:this.clanXP(c)});
  },
  clanXP(c){ return Object.values((c&&c.done)||{}).reduce((s,v)=>s+(+v||0),0); },
  week(){ return Quests.week().replace(/-/g,"_"); },
  /* 3 Aufträge pro Woche – für alle Mitglieder gleich (aus Organisation + Woche berechnet) */
  questsFor(cid, week){
    let h=0; for(const ch of cid+week) h=(h*31+ch.charCodeAt(0))>>>0;
    const pool=[...CLAN_QUESTS], out=[];
    while(out.length<3){ h=(h*1103515245+12345)>>>0; out.push(pool.splice(h%pool.length,1)[0]); }
    return out;
  },
  async loadList(){
    const d=await Cloud.req("clanlist").catch(()=>null)||{};
    this.list=Object.entries(d).map(([id,v])=>({id,...v})).sort((a,b)=>(b.xp||0)-(a.xp||0));
  },
  async create(){
    if(Player.coins<CLAN_COST) return toast(`Die Gründung kostet 🪙 ${CLAN_COST}`);
    const name=($("clName").value||"").trim().replace(/\s+/g," ").slice(0,24), tag=($("clTag").value||"").trim().toUpperCase().replace(/[^A-Z0-9]/g,"").slice(0,4);
    if(name.length<3) return toast("Name: mindestens 3 Zeichen"); if(tag.length<2) return toast("Kürzel: 2–4 Buchstaben/Ziffern");
    const key=name.toLowerCase().replace(/[.#$\[\]\/]/g,"_");
    try{
      if(await Cloud.req("clannames/"+encodeURIComponent(key))) return toast("Diesen Namen gibt es schon");
      if(!await UI.ask(`„${name}“ [${tag}] für 🪙 ${CLAN_COST} gründen?`)) return;
      const cid="c"+Date.now().toString(36)+Math.random().toString(36).slice(2,6), side=this._side||"polizei", emblem=this._emblem||CLAN_EMBLEMS[0];
      await Cloud.req("clans/"+cid,"PUT",{name, tag, emblem, side, owner:this.me, open:true, created:{".sv":"timestamp"},
        members:{[this.me]:{nick:this.nick()||"Spieler", role:"leader", joined:{".sv":"timestamp"}}}});
      await Cloud.req("clannames/"+encodeURIComponent(key),"PUT",cid);
      await Cloud.req("clanlist/"+cid,"PUT",{name, tag, emblem, side, n:1, xp:0, open:true});
      await Cloud.req("profiles/"+this.me,"PATCH",{clan:cid, clanTag:tag});
      Player.coins-=CLAN_COST; Player.save(); this.clanId=cid; banner("ORGANISATION GEGRÜNDET!");
      await this.loadClan(); this.render();
    }catch(e){ toast(this.err(e)); }
  },
  async join(cid, invited){
    try{
      const c=await Cloud.req("clans/"+cid); if(!c) return toast("Organisation gibt es nicht mehr");
      if(!c.open && !invited) return toast("Diese Organisation nimmt gerade niemanden auf");
      if(this.clanId && this.clanId!==cid) return toast("Verlasse zuerst deine jetzige Organisation");
      const n=Object.keys(c.members||{}).length; if(n>=CLAN_MAX) return toast(`Voll (${CLAN_MAX} Mitglieder)`);
      await Cloud.req(`clans/${cid}/members/${this.me}`,"PUT",{nick:this.nick()||"Spieler", role:"member", joined:{".sv":"timestamp"}});
      await Cloud.req("clanlist/"+cid,"PATCH",{n:n+1}).catch(()=>{});
      await Cloud.req("profiles/"+this.me,"PATCH",{clan:cid, clanTag:c.tag});
      this.clanId=cid; toast(`Willkommen bei ${c.name}!`); await this.loadClan(); this.render();
    }catch(e){ toast(this.err(e)); }
  },
  isLeader(){ return this.clan && this.clan.owner===this.me; },
  async leave(){
    const c=this.clan; if(!c) return; const others=Object.entries(c.members||{}).filter(([u])=>u!==this.me);
    const leader=this.isLeader();
    if(!await UI.ask(leader&&!others.length?`Du bist das letzte Mitglied – „${c.name}“ wird aufgelöst. Fortfahren?`:`„${c.name}“ wirklich verlassen?`)) return;
    try{
      const cid=this.clanId;
      if(leader && !others.length){
        await Cloud.req("clannames/"+encodeURIComponent(c.name.toLowerCase().replace(/[.#$\[\]\/]/g,"_")),"DELETE").catch(()=>{});
        await Cloud.req("clanlist/"+cid,"DELETE").catch(()=>{}); await Cloud.req("clans/"+cid,"DELETE");
      } else {
        if(leader){ const next=others.sort((a,b)=>(a[1].joined||0)-(b[1].joined||0))[0][0];
          await Cloud.req(`clans/${cid}/members/${next}/role`,"PUT","leader"); await Cloud.req(`clans/${cid}/owner`,"PUT",next); }
        await Cloud.req("clanlist/"+cid,"PATCH",{n:others.length}).catch(()=>{});
        await Cloud.req(`clans/${cid}/members/${this.me}`,"DELETE");
      }
      await Cloud.req("profiles/"+this.me,"PATCH",{clan:null, clanTag:null}).catch(()=>{});
      this.clanId=null; this.clan=null; Store.set("clanCache",null); toast("Organisation verlassen"); this.render();
    }catch(e){ toast(this.err(e)); }
  },
  async kick(uid){
    const m=this.clan.members[uid]; if(!await UI.ask(`${m.nick} aus der Organisation entfernen?`)) return;
    try{ await Cloud.req(`clans/${this.clanId}/members/${uid}`,"DELETE"); await Cloud.req("clanlist/"+this.clanId,"PATCH",{n:Object.keys(this.clan.members).length-1}).catch(()=>{});
      await this.loadClan(); this.render(); }catch(e){ toast(this.err(e)); }
  },
  async promote(uid){
    const m=this.clan.members[uid]; if(!await UI.ask(`Leitung an ${m.nick} übergeben? Du wirst normales Mitglied.`)) return;
    try{ await Cloud.req(`clans/${this.clanId}/members/${uid}/role`,"PUT","leader"); await Cloud.req(`clans/${this.clanId}/members/${this.me}/role`,"PUT","member");
      await Cloud.req(`clans/${this.clanId}/owner`,"PUT",uid); await this.loadClan(); this.render(); }catch(e){ toast(this.err(e)); }
  },
  async toggleOpen(){ try{ const o=!this.clan.open; await Cloud.req(`clans/${this.clanId}/open`,"PUT",o); await Cloud.req("clanlist/"+this.clanId,"PATCH",{open:o}).catch(()=>{}); this.clan.open=o; this.render(); }catch(e){ toast(this.err(e)); } },

  /* ---------- Einladungen in die Organisation ---------- */
  clanInvs:[],
  async loadClanInv(live){
    const d=await Cloud.req("clanInv/"+this.me).catch(()=>null)||{}, now=Date.now();
    const before=this.clanInvs.length;
    this.clanInvs=Object.entries(d).map(([cid,v])=>({cid,...v})).filter(i=>!i.t||now-i.t<7*864e5);
    if(live && this.clanInvs.length>before){ const i=this.clanInvs[this.clanInvs.length-1];
      if(!this.clanId && !(UI.current==="duel"&&!Duel.over) && !$("modal").classList.contains("show"))
        UI.dialog(`🏢 ${esc(i.from||"Jemand")} lädt dich in die Organisation<br><b>${esc(i.name)} [${esc(i.tag)}]</b> ein!`,
          [["✅ Beitreten",()=>this.acceptClanInv(i.cid),"green"],["Später",null,"ghost"]]);
      else toast(`🏢 Einladung in „${i.name}“ – siehe Freunde & Orga`); }
    this.badge(); if(UI.current==="social") this.render();
  },
  async acceptClanInv(cid){ await Cloud.req(`clanInv/${this.me}/${cid}`,"DELETE").catch(()=>{}); this.clanInvs=this.clanInvs.filter(i=>i.cid!==cid); this.tab="clan"; await this.join(cid,true); },
  async declineClanInv(cid){ await Cloud.req(`clanInv/${this.me}/${cid}`,"DELETE").catch(()=>{}); this.clanInvs=this.clanInvs.filter(i=>i.cid!==cid); this.render(); },
  async inviteToClan(uid, nick){
    if(!this.clan) return; if(this.clan.members[uid]) return toast(`${nick} ist schon Mitglied`);
    if(Object.keys(this.clan.members).length>=CLAN_MAX) return toast("Die Organisation ist voll");
    try{ await Cloud.req(`clanInv/${uid}/${this.clanId}`,"PUT",{name:this.clan.name, tag:this.clan.tag, from:this.nick()||"Spieler", t:{".sv":"timestamp"}});
      const s=Store.get("clanInvSent",{}); s[uid]=Date.now(); Store.set("clanInvSent",s); toast(`Einladung an ${nick} gesendet ✉️`); this.render(); }
    catch(e){ toast(this.err(e)); }
  },
  /* Liste zum Einladen: Freunde + gefundene Spieler, die noch nicht Mitglied sind */
  inviteList(){
    const mem=(this.clan&&this.clan.members)||{}, sent=Store.get("clanInvSent",{}), q=this.cq||"", seen=new Set();
    const L=[...this.friends.map(f=>({...f,friend:1})), ...(this.players||[])].filter(p=>{ if(seen.has(p.uid)||mem[p.uid]||p.uid===this.me) return false; seen.add(p.uid); return true; })
      .filter(p=>!q||String(p.nick).toLowerCase().includes(q)).slice(0,40);
    if(!L.length) return `<p class="muted">${q?"Niemand mit diesem Namen gefunden.":"Keine Spieler zum Einladen gefunden."}</p>`;
    return L.map(p=>`<div class="sorow">${this.dot(p)}<b>${esc(p.nick)}</b>${p.friend?` <small class="muted">Freund</small>`:""}${p.clanTag?` <small class="muted">[${esc(p.clanTag)}]</small>`:""}<span class="sp"></span>
      ${sent[p.uid]&&Date.now()-sent[p.uid]<864e5?`<small class="muted">✉️ eingeladen</small>`:`<button class="small blue" data-act="inviteToClan|${p.uid}|${esc(p.nick)}">✉️ Einladen</button>`}</div>`).join("");
  },

  /* ---------- Fortschritt der Organisations-Aufträge ---------- */
  pendingKey(){ return "clanPending"; },
  /* nach jedem Duell (aus Rewards.result) */
  onResult(mode, won, extra={}){
    const cc=Store.get("clanCache",null); if(!cc||!cc.id) return;
    const D=Duel, st=CardStats.last||{}, side=D.side||Store.get("lastSide","polizei");
    const rounds=Math.ceil((D.turn||0)/2), myLp=D.P?D.P.lp:0, add={};
    const inc=(id,n=1)=>{ if(n>0) add[id]=(add[id]||0)+n; };
    if(won){ inc("c_win"); if(mode==="online") inc("c_online"); if(mode==="story"&&extra.hard) inc("c_hard");
      if(myLp>=3000) inc("c_lp"); if(rounds>0&&rounds<=7) inc("c_fast"); inc(side==="polizei"?"c_pol":"c_ver"); if(mode==="online"&&Tour.active()) inc("c_tour"); }
    inc("c_kills", st.kills||0); inc("c_cel", st.cel||0);
    // Clan-Bonus: Münzen pro Sieg je nach Stufe
    if(won){ const b=5*clanLevel(cc.xp).lvl; Player.coins+=b; Player.save(); setTimeout(()=>toast(`🏢 Organisations-Bonus: +${b} 🪙`),3400); }
    const today=this.questsFor(cc.id,this.week()).map(q=>q.id), useful={};
    Object.entries(add).forEach(([k,v])=>{ if(today.includes(k)) useful[k]=v; });
    if(!Object.keys(useful).length) return;
    const P=Store.get(this.pendingKey(),[]); P.push({cid:cc.id, week:this.week(), add:useful}); Store.set(this.pendingKey(),P.slice(-40));
    this.flush();
  },
  async flush(){
    if(this._flushing||!this.ok()) return; this._flushing=true;
    try{ const me=this.me||await Cloud.uid();
      while(true){ const P=Store.get(this.pendingKey(),[]); if(!P.length) break; const x=P[0];
        if(x.week===this.week()){
          const inc={}, tot=Object.values(x.add).reduce((a,b)=>a+b,0);
          Object.entries(x.add).forEach(([k,v])=>inc[k]={".sv":{increment:v}});
          await Cloud.req(`clans/${x.cid}/q/${x.week}`,"PATCH",inc);
          await Cloud.req(`clans/${x.cid}/contrib/${x.week}`,"PATCH",{[me]:{".sv":{increment:tot}}});
          await this.checkDone(x.cid, x.week);
        }
        Store.set(this.pendingKey(),Store.get(this.pendingKey(),[]).slice(1)); }
    }catch(e){ console.warn("Clan:",e.message); }
    finally{ this._flushing=false; }
  },
  /* Erledigte Aufträge eintragen (mehrfaches Eintragen ist harmlos: gleicher Wert) */
  async checkDone(cid, week){
    const q=await Cloud.req(`clans/${cid}/q/${week}`)||{}, done=await Cloud.req(`clans/${cid}/done`)||{};
    for(const qu of this.questsFor(cid,week)){ const key=`${week}_${qu.id}`;
      if((q[qu.id]||0)>=qu.n && !done[key]){ await Cloud.req(`clans/${cid}/done/${key}`,"PUT",qu.xp); toast(`🏢 Organisations-Auftrag erledigt: +${qu.xp} XP!`);
        const xp=this.clanXP({done:{...done,[key]:qu.xp}}); await Cloud.req("clanlist/"+cid,"PATCH",{xp}).catch(()=>{}); } }
  },
  /* Belohnung für Mitglieder, die diese Woche beigetragen haben */
  async claim(qid){
    const key=`${this.clanId}_${this.week()}_${qid}`, cl=Store.get("clanClaims",{}); if(cl[key]) return;
    const qu=CLAN_QUESTS.find(q=>q.id===qid), lvl=clanLevel(this.clanXP(this.clan)).lvl, coins=Math.round(qu.coins*(1+.1*(lvl-1)));
    cl[key]=1; Store.set("clanClaims",cl); Player.coins+=coins; Player.save();
    Rewards.givePack(lvl>=5?"prem":"mix","Belohnung der Organisation:"); banner(`+${coins} 🪙`); this.render();
  },

  /* ---------- Anzeige ---------- */
  async render(full){
    const el=$("socMain"); if(!el) return;
    $("socTabs").querySelectorAll("span").forEach(s=>s.classList.toggle("on",s.dataset.t===this.tab));
    if(!this.ok()){ el.innerHTML=`<p class="muted">Freunde und Organisationen brauchen eine Internetverbindung zum Spielserver.</p>`; return; }
    if(!this.me){ el.innerHTML=`<p class="muted">Verbinde …</p>`; await this.start(); if(!this.me){ el.innerHTML=`<p class="muted">⚠️ Keine Verbindung zum Server.</p>`; return; } }
    if(full){ el.innerHTML=`<p class="muted">Lade …</p>`;
      await Promise.all([this.loadFriends(), this.loadReqs(), this.loadInvites(), this.touch(true).then(()=>this.loadClan()), this.loadPlayers().catch(()=>{}), this.loadClanInv().catch(()=>{})]);
      if(!this.clanId) await this.loadList(); else this.loadMemberStatus(); this.flush(); }
    el.innerHTML = this.tab==="friends" ? this.htmlFriends() : this.htmlClan();
    el.querySelectorAll("[data-act]").forEach(b=>b.onclick=()=>{ const [fn,...a]=b.dataset.act.split("|"); this[fn](...a); });
    const cf=$("clFind"); if(cf) cf.oninput=()=>{ this.cq=cf.value.trim().toLowerCase(); $("clInvList").innerHTML=this.inviteList(); $("clInvList").querySelectorAll("[data-act]").forEach(b=>b.onclick=()=>{ const [fn,...a]=b.dataset.act.split("|"); this[fn](...a); }); };
    const fi=$("soFind"); if(fi){ fi.onkeydown=e=>{ if(e.key==="Enter") this.searchPlayers(); }; fi.oninput=()=>{ this.pq=fi.value.trim().toLowerCase(); $("soPlayers").innerHTML=this.playerList(); $("soPlayers").querySelectorAll("[data-act]").forEach(b=>b.onclick=()=>{ const [fn,...a]=b.dataset.act.split("|"); this[fn](...a); }); }; }
    if(this.tab==="clan" && !this.clan){
      el.querySelectorAll("[data-em]").forEach(s=>s.onclick=()=>{ this._emblem=s.dataset.em; el.querySelectorAll("[data-em]").forEach(x=>x.classList.toggle("on",x===s)); });
      el.querySelectorAll("[data-cs]").forEach(s=>s.onclick=()=>{ this._side=s.dataset.cs; el.querySelectorAll("[data-cs]").forEach(x=>x.classList.toggle("on",x===s)); });
    }
  },
  dot(p){ return `<i class="sodot ${this.online(p)?"on":""}"></i>`; },
  htmlFriends(){
    const anon=!Account.loggedIn();
    return `
    ${this.invites.length?`<div class="panel"><h3 class="qh">⚔️ Herausforderungen</h3>${this.invites.map(i=>`<div class="sorow"><b>${esc(i.nick)}</b><span class="sp"></span>
      <button class="small green" data-act="acceptInvite|${i.uid}">Annehmen</button><button class="small ghost" data-act="declineInvite|${i.uid}">✕</button></div>`).join("")}</div>`:""}
    <div class="panel"><div class="muted">Dein Freundescode</div>
      <div class="socode">${esc(this.code||"–")}</div>
      <div class="row"><button class="small blue" data-act="shareCode">📤 Teilen</button></div>
      ${anon?`<p class="muted" style="margin:6px 0 0">Tipp: Mit einem <b>Konto</b> bleiben Freunde und Organisation auch auf neuen Geräten erhalten.</p>`:""}
      <div class="row" style="margin-top:10px"><input id="soCode" maxlength="6" placeholder="Code eines Freundes" style="text-transform:uppercase;flex:1"><button class="small green" data-act="addFriend">＋ Hinzufügen</button></div></div>
    ${this.reqs.length?`<div class="panel"><h3 class="qh">✉️ Anfragen</h3>${this.reqs.map(r=>`<div class="sorow"><b>${esc(r.nick||"?")}</b><span class="sp"></span>
      <button class="small green" data-act="accept|${r.uid}">Annehmen</button><button class="small ghost" data-act="decline|${r.uid}">✕</button></div>`).join("")}</div>`:""}
    <div class="panel"><h3 class="qh">👥 Freunde (${this.friends.length})</h3>
      ${this.friends.length?this.friends.map(f=>`<div class="sorow">${this.dot(f)}<b>${esc(f.nick)}</b>${f.clanTag?` <small class="muted">[${esc(f.clanTag)}]</small>`:""}<span class="sp"></span>
        <button class="small red" data-act="challenge|${f.uid}|${esc(f.nick)}">⚔️ Duell</button><button class="small ghost" data-act="unfriend|${f.uid}">✕</button></div>`).join("")
        :`<p class="muted">Noch keine Freunde. Schick deinen Code herum – oder such unten nach Spielern.</p>`}
    </div>
    <div class="panel"><h3 class="qh">🔎 Spieler finden</h3>
      <p class="muted" style="margin-top:0">Registrierte Spieler (mit Konto), online und zuletzt aktive zuerst.</p>
      <div class="row"><input id="soFind" placeholder="Name suchen …" value="${esc(this.pq)}" style="flex:1"><button class="small blue" data-act="searchPlayers">Suchen</button></div>
      <div id="soPlayers">${this.playerList()}</div></div>`;
  },
  htmlClan(){
    if(!this.clan){
      const side=this._side||"polizei", em=this._emblem||CLAN_EMBLEMS[0];
      return `${this.clanInvs.length?`<div class="panel"><h3 class="qh">✉️ Einladungen</h3>${this.clanInvs.map(i=>`<div class="sorow"><div><b>${esc(i.name)}</b> <small class="muted">[${esc(i.tag)}]</small><br><small class="muted">von ${esc(i.from||"?")}</small></div><span class="sp"></span>
        <button class="small green" data-act="acceptClanInv|${i.cid}">Beitreten</button><button class="small ghost" data-act="declineClanInv|${i.cid}">✕</button></div>`).join("")}</div>`:""}
      <div class="panel"><h3 class="qh">🏢 Organisation gründen</h3>
        <p class="muted" style="margin-top:0">Eine Dienststelle oder ein Syndikat mit bis zu ${CLAN_MAX} Mitgliedern. Gemeinsam erfüllt ihr schwere Wochen-Aufträge, steigt im Rang auf und bekommt Boni.</p>
        <label>Name</label><input id="clName" maxlength="24" placeholder="z. B. Revier Nord">
        <label>Kürzel (2–4)</label><input id="clTag" maxlength="4" placeholder="RVN" style="text-transform:uppercase">
        <label>Ausrichtung</label><div class="tabs"><span data-cs="polizei" class="${side==="polizei"?"on":""}">👮 Dienststelle</span><span data-cs="verbrecher" class="${side==="verbrecher"?"on":""}">🦹 Syndikat</span></div>
        <label>Wappen</label><div class="soem">${CLAN_EMBLEMS.map(e=>`<span data-em="${e}" class="${e===em?"on":""}">${e}</span>`).join("")}</div>
        <button class="green" style="margin-top:10px" data-act="create">🏢 Gründen (🪙 ${CLAN_COST})</button></div>
      <div class="panel"><h3 class="qh">🔎 Organisationen</h3>
        ${(this.list||[]).length?(this.list||[]).slice(0,40).map(c=>`<div class="sorow"><span class="soemb">${esc(c.emblem||"🏢")}</span><div><b>${esc(c.name)}</b> <small class="muted">[${esc(c.tag)}]</small><br>
          <small class="muted">${c.side==="verbrecher"?"Syndikat":"Dienststelle"} · Stufe ${clanLevel(c.xp).lvl} · ${c.n||1}/${CLAN_MAX}</small></div><span class="sp"></span>
          ${c.open!==false&&(c.n||1)<CLAN_MAX?`<button class="small blue" data-act="join|${c.id}">Beitreten</button>`:`<small class="muted">geschlossen</small>`}</div>`).join("")
          :`<p class="muted">Noch keine Organisationen – gründe die erste!</p>`}</div>`;
    }
    const c=this.clan, xp=this.clanXP(c), L=clanLevel(xp), wk=this.week(), qs=this.questsFor(this.clanId,wk), prog=(c.q&&c.q[wk])||{}, contrib=(c.contrib&&c.contrib[wk])||{};
    const pol=c.side!=="verbrecher", leader=this.isLeader(), cl=Store.get("clanClaims",{});
    const mem=Object.entries(c.members||{}).sort((a,b)=>(b[1].role==="leader")-(a[1].role==="leader")||(contrib[b[0]]||0)-(contrib[a[0]]||0));
    return `
    <div class="panel soclan"><div class="soemb big">${esc(c.emblem||"🏢")}</div><div><h3 style="margin:0">${esc(c.name)} <small class="muted">[${esc(c.tag)}]</small></h3>
      <small class="muted">${pol?"Dienststelle":"Syndikat"} · ${mem.length}/${CLAN_MAX} Mitglieder${c.open?"":" · geschlossen"}</small></div></div>
    <div class="panel"><b>Stufe ${L.lvl}</b> <small class="muted">${L.rest}/${L.need} XP</small>
      <div class="qbar"><i style="width:${Math.min(100,L.rest/L.need*100)}%"></i></div>
      <small class="muted">Bonus: +${5*L.lvl} 🪙 bei jedem Sieg · Auftragsbelohnungen +${10*(L.lvl-1)} %${L.lvl>=5?" · Gold-Akte statt Großeinsatz-Booster":""}</small></div>
    <div class="panel"><h3 class="qh">${pol?"🚨 Sonderermittlungen":"💰 Großcoups"} dieser Woche</h3>
      <p class="muted" style="margin-top:0">Schwer und nur gemeinsam zu schaffen. Wer diese Woche mitgeholfen hat, bekommt bei jedem erledigten Auftrag eine Belohnung.</p>
      ${qs.map(q=>{ const p=Math.min(q.n,prog[q.id]||0), done=p>=q.n||(c.done&&c.done[`${wk}_${q.id}`]), key=`${this.clanId}_${wk}_${q.id}`, mine=contrib[this.me]||0;
        return `<div class="qrow sq ${done?(cl[key]?"done":mine>0?"ready":""):""}"><div class="qt">${esc(pol?q.p:q.v)}</div><div class="qbar"><i style="width:${p/q.n*100}%"></i></div>
          <small>${p}/${q.n} · ${q.xp} XP</small>
          ${done?(cl[key]?`<small class="muted"> ✔ abgeholt</small>`:mine>0?` <button class="small green" data-act="claim|${q.id}">Belohnung holen</button>`:`<small class="muted"> – du hast diese Woche noch nicht beigetragen</small>`):""}</div>`; }).join("")}
    </div>
    <div class="panel"><h3 class="qh">👥 Mitglieder</h3>
      ${mem.map(([u,m])=>`<div class="sorow">${u===this.me?"":this.dot(this.profCache&&this.profCache[u])}<b>${esc(m.nick)}</b>${m.role==="leader"?" 👑":""}<small class="muted"> · ${contrib[u]||0} Beiträge</small><span class="sp"></span>
        ${u!==this.me?`<button class="small red" data-act="challenge|${u}|${esc(m.nick)}">⚔️</button>${leader?`<button class="small ghost" data-act="promote|${u}">👑</button><button class="small ghost" data-act="kick|${u}">✕</button>`:""}`:`<small class="muted">du</small>`}</div>`).join("")}
    </div>
    ${mem.length<CLAN_MAX?`<div class="panel"><h3 class="qh">✉️ Mitglieder einladen</h3>
      <p class="muted" style="margin-top:0">Lade Freunde oder andere Spieler direkt ein – auch wenn die Aufnahme geschlossen ist.</p>
      <input id="clFind" placeholder="Name filtern …" value="${esc(this.cq||"")}">
      <div id="clInvList">${this.inviteList()}</div></div>`:""}
    <div class="row">${leader?`<button class="small ghost" data-act="toggleOpen">${c.open?"🔒 Aufnahme schließen":"🔓 Aufnahme öffnen"}</button>`:""}<button class="small ghost" data-act="leave">🚪 ${leader&&mem.length<=1?"Auflösen":"Verlassen"}</button></div>`;
  },
  show(t){ this.tab=t; this.render(); if(t==="clan"&&this.clan) this.loadMemberStatus(); },
  async loadMemberStatus(){
    const ids=Object.keys((this.clan&&this.clan.members)||{}).filter(u=>u!==this.me); this.profCache=this.profCache||{};
    const ps=await Promise.all(ids.map(u=>Cloud.req("profiles/"+u).catch(()=>null))); ids.forEach((u,i)=>this.profCache[u]=ps[i]);
    if(UI.current==="social"&&this.tab==="clan") this.render();
  },
};
