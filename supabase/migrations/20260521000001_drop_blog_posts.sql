-- Remove deprecated admin blog feature storage.
DO $$
BEGIN
  IF to_regclass('dowon.blog_posts') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Allow public read for blog_posts" ON dowon.blog_posts;
    DROP POLICY IF EXISTS "Allow members to manage blog_posts" ON dowon.blog_posts;
  END IF;
END $$;

DROP TABLE IF EXISTS dowon.blog_posts;
