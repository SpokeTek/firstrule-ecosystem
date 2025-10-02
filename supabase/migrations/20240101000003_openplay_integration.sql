-- OpenPlay Music API Integration Schema
-- Tracks commercial releases that use voice models

-- Commercial releases table
CREATE TABLE commercial_releases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  openplay_release_id VARCHAR(255) UNIQUE NOT NULL, -- OpenPlay's release ID
  title VARCHAR(500) NOT NULL,
  artist_name VARCHAR(255) NOT NULL,
  artist_id VARCHAR(255), -- OpenPlay artist ID
  type VARCHAR(50) CHECK (type IN ('single', 'album', 'ep')) NOT NULL,
  release_date DATE NOT NULL,
  upc VARCHAR(255),
  distributors JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Tracking fields
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'delisted')),
  total_tracks INTEGER DEFAULT 0,
  total_revenue DECIMAL(12,2) DEFAULT 0.00,
  total_streams BIGINT DEFAULT 0
);

-- Commercial tracks table (tracks that use voice models)
CREATE TABLE commercial_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  openplay_track_id VARCHAR(255) UNIQUE NOT NULL, -- OpenPlay's track ID
  commercial_release_id UUID REFERENCES commercial_releases(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  isrc VARCHAR(255),
  duration_seconds INTEGER,
  track_number INTEGER,

  -- Voice model linkage
  voice_model_id UUID REFERENCES voice_models(id) ON DELETE SET NULL,
  license_id UUID REFERENCES licenses(id) ON DELETE SET NULL,

  -- Attribution and usage details
  voice_usage_type VARCHAR(100) CHECK (voice_usage_type IN ('lead_vocal', 'background_vocal', 'ad_lib', 'harmony', 'sample', 'other')),
  prominence_score DECIMAL(3,2) CHECK (prominence_score >= 0 AND prominence_score <= 1), -- 0 to 1 scale
  usage_description TEXT,

  -- Commercial performance
  estimated_streams BIGINT DEFAULT 0,
  estimated_revenue DECIMAL(12,2) DEFAULT 0.00,
  last_updated TIMESTAMPTZ DEFAULT NOW(),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Metadata from OpenPlay
  openplay_metadata JSONB DEFAULT '{}'::jsonb
);

-- Release distribution table (tracks which platforms/stores)
CREATE TABLE release_distributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commercial_release_id UUID REFERENCES commercial_releases(id) ON DELETE CASCADE,
  platform VARCHAR(100) NOT NULL, -- Spotify, Apple Music, Amazon, etc.
  store_url TEXT,
  status VARCHAR(50) DEFAULT 'live' CHECK (status IN ('live', 'pending', 'removed')),
  availability_countries JSONB DEFAULT '[]'::jsonb,
  release_date_platform TIMESTAMPTZ,

  -- Platform-specific performance
  platform_streams BIGINT DEFAULT 0,
  platform_revenue DECIMAL(12,2) DEFAULT 0.00,
  last_updated TIMESTAMPTZ DEFAULT NOW(),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(commercial_release_id, platform)
);

-- Revenue reconciliation table
CREATE TABLE revenue_reconciliation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commercial_track_id UUID REFERENCES commercial_tracks(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  -- OpenPlay reported revenue
  openplay_revenue DECIMAL(12,2) DEFAULT 0.00,
  openplay_streams BIGINT DEFAULT 0,

  -- License-based expected revenue
  license_revenue DECIMAL(12,2) DEFAULT 0.00,

  -- Reconciliation status
  reconciliation_status VARCHAR(50) DEFAULT 'pending' CHECK (reconciliation_status IN ('pending', 'matched', 'discrepancy', 'resolved')),
  variance_amount DECIMAL(12,2) DEFAULT 0.00,
  variance_percentage DECIMAL(5,2) DEFAULT 0.00,

  -- Investigation notes
  notes TEXT,
  investigated_at TIMESTAMPTZ,
  investigated_by UUID REFERENCES auth.users(id),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(commercial_track_id, period_start, period_end)
);

