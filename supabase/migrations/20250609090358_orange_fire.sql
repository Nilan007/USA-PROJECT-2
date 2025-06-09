/*
  # Enhanced FederalTalks IQ Database Schema

  1. New Tables
    - `users` - User profiles and authentication
    - `subscriptions` - User subscription management
    - `opportunities` - Government contract opportunities
    - `contacts` - Government procurement contacts
    - `user_favorites` - User favorite opportunities
    - `user_reminders` - User reminders for opportunities
    - `pipelines` - User pipeline management
    - `pipeline_stages` - Pipeline stage definitions
    - `pipeline_opportunities` - Opportunities in pipelines
    - `team_members` - Team member assignments
    - `data_sources` - Track data source configurations
    - `upload_logs` - Track admin uploads

  2. Security
    - Enable RLS on all tables
    - Role-based access control
    - Admin and user separation

  3. Features
    - Bulk upload tracking
    - Real-time data sourcing
    - Pipeline management
    - Team collaboration
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  full_name text NOT NULL,
  company_name text,
  phone text,
  role text DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  is_active boolean DEFAULT true,
  trial_days_remaining integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  plan_type text NOT NULL CHECK (plan_type IN ('trial', '1month', '3months', '6months', '9months', '1year')),
  plan_price decimal(10,2) NOT NULL DEFAULT 0,
  start_date timestamptz DEFAULT now(),
  end_date timestamptz NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'expired', 'cancelled')),
  payment_method text CHECK (payment_method IN ('paypal', 'skrill', 'neteller', 'manual')),
  payment_id text,
  created_at timestamptz DEFAULT now()
);

-- Opportunities table
CREATE TABLE IF NOT EXISTS opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  agency text NOT NULL,
  department text,
  state text,
  opportunity_type text DEFAULT 'federal' CHECK (opportunity_type IN ('federal', 'state')),
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
  status text DEFAULT 'active' CHECK (status IN ('active', 'closed', 'cancelled')),
  data_source text DEFAULT 'manual',
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Contacts table
CREATE TABLE IF NOT EXISTS contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  title text NOT NULL,
  agency text NOT NULL,
  department text,
  state text,
  email text,
  phone text,
  contact_type text DEFAULT 'procurement' CHECK (contact_type IN ('cio', 'cto', 'cpo', 'procurement', 'director')),
  is_federal boolean DEFAULT false,
  data_source text DEFAULT 'manual',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User favorites
CREATE TABLE IF NOT EXISTS user_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  opportunity_id uuid REFERENCES opportunities(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, opportunity_id)
);

-- User reminders
CREATE TABLE IF NOT EXISTS user_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  opportunity_id uuid REFERENCES opportunities(id) ON DELETE CASCADE,
  reminder_date timestamptz NOT NULL,
  message text,
  is_sent boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Pipeline stages
CREATE TABLE IF NOT EXISTS pipeline_stages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  order_index integer NOT NULL,
  color text DEFAULT '#3B82F6',
  created_at timestamptz DEFAULT now()
);

-- Pipelines
CREATE TABLE IF NOT EXISTS pipelines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Pipeline opportunities
CREATE TABLE IF NOT EXISTS pipeline_opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_id uuid REFERENCES pipelines(id) ON DELETE CASCADE,
  opportunity_id uuid REFERENCES opportunities(id) ON DELETE CASCADE,
  stage_id uuid REFERENCES pipeline_stages(id) ON DELETE CASCADE,
  assigned_to uuid REFERENCES users(id),
  notes text,
  probability decimal(5,2) DEFAULT 0,
  estimated_value decimal(15,2),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Team members
CREATE TABLE IF NOT EXISTS team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  member_email text NOT NULL,
  member_name text NOT NULL,
  role text DEFAULT 'member',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Data sources configuration
CREATE TABLE IF NOT EXISTS data_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  url text NOT NULL,
  source_type text CHECK (source_type IN ('federal', 'state')),
  state_code text,
  is_active boolean DEFAULT true,
  last_scraped timestamptz,
  scrape_frequency_hours integer DEFAULT 24,
  created_at timestamptz DEFAULT now()
);

-- Upload logs
CREATE TABLE IF NOT EXISTS upload_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  uploaded_by uuid REFERENCES users(id),
  file_name text NOT NULL,
  file_type text NOT NULL,
  records_processed integer DEFAULT 0,
  records_successful integer DEFAULT 0,
  records_failed integer DEFAULT 0,
  error_details jsonb,
  upload_type text CHECK (upload_type IN ('opportunities', 'contacts')),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE upload_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can read own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id OR EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can manage all users"
  ON users FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

-- RLS Policies for opportunities
CREATE POLICY "Active subscribers can read opportunities"
  ON opportunities FOR SELECT
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

CREATE POLICY "Admins can manage opportunities"
  ON opportunities FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

-- RLS Policies for contacts
CREATE POLICY "Active subscribers can read contacts"
  ON contacts FOR SELECT
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

CREATE POLICY "Admins can manage contacts"
  ON contacts FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

-- RLS Policies for user favorites
CREATE POLICY "Users can manage own favorites"
  ON user_favorites FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for user reminders
CREATE POLICY "Users can manage own reminders"
  ON user_reminders FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for pipelines
CREATE POLICY "Users can manage own pipelines"
  ON pipelines FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage own pipeline stages"
  ON pipeline_stages FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage own pipeline opportunities"
  ON pipeline_opportunities FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM pipelines WHERE id = pipeline_id AND user_id = auth.uid()
  ));

-- RLS Policies for team members
CREATE POLICY "Users can manage own team"
  ON team_members FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for data sources
CREATE POLICY "Admins can manage data sources"
  ON data_sources FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

-- RLS Policies for upload logs
CREATE POLICY "Admins can view upload logs"
  ON upload_logs FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_opportunities_state ON opportunities(state);
CREATE INDEX IF NOT EXISTS idx_opportunities_type ON opportunities(opportunity_type);
CREATE INDEX IF NOT EXISTS idx_opportunities_naics ON opportunities(naics_code);
CREATE INDEX IF NOT EXISTS idx_opportunities_deadline ON opportunities(response_deadline);
CREATE INDEX IF NOT EXISTS idx_contacts_state ON contacts(state);
CREATE INDEX IF NOT EXISTS idx_contacts_type ON contacts(contact_type);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_reminders_user ON user_reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_opportunities_pipeline ON pipeline_opportunities(pipeline_id);

-- Insert default data sources
INSERT INTO data_sources (name, url, source_type, state_code) VALUES
('SAM.gov', 'https://sam.gov/', 'federal', NULL),
('USAspending.gov', 'https://www.usaspending.gov/', 'federal', NULL),
('GSA eBuy', 'https://ebuy.gsa.gov/ebuy/', 'federal', NULL),
('California Procurement', 'http://www.dgs.ca.gov/pd/Home.aspx', 'state', 'CA'),
('Texas Procurement', 'http://www.window.state.tx.us/procurement/', 'state', 'TX'),
('Florida Procurement', 'http://www.dms.myflorida.com/business_operations/state_purchasing', 'state', 'FL'),
('New York Procurement', 'http://ogs.ny.gov/BU/PC', 'state', 'NY'),
('Illinois Procurement', 'http://www.illinois.gov/cms/business/procurement/Pages/default.aspx', 'state', 'IL');

-- Insert default pipeline stages for new users
CREATE OR REPLACE FUNCTION create_default_pipeline_stages()
RETURNS TRIGGER AS $$
BEGIN
  -- Create default pipeline
  INSERT INTO pipelines (user_id, name, description, is_default)
  VALUES (NEW.id, 'Default Pipeline', 'Default opportunity tracking pipeline', true);
  
  -- Create default stages
  INSERT INTO pipeline_stages (user_id, name, order_index, color) VALUES
  (NEW.id, 'Identified', 1, '#6B7280'),
  (NEW.id, 'Qualified', 2, '#3B82F6'),
  (NEW.id, 'Proposal', 3, '#F59E0B'),
  (NEW.id, 'Negotiation', 4, '#8B5CF6'),
  (NEW.id, 'Won', 5, '#10B981'),
  (NEW.id, 'Lost', 6, '#EF4444');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_user_defaults
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_pipeline_stages();