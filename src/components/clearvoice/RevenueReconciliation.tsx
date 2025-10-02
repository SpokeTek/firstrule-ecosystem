import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Filter,
  Download,
  Eye,
  MessageSquare,
  Calendar,
  Scale,
  Target
} from "lucide-react";
import { useState } from "react";

interface ReconciliationItem {
  id: string;
  trackTitle: string;
  artistName: string;
  periodStart: string;
  periodEnd: string;
  openplayRevenue: number;
  openplayStreams: number;
  licenseRevenue: number;
  varianceAmount: number;
  variancePercentage: number;
  status: 'matched' | 'discrepancy' | 'pending' | 'resolved';
  notes?: string;
  investigatedAt?: string;
  platforms?: Array<{
    name: string;
    expectedRevenue: number;
    actualRevenue: number;
    variance: number;
  }>;
}

const RevenueReconciliation = () => {
  const [filter, setFilter] = useState<'all' | 'discrepancies' | 'pending'>('all');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  // Mock reconciliation data
  const reconciliationData: ReconciliationItem[] = [
    {
      id: "rec_001",
      trackTitle: "Midnight Dreams",
      artistName: "Luna Sky",
      periodStart: "2024-06-01",
      periodEnd: "2024-06-30",
      openplayRevenue: 2547.50,
      openplayStreams: 45234,
      licenseRevenue: 2500.00,
      varianceAmount: 47.50,
      variancePercentage: 1.9,
      status: "matched",
      platforms: [
        { name: "Spotify", expectedRevenue: 1421.75, actualRevenue: 1435.20, variance: 0.9 },
        { name: "Apple Music", expectedRevenue: 773.40, actualRevenue: 765.80, variance: -1.0 },
        { name: "Amazon Music", expectedRevenue: 352.35, actualRevenue: 346.50, variance: -1.7 }
      ]
    },
    {
      id: "rec_002",
      trackTitle: "Electric Hearts",
      artistName: "Neon Pulse",
      periodStart: "2024-06-01",
      periodEnd: "2024-06-30",
      openplayRevenue: 3210.00,
      openplayStreams: 67890,
      licenseRevenue: 2800.00,
      varianceAmount: 410.00,
      variancePercentage: 14.6,
      status: "discrepancy",
      notes: "Higher than expected streaming numbers on Spotify",
      investigatedAt: "2024-07-02T10:30:00Z",
      platforms: [
        { name: "Spotify", expectedRevenue: 1800.00, actualRevenue: 2117.25, variance: 17.6 },
        { name: "Apple Music", expectedRevenue: 700.00, actualRevenue: 756.50, variance: 8.1 },
        { name: "Tidal", expectedRevenue: 300.00, actualRevenue: 336.25, variance: 12.1 }
      ]
    },
    {
      id: "rec_003",
      trackTitle: "Summer Vibes",
      artistName: "Coastal Dreams",
      periodStart: "2024-06-01",
      periodEnd: "2024-06-30",
      openplayRevenue: 892.50,
      openplayStreams: 15432,
      licenseRevenue: 892.50,
      varianceAmount: 0.00,
      variancePercentage: 0.0,
      status: "matched"
    },
    {
      id: "rec_004",
      trackTitle: "Electric Hearts - Remix",
      artistName: "Neon Pulse",
      periodStart: "2024-06-15",
      periodEnd: "2024-06-30",
      openplayRevenue: 1450.00,
      openplayStreams: 28765,
      licenseRevenue: 1450.00,
      varianceAmount: 0.00,
      variancePercentage: 0.0,
      status: "pending"
    },
    {
      id: "rec_005",
      trackTitle: "City Lights",
      artistName: "Urban Echo",
      periodStart: "2024-05-01",
      periodEnd: "2024-05-31",
      openplayRevenue: 1875.00,
      openplayStreams: 35421,
      licenseRevenue: 2100.00,
      varianceAmount: -225.00,
      variancePercentage: -10.7,
      status: "resolved",
      notes: "Discrepancy resolved - updated license terms accounted for difference",
      investigatedAt: "2024-06-15T14:20:00Z"
    }
  ];

  const filteredData = reconciliationData.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'discrepancies') return item.status === 'discrepancy';
    if (filter === 'pending') return item.status === 'pending';
    return true;
  });

  const totalExpectedRevenue = reconciliationData.reduce((sum, item) => sum + item.licenseRevenue, 0);
  const totalActualRevenue = reconciliationData.reduce((sum, item) => sum + item.openplayRevenue, 0);
  const totalVariance = totalActualRevenue - totalExpectedRevenue;
  const totalVariancePercentage = totalExpectedRevenue > 0 ? (totalVariance / totalExpectedRevenue) * 100 : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "matched": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "discrepancy": return "bg-red-500/10 text-red-500 border-red-500/20";
      case "pending": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "resolved": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getVarianceColor = (variance: number) => {
    if (Math.abs(variance) <= 5) return "text-green-500";
    if (Math.abs(variance) <= 15) return "text-amber-500";
    return "text-red-500";
  };

  const discrepancyCount = reconciliationData.filter(item => item.status === 'discrepancy').length;
  const pendingCount = reconciliationData.filter(item => item.status === 'pending').length;
  const matchedCount = reconciliationData.filter(item => item.status === 'matched').length;

  return (
    <div className="space-y-6">
      {/* Reconciliation Overview */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-card backdrop-blur-sm border-primary/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Total Variance</h3>
            <Scale className="w-4 h-4 text-primary" />
          </div>
          <div className="space-y-2">
            <p className={`text-3xl font-bold ${getVarianceColor(totalVariancePercentage)}`}>
              {totalVariance >= 0 ? '+' : ''}${totalVariance.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">
              {totalVariancePercentage >= 0 ? '+' : ''}{totalVariancePercentage.toFixed(1)}% vs expected
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Expected: ${totalExpectedRevenue.toLocaleString()}</span>
              <span>•</span>
              <span>Actual: ${totalActualRevenue.toLocaleString()}</span>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-card backdrop-blur-sm border-primary/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Matched</h3>
            <CheckCircle className="w-4 h-4 text-green-500" />
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-bold">{matchedCount}</p>
            <p className="text-sm text-muted-foreground">Reconciled items</p>
            <Progress
              value={(matchedCount / reconciliationData.length) * 100}
              className="h-2 mt-3"
            />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-card backdrop-blur-sm border-primary/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Discrepancies</h3>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-bold text-red-500">{discrepancyCount}</p>
            <p className="text-sm text-muted-foreground">Need attention</p>
            <Badge variant="secondary" className="bg-red-500/10 text-red-500 border-red-500/20 text-xs mt-2">
              {discrepancyCount > 0 ? 'Action Required' : 'All Clear'}
            </Badge>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-card backdrop-blur-sm border-primary/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Pending</h3>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-bold text-amber-500">{pendingCount}</p>
            <p className="text-sm text-muted-foreground">Awaiting data</p>
            <Badge variant="secondary" className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-xs mt-2">
              Processing
            </Badge>
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
            All Items ({reconciliationData.length})
          </Button>
          <Button
            variant={filter === 'discrepancies' ? 'default' : 'outline'}
            onClick={() => setFilter('discrepancies')}
          >
            Discrepancies ({discrepancyCount})
          </Button>
          <Button
            variant={filter === 'pending' ? 'default' : 'outline'}
            onClick={() => setFilter('pending')}
          >
            Pending ({pendingCount})
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Reconciliation Items */}
      <div className="space-y-4">
        {filteredData.map((item) => (
          <Card key={item.id} className="p-6 bg-gradient-card backdrop-blur-sm border-primary/10">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h4 className="text-lg font-semibold">{item.trackTitle}</h4>
                    <Badge className={getStatusColor(item.status)}>
                      {item.status === 'matched' && <CheckCircle className="w-3 h-3 mr-1" />}
                      {item.status === 'discrepancy' && <AlertTriangle className="w-3 h-3 mr-1" />}
                      {item.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                      {item.status === 'resolved' && <Eye className="w-3 h-3 mr-1" />}
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Target className="w-3 h-3" />
                      {item.artistName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(item.periodStart).toLocaleDateString()} - {new Date(item.periodEnd).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <BarChart3 className="w-3 h-3" />
                      {item.openplayStreams.toLocaleString()} streams
                    </span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedItem(
                    selectedItem === item.id ? null : item.id
                  )}
                >
                  {selectedItem === item.id ? "Hide Details" : "Show Details"}
                </Button>
              </div>

              {/* Revenue Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-muted-foreground">Expected Revenue</h5>
                  <p className="text-2xl font-bold">${item.licenseRevenue.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Based on license terms</p>
                </div>
                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-muted-foreground">Actual Revenue</h5>
                  <p className="text-2xl font-bold">${item.openplayRevenue.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">From OpenPlay distribution</p>
                </div>
                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-muted-foreground">Variance</h5>
                  <p className={`text-2xl font-bold ${getVarianceColor(item.variancePercentage)}`}>
                    {item.varianceAmount >= 0 ? '+' : ''}${item.varianceAmount.toLocaleString()}
                  </p>
                  <p className={`text-xs ${getVarianceColor(item.variancePercentage)}`}>
                    {item.variancePercentage >= 0 ? '+' : ''}{item.variancePercentage.toFixed(1)}% variance
                  </p>
                </div>
              </div>

              {/* Notes */}
              {item.notes && (
                <div className="p-3 bg-muted/30 rounded-lg border border-primary/5">
                  <p className="text-sm"><strong>Note:</strong> {item.notes}</p>
                  {item.investigatedAt && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Investigated: {new Date(item.investigatedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              )}

              {/* Expanded Details */}
              {selectedItem === item.id && item.platforms && (
                <div className="space-y-4 pt-4 border-t border-primary/10">
                  <h5 className="text-sm font-medium text-muted-foreground">Platform Breakdown</h5>
                  <div className="grid gap-3">
                    {item.platforms.map((platform, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="font-medium">{platform.name}</span>
                          <Badge
                            variant="secondary"
                            className={`text-xs ${
                              Math.abs(platform.variance) <= 5
                                ? "bg-green-500/10 text-green-500 border-green-500/20"
                                : "bg-red-500/10 text-red-500 border-red-500/20"
                            }`}
                          >
                            {platform.variance >= 0 ? '+' : ''}{platform.variance.toFixed(1)}%
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-muted-foreground">
                            Expected: ${platform.expectedRevenue.toLocaleString()}
                          </span>
                          <span className="font-medium">
                            Actual: ${platform.actualRevenue.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    {item.status === 'discrepancy' && (
                      <Button variant="outline" size="sm">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Investigate
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Download Report
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Summary */}
      <Card className="p-6 bg-gradient-card backdrop-blur-sm border-primary/10">
        <h3 className="text-lg font-semibold mb-4">Reconciliation Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Total Items:</span>
            <p className="font-medium">{reconciliationData.length}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Matched:</span>
            <p className="font-medium text-green-500">{matchedCount}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Discrepancies:</span>
            <p className="font-medium text-red-500">{discrepancyCount}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Pending:</span>
            <p className="font-medium text-amber-500">{pendingCount}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default RevenueReconciliation;