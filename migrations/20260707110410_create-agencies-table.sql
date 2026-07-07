-- Agencies (multi-tenant organizations)
CREATE TABLE agencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  domain TEXT NOT NULL,
  app_name TEXT,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#008069',
  secondary_color TEXT DEFAULT '#1e293b',
  accent_color TEXT DEFAULT 'emerald',
  login_headline TEXT,
  dashboard_headline TEXT,
  subscription_plan TEXT DEFAULT 'Free' CHECK (subscription_plan IN ('Free', 'Plus', 'Pro', 'Business', 'Platinum', 'Enterprise')),
  status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Suspended')),
  max_leads_limit INTEGER DEFAULT 15,
  max_properties_limit INTEGER DEFAULT 10,
  max_users_limit INTEGER DEFAULT 3,
  language_preference TEXT DEFAULT 'en' CHECK (language_preference IN ('en', 'ur', 'roman-urdu')),
  currency_preference TEXT DEFAULT 'USD' CHECK (currency_preference IN ('USD', 'AED', 'PKR')),
  property_unit_system TEXT DEFAULT 'global' CHECK (property_unit_system IN ('global', 'regional')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read agencies (they need to know their agency)
CREATE POLICY "authenticated_can_read_agencies" ON agencies
  FOR SELECT TO authenticated
  USING (true);

-- Only super admins can insert/update/delete
CREATE POLICY "super_admin_all_agencies" ON agencies
  FOR ALL TO authenticated
  USING (auth.email() = 'harisalam943@gmail.com')
  WITH CHECK (auth.email() = 'harisalam943@gmail.com');

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON agencies TO authenticated;
GRANT ALL ON agencies TO authenticated;
