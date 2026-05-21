-- Add a random token for direct, login-free consultation detail links sent by SMS.
ALTER TABLE dowon.submits
  ADD COLUMN IF NOT EXISTS admin_view_token TEXT UNIQUE;

CREATE INDEX IF NOT EXISTS submits_admin_view_token_idx
  ON dowon.submits (admin_view_token);
