-- Add RLS policies for learning_modules to allow org_admin to manage them
CREATE POLICY "Org admin can manage learning modules" 
ON public.learning_modules 
FOR ALL 
USING (
  learning_path_id IN (
    SELECT lp.id FROM learning_paths lp
    JOIN employees e ON lp.employee_id = e.id
    WHERE e.organization_id = get_user_org_id()
  ) AND (is_org_admin() OR is_super_admin())
);

-- Also allow employees to update their own modules (for marking as complete)
CREATE POLICY "Employee can update own modules" 
ON public.learning_modules 
FOR UPDATE 
USING (
  learning_path_id IN (
    SELECT id FROM learning_paths 
    WHERE employee_id = (SELECT employee_id FROM user_profiles WHERE id = auth.uid())
  )
);