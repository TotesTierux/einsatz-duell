/* =====================================================================
   EINSATZ-DUELL v0.3 – Polizei gegen Verbrecher
   Aufbau: Daten → Speicher → Spieler/Sammlung → Karten-HTML → UI → Admin →
           Story-Editor → Deck → Shop → Story → Duell → KI → Start
   ===================================================================== */

/* ============================ DATEN ============================ */
const FACTIONS = {polizei:["Polizei","👮"], verbrecher:["Verbrecher","🦹"]};
const OTHER = {polizei:"verbrecher", verbrecher:"polizei"};
const TYPES   = {monster:"Charakter", fusion:"Fusion", spell:"Maßnahme", trap:"Reaktion"};
const RARITY  = {N:"Normal", R:"Rar", SR:"Super", UR:"Ultra"};
const RANK    = {N:0, R:1, SR:2, UR:3};
const ROLES = {
  polizei:    {streife:["Streife","🚓"], kripo:["Kripo","🕵️"], sek:["SEK","🪖"], verkehr:["Verkehr","🚦"], hunde:["Diensthunde","🐕"], bepo:["Bereitschaft","🛡️"]},
  verbrecher: {dieb:["Dieb","👜"], betrug:["Betrüger","🎭"], bande:["Bande","👥"], hehler:["Hehler","📦"], raub:["Räuber","💰"], drogen:["Dealer","💊"]},
};
const LAWS = {
  StPO:  ["StPO","Strafverfolgung (repressiv)","⚖️"],
  SOG:   ["SOG","Gefahrenabwehr (präventiv)","🛑"],
  Trick: ["Trick","Gaunertrick","🃏"],
};
const LAWS_BY_FACTION = {polizei:["StPO","SOG"], verbrecher:["Trick"]};
const isChar = c => c && (c.type==="monster" || c.type==="fusion");
const roleName = (f,k) => k==="any" ? "beliebig" : (ROLES[f][k]?ROLES[f][k][0]:k);

// Effekt-Bibliothek: types = für welche Kartentypen; {v} = Wert; ai = Hinweis für die KI
// Gruppen: Beim Ausspielen (summon_*), Dauerhaft (passiv), Kampf (battle_*), Ausscheiden, Zugbeginn (turn_*), Maßnahmen, Reaktionen
const CH = ["monster","fusion"];
const EFFECTS = {
  // ---------- Charaktere: ohne / beim Ausspielen ----------
  none:              {types:CH, group:"Charakter", label:"Kein Effekt",                         text:"", val:false},
  summon_burn:       {types:CH, group:"Beim Ausspielen", label:"Schaden",                       text:"Beim Ausspielen: Gegner verliert {v} LP.", val:true},
  summon_heal:       {types:CH, group:"Beim Ausspielen", label:"LP erhalten",                   text:"Beim Ausspielen: Du erhältst {v} LP.", val:true},
  summon_draw:       {types:CH, group:"Beim Ausspielen", label:"Karten ziehen",                 text:"Beim Ausspielen: Ziehe {v} Karte(n).", val:true},
  summon_weaken:     {types:CH, group:"Beim Ausspielen", label:"Stärksten Gegner schwächen",    text:"Beim Ausspielen: Der stärkste gegnerische Charakter verliert {v} ATK.", val:true},
  summon_destroy_st: {types:CH, group:"Beim Ausspielen", label:"Verdeckte Karte entfernen",     text:"Beim Ausspielen: Entferne eine verdeckte Karte des Gegners.", val:false},
  summon_destroy_weak:{types:CH, group:"Beim Ausspielen", label:"Schwächsten Gegner ausschalten", text:"Beim Ausspielen: Der schwächste gegnerische Charakter scheidet aus, wenn seine ATK niedriger ist.", val:false},
  summon_bounce:     {types:CH, group:"Beim Ausspielen", label:"Stärksten Gegner verweisen",    text:"Beim Ausspielen: Der stärkste gegnerische Charakter muss zurück auf die Hand.", val:false},
  summon_boost_all:  {types:CH, group:"Beim Ausspielen", label:"Team verstärken",               text:"Beim Ausspielen: Alle anderen eigenen Charaktere erhalten {v} ATK.", val:true},
  summon_revive:     {types:CH, group:"Beim Ausspielen", label:"Kollegen zurückholen",          text:"Beim Ausspielen: Hole deinen stärksten ausgeschiedenen Charakter auf die Hand.", val:false},
  summon_discard:    {types:CH, group:"Beim Ausspielen", label:"Handkarte abnehmen",            text:"Beim Ausspielen: Der Gegner legt {v} zufällige Handkarte(n) ab.", val:true},
  summon_mill:       {types:CH, group:"Beim Ausspielen", label:"Deck lichten",                  text:"Beim Ausspielen: Der Gegner legt die obersten {v} Karten seines Decks ab.", val:true},
  summon_flip_all:   {types:CH, group:"Beim Ausspielen", label:"Alles aufdecken",               text:"Beim Ausspielen: Alle verdeckten gegnerischen Charaktere werden aufgedeckt.", val:false},
  summon_lock:       {types:CH, group:"Beim Ausspielen", label:"Stärksten Gegner festhalten",   text:"Beim Ausspielen: Der stärkste gegnerische Charakter kann im nächsten Zug nicht angreifen.", val:false},
  summon_steal:      {types:CH, group:"Beim Ausspielen", label:"Gegner überlaufen lassen",      text:"Beim Ausspielen: Übernimm den schwächsten gegnerischen Charakter.", val:false},
  // ---------- Charaktere: dauerhaft ----------
  pierce:            {types:CH, group:"Dauerhaft", label:"Durchschlag",                        text:"Besiegt er einen Charakter in VER, verliert der Gegner die Differenz als LP.", val:false},
  double_attack:     {types:CH, group:"Dauerhaft", label:"Doppelangriff",                      text:"Kann zweimal pro Zug angreifen.", val:false},
  direct:            {types:CH, group:"Dauerhaft", label:"Schleichweg (Direktangriff)",        text:"Kann den Gegner immer direkt angreifen – auch wenn er Charaktere hat.", val:false},
  guard:             {types:CH, group:"Dauerhaft", label:"Deckung",                            text:"Solange er offen auf dem Feld ist, muss der Gegner zuerst ihn angreifen.", val:false},
  immune:            {types:CH, group:"Dauerhaft", label:"Immunität",                          text:"Kann nicht durch Maßnahmen, Tricks oder Reaktionen ausgeschaltet, geschwächt oder entfernt werden.", val:false},
  // ---------- Charaktere: Kampf / Ausscheiden / Zugbeginn ----------
  battle_heal:       {types:CH, group:"Im Kampf", label:"Sieg: LP erhalten",                   text:"Besiegt er einen Charakter, erhältst du {v} LP.", val:true},
  battle_burn:       {types:CH, group:"Im Kampf", label:"Sieg: Extra-Schaden",                 text:"Besiegt er einen Charakter, verliert der Gegner zusätzlich {v} LP.", val:true},
  battle_draw:       {types:CH, group:"Im Kampf", label:"Sieg: Karte ziehen",                  text:"Besiegt er einen Charakter, ziehe 1 Karte.", val:false},
  survivor:          {types:CH, group:"Beim Ausscheiden", label:"Entwischt",                   text:"Wird er im Kampf besiegt, kehrt er auf die Hand zurück, statt auszuscheiden.", val:false},
  revenge:           {types:CH, group:"Beim Ausscheiden", label:"Letzter Funkspruch (Schaden)", text:"Scheidet er aus, verliert der Gegner {v} LP.", val:true},
  last_draw:         {types:CH, group:"Beim Ausscheiden", label:"Akte weitergeben (Ziehen)",   text:"Scheidet er aus, ziehst du 1 Karte.", val:false},
  growth:            {types:CH, group:"Zugbeginn", label:"Erfahrung sammeln",                  text:"Zu Beginn jedes eigenen Zuges erhält er {v} ATK.", val:true},
  turn_heal:         {types:CH, group:"Zugbeginn", label:"Ruhe bewahren (LP)",                 text:"Zu Beginn jedes eigenen Zuges erhältst du {v} LP.", val:true},
  turn_burn:         {types:CH, group:"Zugbeginn", label:"Dauerdruck (Schaden)",               text:"Zu Beginn jedes eigenen Zuges verliert der Gegner {v} LP.", val:true},
  // ---------- Maßnahmen / Tricks ----------
  heal:          {types:["spell"], group:"Maßnahme", label:"LP erhalten",                    text:"Du erhältst {v} LP.", val:true},
  burn:          {types:["spell"], group:"Maßnahme", label:"Gegner verliert LP",             text:"Dein Gegner verliert {v} LP.", val:true},
  draw:          {types:["spell"], group:"Maßnahme", label:"Karten ziehen",                  text:"Ziehe {v} Karte(n).", val:true},
  boost:         {types:["spell"], group:"Maßnahme", label:"ATK verstärken (1)",             text:"Ein eigener Charakter erhält dauerhaft {v} ATK.", val:true},
  boost_all:     {types:["spell"], group:"Maßnahme", label:"ATK verstärken (alle)",          text:"Alle eigenen Charaktere erhalten {v} ATK.", val:true},
  weaken:        {types:["spell"], group:"Maßnahme", label:"Gegner schwächen (1)",           text:"Der stärkste gegnerische Charakter verliert {v} ATK.", val:true},
  weaken_all:    {types:["spell"], group:"Maßnahme", label:"Gegner schwächen (alle)",        text:"Alle gegnerischen Charaktere verlieren {v} ATK.", val:true},
  destroy_best:  {types:["spell"], group:"Maßnahme", label:"Stärksten Gegner ausschalten",   text:"Der gegnerische Charakter mit der höchsten ATK scheidet aus.", val:false},
  destroy_weak:  {types:["spell"], group:"Maßnahme", label:"Schwächsten Gegner ausschalten", text:"Der gegnerische Charakter mit der niedrigsten ATK scheidet aus.", val:false},
  destroy_level: {types:["spell"], group:"Maßnahme", label:"Razzia (bis Stufe X)",           text:"Alle gegnerischen Charaktere bis Stufe {v} scheiden aus.", val:true},
  destroy_st:    {types:["spell"], group:"Maßnahme", label:"Verdeckte Karte entfernen",      text:"Entferne eine verdeckte Maßnahme/Reaktion des Gegners.", val:false},
  destroy_all_st:{types:["spell"], group:"Maßnahme", label:"Alle verdeckten Karten entfernen", text:"Entferne alle verdeckten Karten des Gegners.", val:false},
  destroy_all:   {types:["spell"], group:"Maßnahme", label:"Alle Charaktere ausschalten",    text:"Alle Charaktere auf dem Spielfeld scheiden aus.", val:false},
  bounce:        {types:["spell"], group:"Maßnahme", label:"Gegner vom Feld verweisen",      text:"Der stärkste gegnerische Charakter muss das Feld verlassen (zurück auf die Hand).", val:false},
  steal:         {types:["spell"], group:"Maßnahme", label:"Gegner übernehmen",              text:"Übernimm den schwächsten gegnerischen Charakter.", val:false},
  lock_all:      {types:["spell"], group:"Maßnahme", label:"Alle festhalten",                text:"Gegnerische Charaktere können im nächsten Zug nicht angreifen.", val:false},
  def_mode:      {types:["spell"], group:"Maßnahme", label:"Hände hoch! (alle in VER)",      text:"Alle gegnerischen Charaktere werden offen in Verteidigungsposition gezwungen.", val:false},
  reset_atk:     {types:["spell"], group:"Maßnahme", label:"Lage beruhigen (ATK zurücksetzen)", text:"Alle Charaktere auf dem Feld erhalten ihre ursprüngliche ATK zurück.", val:false},
  discard:       {types:["spell"], group:"Maßnahme", label:"Handkarten abnehmen",            text:"Der Gegner legt {v} zufällige Handkarte(n) ab.", val:true},
  mill:          {types:["spell"], group:"Maßnahme", label:"Deck lichten",                   text:"Der Gegner legt die obersten {v} Karten seines Decks ab.", val:true},
  heal_per_monster:{types:["spell"], group:"Maßnahme", label:"LP je eigenem Charakter",      text:"Du erhältst {v} LP für jeden eigenen Charakter auf dem Feld.", val:true},
  burn_per_monster:{types:["spell"], group:"Maßnahme", label:"Schaden je eigenem Charakter",  text:"Der Gegner verliert {v} LP für jeden deiner Charaktere auf dem Feld.", val:true},
  search_monster:{types:["spell"], group:"Maßnahme", label:"Charakter suchen",               text:"Nimm den stärksten Charakter bis Stufe 4 aus deinem Deck auf die Hand.", val:false},
  search_spell:  {types:["spell"], group:"Maßnahme", label:"Maßnahme suchen",                text:"Nimm eine zufällige Maßnahme aus deinem Deck auf die Hand.", val:false},
  extra_summon:  {types:["spell"], group:"Maßnahme", label:"Zusätzlicher Einsatz",           text:"Du darfst in diesem Zug einen weiteren Charakter ausspielen.", val:false},
  revive:        {types:["spell"], group:"Maßnahme", label:"Zurückholen (Hand)",             text:"Hole deinen stärksten ausgeschiedenen Charakter zurück auf die Hand.", val:false},
  revive_field:  {types:["spell"], group:"Maßnahme", label:"Zurückholen (aufs Feld)",        text:"Dein stärkster ausgeschiedener Charakter kehrt sofort aufs Feld zurück.", val:false},
  scapegoat:     {types:["spell"], group:"Maßnahme", label:"Sündenbock",                     text:"Dein schwächster Charakter scheidet aus – der Gegner verliert LP in Höhe seiner ATK.", val:false},
  fusion:        {types:["spell"], group:"Maßnahme", label:"Fusion",                         text:"Bilde eine Fusion aus Charakteren auf deiner Hand oder deinem Feld.", val:false},
  // ---------- Reaktionen (lösen bei gegnerischem Angriff aus) ----------
  negate:        {types:["trap"], group:"Reaktion", label:"Angriff abwehren",               text:"Wenn der Gegner angreift: Der Angriff wird abgewehrt.", val:false},
  mirror:        {types:["trap"], group:"Reaktion", label:"Angreifer ausschalten",          text:"Wenn der Gegner angreift: Der Angreifer scheidet aus.", val:false},
  counter_burn:  {types:["trap"], group:"Reaktion", label:"Abwehren + Schaden",             text:"Wenn der Gegner angreift: Angriff abwehren, Gegner verliert {v} LP.", val:true},
  trap_weaken:   {types:["trap"], group:"Reaktion", label:"Angreifer schwächen",            text:"Wenn der Gegner angreift: Der Angreifer verliert {v} ATK.", val:true},
  trap_weaken_all:{types:["trap"], group:"Reaktion", label:"Alle Angreifer schwächen",      text:"Wenn der Gegner angreift: Alle gegnerischen Charaktere verlieren {v} ATK.", val:true},
  trap_destroy_all_atk:{types:["trap"], group:"Reaktion", label:"Großzugriff",              text:"Wenn der Gegner angreift: Alle gegnerischen Charaktere in ATK-Position scheiden aus.", val:false},
  trap_bounce:   {types:["trap"], group:"Reaktion", label:"Angreifer zurückschicken",       text:"Wenn der Gegner angreift: Der Angreifer muss zurück auf die Hand.", val:false},
  trap_heal:     {types:["trap"], group:"Reaktion", label:"Abwehren + LP",                  text:"Wenn der Gegner angreift: Angriff abwehren, du erhältst {v} LP.", val:true},
  trap_steal:    {types:["trap"], group:"Reaktion", label:"Angreifer übernehmen",           text:"Wenn der Gegner angreift: Übernimm den Angreifer.", val:false},
  trap_lock:     {types:["trap"], group:"Reaktion", label:"Abwehren + festhalten",          text:"Wenn der Gegner angreift: Angriff abwehren, gegnerische Charaktere können bis zu seinem nächsten Zug nicht angreifen.", val:false},
  trap_draw:     {types:["trap"], group:"Reaktion", label:"Abwehren + ziehen",              text:"Wenn der Gegner angreift: Angriff abwehren, ziehe {v} Karte(n).", val:true},
};
const EMOJIS = ["👮","👮‍♀️","🕵️","🕵️‍♀️","💂","🪖","🚓","🚔","🚨","🐕","🦮","🛡️","🔦","📻","🚦","🏍️","🚁","🦹","🦹‍♀️","🥷","🎭","💰","💎","👜","📦","💊","🔫","🗝️","🧤","🏃","🚗","⛓️","⚖️","📜","🔍","📋","🗂️","🚫","🛑","📸","🔒","🏚️"];

