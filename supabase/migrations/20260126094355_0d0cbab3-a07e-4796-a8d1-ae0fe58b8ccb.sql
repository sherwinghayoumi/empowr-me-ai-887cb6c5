-- Add unique constraint on employee_competencies to prevent future duplicates
-- First check if it exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'unique_employee_competency'
  ) THEN
    ALTER TABLE employee_competencies
    ADD CONSTRAINT unique_employee_competency 
    UNIQUE (employee_id, competency_id);
  END IF;
END $$;

-- Add unique constraint on employee_subskills if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'unique_employee_subskill'
  ) THEN
    ALTER TABLE employee_subskills
    ADD CONSTRAINT unique_employee_subskill 
    UNIQUE (employee_id, subskill_id);
  END IF;
END $$;