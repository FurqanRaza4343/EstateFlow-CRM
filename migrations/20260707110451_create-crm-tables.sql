-- Leads
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT DEFAULT '',
  source TEXT DEFAULT 'Manual' CHECK (source IN ('36 Acre', 'MagicBricks', 'Housing.com', 'Facebook Ads', 'Instagram Ads', 'Website', 'Referral', 'Manual', 'Other')),
  property_type TEXT DEFAULT 'Apartment' CHECK (property_type IN ('Apartment', 'Villa', 'Plot', 'Commercial', 'Rental')),
  budget_min NUMERIC DEFAULT 1000000,
  budget_max NUMERIC DEFAULT 10000000,
  preferred_location TEXT DEFAULT '',
  status TEXT DEFAULT 'New' CHECK (status IN ('New', 'Contacted', 'Interested', 'Site Visit Scheduled', 'Negotiation', 'Won', 'Lost', 'Not Responding')),
  temperature TEXT DEFAULT 'Warm' CHECK (temperature IN ('Cold', 'Warm', 'Hot')),
  assigned_agent_id UUID REFERENCES profiles(id),
  notes TEXT DEFAULT '',
  is_hot BOOLEAN DEFAULT false,
  last_contacted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "leads_agency_access" ON leads
  FOR SELECT TO authenticated
  USING (agency_id IN (SELECT p.agency_id FROM profiles p WHERE p.user_id = auth.uid()));

CREATE POLICY "leads_insert_agency" ON leads
  FOR INSERT TO authenticated
  WITH CHECK (agency_id IN (SELECT p.agency_id FROM profiles p WHERE p.user_id = auth.uid()));

CREATE POLICY "leads_update_agency" ON leads
  FOR UPDATE TO authenticated
  USING (agency_id IN (SELECT p.agency_id FROM profiles p WHERE p.user_id = auth.uid()))
  WITH CHECK (agency_id IN (SELECT p.agency_id FROM profiles p WHERE p.user_id = auth.uid()));

CREATE POLICY "leads_delete_agency" ON leads
  FOR DELETE TO authenticated
  USING (agency_id IN (SELECT p.agency_id FROM profiles p WHERE p.user_id = auth.uid()));

GRANT SELECT, INSERT, UPDATE, DELETE ON leads TO authenticated;

-- Properties
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  address TEXT DEFAULT '',
  property_type TEXT DEFAULT 'Apartment' CHECK (property_type IN ('Apartment', 'Villa', 'Plot', 'Commercial', 'Rental')),
  price NUMERIC NOT NULL,
  size TEXT DEFAULT '',
  bedrooms INTEGER DEFAULT 0,
  bathrooms INTEGER DEFAULT 0,
  floor INTEGER DEFAULT 0,
  furnishing_status TEXT DEFAULT 'Semi-Furnished' CHECK (furnishing_status IN ('Unfurnished', 'Semi-Furnished', 'Fully-Furnished')),
  availability_status TEXT DEFAULT 'Available' CHECK (availability_status IN ('Available', 'Hold', 'Sold', 'Rented')),
  description TEXT DEFAULT '',
  amenities TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  documents TEXT[] DEFAULT '{}',
  owner_info JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "properties_agency_access" ON properties
  FOR SELECT TO authenticated
  USING (agency_id IN (SELECT p.agency_id FROM profiles p WHERE p.user_id = auth.uid()));

CREATE POLICY "properties_insert_agency" ON properties
  FOR INSERT TO authenticated
  WITH CHECK (agency_id IN (SELECT p.agency_id FROM profiles p WHERE p.user_id = auth.uid()));

CREATE POLICY "properties_update_agency" ON properties
  FOR UPDATE TO authenticated
  USING (agency_id IN (SELECT p.agency_id FROM profiles p WHERE p.user_id = auth.uid()))
  WITH CHECK (agency_id IN (SELECT p.agency_id FROM profiles p WHERE p.user_id = auth.uid()));

GRANT SELECT, INSERT, UPDATE ON properties TO authenticated;