/* ============================ STORY (Standard) ============================ */
const STORY_DEFAULT = {
  polizei: {title:"Akte Phantom", desc:"Du startest als Polizeianwärter(in) und kommst einem geheimnisvollen Drahtzieher auf die Spur.", chapters:[
    {id:"p1", title:"Erster Tag auf Streife", reward:150,
     opp:{name:"Taschendieb Toni", emoji:"👜", lp:3000, maxLevel:3, maxRarity:"N"},
     intro:"PHM Otto|👮|Willkommen auf der Wache, Anwärter! Heute fährst du deine erste Streife mit mir.\nPHM Otto|👮|Funkspruch: Taschendiebstahl am Hauptbahnhof. Blaulicht an!\nTaschendieb Toni|👜|Hä? Bullen?! Mich kriegt ihr nie!",
     outro:"Taschendieb Toni|👜|Okay, okay … ich geb die Geldbörse ja zurück.\nPHM Otto|👮|Saubere Arbeit! Aber Toni hat da was von einem „Phantom“ gemurmelt …"},
    {id:"p2", title:"Der Hehlerladen", reward:200,
     opp:{name:"Hehlerin Rosi", emoji:"📦", lp:4000, maxLevel:4, maxRarity:"N"},
     intro:"KK Mara|🕵️‍♀️|Die Beute von Toni taucht in einem Laden in der Altstadt auf.\nKK Mara|🕵️‍♀️|Wir sehen uns dort mal genauer um – mit Durchsuchungsbeschluss.\nHehlerin Rosi|📦|Alles ehrlich gekauft, Herr Wachtmeister! Wirklich!",
     outro:"Hehlerin Rosi|📦|Na gut … die Ware kam von einem Einbrecher. Sie nennen ihn Kralle.\nKK Mara|🕵️‍♀️|Dann wird die Nachtschicht spannend."},
    {id:"p3", title:"Nachtschicht", reward:200,
     opp:{name:"Einbrecher Kralle", emoji:"🥷", lp:4000, maxLevel:4, maxRarity:"R"},
     intro:"Leitstelle|📻|Stiller Alarm im Juweliergeschäft am Marktplatz!\nPHM Otto|👮|Das ist er. Diensthund Rex, such!\nEinbrecher Kralle|🥷|Ihr seid zu spät – ich bin schon über alle Dächer!",
     outro:"Einbrecher Kralle|🥷|Ich hab nur geliefert! Die Aufträge kommen vom Phantom – per Wegwerfhandy.\nKK Mara|🕵️‍♀️|Dann brauchen wir eine TKÜ. Ich rede mit der Staatsanwaltschaft."},
    {id:"p4", title:"Ärger im Viertel", reward:250,
     opp:{name:"Straßendealer Ede", emoji:"💊", lp:4000, maxLevel:5, maxRarity:"R"},
     intro:"KOB Willi|🏘️|Die Anwohner beschweren sich: Im Park wird gedealt – seit das Phantom da ist.\nStraßendealer Ede|💊|Das ist mein Revier. Verschwindet!",
     outro:"Straßendealer Ede|💊|Der Stoff kommt über Vitos Bande. Mehr sag ich nicht ohne Anwalt!\nPHM Otto|👮|Das reicht uns. Auf zur Bande."},
    {id:"p5", title:"Die Bande von Vito", reward:300,
     opp:{name:"Bandenchef Vito", emoji:"🦹", lp:4500, maxLevel:6, maxRarity:"SR"},
     intro:"KHK Brandt|🕵️|Vitos Bande hat sich in der alten Lagerhalle verschanzt.\nKHK Brandt|🕵️|Die Bereitschaftspolizei sperrt ab. Du gehst mit rein.\nBandenchef Vito|🦹|Hier drin gelten meine Regeln!",
     outro:"Bandenchef Vito|🦹|Ihr seid zu spät … der große Bankjob läuft schon.\nKHK Brandt|🕵️|Alle Kräfte zur Stadtsparkasse!"},
    {id:"p6", title:"Banküberfall!", reward:400,
     opp:{name:"Bankräuber-Duo", emoji:"💰", lp:5000, maxLevel:7, maxRarity:"SR"},
     intro:"Leitstelle|📻|Banküberfall mit Geiselnahme! SEK ist alarmiert.\nVerhandlungsgruppe|📞|Wir halten sie hin. Du sicherst den Hinterausgang.\nBankräuber-Duo|💰|Keiner rührt sich! Der Fluchtwagen steht bereit!",
     outro:"Bankräuber-Duo|💰|Das Phantom hat uns reingelegt! Es wollte nur die Polizei ablenken …\nKHK Brandt|🕵️|Ablenken? Wovon? … Das Präsidium!"},
    {id:"p7", title:"Showdown: Das Phantom", reward:800,
     opp:{name:"Das Phantom", emoji:"🦹‍♀️", lp:6000, maxLevel:12, maxRarity:"UR"},
     intro:"Das Phantom|🦹‍♀️|Bravo, kleine Polizistin, kleiner Polizist. Ihr habt meine Spur gefunden.\nDas Phantom|🦹‍♀️|Aber niemand hat mich je gefasst. Niemand!\nPolizeipräsidentin Dr. Wolf|🎖️|Dann wird es Zeit. Alle Einheiten: Zugriff!",
     outro:"Das Phantom|🦹‍♀️|Unmöglich … gefasst … von einer Streifenkraft …\nPolizeipräsidentin Dr. Wolf|🎖️|Akte Phantom: geschlossen. Gratulation – du hast dir deine Sterne verdient!"},
  ]},
  verbrecher: {title:"Der große Coup", desc:"Du bist neu in der Unterwelt und willst den ganz großen Coup landen – ohne geschnappt zu werden.", chapters:[
    {id:"v1", title:"Kleine Fische", reward:150,
     opp:{name:"Verkehrspolizist Uwe", emoji:"🚦", lp:3000, maxLevel:3, maxRarity:"N"},
     intro:"Hehlerin Rosi|📦|Du willst ins Geschäft? Dann zeig erst mal, dass du schnell bist.\nHehlerin Rosi|📦|Bring den „geliehenen“ Wagen zu mir. Aber Vorsicht – Kontrolle an der Kreuzung!\nVerkehrspolizist Uwe|🚦|Allgemeine Verkehrskontrolle! Führerschein und Fahrzeugpapiere, bitte.",
     outro:"Hehlerin Rosi|📦|Nicht schlecht, Frischling. Vito will dich kennenlernen."},
    {id:"v2", title:"Die Kommissarin", reward:200,
     opp:{name:"Polizeikommissarin Lea", emoji:"👮‍♀️", lp:4000, maxLevel:4, maxRarity:"N"},
     intro:"Bandenchef Vito|🦹|Rosi sagt, du bist gut. Beweis es: Hol die Ware aus dem Schließfach.\nPolizeikommissarin Lea|👮‍♀️|Moment mal – was machen Sie da so spät am Bahnhof?",
     outro:"Bandenchef Vito|🦹|Du bist dabei. Willkommen in der Familie."},
    {id:"v3", title:"Die Hundestaffel", reward:250,
     opp:{name:"Diensthundeführer Krause", emoji:"🦮", lp:4000, maxLevel:4, maxRarity:"R"},
     intro:"Fluchtfahrer Turbo|🏎️|Mist, die Polizei hat das Lager umstellt – mit Hunden!\nDiensthundeführer Krause|🦮|Polizei! Bleiben Sie stehen, oder ich schicke den Hund!",
     outro:"Fluchtfahrer Turbo|🏎️|Rein in den Wagen! Ab durch den Tunnel!"},
    {id:"v4", title:"Der Ermittler", reward:300,
     opp:{name:"KHK Brandt", emoji:"🕵️", lp:4500, maxLevel:5, maxRarity:"R"},
     intro:"KHK Brandt|🕵️|Ich weiß, dass du für Vito arbeitest. Und ich krieg dich.\nTeurer Anwalt|⚖️|Mein Mandant sagt nichts. Gar nichts.",
     outro:"Das Phantom|🦹‍♀️|Beeindruckend. Ich habe einen Auftrag für dich – den größten von allen."},
    {id:"v5", title:"Großeinsatz", reward:400,
     opp:{name:"Einsatzleiter Kühn", emoji:"🎖️", lp:5000, maxLevel:7, maxRarity:"SR"},
     intro:"Das Phantom|🦹‍♀️|Die halbe Stadtpolizei sucht uns. Wir müssen durch die Absperrung.\nEinsatzleiter Kühn|🎖️|Alle Abschnitte: Die Zielperson ist im Sperrbereich. Niemand kommt durch!",
     outro:"Das Phantom|🦹‍♀️|Wir sind durch. Jetzt fehlt nur noch eines: das Präsidium."},
    {id:"v6", title:"Der große Coup", reward:800,
     opp:{name:"Polizeipräsidentin Dr. Wolf", emoji:"🎖️", lp:6000, maxLevel:12, maxRarity:"UR"},
     intro:"Polizeipräsidentin Dr. Wolf|🎖️|Du hast es weit gebracht. Aber hier endet deine Reise.\nDas Phantom|🦹‍♀️|Jetzt oder nie – der große Coup!",
     outro:"Das Phantom|🦹‍♀️|Geschafft! Du bist eine Legende der Unterwelt.\nHehlerin Rosi|📦|Und ich hab immer gesagt, aus dir wird mal was."},
  ]},
};

/* ============================ SPEICHER ============================ */
const Store = {
  get(k,d){try{const v=localStorage.getItem("kd3_"+k);return v?JSON.parse(v):d}catch(e){return d}},
  set(k,v){try{localStorage.setItem("kd3_"+k,JSON.stringify(v));return true}catch(e){toast("Speicher voll! Bitte kleinere Bilder verwenden.");return false}},
};
const uid = () => "c"+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const clone = o => JSON.parse(JSON.stringify(o));
const shuffle = a => { for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]} return a; };

function defaultEffect(type){return isChar({type})?"none":type==="spell"?"heal":"negate"}
function normalizeCard(c){
  const faction = FACTIONS[c.faction]?c.faction:"polizei";
  const roles = ROLES[faction];
  const n = {id:c.id||uid(), name:c.name||"Neue Karte", faction, type:TYPES[c.type]?c.type:"monster", rarity:RARITY[c.rarity]?c.rarity:"N",
    attr:roles[c.attr]?c.attr:Object.keys(roles)[0], level:+c.level||4, atk:+c.atk||0, def:+c.def||0,
    law:LAWS_BY_FACTION[faction].includes(c.law)?c.law:LAWS_BY_FACTION[faction][0], ref:c.ref||"",
    materials:Array.isArray(c.materials)?c.materials.filter(m=>m==="any"||roles[m]).slice(0,3):[],
    starter:!!c.starter, effect:c.effect||"none", val:+c.val||0, text:c.text||"",
    art:Object.assign({emoji:"❓",c1:"#cfe3ff",c2:"#1d4fa8",img:""},c.art||{})};
  if(!EFFECTS[n.effect] || !EFFECTS[n.effect].types.includes(n.type)) n.effect = defaultEffect(n.type);
  if(n.type==="fusion" && n.materials.length<2) n.materials = [Object.keys(roles)[0],"any"];
  n.level = Math.max(1,Math.min(12,n.level)); n.atk=Math.max(0,Math.min(9999,n.atk)); n.def=Math.max(0,Math.min(9999,n.def));
  return n;
}

const DB = {
  cards: [],
  load(){
    let cards = Store.get("cards", null) || [];
    const deleted = new Set(Store.get("deleted", [])), edited = new Set(Store.get("edited", []));
    const idx = new Map(cards.map((c,i)=>[c.id,i]));
    // Standardkarten aus Updates übernehmen – vom Admin bearbeitete oder gelöschte bleiben unangetastet
    START_CARDS.forEach(c=>{ if(deleted.has(c.id)||edited.has(c.id)) return; if(idx.has(c.id)) cards[idx.get(c.id)]=c; else cards.push(c); });
    this.cards = cards.map(normalizeCard); this.save();
  },
  save(){ return Store.set("cards", this.cards); },
  byId(id){ return this.cards.find(c=>c.id===id); },
  ofFaction(f){ return this.cards.filter(c=>c.faction===f); },
};

/* ============================ SPIELER / SAMMLUNG ============================ */
const Player = {
  coins:0, owned:{}, progress:{}, seen:{},
  load(){
    const d = Store.get("player", null);
    if(!d){ this.coins=500; this.owned={}; this.progress={polizei:0,verbrecher:0};
      DB.cards.filter(c=>c.starter).forEach(c=>this.owned[c.id]=2); this.save(); }
    else Object.assign(this, d);
  },
  save(){ Store.set("player",{coins:this.coins,owned:this.owned,progress:this.progress}); UI.coins(); },
  has(id){ return this.owned[id]||0; },
  add(id,n=1){ this.owned[id]=(this.owned[id]||0)+n; },
  earn(n){ this.coins+=n; this.save(); if(n>0) toast(`+🪙${n}`); },
};

/* ============================ KARTEN-HTML ============================ */
function cardText(c){
  if(c.text) return c.text;
  const e = EFFECTS[c.effect]; if(!e) return "";
  if(isChar(c) && c.effect==="none") return c.type==="fusion" ? "Gemeinsam unschlagbar." : c.faction==="polizei" ? "Im Dienst für Recht und Ordnung." : "Polizeibekannt und immer auf der Flucht.";
  return e.text.replace("{v}", c.val);
}
function esc(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))}
function matchFilter(c,t){ if(!t) return true; if(t==="monster") return c.type==="monster"; if(t==="fusion") return c.type==="fusion";
  if(FACTIONS[t]) return c.faction===t; if(RARITY[t.slice(2)]&&t.startsWith("r:")) return c.rarity===t.slice(2); return !isChar(c)&&c.law===t; }
function filterOptions(){ return `<option value="">Alle</option><option value="polizei">👮 Polizei</option><option value="verbrecher">🦹 Verbrecher</option>
  <option value="monster">Charaktere</option><option value="fusion">Fusionen</option><option value="StPO">StPO</option><option value="SOG">SOG</option><option value="Trick">Tricks</option>
  <option value="r:UR">Nur UR</option><option value="r:SR">Nur SR</option>`; }

/* Weiche Trennstellen an typischen Wortfugen, damit lange Wörter sauber umbrechen */
const FUGEN=["haupt","kommissar","direktor","präsident","feststellung","dienst","fahnd","staffel","führer","schrauber","gruppe","einheit","beamt","anwärter",
  "meister","streife","polizei","kontroll","überwach","ermittl","fahrzeug","kommando","schütze","entschärfer","händler","betrüger","räuber","knacker",
  "kletter","schwindler","forensik","analytik","zeichner","spür","hund","schaft","kriminal","verkehr","einsatz","behandlung","aufnahme","besprechung",
  "nahme","verweis","verbot","ansprache","auflage","sicherung","fahndung","sperre","koch","baron","händlerin","gelder","presser","wäscher","schieber","fälscher","leiter"];
const FUGEN_RE=new RegExp("(?<=\\p{L}{3})("+FUGEN.join("|")+")","giu");
function hyph(name){ return name.split(" ").map(w=>w.length>=11?w.replace(FUGEN_RE,"\u00AD$1"):w).join(" "); }
/* Startwert für die Namensgröße – die genaue Anpassung macht fitNames() nach dem Anzeigen */
function nameFit(name){
  const L=name.length;
  if(L<=15) return {fs:1,two:false};
  if(L<=19) return {fs:+(15/L).toFixed(3),two:false};
  return {fs:.8,two:true};
}
/* Misst jeden Kartennamen und verkleinert ihn, bis er vollständig ins Namensfeld passt
   (erst einzeilig bis 72 %, sonst zweizeilig). Läuft automatisch für alle neu angezeigten Karten. */
