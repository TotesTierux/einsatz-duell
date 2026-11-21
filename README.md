# Einsatz-Duell – Polizei gegen Verbrecher (v0.5)

Comic-Kartenspiel ähnlich Yu-Gi-Oh mit Polizeibezug. Zwei Parteien: **Polizei** und **Verbrecher**. Statt Monstern gibt es **Charaktere**, statt Zauber und Fallen gibt es **Maßnahmen** und **Reaktionen** mit Rechtsgrundlage:

- **StPO** (grün) – Strafverfolgung, z. B. § 127 Festnahme, § 102 Durchsuchung, § 94 Beschlagnahme, § 100a TKÜ, § 114 Haftbefehl
- **SOG** (petrol) – Gefahrenabwehr, z. B. Platzverweis, Gewahrsam, Aufenthaltsverbot, Unmittelbarer Zwang (Paragraf frei eintragbar für dein Bundesland)
- **Tricks** (lila) – die Karten der Verbrecher, z. B. Fluchtwagen, Falsches Alibi, Kaution hinterlegt

## Inhalt

- **240 Karten**: 127 Charaktere, 89 StPO/SOG/Tricks, 24 Fusionen (je Partei ca. die Hälfte)
- **69 Effekte**, alle auf Karten im Spiel:
  - Beim Ausspielen (14): Schaden, LP, Ziehen, Schwächen, Verdeckte Karte entfernen, Schwächsten ausschalten, Verweisen, Team verstärken, Kollegen zurückholen, Handkarte abnehmen, Deck lichten, Alles aufdecken, Festhalten, Überlaufen lassen
  - Dauerhaft (5): Durchschlag, Doppelangriff, Schleichweg (Direktangriff), Deckung, Immunität
  - Kampf / Ausscheiden / Zugbeginn (9): Sieg-LP, Sieg-Schaden, Sieg-Ziehen, Entwischt, Letzter Funkspruch, Akte weitergeben, Erfahrung sammeln, Ruhe bewahren, Dauerdruck
  - Maßnahmen/Tricks (29): u. a. Razzia bis Stufe X, Hände hoch!, Alle festhalten, Gegner übernehmen, Lage beruhigen, Sündenbock, Charakter/Maßnahme suchen, Zusätzlicher Einsatz, Zurückholen aufs Feld, Fusion
  - Reaktionen (11): u. a. Großzugriff, Angreifer übernehmen/zurückschicken, Abwehren + LP/ziehen/festhalten
  - Im Admin-Editor sind die Effekte nach diesen Gruppen sortiert.
- **Fusionen**: Fusionskarten wie „Gemeinsamer Einsatz“, „Sonderkommission bilden“, „Bandengründung“ vereinen Charaktere bestimmter Rollen (z. B. Diensthunde + Streife → K-9-Einsatzteam). Fusionen liegen im Fusionsdeck (automatisch alle eigenen, max. 15).
- **Münzen & Shop**: Start mit 🪙500 und einem Startset (63 Karten je 2×). Sieg 🪙100, Niederlage 🪙25, Story-Kapitel bis 🪙800.
  - Streifen-Booster / Unterwelt-Booster (🪙100, 5 Karten), Großeinsatz-Booster (🪙150, 7), Fusions-Akte (🪙300, garantierte Fusion), Ermittlerakte Gold (🪙450, mind. 1× SR/UR)
  - Seltenheiten: N 70 %, R 20 %, SR 8 %, UR 2 %; mind. 1× R pro Pack
- **Story-Modus**: Kampagne „Akte Phantom“ (Polizei, 7 Kapitel) und „Der große Coup“ (Verbrecher, 6 Kapitel) mit Comic-Dialogen. Gegner werden mit jedem Kapitel stärker.
- **Gegner-Ansagen**: Jede gegnerische Karte wird groß angezeigt – mit Art (StPO/SOG/Trick, Paragraf), Effektgruppe, Wirkung und Ziel. Die Ansage bleibt stehen, bis du **„Verstanden“** tippst; erst dann wirkt der Effekt. Tipp auf die Statuszeile öffnet das **Einsatzprotokoll**.
- **Angriffs-Animationen** je Rolle: Die Karte stürmt aufs Ziel, dazu Ausruf, Partikel und Blitzlicht – z. B. Streife „HALT, POLIZEI!“ mit Blaulicht, Diensthunde „WUFF! FASS!“ mit Pfoten, SEK „ZUGRIFF!“, Räuber „ÜBERFALL!“, Betrüger „REINGELEGT!“. Dazu Paragrafen-Stempel bei Maßnahmen, Rauchwolke beim Ausscheiden und LP-Zahlen. (Bei „Bewegung reduzieren“ im System automatisch zurückgenommen.)
- **Kartennamen** werden immer vollständig angezeigt – Schriftgröße passt sich automatisch an, lange Namen brechen an Wortfugen um.
- **Online-Duell (neu in 0.5)**: Raum erstellen → 5-stelligen Code teilen → Gegner tritt bei. Eigener Nickname, jeder spielt mit seinem eigenen Deck, Gastgeber wählt die Seite. Peer-to-Peer über PeerJS (WebRTC, kostenloser Vermittlungsserver), funktioniert zwischen Android-App, iPhone-Web-App und Browser. Sieg 🪙150, Niederlage 🪙30. Der Gastgeber berechnet das Duell, der Gast schickt seine Züge; Ansagen, Animationen und Reaktions-Abfragen erscheinen bei beiden.
- **Duell gegen KI**: 4000 LP, 3 Charakter- und 3 Maßnahmen/Reaktions-Zonen, Ablösung ab Stufe 5 (1) bzw. 7 (2)
- **Deck-Bau** je Partei: 20–40 Karten, max. 3 Kopien – nur Karten, die du besitzt
- **Admin-Bereich** (PIN `1234`)
  - Karten: erstellen, bearbeiten, kopieren, löschen – inkl. Fusionen mit Materialien, Rechtsgrundlage, Paragraf, Effekt, eigenem Bild
  - Story: Kampagnentitel, Kapitel anlegen/sortieren/löschen, Dialoge (`Name | Emoji | Text` pro Zeile), Gegner (Name, LP, max. Stufe, max. Seltenheit), Belohnung
  - Spieler: Münzen geben, alle Karten freischalten, Sammlung/Story zurücksetzen
  - Export/Import aller Karten **und** der Story als JSON

