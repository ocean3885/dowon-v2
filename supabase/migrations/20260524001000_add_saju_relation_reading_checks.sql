-- Add value guards for saju relation reading classification fields.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'saju_relation_readings_day_pillar_check'
  ) THEN
    ALTER TABLE public.saju_relation_readings
      ADD CONSTRAINT saju_relation_readings_day_pillar_check
      CHECK (day_pillar IN (
        '甲子', '乙丑', '丙寅', '丁卯', '戊辰', '己巳', '庚午', '辛未', '壬申', '癸酉',
        '甲戌', '乙亥', '丙子', '丁丑', '戊寅', '己卯', '庚辰', '辛巳', '壬午', '癸未',
        '甲申', '乙酉', '丙戌', '丁亥', '戊子', '己丑', '庚寅', '辛卯', '壬辰', '癸巳',
        '甲午', '乙未', '丙申', '丁酉', '戊戌', '己亥', '庚子', '辛丑', '壬寅', '癸卯',
        '甲辰', '乙巳', '丙午', '丁未', '戊申', '己酉', '庚戌', '辛亥', '壬子', '癸丑',
        '甲寅', '乙卯', '丙辰', '丁巳', '戊午', '己未', '庚申', '辛酉', '壬戌', '癸亥'
      ));
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'saju_relation_readings_day_stem_check'
  ) THEN
    ALTER TABLE public.saju_relation_readings
      ADD CONSTRAINT saju_relation_readings_day_stem_check
      CHECK (day_stem IN ('甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'));
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'saju_relation_readings_day_branch_check'
  ) THEN
    ALTER TABLE public.saju_relation_readings
      ADD CONSTRAINT saju_relation_readings_day_branch_check
      CHECK (day_branch IN ('子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'));
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'saju_relation_readings_actor_position_check'
  ) THEN
    ALTER TABLE public.saju_relation_readings
      ADD CONSTRAINT saju_relation_readings_actor_position_check
      CHECK (actor_position IN (
        'year_stem',
        'month_stem',
        'day_stem',
        'hour_stem',
        'year_branch',
        'month_branch',
        'day_branch',
        'hour_branch'
      ));
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'saju_relation_readings_target_position_check'
  ) THEN
    ALTER TABLE public.saju_relation_readings
      ADD CONSTRAINT saju_relation_readings_target_position_check
      CHECK (target_position IN (
        'year_stem',
        'month_stem',
        'day_stem',
        'hour_stem',
        'year_branch',
        'month_branch',
        'day_branch',
        'hour_branch'
      ));
  END IF;
END $$;
