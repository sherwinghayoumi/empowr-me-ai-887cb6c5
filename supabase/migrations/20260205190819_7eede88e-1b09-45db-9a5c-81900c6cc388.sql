-- Add team customization columns
ALTER TABLE public.teams 
ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '#6366f1',
ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT 'users',
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 0;

-- Add team-specific role to employees
ALTER TABLE public.employees
ADD COLUMN IF NOT EXISTS team_role TEXT;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_teams_organization_archived 
ON public.teams(organization_id, is_archived);

-- Comment for documentation
COMMENT ON COLUMN public.teams.color IS 'Hex color code for team visualization';
COMMENT ON COLUMN public.teams.icon IS 'Lucide icon name for team';
COMMENT ON COLUMN public.teams.tags IS 'Array of tags for categorization';
COMMENT ON COLUMN public.teams.priority IS 'Display priority/order';
COMMENT ON COLUMN public.employees.team_role IS 'Role within the team (e.g., Team Lead, Senior, Junior)';