-- Recreate saju relation readings around day pillar context.
-- Existing generated readings are intentionally discarded.

DROP TABLE IF EXISTS public.saju_relation_readings CASCADE;

CREATE TABLE public.saju_relation_readings (
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

  CONSTRAINT saju_relation_readings_day_pillar_check
    CHECK (day_pillar IN (
      '甲子', '乙丑', '丙寅', '丁卯', '戊辰', '己巳', '庚午', '辛未', '壬申', '癸酉',
      '甲戌', '乙亥', '丙子', '丁丑', '戊寅', '己卯', '庚辰', '辛巳', '壬午', '癸未',
      '甲申', '乙酉', '丙戌', '丁亥', '戊子', '己丑', '庚寅', '辛卯', '壬辰', '癸巳',
      '甲午', '乙未', '丙申', '丁酉', '戊戌', '己亥', '庚子', '辛丑', '壬寅', '癸卯',
      '甲辰', '乙巳', '丙午', '丁未', '戊申', '己酉', '庚戌', '辛亥', '壬子', '癸丑',
      '甲寅', '乙卯', '丙辰', '丁巳', '戊午', '己未', '庚申', '辛酉', '壬戌', '癸亥'
    )),
  CONSTRAINT saju_relation_readings_day_stem_check
    CHECK (day_stem IN ('甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸')),
  CONSTRAINT saju_relation_readings_day_branch_check
    CHECK (day_branch IN ('子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥')),
  CONSTRAINT saju_relation_readings_actor_position_check
    CHECK (actor_position IN (
      'year_stem',
      'month_stem',
      'day_stem',
      'hour_stem',
      'year_branch',
      'month_branch',
      'day_branch',
      'hour_branch'
    )),
  CONSTRAINT saju_relation_readings_target_position_check
    CHECK (target_position IN (
      'year_stem',
      'month_stem',
      'day_stem',
      'hour_stem',
      'year_branch',
      'month_branch',
      'day_branch',
      'hour_branch'
    )),
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

CREATE INDEX saju_relation_readings_status_idx
  ON public.saju_relation_readings (status);

CREATE INDEX saju_relation_readings_lookup_idx
  ON public.saju_relation_readings (
    relation_type,
    relation_key,
    day_pillar,
    actor_position,
    target_position
  );

CREATE INDEX saju_relation_readings_created_at_idx
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
