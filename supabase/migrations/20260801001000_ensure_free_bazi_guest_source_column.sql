ALTER TABLE public.free_bazi_consultations
  ADD COLUMN IF NOT EXISTS source_guest_consultation_id UUID;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'free_bazi_consultations_source_guest_consultation_id_fkey'
      AND conrelid = 'public.free_bazi_consultations'::regclass
  ) THEN
    ALTER TABLE public.free_bazi_consultations
      ADD CONSTRAINT free_bazi_consultations_source_guest_consultation_id_fkey
      FOREIGN KEY (source_guest_consultation_id)
      REFERENCES public.guest_bazi_consultations(id)
      ON DELETE SET NULL;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS free_bazi_consultations_source_guest_consultation_id_key
  ON public.free_bazi_consultations (source_guest_consultation_id)
  WHERE source_guest_consultation_id IS NOT NULL;
