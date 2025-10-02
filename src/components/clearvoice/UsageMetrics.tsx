import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  PlayCircle,
  MapPin,
  Clock,
  Users,
  TrendingUp,
  Calendar,
  Filter,
  Globe
} from "lucide-react";

const UsageMetrics = () => {
  const usageData = [
    {
      id: "001",
      licensee: "Sonic Labs Productions",
      location: "Los Angeles, CA",
      usage: "Commercial Track - 'Midnight Dreams'",
      time: "2 hours ago",
      type: "Commercial",
      revenue: "$127.50"
    },
    {
      id: "002",
      licensee: "BeatMaster AI",
      location: "Berlin, DE",
      usage: "Background Vocal - Podcast Episode 42",
      time: "5 hours ago",
      type: "Podcast",
      revenue: "$45.00"
    },
    {
      id: "003",
      licensee: "Creative Studios Inc",
      location: "New York, NY",
      usage: "Jingle - Advertisement Campaign",
      time: "1 day ago",
      type: "Advertisement",
      revenue: "$350.00"
    },
    {
      id: "004",
      licensee: "Indie Artist Collective",
      location: "Austin, TX",
      usage: "Featured Vocal - 'Summer Vibes'",
      time: "2 days ago",
      type: "Music",
      revenue: "$89.25"
    }
  ];

  const geographicData = [
    { country: "United States", usage: 4521, percentage: 53 },
    { country: "Germany", usage: 1823, percentage: 21 },
    { country: "United Kingdom", usage: 1247, percentage: 15 },
    { country: "Canada", usage: 951, percentage: 11 }
  ];

  return (
    <div className="space-y-6">
      {/* Usage Overview Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-6 bg-gradient-card backdrop-blur-sm border-primary/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Today's Usage</h3>
            <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/20">
              Live
            </Badge>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">47</span>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-sm text-muted-foreground">Active uses across 12 licensees</p>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Daily Goal</span>
                <span>47/50</span>
              </div>
              <Progress value={94} className="h-2" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-card backdrop-blur-sm border-primary/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">This Week</h3>
            <Badge variant="outline">Week 42</Badge>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">324</span>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-sm text-muted-foreground">18% increase from last week</p>
            <div className="flex gap-2">
              <div className="flex-1 h-16 bg-primary/20 rounded" />
              <div className="flex-1 h-16 bg-primary/30 rounded" />
              <div className="flex-1 h-16 bg-primary/40 rounded" />
              <div className="flex-1 h-16 bg-primary/50 rounded" />
              <div className="flex-1 h-16 bg-primary/60 rounded" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-card backdrop-blur-sm border-primary/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Top Licensee</h3>
            <Users className="w-4 h-4 text-primary" />
          </div>
          <div className="space-y-3">
            <p className="text-lg font-semibold">Sonic Labs Productions</p>
            <p className="text-sm text-muted-foreground">127 uses this month</p>
            <div className="flex items-center gap-2">
              <Progress value={78} className="flex-1 h-2" />
              <span className="text-xs text-muted-foreground">78%</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Geographic Distribution */}
      <Card className="p-6 bg-gradient-card backdrop-blur-sm border-primary/10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">Geographic Distribution</h3>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
        <div className="space-y-4">
          {geographicData.map((country) => (
            <div key={country.country} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{country.country}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">{country.usage.toLocaleString()} uses</span>
                  <Badge variant="secondary" className="text-xs">
                    {country.percentage}%
                  </Badge>
                </div>
              </div>
              <Progress value={country.percentage} className="h-2" />
            </div>
          ))}
        </div>
      </Card>

      {/* Recent Usage Table */}
      <Card className="p-6 bg-gradient-card backdrop-blur-sm border-primary/10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">Recent Usage</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Calendar className="w-4 h-4 mr-2" />
              Date Range
            </Button>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>
        <div className="space-y-4">
          {usageData.map((usage) => (
            <div key={usage.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-primary/5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <PlayCircle className="w-5 h-5 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="font-medium">{usage.usage}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {usage.licensee}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {usage.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {usage.time}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                  {usage.type}
                </Badge>
                <span className="font-semibold text-green-500">{usage.revenue}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default UsageMetrics;