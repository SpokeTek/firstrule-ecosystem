import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Music,
  PlayCircle,
  Calendar,
  Globe,
  DollarSign,
  TrendingUp,
  ExternalLink,
  Filter,
  BarChart3,
  Star,
  Clock,
  MapPin,
  Users
} from "lucide-react";
import { useState, useEffect } from "react";

interface CommercialRelease {
  id: string;
  openplay_release_id: string;
  title: string;
  artist_name: string;
  type: 'single' | 'album' | 'ep';
  release_date: string;
  total_tracks: number;
  total_revenue: number;
  total_streams: number;
  status: 'active' | 'inactive' | 'delisted';
  distributors: string[];
  platforms?: Array<{
    platform: string;
    status: string;
    streams: number;
    revenue: number;
    url?: string;
  }>;
  voice_model_tracks: Array<{
    id: string;
    title: string;
    voice_usage_type: string;
    prominence_score: number;
    estimated_revenue: number;
  }>;
}

const CommercialReleases = () => {
  const [releases, setReleases] = useState<CommercialRelease[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'recent' | 'top_performing'>('all');

  // Mock data - replace with actual API call
  const mockReleases: CommercialRelease[] = [
    {
      id: "1",
      openplay_release_id: "op_rel_001",
      title: "Midnight Dreams",
      artist_name: "Luna Sky",
      type: "single",
      release_date: "2024-06-15",
      total_tracks: 1,
      total_revenue: 2547.50,
      total_streams: 45234,
      status: "active",
      distributors: ["Spotify", "Apple Music", "Amazon Music"],
      platforms: [
        { platform: "Spotify", status: "live", streams: 28434, revenue: 1421.75 },
        { platform: "Apple Music", status: "live", streams: 12890, revenue: 773.40 },
        { platform: "Amazon Music", status: "live", streams: 3910, revenue: 352.35 }
      ],
      voice_model_tracks: [
        {
          id: "vt_001",
          title: "Midnight Dreams",
          voice_usage_type: "lead_vocal",
          prominence_score: 0.9,
          estimated_revenue: 2547.50
        }
      ]
    },
    {
      id: "2",
      openplay_release_id: "op_rel_002",
      title: "Electric Hearts",
      artist_name: "Neon Pulse",
      type: "album",
      release_date: "2024-05-20",
      total_tracks: 2,
      total_revenue: 3210.00,
      total_streams: 67890,
      status: "active",
      distributors: ["Spotify", "Apple Music", "Tidal"],
      platforms: [
        { platform: "Spotify", status: "live", streams: 42345, revenue: 2117.25 },
        { platform: "Apple Music", status: "live", streams: 18765, revenue: 756.50 },
        { platform: "Tidal", status: "live", streams: 6780, revenue: 336.25 }
      ],
      voice_model_tracks: [
        {
          id: "vt_002",
          title: "Electric Hearts - Main",
          voice_usage_type: "lead_vocal",
          prominence_score: 0.8,
          estimated_revenue: 2100.00
        },
        {
          id: "vt_003",
          title: "Electric Hearts - Remix",
          voice_usage_type: "background_vocal",
          prominence_score: 0.4,
          estimated_revenue: 1110.00
        }
      ]
    },
    {
      id: "3",
      openplay_release_id: "op_rel_003",
      title: "Summer Vibes",
      artist_name: "Coastal Dreams",
      type: "single",
      release_date: "2024-04-10",
      total_tracks: 1,
      total_revenue: 892.50,
      total_streams: 15432,
      status: "active",
      distributors: ["Spotify", "Apple Music"],
      platforms: [
        { platform: "Spotify", status: "live", streams: 9876, revenue: 493.80 },
        { platform: "Apple Music", status: "live", streams: 5556, revenue: 398.70 }
      ],
      voice_model_tracks: [
        {
          id: "vt_004",
          title: "Summer Vibes",
          voice_usage_type: "harmony",
          prominence_score: 0.6,
          estimated_revenue: 892.50
        }
      ]
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setReleases(mockReleases);
      setLoading(false);
    }, 1000);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalRevenue = releases.reduce((sum, release) => sum + release.total_revenue, 0);
  const totalStreams = releases.reduce((sum, release) => sum + release.total_streams, 0);
  const totalReleases = releases.length;

  const getProminenceColor = (score: number) => {
    if (score >= 0.8) return "text-green-500";
    if (score >= 0.5) return "text-amber-500";
    return "text-red-500";
  };

  const getUsageTypeLabel = (type: string) => {
    switch (type) {
      case "lead_vocal": return "Lead Vocal";
      case "background_vocal": return "Background Vocal";
      case "harmony": return "Harmony";
      case "ad_lib": return "Ad Lib";
      default: return type;
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "Spotify": return "🎵";
      case "Apple Music": return "🍎";
      case "Amazon Music": return "📦";
      case "Tidal": return "🌊";
      default: return "🎼";
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-64 mb-4" />
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-muted rounded" />
            ))}
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-6 bg-gradient-card backdrop-blur-sm border-primary/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Total Releases</h3>
            <Music className="w-5 h-5 text-primary" />
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-bold">{totalReleases}</p>
            <p className="text-sm text-muted-foreground">Commercial releases using your voice</p>
            <div className="flex items-center gap-2 text-xs text-green-500">
              <TrendingUp className="w-3 h-3" />
              <span>3 new this month</span>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-card backdrop-blur-sm border-primary/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Total Revenue</h3>
            <DollarSign className="w-5 h-5 text-secondary" />
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-bold">${totalRevenue.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">From commercial distribution</p>
            <div className="flex items-center gap-2 text-xs text-green-500">
              <TrendingUp className="w-3 h-3" />
              <span>+$847 this month</span>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-card backdrop-blur-sm border-primary/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Total Streams</h3>
            <PlayCircle className="w-5 h-5 text-primary" />
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-bold">{totalStreams.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Across all platforms</p>
            <div className="flex items-center gap-2 text-xs text-green-500">
              <TrendingUp className="w-3 h-3" />
              <span>+12.3K this week</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Filter Controls */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
          >
            All Releases
          </Button>
          <Button
            variant={filter === 'recent' ? 'default' : 'outline'}
            onClick={() => setFilter('recent')}
          >
            Recent
          </Button>
          <Button
            variant={filter === 'top_performing' ? 'default' : 'outline'}
            onClick={() => setFilter('top_performing')}
          >
            Top Performing
          </Button>
        </div>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          More Filters
        </Button>
      </div>

      {/* Releases List */}
      <div className="space-y-6">
        {releases.map((release) => (
          <Card key={release.id} className="p-6 bg-gradient-card backdrop-blur-sm border-primary/10">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-semibold">{release.title}</h3>
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                      {release.type === 'single' ? 'Single' : release.type === 'album' ? 'Album' : 'EP'}
                    </Badge>
                    <Badge variant="outline" className="border-green-500/30 text-green-500">
                      {release.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {release.artist_name}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(release.release_date).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Music className="w-3 h-3" />
                      {release.voice_model_tracks.length} voice track{release.voice_model_tracks.length > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-500">${release.total_revenue.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">{release.total_streams.toLocaleString()} streams</p>
                </div>
              </div>

              {/* Platform Distribution */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">Platform Distribution</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {release.platforms?.map((platform) => (
                    <div key={platform.platform} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getPlatformIcon(platform.platform)}</span>
                        <span className="text-sm font-medium">{platform.platform}</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>{platform.streams.toLocaleString()} streams</span>
                          <span>${platform.revenue.toLocaleString()}</span>
                        </div>
                        <Progress
                          value={(platform.streams / release.total_streams) * 100}
                          className="h-1"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Voice Model Usage */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">Voice Model Usage</h4>
                <div className="grid gap-3">
                  {release.voice_model_tracks.map((track) => (
                    <div key={track.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-primary/5">
                      <div className="space-y-1">
                        <p className="font-medium">{track.title}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <Badge variant="secondary" className="text-xs">
                            {getUsageTypeLabel(track.voice_usage_type)}
                          </Badge>
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            Prominence:
                            <span className={`font-medium ${getProminenceColor(track.prominence_score)}`}>
                              {(track.prominence_score * 100).toFixed(0)}%
                            </span>
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${track.estimated_revenue.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Estimated revenue</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Detailed Analytics
                  </Button>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View on Platforms
                  </Button>
                </div>
                <Badge variant="secondary" className="text-xs">
                  <Clock className="w-3 h-3 mr-1" />
                  Last updated: 2 hours ago
                </Badge>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CommercialReleases;