function fitNames(root){
  (root||document).querySelectorAll(".card .nmt").forEach(t=>{
    const nm=t.parentElement, w=nm.clientWidth; if(!w) return;            // unsichtbar – später erneut
    if(t.dataset.fitw==w) return; t.dataset.fitw=w;
    const fits=()=>{ const lh=parseFloat(getComputedStyle(t).lineHeight)||1; const lines=Math.round(t.scrollHeight/lh);
      return t.scrollWidth<=t.clientWidth+1 && lines<=(nm.classList.contains("two")?2:1); };
    nm.classList.remove("two"); let fs=1; t.style.fontSize=fs+"em";
    while(!fits() && fs>.72){ fs-=.04; t.style.fontSize=fs+"em"; }
    if(!fits()){ nm.classList.add("two"); fs=.86; t.style.fontSize=fs+"em";
      while(!fits() && fs>.4){ fs-=.04; t.style.fontSize=fs+"em"; } }
  });
}
let _fitQueued=false;
const fitSoon=()=>{ if(_fitQueued) return; _fitQueued=true; requestAnimationFrame(()=>{ _fitQueued=false; fitNames(); }); };
new MutationObserver(fitSoon).observe(document.body,{childList:true,subtree:true});
window.addEventListener("resize",()=>{ document.querySelectorAll(".card .nmt").forEach(t=>delete t.dataset.fitw); fitSoon(); });
/* live = Feldzustand (z. B. veränderte ATK) */
function cardHTML(c, extra="", attrs="", live){
  const isM = isChar(c);
  const stars = isM ? "★".repeat(Math.min(c.level,12)) : "";
  const icon = isM ? ROLES[c.faction][c.attr][1] : LAWS[c.law][2];
  const art = c.art.img ? `<img src="${c.art.img}" alt="">` : esc(c.art.emoji||"❓");
  const atk = live ? live.atk : c.atk;
  const atkStyle = live && live.atk!==c.atk ? ` style="color:${live.atk>c.atk?"#0a7a2f":"#c00"}"` : '';
  const typeLine = isM ? `[${c.type==="fusion"?"Fusion/":""}${FACTIONS[c.faction][0]}/${ROLES[c.faction][c.attr][0]}]` : `[${c.law}-${TYPES[c.type]}${c.ref&&c.ref!==c.law?" · "+esc(c.ref):""}]`;
  const mat = c.type==="fusion" ? `<span class="mat">${c.materials.map(m=>roleName(c.faction,m)).join(" + ")}:</span> ` : "";
  const frame = isM ? "f-"+c.faction : "l-"+c.law;
  const nf = nameFit(c.name);
  return `<div class="card ${c.type} ${frame} ${c.rarity} ${extra}" ${attrs}>
    <div class="nm ${nf.two?"two":""}"><span class="nmt" style="font-size:${nf.fs}em">${esc(hyph(c.name))}</span><span class="at">${icon}</span></div>
    <div class="lv">${isM?stars:`<span class="lawtag">${c.law}${c.type==="trap"?" · Reaktion":""}</span>`}</div>
    <div class="art" style="--c1:${c.art.c1};--c2:${c.art.c2}">${art}<span class="rar">${c.rarity}</span></div>
    <div class="tx"><b>${typeLine}</b> ${mat}${esc(cardText(c))}</div>
    ${isM?`<div class="st"><span${atkStyle}>ATK ${atk}</span><span>DEF ${c.def}</span></div>`:`<div class="st"></div>`}
  </div>`;
}

/* ============================ UI ============================ */
function toast(msg){const t=document.getElementById("toast");t.textContent=msg;t.classList.add("show");clearTimeout(t._h);t._h=setTimeout(()=>t.classList.remove("show"),2200)}
function banner(msg){const b=document.getElementById("banner");b.textContent=msg;b.classList.remove("show");void b.offsetWidth;b.classList.add("show")}
const $ = id => document.getElementById(id);

const UI = {
  current:"home",
  show(id){
    document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
    $(id).classList.add("active"); this.current=id; window.scrollTo(0,0); this.coins(); fitSoon();
    if(id==="collection") this.renderCollection();
    if(id==="admin") Admin.tab(Admin.curTab);
    if(id==="deck") Deck.render();
    if(id==="shop") Shop.render();
    if(id==="story") Story.render();
  },
  coins(){ ["homeCoins","shopCoins","openCoins"].forEach(i=>{const e=$(i); if(e) e.textContent="🪙 "+Player.coins}); },
  back(){ // Android-Zurück-Taste
    if($("reveal").classList.contains("show")){return true}
    if($("scene").classList.contains("show")){Scene.finish();return true}
    if($("modal").classList.contains("show")){this.closeModal();return true}
    if(this.current==="editor"){Admin.cancel();return true}
    if(this.current==="storyEditor"){StoryEd.back();return true}
    if(this.current==="duel"){Duel.quit();return true}
    if(this.current==="opening"){this.show("shop");return true}
    if(this.current!=="home"){this.show("home");return true}
    return false;
  },
  modal(card, actions, live, onClose, closeLabel){
    $("modalCard").innerHTML = card ? (card==="back" ? `<div class="cardback" style="--w:min(62vw,40vh,260px)"></div>` : cardHTML(card,"","",live)) : "";
    const a = $("modalActs"); a.innerHTML="";
    (actions||[]).forEach(([label,fn,cls])=>{const b=document.createElement("button");b.textContent=label;b.className=cls||"";b.onclick=()=>{this._onClose=null;this.closeModal();fn&&fn()};a.appendChild(b)});
    const x=document.createElement("button");x.textContent=closeLabel||"Schließen";x.className="ghost";x.onclick=()=>this.closeModal();a.appendChild(x);
    this._onClose=onClose||null;
    $("modal").classList.add("show");
  },
  /* Eigener Dialog statt prompt/confirm. Promise: true/false bzw. Text/null */
  ask(text, input){
    return new Promise(res=>{
      $("modalCard").innerHTML=`<div class="panel" style="background:var(--paper);color:var(--ink);font-weight:700;font-size:18px;text-align:center;width:min(300px,85vw);margin:0">${esc(text)}${input?`<input id="askIn" type="${input}" style="margin-top:12px">`:""}</div>`;
      const a=$("modalActs"); a.innerHTML="";
      const ok=document.createElement("button"); ok.textContent="OK"; ok.className="green";
      ok.onclick=()=>{const v=input?$("askIn").value:true; this._onClose=null; this.closeModal(); res(v)};
      const no=document.createElement("button"); no.textContent="Abbrechen"; no.className="ghost"; no.onclick=()=>this.closeModal();
      a.append(ok,no); this._onClose=()=>res(input?null:false);
      $("modal").classList.add("show"); if(input) setTimeout(()=>$("askIn").focus(),50);
    });
  },
  closeModal(){$("modal").classList.remove("show"); const f=this._onClose; this._onClose=null; f&&f();},
  renderCollection(){
    const q=$("colSearch").value.toLowerCase(), t=$("colType").value, o=$("colOwned").value;
    const list=DB.cards.filter(c=>matchFilter(c,t)&&c.name.toLowerCase().includes(q)&&(!o||(o==="own"?Player.has(c.id):!Player.has(c.id))));
    const ownedCount=DB.cards.filter(c=>Player.has(c.id)).length;
    $("colCount").textContent=`${ownedCount}/${DB.cards.length}`;
    $("colList").innerHTML = list.map(c=>{const n=Player.has(c.id);
      return `<div class="ownwrap">${n?`<span class="cnt">×${n}</span>`:""}${cardHTML(c,n?"":"owned0",`data-id="${c.id}"`)}</div>`}).join("") || `<p class="muted">Keine Karten gefunden.</p>`;
    $("colList").querySelectorAll(".card").forEach(el=>el.onclick=()=>this.modal(DB.byId(el.dataset.id)));
  },
  async openAdmin(){
    const pin = Store.get("pin","1234");
    const input = await this.ask("Admin-PIN eingeben (Standard: 1234)","password");
    if(input===null) return;
    if(input===pin) this.show("admin"); else toast("Falsche PIN!");
  },
  pickSide(title, cb){
    $("modalCard").innerHTML=`<h2 style="color:var(--yellow);text-align:center;font-size:30px;-webkit-text-stroke:1px var(--ink);text-shadow:3px 3px 0 var(--ink)">${esc(title)}</h2>`;
    const a=$("modalActs"); a.innerHTML=`<div class="side-pick">${Object.keys(FACTIONS).map(f=>`<button class="${f==="polizei"?"blue":"red"}" data-f="${f}"><span>${FACTIONS[f][1]}</span>${FACTIONS[f][0]}</button>`).join("")}</div>`;
    a.querySelectorAll("[data-f]").forEach(b=>b.onclick=()=>{this._onClose=null;this.closeModal();cb(b.dataset.f)});
    const x=document.createElement("button");x.textContent="Abbrechen";x.className="ghost";x.onclick=()=>this.closeModal();a.appendChild(x);
    this._onClose=null; $("modal").classList.add("show");
  },
  startDuel(){
    this.pickSide("Wähle deine Seite", side=>{
      Duel.start(side,{ oppDeck:Deck.genDeck(OTHER[side],{maxLevel:12,maxRarity:"SR"}),
        onEnd:win=>{ Player.earn(win?100:25); return Promise.resolve(); } });
    });
  },
};

/* ============================ ADMIN ============================ */
const Admin = {
  draft:null, isNew:false, curTab:"cards",
  tab(t){
    this.curTab=t;
    $("admTabs").querySelectorAll("span").forEach(s=>s.classList.toggle("on",s.dataset.t===t));
    $("admCards").style.display=t==="cards"?"":"none"; $("admStory").style.display=t==="story"?"":"none"; $("admPlayer").style.display=t==="player"?"":"none";
    $("admNew").style.display=t==="cards"?"":"none";
    if(t==="cards") this.renderList(); if(t==="story") StoryEd.renderList(); if(t==="player") this.renderPlayer();
  },
  renderList(){
    const q=$("admSearch").value.toLowerCase(), t=$("admType").value;
    const list=DB.cards.filter(c=>matchFilter(c,t)&&c.name.toLowerCase().includes(q));
    $("admCount").textContent=`${list.length} von ${DB.cards.length} Karten`;
    $("admList").innerHTML = list.map(c=>cardHTML(c,"",`data-id="${c.id}"`)).join("") || `<p class="muted">Keine Karten.</p>`;
    $("admList").querySelectorAll(".card").forEach(el=>el.onclick=()=>this.edit(el.dataset.id));
  },
  renderPlayer(){
    const owned=DB.cards.filter(c=>Player.has(c.id)).length;
    $("admVersion").textContent=`Version ${window.APP_VERSION||"dev"} · ${window.AndroidBridge?"Android-App":"Web-App"}`;
    $("admPlayerInfo").textContent=`Münzen: ${Player.coins} · Sammlung: ${owned}/${DB.cards.length} Karten · Story: Polizei ${Player.progress.polizei||0}/${Story.data.polizei.chapters.length}, Verbrecher ${Player.progress.verbrecher||0}/${Story.data.verbrecher.chapters.length}`;
  },
  checkUpdate(){
    if(window.AndroidBridge && AndroidBridge.checkUpdate){ AndroidBridge.checkUpdate(); return; }
    toast("Die Web-Version aktualisiert sich automatisch beim Neuladen.");
    fetch("../version.json",{cache:"no-store"}).then(r=>r.json()).then(v=>toast(v.versionName===window.APP_VERSION?"Du hast die neueste Version ("+v.versionName+")":"Neue Version "+v.versionName+" – Seite neu laden")).catch(()=>{});
  },
  addCoins(n){ Player.coins+=n; Player.save(); this.renderPlayer(); toast(`+🪙${n}`); },
  async unlockAll(){ if(!await UI.ask("Alle Karten 3× in die Sammlung legen?")) return; DB.cards.forEach(c=>Player.owned[c.id]=Math.max(3,Player.has(c.id))); Player.save(); this.renderPlayer(); toast("Alles freigeschaltet"); },
  async resetCollection(){ if(!await UI.ask("Sammlung auf das Startset zurücksetzen?")) return;
    Player.owned={}; DB.cards.filter(c=>c.starter).forEach(c=>Player.owned[c.id]=2); Player.save(); Deck.prune(); this.renderPlayer(); toast("Sammlung zurückgesetzt"); },
  async resetStory(){ if(!await UI.ask("Story-Fortschritt zurücksetzen?")) return; Player.progress={polizei:0,verbrecher:0}; Player.save(); this.renderPlayer(); },
  newCard(){ this.open(normalizeCard({name:"Neue Karte",faction:"polizei",type:"monster",level:4,atk:1500,def:1000,art:{emoji:"👮",c1:"#cfe3ff",c2:"#1d4fa8"}}), true); },
  edit(id){ this.open(clone(DB.byId(id)), false); },
  open(card,isNew){
    this.draft=card; this.isNew=isNew;
    $("edTitle").textContent = isNew?"Neue Karte":"Bearbeiten";
    $("btnDel").style.display = $("btnDup").style.display = isNew?"none":"";
    $("f_name").value=card.name; $("f_level").value=card.level; $("f_atk").value=card.atk; $("f_def").value=card.def;
    $("f_effval").value=card.val; $("f_ref").value=card.ref; $("f_text").value=card.text; $("f_emoji").value=card.art.emoji; $("f_c1").value=card.art.c1; $("f_c2").value=card.art.c2;
    $("emojiPick").innerHTML = EMOJIS.map(e=>`<span>${e}</span>`).join("");
    $("emojiPick").querySelectorAll("span").forEach(s=>s.onclick=()=>{$("f_emoji").value=s.textContent;this.draft.art.img="";this.sync()});
    this.renderChips(); this.fillEffects(); this.fillMaterials(); this.sync(); UI.show("editor");
  },
  renderChips(){
    const d=this.draft;
    const mk=(el,obj,key,fmt)=>{ $(el).innerHTML=Object.keys(obj).map(k=>`<span data-k="${k}" class="${d[key]===k?"on":""}">${fmt(k)}</span>`).join("");
      $(el).querySelectorAll("span").forEach(s=>s.onclick=()=>{d[key]=s.dataset.k;
        if(key==="type"){ if(!EFFECTS[d.effect].types.includes(d.type)) d.effect=defaultEffect(d.type); this.fillEffects(); if(d.type==="fusion"&&d.materials.length<2) d.materials=[d.attr,"any"]; }
        if(key==="faction"){ d.attr=Object.keys(ROLES[d.faction])[0]; d.law=LAWS_BY_FACTION[d.faction][0]; d.materials=[d.attr,"any"]; }
        if(key==="faction"||(key==="law"&&(!d.ref||LAWS[d.ref]))){ d.ref=d.law==="Trick"?"":d.law; $("f_ref").value=d.ref; }
        this.fillMaterials(); this.renderChips(); this.sync()}); };
    mk("f_faction",FACTIONS,"faction",k=>FACTIONS[k][1]+" "+FACTIONS[k][0]);
    mk("f_type",TYPES,"type",k=>TYPES[k]);
    mk("f_rarity",RARITY,"rarity",k=>k+" · "+RARITY[k]);
    mk("f_attr",ROLES[d.faction],"attr",k=>ROLES[d.faction][k][1]+" "+ROLES[d.faction][k][0]);
    const laws={}; LAWS_BY_FACTION[d.faction].forEach(k=>laws[k]=LAWS[k]);
    mk("f_law",laws,"law",k=>LAWS[k][2]+" "+LAWS[k][0]+" – "+LAWS[k][1]);
    $("monsterFields").style.display = isChar(d)?"":"none";
    $("fusionFields").style.display = d.type==="fusion"?"":"none";
    $("levelHint").style.display = d.type==="monster"?"":"none";
    $("lawFields").style.display = isChar(d)?"none":"";
  },
  fillEffects(){
    const d=this.draft;
    const groups={}; Object.entries(EFFECTS).filter(([k,e])=>e.types.includes(d.type)).forEach(([k,e])=>{(groups[e.group]=groups[e.group]||[]).push(`<option value="${k}">${e.label}</option>`)});
    $("f_effect").innerHTML = Object.entries(groups).map(([g,o])=>`<optgroup label="${g}">${o.join("")}</optgroup>`).join("");
    $("f_effect").value=d.effect;
  },
  fillMaterials(){
    const d=this.draft, opts=`<option value="">—</option><option value="any">beliebig</option>`+Object.keys(ROLES[d.faction]).map(k=>`<option value="${k}">${ROLES[d.faction][k][0]}</option>`).join("");
    ["f_m1","f_m2","f_m3"].forEach((id,i)=>{ $(id).innerHTML=opts; $(id).value=d.materials[i]||""; });
  },
  sync(){
    const d=this.draft;
    d.name=$("f_name").value.trim()||"Ohne Namen";
    d.level=Math.max(1,Math.min(12,+$("f_level").value||1));
    d.atk=Math.max(0,Math.min(9999,+$("f_atk").value||0));
    d.def=Math.max(0,Math.min(9999,+$("f_def").value||0));
    d.effect=$("f_effect").value; d.val=Math.max(0,+$("f_effval").value||0); d.text=$("f_text").value.trim(); d.ref=$("f_ref").value.trim();
    d.art.emoji=$("f_emoji").value||"❓"; d.art.c1=$("f_c1").value; d.art.c2=$("f_c2").value;
    if(d.type==="fusion") d.materials=["f_m1","f_m2","f_m3"].map(i=>$(i).value).filter(Boolean);
    $("effValWrap").style.display = EFFECTS[d.effect]&&EFFECTS[d.effect].val ? "" : "none";
    $("edPreview").innerHTML = cardHTML(d);
  },
  loadImage(input){
    const f=input.files[0]; if(!f) return;
    const r=new FileReader();
    r.onload=e=>{ const img=new Image(); img.onload=()=>{
        const max=320, s=Math.min(1,max/Math.max(img.width,img.height));   // verkleinern, damit viele Karten passen
        const cv=document.createElement("canvas"); cv.width=Math.round(img.width*s); cv.height=Math.round(img.height*s);
        cv.getContext("2d").drawImage(img,0,0,cv.width,cv.height);
        this.draft.art.img=cv.toDataURL("image/jpeg",0.75); this.sync(); };
      img.src=e.target.result; };
    r.readAsDataURL(f); input.value="";
  },
  clearImage(){ this.draft.art.img=""; this.sync(); },
  save(){
    this.sync();
    if(this.draft.type==="fusion"&&this.draft.materials.length<2) return toast("Eine Fusion braucht mindestens 2 Materialien");
    const d=normalizeCard(this.draft);
    const i=DB.cards.findIndex(c=>c.id===d.id);
    if(START_CARDS.some(c=>c.id===d.id)){ const ed=Store.get("edited",[]); if(!ed.includes(d.id)){ ed.push(d.id); Store.set("edited",ed); } }
    if(i>=0) DB.cards[i]=d; else { DB.cards.push(d); if(!Player.has(d.id)) Player.add(d.id,3); Player.save(); }
    if(DB.save()){ toast("Gespeichert: "+d.name); UI.show("admin"); }
  },
  duplicate(){ this.sync(); const c=clone(this.draft); c.id=uid(); c.starter=false; c.name=(c.name+" II").slice(0,40); this.open(c,true); },
  async remove(){
    if(!await UI.ask(`„${this.draft.name}“ wirklich löschen?`)) return;
    const id=this.draft.id;
    DB.cards=DB.cards.filter(c=>c.id!==id); DB.save();
    if(START_CARDS.some(c=>c.id===id)){ const del=Store.get("deleted",[]); del.push(id); Store.set("deleted",del); }
    delete Player.owned[id]; Player.save(); Deck.prune();
    toast("Gelöscht"); UI.show("admin");
  },
  cancel(){ UI.show("admin"); },
  exportJSON(){
    const data=JSON.stringify({version:3,cards:DB.cards,story:Story.data},null,1);
    if(window.AndroidBridge && AndroidBridge.saveFile){ AndroidBridge.saveFile("einsatz-duell.json", data); return; }
    const a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([data],{type:"application/json"})); a.download="einsatz-duell.json"; a.click();
  },
  importJSON(input){
    const f=input.files[0]; if(!f) return;
    f.text().then(async t=>{ const j=JSON.parse(t); const arr=(j.cards||j).map(normalizeCard);
      if(!await UI.ask(`${arr.length} Karten${j.story?" und Story":""} importieren? (Gleiche IDs werden ersetzt)`)) return;
      arr.forEach(c=>{const i=DB.cards.findIndex(x=>x.id===c.id); if(i>=0)DB.cards[i]=c; else {DB.cards.push(c); if(!Player.has(c.id)) Player.add(c.id,3);} });
      if(j.story&&j.story.polizei&&j.story.verbrecher){ Story.data=j.story; Story.save(); }
      DB.save(); Player.save(); this.renderList(); toast("Import fertig"); }).catch(()=>toast("Datei ungültig"));
    input.value="";
  },
  async changePin(){ const p=await UI.ask("Neue Admin-PIN (mind. 4 Zeichen)","password"); if(p&&p.length>=4){Store.set("pin",p);toast("PIN geändert")} else if(p!==null) toast("Zu kurz"); },
  async resetAll(){ if(!await UI.ask("Alle Karten auf die Standardkarten zurücksetzen? Eigene Karten gehen verloren!")) return;
    DB.cards=START_CARDS.map(normalizeCard); DB.save(); Store.set("deleted",[]); Store.set("edited",[]); Deck.prune(); this.renderList(); toast("Zurückgesetzt"); },
};

