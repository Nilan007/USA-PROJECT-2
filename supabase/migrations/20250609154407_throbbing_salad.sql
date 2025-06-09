/*
  # Internal Users Management System

  1. New Tables
    - `internal_users`
      - `id` (uuid, primary key)
      - `email` (text, unique, not null)
      - `password_hash` (text, not null)
      - `full_name` (text, not null)
      - `role` (text, not null, check constraint)
      - `permissions` (text array, default empty)
      - `is_active` (boolean, default true)
      - `created_at` (timestamptz, default now)
      - `updated_at` (timestamptz, default now)
      - `created_by` (uuid, foreign key to users)

  2. Security
    - Enable RLS on `internal_users` table
    - Add policy for admins to manage internal users
    - Create indexes for performance
    - Add update trigger for updated_at column
*/

-- Create the internal_users table if it doesn't exist
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

-- Enable RLS
ALTER TABLE internal_users ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance (with IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_internal_users_email ON internal_users(email);
CREATE INDEX IF NOT EXISTS idx_internal_users_role ON internal_users(role);
CREATE INDEX IF NOT EXISTS idx_internal_users_active ON internal_users(is_active);
CREATE INDEX IF NOT EXISTS idx_internal_users_created_by ON internal_users(created_by);

-- Drop existing policy if it exists, then create new one
DO $$
BEGIN
  -- Drop the policy if it exists
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'internal_users' 
    AND policyname = 'Admins can manage internal users'
  ) THEN
    DROP POLICY "Admins can manage internal users" ON internal_users;
  END IF;
END $$;

-- Create the policy
CREATE POLICY "Admins can manage internal users"
  ON internal_users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Create or replace the update function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists, then create new one
DO $$
BEGIN
  -- Drop the trigger if it exists
  IF EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_internal_users_updated_at'
  ) THEN
    DROP TRIGGER update_internal_users_updated_at ON internal_users;
  END IF;
END $$;

-- Create the trigger
CREATE TRIGGER update_internal_users_updated_at
  BEFORE UPDATE ON internal_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();