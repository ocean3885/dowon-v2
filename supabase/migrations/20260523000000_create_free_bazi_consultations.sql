-- Free bazi consultation results for signed-in members.

CREATE TABLE IF NOT EXISTS public.free_bazi_consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  request_date_kst DATE NOT NULL,
  bazi_result JSONB NOT NULL,
  prompt TEXT,
  result_text TEXT NOT NULL,
  email_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS free_bazi_consultations_one_per_day_idx
  ON public.free_bazi_consultations (user_id, request_date_kst);

CREATE INDEX IF NOT EXISTS free_bazi_consultations_user_created_idx
  ON public.free_bazi_consultations (user_id, created_at DESC);

ALTER TABLE public.free_bazi_consultations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to read own free bazi consultations"
  ON public.free_bazi_consultations
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Allow staff to manage free bazi consultations"
  ON public.free_bazi_consultations
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

GRANT ALL ON public.free_bazi_consultations TO authenticated, service_role;
