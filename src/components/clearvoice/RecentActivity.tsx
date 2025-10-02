import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Activity,
  PlayCircle,
  DollarSign,
  Search,
  Users,
  Clock,
  MapPin,
  Download,
  Star,
  MessageSquare,
  Bell
} from "lucide-react";

const RecentActivity = () => {
  const activities = [
    {
      id: "001",
      type: "usage",
      title: "Voice used in commercial production",
      description: "Sonic Labs Productions licensed your voice for 'Midnight Dreams' commercial track",
      licensee: "Sonic Labs Productions",
      time: "2 minutes ago",
      location: "Los Angeles, CA",
      revenue: "$127.50",
      icon: PlayCircle,
      color: "text-primary"
    },
    {
      id: "002",
      type: "search",
      title: "New search appearance",
      description: "Your voice appeared in search results for 'soulful female vocals'",
      platform: "Google Search",
      time: "15 minutes ago",
      location: "Nashville, TN",
      position: "Page 1, Position 3",
      icon: Search,
      color: "text-secondary"
    },
    {
      id: "003",
      type: "payment",
      title: "Payment received",
      description: "Monthly royalty payment processed successfully",
      amount: "$1,247.50",
      time: "1 hour ago",
      period: "June 2024",
      icon: DollarSign,
      color: "text-green-500"
    },
    {
      id: "004",
      type: "review",
      title: "New 5-star review",
      description: "Creative Studios Inc left a review for your voice model",
      rating: 5,
      comment: "Amazing quality and exactly what we needed!",
      time: "3 hours ago",
      icon: Star,
      color: "text-amber-500"
    },
    {
      id: "005",
      type: "license",
      title: "New license agreement",
      description: "BeatMaster AI requested extended commercial license",
      licensee: "BeatMaster AI",
      time: "5 hours ago",
      duration: "6 months",
      icon: Users,
      color: "text-blue-500"
    },
    {
      id: "006",
      type: "usage",
      title: "Voice used in podcast",
      description: "Featured as background vocal in 'Tech Talk Today' podcast",
      show: "Tech Talk Today",
      episode: "Episode 142",
      time: "6 hours ago",
      revenue: "$45.00",
      icon: PlayCircle,
      color: "text-primary"
    },
    {
      id: "007",
      type: "message",
      title: "New message from licensee",
      description: "Sonic Labs Productions sent you a message regarding usage",
      sender: "Alex Johnson",
      time: "1 day ago",
      icon: MessageSquare,
      color: "text-purple-500"
    },
    {
      id: "008",
      type: "download",
      title: "Model downloaded",
      description: "Creative Studios Inc downloaded your voice model",
      licensee: "Creative Studios Inc",
      time: "2 days ago",
      purpose: "Advertisement campaign",
      icon: Download,
      color: "text-cyan-500"
    }
  ];

  const getActivityIcon = (activity: typeof activities[0]) => {
    const Icon = activity.icon;
    return (
      <div className={`w-10 h-10 rounded-lg bg-${activity.color === "text-primary" ? "primary" : activity.color === "text-secondary" ? "secondary" : "muted"}/20 flex items-center justify-center`}>
        <Icon className={`w-5 h-5 ${activity.color}`} />
      </div>
    );
  };

  const getActivityBadge = (activity: typeof activities[0]) => {
    switch (activity.type) {
      case "usage":
        return <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">Usage</Badge>;
      case "search":
        return <Badge variant="secondary" className="bg-secondary/10 text-secondary border-secondary/20">Search</Badge>;
      case "payment":
        return <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/20">Payment</Badge>;
      case "review":
        return <Badge variant="secondary" className="bg-amber-500/10 text-amber-500 border-amber-500/20">Review</Badge>;
      case "license":
        return <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 border-blue-500/20">License</Badge>;
      case "message":
        return <Badge variant="secondary" className="bg-purple-500/10 text-purple-500 border-purple-500/20">Message</Badge>;
      case "download":
        return <Badge variant="secondary" className="bg-cyan-500/10 text-cyan-500 border-cyan-500/20">Download</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Activity Overview */}
      <Card className="p-6 bg-gradient-card backdrop-blur-sm border-primary/10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">Recent Activity Timeline</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </Button>
            <Button variant="outline" size="sm">
              <Activity className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Timeline */}
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-primary/20" />

            {/* Activity items */}
            {activities.map((activity, index) => (
              <div key={activity.id} className="relative flex items-start gap-4 pb-6">
                {/* Timeline dot */}
                <div className="relative z-10">
                  {getActivityIcon(activity)}
                  <div className="absolute inset-0 rounded-lg bg-primary/20 animate-ping" />
                </div>

                {/* Activity content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <h4 className="font-semibold">{activity.title}</h4>
                        {getActivityBadge(activity)}
                      </div>
                      <p className="text-sm text-muted-foreground">{activity.description}</p>

                      {/* Additional details based on activity type */}
                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {activity.time}
                        </span>

                        {activity.licensee && (
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {activity.licensee}
                          </span>
                        )}

                        {activity.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {activity.location}
                          </span>
                        )}

                        {activity.revenue && (
                          <span className="flex items-center gap-1 text-green-500">
                            <DollarSign className="w-3 h-3" />
                            {activity.revenue}
                          </span>
                        )}

                        {activity.amount && (
                          <span className="flex items-center gap-1 text-green-500">
                            <DollarSign className="w-3 h-3" />
                            {activity.amount}
                          </span>
                        )}

                        {activity.rating && (
                          <span className="flex items-center gap-1 text-amber-500">
                            <Star className="w-3 h-3 fill-current" />
                            {activity.rating} stars
                          </span>
                        )}
                      </div>

                      {/* Show comment for reviews */}
                      {activity.comment && (
                        <div className="mt-2 p-3 bg-muted/50 rounded-lg border border-primary/5">
                          <p className="text-sm italic">"{activity.comment}"</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Activity Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-6 bg-gradient-card backdrop-blur-sm border-primary/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Today's Activity</h3>
            <Activity className="w-4 h-4 text-primary" />
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold">12 activities</p>
            <p className="text-sm text-muted-foreground">3 usage, 2 searches, 1 payment</p>
            <div className="flex gap-2 mt-3">
              <div className="flex-1 h-2 bg-primary/30 rounded" />
              <div className="flex-1 h-2 bg-secondary/30 rounded" />
              <div className="flex-1 h-2 bg-green-500/30 rounded" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-card backdrop-blur-sm border-primary/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Response Rate</h3>
            <MessageSquare className="w-4 h-4 text-secondary" />
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold">94%</p>
            <p className="text-sm text-muted-foreground">Messages responded to within 24h</p>
            <Badge variant="secondary" className="text-xs mt-2">
              Above average (85%)
            </Badge>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-card backdrop-blur-sm border-primary/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Avg. Rating</h3>
            <Star className="w-4 h-4 text-amber-500" />
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold">4.8</p>
            <p className="text-sm text-muted-foreground">From 47 reviews</p>
            <div className="flex gap-1 mt-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-3 h-3 ${
                    star <= 4 ? "text-amber-500 fill-current" : "text-muted-foreground"
                  }`}
                />
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RecentActivity;