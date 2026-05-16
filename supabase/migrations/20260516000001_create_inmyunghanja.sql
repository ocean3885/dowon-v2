-- Migration: Create Inmyunghanja table
-- Created At: 2026-05-16

CREATE TABLE IF NOT EXISTS dowon.inmyunghanja (
  pk BIGINT PRIMARY KEY,
  pron TEXT,
  char TEXT,
  main_mean TEXT,
  tot_stk INTEGER,
  main_elem TEXT,
  disused BOOLEAN DEFAULT FALSE,
  rad_stk INTEGER,
  rad TEXT,
  rad_elem TEXT,
  detail_mean TEXT,
  meaning TEXT,
  stk_info TEXT,
  rad_id INTEGER,
  no_rad_stk INTEGER,
  rad_mean TEXT
);

-- Enable RLS (Row Level Security)
ALTER TABLE dowon.inmyunghanja ENABLE ROW LEVEL SECURITY;

-- Create Policies
-- Allow public read for everyone
CREATE POLICY "Allow public read for inmyunghanja" ON dowon.inmyunghanja FOR SELECT USING (TRUE);

-- Grant Permissions
GRANT ALL ON dowon.inmyunghanja TO anon, authenticated, service_role;
