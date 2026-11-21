"""Erzeugt src/cards.js aus den Kartentabellen unten.
Spalten Charaktere:  Name | Rolle | Stufe | ATK | DEF | Seltenheit | Effekt | Wert | Emoji | S (=Startset)
Spalten Maßnahmen:   Name | Typ(spell/trap) | Recht | Paragraf | Seltenheit | Effekt | Wert | Emoji | S
Spalten Fusionen:    Name | Rolle | Stufe | ATK | DEF | Seltenheit | Effekt | Wert | Emoji | Material1+Material2(+3)
IDs sind fest (p001…, v001…, pf01…, vf01…) – Reihenfolge NICHT ändern, neue Karten nur hinten anhängen!
"""
import json, os

ROLE_COLORS = {
  "streife":("#d8ecff","#2b6cd6"), "kripo":("#efe6d2","#5a4a2e"), "sek":("#b9c1ca","#151a22"),
  "verkehr":("#fff4b8","#2b6cd6"), "hunde":("#ffe2b3","#9a5b1e"), "bepo":("#c7d7f0","#203a6b"),
  "dieb":("#ffd0c2","#8a1c1c"), "betrug":("#ffd6f2","#6b1a5b"), "bande":("#ffb3b3","#2a0a0a"),
  "hehler":("#f1dcc0","#5a3410"), "raub":("#ffe28a","#7a1010"), "drogen":("#d8ffd0","#2a5a1a"),
}
LAW_COLORS = {"StPO":("#e1f7e6","#2f8f4e"), "SOG":("#dcf6f8","#127a8a"), "Trick":("#efe0ff","#5b2a87")}

