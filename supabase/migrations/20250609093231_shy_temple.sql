/*
  # Add Demo Requests Table

  1. New Table
    - `demo_requests` - Store demo requests from potential users

  2. Security
    - Enable RLS on demo_requests table
    - Admin-only access for viewing demo requests
*/

-- Demo requests table
CREATE TABLE IF NOT EXISTS demo_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  full_name text NOT NULL,
  company_name text,
  phone text,
  message text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'demo_scheduled', 'completed', 'declined')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE demo_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for demo requests
CREATE POLICY "Admins can manage demo requests"
  ON demo_requests FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_demo_requests_status ON demo_requests(status);
CREATE INDEX IF NOT EXISTS idx_demo_requests_created ON demo_requests(created_at);