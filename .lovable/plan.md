
# AI-gestützte Lernpfad-Generierung für Skill Gaps

## Übersicht

Implementierung einer kostengünstigen AI-Lösung, die Claudes internes Wissen nutzt, um für jede Skill Gap personalisierte Lernpfade mit Zertifikaten, Kursen und Ressourcen zu generieren.

**Geschätzte Kosten pro Mitarbeiter:** ~0.05-0.08€ pro Skill Gap (ca. 0.20-0.40€ für 3-5 Gaps)

---

## Architektur

```text
┌─────────────────────────────────────────────────────────────────────┐
│                        Admin: SkillGapPage                          │
│  ┌───────────────┐                                                  │
│  │ Skill Gap Card│──► "🎓 Lernpfad generieren" Button              │
│  └───────────────┘                                                  │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│              Edge Function: generate-learning-path                  │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Input:                                                      │   │
│  │  - competencyName, competencyDefinition                      │   │
│  │  - subskills[], currentLevel, targetLevel                    │   │
│  │  - employeeContext (role, experience)                        │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│                              ▼                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Claude API (Sonnet) mit strukturiertem Output:              │   │
│  │  - 3-5 empfohlene Zertifikate/Kurse                         │   │
│  │  - Lernreihenfolge & Zeitplan                               │   │
│  │  - Begründung pro Empfehlung                                │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│                              ▼                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Output: LearningPathRecommendation                          │   │
│  │  - title, description, totalDuration                         │   │
│  │  - modules[]: title, provider, url, duration, reason         │   │
│  └─────────────────────────────────────────────────────────────┘   │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       Supabase Database                             │
│  ┌─────────────────┐    ┌──────────────────┐                       │
│  │  learning_paths │───►│ learning_modules │                       │
│  │  is_ai_generated│    │ content_url      │                       │
│  │  ai_reason      │    │ duration_minutes │                       │
│  └─────────────────┘    └──────────────────┘                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Edge Function erstellen

### Neue Datei: `supabase/functions/generate-learning-path/index.ts`

**Funktionalität:**
- Empfängt Skill Gap Daten (Kompetenz, Level, Mitarbeiter-Kontext)
- Sendet strukturierten Prompt an Claude mit Tool-Calling für JSON-Output
- Gibt 3-5 Lernempfehlungen mit Metadaten zurück

**Prompt-Strategie:**
```text
Du bist ein L&D-Experte für M&A-Rechtsanwälte. Basierend auf der Skill Gap:
- Kompetenz: {name} - {definition}
- Aktuelles Level: {current}/100, Ziel: {target}/100
- Subskills mit Gaps: {subskills}
- Mitarbeiter-Rolle: {role}, Erfahrung: {years} Jahre

Empfehle 3-5 konkrete Zertifizierungen, Kurse oder Lernressourcen:
1. Priorisiere anerkannte Zertifizierungen (NCMA, PMI, CFA, etc.)
2. Berücksichtige Online-Verfügbarkeit
3. Ordne nach Reihenfolge (Basis → Fortgeschritten)
4. Gib realistische Zeitschätzungen
```

---

## Phase 2: Frontend-Integration

### Änderungen in `SkillGapCard.tsx`

**Neuer Button:** "🎓 Lernpfad generieren"

**Ablauf:**
1. Klick öffnet Bestätigungs-Dialog
2. Lädt während API-Aufruf
3. Zeigt Ergebnis-Preview mit Empfehlungen
4. "Speichern" erstellt Einträge in `learning_paths` + `learning_modules`

### Neue Komponente: `LearningPathGeneratorModal.tsx`

**Features:**
- Preview der generierten Empfehlungen
- Editierbarkeit vor dem Speichern (Module entfernen/hinzufügen)
- Kostenwarnung ("Diese Aktion kostet ca. 0.05€")
- Audit-Log Eintrag

---

## Phase 3: Batch-Generierung für Admins

### Änderungen in `SkillGapPage.tsx`

**Neuer Button:** "🚀 Alle Lernpfade generieren"

**Funktionalität:**
- Generiert Lernpfade für alle kritischen Skill Gaps (weightedGap >= 30)
- Fortschrittsanzeige mit geschätzten Kosten
- Zusammenfassung am Ende

---

## Technische Details

### TypeScript-Interfaces

```typescript
// src/types/learningPath.ts
interface LearningRecommendation {
  title: string;
  provider: string;
  description: string;
  contentUrl: string | null;
  durationMinutes: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  format: 'Online' | 'In-Person' | 'Hybrid' | 'Self-Paced';
  reason: string;
  sortOrder: number;
}

interface GeneratedLearningPath {
  title: string;
  description: string;
  totalDurationMinutes: number;
  aiRecommendationReason: string;
  modules: LearningRecommendation[];
}
```

### Edge Function Tool-Schema

```typescript
const learningPathTool = {
  name: "generate_learning_path",
  description: "Generate a structured learning path for a skill gap",
  parameters: {
    type: "object",
    properties: {
      title: { type: "string" },
      description: { type: "string" },
      modules: {
        type: "array",
        items: {
          type: "object",
          properties: {
            title: { type: "string" },
            provider: { type: "string" },
            contentUrl: { type: "string" },
            durationMinutes: { type: "number" },
            level: { type: "string", enum: ["Beginner", "Intermediate", "Advanced", "Expert"] },
            reason: { type: "string" }
          }
        }
      }
    }
  }
};
```

---

## Datenbanknutzung

**Vorhandene Tabellen werden genutzt:**

| Tabelle | Relevante Felder |
|---------|------------------|
| `learning_paths` | `is_ai_generated=true`, `ai_recommendation_reason`, `target_competency_id` |
| `learning_modules` | `title`, `content_url`, `duration_minutes`, `description` |

**Kein Schema-Migration erforderlich** - alle benötigten Felder existieren bereits.

---

## Kostenübersicht

| Aktion | Input Tokens | Output Tokens | Kosten (Sonnet) |
|--------|--------------|---------------|-----------------|
| 1 Skill Gap | ~1,500 | ~1,500 | ~0.05€ |
| 5 Skill Gaps | ~7,500 | ~7,500 | ~0.25€ |
| 10 Mitarbeiter × 5 Gaps | ~75,000 | ~75,000 | ~2.50€ |

**Optimierungen:**
- Caching: Gleiche Kompetenz → gleiche Empfehlungen (30 Tage)
- Batch-Processing: Mehrere Gaps in einem API-Call

---

## Vision für Option B (Zukunft)

```text
┌──────────────────────────────────────────────────────────────────┐
│  Zukünftige Erweiterung: Web-Recherche                          │
│                                                                  │
│  1. Integration von Perplexity/Tavily API (~0.01€/Suche)        │
│  2. Aktuelle Kurs-Verfügbarkeit & Preise                        │
│  3. Neue Zertifizierungen automatisch entdecken                 │
│  4. Regionale Anbieter finden (DE/CH/AT)                        │
│                                                                  │
│  Geschätzte Mehrkosten: +0.05-0.10€ pro Skill Gap               │
└──────────────────────────────────────────────────────────────────┘
```

---

## Implementierungsreihenfolge

1. **Edge Function** `generate-learning-path` erstellen
2. **TypeScript-Interfaces** für Lernpfad-Generierung
3. **LearningPathGeneratorModal** Komponente
4. **SkillGapCard** um Button erweitern
5. **SkillGapPage** Batch-Generierung hinzufügen
6. **Hook** `useGenerateLearningPath` für API-Aufrufe
7. **Audit-Logging** für Kostentransparenz