-- Follow-ups
CREATE TABLE followups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES profiles(id),
  datetime TIMESTAMPTZ NOT NULL,
  notes TEXT DEFAULT '',
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  type TEXT DEFAULT 'Call' CHECK (type IN ('Call', 'WhatsApp', 'SMS', 'Email', 'Site Visit')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE followups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "followups_agency_access" ON followups
  FOR ALL TO authenticated
  USING (agency_id IN (SELECT p.agency_id FROM profiles p WHERE p.user_id = auth.uid()))
  WITH CHECK (agency_id IN (SELECT p.agency_id FROM profiles p WHERE p.user_id = auth.uid()));

GRANT ALL ON followups TO authenticated;

-- Activities / Timeline
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  user_id UUID REFERENCES profiles(id),
  type TEXT DEFAULT 'System' CHECK (type IN ('Note', 'Call', 'Message', 'Share', 'StatusChange', 'Assignment', 'System')),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "activities_agency_access" ON activities
  FOR ALL TO authenticated
  USING (agency_id IN (SELECT p.agency_id FROM profiles p WHERE p.user_id = auth.uid()))
  WITH CHECK (agency_id IN (SELECT p.agency_id FROM profiles p WHERE p.user_id = auth.uid()));

GRANT ALL ON activities TO authenticated;

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  type TEXT DEFAULT 'LeadAssigned' CHECK (type IN ('LeadAssigned', 'MissedCall', 'FollowUpDue', 'SiteVisit', 'PropShared', 'Attendance', 'SocialPostDue')),
  is_read BOOLEAN DEFAULT false,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_agency_access" ON notifications
  FOR ALL TO authenticated
  USING (agency_id IN (SELECT p.agency_id FROM profiles p WHERE p.user_id = auth.uid()))
  WITH CHECK (agency_id IN (SELECT p.agency_id FROM profiles p WHERE p.user_id = auth.uid()));

GRANT ALL ON notifications TO authenticated;

-- Attendance
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),
  check_in_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  check_out_time TIMESTAMPTZ,
  check_in_latitude NUMERIC,
  check_in_longitude NUMERIC,
  check_out_latitude NUMERIC,
  check_out_longitude NUMERIC,
  status TEXT DEFAULT 'Present' CHECK (status IN ('Present', 'Late', 'Absent')),
  notes TEXT DEFAULT '',
  field_visit_notes TEXT
);

ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "attendance_agency_access" ON attendance
  FOR ALL TO authenticated
  USING (agency_id IN (SELECT p.agency_id FROM profiles p WHERE p.user_id = auth.uid()))
  WITH CHECK (agency_id IN (SELECT p.agency_id FROM profiles p WHERE p.user_id = auth.uid()));

GRANT ALL ON attendance TO authenticated;

-- Contacts (WhatsApp-style)
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT DEFAULT '',
  phone TEXT NOT NULL,
  email TEXT DEFAULT '',
  company TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  avatar_seed TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contacts_agency_access" ON contacts
  FOR ALL TO authenticated
  USING (agency_id IN (SELECT p.agency_id FROM profiles p WHERE p.user_id = auth.uid()))
  WITH CHECK (agency_id IN (SELECT p.agency_id FROM profiles p WHERE p.user_id = auth.uid()));

GRANT ALL ON contacts TO authenticated;

-- Social Posts
CREATE TABLE social_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  post_type TEXT DEFAULT 'Instagram Post' CHECK (post_type IN ('Instagram Reel', 'Instagram Post', 'Facebook Post', 'LinkedIn Post', 'Story')),
  caption TEXT NOT NULL,
  media_url TEXT,
  status TEXT DEFAULT 'Draft' CHECK (status IN ('Idea', 'Draft', 'Scheduled', 'Published')),
  scheduled_time TIMESTAMPTZ,
  assigned_user_id UUID REFERENCES profiles(id),
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "social_posts_agency_access" ON social_posts
  FOR ALL TO authenticated
  USING (agency_id IN (SELECT p.agency_id FROM profiles p WHERE p.user_id = auth.uid()))
  WITH CHECK (agency_id IN (SELECT p.agency_id FROM profiles p WHERE p.user_id = auth.uid()));

GRANT ALL ON social_posts TO authenticated;

-- Call Logs
CREATE TABLE call_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  agent_id UUID REFERENCES profiles(id),
  status TEXT DEFAULT 'Bridge Dialing' CHECK (status IN ('Completed', 'No Answer', 'Busy', 'Failed', 'Incoming', 'Bridge Dialing')),
  duration INTEGER DEFAULT 0,
  outcome TEXT DEFAULT '',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ
);

ALTER TABLE call_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "call_logs_agency_access" ON call_logs
  FOR ALL TO authenticated
  USING (agency_id IN (SELECT p.agency_id FROM profiles p WHERE p.user_id = auth.uid()))
  WITH CHECK (agency_id IN (SELECT p.agency_id FROM profiles p WHERE p.user_id = auth.uid()));

GRANT ALL ON call_logs TO authenticated;

-- Message Logs
CREATE TABLE message_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  agent_id UUID REFERENCES profiles(id),
  type TEXT DEFAULT 'WhatsApp' CHECK (type IN ('SMS', 'WhatsApp')),
  body TEXT NOT NULL,
  status TEXT DEFAULT 'Sent' CHECK (status IN ('Sent', 'Failed', 'Delivered')),
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE message_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "message_logs_agency_access" ON message_logs
  FOR ALL TO authenticated
  USING (agency_id IN (SELECT p.agency_id FROM profiles p WHERE p.user_id = auth.uid()))
  WITH CHECK (agency_id IN (SELECT p.agency_id FROM profiles p WHERE p.user_id = auth.uid()));

GRANT ALL ON message_logs TO authenticated;

-- Shares (lead-property shares)
CREATE TABLE shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  agent_id UUID REFERENCES profiles(id),
  sent_via TEXT DEFAULT 'WhatsApp' CHECK (sent_via IN ('WhatsApp', 'SMS', 'Email')),
  link TEXT,
  message_preview TEXT DEFAULT '',
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "shares_agency_access" ON shares
  FOR ALL TO authenticated
  USING (agency_id IN (SELECT p.agency_id FROM profiles p WHERE p.user_id = auth.uid()))
  WITH CHECK (agency_id IN (SELECT p.agency_id FROM profiles p WHERE p.user_id = auth.uid()));

GRANT ALL ON shares TO authenticated;

-- Updated_at triggers
CREATE OR REPLACE TRIGGER leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION system.update_updated_at();
