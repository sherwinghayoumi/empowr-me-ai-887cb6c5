-- Rename existing "Senior Associate / Counsel" to "Senior Associate (SA)"
UPDATE role_profiles 
SET role_title = 'Senior Associate (SA)', 
    role_key = 'senior_associate_(sa)'
WHERE id = 'febb67ed-e144-4d45-8ca5-e33b456a0318';

-- Create a new empty Counsel role profile
INSERT INTO role_profiles (role_key, role_title, quarter, year, practice_group, market_segment, experience_level, is_active, is_published, created_by)
SELECT 
  'counsel',
  'Counsel',
  quarter,
  year,
  practice_group,
  market_segment,
  '8-12 years PQE',
  true,
  false,
  created_by
FROM role_profiles 
WHERE id = 'febb67ed-e144-4d45-8ca5-e33b456a0318';