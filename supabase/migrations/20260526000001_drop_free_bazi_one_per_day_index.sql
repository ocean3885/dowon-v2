-- Drop the unique constraint index to allow cumulative testing for admin/staff members.
-- Strict daily limit for standard users is securely enforced at the API layer instead.

DROP INDEX IF EXISTS public.free_bazi_consultations_one_per_day_idx;
