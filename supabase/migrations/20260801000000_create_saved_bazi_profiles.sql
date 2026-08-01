CREATE TABLE IF NOT EXISTS public.saved_bazi_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label TEXT,
  subject_name TEXT,
  birth_year TEXT NOT NULL,
  birth_month TEXT NOT NULL,
  birth_day TEXT NOT NULL,
  birth_hour TEXT NOT NULL,
  birth_minute TEXT NOT NULL,
  calendar_type TEXT NOT NULL DEFAULT 'sol',
  gender TEXT NOT NULL DEFAULT '남',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS saved_bazi_profiles_user_updated_idx
  ON public.saved_bazi_profiles (user_id, updated_at DESC);

ALTER TABLE public.saved_bazi_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to manage own saved bazi profiles"
  ON public.saved_bazi_profiles
  FOR ALL
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Allow staff to manage saved bazi profiles"
  ON public.saved_bazi_profiles
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

GRANT ALL ON public.saved_bazi_profiles TO authenticated, service_role;
