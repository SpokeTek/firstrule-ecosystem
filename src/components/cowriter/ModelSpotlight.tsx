import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Music2, Mic, Loader2 } from "lucide-react";
import type { CowriterModelProfile } from "./types";

type SessionStatus = "idle" | "connecting" | "connected";

interface ModelSpotlightProps {
  model: CowriterModelProfile;
  sessionStatus: SessionStatus;
}

const statusMeta: Record<SessionStatus, { label: string; badgeClass: string }> = {
  idle: { label: "Ready", badgeClass: "border-border/50 text-muted-foreground" },
  connecting: { label: "Connecting", badgeClass: "border-yellow-500/40 text-yellow-600" },
  connected: { label: "Live", badgeClass: "border-green-500/40 text-green-600" },
};

const ModelSpotlight = ({ model, sessionStatus }: ModelSpotlightProps) => {
  const meta = statusMeta[sessionStatus];

  return (
    <Card className="p-6 space-y-5 border-primary/20 bg-primary/5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Featured M.E. Model</p>
            <h3 className="text-xl font-semibold">{model.displayName}</h3>
            <p className="text-sm text-muted-foreground">{model.title}</p>
          </div>
        </div>
        <Badge variant="outline" className={meta.badgeClass}>
          {sessionStatus === "connecting" && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
          {meta.label}
        </Badge>
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed">{model.bio}</p>

      {model.stats && model.stats.length > 0 && (
        <div className="grid grid-cols-1 gap-3">
          {model.stats.map((stat) => (
            <div key={stat.label} className="flex items-center gap-3 rounded-lg border border-primary/10 bg-background/60 px-3 py-2">
              <div className="w-8 h-8 rounded-md bg-primary/15 flex items-center justify-center">
                <Mic className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">{stat.label}</p>
                <p className="text-sm font-medium text-foreground">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {model.previewUrl ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
            <Music2 className="w-4 h-4" />
            Signature preview
          </div>
          <audio controls className="w-full" src={model.previewUrl}>
            Your browser does not support the audio element.
          </audio>
        </div>
      ) : null}

      {model.badges && model.badges.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {model.badges.map((badge) => (
            <Badge key={badge} variant="secondary" className="bg-secondary/20 text-secondary">
              {badge}
            </Badge>
          ))}
        </div>
      )}
    </Card>
  );
};

export default ModelSpotlight;

