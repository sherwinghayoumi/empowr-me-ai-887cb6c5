
-- Add document storage paths and profile update tracking to employees
ALTER TABLE public.employees
  ADD COLUMN IF NOT EXISTS cv_storage_path TEXT,
  ADD COLUMN IF NOT EXISTS self_assessment_path TEXT,
  ADD COLUMN IF NOT EXISTS manager_assessment_path TEXT,
  ADD COLUMN IF NOT EXISTS profile_last_updated_at TIMESTAMP WITH TIME ZONE;

-- Add storage policies for documents bucket (already exists)
-- Allow org admins to upload documents for their org employees
CREATE POLICY "Org admin can upload documents"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'documents'
  AND auth.uid() IS NOT NULL
  AND (is_org_admin() OR is_super_admin())
);

-- Allow org admins to read documents
CREATE POLICY "Org admin can read documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'documents'
  AND auth.uid() IS NOT NULL
  AND (is_org_admin() OR is_super_admin())
);

-- Allow org admins to update/overwrite documents
CREATE POLICY "Org admin can update documents"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'documents'
  AND auth.uid() IS NOT NULL
  AND (is_org_admin() OR is_super_admin())
);
