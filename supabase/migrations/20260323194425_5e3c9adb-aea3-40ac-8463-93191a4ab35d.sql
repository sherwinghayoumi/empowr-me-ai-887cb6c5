-- Add migration tracking fields to employee_competencies
-- Supports the quarterly rating migration feature (Problem 5)

ALTER TABLE public.employee_competencies
ADD COLUMN IF NOT EXISTS migrated_from TEXT DEFAULT NULL;

ALTER TABLE public.employee_competencies
ADD COLUMN IF NOT EXISTS is_deprecated BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_employee_competencies_not_deprecated 
ON public.employee_competencies (employee_id, competency_id) 
WHERE is_deprecated = FALSE;

CREATE INDEX IF NOT EXISTS idx_employee_competencies_migrated 
ON public.employee_competencies (employee_id) 
WHERE migrated_from IS NOT NULL;

COMMENT ON COLUMN public.employee_competencies.migrated_from IS 
  'Source quarter for migrated ratings, e.g. Q2_2026. NULL = original rating.';

COMMENT ON COLUMN public.employee_competencies.is_deprecated IS 
  'True if this competency no longer exists in the current quarter role profile. Preserved for history.';