/* ============================ STORY-EDITOR ============================ */
const StoryEd = {
  camp:"polizei", idx:-1,
  renderList(){
    const D=Story.data;
    $("admStory").innerHTML = Object.keys(FACTIONS).map(f=>`
      <div class="panel"><h3 style="color:var(--yellow)">${FACTIONS[f][1]} ${FACTIONS[f][0]}-Kampagne</h3>
        <label>Titel</label><input data-ct="${f}" value="${esc(D[f].title)}" maxlength="40">
        <label>Beschreibung</label><textarea data-cd="${f}" rows="2" maxlength="200">${esc(D[f].desc)}</textarea>
        <div style="margin-top:10px">${D[f].chapters.map((c,i)=>`<div class="story-row"><b style="font-family:var(--comic)">${i+1}.</b><span>${esc(c.opp.emoji)} ${esc(c.title)}</span>
          <button class="small ghost" data-up="${f}:${i}">▲</button><button class="small blue" data-ed="${f}:${i}">✎</button></div>`).join("")}</div>
        <button class="small green" data-add="${f}">＋ Kapitel</button>
      </div>`).join("") + `<div class="row"><button class="small green" onclick="StoryEd.saveMeta()">💾 Titel speichern</button><button class="small red" onclick="StoryEd.reset()">♻ Standard-Story</button></div>`;
    $("admStory").querySelectorAll("[data-ed]").forEach(b=>b.onclick=()=>{const [f,i]=b.dataset.ed.split(":");this.open(f,+i)});
    $("admStory").querySelectorAll("[data-add]").forEach(b=>b.onclick=()=>{const f=b.dataset.add, n=Story.data[f].chapters.length+1;
      Story.data[f].chapters.push({id:f[0]+uid(),title:"Neues Kapitel",reward:200,opp:{name:"Gegner",emoji:FACTIONS[OTHER[f]][1],lp:4000,maxLevel:4+Math.min(n,8),maxRarity:"R"},intro:"Erzähler|📖|Hier beginnt ein neues Kapitel.",outro:"Erzähler|📖|Geschafft!"});
      Story.save(); this.open(f,Story.data[f].chapters.length-1);});
    $("admStory").querySelectorAll("[data-up]").forEach(b=>b.onclick=()=>{const [f,i]=b.dataset.up.split(":"), a=Story.data[f].chapters; const k=+i; if(k>0){[a[k-1],a[k]]=[a[k],a[k-1]];Story.save();this.renderList()}});
  },
  saveMeta(){ Object.keys(FACTIONS).forEach(f=>{ Story.data[f].title=document.querySelector(`[data-ct="${f}"]`).value.trim()||Story.data[f].title; Story.data[f].desc=document.querySelector(`[data-cd="${f}"]`).value.trim(); }); Story.save(); toast("Gespeichert"); },
  async reset(){ if(!await UI.ask("Story auf den Standard zurücksetzen? Eigene Kapitel gehen verloren.")) return; Story.data=clone(STORY_DEFAULT); Story.save(); this.renderList(); },
  open(f,i){
    this.camp=f; this.idx=i; const c=Story.data[f].chapters[i];
    $("s_title").value=c.title; $("s_intro").value=c.intro; $("s_outro").value=c.outro; $("s_oname").value=c.opp.name; $("s_oemoji").value=c.opp.emoji;
    $("s_lp").value=c.opp.lp; $("s_maxlv").value=c.opp.maxLevel; $("s_maxr").value=c.opp.maxRarity; $("s_reward").value=c.reward;
    UI.show("storyEditor");
  },
  save(){
    const c=Story.data[this.camp].chapters[this.idx];
    c.title=$("s_title").value.trim()||"Kapitel"; c.intro=$("s_intro").value; c.outro=$("s_outro").value;
    c.opp={name:$("s_oname").value.trim()||"Gegner", emoji:$("s_oemoji").value||"❓", lp:Math.max(500,+$("s_lp").value||4000),
      maxLevel:Math.max(1,Math.min(12,+$("s_maxlv").value||12)), maxRarity:$("s_maxr").value};
    c.reward=Math.max(0,+$("s_reward").value||0);
    Story.save(); toast("Kapitel gespeichert"); this.back();
  },
  async remove(){ if(!await UI.ask("Kapitel löschen?")) return; Story.data[this.camp].chapters.splice(this.idx,1); Story.save(); this.back(); },
  back(){ UI.show("admin"); Admin.tab("story"); },
};

/* ============================ DECK ============================ */
const Deck = {
  MIN:20, MAX:40, COPIES:3, FUSION_MAX:15, lists:{polizei:[],verbrecher:[]}, faction:"polizei",
  get list(){ return this.lists[this.faction]; },
  set list(v){ this.lists[this.faction]=v; },
  load(){ const l=Store.get("decks",{}); Object.keys(FACTIONS).forEach(f=>this.lists[f]=l[f]||[]); this.prune(); },
  save(){ Store.set("decks",this.lists); },
  /* Karten entfernen, die gelöscht, falsch zugeordnet oder nicht (mehr) im Besitz sind */
  prune(){
    Object.keys(FACTIONS).forEach(f=>{ const cnt={};
      this.lists[f]=this.lists[f].filter(id=>{const c=DB.byId(id); if(!c||c.faction!==f||c.type==="fusion") return false;
        cnt[id]=(cnt[id]||0)+1; return cnt[id]<=Math.min(this.COPIES,Player.has(id)); }); });
    this.save();
  },
  limit(id){ return Math.min(this.COPIES, Player.has(id)); },
  count(id){ return this.list.filter(x=>x===id).length; },
  add(id){ if(this.list.length>=this.MAX) return toast("Deck ist voll (40)"); if(this.count(id)>=this.limit(id)) return toast(Player.has(id)<3?"Du besitzt nicht mehr Kopien":"Max. 3 Kopien"); this.list.push(id); this.save(); this.render(); },
  sub(id){ const i=this.list.indexOf(id); if(i>=0){this.list.splice(i,1);this.save();this.render()} },
  clear(){ this.list=[]; this.save(); this.render(); },
  auto(){ this.list=this.autoOwned(this.faction); this.save(); this.render(); toast("Deck automatisch gebaut"); },
  /* Bestes Deck aus der eigenen Sammlung */
  autoOwned(f){
    const pool=[]; DB.ofFaction(f).filter(c=>c.type!=="fusion").forEach(c=>{ for(let i=0;i<this.limit(c.id);i++) pool.push(c); });
    const score=c=> isChar(c) ? c.atk+c.def/4+(c.effect!=="none"?300:0) : 1500+RANK[c.rarity]*300;
    const by=(arr)=>arr.sort((a,b)=>score(b)-score(a));
    const low=by(pool.filter(c=>c.type==="monster"&&c.level<=4)), mid=by(pool.filter(c=>c.type==="monster"&&c.level>=5&&c.level<=6)), high=by(pool.filter(c=>c.type==="monster"&&c.level>=7));
    const hasFus=this.fusionDeck(f).length>0;
    const acts=by(pool.filter(c=>!isChar(c)&&(hasFus||c.effect!=="fusion")));
    // Mischung: 13 niedrige, 3 mittlere, 2 hohe Charaktere, 12 Maßnahmen/Reaktionen
    const out=[...low.slice(0,13), ...mid.slice(0,3), ...high.slice(0,2), ...acts.slice(0,12)];
    const rest=[...low.slice(13), ...acts.slice(12), ...mid.slice(3)];
    while(out.length<30 && rest.length) out.push(rest.shift());
    return out.slice(0,30).map(c=>c.id);
  },
  /* Fusionsdeck: alle besessenen Fusionen dieser Partei (max. 15) */
  fusionDeck(f){ const out=[]; DB.ofFaction(f).filter(c=>c.type==="fusion").forEach(c=>{for(let i=0;i<this.limit(c.id);i++) out.push(c.id)}); return out.slice(0,this.FUSION_MAX); },
  /* Deck für KI-Gegner aus allen Karten der Partei */
  genDeck(f,{maxLevel=12,maxRarity="UR",size=30}={}){
    const ok=c=>RANK[c.rarity]<=RANK[maxRarity] && (!isChar(c)||c.level<=maxLevel);
    const cards=DB.ofFaction(f).filter(ok);
    const fus=cards.filter(c=>c.type==="fusion"), chars=cards.filter(c=>c.type==="monster"), acts=cards.filter(c=>!isChar(c)&&(fus.length||c.effect!=="fusion"));
    const out=[], pick=(pool,n)=>{ let g=0; while(n>0&&pool.length&&g++<4000){const c=pool[Math.floor(Math.random()*pool.length)]; if(out.filter(x=>x===c.id).length<this.COPIES){out.push(c.id);n--}} };
    pick(chars,Math.round(size*.6)); pick(acts,size-out.length); pick(chars,size-out.length);
    return {main:out, extra:shuffle(fus.map(c=>c.id)).slice(0,8)};
  },
  validFor(f){ const l=this.lists[f]; return l.length>=this.MIN && l.length<=this.MAX; },
  valid(){ return this.validFor(this.faction); },
  render(){
    $("deckFaction").innerHTML=Object.keys(FACTIONS).map(f=>`<span data-f="${f}" class="${f===this.faction?"on":""}">${FACTIONS[f][1]} ${FACTIONS[f][0]} (${this.lists[f].length})</span>`).join("");
    $("deckFaction").querySelectorAll("span").forEach(s=>s.onclick=()=>{this.faction=s.dataset.f;this.render()});
    $("deckCount").textContent=`${this.list.length}/${this.MAX}`;
    $("deckCount").style.color = this.valid()?"var(--green)":"var(--red)";
    const fd=this.fusionDeck(this.faction);
    $("deckInfo").textContent=`20–40 Karten, max. 3 Kopien (nur so viele, wie du besitzt). Fusionsdeck: ${fd.length} Fusion(en) – wird automatisch aus deiner Sammlung gefüllt.`;
    const q=$("deckSearch").value.toLowerCase(), f=$("deckFilter").value;
    let list;
    if(f==="fusion") list=DB.ofFaction(this.faction).filter(c=>c.type==="fusion"&&Player.has(c.id));
    else list=DB.ofFaction(this.faction).filter(c=>c.type!=="fusion"&&Player.has(c.id)&&c.name.toLowerCase().includes(q)&&(!f||this.count(c.id)>0));
    $("deckList").innerHTML=list.map(c=>{const n=this.count(c.id);
      if(c.type==="fusion") return `<div class="deckitem"><span class="cnt" style="background:var(--purple)">${Math.min(3,Player.has(c.id))}</span>${cardHTML(c,"",`data-id="${c.id}"`)}</div>`;
      return `<div class="deckitem">${n?`<span class="cnt">${n}</span>`:""}${cardHTML(c,"",`data-id="${c.id}"`)}
      <div class="ctrl"><button class="red" data-sub="${c.id}">−</button><span class="muted" style="align-self:center">/${this.limit(c.id)}</span><button class="green" data-add="${c.id}">＋</button></div></div>`}).join("")
      || `<p class="muted">${f==="fusion"?"Noch keine Fusionen – im Shop gibt es welche!":"Keine passenden Karten in deiner Sammlung."}</p>`;
    $("deckList").querySelectorAll("[data-add]").forEach(b=>b.onclick=()=>this.add(b.dataset.add));
    $("deckList").querySelectorAll("[data-sub]").forEach(b=>b.onclick=()=>this.sub(b.dataset.sub));
    $("deckList").querySelectorAll(".card").forEach(el=>el.onclick=()=>UI.modal(DB.byId(el.dataset.id)));
  },
};

