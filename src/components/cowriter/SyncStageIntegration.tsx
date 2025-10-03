import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Radio,
  Wifi,
  WifiOff,
  Users,
  Mic,
  Volume2,
  Settings,
  AlertCircle
} from "lucide-react";

interface Collaborator {
  id: string;
  name: string;
  status: 'connected' | 'connecting' | 'offline';
  latency: number;
  instruments: string[];
}

interface SyncStageIntegrationProps {
  sessionId: string;
  collaborators: Collaborator[];
}

export const SyncStageIntegration = ({ sessionId, collaborators }: SyncStageIntegrationProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // This is a UI placeholder for SyncStage integration
  // The actual SyncStage SDK integration will be implemented when the SDK is provided
  
  const handleConnect = () => {
    // Placeholder for SyncStage connection logic
    setIsConnected(!isConnected);
  };

  return (
    <Card className="p-6 border-border/50 bg-card/50">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              isConnected ? 'bg-green-500/20' : 'bg-muted'
            }`}>
              <Radio className={`w-5 h-5 ${isConnected ? 'text-green-500' : 'text-muted-foreground'}`} />
            </div>
            <div>
              <h3 className="text-lg font-semibold">SyncStage™ Live Session</h3>
              <p className="text-sm text-muted-foreground">
                Zero-latency remote collaboration
              </p>
            </div>
          </div>
          <Badge className={isConnected ? 'bg-green-500/20 text-green-500' : 'bg-muted'}>
            {isConnected ? (
              <>
                <Wifi className="w-3 h-3 mr-1" />
                Connected
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 mr-1" />
                Offline
              </>
            )}
          </Badge>
        </div>

        {/* Connection Controls */}
        <div className="flex gap-3">
          <Button
            onClick={handleConnect}
            className="flex-1"
            variant={isConnected ? 'destructive' : 'default'}
          >
            {isConnected ? (
              <>
                <WifiOff className="w-4 h-4 mr-2" />
                Disconnect
              </>
            ) : (
              <>
                <Wifi className="w-4 h-4 mr-2" />
                Connect to SyncStage
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsMuted(!isMuted)}
            disabled={!isConnected}
          >
            {isMuted ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <Mic className="w-4 h-4" />
            )}
          </Button>
          <Button variant="outline" disabled={!isConnected}>
            <Settings className="w-4 h-4" />
          </Button>
        </div>

        {/* Session Info */}
        {isConnected && (
          <Card className="p-4 border-primary/20 bg-primary/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Session ID</p>
                <p className="text-xs text-muted-foreground font-mono">{sessionId}</p>
              </div>
              <Badge variant="outline" className="text-xs">
                <Users className="w-3 h-3 mr-1" />
                {collaborators.length} Connected
              </Badge>
            </div>
          </Card>
        )}

        {/* Collaborators List */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Collaborators</h4>
          <div className="space-y-2">
            {collaborators.map((collab) => (
              <div
                key={collab.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-muted/30"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    collab.status === 'connected' ? 'bg-green-500' :
                    collab.status === 'connecting' ? 'bg-yellow-500' :
                    'bg-gray-500'
                  }`} />
                  <div>
                    <p className="font-medium text-sm">{collab.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {collab.instruments.map((instrument, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {instrument}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">
                    {collab.status === 'connected' ? `${collab.latency}ms` : collab.status}
                  </p>
                </div>
              </div>
            ))}
            {collaborators.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No collaborators connected
              </p>
            )}
          </div>
        </div>

        {/* Info Card */}
        <Card className="p-3 border-border/50 bg-accent/5">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              <strong>SyncStage™</strong> by OpenSesame provides ultra-low latency audio streaming 
              for real-time collaboration. Perfect for remote recording sessions, live jamming, and co-writing.
            </p>
          </div>
        </Card>
      </div>
    </Card>
  );
};
