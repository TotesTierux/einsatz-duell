# Kartenbilder mit Gemini erstellen

300 Karten → 34 Aufträge mit je bis zu 9 Bildern (ein Raster-Bild pro Auftrag).

## So geht's

1. Öffne Gemini (am besten mit Bildgenerierung, z. B. „Bild erstellen“) in einem **neuen Chat**.
2. Schicke zuerst den **Stil-Prompt** unten.
3. Schicke dann Auftrag für Auftrag (B01, B02, …). Pro Auftrag kommt ein Raster-Bild mit 9 Feldern.
4. Speichere jedes Bild unter dem Namen des Auftrags: **B01.png, B02.png, …** (Groß-B, zweistellig).
   Passt ein Bild nicht, schreib „Bitte Auftrag B07 nochmal, Feld 4 passt nicht zur Karte“ und speichere die neue Version.
5. Wenn Gemini nach einigen Aufträgen den Stil verliert: neuen Chat, Stil-Prompt erneut, beim nächsten Auftrag weitermachen.
6. Lade mir alle Bilder hoch (einzeln oder als ZIP). Ich zerschneide die Raster, ordne jedes Feld über **zuordnung.json** der richtigen Karte zu und baue sie ins Spiel ein.

Karten ohne eigenes Bild (z. B. neue Wochenkarten) bekommen automatisch das gezeichnete Comic-Bild.

## Stil-Prompt (zuerst senden)

```
Du bist Illustrator für das Handy-Kartenspiel „Einsatz-Duell“ (Polizei gegen Verbrecher, humorvoll, familienfreundlich ab 12).
Ich schicke dir gleich nacheinander mehrere Aufträge. Jeder Auftrag enthält 9 Karten.
Erzeuge pro Auftrag GENAU EIN Bild nach diesen Regeln:

LAYOUT (sehr wichtig, damit ich die Bilder automatisch zerschneiden kann):
- Ein Raster aus 3 Spalten × 3 Zeilen = 9 gleich große Felder, Gesamtbild im Querformat 16:10.
- Jedes Feld ist ein eigenes Bild im Querformat, Motiv mittig, nichts ragt über den Feldrand.
- Zwischen den Feldern eine durchgehende, gerade, 8 Pixel breite reinweiße Trennlinie, außen ein weißer Rand.
- Reihenfolge: Zeile für Zeile von links oben nach rechts unten (Feld 1 = oben links, Feld 3 = oben rechts, Feld 9 = unten rechts).
- KEIN Text, keine Buchstaben, keine Zahlen, keine Namen, keine Wasserzeichen in den Bildern.

STIL (für alle Bilder gleich):
- Farbiger Comic-Stil wie ein modernes Sammelkartenspiel: kräftige schwarze Outlines, flache Farben mit etwas Schattierung, leichtes Rasterpunkt-Muster (Halftone) im Hintergrund, dynamischer Strahlen-Hintergrund.
- Figuren als Brustbild oder Halbtotale mit übertriebenem, lustigem Gesichtsausdruck. Polizei = blau/helle Farben, Verbrecher = rot/dunkle Farben.
- Deutsche Polizei: blaue Uniformen, Schriftzug nur als unlesbare Fläche. Keine echten Personen, keine echten Marken oder Logos.
- Familienfreundlich: keine Gewalt, kein Blut (außer eine Blutprobe im Röhrchen), Waffen höchstens angedeutet, Drogen nur als bunte Pillen.

Bestätige kurz, dann schicke ich Auftrag 1.
```

## Auftrag B01

```
Auftrag B01: Raster 3×3, 9 Felder, Reihenfolge Zeile für Zeile von oben links. Kein Text im Bild.

Feld 1: Streifenpolizist Kai – männlich, Streifenpolizist(in) in blauer deutscher Polizeiuniform mit Schirmmütze. Witz der Karte: „Hat schon 400 Falschparker verwarnt – und einmal versehentlich sich selbst.“
Feld 2: Polizeikommissarin Lea – weiblich, Streifenpolizist(in) in blauer deutscher Polizeiuniform mit Schirmmütze. Witz der Karte: „Liest Akten schneller, als andere „Personalienfeststellung“ buchstabieren.“
Feld 3: Kriminalhauptkommissar Brandt – männlich, Kriminalpolizist(in) in Zivil (Trenchcoat, Hemd, Krawatte oder Blazer), Polizeimarke am Gürtel. Witz der Karte: „Löst jeden Fall. Nur nicht den, wer immer seinen Kaffee austrinkt.“
Feld 4: Diensthund Rex – Polizei-Diensthund (Deutscher Schäferhund o. ä.) mit rotem Halsband und Polizeimarke. Witz der Karte: „Guter Junge! Beißt aber trotzdem.“
Feld 5: Verkehrspolizist Uwe – männlich, Verkehrspolizist(in) mit neongelber Warnweste und weißer Polizeimütze. Witz der Karte: „Seine Trillerpfeife ist lauter als jede Hupe der Stadt.“
Feld 6: Hundertschaftsführer Krämer – männlich, Bereitschaftspolizist(in) in dunkelblauer Schutzausrüstung mit Helm. Witz der Karte: „Hat 100 Leute im Griff – nur nicht den Kopierer.“
Feld 7: SEK-Zugriffstrupp – Gruppe aus 3–4 Figuren: SEK-Spezialeinsatzkraft in schwarzer taktischer Ausrüstung mit Helm und Visier (keine Waffe im Vordergrund). Witz der Karte: „Klopfen? Wir klopfen nicht. Wir sind schon drin.“
Feld 8: Polizeihubschrauber Libelle – Polizeihubschrauber in Blau-Silber im Flug, Pilot(in) winkt aus dem Cockpit. Witz der Karte: „Sieht von oben alles. Auch dass du beim Parken über der Linie stehst.“
Feld 9: Polizeimeisteranwärter Ben – männlich, Streifenpolizist(in) in blauer deutscher Polizeiuniform mit Schirmmütze. Witz der Karte: „Erster Tag. Hat die Dienstwaffe sicherheitshalber im Spind gelassen.“
```

## Auftrag B02

```
Auftrag B02: Raster 3×3, 9 Felder, Reihenfolge Zeile für Zeile von oben links. Kein Text im Bild.

Feld 1: Polizeiobermeisterin Jana – weiblich, Streifenpolizist(in) in blauer deutscher Polizeiuniform mit Schirmmütze. Witz der Karte: „Ihre Brotdosen sind legendär. Ihr Blick bei Rotlichtsündern auch.“
Feld 2: Polizeihauptmeister Otto – männlich, Streifenpolizist(in) in blauer deutscher Polizeiuniform mit Schirmmütze. Witz der Karte: „30 Dienstjahre, 3 Bandscheiben, 0 Geduld für Ausreden.“
Feld 3: Polizeioberkommissar Sven – männlich, Streifenpolizist(in) in blauer deutscher Polizeiuniform mit Schirmmütze. Witz der Karte: „Sagt „Na, wohin so eilig?“ mit perfektem Timing.“
Feld 4: Polizeihauptkommissarin Yildiz – weiblich, Streifenpolizist(in) in blauer deutscher Polizeiuniform mit Schirmmütze. Witz der Karte: „Wer in ihrer Schicht Blödsinn macht, schreibt am Ende selbst den Bericht.“
Feld 5: Dienstgruppenleiter Hoffmann – Gruppe aus 3–4 Figuren: Streifenpolizist(in) in blauer deutscher Polizeiuniform mit Schirmmütze. Witz der Karte: „Funkt so viel, dass sein Funkgerät Urlaub beantragt hat.“
Feld 6: Fahrradstreife Nils – Polizist auf einem Polizeifahrrad mit Fahrradhelm. Witz der Karte: „Schneller durch den Stau als jeder Streifenwagen. Und dabei so umweltfreundlich.“
Feld 7: Reiterstaffel Hanna – berittene Polizei auf braunem Polizeipferd. Witz der Karte: „Das Pferd hat den höheren Dienstgrad. Sagt zumindest das Pferd.“
Feld 8: Wasserschutzpolizist Fiete – Wasserschutzpolizist auf einem kleinen Polizeiboot. Witz der Karte: „Fiete, Wasserschutz“ – seit 20 Jahren nicht nasser als bis zu den Knien.“
Feld 9: Kontaktbereichsbeamter Willi – männlich, Streifenpolizist(in) in blauer deutscher Polizeiuniform mit Schirmmütze. Witz der Karte: „Kennt jeden Hund im Viertel mit Namen. Und die Herrchen auch.“
```

## Auftrag B03

```
Auftrag B03: Raster 3×3, 9 Felder, Reihenfolge Zeile für Zeile von oben links. Kein Text im Bild.

Feld 1: Polizeipräsidentin Dr. Wolf – weiblich, Streifenpolizist(in) in blauer deutscher Polizeiuniform mit Schirmmütze, besonders heldenhaft/legendär inszeniert mit Leuchteffekt. Witz der Karte: „Unterschreibt 300 Dokumente am Tag – mit dem Lieblingskuli, den keiner anfassen darf.“
Feld 2: Wachhabender Peters – männlich, Streifenpolizist(in) in blauer deutscher Polizeiuniform mit Schirmmütze. Witz der Karte: „Bewacht die Wache. Und vor allem die Kaffeemaschine.“
Feld 3: Kriminalkommissarin Mara – weiblich, Kriminalpolizist(in) in Zivil (Trenchcoat, Hemd, Krawatte oder Blazer), Polizeimarke am Gürtel. Witz der Karte: „Ihr Bauchgefühl hat eine Aufklärungsquote von 98 %.“
Feld 4: Kriminaloberkommissar Deniz – männlich, Kriminalpolizist(in) in Zivil (Trenchcoat, Hemd, Krawatte oder Blazer), Polizeimarke am Gürtel. Witz der Karte: „Stellt die Frage, die du am wenigsten hören willst – immer als letzte.“
Feld 5: Kriminalhauptkommissarin Engel – weiblich, Kriminalpolizist(in) in Zivil (Trenchcoat, Hemd, Krawatte oder Blazer), Polizeimarke am Gürtel. Witz der Karte: „Engel im Namen. Im Verhör eher nicht.“
Feld 6: Erster Kriminalhauptkommissar Roth – männlich, Kriminalpolizist(in) in Zivil (Trenchcoat, Hemd, Krawatte oder Blazer), Polizeimarke am Gürtel. Witz der Karte: „So erfahren, dass er Lügen schon am Hustenreiz erkennt.“
Feld 7: Spurensicherer Lutz – männlich, Kriminalpolizist(in) in Zivil (Trenchcoat, Hemd, Krawatte oder Blazer), Polizeimarke am Gürtel. Witz der Karte: „Findet ein Haar in jeder Suppe. Und analysiert es.“
Feld 8: Fallanalytikerin Dr. Klee – weiblich, Kriminalpolizist(in) in Zivil (Trenchcoat, Hemd, Krawatte oder Blazer), Polizeimarke am Gürtel. Witz der Karte: „Weiß, was du denkst, bevor du es denkst. Ziemlich unheimlich.“
Feld 9: Zielfahnder Kowalski – männlich, Kriminalpolizist(in) in Zivil (Trenchcoat, Hemd, Krawatte oder Blazer), Polizeimarke am Gürtel. Witz der Karte: „Findet jeden. Wirklich jeden. Auch deine Socke aus der Waschmaschine.“
```

