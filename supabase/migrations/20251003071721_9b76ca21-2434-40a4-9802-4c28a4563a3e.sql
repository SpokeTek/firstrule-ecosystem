-- Phase 2: Backend Infrastructure Migration
-- User Roles, RBAC, Partner Integration, Enhanced M.E Models Schema

-- Create app_role enum for RBAC
CREATE TYPE public.app_role AS ENUM ('artist', 'partner', 'admin');

-- Create user_roles table for proper RBAC
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create profiles table if not exists
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  company TEXT,
  website TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for profiles
CREATE POLICY "Users can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Create profiles trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  
  -- Assign default 'artist' role to new users
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'artist');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Partner Organizations table
CREATE TABLE public.partner_organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  contact_email TEXT NOT NULL,
  website TEXT,
  logo_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended')),
  tier TEXT DEFAULT 'basic' CHECK (tier IN ('basic', 'premium', 'enterprise')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.partner_organizations ENABLE ROW LEVEL SECURITY;

-- Partner users junction table
CREATE TABLE public.partner_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES public.partner_organizations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE (partner_id, user_id)
);

ALTER TABLE public.partner_users ENABLE ROW LEVEL SECURITY;

-- Partner API keys table
CREATE TABLE public.partner_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES public.partner_organizations(id) ON DELETE CASCADE NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  key_prefix TEXT NOT NULL,
  name TEXT NOT NULL,
  scopes TEXT[] DEFAULT ARRAY['read']::TEXT[],
  rate_limit_per_minute INTEGER DEFAULT 60,
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.partner_api_keys ENABLE ROW LEVEL SECURITY;

-- Partner model access (which models partners can access)
CREATE TABLE public.partner_model_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES public.partner_organizations(id) ON DELETE CASCADE NOT NULL,
  model_id UUID REFERENCES public.me_models(id) ON DELETE CASCADE NOT NULL,
  access_type TEXT DEFAULT 'read' CHECK (access_type IN ('read', 'inference', 'training')),
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  UNIQUE (partner_id, model_id)
);

ALTER TABLE public.partner_model_access ENABLE ROW LEVEL SECURITY;

-- Model provenance for cryptographic verification
CREATE TABLE public.model_provenance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id UUID REFERENCES public.me_models(id) ON DELETE CASCADE NOT NULL,
  provenance_hash TEXT NOT NULL,
  chain_id TEXT,
  transaction_hash TEXT,
  block_number BIGINT,
  attestation_data JSONB NOT NULL,
  verified_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  verifier TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

ALTER TABLE public.model_provenance ENABLE ROW LEVEL SECURITY;

-- Training sessions for DAW training data
CREATE TABLE public.training_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id UUID REFERENCES public.me_models(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  session_type TEXT CHECK (session_type IN ('daw_workflow', 'vocal_training', 'instrument_training', 'production_training')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed', 'cancelled')),
  data_summary JSONB DEFAULT '{}'::jsonb,
  started_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  completed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb
);

ALTER TABLE public.training_sessions ENABLE ROW LEVEL SECURITY;

-- Training data uploads
CREATE TABLE public.training_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.training_sessions(id) ON DELETE CASCADE NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT,
  processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  extracted_features JSONB,
  uploaded_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  processed_at TIMESTAMPTZ
);

ALTER TABLE public.training_uploads ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Partner tables

-- Partner organizations
CREATE POLICY "Partners can view active organizations"
ON public.partner_organizations
FOR SELECT
TO authenticated
USING (status = 'active' OR id IN (
  SELECT partner_id FROM public.partner_users WHERE user_id = auth.uid()
));

CREATE POLICY "Admins can manage organizations"
ON public.partner_organizations
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Partner users
CREATE POLICY "Partner users can view their memberships"
ON public.partner_users
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR partner_id IN (
  SELECT partner_id FROM public.partner_users WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
));

-- Partner API keys
CREATE POLICY "Partner admins can manage their API keys"
ON public.partner_api_keys
FOR ALL
TO authenticated
USING (partner_id IN (
  SELECT partner_id FROM public.partner_users WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
));

-- Partner model access
CREATE POLICY "Partners can view their model access"
ON public.partner_model_access
FOR SELECT
TO authenticated
USING (
  partner_id IN (SELECT partner_id FROM public.partner_users WHERE user_id = auth.uid())
  OR model_id IN (SELECT id FROM public.me_models WHERE artist_id IN (SELECT id FROM public.artists WHERE user_id = auth.uid()))
);

CREATE POLICY "Model owners can grant access"
ON public.partner_model_access
FOR INSERT
TO authenticated
WITH CHECK (
  model_id IN (SELECT id FROM public.me_models WHERE artist_id IN (SELECT id FROM public.artists WHERE user_id = auth.uid()))
);

-- Model provenance
CREATE POLICY "Everyone can view provenance"
ON public.model_provenance
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Model owners can add provenance"
ON public.model_provenance
FOR INSERT
TO authenticated
WITH CHECK (
  model_id IN (SELECT id FROM public.me_models WHERE artist_id IN (SELECT id FROM public.artists WHERE user_id = auth.uid()))
);

-- Training sessions
CREATE POLICY "Users can manage their training sessions"
ON public.training_sessions
FOR ALL
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Model owners can view training sessions"
ON public.training_sessions
FOR SELECT
TO authenticated
USING (
  model_id IN (SELECT id FROM public.me_models WHERE artist_id IN (SELECT id FROM public.artists WHERE user_id = auth.uid()))
);

-- Training uploads
CREATE POLICY "Users can manage their training uploads"
ON public.training_uploads
FOR ALL
TO authenticated
USING (
  session_id IN (SELECT id FROM public.training_sessions WHERE user_id = auth.uid())
);

-- Create indexes for performance
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role);
CREATE INDEX idx_partner_users_partner_id ON public.partner_users(partner_id);
CREATE INDEX idx_partner_users_user_id ON public.partner_users(user_id);
CREATE INDEX idx_partner_api_keys_partner_id ON public.partner_api_keys(partner_id);
CREATE INDEX idx_partner_api_keys_key_hash ON public.partner_api_keys(key_hash);
CREATE INDEX idx_partner_model_access_partner_id ON public.partner_model_access(partner_id);
CREATE INDEX idx_partner_model_access_model_id ON public.partner_model_access(model_id);
CREATE INDEX idx_model_provenance_model_id ON public.model_provenance(model_id);
CREATE INDEX idx_training_sessions_model_id ON public.training_sessions(model_id);
CREATE INDEX idx_training_sessions_user_id ON public.training_sessions(user_id);
CREATE INDEX idx_training_uploads_session_id ON public.training_uploads(session_id);

-- Update triggers for timestamps
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_partner_organizations_updated_at
  BEFORE UPDATE ON public.partner_organizations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();