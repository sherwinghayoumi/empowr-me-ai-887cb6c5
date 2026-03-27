
-- Measures table for tracking training/development activities
CREATE TABLE public.measures (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  measure_type text NOT NULL DEFAULT 'seminar',
  provider text,
  cost numeric DEFAULT 0,
  duration_hours numeric,
  status text NOT NULL DEFAULT 'planned',
  assigned_employee_ids uuid[] DEFAULT '{}',
  assigned_team_id uuid REFERENCES public.teams(id) ON DELETE SET NULL,
  linked_competency_ids uuid[] DEFAULT '{}',
  start_date date,
  end_date date,
  completed_at timestamp with time zone,
  created_by uuid REFERENCES public.user_profiles(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.measures ENABLE ROW LEVEL SECURITY;

-- Org admin can manage measures
CREATE POLICY "Org admin can manage measures"
  ON public.measures
  FOR ALL
  TO authenticated
  USING (
    (organization_id = get_user_org_id()) AND (is_org_admin() OR is_super_admin())
  );

-- Super admin can manage all measures
CREATE POLICY "Super admin can manage all measures"
  ON public.measures
  FOR ALL
  TO authenticated
  USING (is_super_admin());

-- Deny anonymous access
CREATE POLICY "Deny anonymous access to measures"
  ON public.measures
  FOR ALL
  TO anon
  USING (false);

-- Updated_at trigger
CREATE TRIGGER update_measures_updated_at
  BEFORE UPDATE ON public.measures
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

COMMENT ON TABLE public.measures IS 'Training and development measures linked to skill gaps';
COMMENT ON COLUMN public.measures.measure_type IS 'Type: seminar, mentoring, course, workshop, conference, certification, self-study';
COMMENT ON COLUMN public.measures.status IS 'Status: planned, active, completed, cancelled';
COMMENT ON COLUMN public.measures.cost IS 'Total cost in EUR';
COMMENT ON COLUMN public.measures.linked_competency_ids IS 'Competency IDs this measure addresses';
