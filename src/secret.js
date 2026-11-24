/* ============================ HINWEISE & GEHEIMAKTEN ============================
   In normalen Duellen findet man Hinweise (Spuren). Mit genug Hinweisen öffnet man
   Kapitel der Geheimakten: besonders schwere Story-Abschnitte, die neue, exklusive
   Karten als Belohnung haben (nur dort erhältlich, nicht in Boostern).
   ============================================================================== */
const CLUES = {
  fuss:   {name:"Fußspur",        icon:"👣", w:40},
  finger: {name:"Fingerabdruck",  icon:"🖐️", w:33},
  video:  {name:"Videoaufnahme",  icon:"📼", w:19},
  dna:    {name:"DNA-Spur",       icon:"🧬", w:8},
};
const SECRET_CASES = [
  {id:"sa1", side:"polizei", title:"Geheimakte 1: Das Phantom-Archiv",
   desc:"Aus dem Keller des Präsidiums verschwinden ungelöste Akten – immer nachts, nie eine Spur. Fast nie.",
   chapters:[
    {id:"sa1c1", title:"Die verschwundene Akte", need:{fuss:3,finger:2}, coins:1000, card:"pa01",
     opp:{name:"Aktenschredder-Klaus", emoji:"🗃️", lp:10000, minLevel:5, maxLevel:10, maxRarity:"UR", skills:{atk:5,lp:5,eff:2,hand:1}},
     intro:"Cold-Case-Ermittlerin Hartmann|🗂️|Dreißig Jahre alte Akte, gestern noch da, heute weg. Und am Schrank: frische Fußspuren.\nAktenschredder-Klaus|🗃️|Papier ist geduldig. Ich nicht!",
     outro:"Aktenschredder-Klaus|🗃️|Ich hab nur geschreddert, was mir der Nebelmann gebracht hat!\nCold-Case-Ermittlerin Hartmann|🗂️|Dann fangen wir mit dem Nebel an. Ich bin dabei."},
    {id:"sa1c2", title:"Spuren im Nebel", need:{finger:3,video:2}, coins:1500, card:"pa02",
     opp:{name:"Der Nebelmann", emoji:"🌫️", lp:12500, minLevel:6, maxLevel:12, maxRarity:"UR", skills:{atk:5,lp:5,eff:3,hand:1,second:1}},
     intro:"Phantomjäger Graumann|🕯️|Die Kamera hat ihn dreimal erwischt. Dreimal nur Nebel. Zeit, dass jemand das Licht anmacht.\nDer Nebelmann|🌫️|Wer mich sieht, hat schon verloren.",
     outro:"Der Nebelmann|🌫️|Das Phantom … es sammelt nicht Akten. Es sammelt Geheimnisse.\nPhantomjäger Graumann|🕯️|Dann holen wir sie uns zurück."},
    {id:"sa1c3", title:"Finale: Das Phantom", need:{video:3,dna:2}, coins:2500, card:"pa03",
     opp:{name:"Das Phantom", emoji:"🎭", lp:15000, minLevel:6, maxLevel:12, maxRarity:"CE", skills:{atk:5,lp:5,eff:3,hand:2,second:1}},
     intro:"Sonderermittler Falkenauge|🦅|Die DNA-Spur führt direkt hierher. Ins Archiv. Hinter die letzte Regalreihe.\nDas Phantom|🎭|Jede Akte hier erzählt von einem Fehler der Polizei. Willst du der nächste sein?",
     outro:"Das Phantom|🎭|Ihr habt mich … aktenkundig gemacht.\nPolizeipräsidentin Dr. Wolf|🎖️|Geheimakte 1: geschlossen. Gute Arbeit, alle zusammen."},
   ]},
  {id:"sb1", side:"verbrecher", title:"Geheimakte 2: Der Archiv-Coup",
   desc:"Im Landeskriminalamt liegt eine Akte über jeden großen Fisch der Unterwelt. Wer sie hat, regiert die Stadt.",
   chapters:[
    {id:"sb1c1", title:"Der Plan im Keller", need:{fuss:3,finger:2}, coins:1000, card:"va01",
     opp:{name:"Archivwächter Pedantisch", emoji:"🗄️", lp:10000, minLevel:5, maxLevel:10, maxRarity:"UR", skills:{atk:5,lp:5,eff:2,hand:1}},
     intro:"Archivdieb Staubfinger|📚|Ich kenne jede Akte im LKA. Ich brauche nur jemanden, der den Wächter beschäftigt.\nArchivwächter Pedantisch|🗄️|Ausleihe nur mit Formular 27b. In dreifacher Ausfertigung!",
     outro:"Archivwächter Pedantisch|🗄️|Mein Archiv … alphabetisch verwüstet …\nArchivdieb Staubfinger|📚|Die Hauptakte liegt im Tresor. Da brauchen wir einen Künstler."},
    {id:"sb1c2", title:"Die perfekte Fälschung", need:{finger:3,video:2}, coins:1500, card:"va02",
     opp:{name:"Profilerin Dr. Sandmann", emoji:"🧠", lp:12500, minLevel:6, maxLevel:12, maxRarity:"UR", skills:{atk:5,lp:5,eff:3,hand:1,second:1}},
     intro:"Meisterfälscher Kopierer|🖨️|Ich fälsche den Dienstausweis, das Siegel und den Kaffeefleck auf dem Formular.\nProfilerin Dr. Sandmann|🧠|Ein Kaffeefleck auf der falschen Seite. Ich hab dein Profil längst.",
     outro:"Profilerin Dr. Sandmann|🧠|Wer hätte gedacht, dass der Fleck echt ist …\nMeisterfälscher Kopierer|🖨️|Der Tresor ist offen. Jetzt kommt der Boss."},
    {id:"sb1c3", title:"Finale: Die Akte der Akten", need:{video:3,dna:2}, coins:2500, card:"va03",
     opp:{name:"Polizeipräsidentin Dr. Wolf", emoji:"🎖️", lp:15000, minLevel:6, maxLevel:12, maxRarity:"CE", skills:{atk:5,lp:5,eff:3,hand:2,second:1}},
     intro:"Schattenkanzler Nox|🌘|Die Akte gehört mir. Und die Stadt gleich mit.\nPolizeipräsidentin Dr. Wolf|🎖️|Über meine Akten. Und über meine Sammlung an Kugelschreibern.",
     outro:"Polizeipräsidentin Dr. Wolf|🎖️|Die Akte … ist leer?\nSchattenkanzler Nox|🌘|Natürlich. Die echte habe ich seit Jahren. Ich wollte nur sehen, wie gut ihr seid."},
   ]},
];

