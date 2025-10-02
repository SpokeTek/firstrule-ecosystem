import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  CreditCard,
  Download,
  PieChart,
  Target,
  Clock
} from "lucide-react";

const CompensationOverview = () => {
  const earningsData = [
    { month: "Jan", amount: 8200, growth: 12 },
    { month: "Feb", amount: 9100, growth: 11 },
    { month: "Mar", amount: 10300, growth: 13 },
    { month: "Apr", amount: 9850, growth: -4 },
    { month: "May", amount: 11200, growth: 14 },
    { month: "Jun", amount: 12847, growth: 15 }
  ];

  const revenueStreams = [
    { stream: "Commercial Music", amount: 7250, percentage: 56, trend: "up" },
    { stream: "Podcast & Radio", amount: 3210, percentage: 25, trend: "up" },
    { stream: "Advertisement", amount: 1587, percentage: 12, trend: "down" },
    { stream: "Background Media", amount: 800, percentage: 6, trend: "up" },
    { stream: "Educational", amount: 200, percentage: 1, trend: "stable" }
  ];

  const pendingPayments = [
    {
      id: "PAY-001",
      licensee: "Sonic Labs Productions",
      amount: "$425.50",
      period: "June 1-15, 2024",
      status: "processing",
      date: "Expected July 5"
    },
    {
      id: "PAY-002",
      licensee: "BeatMaster AI",
      amount: "$189.00",
      period: "June 10-20, 2024",
      status: "pending",
      date: "Expected July 10"
    },
    {
      id: "PAY-003",
      licensee: "Creative Studios Inc",
      amount: "$650.00",
      period: "June 15-30, 2024",
      status: "pending",
      date: "Expected July 15"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Earnings Overview */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-card backdrop-blur-sm border-primary/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">This Month</h3>
            <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/20">
              <TrendingUp className="w-3 h-3 mr-1" />
              +15%
            </Badge>
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-bold">$12,847</p>
            <p className="text-sm text-muted-foreground">Total earnings for June</p>
            <div className="flex items-center gap-2 text-xs text-green-500">
              <TrendingUp className="w-3 h-3" />
              <span>$1,647 more than last month</span>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-card backdrop-blur-sm border-primary/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Pending</h3>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-bold">$1,264.50</p>
            <p className="text-sm text-muted-foreground">Awaiting payment</p>
            <Badge variant="outline" className="text-xs border-amber-500/30 text-amber-500">
              3 payments processing
            </Badge>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-card backdrop-blur-sm border-primary/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">YTD Total</h3>
            <Calendar className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-bold">$61,497</p>
            <p className="text-sm text-muted-foreground">Year to date earnings</p>
            <div className="flex items-center gap-2 text-xs text-green-500">
              <TrendingUp className="w-3 h-3" />
              <span>On track for $125K</span>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-card backdrop-blur-sm border-primary/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Avg/Royalty</h3>
            <Target className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-bold">$1.50</p>
            <p className="text-sm text-muted-foreground">Average per use</p>
            <div className="flex items-center gap-2 text-xs text-green-500">
              <TrendingUp className="w-3 h-3" />
              <span>+$0.25 this month</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Revenue Streams */}
      <Card className="p-6 bg-gradient-card backdrop-blur-sm border-primary/10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">Revenue Streams</h3>
          <Button variant="outline" size="sm">
            <PieChart className="w-4 h-4 mr-2" />
            View Details
          </Button>
        </div>
        <div className="space-y-4">
          {revenueStreams.map((stream) => (
            <div key={stream.stream} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">{stream.stream}</span>
                <div className="flex items-center gap-3">
                  <span className="font-semibold">${stream.amount.toLocaleString()}</span>
                  <Badge variant="secondary" className="text-xs">
                    {stream.percentage}%
                  </Badge>
                  {stream.trend === "up" && <TrendingUp className="w-4 h-4 text-green-500" />}
                  {stream.trend === "down" && <TrendingDown className="w-4 h-4 text-red-500" />}
                  {stream.trend === "stable" && <div className="w-4 h-4" />}
                </div>
              </div>
              <Progress value={stream.percentage} className="h-2" />
            </div>
          ))}
        </div>
      </Card>

      {/* Monthly Trend */}
      <Card className="p-6 bg-gradient-card backdrop-blur-sm border-primary/10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">Monthly Earnings Trend</h3>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-6 gap-4">
            {earningsData.map((month) => (
              <div key={month.month} className="text-center space-y-2">
                <div className="text-sm text-muted-foreground">{month.month}</div>
                <div className="relative">
                  <div
                    className="w-full bg-primary/60 rounded"
                    style={{ height: `${(month.amount / 15000) * 100}px` }}
                  />
                  <div className="text-xs mt-2 font-medium">
                    ${(month.amount / 1000).toFixed(1)}K
                  </div>
                </div>
                <div className={`flex items-center justify-center text-xs ${
                  month.growth > 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {month.growth > 0 ? (
                    <TrendingUp className="w-3 h-3 mr-1" />
                  ) : (
                    <TrendingDown className="w-3 h-3 mr-1" />
                  )}
                  {Math.abs(month.growth)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Pending Payments */}
      <Card className="p-6 bg-gradient-card backdrop-blur-sm border-primary/10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">Pending Payments</h3>
          <Button variant="outline" size="sm">
            <CreditCard className="w-4 h-4 mr-2" />
            View All
          </Button>
        </div>
        <div className="space-y-4">
          {pendingPayments.map((payment) => (
            <div key={payment.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-primary/5">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="font-medium">{payment.licensee}</span>
                  <Badge
                    variant="secondary"
                    className={`text-xs ${
                      payment.status === "processing"
                        ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                        : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                    }`}
                  >
                    {payment.status === "processing" ? "Processing" : "Pending"}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{payment.period}</span>
                  <span>•</span>
                  <span>{payment.date}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-lg">{payment.amount}</p>
                <p className="text-xs text-muted-foreground">{payment.id}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default CompensationOverview;