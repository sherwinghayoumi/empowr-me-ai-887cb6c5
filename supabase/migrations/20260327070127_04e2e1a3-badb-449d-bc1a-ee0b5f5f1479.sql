
-- Add annual_budget to teams for budget tracking
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS annual_budget numeric DEFAULT 0;

COMMENT ON COLUMN public.teams.annual_budget IS 'Annual training budget in EUR for this team';
