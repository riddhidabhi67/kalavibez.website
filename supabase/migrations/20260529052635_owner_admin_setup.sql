/*
  # Create Owner Admin Account Setup

  ## Overview
  This prepares the system for the owner to sign up and become admin.
  
  ## Instructions for Owner Setup
  1. Go to the website and click "Sign In"
  2. Create account with email: kala.vibez.art@gmail.com
  3. After signup, run the script below to set as admin

  ## Alternative: Direct Admin Creation
  Run this SQL AFTER the owner signs up:
  
  UPDATE profiles 
  SET is_admin = true 
  WHERE id = (
    SELECT id FROM auth.users 
    WHERE email = 'kala.vibez.art@gmail.com'
  );
*/

-- Create a function to auto-promote owner to admin
CREATE OR REPLACE FUNCTION promote_owner_to_admin()
RETURNS void AS $$
BEGIN
  UPDATE profiles 
  SET is_admin = true 
  WHERE id = (
    SELECT id FROM auth.users 
    WHERE email = 'kala.vibez.art@gmail.com'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: Run SELECT promote_owner_to_admin(); after the owner signs up