## Download & Updates

- **Download-Seite:** https://totestierux.github.io/einsatz-duell/
- **Android-APK (immer aktuell):** https://github.com/TotesTierux/einsatz-duell/releases/latest/download/EinsatzDuell.apk
- **iPhone/iPad & Browser:** https://totestierux.github.io/einsatz-duell/spiel/ → in Safari „Teilen → Zum Home-Bildschirm“

Jeder Push auf `main` startet den Workflow **„APK & Webseite veröffentlichen“**:
1. baut die APK (Version = Inhalt von `VERSION` + laufende Nummer, z. B. 0.4.7),
2. veröffentlicht sie als GitHub-Release,
3. aktualisiert die Webseite inkl. `version.json` (Branch `gh-pages`). Ohne Secrets wird nur die Webseite veröffentlicht.

Die Android-App prüft beim Start `version.json`. Gibt es eine neuere Version, erscheint „Update verfügbar“ → ein Tipp lädt und installiert sie; der Spielstand bleibt erhalten (gleicher Signaturschlüssel). Die Web-App lädt online immer die neueste Version und funktioniert offline.

**Einmalige Einrichtung im Repo:** Die Webseite liegt im Branch `gh-pages` (Settings → Pages → Source: „Deploy from a branch“, Branch `gh-pages`). Settings → Secrets and variables → Actions: Secrets **`KEYSTORE_B64`** (Signaturschlüssel als Base64) und **`KEYSTORE_PASS`** (Passwort). Der Schlüssel liegt bewusst nicht im Code. Gut aufbewahren – ohne ihn lassen sich keine Updates über die installierte App spielen.

## Projektstruktur

```
tools/cards_gen.py                 ← Kartentabelle (alle 236 Standardkarten) → erzeugt src/cards.js
src/head.part, src/body.part       ← Styles und Bildschirme (HTML)
src/game.js                        ← Spiellogik (Duell, KI, Shop, Story, Admin)
build.py                           ← setzt alles zu android/.../assets/index.html zusammen
android/                           ← Android-App (WebView-Hülle)
  app/src/main/assets/index.html   ← gebaute Spieldatei, die in die APK kommt
  app/src/main/java/.../MainActivity.java
```

Nach Änderungen:
```
python3 tools/cards_gen.py   # nur wenn die Kartentabelle geändert wurde
python3 build.py
```
Effekte bestehender Standardkarten änderst du über `OVERRIDES` in `tools/cards_gen.py`. Updates werden beim nächsten Start automatisch übernommen – außer für Karten, die du im Admin-Bereich bearbeitet hast. Neue Standardkarten immer **hinten** an die Tabellen anhängen – die IDs (p001, v001, pf01 …) hängen an der Reihenfolge, Sammlungen und Decks verweisen darauf.

## Neue Effekte hinzufügen

In `src/game.js` im Objekt `EFFECTS` einen Eintrag ergänzen und die Wirkung in `Duel.activateSpell`, `Duel.monsterEffect` oder `Duel.checkTrap` programmieren. Danach erscheint er automatisch im Admin-Editor.

## Nächste Schritte (Ideen)

- **Online-Multiplayer**: Server (z. B. Firebase oder Node.js + WebSocket), Matchmaking, Kartendatenbank zentral statt lokal
- Admin-Karten, Story und Sammlungen zentral online speichern
- Tauschen zwischen Spielern
- Soundeffekte und Animationen
- Mehr Effekte (Kettenreaktionen, Fusion, Friedhof-Effekte)