POL_CHARS = """
Streifenpolizist Kai|streife|3|1300|1200|N|none|0|👮|S
Polizeikommissarin Lea|streife|4|1600|1400|N|summon_draw|1|👮‍♀️|S
Kriminalhauptkommissar Brandt|kripo|4|1800|1300|R|pierce|0|🕵️|
Diensthund Rex|hunde|3|1400|800|N|none|0|🐕|S
Verkehrspolizist Uwe|verkehr|2|900|1500|N|none|0|🚦|S
Hundertschaftsführer Krämer|bepo|5|2100|2200|R|summon_heal|500|🛡️|
SEK-Zugriffstrupp|sek|7|2800|2300|SR|summon_burn|300|🪖|
Polizeihubschrauber Libelle|bepo|8|3000|2500|UR|none|0|🚁|
Polizeimeisteranwärter Ben|streife|1|600|700|N|summon_draw|1|🧑‍🎓|S
Polizeiobermeisterin Jana|streife|3|1200|1300|N|summon_heal|300|👮‍♀️|S
Polizeihauptmeister Otto|streife|4|1700|1500|N|none|0|👮|S
Polizeioberkommissar Sven|streife|4|1500|1600|N|summon_weaken|300|👮|
Polizeihauptkommissarin Yildiz|streife|5|2000|1800|R|summon_draw|1|👮‍♀️|
Dienstgruppenleiter Hoffmann|streife|6|2300|2000|R|summon_heal|800|📻|
Fahrradstreife Nils|streife|2|1000|800|N|summon_draw|1|🚲|S
Reiterstaffel Hanna|streife|4|1600|1400|N|pierce|0|🐎|
Wasserschutzpolizist Fiete|streife|4|1500|1700|N|none|0|🚤|
Kontaktbereichsbeamter Willi|streife|2|800|1400|N|summon_heal|500|🏘️|S
Polizeipräsidentin Dr. Wolf|streife|8|2900|2900|UR|summon_heal|1000|🎖️|
Wachhabender Peters|streife|3|1100|1500|N|summon_destroy_st|0|☕|
Kriminalkommissarin Mara|kripo|3|1200|1200|N|summon_draw|1|🕵️‍♀️|S
Kriminaloberkommissar Deniz|kripo|4|1700|1200|N|none|0|🕵️|S
Kriminalhauptkommissarin Engel|kripo|5|2000|1700|R|summon_destroy_st|0|🕵️‍♀️|
Erster Kriminalhauptkommissar Roth|kripo|6|2400|1900|SR|summon_weaken|500|🕵️|
Spurensicherer Lutz|kripo|2|700|1300|N|summon_draw|1|🧤|S
Fallanalytikerin Dr. Klee|kripo|4|1400|1600|R|summon_draw|2|🧠|
Zielfahnder Kowalski|kripo|5|2200|1400|R|pierce|0|🎯|
Verdeckter Ermittler „Fuchs“|kripo|4|1800|900|R|summon_destroy_st|0|🥸|
IT-Forensikerin Pia|kripo|3|1100|1300|N|summon_destroy_st|0|💻|
Brandermittler Gerd|kripo|4|1600|1300|N|summon_burn|300|🔥|
Phantombildzeichnerin Ilka|kripo|2|600|1200|N|summon_draw|1|✏️|
Rauschgiftfahnder Can|kripo|4|1700|1400|N|summon_weaken|400|💊|
Wirtschaftskriminalist Dr. Faber|kripo|4|1300|1800|N|summon_burn|400|📊|
Leiter der Mordkommission Stein|kripo|7|2700|2200|SR|summon_destroy_st|0|🗂️|
Kriminaldirektorin Neumann|kripo|8|3000|2600|UR|summon_draw|2|🏛️|
SEK-Scharfschütze|sek|5|2300|1000|R|summon_weaken|500|🔭|
SEK-Teamführer Brenner|sek|6|2500|2000|SR|pierce|0|🪖|
MEK-Observant|sek|4|1600|1500|N|summon_destroy_st|0|🕶️|
GSG-Spezialkraft|sek|7|2900|2000|SR|pierce|0|🪂|
Verhandlungsgruppe Becker|sek|4|1000|2100|R|summon_heal|800|📞|
SEK-Rammbock-Trupp|sek|4|1900|1000|N|summon_destroy_st|0|🚪|
Sprengstoffentschärfer Jansen|sek|5|1900|2200|R|summon_destroy_st|0|🧰|
Verkehrspolizistin Steffi|verkehr|3|1100|1400|N|summon_weaken|300|🚦|S
Autobahnpolizei Lars|verkehr|4|1800|1200|N|none|0|🚔|S
Motorradstreife Tom|verkehr|4|1800|1100|N|pierce|0|🏍️|
Laserkontrolle Gabi|verkehr|2|900|1100|N|summon_burn|300|📸|S
Unfallaufnahme-Team|verkehr|3|1000|1600|N|summon_draw|1|📐|
Video-Messfahrzeug|verkehr|5|2000|1600|R|summon_weaken|400|📹|
Leiterin Verkehrsdienst Arndt|verkehr|6|2400|2100|SR|summon_burn|500|🚨|
Schutzhund Bella|hunde|3|1300|900|N|none|0|🐕‍🦺|S
Rauschgiftspürhund Pepper|hunde|3|1200|1000|N|summon_destroy_st|0|🐶|
Sprengstoffspürhund Ajax|hunde|4|1600|1100|R|summon_destroy_st|0|🐕|
Leichenspürhund Nero|hunde|3|1100|1100|N|summon_draw|1|🐾|
Diensthundeführer Krause|hunde|4|1500|1500|N|summon_heal|400|🦮|S
Personenspürhund Luna|hunde|4|1700|1000|N|pierce|0|🐕|
Polizeihund-Staffelleiter|hunde|6|2300|1900|R|pierce|0|🏅|
Bereitschaftspolizist Malte|bepo|3|1300|1300|N|none|0|🛡️|S
Beweis- und Festnahmeeinheit|bepo|4|1800|1300|N|pierce|0|⛓️|S
Wasserwerfer WaWe 10|bepo|6|2200|2400|R|summon_weaken|500|🚒|
Technische Einheit|bepo|4|1200|1900|N|summon_destroy_st|0|🔧|
Lautsprecherwagen|bepo|2|500|1500|N|summon_heal|500|📢|
Reiterstaffel-Zug|bepo|5|2100|1700|R|none|0|🐎|
Polizeihubschrauberstaffel|bepo|7|2600|2400|SR|summon_draw|1|🚁|
Einsatzleiter Polizeidirektor Kühn|bepo|7|2600|2600|SR|summon_heal|1000|🎖️|
"""

