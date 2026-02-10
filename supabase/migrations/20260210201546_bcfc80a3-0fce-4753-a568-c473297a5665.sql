-- Allow super admins to update any user profile
CREATE POLICY "Super admin can update all profiles"
ON public.user_profiles
FOR UPDATE
USING (is_super_admin())
WITH CHECK (is_super_admin());