/* ============================ SHOP / BOOSTER ============================ */
const PACKS = [
  {id:"pol",  name:"Streifen-Booster",   icon:"🚓", faction:"polizei",    price:100, size:5, p1:"#3fa9ff", p2:"#173f8a", desc:"5 Polizei-Karten: Charaktere, StPO & SOG"},
  {id:"ver",  name:"Unterwelt-Booster",  icon:"🦹", faction:"verbrecher", price:100, size:5, p1:"#ff5a5a", p2:"#3a0a0a", desc:"5 Verbrecher-Karten: Charaktere & Tricks"},
  {id:"mix",  name:"Großeinsatz-Booster",icon:"🚨", faction:null,         price:150, size:7, p1:"#ffd23f", p2:"#c2410c", desc:"7 Karten beider Parteien"},
  {id:"fus",  name:"Fusions-Akte",       icon:"🧩", faction:null,         price:300, size:4, fusion:true, p1:"#a463ff", p2:"#2c0a57", desc:"1 garantierte Fusion + 3 Karten (R oder besser)"},
  {id:"prem", name:"Ermittlerakte Gold", icon:"🏅", faction:null,         price:450, size:5, premium:true, p1:"#ffe28a", p2:"#7a5a00", desc:"5 Karten, mindestens 1× SR oder UR"},
];
const Shop = {
  last:null, pulled:[], revealed:[],
  render(){
    $("shopPacks").innerHTML=PACKS.map(p=>`<div class="pack" style="--p1:${p.p1};--p2:${p.p2}"><div class="pi">${p.icon}</div><h3>${p.name}</h3><p>${p.desc}</p>
      <button class="${Player.coins>=p.price?"":"ghost"}" data-p="${p.id}">🪙 ${p.price}</button></div>`).join("");
    $("shopPacks").querySelectorAll("[data-p]").forEach(b=>b.onclick=()=>this.buy(b.dataset.p));
  },
  rollRarity(min="N"){
    const r=Math.random()*100; let rar = r<2?"UR":r<10?"SR":r<30?"R":"N";
    return RANK[rar]<RANK[min]?min:rar;
  },
  pickCard(pool, rar){
    for(let k=RANK[rar];k>=0;k--){ const r=Object.keys(RANK).find(x=>RANK[x]===k); const p=pool.filter(c=>c.rarity===r); if(p.length) return p[Math.floor(Math.random()*p.length)]; }
    return pool[Math.floor(Math.random()*pool.length)];
  },
  buy(id){
    const p=PACKS.find(x=>x.id===id); if(!p) return;
    if(Player.coins<p.price) return toast("Nicht genug Münzen – gewinne Duelle!");
    const pool=DB.cards.filter(c=>!p.faction||c.faction===p.faction);
    if(!pool.length) return toast("Keine Karten für diesen Booster");
    Player.coins-=p.price;
    const out=[];
    if(p.fusion){ const fp=pool.filter(c=>c.type==="fusion"); out.push(this.pickCard(fp.length?fp:pool,this.rollRarity("R"))); }
    while(out.length<p.size){
      const i=out.length, last=i===p.size-1;
      let min = p.fusion?"R":"N";
      if(last && !out.some(c=>RANK[c.rarity]>=1)) min="R";          // mind. 1× R
      if(last && p.premium && !out.some(c=>RANK[c.rarity]>=2)) min="SR";
      out.push(this.pickCard(pool.filter(c=>!p.fusion||c.type!=="fusion"), this.rollRarity(min)));
    }
    this.pulled=out.map(c=>({c, isNew:!Player.has(c.id)}));
    out.forEach(c=>Player.add(c.id)); Player.save();
    this.last=id; this.revealed=out.map(()=>false);
    $("openTitle").textContent=p.icon+" "+p.name; $("btnAgain").textContent=`Nochmal (🪙${p.price})`;
    UI.show("opening"); this.renderOpen();
  },
  renderOpen(){
    $("openCards").innerHTML=this.pulled.map((x,i)=>this.revealed[i]
      ? `<div class="ownwrap glow-${x.c.rarity}">${x.isNew?'<span class="new">NEU!</span>':""}${cardHTML(x.c,"flip",`data-i="${i}"`)}</div>`
      : `<div class="cardback" data-i="${i}"></div>`).join("");
    $("openCards").querySelectorAll("[data-i]").forEach(el=>el.onclick=()=>{const i=+el.dataset.i;
      if(!this.revealed[i]){ this.revealed[i]=true; const r=this.pulled[i].c.rarity; if(RANK[r]>=2) banner(r==="UR"?"ULTRA RAR!":"SUPER RAR!"); this.renderOpen(); }
      else UI.modal(this.pulled[i].c); });
  },
  revealAll(){ this.revealed=this.revealed.map(()=>true); this.renderOpen(); },
};

/* ============================ STORY ============================ */
const Story = {
  data:null, camp:"polizei",
  load(){ this.data=Store.get("story",null)||clone(STORY_DEFAULT); },
  save(){ Store.set("story",this.data); },
  render(){
    $("storyTabs").innerHTML=Object.keys(FACTIONS).map(f=>`<span data-f="${f}" class="${f===this.camp?"on":""}">${FACTIONS[f][1]} ${esc(this.data[f].title)}</span>`).join("");
    $("storyTabs").querySelectorAll("span").forEach(s=>s.onclick=()=>{this.camp=s.dataset.f;this.render()});
    const C=this.data[this.camp], prog=Player.progress[this.camp]||0;
    $("storyDesc").textContent=C.desc;
    $("storyList").innerHTML=C.chapters.map((c,i)=>{const done=i<prog, open=i<=prog;
      return `<div class="chapter ${open?"":"locked"}"><div class="ce">${open?esc(c.opp.emoji):"🔒"}</div><div class="ct"><b>${i+1}. ${esc(c.title)}</b>
        <span class="muted">${open?`Gegner: ${esc(c.opp.name)} · ${c.opp.lp} LP · ${done?"✅ geschafft":"Belohnung 🪙"+c.reward}`:"Noch gesperrt"}</span></div>
        ${open?`<button class="small ${done?"ghost":"red"}" data-c="${i}">${done?"Nochmal":"Start"}</button>`:""}</div>`}).join("")
      || `<p class="muted">Noch keine Kapitel – im Admin-Bereich unter „Story“ anlegen.</p>`;
    $("storyList").querySelectorAll("[data-c]").forEach(b=>b.onclick=()=>this.play(this.camp,+b.dataset.c));
  },
  parse(txt){ return (txt||"").split("\n").map(l=>l.trim()).filter(Boolean).map(l=>{const p=l.split("|"); return p.length>=3?{who:p[0].trim(),emoji:p[1].trim(),text:p.slice(2).join("|").trim()}:{who:"",emoji:"💬",text:l}}); },
  play(f,i){
    const c=this.data[f].chapters[i];
    Scene.play(`Kapitel ${i+1}: ${c.title}`, this.parse(c.intro), f, ()=>{
      const deck=Deck.genDeck(OTHER[f],{maxLevel:c.opp.maxLevel,maxRarity:c.opp.maxRarity});
      Duel.start(f,{oppName:c.opp.name, oppEmoji:c.opp.emoji, oppLP:c.opp.lp, oppDeck:deck,
        onEnd:win=>new Promise(res=>{
          if(!win){ Player.earn(25); return res(); }
          const first=i>=(Player.progress[f]||0);
          if(first){ Player.progress[f]=i+1; }
          Player.earn(first?c.reward:50);
          Scene.play(first?"Kapitel geschafft!":"Wieder gewonnen!", this.parse(c.outro), f, ()=>{ res(); UI.show("story"); });
        })});
    });
  },
};
const Scene = {
  lines:[], i:0, done:null,
  play(title, lines, faction, done){
    this.lines=lines; this.i=0; this.done=done;
    $("scTitle").textContent=title;
    $("scene").style.setProperty("--s1", faction==="polizei"?"#3fa9ff":"#ff5a5a");
    $("scene").style.setProperty("--s2", faction==="polizei"?"#0d1d4a":"#2a0606");
    if(!lines.length) return this.finish();
    $("scene").classList.add("show"); this.draw();
  },
  draw(){ const l=this.lines[this.i]; $("scAvatar").textContent=l.emoji||"💬"; $("scWho").textContent=l.who||"…"; $("scWho").style.display=l.who?"":"none";
    $("scText").textContent=l.text; $("scNext").textContent=this.i<this.lines.length-1?"Weiter ▶":"Los geht's! ▶"; },
  next(){ if(this.i<this.lines.length-1){this.i++;this.draw()} else this.finish(); },
  finish(){ $("scene").classList.remove("show"); const d=this.done; this.done=null; d&&d(); },
};

/* ============================ DUELL-ENGINE ============================
   Spielfeld: 3 Charakter-Zonen + 3 Maßnahmen/Reaktions-Zonen pro Spieler
   Charakter auf dem Feld: {card, pos:"atk"|"def", faceDown, atk, attacks, attacked, changed, lockedUntil}
   ===================================================================== */
const START_LP=4000, HAND=5, ZONES=3;
const sleep = ms => new Promise(r=>setTimeout(r,ms));
const REDUCED = () => window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Angriffs-Animation je Rolle: Ausruf, Partikel, Blitzfarben */
const ATTACK_FX = {
  streife:{word:"HALT, POLIZEI!", parts:["🚨","💙","❤️"],  flash:["#2b6cd6","#ff2b2b"]},
  kripo:  {word:"ERWISCHT!",      parts:["🔍","🗂️","❗"],  flash:["#e8d9a8","#5a4a2e"]},
  sek:    {word:"ZUGRIFF!",       parts:["💥","⚡","💨"],   flash:["#ffffff","#151a22"]},
  verkehr:{word:"STOPP!",         parts:["🚦","🛑","📸"],   flash:["#ffd23f","#ff3b3b"]},
  hunde:  {word:"WUFF! FASS!",    parts:["🐾","🐾","🦴"],   flash:["#ffb347","#9a5b1e"]},
  bepo:   {word:"VORRÜCKEN!",     parts:["🛡️","💦","📢"],   flash:["#3fa9ff","#203a6b"]},
  dieb:   {word:"SCHNAPP!",       parts:["👜","💨","💎"],   flash:["#2a0a3a","#8a1c1c"]},
  betrug: {word:"REINGELEGT!",    parts:["🎭","💸","❓"],   flash:["#ff8fd8","#6b1a5b"]},
  bande:  {word:"KLATSCH!",       parts:["👊","💢","💥"],   flash:["#ff3b3b","#2a0a0a"]},
  hehler: {word:"WEG DAMIT!",     parts:["📦","💰","🕸️"],   flash:["#c9a26b","#5a3410"]},
  raub:   {word:"ÜBERFALL!",      parts:["💰","💥","💸"],   flash:["#ffd23f","#7a1010"]},
  drogen: {word:"PUFF!",          parts:["💨","🌫️","💊"],   flash:["#7dff8a","#2a5a1a"]},
};

function makePlayer(name, deckIds, extraIds, lp){
  const deck = shuffle(deckIds.map(id=>DB.byId(id)).filter(Boolean).map(clone));
  const extra = (extraIds||[]).map(id=>DB.byId(id)).filter(Boolean).map(clone);
  return {name, lp:lp||START_LP, deck, extra, hand:[], grave:[], mz:Array(ZONES).fill(null), st:Array(ZONES).fill(null), summoned:false};
}

