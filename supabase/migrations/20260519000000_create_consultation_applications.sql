-- Migration: Create submit page applications table
-- Created At: 2026-05-19

CREATE TABLE IF NOT EXISTS dowon.submits (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  applicant_name TEXT NOT NULL,
  applicant_phone TEXT NOT NULL,
  applicant_email TEXT,
  application_password_hash TEXT,
  consultation_targets JSONB NOT NULL DEFAULT '[]'::jsonb
    CHECK (jsonb_typeof(consultation_targets) = 'array'),
  service_type TEXT NOT NULL
    CHECK (service_type IN ('saju', 'love', 'career', 'wealth', 'naming', 'moving')),
  service_details JSONB,
  concern TEXT,
  privacy_agreed BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'contacted', 'completed', 'cancelled')),
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS submits_created_at_idx
  ON dowon.submits (created_at DESC);

CREATE INDEX IF NOT EXISTS submits_user_id_idx
  ON dowon.submits (user_id);

CREATE INDEX IF NOT EXISTS submits_phone_idx
  ON dowon.submits (applicant_phone);

CREATE INDEX IF NOT EXISTS submits_consultation_targets_idx
  ON dowon.submits USING GIN (consultation_targets);

CREATE INDEX IF NOT EXISTS submits_status_idx
  ON dowon.submits (status);

ALTER TABLE dowon.submits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow staff to manage submits"
  ON dowon.submits
  FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM dowon.members WHERE id = (select auth.uid()) AND role IN ('admin', 'staff')))
  WITH CHECK (EXISTS (SELECT 1 FROM dowon.members WHERE id = (select auth.uid()) AND role IN ('admin', 'staff')));

CREATE POLICY "Allow users to read own submits"
  ON dowon.submits
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

GRANT ALL ON TABLE dowon.submits TO anon, authenticated, service_role;
GRANT ALL ON SEQUENCE dowon.submits_id_seq TO anon, authenticated, service_role;
