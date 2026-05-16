-- Initial Migration: Dowon Philosophy Center Schema
-- Created At: 2026-05-16

CREATE SCHEMA IF NOT EXISTS dowon;

-- 1. Members Table (Whitelist for login)
-- This table identifies who is allowed to access the Dowon project.
CREATE TABLE IF NOT EXISTS dowon.members (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'admin', -- 'admin', 'staff'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Consultations Table
CREATE TABLE IF NOT EXISTS dowon.consultations (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL,
  gender TEXT, -- 'male', 'female'
  birth_date TEXT,
  birth_time TEXT,
  calendar_type TEXT, -- 'solar', 'lunar'
  contact TEXT NOT NULL,
  service_type TEXT NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'contacted', 'completed', 'cancelled'
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Categories Table
CREATE TABLE IF NOT EXISTS dowon.categories (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  post_limit INTEGER DEFAULT 5,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Posts Table
CREATE TABLE IF NOT EXISTS dowon.posts (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  category_id BIGINT REFERENCES dowon.categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author TEXT,
  view_count INTEGER DEFAULT 0,
  image_url TEXT,
  thumbnail_url TEXT,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Blog Posts (External links)
CREATE TABLE IF NOT EXISTS dowon.blog_posts (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  title TEXT NOT NULL,
  summary TEXT,
  content_url TEXT NOT NULL,
  thumbnail_url TEXT,
  category TEXT,
  published_date TEXT,
  is_selected BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE dowon.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE dowon.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE dowon.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE dowon.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE dowon.blog_posts ENABLE ROW LEVEL SECURITY;

-- Create Policies

-- Members: Only authenticated users can see member list
CREATE POLICY "Allow authenticated to read members" ON dowon.members FOR SELECT TO authenticated USING (TRUE);

-- Consultations: Admin (members) can read/delete/manage
CREATE POLICY "Allow members to manage consultations" ON dowon.consultations FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM dowon.members WHERE id = (select auth.uid())));

-- Categories: Public read, Admin manage
CREATE POLICY "Allow public read for categories" ON dowon.categories FOR SELECT USING (TRUE);
CREATE POLICY "Allow members to manage categories" ON dowon.categories FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM dowon.members WHERE id = (select auth.uid())));

-- Posts: Public read, Admin manage
CREATE POLICY "Allow public read for posts" ON dowon.posts FOR SELECT USING (TRUE);
CREATE POLICY "Allow members to manage posts" ON dowon.posts FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM dowon.members WHERE id = (select auth.uid())));

-- Blog Posts: Public read, Admin manage
CREATE POLICY "Allow public read for blog_posts" ON dowon.blog_posts FOR SELECT USING (TRUE);
CREATE POLICY "Allow members to manage blog_posts" ON dowon.blog_posts FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM dowon.members WHERE id = (select auth.uid())));

-- Initial Data
INSERT INTO dowon.categories (name, display_order, post_limit, is_active) VALUES 
('공지사항', 1, 5, TRUE),
('칼럼', 2, 6, TRUE),
('자유게시판', 3, 5, TRUE);

-- Grant Permissions (Ensure API and Roles can access the schema)
GRANT USAGE ON SCHEMA dowon TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA dowon TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA dowon TO anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA dowon TO anon, authenticated, service_role;

-- Future-proof: Grant permissions for any new tables created later
ALTER DEFAULT PRIVILEGES IN SCHEMA dowon GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA dowon GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA dowon GRANT ALL ON FUNCTIONS TO anon, authenticated, service_role;
