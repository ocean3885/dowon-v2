-- Migration: Add atomic post view counter increment function

CREATE OR REPLACE FUNCTION dowon.increment_post_view(post_id BIGINT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = dowon
AS $$
BEGIN
  UPDATE dowon.posts
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE id = post_id;
END;
$$;

