
# Sicherheitsplan: Alle Warnungen beheben

## Übersicht der Sicherheitsprobleme

| Priorität | Problem | Anzahl | Risiko |
|-----------|---------|--------|--------|
| 🔴 Kritisch | Function Search Path Mutable | 8 Funktionen | Schema-Hijacking möglich |
| 🔴 Kritisch | RLS Policy "Always True" | 1 Policy | Jeder kann Audit-Logs einfügen |
| 🟡 Mittel | Leaked Password Protection | 1 Einstellung | Kompromittierte Passwörter erlaubt |

---

## Teil 1: Function Search Path Mutable beheben

### Problem
8 Datenbank-Funktionen haben keinen festen `search_path`. Ein Angreifer könnte einen eigenen Schema mit gleichnamigen Tabellen erstellen und die Funktionen manipulieren.

### Betroffene Funktionen

| Funktion | Security Definer | Status |
|----------|------------------|--------|
| `handle_new_user()` | Ja | ✅ Bereits gefixt |
| `calculate_employee_score()` | Ja | ❌ Muss gefixt werden |
| `update_team_stats()` | Ja | ❌ Muss gefixt werden |
| `is_org_admin()` | Ja | ❌ Muss gefixt werden |
| `get_user_org_id()` | Ja | ❌ Muss gefixt werden |
| `get_user_role()` | Ja | ❌ Muss gefixt werden |
| `is_super_admin()` | Ja | ❌ Muss gefixt werden |
| `log_audit_event()` | Ja | ❌ Muss gefixt werden |
| `update_updated_at()` | Nein | ❌ Muss gefixt werden |

### Lösung: SQL Migration

```sql
-- 1. calculate_employee_score mit search_path
CREATE OR REPLACE FUNCTION public.calculate_employee_score(p_employee_id uuid)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    avg_score NUMERIC;
BEGIN
    SELECT AVG(current_level) INTO avg_score
    FROM employee_competencies
    WHERE employee_id = p_employee_id;
    
    UPDATE employees SET overall_score = COALESCE(avg_score, 0)
    WHERE id = p_employee_id;
    
    RETURN COALESCE(avg_score, 0);
END;
$$;

-- 2. update_team_stats mit search_path
CREATE OR REPLACE FUNCTION public.update_team_stats(p_team_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE teams SET
        member_count = (SELECT COUNT(*) FROM employees WHERE team_id = p_team_id AND is_active = TRUE),
        average_score = (SELECT AVG(overall_score) FROM employees WHERE team_id = p_team_id AND is_active = TRUE),
        updated_at = NOW()
    WHERE id = p_team_id;
END;
$$;

-- 3. is_org_admin mit search_path
CREATE OR REPLACE FUNCTION public.is_org_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role = 'org_admin' FROM user_profiles WHERE id = auth.uid()
$$;

-- 4. get_user_org_id mit search_path
CREATE OR REPLACE FUNCTION public.get_user_org_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id FROM user_profiles WHERE id = auth.uid()
$$;

-- 5. get_user_role mit search_path
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM user_profiles WHERE id = auth.uid()
$$;

-- 6. is_super_admin mit search_path
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(is_super_admin, FALSE) FROM user_profiles WHERE id = auth.uid()
$$;

-- 7. log_audit_event mit search_path
CREATE OR REPLACE FUNCTION public.log_audit_event(
    p_action text,
    p_entity_type text,
    p_entity_id uuid,
    p_old_values jsonb DEFAULT NULL,
    p_new_values jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO audit_log (user_id, organization_id, action, entity_type, entity_id, old_values, new_values)
    VALUES (
        auth.uid(),
        get_user_org_id(),
        p_action,
        p_entity_type,
        p_entity_id,
        p_old_values,
        p_new_values
    );
END;
$$;

-- 8. update_updated_at mit search_path (kein SECURITY DEFINER nötig)
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;
```

---

## Teil 2: RLS Policy "Always True" beheben

