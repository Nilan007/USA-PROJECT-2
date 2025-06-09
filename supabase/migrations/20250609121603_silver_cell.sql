/*
  # Create internal users table for user access management

  1. New Tables
    - `internal_users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `password_hash` (text)
      - `full_name` (text)
      - `role` (text with check constraint)
      - `permissions` (text array)
      - `is_active` (boolean, default true)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `created_by` (uuid, foreign key to users)

  2. Security
    - Enable RLS on `internal_users` table
    - Add policy for admins to manage internal users

  3. Indexes
    - Add indexes for performance optimization
*/

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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_internal_users_email ON internal_users(email);
CREATE INDEX IF NOT EXISTS idx_internal_users_role ON internal_users(role);
CREATE INDEX IF NOT EXISTS idx_internal_users_active ON internal_users(is_active);
CREATE INDEX IF NOT EXISTS idx_internal_users_created_by ON internal_users(created_by);

-- RLS Policies
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

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_internal_users_updated_at
  BEFORE UPDATE ON internal_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();