const Duel = {
  P:null, AI:null, history:[], turn:0, active:null, busy:false, over:false, ready:false, opts:{},
  mode:null,       // null | {type:"attack",from} | {type:"tribute",handIdx,need,picked:[],pos} | {type:"boost",handIdx}
  start(side, opts={}){
    this.side=side; this.opts=opts;
    const other = OTHER[side];
    if(!DB.ofFaction(other).length) return toast("Die Gegenpartei hat keine Karten");
    let myDeck = Deck.validFor(side) ? Deck.lists[side] : Deck.autoOwned(side);
    if(myDeck.length<10){ toast("Zu wenige eigene Karten – Leihdeck wird benutzt"); myDeck=Deck.genDeck(side,{maxRarity:"R"}).main; }
    else if(!Deck.validFor(side)) toast("Kein gültiges Deck – automatisches Deck aus deiner Sammlung");
    const od = opts.oppDeck || Deck.genDeck(other,{});
    this.P = makePlayer("Du", myDeck, Deck.fusionDeck(side));
    this.AI = makePlayer(opts.oppName||FACTIONS[other][0], od.main, od.extra, opts.oppLP);
    this.turn=0; this.over=false; this.mode=null; this.busy=false; this.ready=false; this.history=[]; this._ann=null;
    $("reveal").classList.remove("show"); $("fx").innerHTML="";
    for(let i=0;i<HAND;i++){ this.draw(this.P,true); this.draw(this.AI,true); }
    $("oppWho").textContent=`${opts.oppEmoji||FACTIONS[other][1]} ${this.AI.name}`;
    $("myWho").textContent=`${FACTIONS[side][1]} Du – ${FACTIONS[side][0]}`;
    UI.show("duel");
    this.log(side==="polizei"?"Einsatz beginnt – schnappt die Verbrecher!":"Die Polizei ist dir auf den Fersen!"); banner("EINSATZ!");
    this.active = Math.random()<.5 ? this.P : this.AI;
    setTimeout(()=>this.beginTurn(), 900);
  },
  opp(p){ return p===this.P?this.AI:this.P; },
  me(p,du,er){ return p===this.P?du:`${p.name} ${er}`; },
  log(msg){ $("log").textContent=msg; this.history.push({t:Math.ceil(this.turn/2)||1, who:this.active===this.AI?"opp":"me", msg}); if(this.history.length>250) this.history.shift(); },
  showHistory(){
    $("modalCard").innerHTML=`<h2 style="color:var(--yellow);text-align:center;margin-bottom:8px">Einsatzprotokoll</h2><div class="histlist">${
      this.history.slice().reverse().map(h=>`<div><span class="t">Zug ${h.t} ${h.who==="opp"?"🤖":"😎"}</span>${esc(h.msg)}</div>`).join("")||"Noch nichts passiert."}</div>`;
    $("modalActs").innerHTML=""; const x=document.createElement("button");x.textContent="Schließen";x.className="ghost";x.onclick=()=>UI.closeModal();$("modalActs").appendChild(x);
    UI._onClose=null; $("modal").classList.add("show");
  },

  /* ---------- Ansage: gegnerische Karte groß zeigen – schließt nur per Tipp ---------- */
  announce(p, card, head, result){
    if(p!==this.AI || this.over) return this._ann||Promise.resolve();
    const prev=this._ann||Promise.resolve();
    this._ann = prev.then(()=>new Promise(res=>{
      if(this.over) return res();
      const tag = isChar(card) ? `${card.type==="fusion"?"Fusion · ":""}${ROLES[card.faction][card.attr][0]} · ★${card.level} · ATK ${card.atk} / DEF ${card.def}`
                               : `${LAWS[card.law][2]} ${card.law}${card.ref&&card.ref!==card.law?" · "+card.ref:""} · ${card.law==="Trick"?TYPES[card.type]:LAWS[card.law][1]}`;
      const eff = EFFECTS[card.effect];
      $("rvCard").innerHTML=cardHTML(card);
      $("rvHead").textContent=head; $("rvTag").textContent=tag;
      $("rvEff").textContent = eff && card.effect!=="none" ? `${eff.group}: ${eff.label}` : "";
      $("rvEff").style.display = eff && card.effect!=="none" ? "" : "none";
      $("rvText").textContent= isChar(card)&&card.effect==="none" ? "Kein besonderer Effekt." : cardText(card);
      $("rvRes").textContent=result||""; $("rvRes").style.display=result?"":"none";
      $("reveal").classList.add("show");
      this._revealDone=()=>{ $("reveal").classList.remove("show"); this._revealDone=null; res(); };
    }));
    return this._ann;
  },
  closeReveal(){ this._revealDone&&this._revealDone(); },
  idle(){ return this._ann||Promise.resolve(); },

  draw(p, silent){
    if(!p.deck.length){ if(!silent){ this.log(`${this.me(p,"Du kannst","kann")} nicht mehr ziehen!`); this.win(this.opp(p)); } return false; }
    p.hand.push(p.deck.pop()); return true;
  },
  damage(p, n, src){
    if(n<=0||this.over) return; p.lp=Math.max(0,p.lp-n);
    const el = p===this.P?$("myLP"):$("oppLP"); el.parentElement.classList.remove("shake"); void el.offsetWidth; el.parentElement.classList.add("shake");
    this.floatText(el, `−${n}`, "#ff3b3b");
    this.log(`${this.me(p,"Du verlierst","verliert")} ${n} LP${src?" ("+src+")":""}`);
    if(p.lp<=0) this.win(this.opp(p));
  },
  heal(p,n){ if(n<=0) return; p.lp+=n; this.floatText(p===this.P?$("myLP"):$("oppLP"), `+${n}`, "#3ddc84"); this.log(`${this.me(p,"Du erhältst","erhält")} ${n} LP`); },
  win(p){
    if(this.over) return; this.over=true; this.render(); this.closeReveal();
    const won = p===this.P;
    setTimeout(()=>{ banner(won?(this.side==="polizei"?"FALL GELÖST!":"ENTKOMMEN!"):(this.side==="polizei"?"ENTKOMMEN…":"GESCHNAPPT!"));
      setTimeout(async()=>{
        const onEnd=this.opts.onEnd; this.opts.onEnd=null;
        if(onEnd) await onEnd(won);
        if(UI.current!=="duel") return;
        const again = this.opts.oppName ? ["📖 Zur Story",()=>UI.show("story"),"red"] : ["Nochmal",()=>UI.startDuel(),"red"];
        UI.modal(null,[again,["Hauptmenü",()=>UI.show("home"),"blue"]]);
      },1300); },300);
  },
  async beginTurn(){
    if(this.over) return;
    this.turn++; const p=this.active, o=this.opp(p); p.summoned=false;
    p.mz.forEach(m=>{ if(m){ m.attacked=false; m.attacks=0; m.changed=false; } });
    if(this.turn>1) this.draw(p);
    if(this.over) return;
    // Zugbeginn-Effekte
    p.mz.forEach(m=>{ if(!m||m.faceDown) return; const c=m.card;
      if(c.effect==="growth"){ m.atk+=c.val; this.log(`${c.name} sammelt Erfahrung: +${c.val} ATK`); }
      if(c.effect==="turn_heal") this.heal(p,c.val);
      if(c.effect==="turn_burn") this.damage(o,c.val,c.name); });
    if(this.over) return;
    $("phaseLbl").textContent = p===this.P ? `Dein Zug ${Math.ceil(this.turn/2)}` : `${this.AI.name} am Zug`;
    banner(p===this.P?"DEIN ZUG!":"GEGNER!");
    this.mode=null; this.ready=true; this.render();
    if(p===this.AI){ this.busy=true; await sleep(1100); try{ await AI.play(); }catch(e){ console.error(e); } await this.idle(); this.busy=false; if(!this.over) this.endTurn(true); }
  },
  endTurn(fromAI){
    if(this.over) return;
    if(!fromAI && (this.active!==this.P || this.busy)) return;
    this.mode=null; this.ready=false; this.active=this.opp(this.active); this.render();
    setTimeout(()=>this.beginTurn(), 400);
  },
  canBattle(){ return this.turn>1; },
  tributesNeeded(c){ return c.type==="fusion"?0:c.level>=7?2:c.level>=5?1:0; },
  freeZone(arr){ return arr.findIndex(x=>!x); },
  monsterCount(p){ return p.mz.filter(Boolean).length; },
  setCount(p){ return p.st.filter(Boolean).length; },
  strongest(p){ let best=-1,bi=-1; p.mz.forEach((m,i)=>{ if(m&&m.atk>best){best=m.atk;bi=i} }); return bi; },
  isImmune(m){ return m && !m.faceDown && m.card.effect==="immune"; },
  /* Ziel für Effekte des Gegners (Immunität beachten): kind = "strong" | "weak" */
  target(o, kind){
    let bi=-1, bv=null;
    o.mz.forEach((m,i)=>{ if(!m||this.isImmune(m)) return; if(bv===null||(kind==="weak"?m.atk<bv:m.atk>bv)){bv=m.atk;bi=i} });
    return bi;
  },
  maxAttacks(m){ return m.card.effect==="double_attack"&&!m.faceDown?2:1; },
  canAttack(m){ return m && m.pos==="atk" && !m.attacked && !(m.lockedUntil>=this.turn) && this.canBattle(); },
  /* Gültige Angriffsziele: Deckung zwingt den Angriff auf sich */
  validTargets(o){
    const guards=o.mz.map((m,i)=>m&&!m.faceDown&&m.card.effect==="guard"?i:-1).filter(i=>i>=0);
    return guards.length ? guards : o.mz.map((m,i)=>m?i:-1).filter(i=>i>=0);
  },
  canDirect(p, a){ const o=this.opp(p); return !this.monsterCount(o) || (a && a.card.effect==="direct" && !a.faceDown); },

  /* ---------- Feld-Hilfen ---------- */
  place(p, c, pos){
    const z=this.freeZone(p.mz); if(z<0) return -1;
    p.mz[z]={card:c,pos,faceDown:pos==="def",atk:c.atk,attacks:0,attacked:false,changed:true,lockedUntil:0};
    return z;
  },
  takeControl(from, z, to){
    const fz=this.freeZone(to.mz), m=from.mz[z];
    if(fz<0||!m) return false;
    from.mz[z]=null; m.faceDown=false; m.changed=true; m.attacked=true; to.mz[fz]=m;
    this.log(`${m.card.name} läuft über zu ${to===this.P?"dir":to.name}!`); return true;
  },
  removeSet(o){ const i=o.st.findIndex(Boolean); if(i<0) return false; const s=o.st[i]; o.st[i]=null; o.grave.push(s.card); this.log(`${s.card.name} wurde entfernt!`); return true; },
  discard(o,n){ for(let k=0;k<n&&o.hand.length;k++){ const c=o.hand.splice(Math.floor(Math.random()*o.hand.length),1)[0]; o.grave.push(c); this.log(`${this.me(o,"Du verlierst","verliert")} die Handkarte ${c.name}`); } },
  mill(o,n){ const k=Math.min(n,o.deck.length); for(let i=0;i<k;i++) o.grave.push(o.deck.pop()); this.log(`${this.me(o,"Du legst","legt")} ${k} Karte(n) vom Deck ab`); },
  bounceM(o,z){ const m=o.mz[z]; if(!m) return; o.mz[z]=null; if(m.card.type==="fusion") o.extra.push(m.card); else o.hand.push(m.card); this.log(`${m.card.name} muss das Feld verlassen!`); },
  /* Ausscheiden – cause: "battle" | "effect" */
  destroy(p,z,cause="effect"){
    const m=p.mz[z]; if(!m) return;
    this.fxPoof(p,z);
    p.mz[z]=null;
    if(cause==="battle" && m.card.effect==="survivor" && !m.faceDown){ p.hand.push(m.card); this.log(`${m.card.name} entwischt – zurück auf die Hand!`); return; }
    p.grave.push(m.card); this.log(`${m.card.name} scheidet aus!`);
    if(m.card.effect==="revenge") this.damage(this.opp(p), m.card.val, m.card.name);
    if(m.card.effect==="last_draw") this.draw(p);
  },

  /* ---------- Effekte von Charakteren beim Ausspielen ---------- */
  monsterEffect(p,c){
    const v=c.val, o=this.opp(p);
    switch(c.effect){
      case "summon_burn": this.damage(o,v,c.name); break;
      case "summon_heal": this.heal(p,v); break;
      case "summon_draw": for(let i=0;i<v;i++) this.draw(p); break;
      case "summon_weaken": { const z=this.target(o,"strong"); if(z>=0){ o.mz[z].atk=Math.max(0,o.mz[z].atk-v); this.log(`${o.mz[z].card.name} −${v} ATK`); } break; }
      case "summon_destroy_st": this.removeSet(o); break;
      case "summon_destroy_weak": { const z=this.target(o,"weak"); if(z>=0 && o.mz[z].atk<c.atk) this.destroy(o,z); break; }
      case "summon_bounce": { const z=this.target(o,"strong"); if(z>=0) this.bounceM(o,z); break; }
      case "summon_boost_all": p.mz.forEach(m=>{ if(m&&m.card!==c) m.atk+=v; }); this.log(`Alle anderen eigenen Charaktere +${v} ATK`); break;
      case "summon_revive": { const ms=p.grave.filter(x=>x.type==="monster").sort((a,b)=>b.atk-a.atk)[0]; if(ms){ p.grave.splice(p.grave.indexOf(ms),1); p.hand.push(ms); this.log(`${ms.name} kehrt auf die Hand zurück`); } break; }
      case "summon_discard": this.discard(o,v||1); break;
      case "summon_mill": this.mill(o,v||1); break;
      case "summon_flip_all": o.mz.forEach(m=>{ if(m&&m.faceDown){ m.faceDown=false; } }); this.log("Alle verdeckten Charaktere werden aufgedeckt!"); break;
      case "summon_lock": { const z=this.target(o,"strong"); if(z>=0){ o.mz[z].lockedUntil=this.turn+1; this.log(`${o.mz[z].card.name} wird festgehalten!`); } break; }
      case "summon_steal": { const z=this.target(o,"weak"); if(z>=0) this.takeControl(o,z,p); break; }
    }
  },
  /* Effekt nach Ansage auslösen (bei der KI erst, wenn du die Ansage weggetippt hast) */
  triggerSummon(p,c,head,extra){
    if(p===this.AI){ const prev=this.announce(p,c,head,extra); this._ann=prev.then(()=>{ if(!this.over){ this.monsterEffect(p,c); this.render(); } }); }
    else { this.monsterEffect(p,c); }
  },
  summon(p, handIdx, pos, tributes=[]){
    const c=p.hand[handIdx]; if(!c||c.type!=="monster"||p.summoned) return false;
    if(tributes.length<this.tributesNeeded(c)) return false;
    tributes.forEach(z=>{ if(p.mz[z]){ p.grave.push(p.mz[z].card); p.mz[z]=null; } });
    if(this.freeZone(p.mz)<0) return false;
    p.hand.splice(handIdx,1); p.summoned=true; this.place(p,c,pos);
    if(pos==="atk"){ this.log(`${this.me(p,"Du schickst","schickt")} ${c.name} ins Feld!`);
      this.triggerSummon(p,c,`${p.name} schickt einen Charakter ins Feld!`, tributes.length?`Dafür räumen ${tributes.length} Charakter(e) das Feld.`:""); }
    else this.log(`${this.me(p,"Du setzt","setzt")} einen Charakter verdeckt.`);
    this.render(); return true;
  },
  changePos(p,z){
    const m=p.mz[z]; if(!m||m.changed||m.attacks) return;
    const wasDown=m.faceDown; m.pos = m.pos==="atk"?"def":"atk"; m.changed=true;
    this.log(`${m.card.name} wechselt in ${m.pos==="atk"?"Angriffs":"Verteidigungs"}position`);
    if(m.pos==="atk" && wasDown){ m.faceDown=false; this.triggerSummon(p,m.card,`${p.name} deckt einen Charakter auf!`); }
    this.render();
  },
  setST(p, handIdx){
    const z=this.freeZone(p.st); if(z<0) return false;
    const c=p.hand.splice(handIdx,1)[0]; p.st[z]={card:c,faceDown:true};
    this.log(`${this.me(p,"Du setzt","setzt")} eine Karte verdeckt.`); this.render(); return true;
  },

  /* ----- Fusion ----- */
  fusionOptions(p){
    const pool=[ ...p.hand.map((c,i)=>c.type==="monster"?{c,src:"hand",i,atk:c.atk}:null).filter(Boolean),
                 ...p.mz.map((m,i)=>m?{c:m.card,src:"field",i,atk:m.atk}:null).filter(Boolean) ];
    const seen=new Set(), out=[];
    p.extra.forEach((f,ei)=>{
      if(seen.has(f.id)) return; seen.add(f.id);
      const used=[]; let ok=true;
      const mats=[...f.materials].sort((a,b)=>(a==="any")-(b==="any"));   // spezifische Rollen zuerst
      for(const m of mats){
        const cand=pool.filter(x=>!used.includes(x)&&(m==="any"||x.c.attr===m)).sort((a,b)=>a.atk-b.atk)[0];
        if(!cand){ok=false;break} used.push(cand);
      }
      if(!ok) return;
      if(!used.some(u=>u.src==="field") && this.freeZone(p.mz)<0) return;
      out.push({fusion:f, ei, mats:used});
    });
    return out;
  },
  doFusion(p, opt){
    // Materialien über die Karte selbst finden (Positionen können sich verschoben haben)
    opt.mats.forEach(m=>{
      if(m.src==="field"){ const z=p.mz.findIndex(x=>x&&x.card===m.c); if(z>=0){ p.grave.push(p.mz[z].card); p.mz[z]=null; } }
      else { const h=p.hand.indexOf(m.c); if(h>=0) p.grave.push(p.hand.splice(h,1)[0]); }
    });
    const ei=p.extra.findIndex(c=>c.id===opt.fusion.id); const f=p.extra.splice(ei,1)[0];
    this.place(p,f,"atk"); banner("FUSION!");
    this.log(`${this.me(p,"Du bildest","bildet")} ${f.name}!`);
    this.triggerSummon(p,f,`${p.name} bildet eine Fusion!`,`Material: ${opt.mats.map(m=>m.c.name).join(" + ")}`);
  },
  pickFusion(opts){
    return new Promise(res=>{
      $("modalCard").innerHTML=`<h2 style="color:var(--yellow);text-align:center;margin-bottom:8px">Fusion wählen</h2><div class="fusion-pick">${opts.map((o,k)=>`<div class="opt">${cardHTML(o.fusion)}
        <button class="small red" data-k="${k}">Fusion: ${o.mats.map(m=>esc(m.c.name.split(" ").slice(-1)[0])).join(" + ")}</button></div>`).join("")}</div>`;
      $("modalActs").innerHTML="";
      const x=document.createElement("button");x.textContent="Abbrechen";x.className="ghost";x.onclick=()=>UI.closeModal();$("modalActs").appendChild(x);
      $("modalCard").querySelectorAll("[data-k]").forEach(b=>b.onclick=()=>{UI._onClose=null;UI.closeModal();res(opts[+b.dataset.k])});
      UI._onClose=()=>res(null); $("modal").classList.add("show");
    });
  },

  /* ----- Maßnahmen / Tricks ----- */
  canActivate(p,c){
    const o=this.opp(p), gm=p.grave.some(x=>x.type==="monster");
    switch(c.effect){
      case "boost": case "boost_all": case "heal_per_monster": case "burn_per_monster": case "scapegoat": return this.monsterCount(p)>0;
      case "destroy_best": case "weaken": case "bounce": case "destroy_weak": return this.target(o,"strong")>=0;
      case "steal": return this.target(o,"weak")>=0 && this.freeZone(p.mz)>=0;
      case "weaken_all": case "lock_all": case "def_mode": return this.monsterCount(o)>0;
      case "destroy_level": return o.mz.some(m=>m&&!this.isImmune(m)&&m.card.level<=c.val);
      case "destroy_st": case "destroy_all_st": return this.setCount(o)>0;
      case "revive": return gm;
      case "revive_field": return gm && this.freeZone(p.mz)>=0;
      case "fusion": return this.fusionOptions(p).length>0;
      case "destroy_all": return this.monsterCount(o)+this.monsterCount(p)>0;
      case "discard": return o.hand.length>0;
      case "mill": return o.deck.length>0;
      case "search_monster": return p.deck.some(x=>x.type==="monster"&&x.level<=4);
      case "search_spell": return p.deck.some(x=>x.type==="spell");
      case "extra_summon": return p.summoned;
      case "reset_atk": return [...p.mz,...o.mz].some(m=>m&&m.atk!==m.card.atk);
    }
    return true;
  },
  /* Vorschau-Text für die Ansage */
  spellPreview(p,c,targetZ){
    const o=this.opp(p), nm=z=>z>=0&&o.mz[z]?(o.mz[z].faceDown?"dein verdeckter Charakter":o.mz[z].card.name):"";
    const s=nm(this.target(o,"strong")), w=nm(this.target(o,"weak")), n=this.monsterCount(p);
    return ({destroy_best:`Ziel: ${s}`, destroy_weak:`Ziel: ${w}`, weaken:`Ziel: ${s} (−${c.val} ATK)`, bounce:`Ziel: ${s} muss zurück auf deine Hand`,
      steal:`${w} läuft zum Gegner über!`, boost:p.mz[targetZ]?`${p.mz[targetZ].card.name} +${c.val} ATK`:"", destroy_st:"Eine deiner verdeckten Karten wird entfernt!",
      destroy_all_st:"Alle deine verdeckten Karten werden entfernt!", burn:`Du verlierst ${c.val} LP`, heal:`${p.name} erhält ${c.val} LP`,
      discard:`Du verlierst ${c.val} Handkarte(n)`, mill:`Du legst ${c.val} Karte(n) vom Deck ab`, lock_all:"Deine Charaktere können im nächsten Zug nicht angreifen",
      def_mode:"Alle deine Charaktere müssen in Verteidigung", burn_per_monster:`Du verlierst ${c.val*n} LP`, heal_per_monster:`${p.name} erhält ${c.val*n} LP`,
      destroy_level:`Alle deine Charaktere bis Stufe ${c.val} scheiden aus`, weaken_all:`Alle deine Charaktere −${c.val} ATK`, boost_all:`Alle gegnerischen Charaktere +${c.val} ATK`,
      destroy_all:"Alle Charaktere auf dem Feld scheiden aus!", reset_atk:"Alle Werte werden zurückgesetzt"})[c.effect]||"";
  },
  async activateSpell(p, handIdx, targetZ, fusionOpt){
    const c=p.hand[handIdx]; if(!c||c.type!=="spell") return false;
    const o=this.opp(p), v=c.val;
    if(!this.canActivate(p,c)){ if(p===this.P) toast("Kein passendes Ziel!"); return false; }
    if(c.effect==="boost" && (targetZ==null||!p.mz[targetZ])) return false;
    if(c.effect==="fusion"){
      if(!fusionOpt){ const opts=this.fusionOptions(p); fusionOpt = p===this.P ? await this.pickFusion(opts) : opts[0]; }
      if(!fusionOpt) return false;
    }
    p.hand.splice(p.hand.indexOf(c),1); p.grave.push(c);
    if(p===this.AI) await this.announce(p,c,`${p.name} setzt ${c.law==="Trick"?"einen Trick":"eine "+c.law+"-Maßnahme"} ein!`,this.spellPreview(p,c,targetZ));
    if(this.over) return false;
    banner(c.law==="Trick"?c.name+"!":c.law+"!"); this.fxStamp(c);
    this.log(`${p===this.P?"Du":p.name}: ${c.name}${c.ref&&c.ref!==c.law?" ("+c.ref+")":""}`);
    const n=this.monsterCount(p);
    switch(c.effect){
      case "heal": this.heal(p,v); break;
      case "burn": this.damage(o,v,c.name); break;
      case "draw": for(let i=0;i<v;i++) this.draw(p); break;
      case "boost": p.mz[targetZ].atk+=v; this.log(`${p.mz[targetZ].card.name} +${v} ATK`); break;
      case "boost_all": p.mz.forEach(m=>m&&(m.atk+=v)); this.log(`Alle eigenen Charaktere +${v} ATK`); break;
      case "weaken": { const m=o.mz[this.target(o,"strong")]; m.atk=Math.max(0,m.atk-v); this.log(`${m.card.name} −${v} ATK`); break; }
      case "weaken_all": o.mz.forEach(m=>m&&!this.isImmune(m)&&(m.atk=Math.max(0,m.atk-v))); this.log(`Gegnerische Charaktere −${v} ATK`); break;
      case "destroy_best": this.destroy(o,this.target(o,"strong")); break;
      case "destroy_weak": this.destroy(o,this.target(o,"weak")); break;
      case "destroy_level": o.mz.forEach((m,i)=>{ if(m&&!this.isImmune(m)&&m.card.level<=v) this.destroy(o,i); }); break;
      case "destroy_st": this.removeSet(o); break;
      case "destroy_all_st": while(this.removeSet(o)); break;
      case "destroy_all": [this.P,this.AI].forEach(pl=>pl.mz.forEach((m,i)=>m&&!this.isImmune(m)&&this.destroy(pl,i))); break;
      case "bounce": this.bounceM(o,this.target(o,"strong")); break;
      case "steal": this.takeControl(o,this.target(o,"weak"),p); break;
      case "lock_all": o.mz.forEach(m=>m&&(m.lockedUntil=this.turn+1)); this.log("Gegnerische Charaktere werden festgehalten!"); break;
      case "def_mode": o.mz.forEach(m=>{ if(m&&!this.isImmune(m)){ m.pos="def"; m.faceDown=false; } }); this.log("Hände hoch! Alle gegnerischen Charaktere in Verteidigung."); break;
      case "reset_atk": [...p.mz,...o.mz].forEach(m=>m&&(m.atk=m.card.atk)); this.log("Lage beruhigt – alle Werte zurückgesetzt."); break;
      case "discard": this.discard(o,v||1); break;
      case "mill": this.mill(o,v||1); break;
      case "heal_per_monster": this.heal(p,v*n); break;
      case "burn_per_monster": this.damage(o,v*n,c.name); break;
      case "search_monster": { const m=p.deck.filter(x=>x.type==="monster"&&x.level<=4).sort((a,b)=>b.atk-a.atk)[0]; p.deck.splice(p.deck.indexOf(m),1); p.hand.push(m); this.log(`${this.me(p,"Du findest","findet")} ${p===this.P?m.name:"einen Charakter"}`); break; }
      case "search_spell": { const ss=p.deck.filter(x=>x.type==="spell"); const m=ss[Math.floor(Math.random()*ss.length)]; p.deck.splice(p.deck.indexOf(m),1); p.hand.push(m); this.log(`${this.me(p,"Du findest","findet")} ${p===this.P?m.name:"eine Maßnahme"}`); break; }
      case "extra_summon": p.summoned=false; this.log(`${this.me(p,"Du darfst","darf")} noch einen Charakter ausspielen`); break;
      case "revive": { const ms=p.grave.filter(x=>x.type==="monster").sort((a,b)=>b.atk-a.atk)[0]; p.grave.splice(p.grave.indexOf(ms),1); p.hand.push(ms); this.log(`${ms.name} ist zurück auf der Hand!`); break; }
      case "revive_field": { const ms=p.grave.filter(x=>x.type==="monster").sort((a,b)=>b.atk-a.atk)[0]; p.grave.splice(p.grave.indexOf(ms),1); this.place(p,ms,"atk"); this.log(`${ms.name} ist zurück im Einsatz!`); break; }
      case "scapegoat": { let wi=-1,wv=1e9; p.mz.forEach((m,i)=>{ if(m&&m.atk<wv){wv=m.atk;wi=i} }); this.destroy(p,wi); this.damage(o,wv,c.name); break; }
      case "fusion": this.doFusion(p,fusionOpt); break;
    }
    this.render(); return true;
  },

  /* ----- Reaktionen des Verteidigers. true = Angriff gestoppt ----- */
  async checkTrap(attacker, fromZ){
    const d=this.opp(attacker);
    const traps=d.st.map((s,i)=>s&&s.card.type==="trap"?i:-1).filter(i=>i>=0);
    if(!traps.length||this.over) return false;
    let ti=-1;
    if(d===this.P){
      for(const i of traps){
        const att=attacker.mz[fromZ]; if(!att) return false;
        const use = await new Promise(res=>UI.modal(d.st[i].card,[[`Reaktion gegen ${att.card.name} einsetzen`,()=>res(true),"red"]],null,()=>res(false),"Nicht einsetzen"));
        if(use){ ti=i; break; }
      }
      if(ti<0) return false;
    } else ti=AI.pickTrap(traps, attacker.mz[fromZ]);
    if(ti<0) return false;
    const t=d.st[ti].card; d.st[ti]=null; d.grave.push(t);
    const a=attacker.mz[fromZ];
    if(d===this.AI) await this.announce(d,t,`${d.name} reagiert auf deinen Angriff!`,`Gegen: ${a?a.card.name:"deinen Angreifer"}`);
    if(this.over) return true;
    banner(t.law==="Trick"?t.name+"!":t.law+"!"); this.fxStamp(t);
    this.log(`${this.me(d,"Du setzt","setzt")} ${t.name} ein!`); await sleep(600);
    const imm=this.isImmune(a);
    switch(t.effect){
      case "trap_weaken": if(a&&!imm){ a.atk=Math.max(0,a.atk-t.val); this.log(`${a.card.name} −${t.val} ATK`); } this.render(); return false;
      case "trap_weaken_all": attacker.mz.forEach(m=>m&&!this.isImmune(m)&&(m.atk=Math.max(0,m.atk-t.val))); this.log(`Alle Angreifer −${t.val} ATK`); this.render(); return false;
      case "negate": this.log("Angriff abgewehrt!"); break;
      case "mirror": if(!imm) this.destroy(attacker,fromZ); else this.log("Immun – Angriff nur abgewehrt!"); break;
      case "counter_burn": this.log("Angriff abgewehrt!"); this.damage(attacker,t.val,t.name); break;
      case "trap_destroy_all_atk": attacker.mz.forEach((m,i)=>{ if(m&&m.pos==="atk"&&!this.isImmune(m)) this.destroy(attacker,i); }); break;
      case "trap_bounce": if(!imm) this.bounceM(attacker,fromZ); break;
      case "trap_heal": this.log("Angriff abgewehrt!"); this.heal(d,t.val); break;
      case "trap_steal": if(imm||!this.takeControl(attacker,fromZ,d)) { if(!imm) this.destroy(attacker,fromZ); } break;
      case "trap_lock": attacker.mz.forEach(m=>m&&(m.lockedUntil=this.turn+2)); this.log("Angriff abgewehrt – alle Angreifer festgehalten!"); break;
      case "trap_draw": this.log("Angriff abgewehrt!"); for(let i=0;i<(t.val||1);i++) this.draw(d); break;
    }
    if(attacker.mz[fromZ]===a && a){ a.attacks++; a.attacked = a.attacks>=this.maxAttacks(a); }
    this.render(); return true;
  },
  async attack(p, fromZ, toZ){ // toZ=null => direkt
    const a=p.mz[fromZ], o=this.opp(p);
    if(this.over||!this.canAttack(a)) return;
    if(toZ==null && !this.canDirect(p,a)) return;
    if(toZ!=null && !this.validTargets(o).includes(toZ)) { if(p===this.P) toast("Ein Charakter mit Deckung schützt die anderen!"); return; }
    this.busy=true;
    try{
      if(await this.checkTrap(p,fromZ)) return;
      if(!p.mz[fromZ]||p.mz[fromZ]!==a) return;
      a.attacks++; a.attacked = a.attacks>=this.maxAttacks(a);
      await this.fxAttack(p,fromZ,toZ);
      if(toZ==null){ this.damage(o,a.atk,a.card.name); return; }
      const d=o.mz[toZ]; if(!d) return;
      if(d.faceDown){ d.faceDown=false; this.log(`${d.card.name} wird aufgedeckt!`); this.render(); await sleep(600); }
      let won=false;
      if(d.pos==="atk"){
        if(a.atk>d.atk){ this.destroy(o,toZ,"battle"); this.damage(o,a.atk-d.atk,a.card.name); won=true; }
        else if(a.atk<d.atk){ this.destroy(p,fromZ,"battle"); this.damage(p,d.atk-a.atk,d.card.name); }
        else { this.destroy(o,toZ,"battle"); this.destroy(p,fromZ,"battle"); this.log("Beide scheiden aus!"); }
      } else {
        const df=d.card.def;
        if(a.atk>df){ this.destroy(o,toZ,"battle"); won=true; if(a.card.effect==="pierce") this.damage(o,a.atk-df,"Durchschlag"); }
        else if(a.atk<df){ this.damage(p,df-a.atk,"Verteidigung"); }
        else this.log("Kein Schaden.");
      }
      if(won && p.mz[fromZ]===a){
        if(a.card.effect==="battle_heal") this.heal(p,a.card.val);
        if(a.card.effect==="battle_burn") this.damage(o,a.card.val,a.card.name);
        if(a.card.effect==="battle_draw"){ this.draw(p); this.log(`${a.card.name}: ${this.me(p,"du ziehst","zieht")} 1 Karte`); }
      }
    } finally { this.render(); this.busy = this.active===this.AI && !this.over; }
  },

  /* ---------- Animationen ---------- */
  zoneEl(p,z){ const el=(p===this.P?$("myMZ"):$("oppMZ")); return el&&el.children[z]; },
  async fxAttack(p, fromZ, toZ){
    const src=this.zoneEl(p,fromZ), a=p.mz[fromZ];
    const dst = toZ==null ? (p===this.P?$("oppLP"):$("myLP")).parentElement : this.zoneEl(this.opp(p),toZ);
    if(!src||!dst||!a) return;
    const fx=ATTACK_FX[a.card.attr]||ATTACK_FX.streife;
    const r1=src.getBoundingClientRect(), r2=dst.getBoundingClientRect();
    const dx=(r2.left+r2.width/2)-(r1.left+r1.width/2), dy=(r2.top+r2.height/2)-(r1.top+r1.height/2);
    const ghost=src.cloneNode(true); ghost.className="fx-ghost";
    Object.assign(ghost.style,{left:r1.left+"px",top:r1.top+"px",width:r1.width+"px",height:r1.height+"px"});
    $("fx").appendChild(ghost);
    if(REDUCED()){ ghost.remove(); this.fxImpact(r2,fx,a.card); await sleep(500); return; }
    const anim=ghost.animate([
      {transform:"translate(0,0) scale(1) rotate(0)"},
      {transform:`translate(${-dx*.08}px,${-dy*.08}px) scale(1.12) rotate(${dx>0?-6:6}deg)`, offset:.25},
      {transform:`translate(${dx*.85}px,${dy*.85}px) scale(1.25) rotate(${dx>0?8:-8}deg)`, offset:.55},
      {transform:"translate(0,0) scale(1) rotate(0)"}
    ],{duration:820,easing:"cubic-bezier(.3,.7,.3,1)"});
    setTimeout(()=>this.fxImpact(r2,fx,a.card),450);
    await anim.finished.catch(()=>{}); ghost.remove(); await sleep(350);
  },
  fxImpact(r, fx, card){
    const cx=r.left+r.width/2, cy=r.top+r.height/2, layer=$("fx");
    // Blitzlicht in den Farben der Rolle (z. B. Blaulicht)
    const fl=document.createElement("div"); fl.className="fx-flash"; layer.appendChild(fl);
    if(!REDUCED()) fl.animate([{background:fx.flash[0],opacity:.55},{background:fx.flash[1],opacity:.45},{background:fx.flash[0],opacity:.35},{opacity:0}],{duration:520}).finished.then(()=>fl.remove()); else fl.remove();
    // Comic-Ausruf
    const w=document.createElement("div"); w.className="fx-word"; w.textContent=fx.word; w.style.left=cx+"px"; w.style.top=cy+"px"; layer.appendChild(w);
    w.animate([{transform:"translate(-50%,-50%) scale(.2) rotate(-12deg)",opacity:0},{transform:"translate(-50%,-50%) scale(1.15) rotate(-6deg)",opacity:1,offset:.25},
      {transform:"translate(-50%,-60%) scale(1) rotate(-6deg)",opacity:1,offset:.75},{transform:"translate(-50%,-80%) scale(.9) rotate(-6deg)",opacity:0}],{duration:REDUCED()?600:1000}).finished.then(()=>w.remove());
    // Partikel: Rollen-Symbole + Emoji der Karte
    if(REDUCED()) return;
    const parts=[...fx.parts,...fx.parts,card.art.emoji||"💥","💥"];
    parts.forEach((e,i)=>{ const s=document.createElement("div"); s.className="fx-part"; s.textContent=e; s.style.left=cx+"px"; s.style.top=cy+"px"; layer.appendChild(s);
      const ang=(i/parts.length)*Math.PI*2+Math.random()*.5, dist=60+Math.random()*70;
      s.animate([{transform:"translate(-50%,-50%) scale(.4)",opacity:1},{transform:`translate(calc(-50% + ${Math.cos(ang)*dist}px),calc(-50% + ${Math.sin(ang)*dist}px)) scale(1.2) rotate(${Math.random()*80-40}deg)`,opacity:0}],
        {duration:700+Math.random()*300,easing:"cubic-bezier(.2,.8,.3,1)"}).finished.then(()=>s.remove()); });
    const field=$("duel"); field.classList.remove("shake"); void field.offsetWidth; field.classList.add("shake");
  },
  fxPoof(p,z){
    const el=this.zoneEl(p,z); if(!el||UI.current!=="duel") return;
    const r=el.getBoundingClientRect(), s=document.createElement("div"); s.className="fx-part"; s.textContent="💨";
    s.style.left=(r.left+r.width/2)+"px"; s.style.top=(r.top+r.height/2)+"px"; s.style.fontSize="54px"; $("fx").appendChild(s);
    s.animate([{transform:"translate(-50%,-50%) scale(.5)",opacity:1},{transform:"translate(-50%,-70%) scale(1.8)",opacity:0}],{duration:REDUCED()?300:700}).finished.then(()=>s.remove());
  },
  fxStamp(c){
    if(UI.current!=="duel"||REDUCED()) return;
    const s=document.createElement("div"); s.className="fx-stamp "+(c.law||""); s.textContent=c.ref&&c.ref!==c.law?c.ref:(c.law==="Trick"?"TRICK!":c.law); $("fx").appendChild(s);
    s.animate([{transform:"translate(-50%,-50%) scale(2.6) rotate(-14deg)",opacity:0},{transform:"translate(-50%,-50%) scale(1) rotate(-8deg)",opacity:.95,offset:.25},
      {transform:"translate(-50%,-50%) scale(1) rotate(-8deg)",opacity:.95,offset:.8},{opacity:0,transform:"translate(-50%,-50%) scale(1) rotate(-8deg)"}],{duration:1100}).finished.then(()=>s.remove());
  },
  floatText(el, txt, color){
    if(!el||UI.current!=="duel") return;
    const r=el.getBoundingClientRect(), s=document.createElement("div"); s.className="fx-num"; s.textContent=txt; s.style.color=color;
    s.style.left=(r.left+r.width/2)+"px"; s.style.top=(r.top)+"px"; $("fx").appendChild(s);
    s.animate([{transform:"translate(-50%,0)",opacity:1},{transform:"translate(-50%,-40px)",opacity:0}],{duration:1200}).finished.then(()=>s.remove());
  },

  /* ---------- Spieler-Interaktion ---------- */
  myTurn(){ return this.active===this.P && this.ready && !this.busy && !this.over; },
  tapHand(i){
    const c=this.P.hand[i]; if(!c) return;
    if(!this.myTurn()) return UI.modal(c);
    this.mode=null; this.render();
    const acts=[]; const P=this.P;
    if(c.type==="monster"){
      const need=this.tributesNeeded(c), have=this.monsterCount(P), free=this.freeZone(P.mz)>=0;
      if(P.summoned) acts.push(["Diesen Zug schon einen Charakter gespielt",null,"ghost"]);
      else if(need>have) acts.push([`Braucht ${need} Ablösung(en) auf dem Feld`,null,"ghost"]);
      else if(need===0){
        if(free){ acts.push(["⚔️ Ins Feld schicken (ATK)",()=>this.summon(P,i,"atk"),"red"]); acts.push(["🛡️ Verdeckt setzen (DEF)",()=>this.summon(P,i,"def"),"blue"]); }
        else acts.push(["Keine freie Zone",null,"ghost"]);
      } else {
        acts.push([`⚔️ Ablösen & ins Feld (${need})`,()=>this.startTribute(i,need,"atk"),"red"]);
        acts.push([`🛡️ Ablösen & verdeckt (${need})`,()=>this.startTribute(i,need,"def"),"blue"]);
      }
    } else if(c.type==="spell"){
      if(!this.canActivate(P,c)) acts.push([c.effect==="fusion"?"Keine passenden Fusions-Materialien":"Gerade kein passendes Ziel",null,"ghost"]);
      else if(c.effect==="boost") acts.push(["⚖️ Maßnahme – Ziel wählen",()=>{this.mode={type:"boost",handIdx:i};this.log("Wähle deinen Charakter");this.render()},"green"]);
      else acts.push([c.effect==="fusion"?"🧩 Fusion durchführen":"⚖️ Maßnahme durchführen",()=>this.activateSpell(P,i),"green"]);
    } else {
      if(this.freeZone(P.st)>=0) acts.push(["⚠️ Reaktion verdeckt setzen",()=>this.setST(P,i),"blue"]); else acts.push(["Keine freie Zone",null,"ghost"]);
    }
    UI.modal(c,acts.filter(a=>a[1]).length?acts.filter(a=>a[1]):acts);
  },
  startTribute(handIdx,need,pos){ this.mode={type:"tribute",handIdx,need,picked:[],pos}; this.log(`Wähle ${need} Charakter(e) zur Ablösung`); this.render(); },
  tapMyMonster(z){
    const m=this.P.mz[z]; if(!m) return;
    const mode=this.mode;
    if(mode&&mode.type==="tribute"){
      const k=mode.picked.indexOf(z); if(k>=0) mode.picked.splice(k,1); else mode.picked.push(z);
      if(mode.picked.length>=mode.need){ const ok=this.summon(this.P,mode.handIdx,mode.pos,mode.picked); this.mode=null; if(!ok) toast("Hat nicht geklappt"); }
      this.render(); return;
    }
    if(mode&&mode.type==="boost"){ this.mode=null; this.activateSpell(this.P,mode.handIdx,z); return; }
    if(!this.myTurn()) return UI.modal(m.card,[],m);
    const acts=[];
    if(this.canAttack(m)) acts.push([`💥 Angreifen${m.card.effect==="double_attack"?` (${2-m.attacks}×)`:""}`,()=>{this.mode={type:"attack",from:z};this.log(this.canDirect(this.P,m)&&this.monsterCount(this.AI)?"Ziel wählen – oder Direktangriff!":"Wähle ein Ziel");this.render()},"red"]);
    if(!m.changed && !m.attacks) acts.push([m.pos==="atk"?"🛡️ In Verteidigung":"⚔️ In Angriff",()=>this.changePos(this.P,z),"blue"]);
    if(m.lockedUntil>=this.turn) acts.push(["⛓️ Festgehalten – kann nicht angreifen",null,"ghost"]);
    else if(!this.canBattle() && m.pos==="atk") acts.push(["Im ersten Zug kein Angriff",null,"ghost"]);
    UI.modal(m.card,acts.filter(a=>a[1]).length?acts.filter(a=>a[1]):acts,m);
  },
  tapOppMonster(z){
    const m=this.AI.mz[z]; if(!m) return;
    if(this.mode&&this.mode.type==="attack"){ const from=this.mode.from; this.mode=null; this.attack(this.P,from,z); return; }
    if(m.faceDown) UI.modal("back"); else UI.modal(m.card,[],m);
  },
  directAttack(){ if(this.mode&&this.mode.type==="attack"){ const f=this.mode.from; this.mode=null; this.attack(this.P,f,null); } },
  tapMyST(z){ const s=this.P.st[z]; if(s) UI.modal(s.card,[["Wird automatisch bei einem Angriff angeboten",null,"ghost"]]); },
  async quit(){ if(this.over||await UI.ask("Einsatz abbrechen? (zählt als Niederlage)")){ this.over=true; this.opts.onEnd=null; this.closeReveal(); UI.show("home"); } },

  /* ---------- Rendering ---------- */
  renderMZ(p, el, mine){
    const mode=this.mode, vt = mode&&mode.type==="attack"&&!mine ? this.validTargets(p) : [];
    el.innerHTML = p.mz.map((m,i)=>{
      let cls="zone";
      if(vt.includes(i)) cls+=" target";
      if(mode&&mode.type==="tribute"&&mine&&m) cls+= mode.picked.includes(i)?" sel":" tribute";
      if(mode&&mode.type==="boost"&&mine&&m) cls+=" tribute";
      if(mode&&mode.type==="attack"&&mine&&mode.from===i) cls+=" sel";
      let inner="";
      if(m){ const pc=(m.pos==="def"?"def":"")+(m.attacked?" used":"");
        inner = m.faceDown ? `<div class="cardback ${pc}"></div>` : cardHTML(m.card,pc,"",m);
        const badges=[]; if(!m.faceDown){ if(m.card.effect==="guard") badges.push("🛡️"); if(m.card.effect==="immune") badges.push("✨"); if(m.card.effect==="double_attack") badges.push("⚔️²"); if(m.card.effect==="direct") badges.push("🎯"); }
        if(m.lockedUntil>=this.turn) badges.push("⛓️");
        if(badges.length) inner+=`<span class="zbadge">${badges.join("")}</span>`; }
      return `<div class="${cls}" data-z="${i}">${inner}</div>`;
    }).join("");
    el.querySelectorAll(".zone").forEach(z=>z.onclick=()=> mine?this.tapMyMonster(+z.dataset.z):this.tapOppMonster(+z.dataset.z));
  },
  renderST(p, el, mine){
    el.innerHTML = p.st.map((s,i)=>`<div class="zone st" data-z="${i}">${s?(mine?cardHTML(s.card):`<div class="cardback"></div>`):""}</div>`).join("");
    if(mine) el.querySelectorAll(".zone").forEach(z=>z.onclick=()=>this.tapMyST(+z.dataset.z));
  },
  render(){
    const P=this.P, A=this.AI; if(!P) return;
    $("myLP").textContent=P.lp; $("oppLP").textContent=A.lp;
    $("myPile").textContent=`Deck ${P.deck.length} · Fusion ${P.extra.length} · Raus ${P.grave.length}`;
    $("oppPile").textContent=`Deck ${A.deck.length} · Fusion ${A.extra.length} · Raus ${A.grave.length}`;
    $("oppHand").innerHTML=A.hand.map(()=>`<div class="cardback"></div>`).join("");
    this.renderST(A,$("oppST"),false); this.renderMZ(A,$("oppMZ"),false);
    this.renderMZ(P,$("myMZ"),true); this.renderST(P,$("myST"),true);
    const my=this.myTurn();
    $("myHand").innerHTML=P.hand.map((c,i)=>{
      let playable=false;
      if(my){ if(c.type==="monster") playable=!P.summoned&&this.tributesNeeded(c)<=this.monsterCount(P)&&(this.tributesNeeded(c)>0||this.freeZone(P.mz)>=0);
        else if(c.type==="spell") playable=this.canActivate(P,c); else playable=this.freeZone(P.st)>=0; }
      return cardHTML(c,playable?"playable":"",`data-i="${i}"`);
    }).join("");
    $("myHand").querySelectorAll(".card").forEach(el=>el.onclick=()=>this.tapHand(+el.dataset.i));
    const am = this.mode&&this.mode.type==="attack" ? P.mz[this.mode.from] : null;
    $("btnDirect").classList.toggle("show", !!(am && this.canDirect(P,am)));
    $("btnEnd").disabled=!my;
  },
};