### Problem
Die Policy `Authenticated users can insert audit log` auf der `audit_log` Tabelle verwendet `WITH CHECK (true)`. Das bedeutet:
- Jeder authentifizierte Benutzer kann beliebige Audit-Log-Einträge erstellen
- Benutzer könnten falsche `user_id`, `organization_id` oder `action` Werte einfügen
- Audit-Trail könnte manipuliert werden

### Aktuelle Policy
```sql
-- UNSICHER: Jeder kann alles einfügen
CREATE POLICY "Authenticated users can insert audit log"
ON audit_log FOR INSERT
WITH CHECK (true);
```

### Lösung

**Option A: Nur über Security Definer Funktion (Empfohlen)**
```sql
-- 1. Alte Policy löschen
DROP POLICY IF EXISTS "Authenticated users can insert audit log" ON audit_log;

-- 2. Neue restriktive Policy
CREATE POLICY "System can insert audit log via function"
ON audit_log FOR INSERT
WITH CHECK (
    -- Nur erlauben wenn user_id dem aktuellen Benutzer entspricht
    user_id = auth.uid()
    AND
    -- organization_id muss zur Benutzer-Organisation passen
    organization_id = get_user_org_id()
);
```

**Option B: Komplett über Funktion (strenger)**
```sql
-- Alle direkten INSERTs verbieten, nur über log_audit_event() Funktion
DROP POLICY IF EXISTS "Authenticated users can insert audit log" ON audit_log;

-- Keine INSERT Policy = keine direkten Inserts möglich
-- log_audit_event() ist SECURITY DEFINER und umgeht RLS
```

---

## Teil 3: Leaked Password Protection aktivieren

### Problem
Benutzer können Passwörter verwenden, die in bekannten Datenlecks vorkommen (z.B. "password123", "qwerty").

### Lösung

Dies ist eine **manuelle Einstellung** im Supabase Dashboard:

1. Öffne das Supabase Dashboard
2. Gehe zu **Authentication** → **Providers** → **Email**
3. Aktiviere **Leaked Password Protection**

### Alternative: Per SQL (falls unterstützt)
```sql
-- Nicht direkt per SQL möglich - muss im Dashboard aktiviert werden
```

---

## Zusammenfassung der Änderungen

### Migration 1: Function Search Paths (automatisch)
- 8 Funktionen werden mit `SET search_path = public` aktualisiert
- Keine Breaking Changes
- Rückwärtskompatibel

### Migration 2: Audit Log RLS Policy (automatisch)
- Alte "Always True" Policy wird gelöscht
- Neue Policy validiert `user_id` und `organization_id`
- Bestehende `log_audit_event()` Funktion funktioniert weiter

### Dashboard-Einstellung (manuell)
- Leaked Password Protection im Supabase Dashboard aktivieren

---

## Technische Details

### Warum `SET search_path = public`?

Ohne festen `search_path` sucht PostgreSQL Tabellen in dieser Reihenfolge:
1. `"$user"` Schema (benutzerspezifisch)
2. `public` Schema

Ein Angreifer mit Datenbankzugriff könnte:
```sql
CREATE SCHEMA hacker;
CREATE TABLE hacker.user_profiles (id uuid, is_super_admin boolean DEFAULT true);
SET search_path = hacker, public;
-- Jetzt gibt is_super_admin() TRUE zurück!
```

Mit `SET search_path = public` ist die Funktion auf das `public` Schema fixiert.

### Warum Audit Log Policy ändern?

Aktuell kann ein Angreifer:
```typescript
// Gefälschten Audit-Eintrag erstellen
await supabase.from('audit_log').insert({
    user_id: 'andere-user-id',
    action: 'delete_all_data',
    entity_type: 'organization'
});
```

Mit der neuen Policy wird validiert, dass `user_id = auth.uid()`.

---

## Erwartetes Ergebnis nach Implementierung

| Problem | Vorher | Nachher |
|---------|--------|---------|
| Function Search Path | 8 Warnungen | 0 Warnungen |
| RLS Always True | 1 Warnung | 0 Warnungen |
| Leaked Password | Deaktiviert | Aktiviert |

**Gesamtstatus: Von 10 Warnungen auf 0 Warnungen**
