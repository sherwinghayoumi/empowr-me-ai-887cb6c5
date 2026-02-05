-- ============================================
-- Migration: Block Anonymous Access to All Sensitive Tables
-- This ensures only authenticated users with proper roles can access data
-- ============================================

-- 1. user_profiles - Contains PII (emails, names, GDPR data)
CREATE POLICY "Deny anonymous access to user_profiles"
ON public.user_profiles
FOR ALL
TO anon
USING (false);

-- 2. employees - Contains PII (names, emails, ages, career data)
CREATE POLICY "Deny anonymous access to employees"
ON public.employees
FOR ALL
TO anon
USING (false);

-- 3. organizations - Contains business-critical subscription data
CREATE POLICY "Deny anonymous access to organizations"
ON public.organizations
FOR ALL
TO anon
USING (false);

-- 4. gdpr_requests - Contains requester emails and sensitive request data
CREATE POLICY "Deny anonymous access to gdpr_requests"
ON public.gdpr_requests
FOR ALL
TO anon
USING (false);

-- 5. certifications - Contains employee document paths and AI analysis
CREATE POLICY "Deny anonymous access to certifications"
ON public.certifications
FOR ALL
TO anon
USING (false);

-- 6. audit_log - Contains IP addresses, user agents, activity logs
CREATE POLICY "Deny anonymous access to audit_log"
ON public.audit_log
FOR ALL
TO anon
USING (false);

-- 7. teams - Contains organization team structures
CREATE POLICY "Deny anonymous access to teams"
ON public.teams
FOR ALL
TO anon
USING (false);

-- 8. learning_paths - Contains employee learning data
CREATE POLICY "Deny anonymous access to learning_paths"
ON public.learning_paths
FOR ALL
TO anon
USING (false);

-- 9. learning_modules - Contains learning content linked to employees
CREATE POLICY "Deny anonymous access to learning_modules"
ON public.learning_modules
FOR ALL
TO anon
USING (false);

-- 10. employee_competencies - Contains employee skill assessments
CREATE POLICY "Deny anonymous access to employee_competencies"
ON public.employee_competencies
FOR ALL
TO anon
USING (false);

-- 11. employee_subskills - Contains detailed employee skill data
CREATE POLICY "Deny anonymous access to employee_subskills"
ON public.employee_subskills
FOR ALL
TO anon
USING (false);

-- 12. content_changelog - Contains admin change history
CREATE POLICY "Deny anonymous access to content_changelog"
ON public.content_changelog
FOR ALL
TO anon
USING (false);

-- 13. quarterly_reports - Contains executive reports (public ones already handled separately)
CREATE POLICY "Deny anonymous access to quarterly_reports"
ON public.quarterly_reports
FOR ALL
TO anon
USING (false);