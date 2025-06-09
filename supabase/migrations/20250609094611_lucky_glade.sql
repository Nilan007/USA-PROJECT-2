/*
  # Contract Management System with Federal IDs

  1. New Tables
    - `contracts` - Main contract table with unique Federal IDs
    - `contract_attachments` - File attachments for contracts
    - `contract_updates` - Track contract updates and announcements
    - `contract_tracking` - User contract tracking preferences

  2. Enhanced Features
    - Unique Federal ID generation
    - Contract status management (active, forecast, tracked)
    - File attachment system
    - Real-time update notifications
    - Admin contract management

  3. Security
    - Enable RLS on all new tables
    - Admin management capabilities
    - User access controls
*/

-- Contracts table with unique Federal IDs
CREATE TABLE IF NOT EXISTS contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  federal_id text UNIQUE NOT NULL,
  title text NOT NULL,
  description text,
  agency text NOT NULL,
  department text,
  state text,
  contract_type text DEFAULT 'federal' CHECK (contract_type IN ('federal', 'state')),
  budget_min decimal(15,2),
  budget_max decimal(15,2),
  naics_code text,
  set_aside_code text,
  solicitation_number text,
  response_deadline timestamptz,
  posted_date timestamptz DEFAULT now(),
  source_url text,
  ai_analysis_summary text,
  keywords text[],
  status text DEFAULT 'active' CHECK (status IN ('active', 'forecast', 'tracked', 'closed', 'cancelled')),
  contract_status text DEFAULT 'open' CHECK (contract_status IN ('open', 'awarded', 'cancelled')),
  data_source text DEFAULT 'manual',
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES users(id)
);

-- Contract attachments table
CREATE TABLE IF NOT EXISTS contract_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid REFERENCES contracts(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_type text NOT NULL,
  file_size bigint,
  file_url text,
  attachment_type text DEFAULT 'document' CHECK (attachment_type IN ('document', 'announcement', 'amendment', 'award')),
  uploaded_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now()
);

-- Contract updates table
CREATE TABLE IF NOT EXISTS contract_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid REFERENCES contracts(id) ON DELETE CASCADE,
  update_type text DEFAULT 'general' CHECK (update_type IN ('general', 'announcement', 'amendment', 'deadline_change', 'award')),
  title text NOT NULL,
  description text,
  is_published boolean DEFAULT false,
  published_at timestamptz,
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now()
);

-- Contract tracking table (user preferences)
CREATE TABLE IF NOT EXISTS contract_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  contract_id uuid REFERENCES contracts(id) ON DELETE CASCADE,
  tracking_status text DEFAULT 'watching' CHECK (tracking_status IN ('watching', 'interested', 'bidding', 'won', 'lost')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, contract_id)
);

-- Enable Row Level Security
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policies for contracts
CREATE POLICY "Active subscribers can read contracts"
  ON contracts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      LEFT JOIN subscriptions s ON u.id = s.user_id
      WHERE u.id = auth.uid() 
      AND (
        u.role = 'admin' OR 
        s.status = 'active' OR 
        u.trial_days_remaining > 0
      )
    )
  );

CREATE POLICY "Admins can manage contracts"
  ON contracts FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

-- RLS Policies for contract attachments
CREATE POLICY "Active subscribers can read contract attachments"
  ON contract_attachments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      LEFT JOIN subscriptions s ON u.id = s.user_id
      WHERE u.id = auth.uid() 
      AND (
        u.role = 'admin' OR 
        s.status = 'active' OR 
        u.trial_days_remaining > 0
      )
    )
  );

CREATE POLICY "Admins can manage contract attachments"
  ON contract_attachments FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

-- RLS Policies for contract updates
CREATE POLICY "Active subscribers can read published contract updates"
  ON contract_updates FOR SELECT
  TO authenticated
  USING (
    is_published = true AND
    EXISTS (
      SELECT 1 FROM users u
      LEFT JOIN subscriptions s ON u.id = s.user_id
      WHERE u.id = auth.uid() 
      AND (
        u.role = 'admin' OR 
        s.status = 'active' OR 
        u.trial_days_remaining > 0
      )
    )
  );

CREATE POLICY "Admins can manage contract updates"
  ON contract_updates FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

-- RLS Policies for contract tracking
CREATE POLICY "Users can manage own contract tracking"
  ON contract_tracking FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_contracts_federal_id ON contracts(federal_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);
CREATE INDEX IF NOT EXISTS idx_contracts_state ON contracts(state);
CREATE INDEX IF NOT EXISTS idx_contracts_type ON contracts(contract_type);
CREATE INDEX IF NOT EXISTS idx_contracts_naics ON contracts(naics_code);
CREATE INDEX IF NOT EXISTS idx_contracts_deadline ON contracts(response_deadline);
CREATE INDEX IF NOT EXISTS idx_contract_attachments_contract ON contract_attachments(contract_id);
CREATE INDEX IF NOT EXISTS idx_contract_updates_contract ON contract_updates(contract_id);
CREATE INDEX IF NOT EXISTS idx_contract_updates_published ON contract_updates(is_published);
CREATE INDEX IF NOT EXISTS idx_contract_tracking_user ON contract_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_contract_tracking_contract ON contract_tracking(contract_id);

-- Function to generate unique Federal ID
CREATE OR REPLACE FUNCTION generate_federal_id()
RETURNS text AS $$
DECLARE
  new_id text;
  year_suffix text;
  sequence_num integer;
BEGIN
  -- Get current year suffix
  year_suffix := EXTRACT(YEAR FROM NOW())::text;
  
  -- Get next sequence number for this year
  SELECT COALESCE(MAX(CAST(SUBSTRING(federal_id FROM 'FED-' || year_suffix || '-(\d+)') AS INTEGER)), 0) + 1
  INTO sequence_num
  FROM contracts
  WHERE federal_id LIKE 'FED-' || year_suffix || '-%';
  
  -- Generate new Federal ID
  new_id := 'FED-' || year_suffix || '-' || LPAD(sequence_num::text, 6, '0');
  
  RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate Federal ID
CREATE OR REPLACE FUNCTION set_federal_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.federal_id IS NULL OR NEW.federal_id = '' THEN
    NEW.federal_id := generate_federal_id();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_contract_federal_id
  BEFORE INSERT ON contracts
  FOR EACH ROW
  EXECUTE FUNCTION set_federal_id();

-- Migrate existing opportunities to contracts table
INSERT INTO contracts (
  federal_id, title, description, agency, department, state, contract_type,
  budget_min, budget_max, naics_code, set_aside_code, solicitation_number,
  response_deadline, posted_date, source_url, ai_analysis_summary, keywords,
  status, data_source, last_updated, created_at
)
SELECT 
  generate_federal_id(),
  title, description, agency, department, state, opportunity_type,
  budget_min, budget_max, naics_code, set_aside_code, solicitation_number,
  response_deadline, posted_date, source_url, ai_analysis_summary, keywords,
  CASE 
    WHEN status = 'active' THEN 'active'
    WHEN status = 'closed' THEN 'closed'
    ELSE 'cancelled'
  END,
  data_source, last_updated, created_at
FROM opportunities
WHERE NOT EXISTS (
  SELECT 1 FROM contracts WHERE contracts.title = opportunities.title AND contracts.agency = opportunities.agency
);