

# FUTURA v3 — Productionization Roadmap

6 sequentielle Pläne, die das System von Demo-/Mock-Zustand zu einem vollumfänglich funktionsfähigen Talent-Management-Tool transformieren.

---

## Plan 1: Current Gaps vs. Future Risks — Zweistufige Gap-Engine

**Problem:** Aktuell werden `demanded_level` (Current Gap) und `future_level` (Future Risk) in eine einzige gewichtete Zahl vermengt. Das verhindert saubere Priorisierung.

**Änderungen:**
- **`useOrgData.ts` / `useSkillGapAnalysis`**: Zwei separate Gap-Listen berechnen: `currentGaps` (demanded − current) und `futureRisks` (future − current). Jeweils eigene Severity-Einstufung.
- **`SkillGapPage.tsx`**: Tabs "Aktuelle Gaps" und "Zukunftsrisiken" statt einer gemischten Liste. Jeder Tab zeigt eigene KPIs (Anzahl, betroffene MA, Ø Gap).
- **`AdminDashboard.tsx`**: KPI-Karte "Kritische Gaps" aufteilen in "Current Gaps" und "Future Risks" mit eigener Farbe (rot vs. amber).
- **Severity-Labels**: "Kritisch / Mittel / Gering" statt "Potenzial / Wachstum / Stark" — klarer und professioneller.
- **`SeverityBadge.tsx`**: Neue Variante für Future Risks (amber-Palette).

---

## Plan 2: Wording & Darstellung — Positives Framing + Practice-Group-Kontext

**Problem:** Alle Mitarbeiter wirken "schlecht", weil Gaps ohne Kontext dargestellt werden. Außerdem fehlt die Practice-Group-Differenzierung in den Ansichten.

**Änderungen:**
- **Wording-Refactor überall**: 
  - "Gap" → "Entwicklungsfeld" in der UI
  - Scores als "X von Y" statt nur die Differenz zeigen
  - Stärken explizit hervorheben: Kompetenzen ON-TRACK oder ÜBER-Soll bekommen grüne Badges
- **Practice-Group-Filter global**: Dropdown in Dashboard, SkillGaps, Reports, Budget — filtert alle Daten nach Practice Group (aus `role_profiles.practice_group`).
- **Kontextualisierung**: Bei jedem Gap den Demanded Level anzeigen, damit klar ist, ob z.B. ein Level von 70 bei einem Target von 80 nur eine kleine Lücke ist.
- **Employee-Profil**: Stärken-Sektion oben, dann Entwicklungsfelder. Nicht nur Schwächen zeigen.

---

## Plan 3: Maßnahmen + Lernpfade zusammenlegen

**Problem:** `measures` (Tabelle) und `learning_paths` + `learning_modules` (Tabellen) sind separate Systeme für dasselbe Konzept.

**Änderungen:**
- **Datenmodell**: `measures` wird die Haupttabelle. Neue Spalten per Migration:
  - `source` (enum: 'manual' | 'ai_generated')
  - `ai_recommendation_reason` (text)
  - `progress_percent` (numeric, default 0)
  - `assigned_employee_ids` bleibt, wird aber auch für Einzelzuweisungen genutzt
- **Migration**: Bestehende `learning_paths` + `learning_modules` Daten in `measures` überführen (einmalig, mit SQL-Migration).
- **`useMeasures.ts`**: Erweitern um Progress-Tracking, AI-Flag, und Module-Unterstützung.
- **`MeasuresPage.tsx`**: Zeigt jetzt alles — manuelle Maßnahmen UND AI-generierte Lernpfade. Filter nach `source`. Progress-Bar pro Maßnahme.
- **`LearningPathGeneratorModal.tsx`**: Erzeugt jetzt einen `measure`-Eintrag statt `learning_path`.
- **Sidebar**: "Maßnahmen" → "Maßnahmen & Lernpfade" (oder kurz "Entwicklung").
- **Alte Tabellen**: `learning_paths` und `learning_modules` bleiben vorerst bestehen (keine Löschung), werden aber nicht mehr aktiv genutzt.

---

## Plan 4: Budget-Planung vollumfänglich funktionsfähig

**Problem:** Budget kommt aktuell nur aus `teams.annual_budget` und wird nur passiv aggregiert. Keine echte Planungsfunktion.

