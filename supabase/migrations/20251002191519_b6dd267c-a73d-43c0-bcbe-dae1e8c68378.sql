-- Create enum types for roles and license types
CREATE TYPE public.license_type AS ENUM ('personal', 'commercial', 'enterprise');
CREATE TYPE public.usage_status AS ENUM ('pending', 'active', 'completed', 'revoked');

-- Artists table (user profiles)
CREATE TABLE public.artists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  artist_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- M.E Models table (voice models)
CREATE TABLE public.me_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL REFERENCES public.artists(id) ON DELETE CASCADE,
  canonical_name TEXT NOT NULL UNIQUE,
  model_name TEXT NOT NULL,
  description TEXT,
  sample_url TEXT,
  exclusions TEXT,
  provenance JSONB DEFAULT '{"ground_truth": false, "attestation": false}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Licenses table
CREATE TABLE public.licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id UUID NOT NULL REFERENCES public.me_models(id) ON DELETE CASCADE,
  licensee_email TEXT NOT NULL,
  license_type public.license_type NOT NULL,
  license_token TEXT UNIQUE,
  terms JSONB,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true
);

-- Usage records table
CREATE TABLE public.usage_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  license_id UUID NOT NULL REFERENCES public.licenses(id) ON DELETE CASCADE,
  model_id UUID NOT NULL REFERENCES public.me_models(id) ON DELETE CASCADE,
  usage_metadata JSONB,
  status public.usage_status NOT NULL DEFAULT 'pending',
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- SessionChain attestations (provenance ledger)
CREATE TABLE public.sessionchain_attestations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usage_id UUID REFERENCES public.usage_records(id) ON DELETE SET NULL,
  model_id UUID NOT NULL REFERENCES public.me_models(id) ON DELETE CASCADE,
  attestation_hash TEXT NOT NULL,
  payload JSONB NOT NULL,
  attested_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.me_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessionchain_attestations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for artists
CREATE POLICY "Users can view all artist profiles"
  ON public.artists FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own artist profile"
  ON public.artists FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own artist profile"
  ON public.artists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for me_models
CREATE POLICY "Everyone can view active models"
  ON public.me_models FOR SELECT
  USING (is_active = true);

CREATE POLICY "Artists can manage their own models"
  ON public.me_models FOR ALL
  USING (artist_id IN (SELECT id FROM public.artists WHERE user_id = auth.uid()));

-- RLS Policies for licenses (public for partner integrations)
CREATE POLICY "Authenticated users can view licenses"
  ON public.licenses FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create licenses"
  ON public.licenses FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for usage_records
CREATE POLICY "Authenticated users can view usage records"
  ON public.usage_records FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert usage records"
  ON public.usage_records FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for sessionchain_attestations (public read, append-only)
CREATE POLICY "Everyone can view attestations"
  ON public.sessionchain_attestations FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create attestations"
  ON public.sessionchain_attestations FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add updated_at triggers
CREATE TRIGGER update_artists_updated_at
  BEFORE UPDATE ON public.artists
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_me_models_updated_at
  BEFORE UPDATE ON public.me_models
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed Joel Kaiser demo data
INSERT INTO public.artists (id, artist_name, email, bio)
VALUES (
  'a1111111-1111-1111-1111-111111111111',
  'Joel Kaiser',
  'joel@firstrule.ai',
  'Vocal artist pioneering ethical AI voice licensing with First Rule™'
);

INSERT INTO public.me_models (artist_id, canonical_name, model_name, description, sample_url, provenance, exclusions)
VALUES (
  'a1111111-1111-1111-1111-111111111111',
  'JoelKaiser – Vocal Essence v1',
  'Vocal Essence v1',
  'Joel Kaiser''s signature vocal model featuring rich tonal quality and emotional range. Perfect for contemporary productions across multiple genres.',
  '/assets/stems/joel-kaiser-vocal-essence-v1.mp3',
  '{"ground_truth": true, "attestation": true}'::jsonb,
  'Explicit content, political messaging, misleading deepfakes'
);