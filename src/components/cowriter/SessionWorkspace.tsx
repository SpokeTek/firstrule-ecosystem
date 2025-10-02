import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Mic,
  Music,
  Headphones,
  MessageSquare,
  Clock,
  Settings,
  Download,
  Share2,
  Play,
  Pause,
  Square,
  Circle,
  Volume2,
  Piano,
  Guitar,
  Drum,
  Plus,
  Send,
  Paperclip,
  Smile,
  MoreVertical
} from "lucide-react";
import { Artist, Session, Message, Track } from './types';


interface SessionWorkspaceProps {
  session: Session;
  onUpdateSession: (session: Session) => void;
  onEndSession: () => void;
}

const SessionWorkspace: React.FC<SessionWorkspaceProps> = ({
  session,
  onUpdateSession,
  onEndSession
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState("00:00:00");
  const [selectedTab, setSelectedTab] = useState("workspace");
  const [message, setMessage] = useState("");
  const [tracks, setTracks] = useState<Track[]>([
    {
      id: "track_1",
      name: "Vocals",
      duration: "03:24",
      artist: session.collaborators[0]?.name || "You",
      muted: false,
      solo: false,
      volume: 75
    },
    {
      id: "track_2",
      name: "Piano",
      duration: "03:24",
      artist: session.collaborators[0]?.name || "You",
      muted: false,
      solo: false,
      volume: 60
    },
    {
      id: "track_3",
      name: "Drums",
      duration: "03:24",
      artist: "You",
      muted: false,
      solo: false,
      volume: 80
    }
  ]);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "msg_1",
      sender: session.collaborators[0]?.name || "Collaborator",
      content: "Hey! Ready to start working on this track? I have some ideas for the chorus.",
      timestamp: "10:30 AM",
      isOwn: false
    },
    {
      id: "msg_2",
      sender: "You",
      content: "Absolutely! I was thinking we could start with a simple piano progression and build from there.",
      timestamp: "10:32 AM",
      isOwn: true
    }
  ]);

  const [ideas, setIdeas] = useState([
    {
      id: "idea_1",
      title: "Chorus Progression",
      description: "C - G - Am - F with syncopated rhythm",
      author: session.collaborators[0]?.name || "Collaborator",
      timestamp: "10:35 AM"
    },
    {
      id: "idea_2",
      title: "Melody Concept",
      description: "Ascending melodic line in the chorus to build energy",
      author: "You",
      timestamp: "10:38 AM"
    }
  ]);

  const toggleTrackMute = (trackId: string) => {
    setTracks(tracks.map(track =>
      track.id === trackId ? { ...track, muted: !track.muted } : track
    ));
  };

  const toggleTrackSolo = (trackId: string) => {
    setTracks(tracks.map(track =>
      track.id === trackId ? { ...track, solo: !track.solo } : track
    ));
  };

  const updateTrackVolume = (trackId: string, volume: number) => {
    setTracks(tracks.map(track =>
      track.id === trackId ? { ...track, volume } : track
    ));
  };

  const sendMessage = () => {
    if (message.trim()) {
      const newMessage: Message = {
        id: `msg_${Date.now()}`,
        sender: "You",
        content: message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isOwn: true
      };
      setMessages([...messages, newMessage]);
      setMessage("");
    }
  };

  const getInstrumentIcon = (instrument: string) => {
    switch (instrument.toLowerCase()) {
      case 'vocals':
      case 'singing':
        return <Mic className="w-4 h-4" />;
      case 'piano':
      case 'keys':
        return <Piano className="w-4 h-4" />;
      case 'guitar':
        return <Guitar className="w-4 h-4" />;
      case 'drums':
      case 'percussion':
        return <Drum className="w-4 h-4" />;
      case 'production':
      case 'mixing':
        return <Headphones className="w-4 h-4" />;
      default:
        return <Music className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Session Header */}
      <Card className="p-6 bg-gradient-card backdrop-blur-sm border-primary/10">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold">{session.title}</h2>
              <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/20">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse mr-2" />
                Live Session
              </Badge>
              <Badge variant="outline">
                {session.type}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Started {new Date(session.createdAt).toLocaleTimeString()}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {session.collaborators.length + 1} participants
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button variant="outline" onClick={onEndSession}>
              <Square className="w-4 h-4 mr-2" />
              End Session
            </Button>
          </div>
        </div>
      </Card>

      {/* Collaborators */}
      <Card className="p-4 bg-gradient-card backdrop-blur-sm border-primary/10">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-muted-foreground">In Session:</span>
          <div className="flex items-center gap-3">
            {/* You */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <Users className="w-4 h-4 text-primary" />
                </div>
                <div className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-green-500" />
              </div>
              <span className="text-sm font-medium">You</span>
            </div>

            {/* Collaborators */}
            {session.collaborators.map((collaborator) => (
              <div key={collaborator.id} className="flex items-center gap-2">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center">
                    {getInstrumentIcon(collaborator.instruments[0] || 'music')}
                  </div>
                  <div className={`absolute bottom-0 right-0 w-2 h-2 rounded-full ${
                    collaborator.isOnline ? 'bg-green-500' : 'bg-gray-400'
                  }`} />
                </div>
                <span className="text-sm font-medium">{collaborator.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {collaborator.instruments[0]}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Main Workspace */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-muted/50 border border-primary/10">
          <TabsTrigger value="workspace" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Music className="w-4 h-4 mr-2" />
            Workspace
          </TabsTrigger>
          <TabsTrigger value="chat" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <MessageSquare className="w-4 h-4 mr-2" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="ideas" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Plus className="w-4 h-4 mr-2" />
            Ideas
          </TabsTrigger>
          <TabsTrigger value="files" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Download className="w-4 h-4 mr-2" />
            Files
          </TabsTrigger>
        </TabsList>

        <TabsContent value="workspace" className="space-y-6">
          {/* Transport Controls */}
          <Card className="p-6 bg-gradient-card backdrop-blur-sm border-primary/10">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    variant={isPlaying ? "default" : "outline"}
                    size="sm"
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant={isRecording ? "destructive" : "outline"}
                    size="sm"
                    onClick={() => setIsRecording(!isRecording)}
                  >
                    <Circle className={`w-4 h-4 ${isRecording ? 'animate-pulse' : ''}`} />
                    {isRecording ? 'Recording' : 'Record'}
                  </Button>
                  <div className="text-2xl font-mono font-medium">{currentTime}</div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>

              {/* Timeline */}
              <div className="h-20 bg-muted/30 rounded-lg border border-primary/10 relative">
                <div className="absolute inset-0 flex items-center px-2">
                  <div className="w-full h-1 bg-primary/30 rounded" />
                  <div className="absolute left-1/3 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-primary" />
                </div>
              </div>
            </div>
          </Card>

          {/* Track Mixer */}
          <Card className="p-6 bg-gradient-card backdrop-blur-sm border-primary/10">
            <h3 className="text-lg font-semibold mb-4">Track Mixer</h3>
            <div className="space-y-4">
              {tracks.map((track) => (
                <div key={track.id} className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
                  <div className="w-12 space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className={`w-full ${track.muted ? 'bg-red-500/10 text-red-500 border-red-500/20' : ''}`}
                      onClick={() => toggleTrackMute(track.id)}
                    >
                      M
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`w-full ${track.solo ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : ''}`}
                      onClick={() => toggleTrackSolo(track.id)}
                    >
                      S
                    </Button>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getInstrumentIcon(track.name.toLowerCase())}
                      <div>
                        <p className="font-medium">{track.name}</p>
                        <p className="text-xs text-muted-foreground">{track.artist} • {track.duration}</p>
                      </div>
                    </div>

                    {/* Volume Slider */}
                    <div className="flex items-center gap-2">
                      <Volume2 className="w-3 h-3 text-muted-foreground" />
                      <div className="flex-1 h-2 bg-muted rounded-full">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${track.volume}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-8">{track.volume}%</span>
                    </div>
                  </div>

                  <Button variant="outline" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          {/* Virtual Instruments */}
          <Card className="p-6 bg-gradient-card backdrop-blur-sm border-primary/10">
            <h3 className="text-lg font-semibold mb-4">Virtual Instruments</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['Piano', 'Guitar', 'Drums', 'Synthesizer'].map((instrument) => (
                <Button
                  key={instrument}
                  variant="outline"
                  className="h-20 flex flex-col gap-2"
                >
                  {getInstrumentIcon(instrument)}
                  <span className="text-sm">{instrument}</span>
                </Button>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="chat" className="space-y-6">
          <Card className="p-6 bg-gradient-card backdrop-blur-sm border-primary/10">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Session Chat</h3>

              {/* Messages */}
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-md p-3 rounded-lg ${
                      msg.isOwn
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">{msg.sender}</span>
                        <span className="text-xs opacity-70">{msg.timestamp}</span>
                      </div>
                      <p className="text-sm">{msg.content}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Paperclip className="w-4 h-4" />
                </Button>
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 rounded-md border border-primary/20 bg-background"
                />
                <Button variant="outline" size="sm">
                  <Smile className="w-4 h-4" />
                </Button>
                <Button onClick={sendMessage}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="ideas" className="space-y-6">
          <Card className="p-6 bg-gradient-card backdrop-blur-sm border-primary/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Song Ideas & Notes</h3>
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Idea
              </Button>
            </div>
            <div className="space-y-4">
              {ideas.map((idea) => (
                <div key={idea.id} className="p-4 bg-muted/30 rounded-lg border border-primary/5">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold">{idea.title}</h4>
                    <Badge variant="secondary" className="text-xs">
                      {idea.author} • {idea.timestamp}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{idea.description}</p>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="files" className="space-y-6">
          <Card className="p-6 bg-gradient-card backdrop-blur-sm border-primary/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Shared Files</h3>
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Upload File
              </Button>
            </div>
            <div className="text-center py-12 text-muted-foreground">
              <Download className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No files shared yet</p>
              <p className="text-sm">Upload audio files, MIDI files, or other resources</p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SessionWorkspace;