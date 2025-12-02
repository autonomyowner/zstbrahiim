-- Add video URL support to freelance services
-- Allows freelancers to add presentation videos to their service listings

ALTER TABLE public.freelance_services
ADD COLUMN IF NOT EXISTS video_url TEXT;

COMMENT ON COLUMN public.freelance_services.video_url
  IS 'URL of the service presentation video uploaded to Supabase Storage';
