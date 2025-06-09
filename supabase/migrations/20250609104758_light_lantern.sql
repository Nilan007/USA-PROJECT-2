-- Drop existing functions first to avoid return type conflicts
DROP FUNCTION IF EXISTS admin_insert_contacts(jsonb[]);
DROP FUNCTION IF EXISTS admin_insert_opportunities(jsonb[]);
DROP FUNCTION IF EXISTS get_contract_stats();
DROP FUNCTION IF EXISTS get_contact_stats();

-- Ensure contracts table has proper indexes
CREATE INDEX IF NOT EXISTS idx_contracts_data_source ON contracts(data_source);
CREATE INDEX IF NOT EXISTS idx_contracts_updated_by ON contracts(updated_by);

-- Ensure contacts table has proper indexes  
CREATE INDEX IF NOT EXISTS idx_contacts_data_source ON contacts(data_source);

-- Function to get contract statistics
CREATE OR REPLACE FUNCTION get_contract_stats()
RETURNS TABLE (
  total_contracts bigint,
  active_contracts bigint,
  federal_contracts bigint,
  state_contracts bigint,
  manual_entries bigint,
  uploaded_entries bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_contracts,
    COUNT(*) FILTER (WHERE status = 'active') as active_contracts,
    COUNT(*) FILTER (WHERE contract_type = 'federal') as federal_contracts,
    COUNT(*) FILTER (WHERE contract_type = 'state') as state_contracts,
    COUNT(*) FILTER (WHERE data_source = 'manual') as manual_entries,
    COUNT(*) FILTER (WHERE data_source = 'upload') as uploaded_entries
  FROM contracts;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get contact statistics
CREATE OR REPLACE FUNCTION get_contact_stats()
RETURNS TABLE (
  total_contacts bigint,
  federal_contacts bigint,
  state_contacts bigint,
  manual_entries bigint,
  uploaded_entries bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_contacts,
    COUNT(*) FILTER (WHERE is_federal = true) as federal_contacts,
    COUNT(*) FILTER (WHERE is_federal = false) as state_contacts,
    COUNT(*) FILTER (WHERE data_source = 'manual') as manual_entries,
    COUNT(*) FILTER (WHERE data_source = 'upload') as uploaded_entries
  FROM contacts;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_contract_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION get_contact_stats() TO authenticated;

-- Update the admin upload functions to handle better error reporting
CREATE OR REPLACE FUNCTION admin_insert_contacts(contact_data jsonb[])
RETURNS jsonb AS $$
DECLARE
  inserted_count integer := 0;
  error_count integer := 0;
  contact_record jsonb;
  error_messages text[] := '{}';
BEGIN
  -- Check if current user is admin
  IF NOT EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;

  -- Insert contacts with error handling
  FOREACH contact_record IN ARRAY contact_data
  LOOP
    BEGIN
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
    EXCEPTION WHEN OTHERS THEN
      error_count := error_count + 1;
      error_messages := array_append(error_messages, SQLERRM);
    END;
  END LOOP;

  RETURN jsonb_build_object(
    'inserted', inserted_count,
    'errors', error_count,
    'error_messages', error_messages
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the admin upload function for opportunities
CREATE OR REPLACE FUNCTION admin_insert_opportunities(opportunity_data jsonb[])
RETURNS jsonb AS $$
DECLARE
  inserted_count integer := 0;
  error_count integer := 0;
  opp_record jsonb;
  error_messages text[] := '{}';
BEGIN
  -- Check if current user is admin
  IF NOT EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;

  -- Insert opportunities with error handling
  FOREACH opp_record IN ARRAY opportunity_data
  LOOP
    BEGIN
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
    EXCEPTION WHEN OTHERS THEN
      error_count := error_count + 1;
      error_messages := array_append(error_messages, SQLERRM);
    END;
  END LOOP;

  RETURN jsonb_build_object(
    'inserted', inserted_count,
    'errors', error_count,
    'error_messages', error_messages
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions for the new functions
GRANT EXECUTE ON FUNCTION admin_insert_contacts(jsonb[]) TO authenticated;
GRANT EXECUTE ON FUNCTION admin_insert_opportunities(jsonb[]) TO authenticated;