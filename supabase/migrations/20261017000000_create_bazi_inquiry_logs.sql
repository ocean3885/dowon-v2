-- Migration: Create bazi inquiry logs table for storing all Bazi checks from /bazi
CREATE TABLE IF NOT EXISTS public.bazi_inquiry_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    subject_name TEXT,
    gender TEXT NOT NULL, -- '남' | '여'
    birth_year INTEGER NOT NULL,
    birth_month INTEGER NOT NULL,
    birth_day INTEGER NOT NULL,
    birth_hour INTEGER NOT NULL,
    birth_min INTEGER NOT NULL,
    calendar_type TEXT NOT NULL, -- '양력' | '음력' | '윤달'
    bazi_result JSONB NOT NULL,
    client_ip TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indices for fast searching and pagination
CREATE INDEX IF NOT EXISTS bazi_inquiry_logs_created_at_idx 
    ON public.bazi_inquiry_logs (created_at DESC);

CREATE INDEX IF NOT EXISTS bazi_inquiry_logs_subject_name_idx 
    ON public.bazi_inquiry_logs (subject_name);

CREATE INDEX IF NOT EXISTS bazi_inquiry_logs_user_id_idx 
    ON public.bazi_inquiry_logs (user_id);

-- Enable RLS
ALTER TABLE public.bazi_inquiry_logs ENABLE ROW LEVEL SECURITY;

-- Allow admin and staff to read and manage
CREATE POLICY "Allow staff to manage bazi inquiry logs"
  ON public.bazi_inquiry_logs
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

GRANT ALL ON public.bazi_inquiry_logs TO authenticated, service_role;
