-- Phase 1: Cleanup duplicate employee_subskills and add unique constraint

-- Step 1: Remove duplicates keeping only the most recent entry per (employee_id, subskill_id)
DELETE FROM employee_subskills a
USING employee_subskills b
WHERE a.id < b.id 
  AND a.employee_id = b.employee_id 
  AND a.subskill_id = b.subskill_id;

-- Step 2: Add unique constraint to prevent future duplicates
ALTER TABLE employee_subskills 
ADD CONSTRAINT unique_employee_subskill 
UNIQUE (employee_id, subskill_id);