## Auftrag B04

```
Auftrag B04: Raster 3×3, 9 Felder, Reihenfolge Zeile für Zeile von oben links. Kein Text im Bild.

Feld 1: Verdeckter Ermittler „Fuchs“ – männlich, Kriminalpolizist(in) in Zivil (Trenchcoat, Hemd, Krawatte oder Blazer), Polizeimarke am Gürtel. Witz der Karte: „Ist so gut getarnt, dass seine Kollegen ihn schon zweimal festgenommen haben.“
Feld 2: IT-Forensikerin Pia – weiblich, Kriminalpolizist(in) in Zivil (Trenchcoat, Hemd, Krawatte oder Blazer), Polizeimarke am Gürtel. Witz der Karte: „Hat dein Passwort schon erraten. Es war „Passwort123“.“
Feld 3: Brandermittler Gerd – männlich, Kriminalpolizist(in) in Zivil (Trenchcoat, Hemd, Krawatte oder Blazer), Polizeimarke am Gürtel. Witz der Karte: „Riecht Benzin auf drei Kilometer. Grillabende sind schwierig.“
Feld 4: Phantombildzeichnerin Ilka – weiblich, Kriminalpolizist(in) in Zivil (Trenchcoat, Hemd, Krawatte oder Blazer), Polizeimarke am Gürtel. Witz der Karte: „Zeichnet nach Beschreibung. Sieht trotzdem immer aus wie ihr Onkel.“
Feld 5: Rauschgiftfahnder Can – männlich, Kriminalpolizist(in) in Zivil (Trenchcoat, Hemd, Krawatte oder Blazer), Polizeimarke am Gürtel. Witz der Karte: „Erkennt Backpulver von Weitem. Seine Kuchen sind trotzdem trocken.“
Feld 6: Wirtschaftskriminalist Dr. Faber – männlich, Kriminalpolizist(in) in Zivil (Trenchcoat, Hemd, Krawatte oder Blazer), Polizeimarke am Gürtel. Witz der Karte: „Liest Bilanzen wie andere Krimis – mit Popcorn.“
Feld 7: Leiter der Mordkommission Stein – Gruppe aus 3–4 Figuren: Kriminalpolizist(in) in Zivil (Trenchcoat, Hemd, Krawatte oder Blazer), Polizeimarke am Gürtel. Witz der Karte: „Hat mehr Akten auf dem Schreibtisch als Haare auf dem Kopf.“
Feld 8: Kriminaldirektorin Neumann – weiblich, Kriminalpolizist(in) in Zivil (Trenchcoat, Hemd, Krawatte oder Blazer), Polizeimarke am Gürtel, besonders heldenhaft/legendär inszeniert mit Leuchteffekt. Witz der Karte: „Ihr Büro hat einen Ausblick. Und einen Panzerschrank für die Kekse.“
Feld 9: SEK-Scharfschütze – männlich, SEK-Spezialeinsatzkraft in schwarzer taktischer Ausrüstung mit Helm und Visier (keine Waffe im Vordergrund). Witz der Karte: „Trifft aus 800 Metern eine Fliege. Die Fliege ist nicht begeistert.“
```

## Auftrag B05

```
Auftrag B05: Raster 3×3, 9 Felder, Reihenfolge Zeile für Zeile von oben links. Kein Text im Bild.

Feld 1: SEK-Teamführer Brenner – Gruppe aus 3–4 Figuren: SEK-Spezialeinsatzkraft in schwarzer taktischer Ausrüstung mit Helm und Visier (keine Waffe im Vordergrund). Witz der Karte: „Sagt nur „Zugriff!“ – und alle wissen, was zu tun ist.“
Feld 2: MEK-Observant – männlich, SEK-Spezialeinsatzkraft in schwarzer taktischer Ausrüstung mit Helm und Visier (keine Waffe im Vordergrund). Witz der Karte: „Sitzt seit drei Tagen im selben Auto. Riecht man auch.“
Feld 3: GSG-Spezialkraft – männlich, SEK-Spezialeinsatzkraft in schwarzer taktischer Ausrüstung mit Helm und Visier (keine Waffe im Vordergrund). Witz der Karte: „Springt aus dem Hubschrauber, als wäre es die Haustür.“
Feld 4: Verhandlungsgruppe Becker – Gruppe aus 3–4 Figuren: SEK-Spezialeinsatzkraft in schwarzer taktischer Ausrüstung mit Helm und Visier (keine Waffe im Vordergrund). Witz der Karte: „Hat schon einen Bankräuber zum Aufgeben überredet – mit Pizza.“
Feld 5: SEK-Rammbock-Trupp – Gruppe aus 3–4 Figuren: SEK-Spezialeinsatzkraft in schwarzer taktischer Ausrüstung mit Helm und Visier (keine Waffe im Vordergrund). Witz der Karte: „Ihre Lieblingstür ist die, die gleich nicht mehr da ist.“
Feld 6: Sprengstoffentschärfer Jansen – männlich, SEK-Spezialeinsatzkraft in schwarzer taktischer Ausrüstung mit Helm und Visier (keine Waffe im Vordergrund). Witz der Karte: „Rot oder blau? Er weiß es. Immer.“
Feld 7: Verkehrspolizistin Steffi – weiblich, Verkehrspolizist(in) mit neongelber Warnweste und weißer Polizeimütze. Witz der Karte: „Ihre Kelle hat schon mehr Autos gestoppt als jede Ampel.“
Feld 8: Autobahnpolizei Lars – männlich, Verkehrspolizist(in) mit neongelber Warnweste und weißer Polizeimütze. Witz der Karte: „Kennt jede Ausfahrt zwischen Flensburg und Garmisch auswendig.“
Feld 9: Motorradstreife Tom – Polizist auf einem weiß-blauen Polizeimotorrad. Witz der Karte: „Kommt aus dem Nichts. Mit Blaulicht.“
```

## Auftrag B06

```
Auftrag B06: Raster 3×3, 9 Felder, Reihenfolge Zeile für Zeile von oben links. Kein Text im Bild.

Feld 1: Laserkontrolle Gabi – weiblich, Verkehrspolizist(in) mit neongelber Warnweste und weißer Polizeimütze. Witz der Karte: „Bitte lächeln! Kostet 35 Euro.“
Feld 2: Unfallaufnahme-Team – Gruppe aus 3–4 Figuren: Verkehrspolizist(in) mit neongelber Warnweste und weißer Polizeimütze. Witz der Karte: „Vermessen alles. Sogar ihre Frühstückspause – genau 14,3 Minuten.“
Feld 3: Video-Messfahrzeug – unauffälliges Zivilauto mit Blitzerkamera hinter der Windschutzscheibe. Witz der Karte: „Filmt dich in 4K. Leider auch deine Frisur.“
Feld 4: Leiterin Verkehrsdienst Arndt – weiblich, Verkehrspolizist(in) mit neongelber Warnweste und weißer Polizeimütze. Witz der Karte: „Hat so viele Blitzer aufgestellt, dass Autofahrer ihren Namen flüstern.“
Feld 5: Schutzhund Bella – Polizei-Diensthund (Deutscher Schäferhund o. ä.) mit rotem Halsband und Polizeimarke. Witz der Karte: „Lieb, flauschig und mit dem Griff eines Schraubstocks.“
Feld 6: Rauschgiftspürhund Pepper – Polizei-Diensthund (Deutscher Schäferhund o. ä.) mit rotem Halsband und Polizeimarke. Witz der Karte: „Schnüffelt an deiner Tasche. Bleibt stehen. Ups.“
Feld 7: Sprengstoffspürhund Ajax – Polizei-Diensthund (Deutscher Schäferhund o. ä.) mit rotem Halsband und Polizeimarke. Witz der Karte: „Hat eine bessere Nase als jedes Labor – und sabbert dabei.“
Feld 8: Leichenspürhund Nero – Polizei-Diensthund (Deutscher Schäferhund o. ä.) mit rotem Halsband und Polizeimarke. Witz der Karte: „Findet, was andere lieber nicht finden wollen.“
Feld 9: Diensthundeführer Krause – männlich, Polizeihundeführer in Uniform mit seinem Schäferhund. Witz der Karte: „Wird überall erkannt – aber nur, weil alle seinen Hund kennen.“
```

## Auftrag B07

