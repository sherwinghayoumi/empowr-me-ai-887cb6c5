
# Implementierung: Perplexity Web-Recherche für verifizierte Kurs-URLs

## Übersicht

Erweiterung der AI-Lernpfad-Generierung um Echtzeit-Web-Recherche via Perplexity API. Nach der Claude-Generierung werden die empfohlenen Kurse/Zertifikate automatisch im Web verifiziert und mit aktuellen URLs angereichert.

---

## Änderungen

### 1. Edge Function erweitern

**Datei:** `supabase/functions/generate-learning-path/index.ts`

Änderungen:
- Perplexity API Key aus Secrets laden
- Nach Claude-Generierung: Parallel-Verifizierung aller Module
- Für jedes Modul: Perplexity-Suchanfrage mit Domain-Filter
- URL aus Antwort extrahieren oder Fallback-Suchlink generieren
- Neue Felder `isUrlVerified` und `verifiedUrl` zurückgeben

```text
Ablauf:
┌──────────────────────────────────────────────────┐
│  1. Claude generiert 3-5 Empfehlungen            │
│                     ↓                            │
│  2. Parallel: Perplexity-Suche pro Modul         │
│     → Query: "{Titel} {Provider} course URL"     │
│                     ↓                            │
│  3. URL extrahieren oder Fallback-Link erzeugen  │
│                     ↓                            │
│  4. Angereicherte Module zurückgeben             │
└──────────────────────────────────────────────────┘
```

### 2. TypeScript-Interface erweitern

**Datei:** `src/types/learningPath.ts`

Neue Felder im `LearningRecommendation` Interface:
- `verifiedUrl: string | null` - Die verifizierte URL von Perplexity
- `isUrlVerified: boolean` - Flag ob URL verifiziert wurde
- `searchFallbackUrl: string | null` - Fallback-Suchlink zum Provider

### 3. UI-Anpassungen

**Datei:** `src/components/LearningPathGeneratorModal.tsx`

Änderungen:
- Verifizierte URLs mit grünem Häkchen (✓) markieren
- Nicht-verifizierte URLs als "Auf {Provider} suchen" anzeigen
- Unterschiedliche Icons für verifiziert vs. Suche
- Tooltip mit Info ob URL verifiziert wurde

---

## Technische Details

### Perplexity API Aufruf

```typescript
const verifyModuleUrl = async (title: string, provider: string): Promise<{
  verifiedUrl: string | null;
  isVerified: boolean;
}> => {
  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'sonar',
      messages: [{
        role: 'user',
        content: `Find the official URL for "${title}" by ${provider}. Return ONLY the URL.`
      }],
      search_domain_filter: [
        'coursera.org', 'linkedin.com', 'udemy.com', 
        'pmi.org', 'edx.org', 'pluralsight.com'
      ],
    }),
  });
  // ...
};
```

### Fallback-Suchlinks

Wenn Perplexity keine direkte URL findet:

| Provider | Fallback-URL |
|----------|--------------|
| Coursera | `coursera.org/search?query={title}` |
| LinkedIn Learning | `linkedin.com/learning/search?keywords={title}` |
| Udemy | `udemy.com/courses/search/?q={title}` |
| PMI | `pmi.org/certifications` |
| Andere | Google-Suche |

---

## Dateien die geändert werden

1. `supabase/functions/generate-learning-path/index.ts` - Perplexity Integration
2. `src/types/learningPath.ts` - Neue Interface-Felder
3. `src/components/LearningPathGeneratorModal.tsx` - UI für verifizierte/nicht-verifizierte URLs

---

## Erwartetes Ergebnis

Nach der Implementierung:
- Generierte Lernpfade zeigen verifizierte URLs mit grünem Häkchen
- Nicht verifizierbare Kurse zeigen "Auf {Provider} suchen" Button
- Keine toten Links mehr in den Empfehlungen
