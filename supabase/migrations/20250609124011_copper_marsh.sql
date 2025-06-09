/*
  # Contract Upload Enhancement

  1. Schema Updates
    - Ensure all contract fields are properly indexed
    - Add missing columns if needed
    - Update constraints and defaults

  2. Performance
    - Add indexes for upload operations
    - Optimize for bulk inserts

  3. Data Integrity
    - Ensure proper constraints
    - Add validation functions
*/

-- Ensure all contract columns exist with proper types
DO $$
BEGIN
  -- Add missing columns if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contracts' AND column_name = 'contract_name'
  ) THEN
    ALTER TABLE contracts ADD COLUMN contract_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contracts' AND column_name = 'buying_organization'
  ) THEN
    ALTER TABLE contracts ADD COLUMN buying_organization text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contracts' AND column_name = 'contractors'
  ) THEN
    ALTER TABLE contracts ADD COLUMN contractors text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contracts' AND column_name = 'products_services'
  ) THEN
    ALTER TABLE contracts ADD COLUMN products_services text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contracts' AND column_name = 'primary_requirement'
  ) THEN
    ALTER TABLE contracts ADD COLUMN primary_requirement text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contracts' AND column_name = 'award_value'
  ) THEN
    ALTER TABLE contracts ADD COLUMN award_value numeric(15,2);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contracts' AND column_name = 'buying_org_level_1'
  ) THEN
    ALTER TABLE contracts ADD COLUMN buying_org_level_1 text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contracts' AND column_name = 'buying_org_level_2'
  ) THEN
    ALTER TABLE contracts ADD COLUMN buying_org_level_2 text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contracts' AND column_name = 'buying_org_level_3'
  ) THEN
    ALTER TABLE contracts ADD COLUMN buying_org_level_3 text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contracts' AND column_name = 'place_of_performance_location'
  ) THEN
    ALTER TABLE contracts ADD COLUMN place_of_performance_location text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contracts' AND column_name = 'contact_first_name'
  ) THEN
    ALTER TABLE contracts ADD COLUMN contact_first_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contracts' AND column_name = 'contact_phone'
  ) THEN
    ALTER TABLE contracts ADD COLUMN contact_phone text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contracts' AND column_name = 'contact_email'
  ) THEN
    ALTER TABLE contracts ADD COLUMN contact_email text;
  END IF;
END $$;

-- Create indexes for better upload performance
CREATE INDEX IF NOT EXISTS idx_contracts_upload_batch ON contracts(data_source, created_at);
CREATE INDEX IF NOT EXISTS idx_contracts_title_search ON contracts USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_contracts_agency_search ON contracts USING gin(to_tsvector('english', agency));
CREATE INDEX IF NOT EXISTS idx_contracts_keywords ON contracts USING gin(keywords);

-- Create function to validate contract data before insert
CREATE OR REPLACE FUNCTION validate_contract_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure required fields are present
  IF NEW.title IS NULL OR trim(NEW.title) = '' THEN
    RAISE EXCEPTION 'Contract title is required';
  END IF;
  
  IF NEW.agency IS NULL OR trim(NEW.agency) = '' THEN
    RAISE EXCEPTION 'Agency is required';
  END IF;
  
  -- Set default values
  IF NEW.contract_name IS NULL OR trim(NEW.contract_name) = '' THEN
    NEW.contract_name := NEW.title;
  END IF;
  
  IF NEW.buying_organization IS NULL OR trim(NEW.buying_organization) = '' THEN
    NEW.buying_organization := NEW.agency;
  END IF;
  
  -- Ensure dates are properly formatted
  IF NEW.posted_date IS NULL THEN
    NEW.posted_date := now();
  END IF;
  
  IF NEW.last_updated IS NULL THEN
    NEW.last_updated := now();
  END IF;
  
  -- Set default status if not provided
  IF NEW.status IS NULL THEN
    NEW.status := 'active';
  END IF;
  
  IF NEW.contract_status IS NULL THEN
    NEW.contract_status := 'open';
  END IF;
  
  -- Set default contract type if not provided
  IF NEW.contract_type IS NULL THEN
    NEW.contract_type := 'federal';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for contract validation
DROP TRIGGER IF EXISTS validate_contract_before_insert ON contracts;
CREATE TRIGGER validate_contract_before_insert
  BEFORE INSERT ON contracts
  FOR EACH ROW
  EXECUTE FUNCTION validate_contract_data();