```
Auftrag B07: Raster 3×3, 9 Felder, Reihenfolge Zeile für Zeile von oben links. Kein Text im Bild.

Feld 1: Personenspürhund Luna – Polizei-Diensthund (Deutscher Schäferhund o. ä.) mit rotem Halsband und Polizeimarke. Witz der Karte: „Eine Socke von dir reicht. Lauf ruhig.“
Feld 2: Polizeihund-Staffelleiter – männlich, Polizeihundeführer in Uniform mit seinem Schäferhund. Witz der Karte: „Hat 12 Hunde, 12 Leckerli-Taschen und null saubere Hosen.“
Feld 3: Bereitschaftspolizist Malte – männlich, Bereitschaftspolizist(in) in dunkelblauer Schutzausrüstung mit Helm. Witz der Karte: „Steht seit sechs Stunden in der Reihe. Und lächelt immer noch.“
Feld 4: Beweis- und Festnahmeeinheit – Gruppe aus 3–4 Figuren: Bereitschaftspolizist(in) in dunkelblauer Schutzausrüstung mit Helm. Witz der Karte: „Schnell rein, schnell raus, schnell den Richtigen.“
Feld 5: Wasserwerfer WaWe 10 – Wasserwerfer-Fahrzeug der Polizei, das eine große Wasserfontäne spritzt. Witz der Karte: „Kühlt hitzige Gemüter. Wörtlich.“
Feld 6: Technische Einheit – Gruppe aus 3–4 Figuren: Bereitschaftspolizist(in) in dunkelblauer Schutzausrüstung mit Helm. Witz der Karte: „Repariert alles mit Kabelbinder und Panzertape.“
Feld 7: Lautsprecherwagen – Polizeiwagen mit großem Lautsprecher auf dem Dach. Witz der Karte: „ACHTUNG, ACHTUNG!“ – auch beim Grillfest.“
Feld 8: Reiterstaffel-Zug – berittene Polizei auf braunem Polizeipferd. Witz der Karte: „Zehn Pferde, ein Ziel: Ordnung. Und Möhren.“
Feld 9: Polizeihubschrauberstaffel – Polizeihubschrauber in Blau-Silber im Flug, Pilot(in) winkt aus dem Cockpit. Witz der Karte: „Die ganze Stadt hört sie kommen. Die Ganoven zuerst.“
```

## Auftrag B08

```
Auftrag B08: Raster 3×3, 9 Felder, Reihenfolge Zeile für Zeile von oben links. Kein Text im Bild.

Feld 1: Einsatzleiter Polizeidirektor Kühn – männlich, Bereitschaftspolizist(in) in dunkelblauer Schutzausrüstung mit Helm. Witz der Karte: „Hat für jeden Einsatz einen Plan B. Und einen Plan C mit Kuchen.“
Feld 2: Vorläufige Festnahme – Maßnahme/Aktion, Strafverfolgung (Polizeimaßnahme): zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Sie sind vorläufig festgenommen.“ – Die Lieblingsworte jeder Streife.“
Feld 3: Durchsuchung beim Verdächtigen – Maßnahme/Aktion, Strafverfolgung (Polizeimaßnahme): zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Unter dem Bett, im Schrank, in der Keksdose. Überall.“
Feld 4: Beschlagnahme – Maßnahme/Aktion, Strafverfolgung (Polizeimaßnahme): zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Das nehmen wir mal mit. Und das. Und das auch.“
Feld 5: Identitätsfeststellung – Maßnahme/Aktion, Strafverfolgung (Polizeimaßnahme): zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Ausweis bitte! Nein, die Bibliothekskarte zählt nicht.“
Feld 6: Erkennungsdienstliche Behandlung – Reaktion/Falle, Strafverfolgung (Polizeimaßnahme): zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Bitte einmal lächeln. Und jetzt von der Seite.“
Feld 7: Platzverweis – Maßnahme/Aktion, Gefahrenabwehr (Polizeimaßnahme): zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Hier ist jetzt mal Schluss. Und zwar sofort.“
Feld 8: Gewahrsam – Reaktion/Falle, Gefahrenabwehr (Polizeimaßnahme): zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Die Nacht wird kurz, das Bett ist hart, das Frühstück gibt's um sechs.“
Feld 9: Eigensicherung – Reaktion/Falle, Gefahrenabwehr (Polizeimaßnahme): zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Erst die eigene Sicherheit, dann die Heldentat.“
```

## Auftrag B09

```
Auftrag B09: Raster 3×3, 9 Felder, Reihenfolge Zeile für Zeile von oben links. Kein Text im Bild.

Feld 1: Verstärkung angefordert – Maßnahme/Aktion, Gefahrenabwehr (Polizeimaßnahme): zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Funkspruch raus – und plötzlich ist die ganze Wache da.“
Feld 2: Haftbefehl – Maßnahme/Aktion, Strafverfolgung (Polizeimaßnahme): zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Ein Blatt Papier, das sehr, sehr schlechte Laune macht.“
Feld 3: Untersuchungshaft – Reaktion/Falle, Strafverfolgung (Polizeimaßnahme): zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Vollpension mit Gittern vor dem Fenster.“
Feld 4: Durchsuchung bei Dritten – Maßnahme/Aktion, Strafverfolgung (Polizeimaßnahme): zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Auch Oma Hildes Keller ist nicht sicher.“
Feld 5: Telekommunikationsüberwachung – Maßnahme/Aktion, Strafverfolgung (Polizeimaßnahme): zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Wir hören mit. Ja, auch das Gespräch mit deiner Mutter.“
Feld 6: Observation – Maßnahme/Aktion, Strafverfolgung (Polizeimaßnahme): zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Der Mann im grauen Auto liest seit vier Stunden dieselbe Zeitung.“
Feld 7: Öffentlichkeitsfahndung – Maßnahme/Aktion, Strafverfolgung (Polizeimaßnahme): zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Plötzlich kennt dich die ganze Stadt. Von der Litfaßsäule.“
Feld 8: Ausschreibung zur Festnahme – Maßnahme/Aktion, Strafverfolgung (Polizeimaßnahme): zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Dein Gesicht – jetzt auch im Polizeicomputer jeder Stadt.“
Feld 9: Beschuldigtenvernehmung – Maßnahme/Aktion, Strafverfolgung (Polizeimaßnahme): zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Sie haben das Recht zu schweigen. Er hat leider kein Talent dafür.“
```

## Auftrag B10

```
Auftrag B10: Raster 3×3, 9 Felder, Reihenfolge Zeile für Zeile von oben links. Kein Text im Bild.

Feld 1: Blutprobe – Maßnahme/Aktion, Strafverfolgung (Polizeimaßnahme): zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Nur ein kleiner Piks. Das Ergebnis piekst mehr.“
Feld 2: DNA-Identitätsfeststellung – Maßnahme/Aktion, Strafverfolgung (Polizeimaßnahme): zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Ein Haar, eine Spucke, ein Treffer.“
Feld 3: Kontrollstelle – Reaktion/Falle, Strafverfolgung (Polizeimaßnahme): zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Bitte rechts ranfahren. Ja, Sie mit dem Wackeldackel.“
Feld 4: Festhalten zur Identitätsfeststellung – Reaktion/Falle, Strafverfolgung (Polizeimaßnahme): zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Einen Moment noch! Wer sind Sie eigentlich?“
Feld 5: Recht des ersten Zugriffs – Maßnahme/Aktion, Strafverfolgung (Polizeimaßnahme): zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Wer zuerst kommt, ermittelt zuerst.“
Feld 6: Verdeckter Ermittler – Maßnahme/Aktion, Strafverfolgung (Polizeimaßnahme): zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Sitzt seit Monaten am Stammtisch der Bande. Spielt mittlerweile am besten Skat.“
Feld 7: Rasterfahndung – Maßnahme/Aktion, Strafverfolgung (Polizeimaßnahme): zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Der Computer sucht. Und findet. Und druckt.“
Feld 8: Vermögensarrest – Maßnahme/Aktion, Strafverfolgung (Polizeimaßnahme): zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Dein Lamborghini? Gehört jetzt dem Staat.“
Feld 9: Gegenüberstellung – Maßnahme/Aktion, Strafverfolgung (Polizeimaßnahme): zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Nummer drei, treten Sie bitte vor. Nein, die andere Nummer drei.“
```

## Auftrag B11

```
Auftrag B11: Raster 3×3, 9 Felder, Reihenfolge Zeile für Zeile von oben links. Kein Text im Bild.

Feld 1: Sonderkommission bilden – Maßnahme/Aktion, Strafverfolgung (Polizeimaßnahme): zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Die besten Köpfe, ein Raum, sehr viel Kaffee.“
Feld 2: Aufenthaltsverbot – Maßnahme/Aktion, Gefahrenabwehr (Polizeimaßnahme): zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Für dich ist hier Sperrgebiet. Für immer. Oder zumindest ein paar Wochen.“
Feld 3: Wohnungsverweisung – Maßnahme/Aktion, Gefahrenabwehr (Polizeimaßnahme): zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Koffer packen, Schlüssel abgeben, Tür zu.“
Feld 4: Sicherstellung – Maßnahme/Aktion, Gefahrenabwehr (Polizeimaßnahme): zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Das gefährliche Ding? Ist jetzt in unserer Asservatenkammer.“
Feld 5: Gefährderansprache – Maßnahme/Aktion, Gefahrenabwehr (Polizeimaßnahme): zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Ein freundlich erhobener Zeigefinger kann Wunder wirken.“
Feld 6: Meldeauflage – Reaktion/Falle, Gefahrenabwehr (Polizeimaßnahme): zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Jeden Montag um zehn auf der Wache. Pünktlich!“
Feld 7: Unmittelbarer Zwang – Maßnahme/Aktion, Gefahrenabwehr (Polizeimaßnahme): zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Wenn Worte nicht mehr helfen …“
Feld 8: Fesselung – Reaktion/Falle, Gefahrenabwehr (Polizeimaßnahme): zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Klick. Passt wie angegossen.“
Feld 9: Durchsuchung von Sachen – Maßnahme/Aktion, Gefahrenabwehr (Polizeimaßnahme): zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Was ist in dem Rucksack? Zeig doch mal.“
```

## Auftrag B12

```
Auftrag B12: Raster 3×3, 9 Felder, Reihenfolge Zeile für Zeile von oben links. Kein Text im Bild.

Feld 1: Absperrung – Reaktion/Falle, Gefahrenabwehr (Polizeimaßnahme): zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Flatterband: der stärkste Gegner aller Schaulustigen.“
Feld 2: Vorladung – Maßnahme/Aktion, Gefahrenabwehr (Polizeimaßnahme): zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Post von der Polizei. Selten eine Einladung zum Kaffee.“
Feld 3: Videoüberwachung – Maßnahme/Aktion, Gefahrenabwehr (Polizeimaßnahme): zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Kamera 7 hat dich gesehen. Kamera 8 auch.“
Feld 4: Einsatzbesprechung – Maßnahme/Aktion, Gefahrenabwehr (Polizeimaßnahme): zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Ein Flipchart, drei Filzstifte und ein genialer Plan.“
Feld 5: Gemeinsamer Einsatz – Maßnahme/Aktion, Gefahrenabwehr (Polizeimaßnahme): zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Alle zusammen ist besser als alle durcheinander.“
Feld 6: Lagebild – Maßnahme/Aktion, Gefahrenabwehr (Polizeimaßnahme): zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Wer, wo, was, wann – alles auf einer Karte.“
Feld 7: Ingewahrsamnahme zum Schutz – Reaktion/Falle, Gefahrenabwehr (Polizeimaßnahme): zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Manchmal muss man jemanden vor sich selbst schützen.“
Feld 8: Wiederaufnahme der Ermittlungen – Maßnahme/Aktion, Strafverfolgung (Polizeimaßnahme): zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Der Fall ist zurück. Wie ein schlechter Ohrwurm.“
Feld 9: Beschuldigtenbelehrung – Reaktion/Falle, Strafverfolgung (Polizeimaßnahme): zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Sie haben das Recht, die Klappe zu halten. Bitte nutzen Sie es.“
```

