"""Erzeugt store/gemini/PROMPTS.md (Prompts für Gemini) und store/gemini/zuordnung.json (Bild-Zuordnung)."""
import json, re
C = json.load(open('/tmp/cards.json'))
FEM = re.compile(r'(?:in\b|frau|\b(?:lea|jana|mara|pia|ilka|ines|lu|hanna|steffi|gabi|tina|bella|luna|kira|erna|rose|rosi|lola|elfie|yildiz|aurora|eclipsa|golden|katze|blitz|zucker|baronin|engel|neumann|arndt|grimm|kowalczyk|brenner-voss|saubermann|fingerling)\b)', re.I)
ROLE = {
 'streife': 'Streifenpolizist(in) in blauer deutscher Polizeiuniform mit Schirmmütze',
 'kripo':   'Kriminalpolizist(in) in Zivil (Trenchcoat, Hemd, Krawatte oder Blazer), Polizeimarke am Gürtel',
 'sek':     'SEK-Spezialeinsatzkraft in schwarzer taktischer Ausrüstung mit Helm und Visier (keine Waffe im Vordergrund)',
 'verkehr': 'Verkehrspolizist(in) mit neongelber Warnweste und weißer Polizeimütze',
 'hunde':   'Polizei-Diensthund (Deutscher Schäferhund o. ä.) mit rotem Halsband und Polizeimarke',
 'bepo':    'Bereitschaftspolizist(in) in dunkelblauer Schutzausrüstung mit Helm',
 'dieb':    'Dieb in dunkler Kleidung (Hoodie oder Rollkragen), Mütze, Augenmaske',
 'betrug':  'Betrüger/Hochstapler im schicken, leicht übertriebenen Anzug mit verschlagenem Grinsen',
 'bande':   'Gangmitglied in Lederjacke mit Goldkette und Sonnenbrille',
 'hehler':  'Hehler in Weste und Schiebermütze zwischen Kisten mit Diebesgut',
 'raub':    'Räuber im gestreiften Pulli mit Augenmaske und Beutesack mit Dollarzeichen',
 'drogen':  'Dealer mit Basecap und Kapuzenpulli (Drogen nur als neutrale bunte Pillen/Päckchen angedeutet)',
}
LAW = {'StPO': 'Strafverfolgung (Polizeimaßnahme)', 'SOG': 'Gefahrenabwehr (Polizeimaßnahme)', 'Trick': 'Gaunertrick der Verbrecher'}
GROUP = re.compile(r'(trupp|team|einheit|duo|ring|kartell|gang\b|staffel(?!leiter)|zug\b|hundertschaft\b|kommando|netzwerk|kommission|syndikat|imperium|clan der|gruppe|dienst$|wache$|gesamteinsatz|kriminalität|höllenhunde|nachtfalter|großlage|großeinsatz)', re.I)

VEH = [(r'Hubschrauber|Libelle|Luft-Boden', 'Polizeihubschrauber in Blau-Silber im Flug, Pilot(in) winkt aus dem Cockpit'),
       (r'Wasserwerfer', 'Wasserwerfer-Fahrzeug der Polizei, das eine große Wasserfontäne spritzt'),
       (r'Messfahrzeug', 'unauffälliges Zivilauto mit Blitzerkamera hinter der Windschutzscheibe'),
       (r'Lautsprecherwagen', 'Polizeiwagen mit großem Lautsprecher auf dem Dach'),
       (r'Reiterstaffel', 'berittene Polizei auf braunem Polizeipferd'),
       (r'Fahrradstreife', 'Polizist auf einem Polizeifahrrad mit Fahrradhelm'),
       (r'Wasserschutz', 'Wasserschutzpolizist auf einem kleinen Polizeiboot'),
       (r'Motorradstreife', 'Polizist auf einem weiß-blauen Polizeimotorrad'),
       (r'Fluchthelfer-Ring', 'Gauner in einem Fluchtwagen mit quietschenden Reifen')]
