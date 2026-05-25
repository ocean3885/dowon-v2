-- Saju relation reading drafts and approved content generated or edited by staff.

CREATE TABLE IF NOT EXISTS public.saju_relation_readings (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,

  relation_type TEXT NOT NULL,
  relation_key TEXT NOT NULL,
  day_pillar TEXT NOT NULL,
  day_stem TEXT NOT NULL,
  day_branch TEXT NOT NULL,

  actor_char TEXT NOT NULL,
  target_char TEXT NOT NULL,
  actor_ten_star TEXT,
  target_ten_star TEXT,
  ten_star_pair TEXT,

  actor_position TEXT NOT NULL,
  target_position TEXT NOT NULL,
  palace_pair TEXT,

  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  detail TEXT NOT NULL,

  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'approved', 'archived')),
  source TEXT NOT NULL DEFAULT 'manual'
    CHECK (source IN ('manual', 'deepseek')),

  prompt_version TEXT,
  model TEXT,
  generated_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT saju_relation_readings_unique_context UNIQUE (
    relation_type,
    relation_key,
    day_pillar,
    actor_char,
    target_char,
    actor_position,
    target_position
  )
);

CREATE INDEX IF NOT EXISTS saju_relation_readings_status_idx
  ON public.saju_relation_readings (status);

CREATE INDEX IF NOT EXISTS saju_relation_readings_lookup_idx
  ON public.saju_relation_readings (
    relation_type,
    relation_key,
    day_pillar,
    actor_position,
    target_position
  );

CREATE INDEX IF NOT EXISTS saju_relation_readings_created_at_idx
  ON public.saju_relation_readings (created_at DESC);

ALTER TABLE public.saju_relation_readings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read approved saju relation readings"
  ON public.saju_relation_readings
  FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Allow staff to manage saju relation readings"
  ON public.saju_relation_readings
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

GRANT SELECT ON public.saju_relation_readings TO anon, authenticated;
GRANT ALL ON public.saju_relation_readings TO service_role;
GRANT ALL ON public.saju_relation_readings TO authenticated;
GRANT ALL ON SEQUENCE public.saju_relation_readings_id_seq TO authenticated, service_role;
