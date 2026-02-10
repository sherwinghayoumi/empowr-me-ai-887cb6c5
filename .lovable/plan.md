

# Plan: Organisations-Zuweisung, Demo-Mitarbeiter und Org-Name im Dashboard

## Ausgangslage
- Beide Org-Admins (Test_User_Admin und s.ghayoumi) sind derzeit der gleichen Organisation "Test_Kanzlei" zugewiesen
- Die Organisation "Wendelstein-DEMO" existiert bereits, hat aber keine Mitarbeiter und keinen zugewiesenen Org-Admin
- Im Admin-Dashboard wird der Organisationsname bereits angezeigt (existiert schon in `AdminDashboard.tsx`)

## Was wird gemacht

### 1. Super-Admin User-Tabelle: Organisations-Dropdown direkt in der Tabelle
In der Super-Admin Users-Seite (`Users.tsx`) wird die Organisations-Spalte zu einem **inline-editierbaren Dropdown** erweitert. Statt nur den Org-Namen anzuzeigen, kann der Super-Admin direkt in der Tabelle per Klick die Organisation eines Users umschalten -- ohne den Detail-Dialog offnen zu mussen.

**Technische Umsetzung:**
- Neue Komponente `InlineOrgSelect` in `Users.tsx`, die bei Klick auf die Org-Zelle ein `Select`-Dropdown zeigt
- Bei Auswahl wird `updateUser` mit der neuen `organization_id` aufgerufen
- Visuelles Feedback via Toast-Nachricht

### 2. Org-Admin s.ghayoumi der Organisation "Wendelstein-DEMO" zuweisen
- SQL UPDATE via Insert-Tool: `user_profiles` fur User `19036f2a-...` auf `organization_id = '7ee02750-...'` (Wendelstein-DEMO) setzen
- Damit sehen die beiden Org-Admins sofort unterschiedliche Dashboards

### 3. Demo-Mitarbeiter fur Wendelstein-DEMO erstellen
5 Demo-Mitarbeiter werden in die `employees`-Tabelle eingefugt mit der `organization_id` von Wendelstein-DEMO:

| Name | Rolle | Score |
|------|-------|-------|
| Laura Weber | Senior Associate | 72 |
| Maximilian Richter | Associate | 58 |
| Sophie Braun | Junior Associate | 45 |
| Tobias Fischer | Partner | 85 |
| Elena Hoffmann | Senior Associate | 68 |

### 4. Org-Name im Admin-Dashboard prominenter anzeigen
Der Organisationsname wird bereits angezeigt (Zeile 117-129 in AdminDashboard.tsx). Hier wird der Header-Bereich erweitert:
- Subscription-Status Badge neben dem Org-Namen
- Mitarbeiter- und Team-Zahlen direkt im Header sichtbar

## Betroffene Dateien

| Datei | Anderung |
|-------|----------|
| `src/pages/super-admin/Users.tsx` | Inline-Org-Select in Tabelle |
| `src/pages/AdminDashboard.tsx` | Erweiterter Org-Header mit Status-Badge |
| Datenbank (Insert-Tool) | User-Zuweisung + 5 Demo-Mitarbeiter |

## Reihenfolge
1. Daten-Operationen: User umhangen + Demo-Mitarbeiter erstellen
2. Users.tsx: Inline-Org-Dropdown in Tabelle
3. AdminDashboard.tsx: Header-Erweiterung

