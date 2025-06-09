/*
  # Add Contract Fields for Award Date, Contract Number, etc.

  1. New Columns
    - Add award_date, contract_name, buying_organization, contractors
    - Add contract_number, products_services, primary_requirement
    - Add start_date, current_expiration_date, ultimate_expiration_date, award_value

  2. Updates
    - Update existing contract forms and templates
    - Maintain backward compatibility
*/

-- Add new columns to contracts table
ALTER TABLE contracts 
ADD COLUMN IF NOT EXISTS award_date timestamptz,
ADD COLUMN IF NOT EXISTS contract_name text,
ADD COLUMN IF NOT EXISTS buying_organization text,
ADD COLUMN IF NOT EXISTS contractors text,
ADD COLUMN IF NOT EXISTS contract_number text,
ADD COLUMN IF NOT EXISTS products_services text,
ADD COLUMN IF NOT EXISTS primary_requirement text,
ADD COLUMN IF NOT EXISTS start_date timestamptz,
ADD COLUMN IF NOT EXISTS current_expiration_date timestamptz,
ADD COLUMN IF NOT EXISTS ultimate_expiration_date timestamptz,
ADD COLUMN IF NOT EXISTS award_value decimal(15,2);

-- Create indexes for the new fields
CREATE INDEX IF NOT EXISTS idx_contracts_award_date ON contracts(award_date);
CREATE INDEX IF NOT EXISTS idx_contracts_contract_number ON contracts(contract_number);
CREATE INDEX IF NOT EXISTS idx_contracts_start_date ON contracts(start_date);
CREATE INDEX IF NOT EXISTS idx_contracts_award_value ON contracts(award_value);

-- Update the admin_insert_contracts function to handle new fields
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
        start_date, current_expiration_date, ultimate_expiration_date, award_value
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
        NULLIF(contract_record->>'award_value', '')::decimal(15,2)
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