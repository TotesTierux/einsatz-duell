# Balance-Simulation (KI gegen KI)

Die Duell-Engine kann beide Seiten von der KI spielen lassen (`Duel.start(side,{pDeck, oppDeck, autoP:true})`).
Die Testsimulation wurde mit zufälligen 30-Karten-Decks aus dem ganzen Kartenpool gespielt, Celestial inklusive.

| Lauf | Spiele | Polizei gewinnt | Änderung |
|---|---|---|---|
| vorher | 50 / 2000 / 1400 | 56–60 % | – |
| A | 1400 | 53,1 % | Einzelkarten angepasst, Verbrecher-Charaktere bis Stufe 5 +150 ATK |
| B | 1200 | **51,1 %** | Verbrecher +200 ATK, Darknet-Händler Null angepasst |

## Änderungen
- Verbrecher-Charaktere bis Stufe 5: +200 ATK (`BUFF_VER` in `tools/cards_gen.py`)
- Celestial-Charaktere brauchen nur noch 1 Ablösung (wurden vorher fast nie ausgespielt)
- Übernahme-Effekte haben eine ATK-Obergrenze: Ingewahrsamnahme und Bestechungsversuch bis 1800, Falscher Polizeibeamter bis 1300
- SEK-Rammbock-Trupp 1900 → 1700 ATK, Polizeikommissarin Lea 1600 → 1500 ATK, Darknet-Händler Null 1500 ATK
- Schwache Karten verstärkt: Vermögensarrest (5 Karten), DNA-Identitätsfeststellung (400 je Charakter), Dealerin Zucker (1500 ATK)

Nach den Änderungen liegt keine Karte mehr deutlich über dem Zufallsrauschen (±7 % Siegquote, wenn sie im Deck ist).
