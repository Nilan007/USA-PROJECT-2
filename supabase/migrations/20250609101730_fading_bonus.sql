/*
  # Fix RLS Policies for Admin Uploads

  1. Drop existing problematic policies
  2. Create new policies that properly handle admin uploads
  3. Add service role bypass for admin operations
*/

-- Drop existing policies that are causing issues
DROP POLICY IF EXISTS "Admins can insert contacts" ON contacts;
DROP POLICY IF EXISTS "Admins can insert opportunities" ON opportunities;
DROP POLICY IF EXISTS "Admins can manage contacts" ON contacts;
DROP POLICY IF EXISTS "Admins can manage opportunities" ON opportunities;

-- Create new comprehensive admin policies for contacts
CREATE POLICY "Admins can manage all contacts"
  ON contacts FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Create new comprehensive admin policies for opportunities
CREATE POLICY "Admins can manage all opportunities"
  ON opportunities FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Create a function to temporarily bypass RLS for admin operations
CREATE OR REPLACE FUNCTION admin_insert_contacts(contact_data jsonb[])
RETURNS integer AS $$
DECLARE
  inserted_count integer := 0;
  contact_record jsonb;
BEGIN
  -- Check if current user is admin
  IF NOT EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;

  -- Insert contacts with RLS temporarily disabled for this function
  FOREACH contact_record IN ARRAY contact_data
  LOOP
    INSERT INTO contacts (
      full_name, title, agency, department, state, email, phone, 
      contact_type, is_federal, data_source
    ) VALUES (
      contact_record->>'full_name',
      contact_record->>'title', 
      contact_record->>'agency',
      contact_record->>'department',
      contact_record->>'state',
      contact_record->>'email',
      contact_record->>'phone',
      COALESCE(contact_record->>'contact_type', 'procurement'),
      COALESCE((contact_record->>'is_federal')::boolean, false),
      COALESCE(contact_record->>'data_source', 'upload')
    );
    inserted_count := inserted_count + 1;
  END LOOP;

  RETURN inserted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to temporarily bypass RLS for admin opportunity operations
CREATE OR REPLACE FUNCTION admin_insert_opportunities(opportunity_data jsonb[])
RETURNS integer AS $$
DECLARE
  inserted_count integer := 0;
  opp_record jsonb;
BEGIN
  -- Check if current user is admin
  IF NOT EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;

  -- Insert opportunities with RLS temporarily disabled for this function
  FOREACH opp_record IN ARRAY opportunity_data
  LOOP
    INSERT INTO opportunities (
      title, description, agency, department, state, opportunity_type,
      budget_min, budget_max, naics_code, set_aside_code, solicitation_number,
      response_deadline, source_url, status, data_source
    ) VALUES (
      opp_record->>'title',
      opp_record->>'description',
      opp_record->>'agency',
      opp_record->>'department',
      opp_record->>'state',
      COALESCE(opp_record->>'opportunity_type', 'federal'),
      NULLIF(opp_record->>'budget_min', '')::decimal(15,2),
      NULLIF(opp_record->>'budget_max', '')::decimal(15,2),
      opp_record->>'naics_code',
      opp_record->>'set_aside_code',
      opp_record->>'solicitation_number',
      NULLIF(opp_record->>'response_deadline', '')::timestamptz,
      opp_record->>'source_url',
      COALESCE(opp_record->>'status', 'active'),
      COALESCE(opp_record->>'data_source', 'upload')
    );
    inserted_count := inserted_count + 1;
  END LOOP;

  RETURN inserted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION admin_insert_contacts(jsonb[]) TO authenticated;
GRANT EXECUTE ON FUNCTION admin_insert_opportunities(jsonb[]) TO authenticated;