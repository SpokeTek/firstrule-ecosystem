import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navigation } from "@/components/Navigation";
import {
  Users,
  Search,
  Plus,
  Music,
  Clock,
  Star,
  ExternalLink,
  Filter,
  Mic,
  Guitar,
  Piano,
  Drum,
  Headphones,
  PlayCircle,
  MessageSquare,
  Calendar,
  MapPin,
  TrendingUp,
  Sparkles
} from "lucide-react";
import ArtistSearch from "@/components/cowriter/ArtistSearch";
import SessionWorkspace from "@/components/cowriter/SessionWorkspace";
import ActiveSessions from "@/components/cowriter/ActiveSessions";
import { GenerativeStudio } from "@/components/cowriter/GenerativeStudio";
import { ModelSelector } from "@/components/cowriter/ModelSelector";
import { SyncStageIntegration } from "@/components/cowriter/SyncStageIntegration";
import { createOpenPlayClient, OpenPlayAPI } from "@/integrations/openplay/OpenPlayAPI";
import { Artist, Session } from "@/components/cowriter/types";


const CoWriter = () => {
  const [activeTab, setActiveTab] = useState<'search' | 'sessions' | 'workspace' | 'generative'>('generative');
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [openPlayAPI, setOpenPlayAPI] = useState<OpenPlayAPI | null>(null);
  const [isLoadingAPI, setIsLoadingAPI] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);

  // Initialize OpenPlay API client
  useEffect(() => {
    const initializeAPI = async () => {
      try {
        // In production, these would come from environment variables
        const config = {
          apiKey: process.env.NEXT_PUBLIC_OPENPLAY_API_KEY || 'demo-key',
          baseUrl: process.env.NEXT_PUBLIC_OPENPLAY_BASE_URL || 'https://connect.opstaging.com/v2',
          webhookSecret: process.env.OPENPLAY_WEBHOOK_SECRET || 'demo-secret'
        };

        const apiClient = createOpenPlayClient(config);
        setOpenPlayAPI(apiClient);

        // Load existing sessions from localStorage or API
        const savedSessions = localStorage.getItem('cowriter_sessions');
        if (savedSessions) {
          setSessions(JSON.parse(savedSessions));
        }
      } catch (error) {
        console.error('Failed to initialize OpenPlay API:', error);
      } finally {
        setIsLoadingAPI(false);
      }
    };

    initializeAPI();
  }, []);

  // Save sessions to localStorage whenever they change
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('cowriter_sessions', JSON.stringify(sessions));
    }
  }, [sessions]);

  const handleArtistSelect = (artist: Artist) => {
    setSelectedArtist(artist);
    setActiveTab('workspace');
  };

  const handleStartSession = (artist: Artist) => {
    const newSession: Session = {
      id: `session_${Date.now()}`,
      title: `New Session with ${artist.name}`,
      status: 'active',
      collaborators: [artist],
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      type: 'songwriting'
    };

    setSessions([newSession, ...sessions]);
    setActiveSession(newSession);
    setActiveTab('workspace');
  };

  const handleSessionSelect = (session: Session) => {
    setActiveSession(session);
    setActiveTab('workspace');
  };

  const getInstrumentIcon = (instrument: string) => {
    switch (instrument.toLowerCase()) {
      case 'vocals':
      case 'singing':
        return <Mic className="w-4 h-4" />;
      case 'guitar':
        return <Guitar className="w-4 h-4" />;
      case 'piano':
      case 'keys':
        return <Piano className="w-4 h-4" />;
      case 'drums':
      case 'percussion':
        return <Drum className="w-4 h-4" />;
      case 'production':
      case 'mixing':
      case 'dj':
        return <Headphones className="w-4 h-4" />;
      default:
        return <Music className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      {/* Header */}
      <section className="relative overflow-hidden border-b border-primary/10 pt-16">
        <div className="absolute inset-0 bg-gradient-hero opacity-30" />
        <div className="container relative z-10 mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold">CoWriter™ Studio</h1>
              </div>
              <p className="text-lg text-muted-foreground max-w-2xl">
                AI-powered generative co-writing with M.E Models™, real-time collaboration with SyncStage™, 
                and professional tools for producers and artists.
              </p>
              <div className="flex items-center gap-4 text-sm">
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                  <Star className="w-3 h-3 mr-1" />
                  250+ Active Artists
                </Badge>
                <Badge variant="outline" className="border-secondary/30 text-secondary">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Live Sessions
                </Badge>
              </div>
            </div>
            <div className="flex gap-3">
              {activeSession && (
                <Button variant="outline" onClick={() => setActiveTab('workspace')}>
                  <PlayCircle className="w-4 h-4 mr-2" />
                  Continue Session
                </Button>
              )}
              <Button onClick={() => setActiveTab('search')}>
                <Plus className="w-4 h-4 mr-2" />
                New Collaboration
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'search' | 'sessions' | 'workspace' | 'generative')} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-muted/50 border border-primary/10">
            <TabsTrigger value="generative" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Sparkles className="w-4 h-4 mr-2" />
              AI Studio
            </TabsTrigger>
            <TabsTrigger value="search" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Search className="w-4 h-4 mr-2" />
              Find Artists
            </TabsTrigger>
            <TabsTrigger value="sessions" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Users className="w-4 h-4 mr-2" />
              My Sessions
            </TabsTrigger>
            <TabsTrigger value="workspace" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Music className="w-4 h-4 mr-2" />
              Workspace
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generative" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <GenerativeStudio
                  selectedArtists={selectedModels}
                  onArtistSearch={() => setActiveTab('search')}
                />
              </div>
              <div className="space-y-6">
                <ModelSelector
                  selectedModels={selectedModels}
                  onModelsChange={setSelectedModels}
                />
                {activeSession && (
                  <SyncStageIntegration
                    sessionId={activeSession.id}
                    collaborators={activeSession.collaborators.map(c => ({
                      id: c.id,
                      name: c.name,
                      status: c.availability === 'available' ? 'connected' : 'offline',
                      latency: Math.floor(Math.random() * 50) + 10,
                      instruments: c.instruments
                    }))}
                  />
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="search" className="space-y-6">
            {isLoadingAPI ? (
              <Card className="p-12 text-center bg-gradient-card backdrop-blur-sm border-primary/10">
                <div className="space-y-4">
                  <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center mx-auto animate-pulse">
                    <Users className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold">Loading Artist Database</h3>
                  <p className="text-muted-foreground">Connecting to OpenPlay API...</p>
                </div>
              </Card>
            ) : (
              <ArtistSearch
                openPlayAPI={openPlayAPI}
                onArtistSelect={handleArtistSelect}
                onStartSession={handleStartSession}
              />
            )}
          </TabsContent>

          <TabsContent value="sessions" className="space-y-6">
            <ActiveSessions
              sessions={sessions}
              onSessionSelect={handleSessionSelect}
              onCreateNew={() => setActiveTab('search')}
            />
          </TabsContent>

          <TabsContent value="workspace" className="space-y-6">
            {activeSession ? (
              <SessionWorkspace
                session={activeSession}
                onUpdateSession={setActiveSession}
                onEndSession={() => {
                  setActiveSession(null);
                  setActiveTab('sessions');
                }}
              />
            ) : (
              <Card className="p-12 text-center bg-gradient-card backdrop-blur-sm border-primary/10">
                <div className="space-y-4">
                  <div className="w-16 h-16 rounded-xl bg-primary/20 flex items-center justify-center mx-auto">
                    <Users className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">No Active Session</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Start a new collaboration by finding an artist to work with, or continue from your existing sessions.
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button onClick={() => setActiveTab('search')}>
                      <Search className="w-4 h-4 mr-2" />
                      Find Artists
                    </Button>
                    <Button variant="outline" onClick={() => setActiveTab('sessions')}>
                      <Clock className="w-4 h-4 mr-2" />
                      View Sessions
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
};

export default CoWriter;