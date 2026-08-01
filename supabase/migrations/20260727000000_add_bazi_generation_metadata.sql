ALTER TABLE public.free_bazi_consultations
  ADD COLUMN IF NOT EXISTS prompt_version TEXT,
  ADD COLUMN IF NOT EXISTS generation_metadata JSONB;

ALTER TABLE public.guest_bazi_consultations
  ADD COLUMN IF NOT EXISTS prompt_version TEXT,
  ADD COLUMN IF NOT EXISTS generation_metadata JSONB;
