-- Guest bazi consultation results are separated from signed-in member storage.

CREATE TABLE IF NOT EXISTS public.service_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.service_settings (key, value)
VALUES ('guest_bazi_daily_limit', '{"enabled": true, "limit": 50}'::jsonb)
ON CONFLICT (key) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.guest_bazi_consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id TEXT NOT NULL,
  request_date_kst DATE NOT NULL,
  subject_name TEXT,
  bazi_result JSONB NOT NULL,
  prompt TEXT,
  result_text TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
  claimed_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  claimed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS guest_bazi_consultations_guest_created_idx
  ON public.guest_bazi_consultations (guest_id, created_at DESC);

CREATE INDEX IF NOT EXISTS guest_bazi_consultations_guest_daily_idx
  ON public.guest_bazi_consultations (guest_id, request_date_kst);

CREATE INDEX IF NOT EXISTS guest_bazi_consultations_daily_idx
  ON public.guest_bazi_consultations (request_date_kst);

ALTER TABLE public.free_bazi_consultations
  ADD COLUMN IF NOT EXISTS source_guest_consultation_id UUID UNIQUE REFERENCES public.guest_bazi_consultations(id) ON DELETE SET NULL;

ALTER TABLE public.service_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_bazi_consultations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow staff to manage service settings"
  ON public.service_settings
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

CREATE POLICY "Allow staff to manage guest bazi consultations"
  ON public.guest_bazi_consultations
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

GRANT ALL ON public.service_settings TO authenticated, service_role;
GRANT ALL ON public.guest_bazi_consultations TO authenticated, service_role;
