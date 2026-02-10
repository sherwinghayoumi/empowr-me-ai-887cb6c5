-- Fix 1: Set NB-rated competencies (evidence says "Keine") to NULL instead of 0
UPDATE employee_competencies
SET current_level = NULL
WHERE current_level = 0
  AND rating_confidence = 'LOW'
  AND evidence_summary ILIKE 'Keine%';

-- Fix 2: Set NB-rated subskills (evidence says "Keine") to NULL instead of 0
UPDATE employee_subskills
SET current_level = NULL
WHERE current_level = 0
  AND evidence ILIKE 'Keine%';

-- Fix 3: Recalculate competency levels from subskill averages where subskills have real data
-- This fixes Thomas Friedeberg's M&A Project Management (subskills=80,80,60,60 but competency=0)
UPDATE employee_competencies ec
SET current_level = sub_avg.avg_level,
    updated_at = NOW()
FROM (
  SELECT es.employee_id, s.competency_id, 
         ROUND(AVG(es.current_level)) as avg_level
  FROM employee_subskills es
  JOIN subskills s ON s.id = es.subskill_id
  WHERE es.current_level IS NOT NULL
  GROUP BY es.employee_id, s.competency_id
  HAVING COUNT(es.current_level) > 0
) sub_avg
WHERE ec.employee_id = sub_avg.employee_id
  AND ec.competency_id = sub_avg.competency_id
  AND (ec.current_level IS NULL OR ec.current_level = 0)
  AND sub_avg.avg_level > 0;