POL_ACTS = """
Vorläufige Festnahme|spell|StPO|§ 127 StPO|SR|destroy_best|0|⛓️|
Durchsuchung beim Verdächtigen|spell|StPO|§ 102 StPO|N|destroy_st|0|🔍|S
Beschlagnahme|spell|StPO|§ 94 StPO|N|weaken|800|📦|S
Identitätsfeststellung|spell|StPO|§ 163b StPO|N|burn|500|📋|S
Erkennungsdienstliche Behandlung|trap|StPO|§ 81b StPO|R|counter_burn|400|📸|
Platzverweis|spell|SOG|SOG|N|bounce|0|🚫|S
Gewahrsam|trap|SOG|SOG|R|mirror|0|🔒|
Eigensicherung|trap|SOG|SOG|N|negate|0|🛡️|S
Verstärkung angefordert|spell|SOG|SOG|N|heal|1000|📻|S
Haftbefehl|spell|StPO|§ 114 StPO|SR|destroy_best|0|📜|
Untersuchungshaft|trap|StPO|§ 112 StPO|SR|mirror|0|🏢|
Durchsuchung bei Dritten|spell|StPO|§ 103 StPO|N|destroy_st|0|🗄️|
Telekommunikationsüberwachung|spell|StPO|§ 100a StPO|R|draw|2|🎧|
Observation|spell|StPO|§ 163f StPO|N|draw|1|🔭|S
Öffentlichkeitsfahndung|spell|StPO|§ 131b StPO|R|weaken_all|500|📰|
Ausschreibung zur Festnahme|spell|StPO|§ 131 StPO|R|weaken|1000|📡|
Beschuldigtenvernehmung|spell|StPO|§ 136 StPO|N|draw|2|🗣️|
Blutprobe|spell|StPO|§ 81a StPO|N|weaken|600|🩸|
DNA-Identitätsfeststellung|spell|StPO|§ 81g StPO|R|burn|800|🧬|
Kontrollstelle|trap|StPO|§ 111 StPO|N|trap_weaken|800|🚧|S
Festhalten zur Identitätsfeststellung|trap|StPO|§ 163c StPO|N|negate|0|✋|
Recht des ersten Zugriffs|spell|StPO|§ 163 StPO|N|boost|600|⚡|S
Verdeckter Ermittler|spell|StPO|§ 110a StPO|R|destroy_st|0|🥸|
Rasterfahndung|spell|StPO|§ 98a StPO|SR|destroy_all|0|🖥️|
Vermögensarrest|spell|StPO|§ 111e StPO|R|burn|1000|💶|
Gegenüberstellung|spell|StPO|§ 58 StPO|N|bounce|0|👥|
Sonderkommission bilden|spell|StPO|§ 163 StPO|SR|fusion|0|🧩|
Aufenthaltsverbot|spell|SOG|SOG|R|bounce|0|⛔|
Wohnungsverweisung|spell|SOG|SOG|N|bounce|0|🚪|
Sicherstellung|spell|SOG|SOG|N|weaken|700|🧺|S
Gefährderansprache|spell|SOG|SOG|N|weaken_all|300|☝️|S
Meldeauflage|trap|SOG|SOG|N|trap_weaken|600|🗓️|
Unmittelbarer Zwang|spell|SOG|SOG|R|destroy_best|0|💪|
Fesselung|trap|SOG|SOG|R|mirror|0|🔗|
Durchsuchung von Sachen|spell|SOG|SOG|N|destroy_st|0|🎒|
Absperrung|trap|SOG|SOG|N|negate|0|🚧|S
Vorladung|spell|SOG|SOG|N|draw|1|✉️|
Videoüberwachung|spell|SOG|SOG|N|draw|2|📹|
Einsatzbesprechung|spell|SOG|SOG|N|boost_all|400|🗺️|
Gemeinsamer Einsatz|spell|SOG|SOG|R|fusion|0|🤝|S
Lagebild|spell|SOG|SOG|N|heal|800|🗺️|
Ingewahrsamnahme zum Schutz|trap|SOG|SOG|N|counter_burn|300|🧯|
Wiederaufnahme der Ermittlungen|spell|StPO|§ 359 StPO|R|revive|0|📂|
Beschuldigtenbelehrung|trap|StPO|§ 136 StPO|N|negate|0|🗣️|
Ingewahrsamnahme|spell|SOG|SOG|SR|steal|0|🚔|
"""

