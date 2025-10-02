import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Clock,
  Music,
  Mic,
  Guitar,
  Piano,
  Headphones,
  PlayCircle,
  MessageSquare,
  Calendar,
  Plus,
  ExternalLink,
  TrendingUp
} from "lucide-react";
import { Artist, Session } from './types';

interface ActiveSessionsProps {
  sessions: Session[];
  onSessionSelect: (session: Session) => void;
  onCreateNew: () => void;
}

const ActiveSessions: React.FC<ActiveSessionsProps> = ({
  sessions,
  onSessionSelect,
  onCreateNew
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "draft":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "completed":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "songwriting":
        return <Music className="w-4 h-4" />;
      case "production":
        return <Headphones className="w-4 h-4" />;
      case "recording":
        return <Mic className="w-4 h-4" />;
      case "mixing":
        return <Headphones className="w-4 h-4" />;
      default:
        return <Music className="w-4 h-4" />;
    }
  };

  const getInstrumentIcon = (instrument: string) => {
    switch (instrument.toLowerCase()) {
      case 'vocals':
      case 'singing':
        return <Mic className="w-3 h-3" />;
      case 'guitar':
        return <Guitar className="w-3 h-3" />;
      case 'piano':
      case 'keys':
        return <Piano className="w-3 h-3" />;
      case 'production':
      case 'mixing':
        return <Headphones className="w-3 h-3" />;
      default:
        return <Music className="w-3 h-3" />;
    }
  };

  const formatLastActivity = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      return "Just now";
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const activeSessions = sessions.filter(s => s.status === 'active');
  const draftSessions = sessions.filter(s => s.status === 'draft');
  const completedSessions = sessions.filter(s => s.status === 'completed');

  return (
    <div className="space-y-6">
      {/* Session Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-card backdrop-blur-sm border-primary/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Active Sessions</h3>
            <PlayCircle className="w-4 h-4 text-green-500" />
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-bold">{activeSessions.length}</p>
            <p className="text-sm text-muted-foreground">Currently active</p>
            <div className="flex items-center gap-2 text-xs text-green-500">
              <TrendingUp className="w-3 h-3" />
              <span>+2 this week</span>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-card backdrop-blur-sm border-primary/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Draft Sessions</h3>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-bold">{draftSessions.length}</p>
            <p className="text-sm text-muted-foreground">In progress</p>
            <Badge variant="secondary" className="text-xs mt-2">
              Ready to continue
            </Badge>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-card backdrop-blur-sm border-primary/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Completed</h3>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-bold">{completedSessions.length}</p>
            <p className="text-sm text-muted-foreground">This month</p>
            <div className="flex items-center gap-2 text-xs text-green-500">
              <TrendingUp className="w-3 h-3" />
              <span>Great progress!</span>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-card backdrop-blur-sm border-primary/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Total Collaborators</h3>
            <Users className="w-4 h-4 text-primary" />
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-bold">
              {sessions.reduce((total, session) => total + session.collaborators.length, 0)}
            </p>
            <p className="text-sm text-muted-foreground">Artists worked with</p>
            <Badge variant="secondary" className="text-xs mt-2">
              Building network
            </Badge>
          </div>
        </Card>
      </div>

      {/* Create New Session */}
      <Card className="p-6 bg-gradient-card backdrop-blur-sm border-primary/10">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Start New Collaboration</h3>
            <p className="text-sm text-muted-foreground">
              Find talented artists and start creating amazing music together
            </p>
          </div>
          <Button onClick={onCreateNew}>
            <Plus className="w-4 h-4 mr-2" />
            Find Artists
          </Button>
        </div>
      </Card>

      {/* Sessions List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">All Sessions</h3>

        {sessions.length === 0 ? (
          <Card className="p-12 text-center bg-gradient-card backdrop-blur-sm border-primary/10">
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center mx-auto">
                <Users className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No sessions yet</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Start your first collaboration by finding artists to work with.
              </p>
              <Button onClick={onCreateNew}>
                <Plus className="w-4 h-4 mr-2" />
                Find Artists
              </Button>
            </div>
          </Card>
        ) : (
          sessions.map((session) => (
            <Card key={session.id} className="p-6 bg-gradient-card backdrop-blur-sm border-primary/10 hover:border-primary/30 transition-all cursor-pointer"
                  onClick={() => onSessionSelect(session)}>
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h4 className="text-lg font-semibold">{session.title}</h4>
                      <Badge className={getStatusColor(session.status)}>
                        {session.status}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {getTypeIcon(session.type)}
                        <span className="ml-1">{session.type}</span>
                      </Badge>
                    </div>
                    {session.description && (
                      <p className="text-sm text-muted-foreground">{session.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Created {new Date(session.createdAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Last active {formatLastActivity(session.lastActivity)}
                      </span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <PlayCircle className="w-4 h-4 mr-2" />
                    {session.status === 'active' ? 'Continue' : session.status === 'draft' ? 'Resume' : 'View'}
                  </Button>
                </div>

                {/* Collaborators */}
                {session.collaborators.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium text-muted-foreground">
                      Collaborators ({session.collaborators.length})
                    </h5>
                    <div className="flex flex-wrap gap-3">
                      {session.collaborators.map((collaborator) => (
                        <div key={collaborator.id} className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                            <Users className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{collaborator.name}</p>
                            <div className="flex gap-1">
                              {collaborator.instruments.slice(0, 2).map((instrument) => (
                                <span key={instrument} className="flex items-center gap-1 text-xs text-muted-foreground">
                                  {getInstrumentIcon(instrument)}
                                </span>
                              ))}
                              {collaborator.instruments.length > 2 && (
                                <span className="text-xs text-muted-foreground">
                                  +{collaborator.instruments.length - 2}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      {session.collaborators.length === 0 && (
                        <div className="text-sm text-muted-foreground">
                          No collaborators yet
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-primary/10">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Chat
                    </Button>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {session.status === 'active' && (
                      <div className="flex items-center gap-1 text-green-500">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span>Live</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ActiveSessions;