import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Navigation } from "@/components/Navigation";
import
 {
  Eye,
  DollarSign,
  Search,
  TrendingUp,
  Users,
  PlayCircle,
  Clock,
  MapPin,
  BarChart3,
  Activity,
  Globe,
  Shield,
  Download,
  Music,
  Scale
} from "lucide-react";
import { Link } from "react-router-dom";
import UsageMetrics from "@/components/clearvoice/UsageMetrics";
import CompensationOverview from "@/components/clearvoice/CompensationOverview";
import SearchAnalytics from "@/components/clearvoice/SearchAnalytics";
import RecentActivity from "@/components/clearvoice/RecentActivity";
import CommercialReleases from "@/components/clearvoice/CommercialReleases";
import ReleaseAttribution from "@/components/clearvoice/ReleaseAttribution";
import RevenueReconciliation from "@/components/clearvoice/RevenueReconciliation";

const ClearVoice = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      {/* Header Section */}
      <section className="relative overflow-hidden border-b border-primary/10 pt-16">
        <div className="absolute inset-0 bg-gradient-hero opacity-30" />
        <div className="container relative z-10 mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center">
                  <Eye className="w-5 h-5 text-secondary" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold">ClearVoice™ Dashboard</h1>
              </div>
              <p className="text-lg text-muted-foreground max-w-2xl">
                Transparent licensing dashboard with real-time usage tracking and revenue splits.
              </p>
              <div className="flex items-center gap-4 text-sm">
                <Badge variant="secondary" className="bg-secondary/10 text-secondary border-secondary/20">
                  <Shield className="w-3 h-3 mr-1" />
                  SessionChain™ Verified
                </Badge>
                <Badge variant="outline" className="border-primary/30 text-primary">
                  <Activity className="w-3 h-3 mr-1" />
                  Live Tracking
                </Badge>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="border-primary/30 hover:bg-primary/10">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
              <Button asChild>
                <Link to="/vault">Manage Models</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Key Metrics */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-5 gap-6">
          <Card className="p-6 bg-gradient-card backdrop-blur-sm border-primary/10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <PlayCircle className="w-5 h-5 text-primary" />
              </div>
              <Badge variant="secondary" className="text-xs">+12%</Badge>
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold">8,542</p>
              <p className="text-sm text-muted-foreground">Total Uses</p>
              <div className="flex items-center gap-2 text-xs text-green-500">
                <TrendingUp className="w-3 h-3" />
                <span>12% from last month</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-card backdrop-blur-sm border-primary/10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-secondary" />
              </div>
              <Badge variant="secondary" className="text-xs">+28%</Badge>
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold">$12,847</p>
              <p className="text-sm text-muted-foreground">Total Earnings</p>
              <div className="flex items-center gap-2 text-xs text-green-500">
                <TrendingUp className="w-3 h-3" />
                <span>28% from last month</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-card backdrop-blur-sm border-primary/10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Search className="w-5 h-5 text-primary" />
              </div>
              <Badge variant="secondary" className="text-xs">+45%</Badge>
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold">3,247</p>
              <p className="text-sm text-muted-foreground">Search Appearances</p>
              <div className="flex items-center gap-2 text-xs text-green-500">
                <TrendingUp className="w-3 h-3" />
                <span>45% from last month</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-card backdrop-blur-sm border-primary/10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-secondary" />
              </div>
              <Badge variant="secondary" className="text-xs">+8%</Badge>
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold">423</p>
              <p className="text-sm text-muted-foreground">Active Licensees</p>
              <div className="flex items-center gap-2 text-xs text-green-500">
                <TrendingUp className="w-3 h-3" />
                <span>8% from last month</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-card backdrop-blur-sm border-primary/10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Music className="w-5 h-5 text-green-500" />
              </div>
              <Badge variant="secondary" className="text-xs">+3</Badge>
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold">12</p>
              <p className="text-sm text-muted-foreground">Commercial Releases</p>
              <div className="flex items-center gap-2 text-xs text-green-500">
                <TrendingUp className="w-3 h-3" />
                <span>3 new this month</span>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Main Dashboard Content */}
      <section className="container mx-auto px-4 py-8">
        <Tabs defaultValue="usage" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7 bg-muted/50 border border-primary/10">
            <TabsTrigger value="usage" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <BarChart3 className="w-4 h-4 mr-2" />
              Usage Metrics
            </TabsTrigger>
            <TabsTrigger value="compensation" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <DollarSign className="w-4 h-4 mr-2" />
              Compensation
            </TabsTrigger>
            <TabsTrigger value="search" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Search className="w-4 h-4 mr-2" />
              Search Analytics
            </TabsTrigger>
            <TabsTrigger value="releases" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Music className="w-4 h-4 mr-2" />
              Commercial Releases
            </TabsTrigger>
            <TabsTrigger value="attribution" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Shield className="w-4 h-4 mr-2" />
              Attribution
            </TabsTrigger>
            <TabsTrigger value="reconciliation" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Scale className="w-4 h-4 mr-2" />
              Revenue Reconciliation
            </TabsTrigger>
            <TabsTrigger value="activity" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Activity className="w-4 h-4 mr-2" />
              Recent Activity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="usage" className="space-y-6">
            <UsageMetrics />
          </TabsContent>

          <TabsContent value="compensation" className="space-y-6">
            <CompensationOverview />
          </TabsContent>

          <TabsContent value="search" className="space-y-6">
            <SearchAnalytics />
          </TabsContent>

          <TabsContent value="releases" className="space-y-6">
            <CommercialReleases />
          </TabsContent>

          <TabsContent value="attribution" className="space-y-6">
            <ReleaseAttribution />
          </TabsContent>

          <TabsContent value="reconciliation" className="space-y-6">
            <RevenueReconciliation />
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <RecentActivity />
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
};

export default ClearVoice;