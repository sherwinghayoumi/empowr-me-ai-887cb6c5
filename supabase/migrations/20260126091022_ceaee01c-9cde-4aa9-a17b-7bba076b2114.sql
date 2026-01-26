-- CRITICAL FIX: Remove duplicate employee_competencies and add unique constraint

-- Step 1: Create a temp table with distinct values (keeping the one with highest current_level)
CREATE TEMP TABLE ec_keep AS
SELECT DISTINCT ON (employee_id, competency_id) 
  id, employee_id, competency_id, current_level, demanded_level, future_level, 
  gap_to_current, gap_to_future, self_rating, manager_rating, evidence_summary, 
  evidence_sources, rating_confidence, rated_at, updated_at
FROM employee_competencies
ORDER BY employee_id, competency_id, current_level DESC NULLS LAST, updated_at DESC NULLS LAST;

-- Step 2: Delete all employee_competencies
DELETE FROM employee_competencies;

-- Step 3: Re-insert the deduplicated records
INSERT INTO employee_competencies 
SELECT * FROM ec_keep;

-- Step 4: Drop temp table
DROP TABLE ec_keep;

-- Step 5: Add unique constraint to prevent future duplicates
ALTER TABLE employee_competencies 
ADD CONSTRAINT unique_employee_competency 
UNIQUE (employee_id, competency_id);