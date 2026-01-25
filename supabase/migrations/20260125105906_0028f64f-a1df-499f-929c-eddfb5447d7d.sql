-- Add unique constraints for upsert operations in role profile import

-- Unique constraint for role_profiles (role_key + quarter + year)
ALTER TABLE public.role_profiles
ADD CONSTRAINT role_profiles_role_key_quarter_year_unique 
UNIQUE (role_key, quarter, year);

-- Unique constraint for competency_clusters (name + quarter + year)
ALTER TABLE public.competency_clusters
ADD CONSTRAINT competency_clusters_name_quarter_year_unique 
UNIQUE (name, quarter, year);

-- Unique constraint for competencies (role_profile_id + name)
ALTER TABLE public.competencies
ADD CONSTRAINT competencies_role_profile_name_unique 
UNIQUE (role_profile_id, name);

-- Unique constraint for subskills (competency_id + name)
ALTER TABLE public.subskills
ADD CONSTRAINT subskills_competency_name_unique 
UNIQUE (competency_id, name);

-- Unique constraint for employee_competencies (employee_id + competency_id)
ALTER TABLE public.employee_competencies
ADD CONSTRAINT employee_competencies_employee_competency_unique 
UNIQUE (employee_id, competency_id);