## Auftrag B13

```
Auftrag B13: Raster 3×3, 9 Felder, Reihenfolge Zeile für Zeile von oben links. Kein Text im Bild.

Feld 1: Ingewahrsamnahme – Maßnahme/Aktion, Gefahrenabwehr (Polizeimaßnahme): zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Ab in den Wagen – wir fahren eine Runde.“
Feld 2: Taschendieb Toni – männlich, Dieb in dunkler Kleidung (Hoodie oder Rollkragen), Mütze, Augenmaske. Witz der Karte: „Hat deine Uhr. Und weiß, wie spät es ist.“
Feld 3: Heiratsschwindler Max – männlich, Betrüger/Hochstapler im schicken, leicht übertriebenen Anzug mit verschlagenem Grinsen. Witz der Karte: „Verlobt mit drei Frauen. Gleichzeitig. Die Hochzeitstermine sind sein Problem.“
Feld 4: Hehlerin Rosi – weiblich, Hehler in Weste und Schiebermütze zwischen Kisten mit Diebesgut. Witz der Karte: „Woher das ist? Vom Laster gefallen, Schätzchen.“
Feld 5: Einbrecher Kralle – männlich, Dieb in dunkler Kleidung (Hoodie oder Rollkragen), Mütze, Augenmaske. Witz der Karte: „Kommt durchs Fenster, geht durch die Tür – mit deinem Fernseher.“
Feld 6: Straßendealer Ede – männlich, Dealer mit Basecap und Kapuzenpulli (Drogen nur als neutrale bunte Pillen/Päckchen angedeutet). Witz der Karte: „Verkauft alles an der Ecke. Nur keine Ausreden.“
Feld 7: Bandenchef Vito – männlich, Gangmitglied in Lederjacke mit Goldkette und Sonnenbrille. Witz der Karte: „Trägt Anzug, Sonnenbrille und schlechte Laune.“
Feld 8: Bankräuber-Duo – Gruppe aus 3–4 Figuren: Räuber im gestreiften Pulli mit Augenmaske und Beutesack mit Dollarzeichen. Witz der Karte: „Einer schreit „Überfall!“, der andere vergisst immer den Sack.“
Feld 9: Das Phantom – männlich, Betrüger/Hochstapler im schicken, leicht übertriebenen Anzug mit verschlagenem Grinsen, besonders heldenhaft/legendär inszeniert mit Leuchteffekt. Witz der Karte: „Niemand hat sie je gesehen. Außer im Spiegel.“
```

## Auftrag B14

```
Auftrag B14: Raster 3×3, 9 Felder, Reihenfolge Zeile für Zeile von oben links. Kein Text im Bild.

Feld 1: Ladendieb Lukas – männlich, Dieb in dunkler Kleidung (Hoodie oder Rollkragen), Mütze, Augenmaske. Witz der Karte: „Hat schon wieder „vergessen“, an der Kasse zu bezahlen.“
Feld 2: Fahrraddieb Flitzer – männlich, Dieb in dunkler Kleidung (Hoodie oder Rollkragen), Mütze, Augenmaske. Witz der Karte: „Sein Fahrrad ist geklaut. Und das davor auch.“
Feld 3: Autoknacker Jojo – männlich, Dieb in dunkler Kleidung (Hoodie oder Rollkragen), Mütze, Augenmaske. Witz der Karte: „Öffnet jedes Auto in 9 Sekunden. Seinen eigenen Briefkasten nie.“
Feld 4: Fassadenkletterin Katze – weiblich, Dieb in dunkler Kleidung (Hoodie oder Rollkragen), Mütze, Augenmaske. Witz der Karte: „Klettert jede Fassade hoch. Hat Angst vor Leitern.“
Feld 5: Juwelendieb Monsieur Blanc – männlich, Dieb in dunkler Kleidung (Hoodie oder Rollkragen), Mütze, Augenmaske. Witz der Karte: „Stiehlt nur Diamanten. Alles andere ist unter seinem Niveau.“
Feld 6: Kunstdieb Rembrandt-Rudi – männlich, Dieb in dunkler Kleidung (Hoodie oder Rollkragen), Mütze, Augenmaske. Witz der Karte: „Malt die Kopien selbst. Die Originale hängen in seinem Bad.“
Feld 7: Meisterdieb Schatten – männlich, Dieb in dunkler Kleidung (Hoodie oder Rollkragen), Mütze, Augenmaske, besonders heldenhaft/legendär inszeniert mit Leuchteffekt. Witz der Karte: „Ist weg, bevor du „Haltet den Dieb!“ rufen kannst.“
Feld 8: Taschendiebin Fingerling – weiblich, Dieb in dunkler Kleidung (Hoodie oder Rollkragen), Mütze, Augenmaske. Witz der Karte: „Ihre Finger sind schneller als dein Gedanke „Wo ist mein Handy?“.“
Feld 9: Tresorknacker Ohr – männlich, Dieb in dunkler Kleidung (Hoodie oder Rollkragen), Mütze, Augenmaske. Witz der Karte: „Hört das Klicken. Den Wachmann leider nicht.“
```

## Auftrag B15

```
Auftrag B15: Raster 3×3, 9 Felder, Reihenfolge Zeile für Zeile von oben links. Kein Text im Bild.

Feld 1: Einbrecherbande Nachtfalter – Gruppe aus 3–4 Figuren: Dieb in dunkler Kleidung (Hoodie oder Rollkragen), Mütze, Augenmaske. Witz der Karte: „Arbeiten nur nachts. Tagsüber schlafen sie im Hängekörbchen.“
Feld 2: Enkeltrick-Erna – weiblich, Betrüger/Hochstapler im schicken, leicht übertriebenen Anzug mit verschlagenem Grinsen. Witz der Karte: „Hallo, ich bin's! Rate mal, wer!“ – Bitte nicht raten. Auflegen!“
Feld 3: Hütchenspieler Kalle – männlich, Betrüger/Hochstapler im schicken, leicht übertriebenen Anzug mit verschlagenem Grinsen. Witz der Karte: „Unter welchem Becher? Unter keinem. Haha.“
Feld 4: Falscher Polizeibeamter – männlich, Betrüger/Hochstapler im schicken, leicht übertriebenen Anzug mit verschlagenem Grinsen. Witz der Karte: „Die Uniform ist vom Kostümverleih. Der Ausweis aus dem Drucker.“
Feld 5: Phishing-Pirat – männlich, Betrüger/Hochstapler im schicken, leicht übertriebenen Anzug mit verschlagenem Grinsen. Witz der Karte: „Ihr Konto wurde gesperrt! Klicken Sie hier!“ – Bitte nicht.“
Feld 6: Schneeballkönig Dr. Gier – männlich, Betrüger/Hochstapler im schicken, leicht übertriebenen Anzug mit verschlagenem Grinsen. Witz der Karte: „Verspricht 300 % Zinsen. Liefert 0 %.“
Feld 7: Urkundenfälscher Feder – männlich, Betrüger/Hochstapler im schicken, leicht übertriebenen Anzug mit verschlagenem Grinsen. Witz der Karte: „Fälscht jede Unterschrift. Außer seiner eigenen – die kann er nicht.“
Feld 8: Scheckbetrüger Charmeur – männlich, Betrüger/Hochstapler im schicken, leicht übertriebenen Anzug mit verschlagenem Grinsen. Witz der Karte: „Zahlt immer mit Scheck. Der Scheck zahlt nie.“
Feld 9: Anlagebetrügerin Golden – weiblich, Betrüger/Hochstapler im schicken, leicht übertriebenen Anzug mit verschlagenem Grinsen. Witz der Karte: „Garantiert reich in drei Wochen. Sie selbst. Nicht du.“
```

## Auftrag B16

```
Auftrag B16: Raster 3×3, 9 Felder, Reihenfolge Zeile für Zeile von oben links. Kein Text im Bild.

Feld 1: Hochstapler Graf Zocker – männlich, Betrüger/Hochstapler im schicken, leicht übertriebenen Anzug mit verschlagenem Grinsen. Witz der Karte: „Echter Graf? Nein. Echter Zocker? Absolut.“
Feld 2: Love-Scammerin Rose – weiblich, Betrüger/Hochstapler im schicken, leicht übertriebenen Anzug mit verschlagenem Grinsen. Witz der Karte: „Schreibt dir Liebesbriefe. Und am Ende eine Rechnung.“
Feld 3: Bandenmitglied Ratte – männlich, Gangmitglied in Lederjacke mit Goldkette und Sonnenbrille. Witz der Karte: „Verrät jeden. Auch sich selbst, wenn's sich lohnt.“
Feld 4: Schläger Bulle – männlich, Gangmitglied in Lederjacke mit Goldkette und Sonnenbrille. Witz der Karte: „Löst Probleme mit den Fäusten. Hat sehr viele Probleme.“
Feld 5: Türsteher Klotz – männlich, Gangmitglied in Lederjacke mit Goldkette und Sonnenbrille. Witz der Karte: „Du kommst hier nicht rein.“ – Seine einzigen Worte seit 2009.“
Feld 6: Rockerboss Eisenfaust – männlich, Gangmitglied in Lederjacke mit Goldkette und Sonnenbrille. Witz der Karte: „Seine Maschine ist lauter als ein Gewitter.“
Feld 7: Clan-Vollstrecker – männlich, Gangmitglied in Lederjacke mit Goldkette und Sonnenbrille. Witz der Karte: „Erledigt die Drecksarbeit. Wäscht sich danach nicht die Hände.“
Feld 8: Schutzgelderpresser Zahltag – männlich, Gangmitglied in Lederjacke mit Goldkette und Sonnenbrille. Witz der Karte: „Kommt jeden Monat pünktlicher als der Postbote.“
Feld 9: Fluchtfahrer Turbo – männlich, Gangmitglied in Lederjacke mit Goldkette und Sonnenbrille. Witz der Karte: „Null auf Hundert in 3 Sekunden. Rückwärts.“
```

