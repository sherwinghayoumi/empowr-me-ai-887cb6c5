

## Plan: Gespeicherte Dokumente im UI anzeigen und automatisch vorladen

### Problem

Wenn ein Admin das KI-Profil-Modal oeffnet, sind die Upload-Felder immer leer -- auch wenn bereits Dokumente in Supabase Storage gespeichert sind. Der Admin muss die Dateien jedes Mal neu hochladen, obwohl sie bereits im System vorliegen.

### Loesung

Zwei Aenderungen:

1. **ProfileGenerationModal**: Beim Oeffnen automatisch pruefen, ob gespeicherte Dokumente vorhanden sind, und diese in die Upload-Felder vorladen. Der Admin sieht sofort, welche Dateien bereits vorliegen, und kann direkt auf "Profil generieren" klicken.

2. **Employee-Karten**: Ein kleines Dokument-Icon oder Badge anzeigen, das signalisiert, ob Dokumente gespeichert sind (z.B. "3/3 Dokumente" oder "0/3 Dokumente").

### Konkrete Aenderungen

#### 1. ProfileGenerationModal.tsx -- Dokumente automatisch vorladen

- Die `employee`-Props enthalten bereits `cv_storage_path`, `self_assessment_path`, `manager_assessment_path`
- Im `useEffect` beim Oeffnen des Modals: Wenn Pfade vorhanden sind, `downloadDocumentsFromStorage()` aufrufen und die resultierenden `File`-Objekte in den `documents`-State setzen
- Ein Ladezustand ("Lade gespeicherte Dokumente...") anzeigen waehrend des Downloads
- Die UploadBox-Komponente zeigt dann automatisch den Dateinamen an (bereits implementiert fuer `file !== null`)
- Der "Profil generieren"-Button ist sofort klickbar wenn alle 3 Dokumente geladen sind

```text
useEffect beim Modal-Open:
  1. Pruefen ob cv_storage_path, self_assessment_path, manager_assessment_path vorhanden
  2. Wenn ja: setIsLoadingDocs(true), downloadDocumentsFromStorage() aufrufen
  3. Ergebnis in setDocuments() speichern
  4. setIsLoadingDocs(false)
  5. Toast: "Gespeicherte Dokumente geladen"
```

- Die employee-Prop-Schnittstelle wird erweitert um die drei Pfad-Felder (bereits in DbEmployee vorhanden)

#### 2. UploadBox -- Visuelles Feedback fuer vorgeladene Dateien

- Kleine Anpassung: Wenn eine Datei vorhanden ist und aus dem Storage geladen wurde, optional ein "Gespeichert"-Label anzeigen (z.B. kleines Cloud-Icon)
- Bestehende Dateien koennen weiterhin durch neue ersetzt werden (Drag & Drop oder Klick)

#### 3. EmployeesPage.tsx -- Dokument-Status auf Karten

- Neben dem bestehenden Badge (Update verfuegbar / Aktuell) ein kleines Icon hinzufuegen das zeigt:
  - Alle 3 Dokumente vorhanden: Ordner-Icon in Gruen
  - Teilweise vorhanden: Ordner-Icon in Orange mit Anzahl
  - Keine Dokumente: kein Icon (oder grau)
- Die Daten sind bereits im Employee-Objekt vorhanden (`cv_storage_path`, etc.)

### Technische Details

| Datei | Aenderung |
|---|---|
| `src/components/admin/ProfileGenerationModal.tsx` | Employee-Props erweitern, useEffect fuer Auto-Download, Ladezustand |
| `src/pages/admin/EmployeesPage.tsx` | Dokument-Status-Badge auf Employee-Karten, vollstaendige Pfade an Modal weitergeben |

### Ablauf nach der Aenderung

```text
Admin klickt Bot-Icon
  -> Modal oeffnet sich
  -> "Lade gespeicherte Dokumente..." (1-2 Sekunden)
  -> Upload-Felder zeigen gespeicherte Dateien an (gruen markiert)
  -> Admin klickt direkt "Profil generieren"
  -> Fertig -- kein erneutes Hochladen noetig
```

Falls keine Dokumente gespeichert sind, bleibt das Verhalten wie bisher (leere Upload-Felder).

