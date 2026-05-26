UPDATE public.submits
SET status = 'paid',
    updated_at = NOW()
WHERE status = 'contacted';

ALTER TABLE public.submits
DROP CONSTRAINT IF EXISTS submits_status_check;

ALTER TABLE public.submits
ADD CONSTRAINT submits_status_check
CHECK (status IN ('pending', 'paid', 'completed', 'cancelled'));