/* ============================ KI ============================ */
const AI = {
  pickTrap(traps, a){
    const D=Duel, me=D.AI;
    if(!a) return traps[0];
    // starke Angreifer lieber ausschalten/übernehmen, schwache nur abwehren
    const prio = a.atk>=2000 ? ["trap_steal","mirror","trap_destroy_all_atk","trap_bounce","trap_lock","counter_burn","trap_weaken","trap_weaken_all","negate","trap_heal","trap_draw"]
                             : ["trap_destroy_all_atk","counter_burn","trap_draw","trap_heal","trap_weaken","negate","trap_lock","trap_weaken_all","mirror","trap_bounce","trap_steal"];
    traps.sort((x,y)=>prio.indexOf(me.st[x].card.effect)-prio.indexOf(me.st[y].card.effect));
    return traps[0];
  },
  wantSpell(c){
    const D=Duel, me=D.AI, op=D.P, mc=D.monsterCount(me), oc=D.monsterCount(op);
    switch(c.effect){
      case "heal": return me.lp<=START_LP-c.val/2;
      case "heal_per_monster": return me.lp<START_LP && mc>=1;
      case "burn": case "draw": case "destroy_st": case "destroy_all_st": case "revive": case "revive_field": case "discard": case "mill":
      case "search_monster": case "search_spell": case "steal": case "destroy_best": case "destroy_weak": case "bounce": case "weaken": case "destroy_level": return true;
      case "weaken_all": case "lock_all": return oc>=1;
      case "def_mode": return oc>=1 && mc>=1;
      case "boost_all": return mc>=2||(mc>=1&&me.lp<op.lp);
      case "burn_per_monster": return mc>=1;
      case "destroy_all": return oc>mc;
      case "scapegoat": { const w=Math.min(...me.mz.filter(Boolean).map(m=>m.atk)); return w>=op.lp || (mc>=2 && w>=1200); }
      case "reset_atk": { const s=pl=>pl.mz.reduce((t,m)=>t+(m?m.atk-m.card.atk:0),0); return s(op)>s(me); }
      case "boost": return mc>=1;
      case "extra_summon": return false;   // wird nach dem Ausspielen gesondert genutzt
    }
    return false;
  },
  async summonBest(){
    const D=Duel, me=D.AI, op=D.P;
    if(me.summoned) return false;
    let best=-1, bi=-1;
    me.hand.forEach((c,i)=>{ if(c.type!=="monster") return; const need=D.tributesNeeded(c);
      if(need>D.monsterCount(me)) return; if(need===0&&D.freeZone(me.mz)<0) return;
      if(need>0){ const weakest=me.mz.filter(Boolean).map(m=>m.atk).sort((a,b)=>a-b).slice(0,need).reduce((a,b)=>a+b,0); if(c.atk<=weakest) return; }
      const score=c.atk+(c.effect!=="none"?200:0);
      if(score>best){best=score;bi=i} });
    if(bi<0) return false;
    const c=me.hand[bi], need=D.tributesNeeded(c);
    const trib=me.mz.map((m,z)=>m?[m.atk,z]:null).filter(Boolean).sort((a,b)=>a[0]-b[0]).slice(0,need).map(x=>x[1]);
    const strongestOpp=Math.max(0,...op.mz.filter(Boolean).map(m=>m.faceDown?1500:(m.pos==="atk"?m.atk:0)));
    const pos = c.atk>=strongestOpp || c.def<c.atk || c.effect.startsWith("summon_") ? "atk" : "def";
    D.summon(me,bi,pos,trib); await D.idle(); await sleep(600);
    return true;
  },
  async play(){
    const D=Duel, me=D.AI, op=D.P;
    // 1) Fusion, wenn lohnend
    for(let i=me.hand.length-1;i>=0;i--){
      const c=me.hand[i]; if(!c||c.effect!=="fusion") continue;
      const opts=D.fusionOptions(me).filter(o=>o.fusion.atk>Math.max(...o.mats.map(m=>m.atk)));
      if(opts.length){ opts.sort((a,b)=>b.fusion.atk-a.fusion.atk); await D.activateSpell(me,i,null,opts[0]); await D.idle(); await sleep(500); break; }
    }
    // 2) Maßnahmen/Tricks
    for(let i=me.hand.length-1;i>=0;i--){
      if(D.over) return; const c=me.hand[i]; if(!c||c.type!=="spell"||c.effect==="fusion") continue;
      if(!D.canActivate(me,c) || !this.wantSpell(c)) continue;
      const target = c.effect==="boost" ? D.strongest(me) : null;
      await D.activateSpell(me,i,target); await D.idle(); await sleep(500);
      i=Math.min(i,me.hand.length);
    }
    // 3) Reaktionen setzen
    for(let i=me.hand.length-1;i>=0;i--){ if(me.hand[i]&&me.hand[i].type==="trap" && D.freeZone(me.st)>=0){ D.setST(me,i); await sleep(400); } }
    // 4) Charakter ausspielen (+ evtl. zusätzlicher Einsatz)
    if(D.over) return;
    await this.summonBest();
    const ex=me.hand.findIndex(c=>c.effect==="extra_summon");
    if(ex>=0 && me.summoned && me.hand.some(c=>c.type==="monster"&&D.tributesNeeded(c)===0) && D.freeZone(me.mz)>=0){
      await D.activateSpell(me,ex); await D.idle(); await this.summonBest();
    }
    // 5) Angreifen
    if(!D.canBattle()) return;
    for(let z=0;z<ZONES;z++){
      for(let rep=0;rep<2;rep++){
        if(D.over) return; const a=me.mz[z]; if(!D.canAttack(a)) break;
        if(D.canDirect(me,a) && (!D.monsterCount(op) || a.card.effect==="direct")){ await D.attack(me,z,null); await sleep(700); continue; }
        let tgt=-1, tv=-1;
        D.validTargets(op).forEach(i=>{ const m=op.mz[i]; const val=m.faceDown?null:(m.pos==="atk"?m.atk:m.card.def);
          if(val===null){ if(a.atk>=1800 && tgt<0) tgt=i; return; }
          if(a.atk>val && val>tv){tv=val;tgt=i} });
        if(tgt<0) break;
        await D.attack(me,z,tgt); await sleep(700);
      }
    }
  },
};

/* ============================ START ============================ */
$("colType").innerHTML=filterOptions(); $("admType").innerHTML=filterOptions();
$("admTabs").querySelectorAll("span").forEach(s=>s.onclick=()=>Admin.tab(s.dataset.t));
DB.load(); Player.load(); Story.load(); Deck.load(); UI.coins();
$("appVer").textContent = "Version "+(window.APP_VERSION||"dev")+" · 69 Effekte";
window.onAndroidBack = () => UI.back();   // von der Android-App aufgerufen
