-- Initial Migration: Dowon Philosophy Center Schema
-- Consolidated for a fresh Supabase project using the public schema.

-- 1. Members Table (Whitelist for login)
CREATE TABLE IF NOT EXISTS public.members (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'admin', -- 'admin', 'staff'
  phone TEXT,
  birth_date TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Consultations Table
CREATE TABLE IF NOT EXISTS public.consultations (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL,
  gender TEXT, -- 'male', 'female'
  birth_date TEXT,
  birth_time TEXT,
  calendar_type TEXT, -- 'solar', 'lunar'
  contact TEXT NOT NULL,
  service_type TEXT NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'completed', 'cancelled'
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  post_limit INTEGER DEFAULT 5,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Posts Table
CREATE TABLE IF NOT EXISTS public.posts (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  category_id BIGINT REFERENCES public.categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author TEXT,
  view_count INTEGER DEFAULT 0,
  image_url TEXT,
  thumbnail_url TEXT,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Inmyunghanja Table
CREATE TABLE IF NOT EXISTS public.inmyunghanja (
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

-- 6. Submit Applications Table
CREATE TABLE IF NOT EXISTS public.submits (
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
    CHECK (status IN ('pending', 'paid', 'completed', 'cancelled')),
  ip_address TEXT,
  user_agent TEXT,
  admin_view_token TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS submits_created_at_idx
  ON public.submits (created_at DESC);

CREATE INDEX IF NOT EXISTS submits_user_id_idx
  ON public.submits (user_id);

CREATE INDEX IF NOT EXISTS submits_phone_idx
  ON public.submits (applicant_phone);

CREATE INDEX IF NOT EXISTS submits_consultation_targets_idx
  ON public.submits USING GIN (consultation_targets);

CREATE INDEX IF NOT EXISTS submits_status_idx
  ON public.submits (status);

CREATE INDEX IF NOT EXISTS submits_admin_view_token_idx
  ON public.submits (admin_view_token);

-- Enable RLS (Row Level Security)
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inmyunghanja ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submits ENABLE ROW LEVEL SECURITY;

-- Members: Only authenticated users can see member list
CREATE POLICY "Allow authenticated to read members"
  ON public.members
  FOR SELECT
  TO authenticated
  USING (TRUE);

-- Consultations: Admin members can read/delete/manage
CREATE POLICY "Allow members to manage consultations"
  ON public.consultations
  FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.members WHERE id = (SELECT auth.uid())));

-- Categories: Public read, members manage
CREATE POLICY "Allow public read for categories"
  ON public.categories
  FOR SELECT
  USING (TRUE);

CREATE POLICY "Allow members to manage categories"
  ON public.categories
  FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.members WHERE id = (SELECT auth.uid())));

-- Posts: Public read, members manage
CREATE POLICY "Allow public read for posts"
  ON public.posts
  FOR SELECT
  USING (TRUE);

CREATE POLICY "Allow members to manage posts"
  ON public.posts
  FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.members WHERE id = (SELECT auth.uid())));

-- Inmyunghanja: Public read
CREATE POLICY "Allow public read for inmyunghanja"
  ON public.inmyunghanja
  FOR SELECT
  USING (TRUE);

-- Submits: staff manage, signed-in users read their own applications
CREATE POLICY "Allow staff to manage submits"
  ON public.submits
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.members
      WHERE id = (SELECT auth.uid())
        AND role IN ('admin', 'staff')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.members
      WHERE id = (SELECT auth.uid())
        AND role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Allow users to read own submits"
  ON public.submits
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- Initial Data
INSERT INTO public.categories (name, display_order, post_limit, is_active) VALUES
  ('공지사항', 1, 5, TRUE),
  ('칼럼', 2, 6, TRUE),
  ('자유게시판', 3, 5, TRUE);

-- Atomic post view counter increment function
CREATE OR REPLACE FUNCTION public.increment_post_view(post_id BIGINT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.posts
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE id = post_id;
END;
$$;

-- API role permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon, authenticated, service_role;
