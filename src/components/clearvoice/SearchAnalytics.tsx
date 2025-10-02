import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Search,
  TrendingUp,
  TrendingDown,
  Eye,
  Clock,
  Globe,
  Tag,
  Filter,
  BarChart3,
  Users,
  Target
} from "lucide-react";

const SearchAnalytics = () => {
  const searchTerms = [
    { term: "soulful female vocals", searches: 1247, clicks: 342, conversion: 27.4, trend: "up" },
    { term: "jazz singer voice", searches: 892, clicks: 287, conversion: 32.2, trend: "up" },
    { term: "R&B background vocals", searches: 654, clicks: 198, conversion: 30.3, trend: "stable" },
    { term: "emotional vocal samples", searches: 521, clicks: 143, conversion: 27.4, trend: "down" },
    { term: "professional voice actor", searches: 432, clicks: 121, conversion: 28.0, trend: "up" }
  ];

  const platformData = [
    { platform: "Google Search", appearances: 1847, clicks: 423, conversion: 22.9, trend: "up" },
    { platform: "Sonic Marketplace", appearances: 892, clicks: 234, conversion: 26.2, trend: "up" },
    { platform: "BeatFinder AI", appearances: 654, clicks: 187, conversion: 28.6, trend: "stable" },
    { platform: "VoiceVault Directory", appearances: 432, clicks: 98, conversion: 22.7, trend: "down" },
    { platform: "Creative Commons Hub", appearances: 287, clicks: 67, conversion: 23.3, trend: "up" }
  ];

  const recentSearches = [
    {
      query: "emotional female vocals for love song",
      platform: "Google Search",
      time: "2 minutes ago",
      location: "Nashville, TN",
      result: "Page 1, Position 3"
    },
    {
      query: "jazz vocal samples for commercial",
      platform: "Sonic Marketplace",
      time: "15 minutes ago",
      location: "London, UK",
      result: "Featured Listing"
    },
    {
      query: "professional voice over artist",
      platform: "BeatFinder AI",
      time: "1 hour ago",
      location: "Los Angeles, CA",
      result: "Page 1, Position 1"
    },
    {
      query: "soulful R&B ad-libs",
      platform: "VoiceVault Directory",
      time: "2 hours ago",
      location: "Atlanta, GA",
      result: "Page 2, Position 5"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Search Overview */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-card backdrop-blur-sm border-primary/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Total Appearances</h3>
            <Search className="w-4 h-4 text-primary" />
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-bold">3,247</p>
            <p className="text-sm text-muted-foreground">Search results this month</p>
            <div className="flex items-center gap-2 text-xs text-green-500">
              <TrendingUp className="w-3 h-3" />
              <span>45% increase from last month</span>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-card backdrop-blur-sm border-primary/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Click-Through Rate</h3>
            <Eye className="w-4 h-4 text-secondary" />
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-bold">27.8%</p>
            <p className="text-sm text-muted-foreground">Average conversion rate</p>
            <div className="flex items-center gap-2 text-xs text-green-500">
              <TrendingUp className="w-3 h-3" />
              <span>+3.2% improvement</span>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-card backdrop-blur-sm border-primary/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Avg. Position</h3>
            <Target className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-bold">#2.4</p>
            <p className="text-sm text-muted-foreground">Average search ranking</p>
            <div className="flex items-center gap-2 text-xs text-green-500">
              <TrendingUp className="w-3 h-3" />
              <span>Moved up 0.8 positions</span>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-card backdrop-blur-sm border-primary/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Top Platform</h3>
            <Globe className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <p className="text-lg font-semibold">Google Search</p>
            <p className="text-sm text-muted-foreground">1,847 appearances</p>
            <Badge variant="secondary" className="text-xs">
              57% of total traffic
            </Badge>
          </div>
        </Card>
      </div>

      {/* Top Search Terms */}
      <Card className="p-6 bg-gradient-card backdrop-blur-sm border-primary/10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">Top Search Terms</h3>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter Terms
          </Button>
        </div>
        <div className="space-y-4">
          {searchTerms.map((term, index) => (
            <div key={term.term} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-primary/5">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">#{index + 1}</span>
                </div>
                <div className="space-y-1">
                  <p className="font-medium">{term.term}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Search className="w-3 h-3" />
                      {term.searches} searches
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {term.clicks} clicks
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {term.conversion}% CTR
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="flex items-center gap-2 text-xs text-green-500">
                    {term.trend === "up" && <TrendingUp className="w-3 h-3" />}
                    {term.trend === "down" && <TrendingDown className="w-3 h-3" />}
                    {term.trend === "stable" && <div className="w-3 h-3" />}
                    <span>
                      {term.trend === "up" ? "Trending up" : term.trend === "down" ? "Trending down" : "Stable"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Platform Performance */}
      <Card className="p-6 bg-gradient-card backdrop-blur-sm border-primary/10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">Platform Performance</h3>
          <Button variant="outline" size="sm">
            <BarChart3 className="w-4 h-4 mr-2" />
            Detailed Analytics
          </Button>
        </div>
        <div className="space-y-4">
          {platformData.map((platform) => (
            <div key={platform.platform} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{platform.platform}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">{platform.appearances} appearances</span>
                  <Badge variant="secondary" className="text-xs">
                    {platform.conversion}% CTR
                  </Badge>
                  {platform.trend === "up" && <TrendingUp className="w-4 h-4 text-green-500" />}
                  {platform.trend === "down" && <TrendingDown className="w-4 h-4 text-red-500" />}
                  {platform.trend === "stable" && <div className="w-4 h-4" />}
                </div>
              </div>
              <Progress value={(platform.appearances / 2000) * 100} className="h-2" />
            </div>
          ))}
        </div>
      </Card>

      {/* Recent Search Activity */}
      <Card className="p-6 bg-gradient-card backdrop-blur-sm border-primary/10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">Recent Search Activity</h3>
          <Button variant="outline" size="sm">
            <Users className="w-4 h-4 mr-2" />
            Live View
          </Button>
        </div>
        <div className="space-y-4">
          {recentSearches.map((search, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-primary/5">
              <div className="space-y-1">
                <p className="font-medium">{search.query}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    {search.platform}
                  </span>
                  <span className="flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    {search.result}
                  </span>
                  <span className="flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    {search.location}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/20 text-xs">
                  {search.time}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default SearchAnalytics;