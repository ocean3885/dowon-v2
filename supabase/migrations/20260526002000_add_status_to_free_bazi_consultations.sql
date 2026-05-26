ALTER TABLE public.free_bazi_consultations
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'completed',
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS error_message TEXT;

ALTER TABLE public.free_bazi_consultations
  ALTER COLUMN result_text DROP NOT NULL;

UPDATE public.free_bazi_consultations
SET status = 'completed',
    completed_at = COALESCE(completed_at, created_at)
WHERE result_text IS NOT NULL
  AND status = 'completed';