## Auftrag B17

```
Auftrag B17: Raster 3×3, 9 Felder, Reihenfolge Zeile für Zeile von oben links. Kein Text im Bild.

Feld 1: Spitzel Flüster – männlich, Gangmitglied in Lederjacke mit Goldkette und Sonnenbrille. Witz der Karte: „Hört alles, verkauft alles, an jeden.“
Feld 2: Unterboss Narbe – männlich, Gangmitglied in Lederjacke mit Goldkette und Sonnenbrille. Witz der Karte: „Die Narbe hat er vom Rasierer. Erzählt aber was anderes.“
Feld 3: Pate Don Corvo – männlich, Gangmitglied in Lederjacke mit Goldkette und Sonnenbrille, besonders heldenhaft/legendär inszeniert mit Leuchteffekt. Witz der Karte: „Macht dir ein Angebot, das du nicht ablehnen kannst. Oder solltest.“
Feld 4: Hehler Krempel – männlich, Hehler in Weste und Schiebermütze zwischen Kisten mit Diebesgut. Witz der Karte: „Hat alles. Woher? Frag lieber nicht.“
Feld 5: Pfandleiher Zwielicht – männlich, Hehler in Weste und Schiebermütze zwischen Kisten mit Diebesgut. Witz der Karte: „Dein Erbstück? Für 20 Euro. Oder 15. Letztes Angebot.“
Feld 6: Lagerhaus-Boss Kiste – männlich, Hehler in Weste und Schiebermütze zwischen Kisten mit Diebesgut. Witz der Karte: „Im Lager stehen 1000 Kisten. In jeder ist etwas, das es nicht geben dürfte.“
Feld 7: Geldwäscherin Saubermann – weiblich, Hehler in Weste und Schiebermütze zwischen Kisten mit Diebesgut. Witz der Karte: „Wäscht Geld so sauber, dass es nach Lavendel duftet.“
Feld 8: Schmuggler Kapitän Nebel – männlich, Hehler in Weste und Schiebermütze zwischen Kisten mit Diebesgut. Witz der Karte: „Hat nie ein Hafenamt von innen gesehen. Und will das so lassen.“
Feld 9: Darknet-Händler Null – männlich, Hehler in Weste und Schiebermütze zwischen Kisten mit Diebesgut. Witz der Karte: „Verkauft alles mit Bewertung 5 Sterne. Von sich selbst.“
```

## Auftrag B18

```
Auftrag B18: Raster 3×3, 9 Felder, Reihenfolge Zeile für Zeile von oben links. Kein Text im Bild.

Feld 1: Antikschieber Patina – männlich, Hehler in Weste und Schiebermütze zwischen Kisten mit Diebesgut. Witz der Karte: „Das ist aus dem alten Rom. Oder aus dem Baumarkt.“
Feld 2: Hehlerkönigin Baronin – weiblich, Hehler in Weste und Schiebermütze zwischen Kisten mit Diebesgut. Witz der Karte: „Ihr Schmuck ist echt. Er gehörte nur vorher jemand anderem.“
Feld 3: Straßenräuber Messer-Mike – männlich, Räuber im gestreiften Pulli mit Augenmaske und Beutesack mit Dollarzeichen. Witz der Karte: „Fragt nach der Uhrzeit. Nimmt dann die Uhr.“
Feld 4: Tankstellenräuber Zappel – männlich, Räuber im gestreiften Pulli mit Augenmaske und Beutesack mit Dollarzeichen. Witz der Karte: „Einmal Volltanken und die Kasse, bitte.“
Feld 5: Geldtransporträuber Panzer – männlich, Räuber im gestreiften Pulli mit Augenmaske und Beutesack mit Dollarzeichen. Witz der Karte: „Schwer gepanzert, schwer bewaffnet, schwer von Begriff.“
Feld 6: Maskierter Räuber – männlich, Räuber im gestreiften Pulli mit Augenmaske und Beutesack mit Dollarzeichen. Witz der Karte: „Trägt eine Kürbismaske. Auch außerhalb von Halloween.“
Feld 7: Postkutschen-Paule – männlich, Räuber im gestreiften Pulli mit Augenmaske und Beutesack mit Dollarzeichen. Witz der Karte: „Lebt noch im 19. Jahrhundert. Die Polizei hat Autos, er ein Pferd.“
Feld 8: Juwelierräuberin Blitz – weiblich, Räuber im gestreiften Pulli mit Augenmaske und Beutesack mit Dollarzeichen. Witz der Karte: „Schneller rein als raus. Leider auch schneller geschnappt.“
Feld 9: Räuberhauptmann Pfefferbart – männlich, Räuber im gestreiften Pulli mit Augenmaske und Beutesack mit Dollarzeichen. Witz der Karte: „Sein Bart ist so wild wie seine Pläne.“
```

## Auftrag B19

```
Auftrag B19: Raster 3×3, 9 Felder, Reihenfolge Zeile für Zeile von oben links. Kein Text im Bild.

Feld 1: Gangsterbraut Lola – weiblich, Räuber im gestreiften Pulli mit Augenmaske und Beutesack mit Dollarzeichen. Witz der Karte: „Spielt das Unschuldslamm. Lammt aber gar nicht.“
Feld 2: Ausbrecherkönig Houdini-Harry – männlich, Räuber im gestreiften Pulli mit Augenmaske und Beutesack mit Dollarzeichen. Witz der Karte: „Ist 14-mal ausgebrochen. Und 14-mal zurück, wegen des Essens.“
Feld 3: Kurier Schnell – männlich, Dealer mit Basecap und Kapuzenpulli (Drogen nur als neutrale bunte Pillen/Päckchen angedeutet). Witz der Karte: „Liefert schneller als jeder Pizzadienst. Nur nicht legal.“
Feld 4: Dealerin Zucker – weiblich, Dealer mit Basecap und Kapuzenpulli (Drogen nur als neutrale bunte Pillen/Päckchen angedeutet). Witz der Karte: „Süß wie Zucker, gefährlich wie Karies.“
Feld 5: Laborkoch Professor – männlich, Dealer mit Basecap und Kapuzenpulli (Drogen nur als neutrale bunte Pillen/Päckchen angedeutet). Witz der Karte: „Kocht nur in einem Labor. Und ganz sicher keine Nudeln.“
Feld 6: Plantagenbetreiber Grünling – männlich, Dealer mit Basecap und Kapuzenpulli (Drogen nur als neutrale bunte Pillen/Päckchen angedeutet). Witz der Karte: „Hat den grünsten Daumen der Stadt. Und das falsche Gewächs.“
Feld 7: Kartellbote Schatten-Juan – Gruppe aus 3–4 Figuren: Dealer mit Basecap und Kapuzenpulli (Drogen nur als neutrale bunte Pillen/Päckchen angedeutet). Witz der Karte: „Sein Rucksack ist schwerer als er.“
Feld 8: Drogenbaron El Jefe – männlich, Dealer mit Basecap und Kapuzenpulli (Drogen nur als neutrale bunte Pillen/Päckchen angedeutet), besonders heldenhaft/legendär inszeniert mit Leuchteffekt. Witz der Karte: „Kommt nie selbst. Hat Leute dafür. Und Leute für die Leute.“
Feld 9: Großhändler Kilo – männlich, Dealer mit Basecap und Kapuzenpulli (Drogen nur als neutrale bunte Pillen/Päckchen angedeutet). Witz der Karte: „Wiegt alles ab. Auf ein Gramm genau.“
```

## Auftrag B20

```
Auftrag B20: Raster 3×3, 9 Felder, Reihenfolge Zeile für Zeile von oben links. Kein Text im Bild.

Feld 1: Türsteher-Dealer Nachtclub – männlich, Dealer mit Basecap und Kapuzenpulli (Drogen nur als neutrale bunte Pillen/Päckchen angedeutet). Witz der Karte: „Kontrolliert die Tür. Und was hinter ihr verkauft wird.“
Feld 2: Fluchtwagen – Maßnahme/Aktion, Gaunertrick der Verbrecher: zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Motor läuft, Tür ist offen, Fahrer schwitzt.“
Feld 3: Teurer Anwalt – Maßnahme/Aktion, Gaunertrick der Verbrecher: zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Kostet 500 Euro pro Stunde. Findet jedes Schlupfloch.“
Feld 4: Überfall – Maßnahme/Aktion, Gaunertrick der Verbrecher: zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Hände hoch! Und das Geld bitte in den Sack.“
Feld 5: Brechstange – Maßnahme/Aktion, Gaunertrick der Verbrecher: zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Universalschlüssel für alles, was nicht dir gehört.“
Feld 6: Falsches Alibi – Reaktion/Falle, Gaunertrick der Verbrecher: zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Ich war zu Hause. Fragen Sie meine Katze.“
Feld 7: Hinterhalt – Reaktion/Falle, Gaunertrick der Verbrecher: zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Hinter der nächsten Ecke wartet eine Überraschung. Keine schöne.“
Feld 8: Rauchbombe – Reaktion/Falle, Gaunertrick der Verbrecher: zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Puff! Weg ist er. Nur noch Husten im Raum.“
Feld 9: Dietrich – Maßnahme/Aktion, Gaunertrick der Verbrecher: zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Für jedes Schloss den passenden Draht.“
```

## Auftrag B21

