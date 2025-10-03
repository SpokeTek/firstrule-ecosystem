-- Add identity verification to artists table
ALTER TABLE public.artists 
ADD COLUMN identity_verified boolean DEFAULT false NOT NULL;

-- Update RLS policy on me_models to require identity verification for creating models
DROP POLICY IF EXISTS "Artists can manage their own models" ON public.me_models;

CREATE POLICY "Artists can view and update their own models"
ON public.me_models
FOR SELECT
USING (
  artist_id IN (
    SELECT id FROM public.artists WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Verified artists can create models"
ON public.me_models
FOR INSERT
WITH CHECK (
  artist_id IN (
    SELECT id FROM public.artists 
    WHERE user_id = auth.uid() 
    AND identity_verified = true
  )
);

CREATE POLICY "Artists can update their own models"
ON public.me_models
FOR UPDATE
USING (
  artist_id IN (
    SELECT id FROM public.artists WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Artists can delete their own models"
ON public.me_models
FOR DELETE
USING (
  artist_id IN (
    SELECT id FROM public.artists WHERE user_id = auth.uid()
  )
);