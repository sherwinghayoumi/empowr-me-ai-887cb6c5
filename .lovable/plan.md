

# FUTURA TEAMS v3 Migration — Schritt 1: Design-Tokens + Sidebar-Navigation + Farbsprache

## Zusammenfassung

Schritt 1 legt das visuelle und strukturelle Fundament für v3: neues Farbschema (Dark Navy + Gold, kein Glassmorphism), Severity-Tokens, Sidebar-Navigation für Org-Admin, und Routing-Umbau. Alle bestehenden Admin-Seiten werden in ein neues Sidebar-Layout eingebettet. Employee-Routen werden entfernt.

---

## Betroffene Dateien

### 1. `src/index.css` — Design-Tokens ersetzen

- Glassmorphism-Klassen entfernen: `.glass`, `.glass-card`, `.glass-strong`, `.glass-subtle`
- Severity-Tokens hinzufügen: `--severity-critical: 0 84% 60%`, `--severity-medium: 45 75% 50%`, `--severity-low: 142 71% 45%`
- Aufwändige Keyframes entfernen: `gradient-shift`, `gradient-shift-reverse`, `gradient-pulse`, `float`, `star-pulse`, `ai-sparkle-icon`, `ai-shimmer`
- Behalten: `fadeIn`, `fadeInUp`, `scaleIn`, `slideInLeft/Right`, `pulseSoft`, `skeleton-pulse`, `progress-fill`
- Hex-Pattern entfernen
- Bestehende Farb-Tokens bleiben (bereits Dark Navy + Gold)

### 2. `src/layouts/AdminLayout.tsx` — Neues Sidebar-Layout (NEU)

Neues Layout analog zu `SuperAdminLayout.tsx`:
- Sidebar (links, 280px, collapsible auf Mobile via Sheet)
- Nav-Einträge: Dashboard, Anwälte, Skill Gaps, Maßnahmen*, Budget & ROI*, Reports, Settings*
- Logo + Org-Name oben, User-Info + Logout unten
- Breadcrumbs im Header
- `<Outlet />` für Child-Routes
- *Maßnahmen, Budget, Settings: Routen existieren noch nicht → werden in späteren Schritten erstellt, Navigation zeigt sie aber schon (disabled oder als Placeholder)

### 3. `src/App.tsx` — Routing-Umbau

- Employee-Routen entfernen (`/employee`, `/employee/skills`, `/employee/learning`)
- Admin-Routen in nested Layout umbauen:
  ```
  <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
    <Route index element={<AdminDashboard />} />
    <Route path="teams" element={<TeamsPage />} />
    <Route path="employees" element={<EmployeesPage />} />
    <Route path="skill-gaps" element={<SkillGapPage />} />
    <Route path="reports" element={<ReportsPage />} />
    <Route path="reports/future-skill-matrix" element={<FutureSkillReportPage />} />
    <Route path="measures" element={<PlaceholderPage title="Maßnahmen" />} />
    <Route path="budget" element={<PlaceholderPage title="Budget & ROI" />} />
  </Route>
  ```
- Default redirect `/` → `/login` bleibt
- EmployeeDashboard, MySkillsPage, MyLearningPage Imports entfernen

### 4. Admin-Seiten anpassen (6 Dateien)

Jede Admin-Seite (`AdminDashboard`, `TeamsPage`, `EmployeesPage`, `SkillGapPage`, `ReportsPage`, `FutureSkillReportPage`):
- `<Header variant="admin" />` entfernen (Sidebar übernimmt Navigation)
- `GlassCard` → shadcn `Card` mit `className="bg-card/80 border-border/50"`
- `AnimatedCounter` → statischer Wert mit `tabular-nums` Klasse
- `ScrollReveal` → `<div className="animate-fade-in-up">` mit stagger-Klassen
- `ParallaxBackground` entfernen
- Äußeres `<div className="min-h-screen">` + `<main className="container py-8">` entfernen (Layout liefert das)

### 5. Dateien entfernen / nicht mehr importieren

- `src/components/GlassCard.tsx` — nicht mehr benötigt (kein Delete nötig, nur Imports entfernen)
- `src/components/AnimatedCounter.tsx` — nicht mehr benötigt
- `src/components/ScrollReveal.tsx` — nicht mehr benötigt
- `src/components/ParallaxBackground.tsx` — nicht mehr benötigt
- Employee-Seiten bleiben im Dateisystem, werden aber aus App.tsx entfernt
- `src/components/Header.tsx` — wird von Admin-Seiten nicht mehr verwendet

### 6. `tailwind.config.ts` — Minimal

Keine Änderungen nötig — Farb-Tokens kommen aus CSS-Variablen, die bereits korrekt sind.

---

## Technische Details

**Komponenten-Mapping (Suchen & Ersetzen):**

| Alt | Neu |
|-----|-----|
| `<GlassCard>` | `<Card className="bg-card/80 border-border/50">` |
| `<GlassCardHeader>` | `<CardHeader>` |
| `<GlassCardTitle>` | `<CardTitle>` |
| `<GlassCardContent>` | `<CardContent>` |
| `<AnimatedCounter value={n} />` | `<span className="tabular-nums">{n}</span>` |
| `<ScrollReveal delay={d}>` | `<div className="animate-fade-in-up" style={{animationDelay: `${d}ms`}}>` |
| `<ParallaxBackground />` | entfernen |
| `<Header variant="admin" />` | entfernen |

**AdminLayout Sidebar-Nav-Items:**
```typescript
[
  { label: "Dashboard",    href: "/admin",           icon: LayoutDashboard },
  { label: "Anwälte",      href: "/admin/employees", icon: Users },
  { label: "Teams",        href: "/admin/teams",     icon: Building2 },
  { label: "Skill Gaps",   href: "/admin/skill-gaps",icon: AlertTriangle },
  { label: "Maßnahmen",    href: "/admin/measures",  icon: ClipboardList },
  { label: "Budget & ROI", href: "/admin/budget",    icon: TrendingUp },
  { label: "Reports",      href: "/admin/reports",   icon: FileText },
  { label: "Settings",     href: "/admin/settings",  icon: Settings },
]
```

**Nicht anfassen:** Supabase-Client, Auth-Context, alle Hooks, Edge Functions, RLS, DB-Migrationen.

---

## Reihenfolge der Implementierung

1. `index.css` — Glassmorphism entfernen, Severity-Tokens hinzufügen
2. `AdminLayout.tsx` — Neues Sidebar-Layout erstellen
3. `App.tsx` — Routing umbauen
4. Admin-Seiten einzeln migrieren (GlassCard → Card, etc.)
5. Placeholder-Seite für `/measures` und `/budget` erstellen