VER_CHARS = """
Taschendieb Toni|dieb|2|1000|600|N|summon_draw|1|👜|S
Heiratsschwindler Max|betrug|3|1200|1100|N|summon_heal|500|🎭|S
Hehlerin Rosi|hehler|3|1100|1600|N|none|0|📦|S
Einbrecher Kralle|dieb|4|1700|1100|N|pierce|0|🥷|S
Straßendealer Ede|drogen|4|1600|1300|N|summon_burn|300|💊|S
Bandenchef Vito|bande|6|2400|1900|SR|none|0|🦹|
Bankräuber-Duo|raub|7|2700|2100|SR|summon_burn|500|💰|
Das Phantom|betrug|8|3000|2400|UR|none|0|🦹‍♀️|
Ladendieb Lukas|dieb|1|500|500|N|summon_draw|1|🛒|S
Fahrraddieb Flitzer|dieb|2|900|700|N|summon_draw|1|🚲|S
Autoknacker Jojo|dieb|3|1300|900|N|pierce|0|🚗|S
Fassadenkletterin Katze|dieb|4|1800|1000|R|summon_destroy_st|0|🐈‍⬛|
Juwelendieb Monsieur Blanc|dieb|5|2100|1500|R|summon_draw|1|💎|
Kunstdieb Rembrandt-Rudi|dieb|6|2300|1800|SR|summon_draw|2|🖼️|
Meisterdieb Schatten|dieb|8|2900|2100|UR|summon_destroy_st|0|🌑|
Taschendiebin Fingerling|dieb|3|1300|800|N|summon_weaken|300|🧤|S
Tresorknacker Ohr|dieb|4|1500|1300|N|summon_destroy_st|0|🔐|
Einbrecherbande Nachtfalter|dieb|5|2000|1600|R|pierce|0|🦋|
Enkeltrick-Erna|betrug|2|800|1100|N|summon_heal|500|👵|S
Hütchenspieler Kalle|betrug|2|1000|900|N|summon_burn|200|🥤|S
Falscher Polizeibeamter|betrug|3|1300|1000|N|summon_weaken|300|🎭|
Phishing-Pirat|betrug|3|1100|1200|N|summon_draw|1|🎣|
Schneeballkönig Dr. Gier|betrug|5|1900|2000|R|summon_heal|800|☃️|
Urkundenfälscher Feder|betrug|3|1000|1400|N|summon_destroy_st|0|🖋️|
Scheckbetrüger Charmeur|betrug|4|1600|1300|N|summon_heal|400|🧾|
Anlagebetrügerin Golden|betrug|6|2200|2100|SR|summon_burn|500|📈|
Hochstapler Graf Zocker|betrug|7|2600|2300|SR|summon_draw|1|🎩|
Love-Scammerin Rose|betrug|4|1500|1400|N|summon_heal|500|🌹|
Bandenmitglied Ratte|bande|2|1000|700|N|none|0|🐀|S
Schläger Bulle|bande|4|1900|900|N|pierce|0|👊|S
Türsteher Klotz|bande|4|1300|1900|N|none|0|🚪|S
Rockerboss Eisenfaust|bande|6|2400|1800|SR|pierce|0|🏍️|
Clan-Vollstrecker|bande|5|2200|1400|R|summon_weaken|400|⛓️|
Schutzgelderpresser Zahltag|bande|4|1600|1200|N|summon_burn|400|💸|
Fluchtfahrer Turbo|bande|3|1400|900|N|summon_draw|1|🏎️|S
Spitzel Flüster|bande|2|700|1000|N|summon_destroy_st|0|👂|
Unterboss Narbe|bande|5|2100|1700|R|none|0|😠|
Pate Don Corvo|bande|8|3000|2500|UR|summon_weaken|500|🐦‍⬛|
Hehler Krempel|hehler|2|800|1300|N|summon_draw|1|🧳|S
Pfandleiher Zwielicht|hehler|3|1000|1500|N|summon_heal|400|🏚️|
Lagerhaus-Boss Kiste|hehler|5|1800|2200|R|summon_draw|1|🏭|
Geldwäscherin Saubermann|hehler|4|1400|1600|N|summon_heal|600|🧼|
Schmuggler Kapitän Nebel|hehler|5|2000|1800|R|summon_destroy_st|0|🚢|
Darknet-Händler Null|hehler|4|1500|1400|N|summon_draw|1|🕸️|
Antikschieber Patina|hehler|3|1100|1400|N|summon_burn|300|🏺|
Hehlerkönigin Baronin|hehler|7|2500|2600|SR|summon_draw|2|👑|
Straßenräuber Messer-Mike|raub|3|1400|800|N|pierce|0|🔪|
Tankstellenräuber Zappel|raub|3|1300|900|N|summon_burn|300|⛽|S
Geldtransporträuber Panzer|raub|6|2400|1900|SR|summon_burn|500|🚛|
Maskierter Räuber|raub|4|1700|1200|N|summon_weaken|300|🎃|S
Postkutschen-Paule|raub|2|1000|600|N|summon_burn|200|🐴|
Juwelierräuberin Blitz|raub|5|2100|1300|R|pierce|0|⚡|
Räuberhauptmann Pfefferbart|raub|5|2000|1700|R|summon_burn|400|🎩|
Gangsterbraut Lola|raub|4|1600|1400|N|summon_heal|400|💋|
Ausbrecherkönig Houdini-Harry|raub|7|2700|2000|SR|summon_draw|1|⛓️‍💥|
Kurier Schnell|drogen|2|900|900|N|summon_draw|1|🛵|S
Dealerin Zucker|drogen|3|1200|1100|N|summon_weaken|300|🍬|S
Laborkoch Professor|drogen|5|1800|1900|R|summon_burn|500|🧪|
Plantagenbetreiber Grünling|drogen|4|1400|1600|N|summon_heal|500|🌿|
Kartellbote Schatten-Juan|drogen|4|1700|1200|N|pierce|0|🎒|
Drogenbaron El Jefe|drogen|8|2900|2600|UR|summon_burn|800|💼|
Großhändler Kilo|drogen|6|2300|2000|SR|summon_draw|1|⚖️|
Türsteher-Dealer Nachtclub|drogen|3|1300|1200|N|none|0|🪩|
"""

