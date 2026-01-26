-- PHASE 1.1: Aggressive Duplikat-Bereinigung in employee_competencies
-- Behalte nur den Eintrag mit der höchsten Bewertung pro Employee/Competency

WITH ranked AS (
  SELECT 
    id,
    employee_id,
    competency_id,
    current_level,
    ROW_NUMBER() OVER (
      PARTITION BY employee_id, competency_id
      ORDER BY 
        current_level DESC NULLS LAST,
        updated_at DESC NULLS LAST
    ) as rn
  FROM employee_competencies
)
DELETE FROM employee_competencies
WHERE id IN (SELECT id FROM ranked WHERE rn > 1);

-- PHASE 1.2: Deprecated Competencies aus employee_competencies entfernen
DELETE FROM employee_competencies
WHERE competency_id IN (
  SELECT id FROM competencies WHERE status = 'deprecated'
);

-- PHASE 1.2b: Markiere veraltete MLA Competencies als deprecated
UPDATE competencies
SET status = 'deprecated', updated_at = now()
WHERE name IN (
  'Basic ''Black Letter'' Research Memos',
  'Creating Signature Packets (Manual)',
  'Manual Cross-Reference Checking',
  'Manual Document Review (Linear)',
  'Routine NDA Review'
) AND status != 'deprecated';

-- Verify: Unique Constraint existiert bereits (nur Info-Check)
-- Falls nicht vorhanden, würde dies einen Fehler werfen bei Duplikaten