```
Auftrag B21: Raster 3×3, 9 Felder, Reihenfolge Zeile für Zeile von oben links. Kein Text im Bild.

Feld 1: Maskierung – Maßnahme/Aktion, Gaunertrick der Verbrecher: zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Mit Sonnenbrille und Schnurrbart erkennt ihn wirklich niemand. Glaubt er.“
Feld 2: Wegwerfhandy – Maßnahme/Aktion, Gaunertrick der Verbrecher: zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Ein Anruf, dann ab in den Fluss.“
Feld 3: Gefälschter Ausweis – Reaktion/Falle, Gaunertrick der Verbrecher: zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Name: Max Mustermann. Glaubwürdig wie immer.“
Feld 4: Ablenkungsmanöver – Maßnahme/Aktion, Gaunertrick der Verbrecher: zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Schau mal da! Ein Eichhörnchen!“
Feld 5: Schmiere stehen – Reaktion/Falle, Gaunertrick der Verbrecher: zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Pfeift, wenn die Polizei kommt. Pfeift auch sonst ständig.“
Feld 6: Spuren verwischen – Maßnahme/Aktion, Gaunertrick der Verbrecher: zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Putzt jeden Tatort. Den eigenen Flur nie.“
Feld 7: Unterschlupf – Maßnahme/Aktion, Gaunertrick der Verbrecher: zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Ein Keller, eine Matratze und Dosensuppe für drei Monate.“
Feld 8: Komplize – Maßnahme/Aktion, Gaunertrick der Verbrecher: zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Jeder Ganove braucht jemanden, der Schmiere steht.“
Feld 9: Hehlerware verticken – Maßnahme/Aktion, Gaunertrick der Verbrecher: zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Billig, schnell, und auf keinen Fall mit Quittung.“
```

## Auftrag B22

```
Auftrag B22: Raster 3×3, 9 Felder, Reihenfolge Zeile für Zeile von oben links. Kein Text im Bild.

Feld 1: Kaution hinterlegt – Maßnahme/Aktion, Gaunertrick der Verbrecher: zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Raus aus der Zelle – das Sparschwein ist dafür drauf gegangen.“
Feld 2: Schweigerecht – Reaktion/Falle, Gaunertrick der Verbrecher: zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Ohne meinen Anwalt sage ich gar nichts. Nicht mal „Hallo“.“
Feld 3: Revision eingelegt – Maßnahme/Aktion, Gaunertrick der Verbrecher: zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Das Urteil? Gefällt uns nicht. Nochmal bitte!“
Feld 4: Bestechungsversuch – Maßnahme/Aktion, Gaunertrick der Verbrecher: zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Ein kleines Geschenk unter Freunden. Ganz ohne Hintergedanken. Ehrlich.“
Feld 5: Störsender – Maßnahme/Aktion, Gaunertrick der Verbrecher: zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Kein Netz, keine Polizei, kein Problem.“
Feld 6: Fluchttunnel – Reaktion/Falle, Gaunertrick der Verbrecher: zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Drei Jahre mit dem Teelöffel gegraben. Endet im Nachbarkeller.“
Feld 7: Krähenfüße – Reaktion/Falle, Gaunertrick der Verbrecher: zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Für alle Reifen, die einem folgen wollen.“
Feld 8: Fake-Notruf – Maßnahme/Aktion, Gaunertrick der Verbrecher: zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Hilfe, ein Notfall am anderen Ende der Stadt!“
Feld 9: Bandenkrieg – Maßnahme/Aktion, Gaunertrick der Verbrecher: zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Wenn Banden sich streiten, freut sich am Ende die Polizei.“
```

## Auftrag B23

```
Auftrag B23: Raster 3×3, 9 Felder, Reihenfolge Zeile für Zeile von oben links. Kein Text im Bild.

Feld 1: Erpressung – Maßnahme/Aktion, Gaunertrick der Verbrecher: zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Ein Brief, ein Foto, eine Forderung.“
Feld 2: Tarnidentität – Reaktion/Falle, Gaunertrick der Verbrecher: zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Heute Manfred, morgen Herbert, übermorgen Lady Gwendolyn.“
Feld 3: Großer Coup – Maßnahme/Aktion, Gaunertrick der Verbrecher: zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Der Plan ist perfekt. Hat nur 47 Schritte.“
Feld 4: Lösegeldforderung – Maßnahme/Aktion, Gaunertrick der Verbrecher: zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Eine Million in kleinen Scheinen. Und ein Pony.“
Feld 5: Zeugen einschüchtern – Maßnahme/Aktion, Gaunertrick der Verbrecher: zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Du hast nichts gesehen, klar?“
Feld 6: Geheimversteck – Reaktion/Falle, Gaunertrick der Verbrecher: zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Hinter dem Bücherregal ist noch ein Bücherregal.“
Feld 7: Fluchtroute – Maßnahme/Aktion, Gaunertrick der Verbrecher: zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Links, rechts, Kanal, Bahngleise, nach Hause.“
Feld 8: Schutzgeld kassieren – Maßnahme/Aktion, Gaunertrick der Verbrecher: zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Hübscher Laden. Wäre schade, wenn ihm was passiert.“
Feld 9: Feuerwerk zur Ablenkung – Maßnahme/Aktion, Gaunertrick der Verbrecher: zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Ooooh, schön bunt! … Moment, wo ist der Tresor?“
```

## Auftrag B24

```
Auftrag B24: Raster 3×3, 9 Felder, Reihenfolge Zeile für Zeile von oben links. Kein Text im Bild.

Feld 1: Bandengründung – Maßnahme/Aktion, Gaunertrick der Verbrecher: zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Gründungsversammlung im Hinterzimmer einer Pommesbude.“
Feld 2: Komplizen-Treffen – Maßnahme/Aktion, Gaunertrick der Verbrecher: zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Treffpunkt: Parkhaus, Ebene 3, Mitternacht. Bitte pünktlich.“
Feld 3: Hinterzimmer-Deal – Maßnahme/Aktion, Gaunertrick der Verbrecher: zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Zigarrenrauch, gedämpftes Licht, sehr wichtige Handschläge.“
Feld 4: Panikmache – Maßnahme/Aktion, Gaunertrick der Verbrecher: zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Alle laufen weg – genau wie geplant.“
Feld 5: Verfolgungsjagd – Maßnahme/Aktion, Gaunertrick der Verbrecher: zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Bei Rot über die Ampel, bei Grün ins Rapsfeld.“
Feld 6: Gefängnisausbruch – Maßnahme/Aktion, Gaunertrick der Verbrecher: zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Die Gitterstäbe waren aus Schokolade. Behauptet er.“
Feld 7: Falsche Fährte – Reaktion/Falle, Gaunertrick der Verbrecher: zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Die Spuren führen ins Nichts. Oder zum Bäcker.“
Feld 8: Sündenbock – Maßnahme/Aktion, Gaunertrick der Verbrecher: zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Der war's!“ – Der Ziegenbock guckt verwirrt.“
Feld 9: Beweise vernichten – Maßnahme/Aktion, Gaunertrick der Verbrecher: zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Der Schredder läuft heiß.“
```

## Auftrag B25

```
Auftrag B25: Raster 3×3, 9 Felder, Reihenfolge Zeile für Zeile von oben links. Kein Text im Bild.

Feld 1: K-9-Einsatzteam – Polizei-Diensthund (Deutscher Schäferhund o. ä.) mit rotem Halsband und Polizeimarke – epische Team-Szene. Witz der Karte: „Herrchen und Hund – ein Team, ein Ziel, ein Leckerli.“
Feld 2: Sonderkommission „Phantom“ – Gruppe aus 3–4 Figuren: Kriminalpolizist(in) in Zivil (Trenchcoat, Hemd, Krawatte oder Blazer), Polizeimarke am Gürtel – epische Team-Szene. Witz der Karte: „Jagen ein Phantom. Haben schon drei Pinnwände voller Fäden.“
Feld 3: SEK-Großlage – Gruppe aus 3–4 Figuren: SEK-Spezialeinsatzkraft in schwarzer taktischer Ausrüstung mit Helm und Visier (keine Waffe im Vordergrund) – epische Team-Szene, besonders heldenhaft/legendär inszeniert mit Leuchteffekt. Witz der Karte: „Wenn das SEK anrückt, rücken alle anderen ab.“
Feld 4: Verkehrsfahndungsgruppe – Gruppe aus 3–4 Figuren: Verkehrspolizist(in) mit neongelber Warnweste und weißer Polizeimütze – epische Team-Szene. Witz der Karte: „Kennzeichen notiert, Auto gefunden, Feierabend.“
Feld 5: Mobiles Einsatzkommando – Gruppe aus 3–4 Figuren: SEK-Spezialeinsatzkraft in schwarzer taktischer Ausrüstung mit Helm und Visier (keine Waffe im Vordergrund) – epische Team-Szene. Witz der Karte: „Sind schon da, bevor du merkst, dass sie kommen.“
Feld 6: Hundertschaft im Großeinsatz – Gruppe aus 3–4 Figuren: Bereitschaftspolizist(in) in dunkelblauer Schutzausrüstung mit Helm – epische Team-Szene. Witz der Karte: „Hundert Leute, hundert Schilde, ein Schritt.“
Feld 7: Gemeinsames Ermittlungsteam – Gruppe aus 3–4 Figuren: Kriminalpolizist(in) in Zivil (Trenchcoat, Hemd, Krawatte oder Blazer), Polizeimarke am Gürtel – epische Team-Szene. Witz der Karte: „Polizeien aus fünf Ländern. Ein gemeinsamer Kaffeeautomat.“
Feld 8: Luft-Boden-Fahndung – Polizeihubschrauber in Blau-Silber im Flug, Pilot(in) winkt aus dem Cockpit. Witz der Karte: „Von oben gucken, unten zugreifen.“
Feld 9: Polizeidirektion Gesamteinsatz – Gruppe aus 3–4 Figuren: Streifenpolizist(in) in blauer deutscher Polizeiuniform mit Schirmmütze – epische Team-Szene, besonders heldenhaft/legendär inszeniert mit Leuchteffekt. Witz der Karte: „Alle Wachen, alle Streifen, alle Mann. Und Frau.“
```

## Auftrag B26

