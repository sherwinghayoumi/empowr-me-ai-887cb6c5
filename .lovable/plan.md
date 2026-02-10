

# Generate-Profile zurück auf Anthropic + Timeout-Fix

## Zusammenfassung
Die `generate-profile` Edge Function wird zurück auf die Anthropic API (Claude Sonnet) umgestellt, da ihr den API-Key bereits habt und Claude bei strukturiertem JSON-Output zuverlässiger ist. Das Timeout-Problem wird durch Prompt-Komprimierung gelöst.

## Warum Anthropic besser passt
- Konsistenz: `analyze-certificate` und `generate-learning-path` nutzen bereits Anthropic
- Qualität: Claude ist stärker bei exaktem JSON-Mapping mit deutschen Kompetenz-Namen
- Kosten: Kein zusätzlicher Lovable-Credits-Verbrauch

## Technische Umsetzung

### 1. API-Aufruf zurück auf Anthropic umstellen
- Endpoint: `https://api.anthropic.com/v1/messages`
- Auth: `ANTHROPIC_API_KEY` (bereits konfiguriert)
- Response-Parsing zurück auf `data.content[0].text`

### 2. Prompt-Komprimierung gegen Timeout
Das System-Prompt enthält aktuell das vollständige Kompetenz-Schema mit Beschreibungen. Die Optimierungen:
- Kompetenz-Beschreibungen aus dem Schema entfernen (nur Namen sind relevant für Matching)
- Redundante Anweisungen im System-Prompt kürzen
- `max_tokens` auf 10000 setzen (Kompromiss zwischen Vollständigkeit und Speed)

### 3. Betroffene Datei
- `supabase/functions/generate-profile/index.ts`:
  - API-Endpoint, Headers und Response-Parsing zurück auf Anthropic
  - System-Prompt straffen: Schema nur als Name-Liste statt mit Beschreibungen
  - Redundante Prompt-Abschnitte zusammenfassen
- Edge Function neu deployen