VER_ACTS = """
Fluchtwagen|spell|Trick||N|draw|2|🚗|S
Teurer Anwalt|spell|Trick||R|heal|1000|⚖️|
Überfall|spell|Trick||R|burn|800|🔫|
Brechstange|spell|Trick||N|boost|700|🗝️|S
Falsches Alibi|trap|Trick||N|negate|0|📜|S
Hinterhalt|trap|Trick||R|mirror|0|🏚️|
Rauchbombe|trap|Trick||N|negate|0|💨|S
Dietrich|spell|Trick||N|destroy_st|0|🗝️|S
Maskierung|spell|Trick||N|boost|500|🎭|S
Wegwerfhandy|spell|Trick||N|draw|1|📱|S
Gefälschter Ausweis|trap|Trick||N|trap_weaken|700|🪪|
Ablenkungsmanöver|spell|Trick||N|bounce|0|🎪|S
Schmiere stehen|trap|Trick||N|counter_burn|300|👀|
Spuren verwischen|spell|Trick||N|destroy_st|0|🧽|
Unterschlupf|spell|Trick||N|heal|800|🏚️|S
Komplize|spell|Trick||N|boost|600|🤜|
Hehlerware verticken|spell|Trick||N|draw|2|💰|
Kaution hinterlegt|spell|Trick||R|revive|0|💵|
Schweigerecht|trap|Trick||N|negate|0|🤐|
Revision eingelegt|spell|Trick||R|revive|0|📑|
Bestechungsversuch|spell|Trick||R|weaken|900|💶|
Störsender|spell|Trick||R|destroy_st|0|📶|
Fluchttunnel|trap|Trick||SR|mirror|0|🕳️|
Krähenfüße|trap|Trick||N|trap_weaken|900|📍|
Fake-Notruf|spell|Trick||N|weaken_all|300|☎️|
Bandenkrieg|spell|Trick||SR|destroy_all|0|💥|
Erpressung|spell|Trick||R|burn|700|✉️|
Tarnidentität|trap|Trick||R|counter_burn|500|🥸|
Großer Coup|spell|Trick||SR|boost_all|700|🏦|
Lösegeldforderung|spell|Trick||N|burn|500|💼|
Zeugen einschüchtern|spell|Trick||R|destroy_best|0|😈|
Geheimversteck|trap|Trick||N|negate|0|📦|
Fluchtroute|spell|Trick||N|draw|1|🗺️|S
Schutzgeld kassieren|spell|Trick||N|heal|600|💸|
Feuerwerk zur Ablenkung|spell|Trick||N|weaken|600|🎆|
Bandengründung|spell|Trick||SR|fusion|0|🧩|
Komplizen-Treffen|spell|Trick||R|fusion|0|🤝|S
Hinterzimmer-Deal|spell|Trick||N|draw|2|🚬|
Panikmache|spell|Trick||N|weaken_all|400|😱|
Verfolgungsjagd|spell|Trick||N|boost|800|🏁|
Gefängnisausbruch|spell|Trick||SR|revive|0|⛓️‍💥|
Falsche Fährte|trap|Trick||N|trap_weaken|600|👣|
Sündenbock|spell|Trick||R|scapegoat|0|🐐|
Beweise vernichten|spell|Trick||N|mill|2|🔥|
"""