```
Auftrag B26: Raster 3×3, 9 Felder, Reihenfolge Zeile für Zeile von oben links. Kein Text im Bild.

Feld 1: Spürnasen-Duo – Polizei-Diensthund (Deutscher Schäferhund o. ä.) mit rotem Halsband und Polizeimarke – epische Team-Szene. Witz der Karte: „Zwei Nasen riechen mehr als eine.“
Feld 2: Kriminaldauerdienst – Gruppe aus 3–4 Figuren: Kriminalpolizist(in) in Zivil (Trenchcoat, Hemd, Krawatte oder Blazer), Polizeimarke am Gürtel – epische Team-Szene. Witz der Karte: „Arbeitet, wenn alle schlafen. Trinkt Kaffee, wenn alle wach werden.“
Feld 3: Bürgernahe Wache – Gruppe aus 3–4 Figuren: Streifenpolizist(in) in blauer deutscher Polizeiuniform mit Schirmmütze – epische Team-Szene. Witz der Karte: „Die Wache um die Ecke – mit Kaffee für jeden Nachbarn.“
Feld 4: Einbrecherkartell – Gruppe aus 3–4 Figuren: Dieb in dunkler Kleidung (Hoodie oder Rollkragen), Mütze, Augenmaske – epische Team-Szene. Witz der Karte: „Die Waschbären unter den Ganoven: Nachts aktiv, alles klauen.“
Feld 5: Betrugsimperium – Gruppe aus 3–4 Figuren: Betrüger/Hochstapler im schicken, leicht übertriebenen Anzug mit verschlagenem Grinsen – epische Team-Szene. Witz der Karte: „Ein Schloss aus Lügen. Mit Burggraben.“
Feld 6: Rockergang Höllenhunde – Gruppe aus 3–4 Figuren: Gangmitglied in Lederjacke mit Goldkette und Sonnenbrille – epische Team-Szene. Witz der Karte: „Laut, wild und mit sehr vielen Aufnähern.“
Feld 7: Hehlernetzwerk – Gruppe aus 3–4 Figuren: Hehler in Weste und Schiebermütze zwischen Kisten mit Diebesgut – epische Team-Szene. Witz der Karte: „Für alles einen Abnehmer. Für jeden Abnehmer einen Weg.“
Feld 8: Bankraub-Kommando – Gruppe aus 3–4 Figuren: Räuber im gestreiften Pulli mit Augenmaske und Beutesack mit Dollarzeichen – epische Team-Szene. Witz der Karte: „Planen den Coup seit drei Jahren. Mit Lageplan aus Lego.“
Feld 9: Drogenkartell – Gruppe aus 3–4 Figuren: Dealer mit Basecap und Kapuzenpulli (Drogen nur als neutrale bunte Pillen/Päckchen angedeutet) – epische Team-Szene. Witz der Karte: „International, gefährlich und mit eigenem Logistikzentrum.“
```

## Auftrag B27

```
Auftrag B27: Raster 3×3, 9 Felder, Reihenfolge Zeile für Zeile von oben links. Kein Text im Bild.

Feld 1: Organisierte Kriminalität – Gruppe aus 3–4 Figuren: Gangmitglied in Lederjacke mit Goldkette und Sonnenbrille – epische Team-Szene, besonders heldenhaft/legendär inszeniert mit Leuchteffekt. Witz der Karte: „Hat seine Tentakel überall. Wirklich überall.“
Feld 2: Das Phantom-Syndikat – Gruppe aus 3–4 Figuren: Betrüger/Hochstapler im schicken, leicht übertriebenen Anzug mit verschlagenem Grinsen – epische Team-Szene, besonders heldenhaft/legendär inszeniert mit Leuchteffekt. Witz der Karte: „Ein Phantom ist gefährlich. Ein ganzes Syndikat davon …“
Feld 3: Clan der Schatten – Gruppe aus 3–4 Figuren: Gangmitglied in Lederjacke mit Goldkette und Sonnenbrille – epische Team-Szene, besonders heldenhaft/legendär inszeniert mit Leuchteffekt. Witz der Karte: „Man sieht sie nicht. Man hört sie nicht. Aber das Auto ist weg.“
Feld 4: Fluchthelfer-Ring – Gauner in einem Fluchtwagen mit quietschenden Reifen. Witz der Karte: „Ihr Fluchtwagen hat mehr Kilometer als ein Linienbus.“
Feld 5: Geldwäsche-Ring – Gruppe aus 3–4 Figuren: Hehler in Weste und Schiebermütze zwischen Kisten mit Diebesgut – epische Team-Szene. Witz der Karte: „Schmutziges Geld rein, glänzendes Geld raus.“
Feld 6: Straßengang – Gruppe aus 3–4 Figuren: Gangmitglied in Lederjacke mit Goldkette und Sonnenbrille – epische Team-Szene. Witz der Karte: „Treffen sich jeden Tag am Kiosk. Machen jeden Tag Ärger.“
Feld 7: Streifenführerin Kowalczyk – weiblich, Streifenpolizist(in) in blauer deutscher Polizeiuniform mit Schirmmütze. Witz der Karte: „Ihre Streife trägt Weste. Immer. Auch beim Bäcker.“
Feld 8: Profilerin Dr. Sandmann – weiblich, Kriminalpolizist(in) in Zivil (Trenchcoat, Hemd, Krawatte oder Blazer), Polizeimarke am Gürtel. Witz der Karte: „Weiß nach drei Sekunden, was du zum Frühstück hattest.“
Feld 9: Bereitschaftsführer Yilmaz – männlich, Bereitschaftspolizist(in) in dunkelblauer Schutzausrüstung mit Helm. Witz der Karte: „Ein Signal – und die halbe Hundertschaft steht bereit.“
```

## Auftrag B28

```
Auftrag B28: Raster 3×3, 9 Felder, Reihenfolge Zeile für Zeile von oben links. Kein Text im Bild.

Feld 1: Durchsuchung der Wohnung – Maßnahme/Aktion, Strafverfolgung (Polizeimaßnahme): zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Unterm Bett, im Schrank, im Gefrierfach. Vor allem im Gefrierfach.“
Feld 2: Fahrzeugsperre – Reaktion/Falle, Gefahrenabwehr (Polizeimaßnahme): zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Hier ist Endstation. Bitte wenden.“
Feld 3: Steuerberater Schlitzohr – männlich, Betrüger/Hochstapler im schicken, leicht übertriebenen Anzug mit verschlagenem Grinsen. Witz der Karte: „Seine Steuererklärung ist kreativer als jedes Kunstwerk.“
Feld 4: Kronzeuge Kalle – männlich, Hehler in Weste und Schiebermütze zwischen Kisten mit Diebesgut. Witz der Karte: „Redet viel, wenn er fällt. Und nimmt andere mit.“
Feld 5: Bandenspitzel Ratte – männlich, Gangmitglied in Lederjacke mit Goldkette und Sonnenbrille. Witz der Karte: „Wo eine Ratte ist, sind noch mehr.“
Feld 6: Hinterhalt im Hinterhof – Reaktion/Falle, Gaunertrick der Verbrecher: zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Hinter jeder Mülltonne wartet jemand.“
Feld 7: Steuertrick – Maßnahme/Aktion, Gaunertrick der Verbrecher: zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Nimmt ein Viertel von allem. Steuerfrei natürlich.“
Feld 8: Bußgeldstelle Frau Grimm – weiblich, Verkehrspolizist(in) mit neongelber Warnweste und weißer Polizeimütze. Witz der Karte: „Jede Handkarte kostet. Sie hat die Liste.“
Feld 9: Hundeführer Bauer mit Kira – weiblich, Polizeihundeführer in Uniform mit seinem Schäferhund. Witz der Karte: „Kira sucht, Bauer zeigt, alle staunen.“
```

## Auftrag B29

```
Auftrag B29: Raster 3×3, 9 Felder, Reihenfolge Zeile für Zeile von oben links. Kein Text im Bild.

Feld 1: Autobahnpolizei-Kommandant Hagen – männlich, Verkehrspolizist(in) mit neongelber Warnweste und weißer Polizeimütze. Witz der Karte: „Holt sich jeden Cent zurück – inklusive Mahngebühr.“
Feld 2: Beweismittel sichern – Maßnahme/Aktion, Strafverfolgung (Polizeimaßnahme): zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Tütchen, Etikett, Unterschrift. Und ab in die Asservatenkammer.“
Feld 3: Steuerfahndung – Maßnahme/Aktion, Strafverfolgung (Polizeimaßnahme): zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Ein Viertel ist für den Staat. Mindestens.“
Feld 4: Raser Kevin – weiblich, Räuber im gestreiften Pulli mit Augenmaske und Beutesack mit Dollarzeichen. Witz der Karte: „0 auf 100 in 4 Sekunden. Bremsen? Überbewertet.“
Feld 5: Unfallflüchtiger Udo – männlich, Dieb in dunkler Kleidung (Hoodie oder Rollkragen), Mütze, Augenmaske. Witz der Karte: „War nie da. Nur sein Spiegel liegt noch auf der Straße.“
Feld 6: Schrottplatz-Hehler Jupp – männlich, Hehler in Weste und Schiebermütze zwischen Kisten mit Diebesgut. Witz der Karte: „Macht aus jedem Wrack ein Schnäppchen. Und aus jedem Gegner ein Vorbild.“
Feld 7: Spurenbeseitigung – Maßnahme/Aktion, Gaunertrick der Verbrecher: zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Putzmittel, Handschuhe, ein Lächeln. Fertig.“
Feld 8: Falsche Umleitung – Reaktion/Falle, Gaunertrick der Verbrecher: zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Die Umleitung führt direkt in den Wald. Absichtlich.“
Feld 9: Weihnachtsmarkt-Streife Holger – männlich, Streifenpolizist(in) in blauer deutscher Polizeiuniform mit Schirmmütze. Witz der Karte: „Hat mehr Lebkuchen in der Tasche als Strafzettel.“
```

## Auftrag B30

```
Auftrag B30: Raster 3×3, 9 Felder, Reihenfolge Zeile für Zeile von oben links. Kein Text im Bild.

Feld 1: Taschendieb-Fahnderin Ines – weiblich, Kriminalpolizist(in) in Zivil (Trenchcoat, Hemd, Krawatte oder Blazer), Polizeimarke am Gürtel. Witz der Karte: „Spürt Taschendiebe schneller, als die „Entschuldigung“ sagen können.“
Feld 2: Diensthund Krümel – Polizei-Diensthund (Deutscher Schäferhund o. ä.) mit rotem Halsband und Polizeimarke. Witz der Karte: „Klein, flauschig, und hat schon drei Diebe zu Fall gebracht.“
Feld 3: Glühwein-Kontrolle – Maßnahme/Aktion, Gefahrenabwehr (Polizeimaßnahme): zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Einmal pusten, bitte. Und die Taschen leeren.“
Feld 4: Zugriff am Glühweinstand – Reaktion/Falle, Gefahrenabwehr (Polizeimaßnahme): zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Der Glühwein war nur Tarnung.“
Feld 5: Falscher Weihnachtsmann – männlich, Betrüger/Hochstapler im schicken, leicht übertriebenen Anzug mit verschlagenem Grinsen. Witz der Karte: „Ho-ho-hol dir deine Brieftasche zurück, wenn du kannst.“
Feld 6: Taschendiebin Elfie – weiblich, Dieb in dunkler Kleidung (Hoodie oder Rollkragen), Mütze, Augenmaske. Witz der Karte: „Klein, flink und mit sehr großen Taschen.“
Feld 7: Glühwein-Dealer Gerd – weiblich, Dealer mit Basecap und Kapuzenpulli (Drogen nur als neutrale bunte Pillen/Päckchen angedeutet). Witz der Karte: „Sein Glühwein ist heiß. Sein Geschäft heißer.“
Feld 8: Geschenke-Klau – Maßnahme/Aktion, Gaunertrick der Verbrecher: zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Die Geschenke waren so schön verpackt. Waren.“
Feld 9: Schneeballschlacht – Maßnahme/Aktion, Gaunertrick der Verbrecher: zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Alle lachen. Keiner sieht, wer die Kasse nimmt.“
```

