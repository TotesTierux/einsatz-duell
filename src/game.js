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

/* ============================ SELTENHEITSSTUFEN (pro Exemplar, nur optisch) ============================ */
const PRINTS = [
  {k:"C",  name:"Common",       short:"C",   w:62},
  {k:"R",  name:"Rare",         short:"R",   w:24},
  {k:"SP", name:"Special Rare", short:"SR",  w:9},
  {k:"SE", name:"Secret Rare",  short:"ScR", w:3.5},
  {k:"GH", name:"Ghost Rare",   short:"GR",  w:1.2},
  {k:"LG", name:"Legendary",    short:"LG",  w:.3},
];
const PRINT = Object.fromEntries(PRINTS.map((p,i)=>[p.k,Object.assign({rank:i},p)]));
/* Stufe auslosen; luck = Skill „Beziehungen/Kontakte“, min = Mindeststufe */
function rollPrint(luck=0, min="C"){
  const ws=PRINTS.map(p=>PRINT[p.k].rank>=2 ? p.w*(1+.25*luck) : p.w);
  let r=Math.random()*ws.reduce((a,b)=>a+b,0), k="C";
  for(let i=0;i<PRINTS.length;i++){ if((r-=ws[i])<0){ k=PRINTS[i].k; break; } }
  return PRINT[k].rank<PRINT[min].rank ? min : k;
}
const RARITY_GEM = {N:"#b8b8b8",R:"#3fa9ff",SR:"#a463ff",UR:"#ffd23f"};

/* ============================ SPIELER / SAMMLUNG ============================ */
const Player = {
  coins:0, owned:{}, prints:{}, show:{}, progress:{}, seen:{},
  load(){
    const d = Store.get("player", null);
    if(!d){ this.coins=500; this.owned={}; this.progress={polizei:0,verbrecher:0};
      DB.cards.filter(c=>c.starter).forEach(c=>this.owned[c.id]=2); this.save(); }
    else Object.assign(this, d);
    this.prints=this.prints||{}; this.show=this.show||{}; this.syncPrints();
  },
  /* Stufen-Zähler mit der Anzahl abgleichen (alte Spielstände: alles Common) */
  syncPrints(){
    Object.keys(this.owned).forEach(id=>{ const n=this.owned[id]||0, p=this.prints[id]||(this.prints[id]={});
      let sum=Object.values(p).reduce((a,b)=>a+b,0);
      if(sum<n) p.C=(p.C||0)+(n-sum);
      for(let i=0; sum>n && i<PRINTS.length; i++){ const k=PRINTS[i].k; while(sum>n && p[k]){ p[k]--; sum--; } if(!p[k]) delete p[k]; }
      if(n<=0){ delete this.owned[id]; delete this.prints[id]; delete this.show[id]; } });
    Object.keys(this.prints).forEach(id=>{ if(!this.owned[id]) delete this.prints[id]; });
  },
  printsOf(id){ return this.prints[id]||{}; },
  bestPrint(id){ const p=this.printsOf(id); let b=null; PRINTS.forEach(x=>{ if(p[x.k]) b=x.k; }); return b; },
  /* angezeigte Stufe: selbst gewählt, sonst die beste */
  display(id){ const s=this.show[id]; return s&&this.printsOf(id)[s] ? s : this.bestPrint(id); },
  remove(id,pr="C",n=1){ const p=this.prints[id]; if(!p||!(p[pr]>=n)) return false; p[pr]-=n; if(!p[pr]) delete p[pr]; this.owned[id]-=n; if(this.owned[id]<=0){ delete this.owned[id]; delete this.prints[id]; delete this.show[id]; } return true; },
  save(){ Store.set("player",{coins:this.coins,owned:this.owned,prints:this.prints,show:this.show,progress:this.progress,prog:this.prog,trophies:this.trophies||[]}); UI.coins(); if(typeof Account!=="undefined") Account.scheduleSave(); },
  has(id){ return this.owned[id]||0; },
  add(id,n=1,pr="C"){ this.owned[id]=(this.owned[id]||0)+n; const p=this.prints[id]||(this.prints[id]={}); p[pr]=(p[pr]||0)+n; },
  earn(n){ this.coins+=n; this.save(); if(n>0) toast(`+🪙${n}`); },
};


/* ============================ PROGRESSION ============================
   - Laufbahn je Partei: XP aus Duellen → Level 1–60, Dienstgrad/Rang alle 5 Level
   - Pro Level-Aufstieg: 1 Skillpunkt + Münzen
   - Skills wirken im Duell (auch online) für die jeweilige Partei
   - Kartenstufen: Mehr Exemplare einer Karte = stärkere Karte (Stufe 1–5)
   ===================================================================== */
const RANKS = {
  polizei:    ["Anwärter","Polizeimeister","Polizeiobermeister","Polizeihauptmeister","Kommissar","Oberkommissar","Hauptkommissar","Erster Hauptkommissar","Polizeirat","Polizeidirektor","Polizeipräsident","Legende des Präsidiums"],
  verbrecher: ["Kleinganove","Taschendieb","Ganove","Bandenmitglied","Vollstrecker","Hehlerkönig","Unterboss","Boss","Kartellchef","Pate","Phantom","Legende der Unterwelt"],
};
const MAX_LEVEL = 60;
const SKILLS = [
  {id:"lp",    max:5, minLv:1,  icon:"❤️", name:{polizei:"Schutzweste",     verbrecher:"Dickes Fell"},   desc:r=>`+${200*r} Start-LP im Duell`},
  {id:"atk",   max:5, minLv:1,  icon:"💪", name:{polizei:"Einsatztraining", verbrecher:"Straßenkampf"},  desc:r=>`Alle eigenen Charaktere +${50*r} ATK`},
  {id:"eff",   max:3, minLv:5,  icon:"📜", name:{polizei:"Dienstvorschrift", verbrecher:"Gerissenheit"}, desc:r=>`Effektwerte eigener Karten +${10*r} %`},
  {id:"coins", max:3, minLv:3,  icon:"🪙", name:{polizei:"Besoldung",       verbrecher:"Beuteanteil"},   desc:r=>`+${10*r} % Münzen aus Duellen`},
  {id:"xp",    max:3, minLv:3,  icon:"🎓", name:{polizei:"Fortbildung",     verbrecher:"Erfahrung"},     desc:r=>`+${10*r} % XP`},
  {id:"luck",  max:3, minLv:8,  icon:"🍀", name:{polizei:"Beziehungen",     verbrecher:"Kontakte"},      desc:r=>`Bessere Booster: +${r} % SR, +${(r*.5).toFixed(1)} % UR`},
  {id:"hand",  max:1, minLv:10, icon:"🃏", name:{polizei:"Lagebesprechung", verbrecher:"Plan B"},        desc:r=>r?"6 statt 5 Startkarten":"+1 Startkarte"},
  {id:"second",max:1, minLv:15, icon:"🚑", name:{polizei:"Rettungsdienst",  verbrecher:"Untertauchen"},  desc:r=>"Einmal pro Duell: bei 0 LP mit 500 LP weiterspielen"},
];
const CARD_LV = [1,3,6,10,15];        // Exemplare für Kartenstufe 1–5