POL_FUS = """
K-9-Einsatzteam|hunde|6|2500|1800|R|pierce|0|🐕‍🦺|hunde+streife
Sonderkommission „Phantom“|kripo|8|3100|2600|SR|summon_destroy_st|0|🗂️|kripo+kripo
SEK-Großlage|sek|9|3300|2800|UR|summon_weaken|800|🪖|sek+sek+any
Verkehrsfahndungsgruppe|verkehr|6|2500|2000|R|summon_burn|500|🚔|verkehr+verkehr
Mobiles Einsatzkommando|sek|7|2800|2200|SR|pierce|0|🕶️|sek+kripo
Hundertschaft im Großeinsatz|bepo|8|3000|3000|SR|summon_heal|1000|🛡️|bepo+bepo+streife
Gemeinsames Ermittlungsteam|kripo|7|2700|2400|R|summon_draw|2|🤝|kripo+streife
Luft-Boden-Fahndung|bepo|8|3200|2300|SR|pierce|0|🚁|bepo+verkehr
Polizeidirektion Gesamteinsatz|streife|10|3600|3200|UR|summon_destroy_st|0|🏛️|streife+kripo+sek
Spürnasen-Duo|hunde|5|2200|1700|R|summon_destroy_st|0|🐾|hunde+hunde
Kriminaldauerdienst|kripo|6|2400|2100|R|summon_draw|1|🌙|kripo+any
Bürgernahe Wache|streife|5|2000|2400|N|summon_heal|800|🏘️|streife+streife
"""

VER_FUS = """
Einbrecherkartell|dieb|7|2800|2000|SR|summon_destroy_st|0|🦝|dieb+dieb
Betrugsimperium|betrug|7|2600|2500|SR|summon_heal|1000|🏰|betrug+betrug
Rockergang Höllenhunde|bande|7|2800|2200|SR|pierce|0|🏍️|bande+bande
Hehlernetzwerk|hehler|6|2300|2600|R|summon_draw|2|🕸️|hehler+any
Bankraub-Kommando|raub|8|3100|2200|SR|summon_burn|800|💰|raub+raub
Drogenkartell|drogen|8|3000|2500|SR|summon_weaken|700|💼|drogen+drogen
Organisierte Kriminalität|bande|10|3600|3100|UR|summon_destroy_st|0|🐙|bande+hehler+any
Das Phantom-Syndikat|betrug|10|3500|3300|UR|summon_weaken|1000|🦹‍♀️|betrug+dieb+raub
Clan der Schatten|bande|9|3300|2700|UR|pierce|0|🌑|bande+dieb+any
Fluchthelfer-Ring|raub|6|2400|1900|R|summon_draw|1|🚐|raub+any
Geldwäsche-Ring|hehler|7|2600|2600|R|summon_burn|600|🧼|hehler+betrug
Straßengang|bande|5|2100|1600|N|pierce|0|👥|bande+any
"""