-- Create function for bulk contract upload
CREATE OR REPLACE FUNCTION bulk_insert_contracts(contract_data jsonb[])
RETURNS TABLE(inserted_count integer, error_count integer, errors text[]) AS $$
DECLARE
  contract_record jsonb;
  inserted_count integer := 0;
  error_count integer := 0;
  errors text[] := '{}';
  error_msg text;
BEGIN
  -- Loop through each contract record
  FOREACH contract_record IN ARRAY contract_data
  LOOP
    BEGIN
      -- Insert the contract record
      INSERT INTO contracts (
        title, contract_name, description, agency, buying_organization,
        department, state, contract_type, buying_org_level_1, buying_org_level_2, buying_org_level_3,
        contract_number, solicitation_number, contractors, products_services, primary_requirement,
        place_of_performance_location, contact_first_name, contact_phone, contact_email,
        budget_min, budget_max, award_value, naics_code, set_aside_code,
        award_date, start_date, current_expiration_date, ultimate_expiration_date, response_deadline,
        status, contract_status, source_url, ai_analysis_summary, keywords, data_source
      ) VALUES (
        (contract_record->>'title')::text,
        (contract_record->>'contract_name')::text,
        (contract_record->>'description')::text,
        (contract_record->>'agency')::text,
        (contract_record->>'buying_organization')::text,
        (contract_record->>'department')::text,
        (contract_record->>'state')::text,
        (contract_record->>'contract_type')::text,
        (contract_record->>'buying_org_level_1')::text,
        (contract_record->>'buying_org_level_2')::text,
        (contract_record->>'buying_org_level_3')::text,
        (contract_record->>'contract_number')::text,
        (contract_record->>'solicitation_number')::text,
        (contract_record->>'contractors')::text,
        (contract_record->>'products_services')::text,
        (contract_record->>'primary_requirement')::text,
        (contract_record->>'place_of_performance_location')::text,
        (contract_record->>'contact_first_name')::text,
        (contract_record->>'contact_phone')::text,
        (contract_record->>'contact_email')::text,
        CASE WHEN contract_record->>'budget_min' = '' THEN NULL ELSE (contract_record->>'budget_min')::numeric END,
        CASE WHEN contract_record->>'budget_max' = '' THEN NULL ELSE (contract_record->>'budget_max')::numeric END,
        CASE WHEN contract_record->>'award_value' = '' THEN NULL ELSE (contract_record->>'award_value')::numeric END,
        (contract_record->>'naics_code')::text,
        (contract_record->>'set_aside_code')::text,
        CASE WHEN contract_record->>'award_date' = '' THEN NULL ELSE (contract_record->>'award_date')::timestamptz END,
        CASE WHEN contract_record->>'start_date' = '' THEN NULL ELSE (contract_record->>'start_date')::timestamptz END,
        CASE WHEN contract_record->>'current_expiration_date' = '' THEN NULL ELSE (contract_record->>'current_expiration_date')::timestamptz END,
        CASE WHEN contract_record->>'ultimate_expiration_date' = '' THEN NULL ELSE (contract_record->>'ultimate_expiration_date')::timestamptz END,
        CASE WHEN contract_record->>'response_deadline' = '' THEN NULL ELSE (contract_record->>'response_deadline')::timestamptz END,
        COALESCE((contract_record->>'status')::text, 'active'),
        COALESCE((contract_record->>'contract_status')::text, 'open'),
        (contract_record->>'source_url')::text,
        (contract_record->>'ai_analysis_summary')::text,
        CASE WHEN contract_record->>'keywords' = '' THEN NULL ELSE string_to_array(contract_record->>'keywords', ',') END,
        COALESCE((contract_record->>'data_source')::text, 'upload')
      );
      
      inserted_count := inserted_count + 1;
      
    EXCEPTION WHEN OTHERS THEN
      error_count := error_count + 1;
      error_msg := SQLERRM;
      errors := array_append(errors, 'Contract ' || COALESCE(contract_record->>'title', 'Unknown') || ': ' || error_msg);
    END;
  END LOOP;
  
  RETURN QUERY SELECT inserted_count, error_count, errors;
END;
$$ LANGUAGE plpgsql;