-- ============================================
-- SECURITY HARDENING MIGRATION
-- Fix Function Search Paths & RLS Policy
-- ============================================

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

-- 8. update_updated_at mit search_path
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

-- ============================================
-- FIX RLS POLICY: Audit Log "Always True"
-- ============================================

-- Remove insecure "always true" policy
DROP POLICY IF EXISTS "Authenticated users can insert audit log" ON audit_log;

-- Create restrictive policy that validates user_id and organization_id
CREATE POLICY "Users can insert their own audit logs"
ON audit_log FOR INSERT
TO authenticated
WITH CHECK (
    user_id = auth.uid()
    AND organization_id = get_user_org_id()
);