# v0.4: neue Effekte thematisch auf bestehende Karten verteilt (Name -> (Effekt, Wert))
OVERRIDES = {
  # Polizei – Charaktere
  "Polizeimeisteranwärter Ben":("growth",200), "Polizeihauptmeister Otto":("turn_heal",200), "Fahrradstreife Nils":("direct",0),
  "Reiterstaffel Hanna":("double_attack",0), "Kontaktbereichsbeamter Willi":("turn_heal",300), "Kriminaloberkommissar Deniz":("battle_draw",0),
  "Zielfahnder Kowalski":("direct",0), "Phantombildzeichnerin Ilka":("summon_flip_all",0), "Rauschgiftfahnder Can":("summon_discard",1),
  "Wirtschaftskriminalist Dr. Faber":("summon_mill",3), "Leiter der Mordkommission Stein":("battle_burn",500), "Kriminaldirektorin Neumann":("immune",0),
  "SEK-Scharfschütze":("summon_destroy_weak",0), "SEK-Teamführer Brenner":("double_attack",0), "MEK-Observant":("summon_flip_all",0),
  "GSG-Spezialkraft":("direct",0), "Verhandlungsgruppe Becker":("summon_lock",0), "Autobahnpolizei Lars":("battle_heal",300),
  "Leiterin Verkehrsdienst Arndt":("turn_burn",200), "Schutzhund Bella":("guard",0), "Leichenspürhund Nero":("summon_revive",0),
  "Personenspürhund Luna":("direct",0), "Polizeihund-Staffelleiter":("summon_boost_all",300), "Bereitschaftspolizist Malte":("guard",0),
  "Wasserwerfer WaWe 10":("summon_bounce",0), "Lautsprecherwagen":("summon_lock",0), "Reiterstaffel-Zug":("guard",0),
  "Einsatzleiter Polizeidirektor Kühn":("summon_boost_all",500), "Polizeihubschrauber Libelle":("summon_flip_all",0),
  "Polizeihubschrauberstaffel":("direct",0), "Polizeihauptkommissarin Yildiz":("battle_draw",0), "Spurensicherer Lutz":("last_draw",0),
  "Polizeipräsidentin Dr. Wolf":("immune",0), "Technische Einheit":("revenge",500),
  # Polizei – StPO/SOG
  "Rasterfahndung":("destroy_level",4), "Durchsuchung bei Dritten":("destroy_all_st",0), "Gegenüberstellung":("reset_atk",0),
  "Sicherstellung":("discard",1), "Ausschreibung zur Festnahme":("lock_all",0), "Lagebild":("heal_per_monster",400),
  "Fesselung":("trap_lock",0), "Vorladung":("search_monster",0), "Videoüberwachung":("search_spell",0),
  "Ingewahrsamnahme zum Schutz":("trap_heal",800), "Untersuchungshaft":("trap_destroy_all_atk",0), "Recht des ersten Zugriffs":("extra_summon",0),
  "Verstärkung angefordert":("revive_field",0), "DNA-Identitätsfeststellung":("burn_per_monster",300), "Kontrollstelle":("trap_weaken_all",500),
  "Vermögensarrest":("mill",3), "Unmittelbarer Zwang":("destroy_weak",0), "Absperrung":("trap_draw",1), "Wohnungsverweisung":("def_mode",0),
  # Verbrecher – Charaktere
  "Ladendieb Lukas":("last_draw",0), "Fahrraddieb Flitzer":("direct",0), "Taschendiebin Fingerling":("summon_discard",1),
  "Fassadenkletterin Katze":("direct",0), "Juwelendieb Monsieur Blanc":("battle_draw",0), "Meisterdieb Schatten":("immune",0),
  "Einbrecherbande Nachtfalter":("double_attack",0), "Falscher Polizeibeamter":("summon_steal",0), "Phishing-Pirat":("summon_mill",2),
  "Schneeballkönig Dr. Gier":("turn_heal",300), "Scheckbetrüger Charmeur":("battle_heal",300), "Anlagebetrügerin Golden":("turn_burn",300),
  "Hochstapler Graf Zocker":("immune",0), "Love-Scammerin Rose":("summon_lock",0), "Bandenmitglied Ratte":("revenge",300),
  "Türsteher Klotz":("guard",0), "Rockerboss Eisenfaust":("double_attack",0), "Clan-Vollstrecker":("summon_destroy_weak",0),
  "Schutzgelderpresser Zahltag":("turn_burn",200), "Fluchtfahrer Turbo":("survivor",0), "Spitzel Flüster":("summon_flip_all",0),
  "Unterboss Narbe":("summon_boost_all",300), "Pfandleiher Zwielicht":("summon_revive",0), "Lagerhaus-Boss Kiste":("guard",0),
  "Schmuggler Kapitän Nebel":("direct",0), "Straßenräuber Messer-Mike":("battle_burn",300), "Juwelierräuberin Blitz":("direct",0),
  "Räuberhauptmann Pfefferbart":("summon_bounce",0), "Gangsterbraut Lola":("growth",200), "Ausbrecherkönig Houdini-Harry":("survivor",0),
  "Kurier Schnell":("direct",0), "Laborkoch Professor":("turn_burn",300), "Plantagenbetreiber Grünling":("growth",300),
  "Großhändler Kilo":("battle_draw",0), "Türsteher-Dealer Nachtclub":("guard",0), "Autoknacker Jojo":("revenge",400),
  # Verbrecher – Tricks
  "Gefälschter Ausweis":("trap_bounce",0), "Fluchttunnel":("trap_draw",2), "Krähenfüße":("trap_weaken_all",500),
  "Falsche Fährte":("trap_lock",0), "Geheimversteck":("trap_heal",600), "Zeugen einschüchtern":("discard",2),
  "Spuren verwischen":("destroy_all_st",0), "Fake-Notruf":("lock_all",0), "Panikmache":("def_mode",0),
  "Hinterzimmer-Deal":("search_monster",0), "Schutzgeld kassieren":("burn_per_monster",300), "Komplize":("extra_summon",0),
  "Gefängnisausbruch":("revive_field",0), "Fluchtroute":("search_spell",0), "Bestechungsversuch":("steal",0),
  "Tarnidentität":("trap_steal",0), "Hehlerware verticken":("heal_per_monster",400), "Feuerwerk zur Ablenkung":("reset_atk",0),
}

