# Einsatz-Duell im Google Play Store veröffentlichen

Alles Technische ist vorbereitet. Diese Anleitung führt durch die Schritte, die nur du selbst in der Play Console machen kannst.

## Was schon fertig ist

| Thema | Stand |
|---|---|
| Ziel-API | Android 16 (API 36). Das ist ab 31.08.2026 Pflicht für neue Apps und Updates. |
| Play-Version | Eigene Variante „play“ ohne Selbst-Updater und ohne Recht „Apps installieren“, sonst lehnt Google die App ab. |
| App-Bundle | Jeder Push baut zusätzlich `EinsatzDuell-PlayStore.aab` und legt es ins GitHub-Release. |
| Randlos-Anzeige | Android 15+ zeichnet bis unter die Systemleisten; die App lässt Rand frei. |
| Zurück-Geste | Neue „Predictive Back“-Schnittstelle für Android 13+. |
| Konto löschen | In der App unter Konto → 🗑 Konto löschen, zusätzlich Webseite `…/konto-loeschen.html` (Pflichtangabe bei Google). |
| Datenschutz | `…/datenschutz.html` auf deiner GitHub-Pages-Seite, in der App verlinkt. |
| Grafiken | `store/icon-512.png`, `store/feature-graphic-1024x500.png`, `store/screenshots/*.png` |

**Bevor du startest:** In `web/datenschutz.html` und `web/konto-loeschen.html` die rot markierten Platzhalter (Name, Anschrift, E-Mail) ausfüllen. Ohne Anschrift ist die Datenschutzerklärung nicht gültig.

## 1. Entwicklerkonto
1. https://play.google.com/console → Konto erstellen. Wähle „Für mich selbst“ (privat).
2. Die einmalige Gebühr beträgt 25 US-Dollar. Danach folgt eine Identitätsprüfung mit Ausweis, die einige Tage dauern kann.
3. Wichtig für neue private Konten: Vor der Veröffentlichung musst du einen geschlossenen Test mit mindestens 12 Testern über 14 Tage am Stück machen (siehe Schritt 5).

## 2. App anlegen
- Name: **Einsatz-Duell**
- Standardsprache: Deutsch
- Typ: Spiel, kostenlos

## 3. Store-Eintrag (Hauptseite des Eintrags)
**Kurzbeschreibung (max. 80 Zeichen):**
> Comic-Kartenduell: Polizei gegen Verbrecher – sammeln, Decks bauen, online kämpfen!

**Vollständige Beschreibung:**
> 🚔 POLIZEI GEGEN VERBRECHER – das Comic-Kartenduell!
>
> Stell dein Deck aus über 250 Karten zusammen und tritt als Polizei oder Unterwelt gegen die KI oder deine Freunde an. Kommissare, Spürhunde und Sondereinheiten treffen auf Taschendiebe, Hehler und Paten – jede Karte mit eigenem Effekt und einem frechen Spruch.
>
> ⚔️ DUELLE – Beschwöre Charaktere, setze Einsatzkarten und Fallen, verschmelze Karten zu mächtigen Fusionen.
> 📖 STORY – Mehrere Kampagnen mit steigender Schwierigkeit. Jeden Monat kommt eine neue Mission dazu.
> 🌐 ONLINE – Duelle per Raumcode, Karten tauschen und Turniere für bis zu 8 Spieler mit Zuschauermodus.
> 🧩 KOMBI-EINSATZ – Ein Taktik-Modus: kombiniere Einheiten in der Arena.
> ✨ SAMMELN – Booster öffnen, seltene Celestial-Karten finden, doppelte Karten trainieren, tägliche und wöchentliche Aufträge erledigen.
> 🆕 Jede Woche erscheinen neue Karten für beide Seiten.
>
> Keine Werbung. Keine Käufe mit echtem Geld.

**Grafiken:**
- App-Symbol: `store/icon-512.png`
- Vorstellungsgrafik: `store/feature-graphic-1024x500.png`
- Smartphone-Screenshots (2–8 Stück): `store/screenshots/1-start.png` bis `6-kombi.png`

Kategorie: **Spiele → Karten**. Gib außerdem die Kontakt-E-Mail an.

## 4. App-Inhalte (Menü „Richtlinien → App-Inhalte“)
- **Datenschutzerklärung:** `https://<dein-name>.github.io/<repo>/datenschutz.html`
- **Werbung:** Nein, die App enthält keine Werbung.
- **App-Zugriff:** Alle Funktionen sind ohne Anmeldung nutzbar.
- **Einstufung (IARC-Fragebogen):** Kategorie „Spiel“. Gewalt: nur Comic-/Fantasy-Gewalt ohne Blut. Kein Glücksspiel mit echtem Geld. Nutzer können online interagieren, nämlich mit Nicknamen in Duellen. Es gibt keinen freien Chat. Erwartet wird USK 6–12 bzw. PEGI 7–12.
- **Zielgruppe:** ab 13 Jahren. Wähle „13–15, 16–17, 18+“. Bei unter 13 würden die strengen Familien-Richtlinien gelten.
- **Datensicherheit:**
  - Daten werden erhoben: ja. Alle Übertragungen sind verschlüsselt (HTTPS).
  - E-Mail-Adresse: optional, für die Kontoverwaltung, nicht geteilt.
  - Nutzer-IDs: Firebase-ID, für App-Funktionen.
  - App-Aktivität / Spielinhalte: Spielstand, für App-Funktionen.
  - Spielstatistik: anonym und aggregiert.
  - Löschung: Nutzer können die Löschung beantragen. Löschlink: `https://<dein-name>.github.io/<repo>/konto-loeschen.html`
  - Keine Weitergabe an Dritte zu Werbezwecken.
- **Behördliche App / Nachrichten-App / COVID / Finanzen:** jeweils Nein.

## 5. Geschlossener Test (Pflicht für neue Privatkonten)
1. Testen → Geschlossener Test → Track anlegen.
2. Neuen Release erstellen und `EinsatzDuell-PlayStore.aab` aus dem neuesten GitHub-Release hochladen.
3. Beim ersten Upload fragt Google nach der **Play-App-Signatur**. Wähle „Von Google generierten Schlüssel verwenden“ (empfohlen). Dein bisheriger Schlüssel aus den GitHub-Secrets wird dann der *Upload-Schlüssel*. Du musst nichts weiter tun.
4. Mindestens 12 Tester per E-Mail-Liste oder Google-Gruppe eintragen. Sie müssen über den Testlink beitreten und die App 14 Tage lang installiert lassen.
5. Danach unter „Dashboard“ den Zugriff auf die Produktionsversion beantragen. Google stellt ein paar Fragen zum Test.

## 6. Produktion
Wenn der Zugriff freigeschaltet ist, gehst du auf Produktion → Neuer Release und lädst das gleiche oder ein neueres `.aab` hoch. Länder: Deutschland, Österreich, Schweiz (oder alle). Die Prüfung dauert meist 1–7 Tage.

## Updates später
Jeder Push auf `main` erzeugt ein neues `.aab` mit höherer Versionsnummer. Das lädst du einfach als neuen Release in der Play Console hoch. Die GitHub-APK mit eigenem Updater gibt es weiterhin parallel für Freunde ohne Play Store.

> Hinweis: Wer schon die GitHub-APK installiert hat, kann die Play-Version nicht darüber installieren. Der Grund ist die andere Signatur, sobald Google signiert. Die alte App muss dann einmal deinstalliert werden. Mit Konto bleibt der Spielstand in der Cloud erhalten.