const Clues = {
  have(k){ return (Player.clues||{})[k]||0; },
  total(){ return Object.keys(CLUES).reduce((s,k)=>s+this.have(k),0); },
  give(k,n=1){ Player.clues=Player.clues||{}; Player.clues[k]=(Player.clues[k]||0)+n; },
  roll(){ let r=Math.random()*Object.values(CLUES).reduce((a,c)=>a+c.w,0); for(const k in CLUES){ if((r-=CLUES[k].w)<0) return k; } return "fuss"; },
  enough(need){ return Object.entries(need).every(([k,n])=>this.have(k)>=n); },
  spend(need){ if(!this.enough(need)) return false; Object.entries(need).forEach(([k,n])=>Player.clues[k]-=n); return true; },
  needText(need){ return Object.entries(need).map(([k,n])=>`${CLUES[k].icon} ${this.have(k)}/${n}`).join("  "); },
  /* nach normalen Duellen: Sieg 70 % (+25 % ein zweiter), Niederlage 30 %, Online-Sieg immer, schwere Story +1 */
  drop(mode, won, extra={}){
    if(mode==="secret") return;
    const got=[];
    const chance = won ? .7 : .3;
    if(Math.random()<chance || (won && mode==="online")) got.push(this.roll());
    if(won && Math.random()<.25) got.push(this.roll());
    if(won && mode==="story" && extra.hard) got.push(this.roll());
    if(!got.length) return;
    got.forEach(k=>this.give(k)); Player.save();
    const txt=got.map(k=>`${CLUES[k].icon} ${CLUES[k].name}`).join(", ");
    setTimeout(()=>toast(`🔍 Hinweis gefunden: ${txt}`),2600);
  },
};

