
# Skill-Gap Severity-Engine: Neukalibrierung & Sprachliches Reframing

## Das Problem (mit echten Zahlen belegt)

Die Datenbankabfrage zeigt:
- Skala: 0–100 (bestätigt)
- 127 von 211 Gaps (60 %) werden als "Kritisch" markiert
- Durchschnittlicher Gap: ~24 Punkte – das ist normales Entwicklungspotenzial, kein Notfall

Die aktuelle Formel: `weighted = (dem - cur) * 0.4 + (fut - cur) * 0.6`
- Threshold "Kritisch": >= 30 → wird bei einem Gap von z.B. Ist:50, Soll:80, Ziel:80 ausgelöst: (30×0.4) + (30×0.6) = 30 → sofort "Kritisch"
- Das bedeutet: Wer auch nur 30 Punkte unter dem Soll liegt, wird als Notfall markiert. Das ist bei dieser Skala viel zu aggressiv.

## Strategisches Reframing

Kanzleien, die quartalsweise ihre Teams sehen und permanent rote "Kritisch"-Badges sehen, reagieren typischerweise so:
1. **Kurzfristig** – Schock und Verunsicherung: "Ist unser Team wirklich so schlecht?"
2. **Mittelfristig** – Alert Fatigue: Die roten Badges werden ignoriert, weil alles immer rot ist
3. **Langfristig** – Tool-Abandonment: Das Tool wird als "zu pessimistisch" eingestuft und nicht mehr ernst genommen

Das Ziel: Skill Gaps als **Wachstumschancen** darstellen, nicht als Krisen.

## Änderungen

### 1. Neue Schwellenwerte (angepasst an 0–100-Skala)

Statt absoluter Gap-Werte wird der Gap relativ zur Soll-Anforderung bewertet:

```
gapRatio = weightedGap / demandedLevel (in %)
```

Neue Labels und Schwellen:
- **Fokusbereich** (bisher "Kritisch"): gapRatio >= 50% → mehr als die Hälfte des Weges fehlt noch
- **Im Aufbau** (bisher "Hoch"): gapRatio >= 25%
- **Auf Kurs** (bisher "Moderat"): darunter

Beispiel mit Ist:50, Soll:80:
- Gap = 30, Soll = 80 → Ratio = 37.5% → "Im Aufbau" statt "Kritisch"

Beispiel mit Ist:20, Soll:80:
- Gap = 60, Soll = 80 → Ratio = 75% → "Fokusbereich"

### 2. Neue Labels (positiv-konstruktiv, kein Alarmmodus)

| Alt | Neu | Farbe |
|---|---|---|
| Kritisch | Fokusbereich | Amber/Orange (nicht Rot) |
| Hoch | Im Aufbau | Blau/Teal |
| Moderat | Auf Kurs | Grün |

Die Farbe "Rot" (destructive) wird komplett entfernt für Severity-Badges. Rot bleibt nur für echte Systemfehler.

### 3. Gap-Anzeige: Positiv formulieren

Statt `−30%` (was wie ein Fehler wirkt):
- `+30 Pkt. Potenzial` oder `Noch 30 Pkt.`

Das gleiche Faktum, aber als Entwicklungsrichtung gelesen.

### 4. Stats-Kacheln überarbeiten

Statt "Kritisch"-Zähler oben (der Alarm auslöst):
- Erste Kachel: "Entwicklungsbereiche" (neutral, alle Gaps)
- Zweite Kachel: "Fokus-Kompetenzen" (nur >= 50% Ratio) mit Amber statt Rot
- Dritte Kachel: Betroffene Mitarbeiter (bleibt)

### 5. Filter-Labels anpassen

Aus "Kritisch ≥30 / Hoch 15–29 / Moderat <15" wird:
"Fokusbereich / Im Aufbau / Auf Kurs"

## Betroffene Dateien

- `src/components/SkillGapCardDb.tsx` – Neue `getGapSeverity()`-Funktion, neue Labels, neue Farben, Gap-Text positiv formulieren
- `src/pages/admin/SkillGapPage.tsx` – Neue `getSeverityLabel()`-Funktion, Stats-Kacheln anpassen, Filter-Labels aktualisieren, Threshold für Anzeige-Mindestgap prüfen

## Nicht geändert

- Die Formel selbst (`weighted = (dem - cur) * 0.4 + (fut - cur) * 0.6`) bleibt – sie ist mathematisch korrekt
- Der Mindest-Schwellenwert für die Anzeige im Gap-Feed (aktuell >= 10) bleibt, damit wirklich nur relevante Gaps erscheinen
- Keine Datenbankänderungen
- Keine Engine-Änderungen