def describe(c):
    n, fl = c['name'], c['flavor'].strip('„“"')
    for rx, d in VEH:
        if re.search(rx, n, re.I) and c['type'] in ('monster','fusion'):
            return f'**{n}** – {d}. Witz der Karte: „{fl}“'
    if c['type'] in ('monster', 'fusion'):
        base = ROLE.get(c['attr'], 'Comicfigur')
        if c['attr'] != 'hunde' or re.search(r'führer|mit Kira|Staffelleiter', n, re.I):
            if c['attr'] == 'hunde': base = 'Polizeihundeführer in Uniform mit seinem Schäferhund'
            g = 'weiblich' if FEM.search(n.replace('Dr.', '')) else 'männlich'
            if GROUP.search(n) or c['type'] == 'fusion': base = 'Gruppe aus 3–4 Figuren: ' + base
            else: base = f'{g}, {base}'
        if c['type'] == 'fusion': base += ' – epische Team-Szene'
        if c['rarity'] in ('UR', 'CE'): base += ', besonders heldenhaft/legendär inszeniert mit Leuchteffekt'
        return f'**{n}** – {base}. Witz der Karte: „{fl}“'
    kind = 'Reaktion/Falle' if c['type'] == 'trap' else 'Maßnahme/Aktion'
    return f'**{n}** – {kind}, {LAW.get(c["law"], "")}: zeige einen passenden Gegenstand oder eine kleine Szene (ohne Text). Witz der Karte: „{fl}“'

BATCH = 9
batches = [C[i:i+BATCH] for i in range(0, len(C), BATCH)]
STYLE = """Du bist Illustrator für das Handy-Kartenspiel „Einsatz-Duell“ (Polizei gegen Verbrecher, humorvoll, familienfreundlich ab 12).
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

Bestätige kurz, dann schicke ich Auftrag 1."""

md = ["# Kartenbilder mit Gemini erstellen", "",
 f"{len(C)} Karten → {len(batches)} Aufträge mit je bis zu 9 Bildern (ein Raster-Bild pro Auftrag).", "",
 "## So geht's", "",
 "1. Öffne Gemini (am besten mit Bildgenerierung, z. B. „Bild erstellen“) in einem **neuen Chat**.",
 "2. Schicke zuerst den **Stil-Prompt** unten.",
 "3. Schicke dann Auftrag für Auftrag (B01, B02, …). Pro Auftrag kommt ein Raster-Bild mit 9 Feldern.",
 "4. Speichere jedes Bild unter dem Namen des Auftrags: **B01.png, B02.png, …** (Groß-B, zweistellig).",
 "   Passt ein Bild nicht, schreib „Bitte Auftrag B07 nochmal, Feld 4 passt nicht zur Karte“ und speichere die neue Version.",
 "5. Wenn Gemini nach einigen Aufträgen den Stil verliert: neuen Chat, Stil-Prompt erneut, beim nächsten Auftrag weitermachen.",
 "6. Lade mir alle Bilder hoch (einzeln oder als ZIP). Ich zerschneide die Raster, ordne jedes Feld über **zuordnung.json** der richtigen Karte zu und baue sie ins Spiel ein.",
 "", "Karten ohne eigenes Bild (z. B. neue Wochenkarten) bekommen automatisch das gezeichnete Comic-Bild.", "",
 "## Stil-Prompt (zuerst senden)", "", "```", STYLE, "```", ""]
mapping = {}
for bi, b in enumerate(batches, 1):
    key = f"B{bi:02d}"
    md += [f"## Auftrag {key}", "", "```", f"Auftrag {key}: Raster 3×3, 9 Felder, Reihenfolge Zeile für Zeile von oben links. Kein Text im Bild." , ""]
    for i, c in enumerate(b, 1):
        md.append(f"Feld {i}: {describe(c).replace('**','')}")
        mapping[f"{key}/{i}"] = c['id']
    if len(b) < 9:
        for i in range(len(b)+1, 10): md.append(f"Feld {i}: leer lassen (nur Hintergrund)")
    md += ["```", ""]
open('store/gemini/PROMPTS.md', 'w').write("\n".join(md))
json.dump({"raster": "3x3", "reihenfolge": "zeilenweise ab oben links", "felder": mapping,
           "karten": {c['id']: c['name'] for c in C}}, open('store/gemini/zuordnung.json', 'w'), ensure_ascii=False, indent=1)
print(len(batches), 'Aufträge')