## Auftrag B31

```
Auftrag B31: Raster 3×3, 9 Felder, Reihenfolge Zeile für Zeile von oben links. Kein Text im Bild.

Feld 1: Einsatzleiterin Brenner-Voss – weiblich, Bereitschaftspolizist(in) in dunkelblauer Schutzausrüstung mit Helm. Witz der Karte: „Hat für jede Lage einen Ordner. Farblich sortiert.“
Feld 2: Spurensicherin Lu – weiblich, Kriminalpolizist(in) in Zivil (Trenchcoat, Hemd, Krawatte oder Blazer), Polizeimarke am Gürtel. Witz der Karte: „Findet ein Haar im Teppich. Und weiß, von wem es ist.“
Feld 3: Zivilfahnder Mertens – männlich, Kriminalpolizist(in) in Zivil (Trenchcoat, Hemd, Krawatte oder Blazer), Polizeimarke am Gürtel. Witz der Karte: „Sieht aus wie ein Tourist. Ist keiner.“
Feld 4: Großlage-Funkspruch – Maßnahme/Aktion, Gefahrenabwehr (Polizeimaßnahme): zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „An alle Einheiten: noch eine Runde!“
Feld 5: Nagelgurt – Reaktion/Falle, Gefahrenabwehr (Polizeimaßnahme): zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Platt in drei Sekunden. Die Reifen, nicht die Stimmung.“
Feld 6: Clan-Anwalt Dr. Brecht – männlich, Betrüger/Hochstapler im schicken, leicht übertriebenen Anzug mit verschlagenem Grinsen. Witz der Karte: „Mein Mandant hat von nichts gewusst.“ – Seit 20 Jahren derselbe Satz.“
Feld 7: Kurier auf dem E-Roller – männlich, Dealer mit Basecap und Kapuzenpulli (Drogen nur als neutrale bunte Pillen/Päckchen angedeutet). Witz der Karte: „Liefert in 10 Minuten. Fragen kostet extra.“
Feld 8: Inkasso-Ede – männlich, Gangmitglied in Lederjacke mit Goldkette und Sonnenbrille. Witz der Karte: „Pro Handkarte ein kleiner Aufpreis. Nennt er „Zinsen“.“
Feld 9: Akten verschwinden lassen – Maßnahme/Aktion, Gaunertrick der Verbrecher: zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Was nicht in der Akte steht, ist nie passiert.“
```

## Auftrag B32

```
Auftrag B32: Raster 3×3, 9 Felder, Reihenfolge Zeile für Zeile von oben links. Kein Text im Bild.

Feld 1: Hinterhof-Falle – Reaktion/Falle, Gaunertrick der Verbrecher: zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Wer hier reinläuft, kommt nicht so schnell wieder raus.“
Feld 2: Revierleiter Sonnenschein – weiblich, Streifenpolizist(in) in blauer deutscher Polizeiuniform mit Schirmmütze, besonders heldenhaft/legendär inszeniert mit Leuchteffekt. Witz der Karte: „Seit 35 Jahren im Dienst. Seine Frühschicht-Brötchen sind Legende.“
Feld 3: Generalfahnderin Aurora – weiblich, Kriminalpolizist(in) in Zivil (Trenchcoat, Hemd, Krawatte oder Blazer), Polizeimarke am Gürtel, besonders heldenhaft/legendär inszeniert mit Leuchteffekt. Witz der Karte: „Hat die Fahndungsliste auswendig gelernt. Rückwärts.“
Feld 4: Hundertschaftsführer Orion – männlich, SEK-Spezialeinsatzkraft in schwarzer taktischer Ausrüstung mit Helm und Visier (keine Waffe im Vordergrund), besonders heldenhaft/legendär inszeniert mit Leuchteffekt. Witz der Karte: „Ein Anruf – und hundert Kollegen stehen vor der Tür.“
Feld 5: Polizeiärztin Dr. Engel – weiblich, Bereitschaftspolizist(in) in dunkelblauer Schutzausrüstung mit Helm, besonders heldenhaft/legendär inszeniert mit Leuchteffekt. Witz der Karte: „Pflaster drauf, weiter geht's. Für alles andere hat sie den Notfallkoffer.“
Feld 6: Personenschützer Fels – männlich, Bereitschaftspolizist(in) in dunkelblauer Schutzausrüstung mit Helm, besonders heldenhaft/legendär inszeniert mit Leuchteffekt. Witz der Karte: „Steht im Weg. Absichtlich. Und sehr, sehr stabil.“
Feld 7: Autobahnpolizistin Turbo-Tina – weiblich, Verkehrspolizist(in) mit neongelber Warnweste und weißer Polizeimütze, besonders heldenhaft/legendär inszeniert mit Leuchteffekt. Witz der Karte: „Hat noch nie einen Raser entkommen lassen. Und das Tempolimit kennt sie auch nur vom Hörensagen.“
Feld 8: SEK-Schildträger Atlas – männlich, SEK-Spezialeinsatzkraft in schwarzer taktischer Ausrüstung mit Helm und Visier (keine Waffe im Vordergrund), besonders heldenhaft/legendär inszeniert mit Leuchteffekt. Witz der Karte: „Hinter seinem Schild ist das ganze SEK sicher. Und ein Kaffee.“
Feld 9: Bundesweite Großrazzia – Maßnahme/Aktion, Strafverfolgung (Polizeimaßnahme): zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „600 Beamte, 120 Objekte, 1 Uhrzeit: 6 Uhr morgens.“
```

## Auftrag B33

```
Auftrag B33: Raster 3×3, 9 Felder, Reihenfolge Zeile für Zeile von oben links. Kein Text im Bild.

Feld 1: Notwehr – Reaktion/Falle, Gefahrenabwehr (Polizeimaßnahme): zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Wer angreift, muss mit Gegenwehr rechnen.“
Feld 2: Lagezentrum – Maßnahme/Aktion, Gefahrenabwehr (Polizeimaßnahme): zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Bildschirme, Funk, Karten – hier weiß man alles. Fast alles.“
Feld 3: Clanchef Abgrund – männlich, Gangmitglied in Lederjacke mit Goldkette und Sonnenbrille, besonders heldenhaft/legendär inszeniert mit Leuchteffekt. Witz der Karte: „Wenn seine Leute anrücken, räumt sogar die Konkurrenz das Feld.“
Feld 4: Bestechungskönigin Eclipsa – weiblich, Betrüger/Hochstapler im schicken, leicht übertriebenen Anzug mit verschlagenem Grinsen, besonders heldenhaft/legendär inszeniert mit Leuchteffekt. Witz der Karte: „Jeder hat seinen Preis. Ihrer ist meistens bar.“
Feld 5: Sprengmeister Krater – männlich, Räuber im gestreiften Pulli mit Augenmaske und Beutesack mit Dollarzeichen, besonders heldenhaft/legendär inszeniert mit Leuchteffekt. Witz der Karte: „Hat die Lunte immer schon angezündet, bevor du „Bombenentschärfer“ sagen kannst.“
Feld 6: Ausbrecherkönig Phönix – männlich, Räuber im gestreiften Pulli mit Augenmaske und Beutesack mit Dollarzeichen, besonders heldenhaft/legendär inszeniert mit Leuchteffekt. Witz der Karte: „Gefasst? Kurz. Er ist schon wieder auf dem Weg nach draußen.“
Feld 7: Serieneinbrecher Chronos – männlich, Dieb in dunkler Kleidung (Hoodie oder Rollkragen), Mütze, Augenmaske, besonders heldenhaft/legendär inszeniert mit Leuchteffekt. Witz der Karte: „Ein Haus pro Nacht. Manchmal zwei, wenn's gut läuft.“
Feld 8: Phantom ohne Gesicht – männlich, Dealer mit Basecap und Kapuzenpulli (Drogen nur als neutrale bunte Pillen/Päckchen angedeutet), besonders heldenhaft/legendär inszeniert mit Leuchteffekt. Witz der Karte: „Kein Name, kein Foto, kein Fingerabdruck. Nur Gerüchte.“
Feld 9: Aktenvernichtung – Maßnahme/Aktion, Gaunertrick der Verbrecher: zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Schredder, Feuer, Säure – Beweise? Welche Beweise?“
```

## Auftrag B34

```
Auftrag B34: Raster 3×3, 9 Felder, Reihenfolge Zeile für Zeile von oben links. Kein Text im Bild.

Feld 1: Meisterlicher Taschenzug – Maßnahme/Aktion, Gaunertrick der Verbrecher: zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Rempeln, lächeln, weg. Zwei Brieftaschen in drei Sekunden.“
Feld 2: Identitätstausch – Maßnahme/Aktion, Gaunertrick der Verbrecher: zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Neuer Name, neuer Pass, neues Leben. Deins.“
Feld 3: Geheimer Fluchttunnel – Reaktion/Falle, Gaunertrick der Verbrecher: zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „Hinter dem Kühlschrank geht's direkt in die Kanalisation.“
Feld 4: leer lassen (nur Hintergrund)
Feld 5: leer lassen (nur Hintergrund)
Feld 6: leer lassen (nur Hintergrund)
Feld 7: leer lassen (nur Hintergrund)
Feld 8: leer lassen (nur Hintergrund)
Feld 9: leer lassen (nur Hintergrund)
```