const Secret = {
  st(){ Player.secret=Player.secret||{opened:{},done:{}}; Player.secret.opened=Player.secret.opened||{}; Player.secret.done=Player.secret.done||{}; return Player.secret; },
  render(){
    const S=this.st();
    $("storyDesc").innerHTML=`<b>🗂️ Geheimakten – extrem schwer</b><br>Sammle in normalen Duellen <b>Hinweise</b>. Mit genug Hinweisen öffnest du ein Kapitel. Jedes gelöste Kapitel bringt eine neue <b>Geheimakten-Karte</b>, die es nirgendwo sonst gibt.
      <div class="clues">${Object.entries(CLUES).map(([k,c])=>`<span><b>${c.icon} ${Clues.have(k)}</b><small>${c.name}</small></span>`).join("")}</div>`;
    $("storyList").innerHTML=SECRET_CASES.map(cs=>`
      <h3 class="qh" style="margin:14px 0 4px">${FACTIONS[cs.side][1]} ${esc(cs.title)}</h3><p class="muted" style="margin:0 0 6px">${esc(cs.desc)}</p>
      ${cs.chapters.map((c,i)=>{
        const prevOk=i===0||S.done[cs.chapters[i-1].id], done=S.done[c.id], open=S.opened[c.id], card=DB.byId(c.card);
        let btn;
        if(done) btn=`<button class="small ghost" data-p="${cs.id}:${i}">Nochmal</button>`;
        else if(!prevOk) btn=``;
        else if(open) btn=`<button class="small red" data-p="${cs.id}:${i}">Start</button>`;
        else btn=`<button class="small ${Clues.enough(c.need)?"green":"ghost"}" data-o="${cs.id}:${i}">Akte öffnen</button>`;
        return `<div class="chapter ${prevOk?"":"locked"}"><div class="ce">${prevOk?esc(c.opp.emoji):"🔒"}</div><div class="ct"><b>${i+1}. ${esc(c.title)}</b>
          <span class="muted">${!prevOk?"Löse zuerst das vorige Kapitel":done?`✅ gelöst · Karte: ${esc(card?card.name:"")}`:open?`Geöffnet · Gegner: ${esc(c.opp.name)} · ${c.opp.lp} LP`:`Benötigt: ${Clues.needText(c.need)}`}</span>
          ${prevOk&&!done&&card?`<span class="muted">Belohnung: <a href="#" data-card="${card.id}" style="color:var(--yellow)">${esc(card.name)}</a> + 🪙 ${c.coins}</span>`:""}</div>${btn}</div>`;
      }).join("")}`).join("");
    $("storyList").querySelectorAll("[data-o]").forEach(b=>b.onclick=()=>this.open(...b.dataset.o.split(":")));
    $("storyList").querySelectorAll("[data-p]").forEach(b=>b.onclick=()=>this.play(...b.dataset.p.split(":")));
    $("storyList").querySelectorAll("[data-card]").forEach(a=>a.onclick=e=>{ e.preventDefault(); UI.cardInfo(a.dataset.card); });
  },
  find(cid,i){ const cs=SECRET_CASES.find(x=>x.id===cid); return [cs, cs&&cs.chapters[+i]]; },
  async open(cid,i){
    const [cs,c]=this.find(cid,i); if(!c) return;
    if(!Clues.enough(c.need)) return toast(`Noch nicht genug Hinweise: ${Clues.needText(c.need)}`);
    if(!await UI.ask(`Akte „${c.title}“ öffnen? Dafür werden diese Hinweise verbraucht: ${Object.entries(c.need).map(([k,n])=>`${n}× ${CLUES[k].name}`).join(", ")}. Die Akte bleibt offen, bis du das Kapitel gewinnst.`)) return;
    Clues.spend(c.need); this.st().opened[c.id]=true; Player.save(); Sound.play("coin"); toast("🗂️ Akte geöffnet!"); this.render();
  },
  play(cid,i){
    const [cs,c]=this.find(cid,i); if(!c) return; const f=cs.side, S=this.st();
    Scene.play(`${cs.title.split(":")[0]} · ${c.title}`, Story.parse(c.intro), f, ()=>{
      const deck=Deck.genDeck(OTHER[f],{maxLevel:c.opp.maxLevel,minLevel:c.opp.minLevel||1,maxRarity:c.opp.maxRarity});
      Duel.start(f,{oppName:c.opp.name, oppEmoji:c.opp.emoji, oppLP:c.opp.lp, oppDeck:deck, oppSkills:c.opp.skills,
        onEnd:win=>new Promise(res=>{
          Rewards.result("secret",win,{hard:true});
          if(!win){ Prog.reward(f,60,80); return res(); }
          const first=!S.done[c.id];
          const lines=Story.parse(c.outro);
          if(first){ S.done[c.id]=true; Player.add(c.card,1,"SP"); Player.coins+=c.coins; Player.save();
            const card=DB.byId(c.card); lines.push({who:"",emoji:"🗂️",text:`Neue Geheimakten-Karte: „${card?card.name:c.card}“ (Special Rare) + ${c.coins} Münzen!`}); }
          Prog.reward(f, first?0:150, first?500:120);
          Scene.play(first?"Akte gelöst!":"Wieder gewonnen!", lines, f, ()=>{ res(); Story.camp="__secret"; UI.show("story"); if(first) setTimeout(()=>UI.cardInfo(c.card),400); });
        })});
    });
  },
};
