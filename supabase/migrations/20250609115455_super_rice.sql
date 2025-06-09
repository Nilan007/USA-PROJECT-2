/*
  # Internal Users Management System

  1. New Tables
    - `internal_users` - Internal staff with role-based permissions

  2. Security
    - Enable RLS on internal_users table
    - Admin-only access for managing internal users
*/

-- Internal users table for role-based access management
CREATE TABLE IF NOT EXISTS internal_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL CHECK (role IN ('assistance', 'admin_super_assistance', 'admin_star_assistance')),
  permissions text[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES users(id)
);

-- Enable Row Level Security
ALTER TABLE internal_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for internal users
CREATE POLICY "Admins can manage internal users"
  ON internal_users FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_internal_users_role ON internal_users(role);
CREATE INDEX IF NOT EXISTS idx_internal_users_active ON internal_users(is_active);
CREATE INDEX IF NOT EXISTS idx_internal_users_created_by ON internal_users(created_by);

-- Function to check internal user permissions
CREATE OR REPLACE FUNCTION check_internal_user_permission(user_email text, required_permission text)
RETURNS boolean AS $$
DECLARE
  user_permissions text[];
BEGIN
  SELECT permissions INTO user_permissions
  FROM internal_users
  WHERE email = user_email AND is_active = true;
  
  IF user_permissions IS NULL THEN
    RETURN false;
  END IF;
  
  RETURN required_permission = ANY(user_permissions);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION check_internal_user_permission(text, text) TO authenticated;