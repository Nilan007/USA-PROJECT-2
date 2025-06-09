/*
  # Add Additional Contract Fields

  1. New Fields Added
    - Buying Org: Level 1, Level 2, Level 3
    - Place of Performance - Location
    - Contact First Name, Contact Phone, Contact Email

  2. Updates
    - Enhanced contract schema with all required fields
    - Updated admin functions to handle new fields
*/

-- Add additional columns to contracts table
ALTER TABLE contracts 
ADD COLUMN IF NOT EXISTS buying_org_level_1 text,
ADD COLUMN IF NOT EXISTS buying_org_level_2 text,
ADD COLUMN IF NOT EXISTS buying_org_level_3 text,
ADD COLUMN IF NOT EXISTS place_of_performance_location text,
ADD COLUMN IF NOT EXISTS contact_first_name text,
ADD COLUMN IF NOT EXISTS contact_phone text,
ADD COLUMN IF NOT EXISTS contact_email text;

-- Create indexes for the new fields
CREATE INDEX IF NOT EXISTS idx_contracts_buying_org_level_1 ON contracts(buying_org_level_1);
CREATE INDEX IF NOT EXISTS idx_contracts_place_of_performance ON contracts(place_of_performance_location);
CREATE INDEX IF NOT EXISTS idx_contracts_contact_email ON contracts(contact_email);

-- Update the admin_insert_contracts function to handle all new fields
CREATE OR REPLACE FUNCTION admin_insert_contracts(contract_data jsonb[])
RETURNS jsonb AS $$
DECLARE
  inserted_count integer := 0;
  error_count integer := 0;
  contract_record jsonb;
  error_messages text[] := '{}';
BEGIN
  -- Check if current user is admin
  IF NOT EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;

  -- Insert contracts with error handling
  FOREACH contract_record IN ARRAY contract_data
  LOOP
    BEGIN
      INSERT INTO contracts (
        title, description, agency, department, state, contract_type,
        budget_min, budget_max, naics_code, set_aside_code, solicitation_number,
        response_deadline, source_url, status, contract_status, data_source,
        award_date, contract_name, buying_organization, contractors,
        contract_number, products_services, primary_requirement,
        start_date, current_expiration_date, ultimate_expiration_date, award_value,
        buying_org_level_1, buying_org_level_2, buying_org_level_3,
        place_of_performance_location, contact_first_name, contact_phone, contact_email
      ) VALUES (
        contract_record->>'title',
        contract_record->>'description',
        contract_record->>'agency',
        contract_record->>'department',
        contract_record->>'state',
        COALESCE(contract_record->>'contract_type', 'federal'),
        NULLIF(contract_record->>'budget_min', '')::decimal(15,2),
        NULLIF(contract_record->>'budget_max', '')::decimal(15,2),
        contract_record->>'naics_code',
        contract_record->>'set_aside_code',
        contract_record->>'solicitation_number',
        NULLIF(contract_record->>'response_deadline', '')::timestamptz,
        contract_record->>'source_url',
        COALESCE(contract_record->>'status', 'active'),
        COALESCE(contract_record->>'contract_status', 'open'),
        COALESCE(contract_record->>'data_source', 'upload'),
        NULLIF(contract_record->>'award_date', '')::timestamptz,
        contract_record->>'contract_name',
        contract_record->>'buying_organization',
        contract_record->>'contractors',
        contract_record->>'contract_number',
        contract_record->>'products_services',
        contract_record->>'primary_requirement',
        NULLIF(contract_record->>'start_date', '')::timestamptz,
        NULLIF(contract_record->>'current_expiration_date', '')::timestamptz,
        NULLIF(contract_record->>'ultimate_expiration_date', '')::timestamptz,
        NULLIF(contract_record->>'award_value', '')::decimal(15,2),
        contract_record->>'buying_org_level_1',
        contract_record->>'buying_org_level_2',
        contract_record->>'buying_org_level_3',
        contract_record->>'place_of_performance_location',
        contract_record->>'contact_first_name',
        contract_record->>'contact_phone',
        contract_record->>'contact_email'
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