def rows(txt):
    for line in txt.strip().splitlines():
        line=line.strip()
        if line: yield [x.strip() for x in line.split("|")]

def build():
    cards=[]
    def chars(txt, faction, prefix):
        for i,r in enumerate(rows(txt),1):
            name,role,lv,atk,df,rar,eff,val,emo,st = (r+[""]*10)[:10]
            c1,c2=ROLE_COLORS[role]
            cards.append(dict(id=f"{prefix}{i:03d}",name=name,faction=faction,type="monster",attr=role,level=int(lv),atk=int(atk),def_=int(df),
                rarity=rar,effect=eff,val=int(val),starter=st=="S",art=dict(emoji=emo,c1=c1,c2=c2)))
    def acts(txt, faction, prefix, start):
        for i,r in enumerate(rows(txt),start):
            name,typ,law,ref,rar,eff,val,emo,st = (r+[""]*9)[:9]
            c1,c2=LAW_COLORS[law]
            cards.append(dict(id=f"{prefix}{i:03d}",name=name,faction=faction,type=typ,law=law,ref=ref,rarity=rar,effect=eff,val=int(val),
                starter=st=="S",art=dict(emoji=emo,c1=c1,c2=c2)))
    def fus(txt, faction, prefix):
        for i,r in enumerate(rows(txt),1):
            name,role,lv,atk,df,rar,eff,val,emo,mat = r
            c1,c2=ROLE_COLORS[role]
            cards.append(dict(id=f"{prefix}{i:02d}",name=name,faction=faction,type="fusion",attr=role,level=int(lv),atk=int(atk),def_=int(df),
                rarity=rar,effect=eff,val=int(val),materials=mat.split("+"),starter=False,art=dict(emoji=emo,c1=c1,c2=c2)))
    chars(POL_CHARS,"polizei","p"); acts(POL_ACTS,"polizei","p",501)
    chars(VER_CHARS,"verbrecher","v"); acts(VER_ACTS,"verbrecher","v",501)
    fus(POL_FUS,"polizei","pf"); fus(VER_FUS,"verbrecher","vf")
    import re
    effects=set(re.findall(r"^\s+([a-z_]+):\s*\{types:", open(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),"src/game.js"),encoding="utf-8").read(), re.M))
    names={c["name"] for c in cards}
    miss=[n for n in OVERRIDES if n not in names]; assert not miss, ("Override ohne Karte", miss)
    for c in cards:
        if c["name"] in OVERRIDES: c["effect"],c["val"]=OVERRIDES[c["name"]]
        assert c["effect"] in effects, (c["name"], c["effect"])
    used={c["effect"] for c in cards}
    print("Effekte gesamt:",len(effects),"· auf Standardkarten genutzt:",len(used),"· ungenutzt:",sorted(effects-used))
    ids=[c["id"] for c in cards]; assert len(ids)==len(set(ids))
    names=[c["name"] for c in cards]; dup={n for n in names if names.count(n)>1}; assert not dup, dup
    for c in cards:
        if "def_" in c: c["def"]=c.pop("def_")
    return cards

if __name__=="__main__":
    cards=build()
    root=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    js="/* AUTOMATISCH ERZEUGT von tools/cards_gen.py – Karten dort bearbeiten */\nconst START_CARDS = "+json.dumps(cards,ensure_ascii=False,separators=(",",":")).replace('},{','},\n{')+";\n"
    open(os.path.join(root,"src/cards.js"),"w",encoding="utf-8").write(js)
    from collections import Counter
    print("Gesamt:",len(cards))
    print(Counter((c["faction"],c["type"]) for c in cards))
    print("Startset:",Counter(c["faction"] for c in cards if c["starter"]))
    print("Seltenheit:",Counter(c["rarity"] for c in cards))
