-- AGGRESSIVE FIX: Remove ALL duplicate employee_competencies

-- Step 1: Identify IDs to keep (one per employee_id + competency_id, with highest current_level)
WITH ranked AS (
  SELECT id, 
         ROW_NUMBER() OVER (
           PARTITION BY employee_id, competency_id 
           ORDER BY current_level DESC NULLS LAST, updated_at DESC NULLS LAST
         ) as rn
  FROM employee_competencies
)
DELETE FROM employee_competencies 
WHERE id IN (SELECT id FROM ranked WHERE rn > 1);

-- Step 2: Verify unique constraint exists, if not add it
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