-- Voice model performance analytics
CREATE TABLE voice_model_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voice_model_id UUID REFERENCES voice_models(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  -- Commercial usage metrics
  total_commercial_releases INTEGER DEFAULT 0,
  total_commercial_tracks INTEGER DEFAULT 0,
  total_commercial_streams BIGINT DEFAULT 0,
  total_commercial_revenue DECIMAL(12,2) DEFAULT 0.00,

  -- Distribution breakdown
  platform_breakdown JSONB DEFAULT '{}'::jsonb, -- { "Spotify": { "streams": 1000, "revenue": 500.00 }, ... }

  -- Attribution metrics
  average_prominence DECIMAL(3,2) DEFAULT 0.00,
  usage_type_breakdown JSONB DEFAULT '{}'::jsonb, -- { "lead_vocal": 5, "background_vocal": 3, ... }

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(voice_model_id, period_start, period_end)
);

-- Webhook events table (for audit trail)
CREATE TABLE openplay_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id VARCHAR(255) UNIQUE NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  payload JSONB NOT NULL,
  signature VARCHAR(255),
  processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_commercial_releases_openplay_id ON commercial_releases(openplay_release_id);
CREATE INDEX idx_commercial_releases_release_date ON commercial_releases(release_date);
CREATE INDEX idx_commercial_releases_status ON commercial_releases(status);

CREATE INDEX idx_commercial_tracks_openplay_id ON commercial_tracks(openplay_track_id);
CREATE INDEX idx_commercial_tracks_voice_model_id ON commercial_tracks(voice_model_id);
CREATE INDEX idx_commercial_tracks_license_id ON commercial_tracks(license_id);
CREATE INDEX idx_commercial_tracks_release_id ON commercial_tracks(commercial_release_id);

CREATE INDEX idx_release_distributions_release_id ON release_distributions(commercial_release_id);
CREATE INDEX idx_release_distributions_platform ON release_distributions(platform);

CREATE INDEX idx_revenue_reconciliation_track_id ON revenue_reconciliation(commercial_track_id);
CREATE INDEX idx_revenue_reconciliation_period ON revenue_reconciliation(period_start, period_end);
CREATE INDEX idx_revenue_reconciliation_status ON revenue_reconciliation(reconciliation_status);

CREATE INDEX idx_voice_model_analytics_model_id ON voice_model_analytics(voice_model_id);
CREATE INDEX idx_voice_model_analytics_period ON voice_model_analytics(period_start, period_end);

CREATE INDEX idx_webhook_events_processed ON openplay_webhook_events(processed);
CREATE INDEX idx_webhook_events_type ON openplay_webhook_events(event_type);

-- RLS policies (if using Supabase)
ALTER TABLE commercial_releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE commercial_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE release_distributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_reconciliation ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_model_analytics ENABLE ROW LEVEL SECURITY;

-- Only authenticated users can read their own data
CREATE POLICY "Users can view own commercial releases" ON commercial_releases
  FOR SELECT USING (
    voice_model_id IN (
      SELECT id FROM voice_models WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view own commercial tracks" ON commercial_tracks
  FOR SELECT USING (
    voice_model_id IN (
      SELECT id FROM voice_models WHERE user_id = auth.uid()
    )
  );

-- Functions for updating totals
CREATE OR REPLACE FUNCTION update_release_totals()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE commercial_releases
  SET
    total_tracks = (
      SELECT COUNT(*) FROM commercial_tracks
      WHERE commercial_release_id = NEW.commercial_release_id
    ),
    updated_at = NOW()
  WHERE id = NEW.commercial_release_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_release_totals
  AFTER INSERT OR DELETE ON commercial_tracks
  FOR EACH ROW
  EXECUTE FUNCTION update_release_totals();

-- Function to update analytics
CREATE OR REPLACE FUNCTION update_voice_model_analytics()
RETURNS TRIGGER AS $$
BEGIN
  -- This would be called periodically to update the analytics table
  -- Implementation would depend on specific analytics requirements
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Views for common queries
CREATE VIEW voice_model_commercial_summary AS
SELECT
  vm.id as voice_model_id,
  vm.name as voice_model_name,
  COUNT(DISTINCT cr.id) as total_releases,
  COUNT(DISTINCT ct.id) as total_tracks,
  COALESCE(SUM(ct.estimated_revenue), 0) as total_revenue,
  COALESCE(SUM(ct.estimated_streams), 0) as total_streams,
  MAX(cr.release_date) as latest_release_date
FROM voice_models vm
LEFT JOIN commercial_tracks ct ON ct.voice_model_id = vm.id
LEFT JOIN commercial_releases cr ON cr.id = ct.commercial_release_id
WHERE cr.status = 'active' OR cr.id IS NULL
GROUP BY vm.id, vm.name;