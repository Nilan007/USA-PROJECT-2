/*
  # Fix RLS Policies for Admin Uploads

  1. Policy Updates
    - Add proper INSERT policies with WITH CHECK for admin uploads
    - Update existing SELECT policies to be more permissive
    - Create helper function for auth context

  2. Security
    - Maintain RLS while allowing admin uploads
    - Ensure proper authentication context
*/

-- Add INSERT policies with proper WITH CHECK clause for contacts
CREATE POLICY "Admins can insert contacts"
  ON contacts FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

-- Add INSERT policies with proper WITH CHECK clause for opportunities
CREATE POLICY "Admins can insert opportunities"
  ON opportunities FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

-- Update the existing SELECT policies to be more permissive for authenticated users
DROP POLICY IF EXISTS "Active subscribers can read contacts" ON contacts;
CREATE POLICY "Active subscribers can read contacts"
  ON contacts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      LEFT JOIN subscriptions s ON u.id = s.user_id
      WHERE u.id = auth.uid() 
      AND (
        u.role = 'admin' OR 
        s.status = 'active' OR 
        u.trial_days_remaining > 0 OR
        u.is_active = true
      )
    )
  );

-- Update opportunities SELECT policy as well
DROP POLICY IF EXISTS "Active subscribers can read opportunities" ON opportunities;
CREATE POLICY "Active subscribers can read opportunities"
  ON opportunities FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      LEFT JOIN subscriptions s ON u.id = s.user_id
      WHERE u.id = auth.uid() 
      AND (
        u.role = 'admin' OR 
        s.status = 'active' OR 
        u.trial_days_remaining > 0 OR
        u.is_active = true
      )
    )
  );

-- Ensure the auth.uid() function works properly by creating a helper function
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS uuid AS $$
BEGIN
  RETURN auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_current_user_id() TO authenticated;

-- Add UPDATE policies for admins as well
CREATE POLICY "Admins can update contacts"
  ON contacts FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Admins can update opportunities"
  ON opportunities FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));