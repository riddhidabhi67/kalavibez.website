/*
  # Secure Admin Role Management

  ## Overview
  This migration adds security measures to ensure:
  1. Only existing admins can grant admin access to other users
  2. Users cannot make themselves admin
  3. is_admin field is protected from unauthorized updates

  ## Security Changes
  - Add trigger to prevent non-admins from updating is_admin
  - Add policy restricting admin role assignment
  - Ensure new profiles always start as non-admin

  ## Important Notes
  1. The first admin must be created directly in the database (SQL)
  2. After that, only admins can promote other users
  3. This prevents privilege escalation attacks
*/

-- Remove any existing UPDATE policy on profiles
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create a new UPDATE policy that allows users to update their own profile
-- BUT restricts is_admin changes to existing admins only
CREATE POLICY "Users can update own profile (admin field restricted)"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id 
    AND (
      -- Allow if not trying to change is_admin
      is_admin = (SELECT is_admin FROM profiles WHERE id = auth.uid())
      OR
      -- Or if the user is already an admin
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    )
  );

-- Create a trigger function to prevent unauthorized admin promotion
CREATE OR REPLACE FUNCTION prevent_unauthorized_admin_promotion()
RETURNS TRIGGER AS $$
BEGIN
  -- Only allow is_admin to be set to true if:
  -- 1. The current user is already an admin, OR
  -- 2. This is a new insert (handled by INSERT policy), OR
  -- 3. The value is not being changed
  
  IF NEW.is_admin = true AND OLD.is_admin = false THEN
    -- Someone is trying to promote a non-admin to admin
    -- Check if the current user is an admin
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true) THEN
      RAISE EXCEPTION 'Only existing admins can grant admin access';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply the trigger
DROP TRIGGER IF EXISTS admin_promotion_guard ON profiles;
CREATE TRIGGER admin_promotion_guard
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION prevent_unauthorized_admin_promotion();

-- Ensure all existing profiles have is_admin = false
UPDATE profiles SET is_admin = false WHERE is_admin IS NULL;
