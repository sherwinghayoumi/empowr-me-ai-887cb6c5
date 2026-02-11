

## Plan: Kritische Bugs und UX-Verbesserungen aus dem HR-Walkthrough

Basierend auf dem ausfuehrlichen Walkthrough als tech-getriebene Head of HR habe ich 13 Befunde identifiziert. Hier ist der priorisierte Fix-Plan fuer die kritischsten Probleme:

### Phase 1: Kritische Bugs (sofort)

#### 1. Logo-Link reparieren
Das Logo in der Navigation linkt auf `/`, was zu `/login` redirected und damit eingeloggte User effektiv ausloggt.
- **Datei**: `src/components/Header.tsx`
- **Fix**: Logo-Link dynamisch setzen basierend auf `variant` prop (`/admin` fuer Admin, `/employee` fuer Employee)

#### 2. Employee-Nav-Label korrigieren
"My Skill Gaps" linkt zu `/employee/learning` (Lernpfade-Seite) -- das Label stimmt nicht mit dem Inhalt ueberein.
- **Datei**: `src/components/Header.tsx`
- **Fix**: Label auf "My Learning" oder "Meine Lernpfade" aendern

#### 3. Komplette Sprachvereinheitlichung auf Deutsch
Navigation, Stats-Cards, Seitentitel und Labels durchgaengig auf Deutsch umstellen. Betroffen:
- `src/components/Header.tsx` -- Nav-Labels
- `src/pages/AdminDashboard.tsx` -- Stat-Cards, Sektions-Ueberschriften
- `src/pages/admin/SkillGapPage.tsx` -- alle Labels
- `src/components/EmployeeProfile.tsx` -- gemischte Labels

### Phase 2: UX-Verbesserungen (diese Woche)

#### 4. GDPR-Consent: Daten nicht vorladen
Statt die App geblurrt im Hintergrund zu rendern (wobei Daten im DOM sichtbar sind), sollte bei fehlendem GDPR-Consent NUR das Modal gezeigt werden -- ohne die eigentlichen Seiteninhalte zu laden.
- **Datei**: `src/components/ProtectedRoute.tsx`
- **Fix**: `children` nicht rendern wenn Consent fehlt, nur Modal + leeren Hintergrund anzeigen

### Phase 3: Feature-Luecken (naechste Sprints)

Die folgenden wurden identifiziert, sind aber nicht als sofortige Fixes geplant:
- ROI als eigener Navigationspunkt
- Profil-/Settings-Seite fuer eingeloggte User (Passwort aendern)
- Export-Funktionen (CSV/PDF)
- Team-Filter auf dem Dashboard
- Suchfunktion auf der Skill-Gap-Seite
- Team-Karten mit Kompetenz-Cluster-Aufschluesselung

### Technische Details

| Datei | Aenderung | Prioritaet |
|---|---|---|
| `src/components/Header.tsx` | Logo-Link dynamisch, Nav-Labels Deutsch, Employee-Label-Fix | Kritisch |
| `src/pages/AdminDashboard.tsx` | Alle Stat-Labels auf Deutsch | Kritisch |
| `src/pages/admin/SkillGapPage.tsx` | Alle Labels auf Deutsch | Kritisch |
| `src/components/ProtectedRoute.tsx` | GDPR: children nicht rendern bei fehlendem Consent | Hoch |

### Nicht-technische Empfehlungen

- Einheitliche Sprachkonvention als Regel festlegen (komplett Deutsch fuer DACH-Markt)
- Feature-Requests (Export, Settings-Seite, Team-Drill-Down) in Backlog aufnehmen

