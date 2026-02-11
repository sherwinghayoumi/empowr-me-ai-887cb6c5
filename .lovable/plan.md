## Plan: Dokumente speichern und Bulk-Re-Profiling bei neuen Role Profiles

### Problem

Wenn neue Role Profiles mit neuen Skills hochgeladen werden, haben bestehende Employee Profiles keine Bewertungen dafuer. Aktuell muessten alle Dokumente erneut manuell hochgeladen und jedes Profil einzeln neu generiert werden.

### Loesung

Die drei Dokumente (CV, Self-Assessment, Manager-Assessment), die beim Erstellen eines Employee Profiles hochgeladen werden, werden dauerhaft in Supabase Storage gespeichert. Org Admins koennen dann per Knopfdruck alle (oder ausgewaehlte) Employee Profiles automatisch neu generieren lassen -- mit einer Queue, die die Anfragen nacheinander abarbeitet, um Anthropic API-Limits nicht zu ueberschreiten.

### Ablauf aus Nutzersicht

1. **Beim Profil-Erstellen**: Dokumente werden automatisch im Hintergrund in Supabase Storage (`documents` Bucket) gespeichert. Der Nutzer merkt keinen Unterschied.
2. **Nach Veroeffentlichung neuer Role Profiles**: Auf der Employees-Seite erscheint ein Banner/Hinweis: "Neue Kompetenzen verfuegbar -- Profile aktualisieren". Daneben ein Button "Alle Profile aktualisieren".
3. **Bulk Update gestartet**: Ein Modal zeigt den Fortschritt:
  - Liste aller Mitarbeiter mit Status-Icons (wartend, in Bearbeitung, fertig, fehler)
  - Fortschrittsbalken gesamt
  - Profile werden **sequentiell** (einer nach dem anderen) verarbeitet, mit ~2 Sekunden Pause zwischen den Aufrufen
  - Mitarbeiter ohne gespeicherte Dokumente werden uebersprungen (mit Hinweis)
4. **Nach Abschluss**: Jede Employee-Karte zeigt ein Badge "Aktualisiert am [Datum]" mit einem Haekchen.

---

### Technische Umsetzung

#### 1. Datenbank-Aenderungen

Neue Spalten in der `employees` Tabelle:

```text
cv_storage_path          TEXT     -- z.B. "documents/{org_id}/{employee_id}/cv.pdf"
self_assessment_path     TEXT     -- z.B. "documents/{org_id}/{employee_id}/self_assessment.docx"
manager_assessment_path  TEXT     -- z.B. "documents/{org_id}/{employee_id}/manager_assessment.docx"
profile_last_updated_at  TIMESTAMP -- Zeitpunkt des letzten AI-Profil-Updates
```

#### 2. Dokument-Upload beim Profil-Erstellen

**Datei: `src/components/admin/ProfileGenerationModal.tsx**`

- Nach erfolgreicher Profilgenerierung (im `handleGenerate`): Die drei Dateien in Supabase Storage hochladen unter dem Pfad `{org_id}/{employee_id}/cv.pdf` etc.
- Die Storage-Pfade in der `employees` Tabelle speichern
- Bestehender Workflow bleibt identisch, nur der Upload passiert zusaetzlich im Hintergrund

#### 3. Bulk Re-Profiling Button

**Datei: `src/pages/admin/EmployeesPage.tsx**`

- Neuer Button im Header-Bereich: "Profile aktualisieren" (mit RefreshCw-Icon)
- Button nur sichtbar, wenn es Mitarbeiter gibt, deren `profile_last_updated_at` aelter ist als das letzte `published_at` eines zugehoerigen Role Profiles
- Oeffnet ein neues `BulkReProfileModal`

#### 4. Bulk Re-Profile Modal (neue Komponente)

**Neue Datei: `src/components/admin/BulkReProfileModal.tsx**`

Kernlogik:

- Laedt Liste aller Mitarbeiter mit gespeicherten Dokumenten
- Verarbeitet diese **sequentiell** (einer nach dem anderen):

```text
fuer jeden Mitarbeiter:
  1. Dokumente aus Storage herunterladen
  2. Dokumente parsen (parseAllDocuments)
  3. AI-Profil generieren (generateProfile mit aktuellen DB-Kompetenzen)
  4. Profil in DB speichern (saveProfileToDatabase)
  5. profile_last_updated_at aktualisieren
  6. 2 Sekunden warten (Rate-Limiting)
  7. Naechsten Mitarbeiter starten
```

- UI zeigt:
  - Gesamtfortschritt (z.B. "3/12 Profile aktualisiert")
  - Pro Mitarbeiter: Name + Status (Wartend / In Bearbeitung / Fertig / Fehler / Uebersprungen)
  - Abbrechen-Button (stoppt nach aktuellem Mitarbeiter)
  - Zusammenfassung am Ende

#### 5. "Zuletzt aktualisiert" Badge

**Datei: `src/pages/admin/EmployeesPage.tsx**`

- In jeder Employee-Karte: Wenn `profile_last_updated_at` vorhanden, ein gruenes Badge mit Haekchen und Datum anzeigen
- Wenn `profile_last_updated_at` aelter als letztes Role Profile `published_at`: oranges Badge "Update verfuegbar"

#### 6. Refactoring: `saveProfileToDatabase` auslagern

Die Funktion `saveProfileToDatabase` wird aus `EmployeesPage.tsx` in einen eigenen Hook (`src/hooks/useProfileSaving.ts`) extrahiert, damit sie sowohl vom Einzelprofil-Modal als auch vom Bulk-Modal genutzt werden kann.

---

### Dateien die erstellt/geaendert werden


| Datei                                             | Aenderung                                           |
| ------------------------------------------------- | --------------------------------------------------- |
| `supabase/migrations/`                            | Neue Migration: Spalten zu `employees` hinzufuegen  |
| `src/components/admin/ProfileGenerationModal.tsx` | Upload der Dokumente nach Storage + Pfade speichern |
| `src/components/admin/BulkReProfileModal.tsx`     | **Neu**: Modal fuer sequentielles Bulk-Reprofiling  |
| `src/pages/admin/EmployeesPage.tsx`               | Button + Badge + Import des neuen Modals            |
| `src/hooks/useProfileSaving.ts`                   | **Neu**: Extrahierte `saveProfileToDatabase`-Logik  |
| `src/integrations/supabase/types.ts`              | Wird automatisch aktualisiert (neue Spalten)        |


### Rate-Limiting Strategie

- **Sequentielle Verarbeitung**: Nur ein API-Call gleichzeitig
- **5-Sekunden Pause** zwischen Mitarbeitern
- **Abbruch-Moeglich**: `AbortController`-Pattern, stoppt nach aktuellem Mitarbeiter
- **Fehler-Tolerant**: Ein Fehler bei einem Mitarbeiter stoppt nicht den gesamten Prozess, sondern wird protokolliert und der naechste wird verarbeitet