const Prog = {
  data(){
    if(!Player.prog) Player.prog={};
    Object.keys(FACTIONS).forEach(f=>{ const p=Player.prog[f]||(Player.prog[f]={});   // Objekt behalten, nur fehlende Felder ergänzen
      if(p.lv==null) p.lv=1; if(p.xp==null) p.xp=0; if(p.sp==null) p.sp=0; if(!p.skills) p.skills={}; });
    return Player.prog;
  },
  of(f){ return this.data()[f]; },
  need(lv){ return 150+lv*50; },
  rank(f,lv){ return RANKS[f][Math.min(Math.floor((lv-1)/5),RANKS[f].length-1)]; },
  skill(f,id){ return (this.of(f).skills[id])||0; },
  skillsOf(f){ return Object.assign({},this.of(f).skills); },
  spentPoints(f){ return Object.values(this.of(f).skills).reduce((a,b)=>a+b,0); },
  unspent(){ return Object.keys(FACTIONS).reduce((t,f)=>t+this.of(f).sp,0); },
  /* Belohnung nach einem Duell: Münzen und XP inkl. Skill-Boni */
  reward(f, coins, xp){
    const c=Math.round(coins*(1+.1*this.skill(f,"coins"))), x=Math.round(xp*(1+.1*this.skill(f,"xp")));
    Player.coins+=c; const ups=this.gainXP(f,x); Player.save();
    toast(`+🪙${c} · +${x} XP`);
    if(ups.length){ setTimeout(()=>{ banner("LEVEL UP!"); toast(`${FACTIONS[f][1]} Level ${ups[ups.length-1]} – ${this.rank(f,ups[ups.length-1])}! +${ups.length} Skillpunkt${ups.length>1?"e":""}`); },1600); }
    UI.badges();
  },
  gainXP(f,x){
    const p=this.of(f), ups=[];
    if(p.lv>=MAX_LEVEL) return ups;
    p.xp+=x;
    while(p.lv<MAX_LEVEL && p.xp>=this.need(p.lv)){ p.xp-=this.need(p.lv); p.lv++; p.sp++; Player.coins+=25*p.lv; ups.push(p.lv); }
    if(p.lv>=MAX_LEVEL) p.xp=0;
    return ups;
  },
  learn(f,id){
    const s=SKILLS.find(x=>x.id===id), p=this.of(f), r=this.skill(f,id);
    if(!s||r>=s.max) return toast("Schon voll ausgebaut");
    if(p.lv<s.minLv) return toast(`Ab Level ${s.minLv}`);
    if(p.sp<1) return toast("Keine Skillpunkte – gewinne Duelle zum Aufsteigen");
    p.sp--; p.skills[id]=r+1; Player.save(); UI.badges(); this.render(); toast(`${s.icon} ${s.name[f]} Stufe ${r+1}`);
  },
  async reset(f){
    if(!await UI.ask(`Alle ${FACTIONS[f][0]}-Skillpunkte zurücksetzen? Kostet 🪙200.`)) return;
    if(Player.coins<200) return toast("Nicht genug Münzen");
    const p=this.of(f); p.sp+=this.spentPoints(f); p.skills={}; Player.coins-=200; Player.save(); this.render();
  },
  /* Skills auf einen Duell-Spieler anwenden (eigene Seite bzw. Online-Gast) */
  apply(pl, skills){
    skills=skills||{}; const r=id=>Math.max(0,Math.min(skills[id]||0,(SKILLS.find(s=>s.id===id)||{max:0}).max));
    pl.lp += 200*r("lp");
    pl.handSize = HAND + r("hand");
    pl.secondChance = r("second")>0;
    const atk=50*r("atk"), eff=1+.1*r("eff");
    [...pl.deck,...pl.extra].forEach(c=>{
      if(isChar(c)&&atk){ c.atk+=atk; }
      if(eff>1 && c.val && EFFECTS[c.effect] && EFFECTS[c.effect].val && !["summon_draw","draw","trap_draw","summon_discard","discard","summon_mill","mill","destroy_level"].includes(c.effect)) c.val=Math.round(c.val*eff/50)*50||c.val;
    });
    pl.skills=skills;
  },
  /* ---------- Kartenstufen ---------- */
  cardLv(id){ const n=Player.has(id); let lv=0; CARD_LV.forEach((t,i)=>{ if(n>=t) lv=i+1; }); return lv; },
  nextAt(id){ const lv=this.cardLv(id); return lv<CARD_LV.length?CARD_LV[lv]:null; },
  /* Kopie einer Karte mit den Boni ihrer Kartenstufe */
  upgraded(c, lv){
    if(!c) return c; lv = lv==null ? this.cardLv(c.id) : lv; const x=clone(c); x._lv=Math.max(1,lv); if(Player.has(c.id)) x._print=Player.display(c.id);
    const b=x._lv-1; if(!b) return x;
    if(isChar(x)){ x.atk=Math.round(x.atk*(1+.05*b)/50)*50; x.def=Math.round(x.def*(1+.05*b)/50)*50; }
    else if(x.val && EFFECTS[x.effect]&&EFFECTS[x.effect].val && !["draw","trap_draw","discard","mill","destroy_level"].includes(x.effect)) x.val=Math.round(x.val*(1+.1*b)/50)*50||x.val;
    return x;
  },
  /* Deck-Kopien mit den tatsächlich besessenen Stufen versehen (angezeigte Stufe zuerst, dann absteigend) */
  deckCopies(ids){
    const pool={};
    return ids.map(id=>{ const c=this.upgraded(DB.byId(id)); if(!c) return null;
      if(!pool[id]){ const p=Player.printsOf(id), d=Player.display(id); pool[id]=[];
        if(d&&p[d]) for(let i=0;i<p[d];i++) pool[id].push(d);
        [...PRINTS].reverse().forEach(x=>{ if(x.k!==d) for(let i=0;i<(p[x.k]||0);i++) pool[id].push(x.k); }); }
      c._print = pool[id].shift() || c._print || "C"; return c; }).filter(Boolean);
  },
  bonusText(c,lv){ const b=lv-1; if(b<1) return "Keine Boni"; return isChar(c)?`+${5*b} % ATK/DEF`:(EFFECTS[c.effect]&&EFFECTS[c.effect].val&&!["draw","trap_draw","discard","mill","destroy_level"].includes(c.effect)?`+${10*b} % Effektwert`:"Sammelstufe (kein Wertbonus)"); },

  /* ---------- Laufbahn-Bildschirm ---------- */
  tab:"polizei",
  render(){
    const nick=Store.get("nick","")||"";
    $("pfName").value=nick;
    $("pfTabs").innerHTML=Object.keys(FACTIONS).map(f=>{const p=this.of(f);return `<span data-f="${f}" class="${f===this.tab?"on":""}">${FACTIONS[f][1]} Lv ${p.lv}${p.sp?` <b style="color:var(--red)">● ${p.sp}</b>`:""}</span>`}).join("");
    $("pfTabs").querySelectorAll("span").forEach(s=>s.onclick=()=>{this.tab=s.dataset.f;this.render()});
    const f=this.tab, p=this.of(f), need=this.need(p.lv), pct=p.lv>=MAX_LEVEL?100:Math.round(p.xp/need*100);
    const owned=DB.ofFaction(f).filter(c=>Player.has(c.id)), maxed=owned.filter(c=>this.cardLv(c.id)>=5).length;
    $("pfHead").innerHTML=`<div class="rankbadge">${FACTIONS[f][1]}</div><div style="flex:1;min-width:0">
      <div class="rankname">${this.rank(f,p.lv)}</div><div class="muted">Level ${p.lv}${p.lv>=MAX_LEVEL?" (Maximum)":` · ${p.xp}/${need} XP`}</div>
      <div class="xpbar"><i style="width:${pct}%"></i></div></div>`;
    const tr=Player.trophies||[], cups=[1,2,3].map(pl=>tr.filter(t=>t.place===pl).length);
    $("pfCups").innerHTML = tr.length ? `🏆 Pokale: 🥇 ${cups[0]} · 🥈 ${cups[1]} · 🥉 ${cups[2]}` : "🏆 Noch keine Turnier-Pokale – gewinne ein Online-Turnier!";
    $("pfStats").innerHTML=`<div><b>${p.sp}</b><span>Skillpunkte</span></div><div><b>${owned.length}/${DB.ofFaction(f).length}</b><span>Karten</span></div><div><b>${maxed}</b><span>Karten Stufe 5</span></div>`;
    $("pfSkills").innerHTML=SKILLS.map(s=>{const r=this.skill(f,s.id), locked=p.lv<s.minLv, full=r>=s.max;
      return `<div class="skill ${locked?"locked":""}"><div class="sk-ic">${locked?"🔒":s.icon}</div><div class="sk-tx"><b>${s.name[f]}</b>
        <span>${s.desc(Math.max(r,1))}${r?"":" (bei Stufe 1)"}</span><span class="pips">${"●".repeat(r)}${"○".repeat(s.max-r)}${locked?` · ab Level ${s.minLv}`:""}</span></div>
        <button class="small ${full||locked||!p.sp?"ghost":"green"}" data-s="${s.id}" ${full||locked||!p.sp?"disabled":""}>${full?"MAX":"+1"}</button></div>`}).join("");
    $("pfSkills").querySelectorAll("[data-s]").forEach(b=>b.onclick=()=>this.learn(f,b.dataset.s));
  },
  saveNick(){ const n=($("pfName").value||"").trim().slice(0,16); if(!n) return toast("Bitte einen Nickname eingeben"); Store.set("nick",n); UI.badges(); Account.scheduleSave(); toast("Nickname gespeichert: "+n); },
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
  return `<div class="card ${c.type} ${frame} r-${c.rarity} p-${c._print||"C"} ${extra}" ${attrs}>
    <div class="nm ${nf.two?"two":""}"><span class="nmt" style="font-size:${nf.fs}em">${esc(hyph(c.name))}</span><span class="at">${icon}</span></div>
    <div class="lv">${isM?stars:`<span class="lawtag">${c.law}${c.type==="trap"?" · Reaktion":""}</span>`}</div>
    <div class="art" style="--c1:${c.art.c1};--c2:${c.art.c2}">${art}<span class="rar"><i class="gem" style="background:${RARITY_GEM[c.rarity]||"#999"}"></i>${c._print&&c._print!=="C"?PRINT[c._print].short:""}${c._lv>1?` Lv${c._lv}`:""}</span></div>
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
    if(id==="online") Lobby.render();
    if(id==="profile") Prog.render();
    if(id==="tour") Tour.render();
    if(id==="trade") Trade.render();
    if(id==="account") Account.render();
    if(id==="home") this.badges();
  },
  coins(){ ["homeCoins","shopCoins","openCoins"].forEach(i=>{const e=$(i); if(e) e.textContent="🪙 "+Player.coins}); },
  badges(){
    const nick=Store.get("nick","")||"Kein Nickname", pp=Prog.of("polizei"), pv=Prog.of("verbrecher"), sp=Prog.unspent();
    const acc = typeof Account!=="undefined" && Account.enabled() ? (Account.loggedIn()?"☁️ ":"🔓 ") : "";
    const me=$("homeMe"); if(me) me.innerHTML=`${acc}👤 ${esc(nick)} · 👮${pp.lv} · 🦹${pv.lv}${sp?'<span class="dot"></span>':""}`;
    const b=$("btnProfile"); if(b) b.innerHTML=`⭐ Laufbahn${sp?` (${sp})`:""}`;
  },
  back(){ // Android-Zurück-Taste
    if($("reveal").classList.contains("show")){return true}
    if($("scene").classList.contains("show")){Scene.finish();return true}
    if($("modal").classList.contains("show")){this.closeModal();return true}
    if(this.current==="editor"){Admin.cancel();return true}
    if(this.current==="storyEditor"){StoryEd.back();return true}
    if(this.current==="duel"){Duel.quit();return true}
    if(this.current==="opening"){this.show("shop");return true}
    if(this.current==="tour"){Tour.leave();return true}
    if(this.current==="trade"){Trade.leave();return true}
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
    const list=DB.cards.filter(c=>matchFilter(c,t)&&c.name.toLowerCase().includes(q)&&(!o||(o==="own"?Player.has(c.id):o==="fancy"?PRINT[Player.bestPrint(c.id)||"C"].rank>=3:!Player.has(c.id))));
    const ownedCount=DB.cards.filter(c=>Player.has(c.id)).length;
    $("colCount").textContent=`${ownedCount}/${DB.cards.length}`;
    $("colList").innerHTML = list.map(c=>{const n=Player.has(c.id), lv=Prog.cardLv(c.id), nx=Prog.nextAt(c.id);
      return `<div class="ownwrap">${n?`<span class="cnt">×${n}</span>`:""}${cardHTML(n?Prog.upgraded(c,lv):c,n?"":"owned0",`data-id="${c.id}"`)}
        ${n?`<div class="lvbar" title="Kartenstufe"><i style="width:${nx?Math.round(n/nx*100):100}%"></i><span>Lv${lv}${nx?` · ${n}/${nx}`:" MAX"}</span></div>`:""}</div>`}).join("") || `<p class="muted">Keine Karten gefunden.</p>`;
    $("colList").querySelectorAll(".card").forEach(el=>el.onclick=()=>this.cardInfo(el.dataset.id));
  },
  /* Karte in der Sammlung: Kartenstufe, Seltenheitsstufen und Anzeige wählen */
  cardInfo(id){
    const c=DB.byId(id), n=Player.has(id), lv=Prog.cardLv(id), nx=Prog.nextAt(id);
    if(!n) return this.modal(c,[["Noch nicht in deiner Sammlung",null,"ghost"]]);
    const p=Player.printsOf(id), cur=Player.display(id);
    const acts=[[`Kartenstufe ${lv}: ${Prog.bonusText(c,lv)}${nx?` · Stufe ${lv+1} bei ${nx} Exemplaren`:" · Maximum"}`,null,"ghost"],
      [`Exemplare: ${PRINTS.filter(x=>p[x.k]).map(x=>`${x.name} ×${p[x.k]}`).join(", ")}`,null,"ghost"]];
    PRINTS.filter(x=>p[x.k]&&x.k!==cur).reverse().forEach(x=>acts.push([`✨ Als ${x.name} anzeigen`,()=>{ Player.show[id]=x.k; Player.save(); this.renderCollection(); setTimeout(()=>this.cardInfo(id),50); },"blue"]));
    this.modal(Prog.upgraded(c,lv), acts);
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
        onEnd:win=>{ Prog.reward(side, win?100:25, win?100:40); return Promise.resolve(); } });
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
  async unlockAll(){ if(!await UI.ask("Alle Karten 3× in die Sammlung legen?")) return; DB.cards.forEach(c=>Player.owned[c.id]=Math.max(3,Player.has(c.id))); Player.syncPrints(); Player.save(); this.renderPlayer(); toast("Alles freigeschaltet"); },
  async resetCollection(){ if(!await UI.ask("Sammlung auf das Startset zurücksetzen?")) return;
    Player.owned={}; Player.prints={}; Player.show={}; DB.cards.filter(c=>c.starter).forEach(c=>Player.owned[c.id]=2); Player.syncPrints(); Player.save(); Deck.prune(); this.renderPlayer(); toast("Sammlung zurückgesetzt"); },
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
    delete Player.owned[id]; Player.syncPrints(); Player.save(); Deck.prune();
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
  save(){ Store.set("decks",this.lists); if(typeof Account!=="undefined") Account.scheduleSave(); },
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
      if(c.type==="fusion") return `<div class="deckitem"><span class="cnt" style="background:var(--purple)">${Math.min(3,Player.has(c.id))}</span>${cardHTML(Prog.upgraded(c),"",`data-id="${c.id}"`)}</div>`;
      return `<div class="deckitem">${n?`<span class="cnt">${n}</span>`:""}${cardHTML(Prog.upgraded(c),"",`data-id="${c.id}"`)}
      <div class="ctrl"><button class="red" data-sub="${c.id}">−</button><span class="muted" style="align-self:center">/${this.limit(c.id)}</span><button class="green" data-add="${c.id}">＋</button></div></div>`}).join("")
      || `<p class="muted">${f==="fusion"?"Noch keine Fusionen – im Shop gibt es welche!":"Keine passenden Karten in deiner Sammlung."}</p>`;
    $("deckList").querySelectorAll("[data-add]").forEach(b=>b.onclick=()=>this.add(b.dataset.add));
    $("deckList").querySelectorAll("[data-sub]").forEach(b=>b.onclick=()=>this.sub(b.dataset.sub));
    $("deckList").querySelectorAll(".card").forEach(el=>el.onclick=()=>UI.cardInfo(el.dataset.id));
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
  rollRarity(min="N", fac){
    const luck = fac ? Prog.skill(fac,"luck") : Math.max(Prog.skill("polizei","luck"),Prog.skill("verbrecher","luck"));
    const ur=2+luck*.5, sr=ur+8+luck;
    const r=Math.random()*100; let rar = r<ur?"UR":r<sr?"SR":r<sr+20?"R":"N";
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
      out.push(this.pickCard(pool.filter(c=>!p.fusion||c.type!=="fusion"), this.rollRarity(min,p.faction)));
    }
    const luck = p.faction ? Prog.skill(p.faction,"luck") : Math.max(Prog.skill("polizei","luck"),Prog.skill("verbrecher","luck"));
    const prs = out.map(()=>rollPrint(luck));
    if(p.premium && !prs.some(k=>PRINT[k].rank>=2)) prs[prs.length-1]=rollPrint(luck,"SP");   // Gold-Akte: mind. 1× Special Rare
    this.pulled=out.map((c,i)=>{ const x=clone(c); x._print=prs[i]; return {c:x, isNew:!Player.has(c.id), newPrint:Player.has(c.id)&&!Player.printsOf(c.id)[prs[i]]&&PRINT[prs[i]].rank>PRINT[Player.bestPrint(c.id)||"C"].rank}; });
    out.forEach((c,i)=>Player.add(c.id,1,prs[i])); Player.save();
    this.last=id; this.revealed=out.map(()=>false);
    $("openTitle").textContent=p.icon+" "+p.name; $("btnAgain").textContent=`Nochmal (🪙${p.price})`;
    UI.show("opening"); this.renderOpen();
  },
  renderOpen(){
    $("openCards").innerHTML=this.pulled.map((x,i)=>this.revealed[i]
      ? `<div class="ownwrap">${x.isNew?'<span class="new">NEU!</span>':x.newPrint?'<span class="new">NEUE STUFE!</span>':""}${cardHTML(x.c,"flip",`data-i="${i}"`)}<div class="prname pn-${x.c._print}">${PRINT[x.c._print].name}</div></div>`
      : `<div class="cardback" data-i="${i}"></div>`).join("");
    $("openCards").querySelectorAll("[data-i]").forEach(el=>el.onclick=()=>{const i=+el.dataset.i;
      if(!this.revealed[i]){ this.revealed[i]=true; const pr=this.pulled[i].c._print; if(PRINT[pr].rank>=2) banner(PRINT[pr].name.toUpperCase()+"!"); this.renderOpen(); }
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
          if(!win){ Prog.reward(f,25,40); return res(); }
          const first=i>=(Player.progress[f]||0);
          if(first){ Player.progress[f]=i+1; }
          Prog.reward(f, first?c.reward:50, first?150+25*i:60);
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
  const get = x => typeof x==="string" ? DB.byId(x) : x;
  const deck = shuffle(deckIds.map(get).filter(Boolean).map(clone));
  const extra = (extraIds||[]).map(get).filter(Boolean).map(clone);
  return {name, lp:lp||START_LP, deck, extra, hand:[], grave:[], mz:Array(ZONES).fill(null), st:Array(ZONES).fill(null), summoned:false};
}

const Duel = {
  P:null, AI:null, history:[], turn:0, online:false, host:false, client:false, waiting:false, active:null, busy:false, over:false, ready:false, opts:{},
  mode:null,       // null | {type:"attack",from} | {type:"tribute",handIdx,need,picked:[],pos} | {type:"boost",handIdx}
  start(side, opts={}){
    this.side=side; this.opts=opts;
    const other = OTHER[side];
    if(!DB.ofFaction(other).length) return toast("Die Gegenpartei hat keine Karten");
    let myDeck = Deck.validFor(side) ? Deck.lists[side] : Deck.autoOwned(side);
    if(myDeck.length<10){ toast("Zu wenige eigene Karten – Leihdeck wird benutzt"); myDeck=Deck.genDeck(side,{maxRarity:"R"}).main; }
    else if(!Deck.validFor(side)) toast("Kein gültiges Deck – automatisches Deck aus deiner Sammlung");
    const od = opts.oppDeck || Deck.genDeck(other,{});
    const on = opts.online;   // {myName, guestName, guestDeck, guestExtra}
    this.online=!!on; this.host=!!on; this.client=false; this.waiting=false;
    this.P = makePlayer(on?on.myName:(Store.get("nick","")||"Du"), Prog.deckCopies(myDeck), Prog.deckCopies(Deck.fusionDeck(side)));
    if(!on) this.P.name="Du";
    this.AI = on ? makePlayer(on.guestName, on.guestDeck, on.guestExtra) : makePlayer(opts.oppName||FACTIONS[other][0], od.main, od.extra, opts.oppLP);
    Prog.apply(this.P, Prog.skillsOf(side));
    this.AI.handSize=HAND; if(on) Prog.apply(this.AI, on.guestSkills);
    // jede Kartenkopie bekommt einen eindeutigen Schlüssel (für die Online-Übertragung)
    [[this.P,"h"],[this.AI,"g"]].forEach(([pl,pre])=>[...pl.deck,...pl.extra].forEach((c,i)=>c._k=pre+i));
    this.turn=0; this.over=false; this.mode=null; this.busy=false; this.ready=false; this.history=[]; this._ann=null;
    $("reveal").classList.remove("show"); $("fx").innerHTML="";
    for(let i=0;i<Math.max(this.P.handSize||HAND,this.AI.handSize||HAND);i++){ if(i<(this.P.handSize||HAND)) this.draw(this.P,true); if(i<(this.AI.handSize||HAND)) this.draw(this.AI,true); }
    $("oppWho").textContent=`${opts.oppEmoji||FACTIONS[other][1]} ${this.AI.name}`;
    $("myWho").textContent=`${FACTIONS[side][1]} ${on?this.P.name:"Du"} – ${FACTIONS[side][0]}`;
    if(on) Net.sendStart();
    UI.show("duel");
    this.log(side==="polizei"?"Einsatz beginnt – schnappt die Verbrecher!":"Die Polizei ist dir auf den Fersen!"); banner("EINSATZ!");
    this.active = Math.random()<.5 ? this.P : this.AI;
    setTimeout(()=>this.beginTurn(), 900);
  },
  opp(p){ return p===this.P?this.AI:this.P; },
  me(p,du,er){ return p===this.P&&!this.online?du:`${p.name} ${er}`; },
  who(p){ return p===this.P&&!this.online?"Du":p.name; },
  bn(text){ banner(text); if(this.host) Net.send({t:"fx",k:"banner",text}); },
  log(msg, who){
    who = who || (this.active===this.AI?"opp":"me");
    $("log").textContent=msg; this.history.push({t:Math.ceil(this.turn/2)||1, who, msg}); if(this.history.length>250) this.history.shift();
    if(this.host) Net.send({t:"log", msg, who: who==="opp"?"me":"opp"});
  },
  showHistory(){
    $("modalCard").innerHTML=`<h2 style="color:var(--yellow);text-align:center;margin-bottom:8px">Einsatzprotokoll</h2><div class="histlist">${
      this.history.slice().reverse().map(h=>`<div><span class="t">Zug ${h.t} ${h.who==="opp"?"🤖":"😎"}</span>${esc(h.msg)}</div>`).join("")||"Noch nichts passiert."}</div>`;
    $("modalActs").innerHTML=""; const x=document.createElement("button");x.textContent="Schließen";x.className="ghost";x.onclick=()=>UI.closeModal();$("modalActs").appendChild(x);
    UI._onClose=null; $("modal").classList.add("show");
  },

  /* ---------- Ansage: gegnerische Karte groß zeigen – schließt nur per Tipp ---------- */
  announce(p, card, head, result){
    if(this.host && p===this.P && !this.over){ Net.send({t:"ann", c:card._k, head, result}); return this._ann||Promise.resolve(); }
    if(p!==this.AI || this.over) return this._ann||Promise.resolve();
    return this.showReveal(card, head, result);
  },
  showReveal(card, head, result){
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
    if(p.lp<=0 && p.secondChance){ p.secondChance=false; p.lp=500; this.bn(p.skills&&p.skills.second?"ZWEITE CHANCE!":"ZWEITE CHANCE!"); this.log(`${p.name}: Zweite Chance – weiter mit 500 LP!`); return; }
    if(p.lp<=0) this.win(this.opp(p));
  },
  heal(p,n){ if(n<=0) return; p.lp+=n; this.floatText(p===this.P?$("myLP"):$("oppLP"), `+${n}`, "#3ddc84"); this.log(`${this.me(p,"Du erhältst","erhält")} ${n} LP`); },
  win(p){
    if(this.over) return; this.over=true; this.render(); this.closeReveal();
    if(this.host) Net.send({t:"end", w: p===this.P?"h":"g"});
    const won = p===this.P;
    setTimeout(()=>{ banner(won?(this.side==="polizei"?"FALL GELÖST!":"ENTKOMMEN!"):(this.side==="polizei"?"ENTKOMMEN…":"GESCHNAPPT!"));
      setTimeout(async()=>{
        const onEnd=this.opts.onEnd; this.opts.onEnd=null;
        if(onEnd) await onEnd(won);
        if(UI.current!=="duel") return;
        if(this.online && Tour.active()) return UI.modal(null,[["🏆 Zum Turnier",()=>{Net.endDuelConn();UI.show("tour")},"red"]]);
        const again = this.online ? ["🌐 Online-Lobby",()=>{Net.close();UI.show("online")},"red"] : this.opts.oppName ? ["📖 Zur Story",()=>UI.show("story"),"red"] : ["Nochmal",()=>UI.startDuel(),"red"];
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
    if(p===this.AI && this.host) return;   // Gast ist am Zug – Aktionen kommen über Net
    if(p===this.AI){ this.busy=true; await sleep(1100); try{ await AI.play(); }catch(e){ console.error(e); } await this.idle(); this.busy=false; if(!this.over) this.endTurn(true); }
  },
  endTurn(fromAI){
    if(this.client){ if(this.myTurn()) this.sendAct("endTurn",[]); return; }
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
    else { this.announce(p,c,head,extra); this.monsterEffect(p,c); }
  },
  sendAct(fn,args){ Net.send({t:"act",fn,a:args}); this.waiting=true; this.mode=null; this.render(); return true; },
  summon(p, handIdx, pos, tributes=[]){
    if(this.client) return this.sendAct("summon",[handIdx,pos,tributes]);
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
    if(this.client) return this.sendAct("changePos",[z]);
    const m=p.mz[z]; if(!m||m.changed||m.attacks) return;
    const wasDown=m.faceDown; m.pos = m.pos==="atk"?"def":"atk"; m.changed=true;
    this.log(`${m.card.name} wechselt in ${m.pos==="atk"?"Angriffs":"Verteidigungs"}position`);
    if(m.pos==="atk" && wasDown){ m.faceDown=false; this.triggerSummon(p,m.card,`${p.name} deckt einen Charakter auf!`); }
    this.render();
  },
  setST(p, handIdx){
    if(this.client) return this.sendAct("setST",[handIdx]);
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
    this.place(p,f,"atk"); this.bn("FUSION!");
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
    if(this.client){
      let fid=null;
      if(c.effect==="fusion"){ const o=await this.pickFusion(this.fusionOptions(p)); if(!o) return false; fid=o.fusion.id; }
      return this.sendAct("activateSpell",[handIdx, targetZ==null?null:targetZ, fid]);
    }
    const o=this.opp(p), v=c.val;
    if(!this.canActivate(p,c)){ if(p===this.P) toast("Kein passendes Ziel!"); return false; }
    if(c.effect==="boost" && (targetZ==null||!p.mz[targetZ])) return false;
    if(c.effect==="fusion"){
      if(!fusionOpt){ const opts=this.fusionOptions(p); fusionOpt = p===this.P ? await this.pickFusion(opts) : opts[0]; }
      if(!fusionOpt) return false;
    }
    p.hand.splice(p.hand.indexOf(c),1); p.grave.push(c);
    await this.announce(p,c,`${p.name} setzt ${c.law==="Trick"?"einen Trick":"eine "+c.law+"-Maßnahme"} ein!`,this.spellPreview(p,c,targetZ));
    if(this.over) return false;
    this.bn(c.law==="Trick"?c.name+"!":c.law+"!"); this.fxStamp(c);
    this.log(`${this.who(p)}: ${c.name}${c.ref&&c.ref!==c.law?" ("+c.ref+")":""}`);
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
    } else if(this.host){
      const r = await Net.ask("trap",{traps:traps.map(i=>d.st[i].card._k), att:attacker.mz[fromZ]?attacker.mz[fromZ].card.name:"?"});
      ti = r>=0 && r<traps.length ? traps[r] : -1;
    } else ti=AI.pickTrap(traps, attacker.mz[fromZ]);
    if(ti<0) return false;
    const t=d.st[ti].card; d.st[ti]=null; d.grave.push(t);
    const a=attacker.mz[fromZ];
    await this.announce(d,t,`${d.name} reagiert auf deinen Angriff!`,`Gegen: ${a?a.card.name:"deinen Angreifer"}`);
    if(this.over) return true;
    this.bn(t.law==="Trick"?t.name+"!":t.law+"!"); this.fxStamp(t);
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
    if(this.client){ if(this.canAttack(a) && (toZ!=null || this.canDirect(p,a))) this.sendAct("attack",[fromZ,toZ]); return; }
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
    } finally { this.render(); this.busy = this.active===this.AI && !this.over && !this.host; }
  },

  /* ---------- Animationen ---------- */
  zoneEl(p,z){ const el=(p===this.P?$("myMZ"):$("oppMZ")); return el&&el.children[z]; },
  async fxAttack(p, fromZ, toZ){
    if(this.host) Net.send({t:"fx",k:"atk",s:p===this.P?"h":"g",from:fromZ,to:toZ});
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
    if(this.host) Net.send({t:"fx",k:"poof",s:p===this.P?"h":"g",z});
    const el=this.zoneEl(p,z); if(!el||UI.current!=="duel") return;
    const r=el.getBoundingClientRect(), s=document.createElement("div"); s.className="fx-part"; s.textContent="💨";
    s.style.left=(r.left+r.width/2)+"px"; s.style.top=(r.top+r.height/2)+"px"; s.style.fontSize="54px"; $("fx").appendChild(s);
    s.animate([{transform:"translate(-50%,-50%) scale(.5)",opacity:1},{transform:"translate(-50%,-70%) scale(1.8)",opacity:0}],{duration:REDUCED()?300:700}).finished.then(()=>s.remove());
  },
  fxStamp(c){
    if(this.host) Net.send({t:"fx",k:"stamp",c:c._k});
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
  myTurn(){ return this.active===this.P && this.ready && !this.busy && !this.over && !(this.client && this.waiting); },
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
  async quit(){ if(this.over||await UI.ask("Einsatz abbrechen? (zählt als Niederlage)")){
    if(this.online && !this.over) Net.send({t:"quit"});
    const inTour = this.online && Tour.active();
    if(inTour && !this.over) Tour.duelEnded(false, 0, 1);
    this.over=true; this.opts.onEnd=null; this.closeReveal();
    if(inTour){ Net.endDuelConn(); UI.show("tour"); } else { if(this.online) Net.close(); UI.show("home"); } } },

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
    if(this.host) Net.queueState();
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

/* ============================ ONLINE-MODUS ============================
   Peer-to-Peer über PeerJS (WebRTC). Kein eigener Server nötig: Der kostenlose
   PeerJS-Vermittlungsserver hilft nur beim Verbindungsaufbau, danach laufen die Daten
   direkt zwischen den Geräten.
   Gastgeber (host) rechnet das komplette Duell; der Gast (client) schickt nur seine
   Aktionen und bekommt nach jeder Änderung den neuen Spielstand.
   ===================================================================== */
const HIDDEN = {id:"?",_k:null,name:"Verdeckt",faction:"polizei",type:"monster",attr:"streife",level:1,atk:0,def:0,effect:"none",val:0,rarity:"N",
  law:"StPO",ref:"",materials:[],text:"",art:{emoji:"❓",c1:"#ccc",c2:"#555",img:""}};
const ONLINE_WIN=150, ONLINE_LOSS=30;

const Net = {
  peer:null, conn:null, role:null, code:"", table:{}, pend:{}, rid:0, actQ:Promise.resolve(), _sq:false, closing:false,
  cfg(){ return Object.assign({debug:0}, Store.get("peercfg",{})); },   // für Tests: eigener PeerServer
  pid(code){ return "einsatzduell-"+code.toLowerCase(); },
  newCode(){ const A="ABCDEFGHJKMNPQRSTUVWXYZ23456789"; return Array.from({length:5},()=>A[Math.floor(Math.random()*A.length)]).join(""); },
  available(){ return typeof Peer!=="undefined"; },
  /* Eigene Peer-Verbindung zum Vermittlungsserver öffnen (id = Raumcode für Gastgeber, sonst zufällig) */
  openPeer(id, onOpen, onFail){
    try{ this.peer&&this.peer.destroy(); }catch(e){}
    this.closing=false; let opened=false;
    const p=new Peer(id||undefined, this.cfg()); this.peer=p;
    p.on("open",()=>{ opened=true; onOpen&&onOpen(p); });
    p.on("connection",c=>this.route(c));
    p.on("disconnected",()=>{ if(!this.closing){ try{ p.reconnect(); }catch(e){} } });
    p.on("error",e=>{
      if(!opened){ onFail&&onFail(e); return; }
      if(e.type==="peer-unavailable" && Tour.expect && Tour.expect.role==="client") return Tour.matchFailed();
      if(e.type==="peer-unavailable" && this.role==="client" && !Tour.active()) return Lobby.error("Raum "+this.code+" nicht gefunden. Code prüfen – ist der Gastgeber noch in der Lobby?");
      if(!Tour.active()) Lobby.error(e); else console.warn("Peer:",e.type);
    });
  },
  /* Eingehende Verbindungen verteilen: Turnier-Match, Turnier-Beitritt oder normales Duell */
  route(c){
    const k=c.metadata&&c.metadata.kind;
    if(k==="match") return this.acceptMatch(c);
    if(Tour.hosting) return Tour.addMember(c);
    if(this.role==="tradehost") return Trade.accept(c);
    if(this.role==="host") return this.acceptDuel(c);
    try{ c.close(); }catch(e){}
  },
  reject(c,t){ c.on("open",()=>{ try{ c.send({t}); }catch(e){} setTimeout(()=>{ try{c.close()}catch(e){} },500); }); },
  acceptDuel(c){
    if(this.conn) return this.reject(c,"busy");
    this.conn=c;
    c.on("open",()=>{ this.wire(c); this.send({t:"welcome",name:this.name,side:this.side,v:window.APP_VERSION||"dev"}); Lobby.status("Gegner verbunden – Duell startet …"); });
  },
  acceptMatch(c){
    const e=Tour.expect;
    if(!e || e.role!=="host" || !c.metadata || c.metadata.mid!==e.mid || this.conn) return this.reject(c,"busy");
    this.conn=c; this.role="host"; this.side=e.hostSide; this.name=Tour.myName();
    c.on("open",()=>{ this.wire(c); this.send({t:"welcome",name:this.name,side:this.side,v:window.APP_VERSION||"dev",mid:e.mid}); });
  },
  host(side,name){
    this.close(); this.role="host"; this.side=side; this.name=name; this.code=this.newCode();
    Lobby.status("Raum wird erstellt …");
    this.openPeer(this.pid(this.code), ()=>Lobby.showCode(this.code), e=>{ if(e.type==="unavailable-id") return this.host(side,name); Lobby.error(e); });
  },
  join(code,name){
    this.close(); this.role="client"; this.name=name; this.code=code.toUpperCase();
    Lobby.status("Verbinde mit Raum "+this.code+" …");
    this.openPeer(null, p=>{ const c=p.connect(this.pid(this.code),{reliable:true,metadata:{kind:"join"}}); this.conn=c; c.on("open",()=>this.wire(c)); }, e=>Lobby.error(e));
  },
  /* Turnier: direkte Verbindung zum Match-Gegner aufbauen */
  connectMatch(peerId, mid){
    if(!this.peer) return Tour.matchFailed();
    this.role="client"; this.name=Tour.myName();
    const c=this.peer.connect(peerId,{reliable:true,metadata:{kind:"match",mid}}); this.conn=c; c.on("open",()=>this.wire(c));
  },
  wire(c){ c=c||this.conn; c.on("data",m=>{ try{ this.onData(m,c); }catch(e){ console.error(e); } }); c.on("close",()=>this.onConnClose(c)); },
  send(m){ try{ if(this.conn&&this.conn.open) this.conn.send(m); }catch(e){ console.error(e); } },
  sendTo(c,m){ try{ if(c&&c.open) c.send(m); }catch(e){ console.error(e); } },
  ask(kind,data){ return new Promise(res=>{ const id=++this.rid; this.pend[id]=res; this.send({t:"ask",id,kind,data}); }); },
  /* nur die Duell-Verbindung beenden (Turnier-Verbindung bleibt bestehen) */
  endDuelConn(){ const c=this.conn; this.conn=null; this.pend={}; if(c&&c===Tour.vc) Tour.vc=null; try{ c&&c.close(); }catch(e){} },
  close(){ this.closing=true; try{ this.conn&&this.conn.close(); }catch(e){} try{ Trade.conn&&Trade.conn.close(); }catch(e){} Tour.reset(); Trade.reset(); try{ this.peer&&this.peer.destroy(); }catch(e){} this.conn=null; this.peer=null; this.pend={}; },
  onConnClose(c){
    if(this.closing) return;
    if(Tour.hub===c) return Tour.onHubClose();
    if(c._tid) return Tour.onMemberClose(c);
    if(c._trade) return Trade.onClose();
    if(c!==this.conn) return;
    this.conn=null;
    if(UI.current==="duel" && Duel.online && !Duel.over){ toast("Verbindung zum Gegner verloren"); Duel.opponentLeft(); }
    else if(UI.current==="online") Lobby.error("Verbindung getrennt");
  },
  onClose(){ this.onConnClose(this.conn); },
  queueState(){ if(this._sq) return; this._sq=true; Promise.resolve().then(()=>{ this._sq=false; this.send({t:"state",s:Duel.snap()}); }); },
  sendStart(){
    const table={}; [Duel.P,Duel.AI].forEach(pl=>[...pl.deck,...pl.extra,...pl.hand].forEach(c=>table[c._k]=c));
    this.send({t:"start", table, hostName:Duel.P.name, guestName:Duel.AI.name, hostSide:Duel.side});
  },
  onData(m,c){
    if(m && typeof m.t==="string" && m.t.startsWith("t_")) return Tour.onData(m,c);
    if(m && typeof m.t==="string" && m.t.startsWith("tr_")) return Trade.onData(m,c);
    switch(m.t){
      // ---- beim Gast ----
      case "welcome": {
        if(m.v && window.APP_VERSION && m.v!==window.APP_VERSION) toast(`Andere Spielversion beim Gegner (${m.v}) – am besten beide aktualisieren`);
        const side=OTHER[m.side];
        const deckIds = Deck.validFor(side) ? Deck.lists[side] : Deck.autoOwned(side);
        const deck = deckIds.length>=10 ? Prog.deckCopies(deckIds) : Deck.genDeck(side,{maxRarity:"R"}).main.map(id=>Prog.upgraded(DB.byId(id))).filter(Boolean);
        const extra = Prog.deckCopies(Deck.fusionDeck(side));
        this.send({t:"join", name:this.name, deck, extra, skills:Prog.skillsOf(side), v:window.APP_VERSION||"dev"});
        Lobby.status(`Verbunden mit ${m.name} – Duell startet …`);
        break; }
      case "busy": Lobby.error("Dieser Raum ist schon voll."); break;
      case "start": Duel.startClient(m); break;
      case "state": Duel.applyState(m.s); break;
      case "ack": Duel.waiting=false; Duel.render(); break;
      case "log": Duel.history.push({t:Math.ceil(Duel.turn/2)||1, who:m.who, msg:m.msg}); $("log").textContent=m.msg; break;
      case "ann": { const c=this.table[m.c]; if(c) Duel.showReveal(c,m.head,m.result); break; }
      case "fx": Duel.clientFx(m); break;
      case "ask": Duel.clientAsk(m); break;
      case "end": Duel.endClient(m.w==="g"); break;
      // ---- beim Gastgeber ----
      case "join": {
        if(m.v && window.APP_VERSION && m.v!==window.APP_VERSION) toast(`Andere Spielversion beim Gegner (${m.v}) – am besten beide aktualisieren`);
        Duel.start(this.side,{ online:{myName:this.name, guestName:m.name||"Gast", guestDeck:m.deck, guestExtra:m.extra, guestSkills:m.skills||{}},
          onEnd:win=>{ Prog.reward(Duel.side, win?ONLINE_WIN:ONLINE_LOSS, win?150:60); Tour.duelEnded(win, Duel.P.lp, Duel.AI.lp); return Promise.resolve(); } });
        break; }
      case "act": this.actQ=this.actQ.then(()=>this.runAct(m)).catch(e=>console.error(e)).then(()=>{ this.queueState(); this.send({t:"ack"}); }); break;
      case "reply": { const f=this.pend[m.id]; delete this.pend[m.id]; f&&f(m.val); break; }
      // ---- beide ----
      case "quit": if(UI.current==="duel" && !Duel.over){ toast("Der Gegner hat aufgegeben"); Duel.opponentLeft(); } break;
    }
  },
  /* Aktion des Gastes beim Gastgeber ausführen (nur wenn der Gast wirklich am Zug ist) */
  async runAct(m){
    const D=Duel, G=D.AI;
    if(!D.host || D.over || D.active!==G || !D.ready) return;
    const a=m.a||[];
    switch(m.fn){
      case "summon": D.summon(G,a[0],a[1],a[2]||[]); break;
      case "setST": D.setST(G,a[0]); break;
      case "changePos": D.changePos(G,a[0]); break;
      case "activateSpell": { let opt; if(a[2]) opt=D.fusionOptions(G).find(o=>o.fusion.id===a[2]); if(a[2]&&!opt) break;
        await D.activateSpell(G,a[0],a[1],opt); break; }
      case "attack": await D.attack(G,a[0],a[1]); break;
      case "endTurn": await D.idle(); D.endTurn(true); break;
    }
    await D.idle();
  },
};

/* ============================ TURNIER ============================
   Ein Turnier-Raum (Gastgeber = Zentrale) mit bis zu 8 Spielern.
   Formate: K.-o.-System ("ko") oder Jeder gegen jeden ("rr").
   Die Zentrale verteilt die Paarungen; die beiden Spieler eines Matches verbinden
   sich direkt miteinander (Peer-to-Peer) und spielen ein normales Online-Duell.
   Das Ergebnis meldet jeder Spieler an die Zentrale (doppelte Meldungen werden ignoriert).
   ===================================================================== */
const TOUR_MAX=8;
/* Virtuelle Verbindung: Duell-Nachrichten laufen über die Turnier-Zentrale statt direkt */
class RelayConn {
  constructor(mid){ this.mid=mid; this.open=true; this.peer="relay"; this._h={data:[],close:[]}; }
  on(ev,fn){ (this._h[ev]=this._h[ev]||[]).push(fn); if(ev==="open") setTimeout(fn,0); }
  emit(ev,arg){ (this._h[ev]||[]).forEach(f=>{ try{ f(arg); }catch(e){ console.error(e); } }); }
  send(m){ if(this.open) Tour.relaySend(this.mid,m); }
  close(){ if(!this.open) return; this.open=false; this.emit("close"); }
}
const TOUR_PRIZE = {1:{coins:500,xp:400,cup:"🥇"}, 2:{coins:250,xp:200,cup:"🥈"}, 3:{coins:120,xp:120,cup:"🥉"}};
const Tour = {
  hosting:false, member:false, hub:null, conns:{}, seq:0, myId:null,
  players:[], matches:[], format:"ko", status:"lobby", round:0, rrRounds:[], view:null, expect:null, _failT:null, finished:null,
  active(){ return this.hosting||this.member; },
  myName(){ return Store.get("nick","")||"Spieler"; },
  reset(){ clearTimeout(this._failT); this.vc=null; this._buf=[]; Object.assign(this,{hosting:false,member:false,hub:null,conns:{},seq:0,myId:null,players:[],matches:[],status:"lobby",round:0,rrRounds:[],view:null,expect:null,finished:null}); },
  isMemberConn(c){ return !!(c&&c._tid); },

  /* ---------------- Zentrale (Gastgeber) ---------------- */
  create(format){
    const n=Lobby.name(); if(!n) return;
    Net.close(); this.reset(); this.hosting=true; this.format=format; this.myId="org";
    Net.role="tour"; Net.code=Net.newCode(); Net.name=n;
    this.players=[{id:"org",name:n,side:Lobby.side,peer:Net.pid(Net.code),online:true}];
    Lobby.status("Turnier-Raum wird erstellt …");
    const open=()=>Net.openPeer(Net.pid(Net.code), ()=>{ UI.show("tour"); this.broadcast(); },
      e=>{ if(e.type==="unavailable-id"){ Net.code=Net.newCode(); this.players[0].peer=Net.pid(Net.code); return open(); } Lobby.error(e); this.reset(); });
    open();
  },
  addMember(c){
    if(this.status!=="lobby") return Net.reject(c,"t_started");
    if(this.players.length>=TOUR_MAX) return Net.reject(c,"t_full");
    const id="m"+(++this.seq); c._tid=id; this.conns[id]=c;
    c.on("open",()=>{ Net.wire(c); Net.sendTo(c,{t:"t_welcome",you:id,format:this.format,host:this.players[0].name}); });
  },
  sendToPlayer(id,m){ if(id===this.myId) return this.onData(m,null); Net.sendTo(this.conns[id],m); },
  broadcast(){
    this.view=this.buildView();
    Object.values(this.conns).forEach(c=>Net.sendTo(c,{t:"t_state",v:this.view}));
    this.render();
  },
  buildView(){
    return {format:this.format, status:this.status, round:this.round, code:Net.code, host:this.players[0]&&this.players[0].name,
      players:this.players.map(p=>({id:p.id,name:p.name,side:p.side,online:p.online,w:p.w||0,l:p.l||0,lp:p.lp||0})),
      matches:this.matches.map(m=>({mid:m.mid,round:m.round,a:m.a,b:m.b,winner:m.winner||null,state:m.state})),
      ranking:this.finished};
  },
  start(){
    if(!this.hosting||this.status!=="lobby") return;
    const ps=this.players.filter(p=>p.online);
    if(ps.length<2) return toast("Mindestens 2 Spieler nötig (empfohlen 3–8)");
    this.players=ps; this.status="running"; this.round=0; this.matches=[];
    const ids=shuffle(ps.map(p=>p.id));
    if(this.format==="ko"){ let size=1; while(size<ids.length) size*=2; const slots=[...ids]; while(slots.length<size) slots.push(null);
      // Freilose gleichmäßig verteilen: Spieler auf gerade Plätze, Freilose auf ungerade
      const arr=[]; const real=slots.filter(Boolean), byes=size-real.length;
      for(let i=0;i<size/2;i++){ arr.push(real.shift()||null); arr.push(i<byes?null:(real.shift()||null)); }
      this.koRound(arr);
    } else { this.rrRounds=this.roundRobin(ids); this.nextRR(); }
  },
  roundRobin(ids){
    const a=[...ids]; if(a.length%2) a.push(null); const n=a.length, rounds=[];
    for(let r=0;r<n-1;r++){ const pairs=[]; for(let i=0;i<n/2;i++){ const x=a[i], y=a[n-1-i]; if(x&&y) pairs.push([x,y]); } rounds.push(pairs); a.splice(1,0,a.pop()); }
    return rounds;
  },
  newMatch(a,b){ const m={mid:"x"+Math.random().toString(36).slice(2,8),round:this.round,a,b,state:"wait",tries:0}; this.matches.push(m); return m; },
  koRound(parts){
    this.round++;
    for(let i=0;i<parts.length;i+=2){
      const a=parts[i], b=parts[i+1], m=this.newMatch(a,b);
      if(!a||!b){ m.state="done"; m.winner=a||b; m.bye=true; }
    }
    this.launch();
  },
  nextRR(){
    if(this.round>=this.rrRounds.length) return this.finish();
    this.round++; this.rrRounds[this.round-1].forEach(([a,b])=>this.newMatch(a,b)); this.launch();
  },
  pl(id){ return this.players.find(p=>p.id===id); },
  launch(){
    this.matches.filter(m=>m.round===this.round && m.state==="wait").forEach(m=>{
      const A=this.pl(m.a), B=this.pl(m.b);
      if(!A||!A.online) return this.result(m.mid,m.b,0);
      if(!B||!B.online) return this.result(m.mid,m.a,0);
      const [H,G] = m.tries%2 ? [B,A] : [A,B];                 // bei Verbindungsproblemen Rollen tauschen
      const hostSide = H.side!==G.side ? H.side : (Math.random()<.5?"polizei":"verbrecher");   // Münzwurf bei gleicher Seite
      m.state="play";
      this.sendToPlayer(H.id,{t:"t_match",mid:m.mid,role:"host",hostSide,oppId:G.id,oppName:G.name,myId:H.id});
      this.sendToPlayer(G.id,{t:"t_match",mid:m.mid,role:"client",hostSide,oppId:H.id,oppName:H.name,oppPeer:H.peer,myId:G.id});
    });
    this.checkRound();
    this.broadcast();
  },
  result(mid,winner,lp){
    const m=this.matches.find(x=>x.mid===mid); if(!m||m.state==="done") return;
    if(winner!==m.a&&winner!==m.b) return;
    m.state="done"; m.winner=winner; const loser=winner===m.a?m.b:m.a;
    const W=this.pl(winner), L=this.pl(loser);
    if(W){ W.w=(W.w||0)+1; W.lp=(W.lp||0)+(+lp||0); } if(L){ L.l=(L.l||0)+1; L.out = this.format==="ko" ? this.round : L.out; }
    this.checkRound(); this.broadcast();
  },
  failed(mid){
    const m=this.matches.find(x=>x.mid===mid); if(!m||m.state!=="play") return;
    m.tries++;
    if(m.tries>=3){ this.result(mid, Math.random()<.5?m.a:m.b, 0); toast("Match konnte nicht verbunden werden – Münzwurf entscheidet"); return; }
    m.state="wait"; this.launch();
  },
  checkRound(){
    const cur=this.matches.filter(m=>m.round===this.round);
    if(this.status!=="running" || !cur.length || cur.some(m=>m.state!=="done")) return;
    if(this.format==="ko"){
      const winners=cur.map(m=>m.winner).filter(Boolean);
      if(winners.length<=1) return this.finish(winners[0]);
      setTimeout(()=>this.koRound(winners),1500);
    } else setTimeout(()=>this.nextRR(),1500);
  },
  ranking(champion){
    let list;
    if(this.format==="ko"){
      const score=p=> p.id===champion ? 1e9 : (p.out||0);
      list=[...this.players].sort((a,b)=>score(b)-score(a));
      list.forEach(p=>p.place=1+list.filter(q=>score(q)>score(p)).length);
    } else {
      // Siege → direkter Vergleich unter Punktgleichen → übrige LP
      const h2h=p=>this.matches.filter(m=>m.state==="done"&&m.winner===p.id&&!m.bye).filter(m=>{ const o=m.a===p.id?m.b:m.a, op=this.pl(o); return op&&(op.w||0)===(p.w||0); }).length;
      const score=p=>(p.w||0)*1e9+h2h(p)*1e6+(p.lp||0);
      list=[...this.players].sort((a,b)=>score(b)-score(a));
      list.forEach(p=>p.place=1+list.filter(q=>score(q)>score(p)).length);
    }
    return list.map(p=>({id:p.id,name:p.name,side:p.side,place:p.place,w:p.w||0,l:p.l||0}));
  },
  finish(champion){
    if(this.status==="done") return;
    this.status="done"; this.finished=this.ranking(champion);
    this.broadcast();
    Object.values(this.conns).forEach(c=>Net.sendTo(c,{t:"t_end",ranking:this.finished,format:this.format,n:this.players.length}));
    this.onData({t:"t_end",ranking:this.finished,format:this.format,n:this.players.length},null);
  },
  onMemberClose(c){
    const id=c._tid; delete this.conns[id];
    const p=this.pl(id);
    if(this.status==="lobby"){ this.players=this.players.filter(x=>x.id!==id); }
    else if(p){ p.online=false;
      this.matches.filter(m=>m.state!=="done"&&(m.a===id||m.b===id)).forEach(m=>{ if(m.state==="play") this.relayDeliver(m.mid,id,{t:"quit"}); this.result(m.mid, m.a===id?m.b:m.a, 0); }); }
    if(p) toast(`${p.name} hat das Turnier verlassen`);
    this.broadcast();
  },

  /* ---------------- Teilnehmer (auch die Zentrale spielt mit) ---------------- */
  becomeMember(c,m){
    this.reset(); this.member=true; this.hub=c; this.myId=m.you; this.format=m.format;
    Net.conn=null; Net.role="tourmember";
    Net.sendTo(c,{t:"t_hello",name:this.myName(),side:Lobby.side,v:window.APP_VERSION||"dev"});
    UI.show("tour"); toast("Turnier-Raum von "+m.host+" beigetreten");
  },
  onHubClose(){
    if(!this.member) return;
    const done=this.view&&this.view.status==="done";
    this.member=false; this.hub=null;
    if(!done){ toast("Die Verbindung zum Turnier wurde getrennt"); if(UI.current==="tour") this.render(); }
  },
  onMatch(m){
    clearTimeout(this._failT);
    this.expect=m; this.myId=m.myId||this.myId;
    // Duell-Verbindung über die Zentrale aufbauen (funktioniert immer, wenn man im Turnier-Raum ist)
    try{ Net.conn && Net.conn!==this.vc && Net.endDuelConn(); }catch(e){}
    const vc=new RelayConn(m.mid); this.vc=vc; Net.conn=vc; Net.pend={}; Net.name=this.myName();
    Net.role = m.role==="host" ? "host" : "client"; if(m.role==="host") Net.side=m.hostSide;
    Net.wire(vc);
    if(m.role==="host") setTimeout(()=>{ if(this.vc===vc) Net.send({t:"welcome",name:Net.name,side:m.hostSide,v:window.APP_VERSION||"dev",mid:m.mid}); },400);
    (this._buf||[]).filter(x=>x.mid===m.mid).forEach(x=>vc.emit("data",x.m)); this._buf=[];
    const sideTxt = m.role==="host" ? FACTIONS[m.hostSide][0] : FACTIONS[OTHER[m.hostSide]][0];
    if(UI.current!=="duel"){ UI.show("tour"); }
    banner("MATCH!"); toast(`Dein Match: gegen ${m.oppName} – du spielst ${sideTxt}`);
    this.render();
    // kommt das Duell nicht zustande, der Zentrale melden
    this._failT=setTimeout(()=>{ if(this.expect===m && UI.current!=="duel") this.matchFailed(); }, 30000);
  },
  matchFailed(){
    const m=this.expect; if(!m) return; this.expect=null; clearTimeout(this._failT);
    Net.endDuelConn();
    this.report({t:"t_fail",mid:m.mid}); toast("Verbindung zum Gegner fehlgeschlagen – neuer Versuch …");
  },
  duelEnded(won, myLP, oppLP){
    const m=this.expect; if(!m) return; this.expect=null; clearTimeout(this._failT);
    this.report({t:"t_result",mid:m.mid,winner:won?m.myId:m.oppId,lp:won?myLP:oppLP});
  },
  report(msg){ if(this.hosting) this.onData(msg,null); else Net.sendTo(this.hub,msg); },
  /* ---- Relais ---- */
  relaySend(mid,m){ if(this.hosting) this.relayDeliver(mid,this.myId,m); else Net.sendTo(this.hub,{t:"t_relay",mid,m}); },
  relayDeliver(mid,from,m){                // nur Zentrale: Nachricht an den anderen Match-Spieler weiterreichen
    const x=this.matches.find(q=>q.mid===mid); if(!x) return;
    const to = from===x.a ? x.b : x.a;
    if(to===this.myId) return this.relayIn(mid,m);
    Net.sendTo(this.conns[to],{t:"t_relay",mid,m});
  },
  relayIn(mid,m){
    if(this.vc && this.vc.mid===mid && this.vc.open) return this.vc.emit("data",m);
    (this._buf=this._buf||[]).push({mid,m}); if(this._buf.length>50) this._buf.shift();
  },

  onData(m,c){
    switch(m.t){
      // --- Teilnehmer ---
      case "t_welcome": this.becomeMember(c,m); break;
      case "t_full": Lobby.error("Dieser Turnier-Raum ist voll (max. 8)."); break;
      case "t_started": Lobby.error("Dieses Turnier hat schon begonnen."); break;
      case "t_state": this.view=m.v; this.format=m.v.format; if(UI.current==="tour") this.render(); break;
      case "t_match": this.onMatch(m); break;
      case "t_end": this.onEnd(m); break;
      // --- Zentrale ---
      case "t_hello": { if(!this.hosting||!c) break; const id=c._tid; if(this.pl(id)) break;
        this.players.push({id,name:(m.name||"Spieler").slice(0,16),side:FACTIONS[m.side]?m.side:"polizei",peer:c.peer,online:true});
        toast(`${m.name} ist dem Turnier beigetreten`); this.broadcast(); break; }
      case "t_result": if(this.hosting) this.result(m.mid,m.winner,m.lp); break;
      case "t_fail": if(this.hosting) this.failed(m.mid); break;
      case "t_relay": if(this.hosting && c && c._tid) this.relayDeliver(m.mid,c._tid,m.m); else this.relayIn(m.mid,m.m); break;
    }
  },
  onEnd(m){
    if(this._rewarded===m.ranking) return; this._rewarded=m.ranking;
    const me=m.ranking.find(r=>r.id===this.myId); if(!me) return;
    const pr=TOUR_PRIZE[me.place]||{coins:50,xp:50,cup:""};
    Prog.reward(me.side, pr.coins, pr.xp);
    if(pr.cup){ (Player.trophies=Player.trophies||[]).push({place:me.place,n:m.n,format:m.format,date:Date.now()}); Player.save(); }
    if(this.view) this.view.ranking=m.ranking, this.view.status="done";
    setTimeout(()=>{ banner(me.place===1?"TURNIERSIEG!":`PLATZ ${me.place}!`); },UI.current==="duel"?2500:300);
    if(UI.current==="tour") this.render();
  },
  async leave(){
    if(this.view&&this.view.status==="running"&&!await UI.ask(this.hosting?"Turnier beenden? Alle Spieler werden getrennt.":"Turnier verlassen? Offene Matches zählen als verloren.")) return;
    Net.close(); UI.show("online");
  },
  share(){ Lobby.share(); }, copy(){ Lobby.copyLink(); },

  /* ---------------- Anzeige ---------------- */
  render(){
    const v=this.view; if(!v) { $("tStatus").textContent="Verbinde …"; return; }
    const name=id=>{ const p=v.players.find(x=>x.id===id); return p?esc(p.name):"Freilos"; };
    const me=this.myId;
    $("tTitle").textContent = v.format==="ko"?"🏆 K.-o.-Turnier":"🏆 Jeder gegen jeden";
    const st = v.status==="lobby" ? `Warte auf Spieler (${v.players.length}/${TOUR_MAX}) …` : v.status==="running" ? `Runde ${v.round}${v.format==="rr"&&this.rrRounds.length?" von "+this.rrRounds.length:""} läuft` : "Turnier beendet";
    $("tStatus").textContent=st;
    $("tCodeBox").style.display = this.hosting && v.status==="lobby" ? "" : "none";
    $("tCode").textContent=v.code||"";
    $("tStart").style.display = this.hosting && v.status==="lobby" ? "" : "none";
    // Mein Status
    const mine = this.expect ? `⚔️ Dein Match gegen <b>${esc(this.expect.oppName)}</b> – Verbindung wird aufgebaut …`
      : v.status==="running" ? (v.matches.some(m=>m.round===v.round&&m.state!=="done"&&(m.a===me||m.b===me)) ? "⏳ Dein Match startet gleich …" : "⏳ Warte auf die anderen Matches dieser Runde …")
      : v.status==="lobby" ? (this.hosting?"Teile den Code oder Link. Starte, sobald alle da sind.":"Warte, bis der Gastgeber das Turnier startet …") : "";
    $("tMine").innerHTML=mine; $("tMine").style.display=mine?"":"none";
    // Spieler / Tabelle
    const rows=[...v.players];
    if(v.format==="rr") rows.sort((a,b)=>(b.w-a.w)||(b.lp-a.lp));
    $("tPlayers").innerHTML = (v.ranking ? v.ranking.map(r=>`<div class="tp ${r.id===me?"me":""}"><span class="pl">${TOUR_PRIZE[r.place]?TOUR_PRIZE[r.place].cup:r.place+"."}</span><span class="nm2">${FACTIONS[r.side][1]} ${esc(r.name)}</span><span class="sc">${r.w}:${r.l}</span></div>`)
      : rows.map((p,i)=>`<div class="tp ${p.id===me?"me":""}"><span class="pl">${v.format==="rr"&&v.status!=="lobby"?(i+1)+".":(p.online?"🟢":"⚪")}</span><span class="nm2">${FACTIONS[p.side][1]} ${esc(p.name)}${p.id==="org"?" 👑":""}</span><span class="sc">${v.status==="lobby"?"":p.w+":"+p.l}</span></div>`)).join("");
    // Matches nach Runden
    const rounds=[...new Set(v.matches.map(m=>m.round))];
    $("tMatches").innerHTML = rounds.map(r=>`<div class="tround"><b>${v.format==="ko"?this.koName(r,v):"Runde "+r}</b>${v.matches.filter(m=>m.round===r).map(m=>{
      const cls=m.state==="done"?"done":m.state==="play"?"play":"";
      const a=m.a?name(m.a):"Freilos", b=m.b?name(m.b):"Freilos";
      return `<div class="tm ${cls} ${(m.a===me||m.b===me)?"mine":""}"><span class="${m.winner===m.a?"win":""}">${a}</span><i>${m.state==="play"?"⚔️":"vs"}</i><span class="${m.winner===m.b?"win":""}">${b}</span></div>`}).join("")}</div>`).join("") || `<p class="muted">Die Paarungen erscheinen, sobald das Turnier startet.</p>`;
  },
  koName(r,v){ const n=v.matches.filter(m=>m.round===r).length; return n===1?"Finale":n===2?"Halbfinale":n===4?"Viertelfinale":"Runde "+r; },
};

/* ============================ TAUSCHEN (live) ============================
   Tausch-Raum per Code/Einladungslink. Beide legen Karten (mit Seltenheitsstufe) und
   Münzen in ihr Angebot. Jede Änderung hebt die Bestätigungen auf. Erst wenn beide das
   identische Gesamtpaket bestätigt haben, führt jedes Gerät den Tausch für sich aus.
   ===================================================================== */
const Trade = {
  active:false, conn:null, host:false, oppName:"", mine:{items:[],coins:0}, theirs:{items:[],coins:0}, cards:{},
  meReady:false, themReady:false, done:false,
  reset(){ Object.assign(this,{active:false,conn:null,host:false,oppName:"",mine:{items:[],coins:0},theirs:{items:[],coins:0},cards:{},meReady:false,themReady:false,done:false}); },
  /* Gastgeber: Raum öffnen */
  create(){
    const n=Lobby.name(); if(!n) return;
    Net.close(); this.reset(); this.host=true;
    Net.role="tradehost"; Net.name=n; Net.code=Net.newCode();
    Lobby.status("Tausch-Raum wird erstellt …");
    const open=()=>Net.openPeer(Net.pid(Net.code), ()=>{ this.active=true; UI.show("trade"); },
      e=>{ if(e.type==="unavailable-id"){ Net.code=Net.newCode(); return open(); } Lobby.error(e); });
    open();
  },
  accept(c){
    if(this.conn) return Net.reject(c,"busy");
    this.conn=c; c._trade=true;
    c.on("open",()=>{ Net.wire(c); Net.sendTo(c,{t:"tr_welcome",name:Net.name}); });
  },
  /* Gast: über Beitreten gelandet */
  becomeGuest(c,m){
    this.reset(); this.active=true; this.conn=c; c._trade=true; this.oppName=m.name;
    Net.conn=null; Net.role="tradeguest";
    Net.sendTo(c,{t:"tr_hello",name:Lobby.name()||"Spieler"});
    UI.show("trade"); toast("Tausch-Raum von "+m.name+" beigetreten");
  },
  onClose(){
    if(!this.active) return;
    const wasDone=this.done; this.conn=null; this.meReady=this.themReady=false;
    if(!wasDone){ toast("Tauschpartner hat den Raum verlassen"); } this.render();
  },
  send(m){ Net.sendTo(this.conn,m); },
  /* Gesamtpaket als Text – beide Seiten müssen exakt dasselbe bestätigen */
  sig(){ const f=o=>JSON.stringify([o.items.map(i=>i.id+":"+i.p+":"+i.n).sort(),o.coins]);
    return this.host ? f(this.mine)+"|"+f(this.theirs) : f(this.theirs)+"|"+f(this.mine); },
  changed(){ this.meReady=false; this.themReady=false;
    const cards={}; this.mine.items.forEach(i=>{ const c=DB.byId(i.id); if(c) cards[i.id]=c; });
    this.send({t:"tr_offer",offer:this.mine,cards}); this.render(); },
  have(id,p){ return (Player.printsOf(id)[p]||0) - this.mine.items.filter(i=>i.id===id&&i.p===p).reduce((a,i)=>a+i.n,0); },
  addItem(id,p){
    if(this.done) return;
    if(this.have(id,p)<1) return toast("Davon hast du keine weiteren Exemplare");
    if(this.mine.items.length>=12 && !this.mine.items.find(i=>i.id===id&&i.p===p)) return toast("Maximal 12 verschiedene Karten pro Tausch");
    const it=this.mine.items.find(i=>i.id===id&&i.p===p); if(it) it.n++; else this.mine.items.push({id,p,n:1});
    this.changed();
  },
  removeItem(idx){ const it=this.mine.items[idx]; if(!it) return; it.n--; if(it.n<=0) this.mine.items.splice(idx,1); this.changed(); },
  setCoins(v){ v=Math.max(0,Math.min(Player.coins,Math.floor(+v||0))); $("trCoins").value=v; if(v!==this.mine.coins){ this.mine.coins=v; this.changed(); } },
  toggleReady(){
    if(!this.conn) return toast("Noch kein Tauschpartner da");
    if(!this.mine.items.length && !this.mine.coins && !this.theirs.items.length && !this.theirs.coins) return toast("Legt zuerst etwas in eure Angebote");
    this.meReady=!this.meReady; this.send({t:"tr_ready",ready:this.meReady,sig:this.sig()}); this.render(); this.tryExecute();
  },
  tryExecute(){
    if(!(this.meReady && this.themReady && this._theirSig===this.sig()) || this.done) return;
    // eigenes Angebot prüfen
    for(const i of this.mine.items){ if((Player.printsOf(i.id)[i.p]||0)<i.n){ toast("Du besitzt nicht mehr alle angebotenen Karten"); this.meReady=false; this.send({t:"tr_ready",ready:false}); return this.render(); } }
    if(Player.coins<this.mine.coins){ toast("Nicht genug Münzen"); this.meReady=false; this.send({t:"tr_ready",ready:false}); return this.render(); }
    this.mine.items.forEach(i=>Player.remove(i.id,i.p,i.n));
    this.theirs.items.forEach(i=>{
      if(!DB.byId(i.id) && this.cards[i.id]){ DB.cards.push(normalizeCard(this.cards[i.id])); DB.save(); }   // unbekannte (selbst erstellte) Karte übernehmen
      if(DB.byId(i.id)) Player.add(i.id,i.n,PRINT[i.p]?i.p:"C");
    });
    Player.coins += this.theirs.coins - this.mine.coins;
    Player.save(); Deck.prune(); this.done=true;
    this.send({t:"tr_done"});
    banner("GETAUSCHT!"); toast(`Tausch mit ${this.oppName} abgeschlossen`);
    this.render();
  },
  onData(m,c){
    switch(m.t){
      case "tr_welcome": this.becomeGuest(c,m); break;
      case "tr_hello": this.oppName=(m.name||"Spieler").slice(0,16); toast(this.oppName+" ist im Tausch-Raum"); this.changed(); break;
      case "tr_offer": if(this.done){ this.done=false; this.mine={items:[],coins:0}; }
        this.theirs={items:(m.offer.items||[]).slice(0,12),coins:Math.max(0,+m.offer.coins||0)}; Object.assign(this.cards,m.cards||{});
        this.meReady=false; this.themReady=false; this.render(); break;
      case "tr_ready": this.themReady=!!m.ready; this._theirSig=m.sig; this.render(); this.tryExecute(); break;
      case "tr_done": break;
    }
  },
  leave(){ Net.close(); this.reset(); UI.show("online"); },
  newTrade(){ this.mine={items:[],coins:0}; this.theirs={items:[],coins:0}; this.done=false; this.meReady=this.themReady=false; if(this.conn) this.changed(); this.render(); },

  /* ---------- Anzeige ---------- */
  itemHTML(i,mine,idx){
    const c = DB.byId(i.id) || this.cards[i.id]; if(!c) return "";
    const x=clone(c); x._print=i.p;
    return `<div class="tritem">${cardHTML(x,"",`data-ti="${idx}" data-mine="${mine?1:0}"`)}<div class="trn">${i.n>1?"×"+i.n+" · ":""}${PRINT[i.p]?PRINT[i.p].name:""}</div></div>`;
  },
  render(){
    if(UI.current!=="trade") return;
    $("trCodeBox").style.display = this.host && !this.conn ? "" : "none";
    $("trCode").textContent=Net.code;
    $("trStatus").textContent = this.done ? "✅ Tausch abgeschlossen!" : !this.conn ? (this.host?"Warte auf deinen Tauschpartner …":"Verbindung getrennt") : `Tausch mit ${this.oppName}`;
    $("trOppTitle").textContent = this.oppName ? `Angebot von ${this.oppName}` : "Angebot deines Partners";
    $("trMine").innerHTML = this.mine.items.map((i,k)=>this.itemHTML(i,true,k)).join("") || `<p class="muted">Noch nichts angeboten.</p>`;
    $("trTheirs").innerHTML = this.theirs.items.map((i,k)=>this.itemHTML(i,false,k)).join("") || `<p class="muted">Noch nichts angeboten.</p>`;
    $("trMyCoins").textContent = this.mine.coins ? `+ 🪙 ${this.mine.coins}` : "";
    $("trTheirCoins").textContent = this.theirs.coins ? `+ 🪙 ${this.theirs.coins}` : "";
    $("trCoins").value=this.mine.coins; $("trCoins").max=Player.coins;
    $("trMine").querySelectorAll(".card").forEach(el=>el.onclick=()=>{ if(!this.done) this.removeItem(+el.dataset.ti); });
    $("trTheirs").querySelectorAll(".card").forEach(el=>el.onclick=()=>{ const i=this.theirs.items[+el.dataset.ti]; const c=clone(DB.byId(i.id)||this.cards[i.id]); c._print=i.p; UI.modal(c); });
    $("trReadyMe").textContent = this.meReady ? "✅ Du hast bestätigt" : "⏳ Du hast noch nicht bestätigt";
    $("trReadyThem").textContent = this.themReady ? `✅ ${this.oppName||"Partner"} hat bestätigt` : `⏳ ${this.oppName||"Partner"} hat noch nicht bestätigt`;
    $("trGo").textContent = this.meReady ? "↩ Bestätigung zurücknehmen" : "🤝 Tausch bestätigen";
    $("trGo").style.display = this.done ? "none" : "";
    $("trAgain").style.display = this.done && this.conn ? "" : "none";
    $("trAdd").disabled = this.done;
  },
  /* Karte aus der Sammlung auswählen */
  pick(){
    const own=DB.cards.filter(c=>Player.has(c.id));
    const draw=(q="")=>{
      const list=own.filter(c=>c.name.toLowerCase().includes(q.toLowerCase()));
      $("modalCard").innerHTML=`<h2 style="color:var(--yellow);text-align:center;margin-bottom:8px">Karte anbieten</h2>
        <input id="trSearch" placeholder="Suchen …" value="${esc(q)}" style="margin-bottom:8px">
        <div class="fusion-pick">${list.slice(0,60).map(c=>{ const p=Player.printsOf(c.id);
          return PRINTS.filter(x=>p[x.k]).map(x=>{ const y=Prog.upgraded(c); y._print=x.k; const left=this.have(c.id,x.k);
            return `<div class="opt">${cardHTML(y,"",`style="--w:100px"`)}<button class="small ${left>0?"green":"ghost"}" data-id="${c.id}" data-p="${x.k}" ${left>0?"":"disabled"}>${x.name} · ${left}×</button></div>`; }).join(""); }).join("")}</div>`;
      $("modalCard").querySelectorAll("[data-id]").forEach(b=>b.onclick=()=>{ this.addItem(b.dataset.id,b.dataset.p); draw($("trSearch").value); });
      const s=$("trSearch"); s.oninput=()=>{ const v=s.value; clearTimeout(this._st); this._st=setTimeout(()=>{ draw(v); const n=$("trSearch"); n.focus(); n.setSelectionRange(v.length,v.length); },250); };
    };
    draw(); $("modalActs").innerHTML=""; const x=document.createElement("button"); x.textContent="Fertig"; x.className="ghost"; x.onclick=()=>UI.closeModal(); $("modalActs").appendChild(x);
    UI._onClose=null; $("modal").classList.add("show");
  },
};

/* ---------- Duell-Erweiterungen für den Online-Modus ---------- */
Object.assign(Duel, {
  /* Spielstand aus Sicht des Gastes (verdeckte Karten des Gastgebers bleiben geheim) */
  snap(){
    const K=c=>c._k;
    const pl=(p,own)=>({name:p.name, lp:p.lp, summoned:p.summoned,
      hand: own? p.hand.map(K) : p.hand.length,
      deck: own? p.deck.map(K).sort() : p.deck.length,
      extra: own? p.extra.map(K) : p.extra.length,
      grave: p.grave.map(K),
      mz: p.mz.map(m=>m&&{k:(m.faceDown&&!own)?null:K(m.card), pos:m.pos, faceDown:m.faceDown, atk:m.atk, attacks:m.attacks, attacked:m.attacked, changed:m.changed, lockedUntil:m.lockedUntil}),
      st: p.st.map(x=>x&&{k: own?K(x.card):null})});
    return {turn:this.turn, active:this.active===this.AI?"me":"opp", ready:this.ready, over:this.over, me:pl(this.AI,true), opp:pl(this.P,false)};
  },
  startClient(m){
    this.online=true; this.client=true; this.host=false; this.waiting=false; this.over=false; this.mode=null; this.busy=false;
    this.side=OTHER[m.hostSide]; this.opts={}; this.history=[]; this._ann=null; this._lastTurn=-1; this.turn=0;
    Net.table=m.table;
    $("reveal").classList.remove("show"); $("fx").innerHTML="";
    $("oppWho").textContent=`${FACTIONS[m.hostSide][1]} ${m.hostName}`;
    $("myWho").textContent=`${FACTIONS[this.side][1]} ${m.guestName} – ${FACTIONS[this.side][0]}`;
    UI.show("duel"); banner("ONLINE-DUELL!");
    this.log("Online-Duell gegen "+m.hostName+" beginnt!","opp");
  },
  applyState(s){
    const T=Net.table, card=k=>k==null?HIDDEN:(T[k]||HIDDEN);
    const mk=(d,own)=>({name:d.name, lp:d.lp, summoned:d.summoned,
      hand: own? d.hand.map(card) : Array(d.hand).fill(HIDDEN),
      deck: own? d.deck.map(card) : Array(d.deck).fill(HIDDEN),
      extra: own? d.extra.map(card) : Array(d.extra).fill(HIDDEN),
      grave: d.grave.map(card),
      mz: d.mz.map(m=>m&&Object.assign({},m,{card:card(m.k)})),
      st: d.st.map(x=>x&&{faceDown:true, card:card(x.k)})});
    const oldMe=this.P&&this.P.lp, oldOpp=this.AI&&this.AI.lp;
    this.P=mk(s.me,true); this.AI=mk(s.opp,false);
    this.active = s.active==="me" ? this.P : this.AI; this.ready=s.ready;
    if(s.turn!==this._lastTurn && s.ready){
      this._lastTurn=s.turn; this.turn=s.turn; this.mode=null;
      banner(s.active==="me"?"DEIN ZUG!":"GEGNER!");
      $("phaseLbl").textContent = s.active==="me" ? `Dein Zug ${Math.ceil(s.turn/2)}` : `${this.AI.name} am Zug`;
    }
    this.turn=s.turn;
    if(UI.current==="duel"){
      if(oldMe!=null && s.me.lp!==oldMe){ this.floatText($("myLP"), (s.me.lp<oldMe?"−":"+")+Math.abs(s.me.lp-oldMe), s.me.lp<oldMe?"#ff3b3b":"#3ddc84"); if(s.me.lp<oldMe) this.shakeLP($("myLP")); }
      if(oldOpp!=null && s.opp.lp!==oldOpp){ this.floatText($("oppLP"), (s.opp.lp<oldOpp?"−":"+")+Math.abs(s.opp.lp-oldOpp), s.opp.lp<oldOpp?"#ff3b3b":"#3ddc84"); if(s.opp.lp<oldOpp) this.shakeLP($("oppLP")); }
    }
    this.render();
  },
  shakeLP(el){ el.parentElement.classList.remove("shake"); void el.offsetWidth; el.parentElement.classList.add("shake"); },
  clientFx(m){
    const side = s => s==="g" ? this.P : this.AI;      // "g" = Gast = ich
    if(m.k==="atk") this.fxAttack(side(m.s), m.from, m.to);
    if(m.k==="poof") this.fxPoof(side(m.s), m.z);
    if(m.k==="stamp" && Net.table[m.c]) this.fxStamp(Net.table[m.c]);
    if(m.k==="banner") banner(m.text);
  },
  /* Gastgeber fragt: Willst du eine Reaktion einsetzen? */
  async clientAsk(m){
    let val=-1;
    if(m.kind==="trap"){
      for(let i=0;i<m.data.traps.length;i++){
        const c=Net.table[m.data.traps[i]]; if(!c) continue;
        const use = await new Promise(res=>UI.modal(c,[[`Reaktion gegen ${m.data.att} einsetzen`,()=>res(true),"red"]],null,()=>res(false),"Nicht einsetzen"));
        if(use){ val=i; break; }
      }
    }
    Net.send({t:"reply", id:m.id, val});
  },
  endClient(won){
    if(this.over && this._ended) return; this.over=true; this._ended=true; this.closeReveal(); this.render();
    setTimeout(()=>{ banner(won?(this.side==="polizei"?"FALL GELÖST!":"ENTKOMMEN!"):(this.side==="polizei"?"ENTKOMMEN…":"GESCHNAPPT!"));
      setTimeout(()=>{ Prog.reward(this.side, won?ONLINE_WIN:ONLINE_LOSS, won?150:60); Tour.duelEnded(won, this.P&&this.P.lp, this.AI&&this.AI.lp); if(UI.current!=="duel") return;
        UI.modal(null, Tour.active() ? [["🏆 Zum Turnier",()=>{Net.endDuelConn();UI.show("tour")},"red"]]
          : [["🌐 Online-Lobby",()=>{Net.close();UI.show("online")},"red"],["Hauptmenü",()=>{Net.close();UI.show("home")},"blue"]]); },1300); },300);
  },
  opponentLeft(){
    if(this.over) return;
    if(this.host){ this.win(this.P); } else { this.endClient(true); }
  },
});

/* ---------- Lobby ---------- */
const Lobby = {
  side:"polizei",
  render(){
    $("onName").value = Store.get("nick","") || "";
    $("onSide").innerHTML=Object.keys(FACTIONS).map(f=>`<span data-f="${f}" class="${f===this.side?"on":""}">${FACTIONS[f][1]} ${FACTIONS[f][0]}</span>`).join("");
    $("onSide").querySelectorAll("span").forEach(s=>s.onclick=()=>{this.side=s.dataset.f;this.render()});
    $("onFmt").innerHTML=[["ko","K.-o.-System"],["rr","Jeder gegen jeden"]].map(([k,l])=>`<span data-k="${k}" class="${k===this.fmt?"on":""}">${l}</span>`).join("");
    $("onFmt").querySelectorAll("span").forEach(s=>s.onclick=()=>{this.fmt=s.dataset.k;this.render()});
    $("onCodeBox").style.display="none"; this.status(Net.available()?"":"Online-Modus nicht verfügbar (Bibliothek fehlt).");
  },
  name(){ const n=($("onName").value||"").trim().slice(0,16); if(!n){ toast("Bitte gib zuerst deinen Spielernamen ein"); $("onName").focus(); return null; } Store.set("nick",n); return n; },
  create(){ const n=this.name(); if(!n) return; Duel._ended=false; Net.host(this.side,n); },
  fmt:"ko",
  createTour(){ Duel._ended=false; Tour.create(this.fmt); },
  join(){ const n=this.name(); if(!n) return; const code=($("onJoin").value||"").trim().toUpperCase(); if(code.length<5) return toast("Bitte den 5-stelligen Code eingeben"); Duel._ended=false; Net.join(code,n); },
  showCode(code){ $("onCodeBox").style.display=""; $("onCode").textContent=code; this.status("Warte auf deinen Gegner … Gib ihm den Code."); },
  inviteUrl(){ return `${window.APP_SITE||"https://totestierux.github.io/einsatz-duell"}/join.html?c=${Net.code}`; },
  inviteText(){ const n=Store.get("nick","")||"Ich";
    if(Net.role==="tradehost") return `🔁 ${n} möchte Karten mit dir tauschen! Tippe zum Beitreten: ${this.inviteUrl()} (Code: ${Net.code})`;
    return Tour.hosting ? `🏆 ${n} lädt dich zu einem Einsatz-Duell-Turnier ein! Tippe zum Beitreten: ${this.inviteUrl()} (Code: ${Net.code})`
                        : `🚨 ${n} fordert dich zum Einsatz-Duell heraus! Tippe zum Beitreten: ${this.inviteUrl()} (Raumcode: ${Net.code})`; },
  async share(){
    const text=this.inviteText();
    if(window.AndroidBridge && AndroidBridge.share){ AndroidBridge.share(text); return; }
    try{ if(navigator.share){ await navigator.share({title:"Einsatz-Duell", text:`🚨 ${Store.get("nick","")||"Ich"} fordert dich zum Einsatz-Duell heraus! (Raumcode: ${Net.code})`, url:this.inviteUrl()}); return; } }catch(e){ if(e&&e.name==="AbortError") return; }
    this.copyLink();
  },
  async copyLink(){
    const url=this.inviteUrl();
    if(window.AndroidBridge && AndroidBridge.copy){ AndroidBridge.copy(url); toast("Einladungslink kopiert"); return; }
    try{ await navigator.clipboard.writeText(url); toast("Einladungslink kopiert"); }
    catch(e){ UI.modal(null,[["Link: "+url,null,"ghost"]]); }
  },
  /* Über einen Einladungslink geöffnet: Lobby mit Code öffnen und – wenn ein Nickname da ist – direkt beitreten */
  openInvite(code){
    code=String(code||"").toUpperCase().replace(/[^A-Z0-9]/g,"").slice(0,5); if(code.length<5) return;
    if(UI.current==="duel" && Duel.online && !Duel.over) return toast("Du bist gerade in einem Online-Duell");
    UI.show("online"); $("onJoin").value=code;
    if(Store.get("nick","")){ toast("Einladung angenommen – trete Raum "+code+" bei …"); setTimeout(()=>this.join(),300); }
    else { toast("Gib deinen Spielernamen ein und tippe auf „Beitreten“"); $("onName").focus(); }
  },
  status(t){ $("onStatus").textContent=t; },
  error(e){ const msg = typeof e==="string" ? e : ({"network":"Keine Internetverbindung zum Vermittlungsserver.","server-error":"Vermittlungsserver nicht erreichbar.","browser-incompatible":"Dieses Gerät unterstützt keine Online-Duelle (WebRTC)."}[e.type] || ("Fehler: "+(e.type||e.message||e)));
    this.status("⚠️ "+msg); toast(msg); },
  leave(){ Net.close(); UI.show("home"); },
};

/* ============================ KONTO (Firebase) ============================
   Login per E-Mail + Passwort und Cloud-Spielstand über die REST-Schnittstellen von
   Firebase Authentication und Cloud Firestore (keine große SDK nötig).
   Gespeichert wird ein Dokument users/{uid} mit Nickname + komplettem Spielstand.
   Die Firestore-Sicherheitsregeln erlauben nur dem eingeloggten Besitzer Zugriff.
   ===================================================================== */
const FIREBASE = window.FIREBASE_CONFIG || null;     // wird beim Build eingesetzt (build.py / firebase.json)

const Account = {
  user:null,        // {uid,email,idToken,refreshToken,exp}
  _saveT:null, _syncing:false,
  enabled(){ return !!(FIREBASE && FIREBASE.apiKey && FIREBASE.projectId); },
  load(){ this.user = Store.get("auth", null); },
  persist(){ Store.set("auth", this.user); },
  loggedIn(){ return !!(this.user && this.user.refreshToken); },
  errText(code){
    return ({EMAIL_EXISTS:"Diese E-Mail ist schon registriert – bitte anmelden.", EMAIL_NOT_FOUND:"Kein Konto mit dieser E-Mail gefunden.",
      INVALID_PASSWORD:"Falsches Passwort.", INVALID_LOGIN_CREDENTIALS:"E-Mail oder Passwort ist falsch.", INVALID_EMAIL:"Ungültige E-Mail-Adresse.",
      MISSING_PASSWORD:"Bitte ein Passwort eingeben.", USER_DISABLED:"Dieses Konto ist gesperrt.", TOO_MANY_ATTEMPTS_TRY_LATER:"Zu viele Versuche – bitte später erneut.",
      OPERATION_NOT_ALLOWED:"E-Mail-Login ist in Firebase noch nicht aktiviert.", PERMISSION_DENIED:"Keine Berechtigung (Firestore-Regeln prüfen).",
      NOT_FOUND:"Firestore-Datenbank existiert noch nicht.", FAILED_PRECONDITION:"Firestore-Datenbank ist noch nicht eingerichtet.",
      NETWORK:"Keine Internetverbindung."})[String(code).split(" ")[0].split(":")[0]] || ("Fehler: "+code);
  },
  async call(url, body){
    let r; try{ r = await fetch(url,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)}); }catch(e){ throw new Error("NETWORK"); }
    const j = await r.json().catch(()=>({}));
    if(!r.ok) throw new Error((j.error&&j.error.message)||("HTTP_"+r.status));
    return j;
  },
  idt(){ return "https://identitytoolkit.googleapis.com/v1/accounts:"; },
  setSession(j){
    this.user = {uid:j.localId||j.user_id, email:j.email||(this.user&&this.user.email), idToken:j.idToken||j.id_token,
      refreshToken:j.refreshToken||j.refresh_token, exp:Date.now()+((+(j.expiresIn||j.expires_in)||3600)-60)*1000};
    this.persist();
  },
  async token(){
    if(!this.loggedIn()) throw new Error("NOT_LOGGED_IN");
    if(Date.now() < this.user.exp) return this.user.idToken;
    let r; try{ r = await fetch(`https://securetoken.googleapis.com/v1/token?key=${FIREBASE.apiKey}`,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},
      body:`grant_type=refresh_token&refresh_token=${encodeURIComponent(this.user.refreshToken)}`}); }catch(e){ throw new Error("NETWORK"); }
    const j = await r.json().catch(()=>({}));
    if(!r.ok){ if(r.status===400){ this.user=null; this.persist(); } throw new Error((j.error&&j.error.message)||"TOKEN"); }
    this.setSession(j); return this.user.idToken;
  },
  async register(email, pw, nick){
    const j = await this.call(this.idt()+"signUp?key="+FIREBASE.apiKey, {email, password:pw, returnSecureToken:true});
    this.setSession(j); Store.set("nick", nick);
    // Konto steht – ein Fehler beim Cloud-Speichern soll den Login nicht blockieren
    try{ await this.pushNow(); return "ok"; }catch(e){ this.lastSyncError=e.message; return "nosync"; }
  },
  async login(email, pw){
    const j = await this.call(this.idt()+"signInWithPassword?key="+FIREBASE.apiKey, {email, password:pw, returnSecureToken:true});
    this.setSession(j);
    try{ return await this.pull(true); }catch(e){ this.lastSyncError=e.message; return "nosync"; }
  },
  async resetPassword(email){ await this.call(this.idt()+"sendOobCode?key="+FIREBASE.apiKey, {requestType:"PASSWORD_RESET", email}); },
  logout(){ this.user=null; this.persist(); UI.badges(); },

  /* ---------- Cloud-Spielstand ---------- */
  docUrl(){ return `https://firestore.googleapis.com/v1/projects/${FIREBASE.projectId}/databases/(default)/documents/users/${this.user.uid}`; },
  snapshot(){ return {coins:Player.coins, owned:Player.owned, prints:Player.prints, show:Player.show, progress:Player.progress, prog:Player.prog, trophies:Player.trophies||[], decks:Deck.lists, nick:Store.get("nick","")}; },
  async pushNow(){
    if(!this.enabled()||!this.loggedIn()) return;
    const t = await this.token(), data=this.snapshot(), now=Date.now();
    const body = {fields:{ nick:{stringValue:data.nick||""}, data:{stringValue:JSON.stringify(data)}, updated:{integerValue:String(now)} }};
    let r; try{ r = await fetch(this.docUrl(),{method:"PATCH",headers:{"Content-Type":"application/json","Authorization":"Bearer "+t},body:JSON.stringify(body)}); }catch(e){ throw new Error("NETWORK"); }
    if(!r.ok){ const j=await r.json().catch(()=>({})); throw new Error((j.error&&(j.error.status||j.error.message))||("HTTP_"+r.status)); }
    Store.set("syncedAt", now);
  },
  /* Spielstand vom Konto laden. Beim Login: Cloud-Stand übernehmen, falls vorhanden – sonst lokalen hochladen */
  async pull(atLogin){
    const t = await this.token();
    let r; try{ r = await fetch(this.docUrl(),{headers:{"Authorization":"Bearer "+t}}); }catch(e){ throw new Error("NETWORK"); }
    if(r.status===404){ await this.pushNow(); return "uploaded"; }
    const j = await r.json().catch(()=>({}));
    if(!r.ok) throw new Error((j.error&&(j.error.status||j.error.message))||("HTTP_"+r.status));
    const raw = j.fields&&j.fields.data&&j.fields.data.stringValue; if(!raw) { await this.pushNow(); return "uploaded"; }
    const d = JSON.parse(raw);
    Player.coins=d.coins??Player.coins; Player.owned=d.owned||Player.owned; Player.progress=d.progress||Player.progress; Player.prog=d.prog||Player.prog; Player.trophies=d.trophies||Player.trophies||[]; Player.prints=d.prints||{}; Player.show=d.show||{}; Player.syncPrints();
    if(d.decks){ Deck.lists=d.decks; Deck.prune(); }
    if(d.nick) Store.set("nick", d.nick);
    Prog.data(); Store.set("player",{coins:Player.coins,owned:Player.owned,prints:Player.prints,show:Player.show,progress:Player.progress,prog:Player.prog,trophies:Player.trophies||[]}); Deck.save();
    UI.coins(); UI.badges(); return "loaded";
  },
  /* nach jeder Änderung am Spielstand: verzögert hochladen */
  scheduleSave(){
    if(!this.enabled()||!this.loggedIn()) return;
    clearTimeout(this._saveT);
    this._saveT=setTimeout(()=>this.pushNow().catch(e=>console.warn("Cloud-Speichern:",e.message)), 4000);
  },

  /* ---------- Bildschirm ---------- */
  mode:"login",
  render(){
    const on=this.enabled(), li=this.loggedIn();
    $("acOff").style.display = on?"none":"";
    $("acForm").style.display = on&&!li?"":"none";
    $("acIn").style.display = on&&li?"":"none";
    if(li){ $("acEmail").textContent=this.user.email||""; $("acNick").textContent=Store.get("nick","")||"–";
      const s=Store.get("syncedAt",0); $("acSync").textContent = s?("Zuletzt gespeichert: "+new Date(s).toLocaleString("de-DE")):"Noch nicht in der Cloud gespeichert"+(this.lastSyncError?" – "+this.errText(this.lastSyncError):""); }
    $("acTabs").querySelectorAll("span").forEach(s=>s.classList.toggle("on",s.dataset.m===this.mode));
    $("acNickRow").style.display = this.mode==="register"?"":"none";
    $("acGo").textContent = this.mode==="register"?"✅ Konto erstellen":"🔑 Anmelden";
    $("acPw2Row").style.display = this.mode==="register"?"":"none";
  },
  setMode(m){ this.mode=m; this.render(); },
  async submit(){
    const email=$("acMail").value.trim(), pw=$("acPw").value, nick=($("acNickIn").value||"").trim().slice(0,16);
    if(!email||!pw) return toast("Bitte E-Mail und Passwort eingeben");
    if(this.mode==="register"){
      if(nick.length<3) return toast("Nickname: mindestens 3 Zeichen");
      if(pw.length<6) return toast("Passwort: mindestens 6 Zeichen");
      if(pw!==$("acPw2").value) return toast("Die Passwörter stimmen nicht überein");
    }
    $("acGo").disabled=true; $("acMsg").textContent="Bitte warten …";
    try{
      let r;
      if(this.mode==="register"){ r=await this.register(email,pw,nick); toast("Willkommen, "+nick+"!"); }
      else { r=await this.login(email,pw); toast(r==="loaded"?"Angemeldet – Spielstand geladen":r==="nosync"?"Angemeldet":"Angemeldet – Spielstand gesichert"); }
      if(r==="nosync") setTimeout(()=>toast("Angemeldet, aber Cloud-Speichern klappt noch nicht: "+this.errText(this.lastSyncError)),2600);
      $("acPw").value=""; $("acPw2").value=""; $("acMsg").textContent="";
      UI.badges(); UI.show("home");
    }catch(e){ $("acMsg").textContent="⚠️ "+this.errText(e.message); }
    finally{ $("acGo").disabled=false; }
  },
  async forgot(){
    const email=$("acMail").value.trim(); if(!email) return toast("Bitte zuerst deine E-Mail eingeben");
    try{ await this.resetPassword(email); $("acMsg").textContent="📧 Wir haben dir eine E-Mail zum Zurücksetzen geschickt."; }
    catch(e){ $("acMsg").textContent="⚠️ "+this.errText(e.message); }
  },
  async syncNow(){ try{ await this.pushNow(); this.lastSyncError=null; toast("Spielstand gesichert"); this.render(); }catch(e){ this.lastSyncError=e.message; toast(this.errText(e.message)); this.render(); } },
  async loadNow(){ if(!await UI.ask("Spielstand vom Konto laden? Der Stand auf diesem Gerät wird ersetzt.")) return;
    try{ await this.pull(); toast("Spielstand geladen"); this.render(); }catch(e){ toast(this.errText(e.message)); } },
  /* Beim Start: neuerer Stand gewinnt (anderes Gerät → laden, sonst hochladen) */
  async syncOnStart(){
    if(!this.enabled()||!this.loggedIn()) return;
    try{
      const t=await this.token(); const r=await fetch(this.docUrl(),{headers:{"Authorization":"Bearer "+t}});
      if(r.status===404) return this.pushNow();
      const j=await r.json(); const cloud=+(j.fields&&j.fields.updated&&j.fields.updated.integerValue||0), local=+Store.get("syncedAt",0);
      if(cloud>local+1000){ await this.pull(); Store.set("syncedAt",cloud); toast("Spielstand vom Konto geladen"); if(UI.current==="home") UI.badges(); }
      else await this.pushNow();
    }catch(e){ console.warn("Sync:",e.message); }
  },
  async doLogout(){ if(!await UI.ask("Abmelden? Dein Spielstand bleibt im Konto gespeichert.")) return;
    try{ await this.pushNow(); }catch(e){} this.logout(); this.render(); toast("Abgemeldet"); },
};

/* ============================ START ============================ */
$("colType").innerHTML=filterOptions(); $("admType").innerHTML=filterOptions();
$("admTabs").querySelectorAll("span").forEach(s=>s.onclick=()=>Admin.tab(s.dataset.t));
DB.load(); Player.load(); Story.load(); Deck.load(); UI.coins(); Account.load(); Prog.data(); UI.badges();
// Konto: beim ersten Start anmelden/registrieren anbieten, sonst Spielstand abgleichen
if(Account.enabled()){
  if(Account.loggedIn()) Account.syncOnStart();
  else if(!Store.get("skipLogin",false)) setTimeout(()=>UI.show("account"),300);
}
$("appVer").textContent = "Version "+(window.APP_VERSION||"dev")+" · 69 Effekte";
window.onAndroidBack = () => UI.back();
window.openInvite = code => Lobby.openInvite(code);       // von der Android-App bei Einladungslinks aufgerufen
// Web-Version: Einladung über #join-CODE
const _inv = (location.hash||"").match(/^#join-([A-Za-z0-9]{5})/);
if(_inv){ history.replaceState(null,"",location.pathname+location.search); setTimeout(()=>Lobby.openInvite(_inv[1]),700); }
