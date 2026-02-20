-- Add birth_date column to employees table
ALTER TABLE public.employees 
ADD COLUMN IF NOT EXISTS birth_date date;

-- Migrate existing age data: set a rough birth_date based on age (approximate, year only)
-- We can't do exact dates, so existing data will just have birth_date = NULL
-- Users will need to update via the form going forward

COMMENT ON COLUMN public.employees.birth_date IS 'Date of birth - age is calculated dynamically from this field';