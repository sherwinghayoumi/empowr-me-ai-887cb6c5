

## Plan: Rollenrelative Bewertungsskala fuer AI-Profilgenerierung

### Problem

Die aktuelle Rating-Skala (1-5) wird von Claude als **absolute Senioritaetsskala** interpretiert. Ein Junior Associate, der alle JA-Kompetenzen hervorragend beherrscht, bekommt trotzdem niedrigere Ratings als ein durchschnittlicher Senior Associate -- weil Claude "Exzellent" im Kontext der gesamten Anwaltslaufbahn interpretiert, nicht im Kontext der jeweiligen Rolle.

Zusaetzlich verstaerkt die Anweisung "nutze Senioritaet als Faktor" diesen Bias.

### Loesung

Den System-Prompt in der Edge Function so anpassen, dass die Bewertungsskala **explizit rollenrelativ** definiert wird. Ein "5" bedeutet dann: "beherrscht diese Kompetenz auf dem Niveau, das fuer diese spezifische Rolle erwartet wird -- herausragend". Die Rolle selbst definiert den Massstab.

### Konkrete Aenderungen

**Datei: `supabase/functions/generate-profile/index.ts`**

#### 1. Rating-Skala rollenrelativ formulieren

Aktuelle Skala (Zeilen 254-259):
```text
- 1 = Grundlagen fehlen
- 2 = Basis vorhanden
- 3 = Kompetent
- 4 = Stark
- 5 = Exzellent
```

Neue Skala:
```text
BEWERTUNGSMASSSTAB: Rollenrelativ fuer ${roleKey}
Die Bewertung bezieht sich AUSSCHLIESSLICH auf die Erwartungen der aktuellen Rolle.
Ein Junior Associate, der alle JA-Kompetenzen perfekt beherrscht, verdient eine 5.
Ein Senior Associate, der SA-Kompetenzen nur teilweise beherrscht, kann eine 2 bekommen.
Vergleiche NICHT zwischen Rollen -- bewerte nur innerhalb der Rollenerwartung.

- 1 = Erfuellt die Rollenerwartung nicht (deutliche Luecken fuer diese Stufe)
- 2 = Teilweise auf Rollenniveau (Grundlagen vorhanden, aber Luecken)
- 3 = Auf Rollenniveau (erfuellt die Erwartung fuer diese Position solide)
- 4 = Ueber Rollenniveau (uebertrifft die Erwartung fuer diese Stufe)
- 5 = Herausragend fuer diese Rolle (Benchmark / Vorbild auf dieser Stufe)
```

#### 2. Senioritaets-Bias entfernen

Aktuelle Anweisung (Zeilen 262-264):
```text
Wenn keine direkte Evidence vorhanden ist, nutze dein Expertenwissen,
um basierend auf dem Gesamtbild (Berufserfahrung, Seniorität,
verwandte Skills, Rollenanforderungen) eine fundierte Einschätzung abzugeben.
```

Neue Anweisung:
```text
Wenn keine direkte Evidence vorhanden ist, nutze dein Expertenwissen,
um basierend auf dem Gesamtbild (Berufserfahrung, verwandte Skills,
dokumentierte Leistungen) eine fundierte Einschaetzung abzugeben.
Beziehe die Bewertung dabei IMMER auf das erwartete Niveau der
aktuellen Rolle -- NICHT auf eine absolute Senioritaetsskala.
```

#### 3. Zusaetzliche Klarstellung im Prompt-Header

Nach Zeile 268 (`KRITISCH: Du bewertest einen ${roleKey}`) einen Absatz einfuegen:

```text
BEWERTUNGSPRINZIP: Alle Ratings sind RELATIV zur Rolle "${roleKey}".
Eine 5 bedeutet: herausragend FUER DIESE ROLLE.
Eine 3 bedeutet: solide auf dem erwarteten Niveau DIESER ROLLE.
Absolute Berufserfahrung oder Senioritaet duerfen das Rating
NICHT systematisch nach oben oder unten verzerren.
```

---

### Zusammenfassung der Aenderungen

| Datei | Aenderung |
|---|---|
| `supabase/functions/generate-profile/index.ts` | Rating-Skala rollenrelativ formulieren, Senioritaets-Bias entfernen, Klarstellung einfuegen |

### Erwartetes Ergebnis

Nach dieser Aenderung sollten die Gesamtscores ueber alle Rollen hinweg eine aehnliche Verteilung zeigen. Ein exzellenter Junior Associate kann 85%+ erreichen, ein schwacher Senior Associate kann unter 60% liegen -- weil jeder an den Erwartungen seiner eigenen Rolle gemessen wird.

### Hinweis

Bestehende Employee Profiles werden durch diese Aenderung nicht automatisch aktualisiert. Sobald die Bulk-Re-Profiling-Funktion einsatzbereit ist, koennen alle Profile mit der neuen Bewertungslogik neu generiert werden.