**Änderungen:**
- **DB-Migration**: Neue Tabelle `budget_plans`:
  - `id`, `organization_id`, `team_id` (nullable), `year`, `quarter`
  - `planned_amount`, `allocated_amount`, `notes`
  - `created_by`, `created_at`, `updated_at`
  - RLS: org_admin kann eigene Org verwalten
- **`BudgetPage.tsx` Redesign**:
  - **Planungs-Tab**: Budget pro Team und Quartal setzen/anpassen. Inline-Edit in Tabelle.
  - **Übersicht-Tab**: Geplant vs. Ausgegeben vs. Verbleibend pro Team. Progress Bars.
  - **ROI-Tab**: Kosten pro Kompetenzpunkt, effizienteste Maßnahmen, Trend über Quartale.
- **`useBudgetPlans.ts`**: Neuer Hook für CRUD auf `budget_plans`.
- **Dashboard-KPI**: "Budget verbraucht" zeigt echte Plan-Daten statt nur `teams.annual_budget`.

---

## Plan 5: Reports-Seite → Assessment-Cycle-Logik

**Problem:** Reports sind aktuell nur eine Tabelle mit Aggregationen. Es fehlt der "Cycle"-Gedanke: Erst Assessment → dann Report freischalten.

**Änderungen:**
- **Konzept**: Jeder Report braucht zwei Datenpunkte: Baseline (Q-Start) und Endstand (Q-Ende). Ohne zweites Assessment zeigt die Seite nur "Current State".
- **DB-Migration**: Neue Tabelle `assessment_snapshots`:
  - `id`, `organization_id`, `employee_id`, `snapshot_type` ('baseline' | 'endline')
  - `quarter`, `year`, `competency_data` (jsonb — Snapshot aller Kompetenzwerte)
  - `created_at`
- **`ReportsPage.tsx` Redesign**:
  - **Phase 1 (kein Endline vorhanden)**: Zeigt "Current State" — aktuelle Levels, Gaps, laufende Maßnahmen. Button "Assessment starten" (löst Profil-Regenerierung aus).
  - **Phase 2 (Endline vorhanden)**: Voller Q-Report freigeschaltet — Delta-Analyse (Baseline → Endline), ROI pro MA, abgeschlossene Maßnahmen, Kosten.
- **Snapshot-Erstellung**: "Baseline speichern" Button am Quartalsbeginn speichert aktuellen Stand aller MA-Kompetenzen als JSON-Snapshot. "Endline Assessment" am Quartalsende triggert Re-Profiling und speichert erneut.
- **`useAssessmentSnapshots.ts`**: Neuer Hook für Snapshot-CRUD und Vergleichslogik.

---

## Plan 6: Cleanup — Mock-Daten, tote Imports, Konsistenz

**Problem:** Diverse Mock-Daten-Referenzen, ungenutzte Komponenten und inkonsistente Patterns.

**Änderungen:**
- Entferne `src/data/mockData.ts`, `src/data/competenciesData.ts`, `src/data/certificationsData.ts` falls noch referenziert.
- Entferne ungenutzte Komponenten: `GlassCard.tsx`, `ParallaxBackground.tsx`, `ScrollReveal.tsx`, `AnimatedCounter.tsx`, `AnimatedIcon.tsx`, `AnimatedProgress.tsx`, `GrowthJourneyChart.tsx`, `SwipeableRadarChart.tsx`, `CompetencyBar.tsx`.
- Entferne Employee-Self-Service-Seiten die nicht mehr zum v3-Konzept passen: `EmployeeDashboard.tsx`, `MyLearningPage.tsx`, `MySkillsPage.tsx` (gemäß v3 Strategic Pivot — reines Management-Cockpit).
- Prüfe alle Imports auf tote Referenzen.
- Stelle sicher, dass `useOrgData` keine `future_level` Mock-Fallbacks hat.

---

## Empfohlene Reihenfolge

```text
Plan 1 → Plan 2 → Plan 3 → Plan 4 → Plan 5 → Plan 6
 Gaps     Wording   Merge    Budget   Reports   Cleanup
```

Plan 1 + 2 können parallel bearbeitet werden. Plan 3 ist Voraussetzung für Plan 4 (Budget braucht konsolidierte Maßnahmen). Plan 5 baut auf 1-4 auf. Plan 6 ist abschließend.

