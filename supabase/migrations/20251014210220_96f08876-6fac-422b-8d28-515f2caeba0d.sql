-- Fix PUBLIC_DATA_EXPOSURE: Create safe public views for artists and profiles

-- Drop the misleading public policy on artists table
DROP POLICY IF EXISTS "Public can view artist profiles without email" ON public.artists;

-- Create a safe public view for artist profiles (excludes email and user_id)
CREATE OR REPLACE VIEW public.public_artist_profiles AS
SELECT 
  id,
  artist_name,
  bio,
  identity_verified,
  created_at,
  updated_at
FROM public.artists
WHERE identity_verified = true;

-- Enable RLS on the view
ALTER VIEW public.public_artist_profiles SET (security_invoker = true);

-- Grant select permissions
GRANT SELECT ON public.public_artist_profiles TO authenticated, anon;

-- Create a safe public view for user profiles (excludes email)
CREATE OR REPLACE VIEW public.public_user_profiles AS
SELECT 
  id,
  full_name,
  avatar_url,
  bio,
  company,
  website,
  created_at,
  updated_at
FROM public.profiles;

-- Enable RLS on the view
ALTER VIEW public.public_user_profiles SET (security_invoker = true);

-- Grant select permissions
GRANT SELECT ON public.public_user_profiles TO authenticated, anon;

-- Update the profiles table RLS policy to be more restrictive for direct access
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

CREATE POLICY "Users can view their own complete profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

-- Comment explaining the security model
COMMENT ON VIEW public.public_artist_profiles IS 'Public view of artist profiles excluding sensitive data (email, user_id). Only shows verified artists.';
COMMENT ON VIEW public.public_user_profiles IS 'Public view of user profiles excluding sensitive data (email). Use this for public profile listings.';