import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Award,
  Star,
  Users,
  Globe,
  TrendingUp,
  Shield,
  Music,
  Mic,
  Clock,
  ExternalLink,
  Download,
  Share2,
  MessageSquare
} from "lucide-react";
import { useState } from "react";

interface AttributionData {
  id: string;
  trackTitle: string;
  artistName: string;
  releaseTitle: string;
  voiceUsageType: string;
  prominenceScore: number;
  attributionLevel: "featured" | "background" | "sampled";
  credits: {
    vocalPerformance: boolean;
    songwriting: boolean;
    production: boolean;
    arrangement: boolean;
  };
  platforms: Array<{
    name: string;
    url?: string;
    attributed: boolean;
    attributionText?: string;
  }>;
  metadata: {
    isrc?: string;
    iswc?: string;
    upc?: string;
    releaseDate: string;
    duration: number;
  };
  verification: {
    sessionChainVerified: boolean;
    groundTruthVerified: boolean;
    manuallyVerified: boolean;
  };
}

const ReleaseAttribution = () => {
  const [selectedAttribution, setSelectedAttribution] = useState<string | null>(null);

  // Mock attribution data
  const attributionData: AttributionData[] = [
    {
      id: "att_001",
      trackTitle: "Midnight Dreams",
      artistName: "Luna Sky",
      releaseTitle: "Midnight Dreams",
      voiceUsageType: "lead_vocal",
      prominenceScore: 0.9,
      attributionLevel: "featured",
      credits: {
        vocalPerformance: true,
        songwriting: false,
        production: false,
        arrangement: false
      },
      platforms: [
        { name: "Spotify", attributed: true, attributionText: "Lead Vocal - Your Voice Name" },
        { name: "Apple Music", attributed: true, attributionText: "Featuring Your Voice Name" },
        { name: "Amazon Music", attributed: true, attributionText: "Vocals by Your Voice Name" },
        { name: "Tidal", attributed: false }
      ],
      metadata: {
        isrc: "USUM72405478",
        iswc: "T-905.789.123-4",
        upc: "886448123456",
        releaseDate: "2024-06-15",
        duration: 245
      },
      verification: {
        sessionChainVerified: true,
        groundTruthVerified: true,
        manuallyVerified: false
      }
    },
    {
      id: "att_002",
      trackTitle: "Electric Hearts",
      artistName: "Neon Pulse",
      releaseTitle: "Electric Hearts",
      voiceUsageType: "lead_vocal",
      prominenceScore: 0.8,
      attributionLevel: "featured",
      credits: {
        vocalPerformance: true,
        songwriting: true,
        production: false,
        arrangement: false
      },
      platforms: [
        { name: "Spotify", attributed: true, attributionText: "Lead Vocal & Songwriting - Your Voice Name" },
        { name: "Apple Music", attributed: true, attributionText: "Written & Performed by Your Voice Name" },
        { name: "YouTube Music", attributed: true, attributionText: "Vocals: Your Voice Name" },
        { name: "Deezer", attributed: false }
      ],
      metadata: {
        isrc: "USUM72405479",
        iswc: "T-905.789.124-5",
        upc: "886448123457",
        releaseDate: "2024-05-20",
        duration: 198
      },
      verification: {
        sessionChainVerified: true,
        groundTruthVerified: false,
        manuallyVerified: true
      }
    },
    {
      id: "att_003",
      trackTitle: "Summer Vibes",
      artistName: "Coastal Dreams",
      releaseTitle: "Summer Vibes",
      voiceUsageType: "harmony",
      prominenceScore: 0.6,
      attributionLevel: "background",
      credits: {
        vocalPerformance: true,
        songwriting: false,
        production: false,
        arrangement: true
      },
      platforms: [
        { name: "Spotify", attributed: true, attributionText: "Background Vocals - Your Voice Name" },
        { name: "Apple Music", attributed: false },
        { name: "Amazon Music", attributed: true, attributionText: "Harmony Vocals: Your Voice Name" }
      ],
      metadata: {
        isrc: "USUM72405480",
        upc: "886448123458",
        releaseDate: "2024-04-10",
        duration: 187
      },
      verification: {
        sessionChainVerified: true,
        groundTruthVerified: true,
        manuallyVerified: true
      }
    }
  ];

  const getAttributionLevelColor = (level: string) => {
    switch (level) {
      case "featured": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "background": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "sampled": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getProminenceColor = (score: number) => {
    if (score >= 0.8) return "text-green-500";
    if (score >= 0.5) return "text-amber-500";
    return "text-red-500";
  };

  const fullyAttributedCount = attributionData.filter(att =>
    att.platforms.every(platform => platform.attributed)
  ).length;

  const attributionRate = (fullyAttributedCount / attributionData.length) * 100;

  return (
    <div className="space-y-6">
      {/* Attribution Overview */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-card backdrop-blur-sm border-primary/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Attribution Rate</h3>
            <Award className="w-4 h-4 text-primary" />
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-bold">{attributionRate.toFixed(1)}%</p>
            <p className="text-sm text-muted-foreground">Properly attributed tracks</p>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Progress</span>
                <span>{fullyAttributedCount}/{attributionData.length}</span>
              </div>
              <Progress value={attributionRate} className="h-2" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-card backdrop-blur-sm border-primary/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Total Credits</h3>
            <Star className="w-4 h-4 text-secondary" />
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-bold">7</p>
            <p className="text-sm text-muted-foreground">Credit types received</p>
            <div className="flex gap-2 mt-3">
              <Badge variant="secondary" className="text-xs">Vocal Performance</Badge>
              <Badge variant="secondary" className="text-xs">Songwriting</Badge>
              <Badge variant="secondary" className="text-xs">Arrangement</Badge>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-card backdrop-blur-sm border-primary/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Platform Coverage</h3>
            <Globe className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-bold">89%</p>
            <p className="text-sm text-muted-foreground">Platforms with proper attribution</p>
            <div className="flex items-center gap-2 text-xs text-green-500">
              <TrendingUp className="w-3 h-3" />
              <span>+5% this month</span>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-card backdrop-blur-sm border-primary/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Verification</h3>
            <Shield className="w-4 h-4 text-green-500" />
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-bold">100%</p>
            <p className="text-sm text-muted-foreground">SessionChain verified</p>
            <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/20 text-xs">
              All tracks verified
            </Badge>
          </div>
        </Card>
      </div>

      {/* Attribution Details */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">Release Attribution Details</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        {attributionData.map((attribution) => (
          <Card key={attribution.id} className="p-6 bg-gradient-card backdrop-blur-sm border-primary/10">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h4 className="text-lg font-semibold">{attribution.trackTitle}</h4>
                    <Badge className={getAttributionLevelColor(attribution.attributionLevel)}>
                      {attribution.attributionLevel}
                    </Badge>
                    <Badge variant="outline" className="border-green-500/30 text-green-500">
                      <Shield className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {attribution.artistName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Music className="w-3 h-3" />
                      {attribution.releaseTitle}
                    </span>
                    <span className="flex items-center gap-1">
                      <Mic className="w-3 h-3" />
                      Prominence: <span className={`font-medium ${getProminenceColor(attribution.prominenceScore)}`}>
                        {(attribution.prominenceScore * 100).toFixed(0)}%
                      </span>
                    </span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedAttribution(
                    selectedAttribution === attribution.id ? null : attribution.id
                  )}
                >
                  {selectedAttribution === attribution.id ? "Hide Details" : "Show Details"}
                </Button>
              </div>

              {/* Credits */}
              <div className="space-y-2">
                <h5 className="text-sm font-medium text-muted-foreground">Credits Received</h5>
                <div className="flex flex-wrap gap-2">
                  {attribution.credits.vocalPerformance && (
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                      <Mic className="w-3 h-3 mr-1" />
                      Vocal Performance
                    </Badge>
                  )}
                  {attribution.credits.songwriting && (
                    <Badge variant="secondary" className="bg-secondary/10 text-secondary border-secondary/20">
                      <Star className="w-3 h-3 mr-1" />
                      Songwriting
                    </Badge>
                  )}
                  {attribution.credits.production && (
                    <Badge variant="secondary" className="bg-amber-500/10 text-amber-500 border-amber-500/20">
                      <Music className="w-3 h-3 mr-1" />
                      Production
                    </Badge>
                  )}
                  {attribution.credits.arrangement && (
                    <Badge variant="secondary" className="bg-cyan-500/10 text-cyan-500 border-cyan-500/20">
                      <Award className="w-3 h-3 mr-1" />
                      Arrangement
                    </Badge>
                  )}
                </div>
              </div>

              {/* Platform Attribution */}
              <div className="space-y-3">
                <h5 className="text-sm font-medium text-muted-foreground">Platform Attribution Status</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {attribution.platforms.map((platform, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${
                        platform.attributed
                          ? "bg-green-500/5 border-green-500/20"
                          : "bg-red-500/5 border-red-500/20"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{platform.name}</span>
                        <Badge
                          variant={platform.attributed ? "secondary" : "destructive"}
                          className="text-xs"
                        >
                          {platform.attributed ? "Attributed" : "Missing"}
                        </Badge>
                      </div>
                      {platform.attributionText && (
                        <p className="text-sm text-muted-foreground italic">
                          "{platform.attributionText}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Expanded Details */}
              {selectedAttribution === attribution.id && (
                <div className="space-y-4 pt-4 border-t border-primary/10">
                  {/* Metadata */}
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium text-muted-foreground">Track Metadata</h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      {attribution.metadata.isrc && (
                        <div>
                          <span className="text-muted-foreground">ISRC:</span>
                          <p className="font-mono">{attribution.metadata.isrc}</p>
                        </div>
                      )}
                      {attribution.metadata.iswc && (
                        <div>
                          <span className="text-muted-foreground">ISWC:</span>
                          <p className="font-mono">{attribution.metadata.iswc}</p>
                        </div>
                      )}
                      {attribution.metadata.upc && (
                        <div>
                          <span className="text-muted-foreground">UPC:</span>
                          <p className="font-mono">{attribution.metadata.upc}</p>
                        </div>
                      )}
                      <div>
                        <span className="text-muted-foreground">Duration:</span>
                        <p>{Math.floor(attribution.metadata.duration / 60)}:{(attribution.metadata.duration % 60).toString().padStart(2, '0')}</p>
                      </div>
                    </div>
                  </div>

                  {/* Verification Status */}
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium text-muted-foreground">Verification Status</h5>
                    <div className="flex gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Shield className={`w-4 h-4 ${attribution.verification.sessionChainVerified ? 'text-green-500' : 'text-red-500'}`} />
                        <span>SessionChain: {attribution.verification.sessionChainVerified ? 'Verified' : 'Not Verified'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award className={`w-4 h-4 ${attribution.verification.groundTruthVerified ? 'text-green-500' : 'text-red-500'}`} />
                        <span>Ground Truth: {attribution.verification.groundTruthVerified ? 'Verified' : 'Not Verified'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className={`w-4 h-4 ${attribution.verification.manuallyVerified ? 'text-green-500' : 'text-amber-500'}`} />
                        <span>Manual: {attribution.verification.manuallyVerified ? 'Verified' : 'Pending'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View on Platforms
                    </Button>
                    <Button variant="outline" size="sm">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Report Issue
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Download Certificate
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ReleaseAttribution;