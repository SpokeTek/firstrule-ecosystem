import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Music, Mic, Loader2, Wand2 } from "lucide-react";
import type { CowriterModelProfile } from "./types";

export type SessionStatus = "idle" | "connecting" | "connected";

interface GenerativeStudioProps {
  activeModel?: CowriterModelProfile;
  onSessionStatusChange?: (status: SessionStatus) => void;
}

const GenerativeStudio = ({ activeModel, onSessionStatusChange }: GenerativeStudioProps) => {
  const { toast } = useToast();

  const [sessionStatus, setSessionStatusState] = useState<SessionStatus>("idle");
  const [roomId, setRoomId] = useState<string | null>(null);
  const [log, setLog] = useState<Array<{ ts: number; role: "system" | "agent" | "tool" | "user"; text: string }>>([]);
  const logEndRef = useRef<HTMLDivElement>(null);

  const [voiceFile, setVoiceFile] = useState<File | null>(null);
  const [voiceSwapUrl, setVoiceSwapUrl] = useState<string | null>(null);
  const [isSwapping, setIsSwapping] = useState(false);
  const [voiceSwapProgress, setVoiceSwapProgress] = useState(0);
  const voiceSwapIntervalRef = useRef<number | null>(null);
  const voiceSwapTimeoutRef = useRef<number | null>(null);

  const [musicPrompt, setMusicPrompt] = useState("");
  const [stemFile, setStemFile] = useState<File | null>(null);
  const [musicGenUrl, setMusicGenUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [musicGenProgress, setMusicGenProgress] = useState(0);
  const musicGenIntervalRef = useRef<number | null>(null);
  const musicGenTimeoutRef = useRef<number | null>(null);

  const [preMode, setPreMode] = useState<"chat" | "swap" | "generate">("chat");
  const cowriterFirstName = useMemo(() => activeModel?.firstName ?? "Joel", [activeModel]);
  const voiceLabel = useMemo(() => activeModel?.voiceName ?? cowriterFirstName, [activeModel, cowriterFirstName]);

  useEffect(() => { logEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [log]);
  useEffect(() => {
    return () => {
      if (voiceSwapIntervalRef.current) window.clearInterval(voiceSwapIntervalRef.current);
      if (voiceSwapTimeoutRef.current) window.clearTimeout(voiceSwapTimeoutRef.current);
      if (musicGenIntervalRef.current) window.clearInterval(musicGenIntervalRef.current);
      if (musicGenTimeoutRef.current) window.clearTimeout(musicGenTimeoutRef.current);
    };
  }, []);

  const setSessionStatus = (next: SessionStatus) => {
    setSessionStatusState(next);
    onSessionStatusChange?.(next);
  };

  const appendLog = (entry: Omit<(typeof log)[number], "ts">) => {
    setLog((prev) => [...prev, { ...entry, ts: Date.now() }]);
  };

  const connectSession = async () => {
    if (!activeModel) {
      toast({ title: "Model unavailable", description: "This session requires a featured M.E. model." });
      return;
    }

    setSessionStatus("connecting");
    const prep: string[] = [];
    if (preMode === "swap" && voiceFile) prep.push(`vocal stem: ${voiceFile.name}`);
    if (preMode === "generate" && musicPrompt.trim()) prep.push(`music prompt: "${musicPrompt.slice(0, 60)}${musicPrompt.length > 60 ? "..." : ""}"`);
    if (preMode === "generate" && stemFile) prep.push(`stem: ${stemFile.name}`);
    if (prep.length) appendLog({ role: "user", text: `Starting with ${preMode}: ${prep.join("; ")}` });
    appendLog({ role: "system", text: `Connecting to LiveKit room for ${activeModel.displayName}...` });

    setTimeout(() => {
      const room = `room_${Math.random().toString(36).slice(2, 8)}`;
      setRoomId(room);
      setSessionStatus("connected");
      appendLog({ role: "system", text: `Connected to LiveKit (${room}). Co-writer is ready.` });

      const shouldSwap = preMode === "swap" && !!voiceFile;
      const shouldGen = preMode === "generate" && !!musicPrompt.trim();
      if (shouldSwap) {
        appendLog({ role: "agent", text: "I'm digging this stem you've got - here's how I'd sing it." });
      } else if (shouldGen) {
        appendLog({ role: "agent", text: "That's a great idea for a track - let me create something that fits." });
      } else {
        appendLog({ role: "agent", text: `Hey! I'm using voice ${voiceLabel}. Let's jam - what should we explore?` });
      }
      toast({ title: "Session connected", description: `LiveKit room ${room}` });

      if (shouldSwap) setTimeout(() => simulateVoiceSwap(), 50);
      if (shouldGen) setTimeout(() => simulateMusicGen(), 50);
    }, 900);
  };

  const simulateVoiceSwap = async () => {
    if (sessionStatus !== "connected") {
      toast({ title: "Not connected", description: "Start a session first.", variant: "destructive" });
      return;
    }
    if (!voiceFile) {
      toast({ title: "No vocal stem", description: "Upload a vocal stem to swap.", variant: "destructive" });
      return;
    }

    setIsSwapping(true);
    setVoiceSwapProgress(0);
    appendLog({ role: "user", text: `Uploaded vocal stem: ${voiceFile.name}` });
    appendLog({ role: "agent", text: `Calling tool: voiceSwap -> voice=${voiceLabel}` });

    voiceSwapIntervalRef.current = window.setInterval(() => setVoiceSwapProgress((p) => Math.min(p + Math.random() * 12 + 6, 92)), 180);
    voiceSwapTimeoutRef.current = window.setTimeout(() => {
      if (voiceSwapIntervalRef.current) window.clearInterval(voiceSwapIntervalRef.current);
      setVoiceSwapProgress(100);
      const blob = new Blob([`Simulated swapped audio for ${voiceFile.name} -> voice ${voiceLabel}`], { type: "audio/wav" });
      const url = URL.createObjectURL(blob);
      setVoiceSwapUrl(url);
      appendLog({ role: "tool", text: "voiceSwap produced swapped_vocals.wav (simulated)" });
      toast({ title: "Voice swapped", description: "Swapped vocals are ready (simulated)." });
      setIsSwapping(false);
    }, 2400);
  };

  const cancelVoiceSwap = () => {
    if (!isSwapping) return;
    if (voiceSwapIntervalRef.current) window.clearInterval(voiceSwapIntervalRef.current);
    if (voiceSwapTimeoutRef.current) window.clearTimeout(voiceSwapTimeoutRef.current);
    setIsSwapping(false);
    setVoiceSwapProgress(0);
    appendLog({ role: "system", text: "voiceSwap cancelled by user" });
    toast({ title: "Cancelled", description: "Voice swap cancelled." });
  };

  const simulateMusicGen = async () => {
    if (sessionStatus !== "connected") {
      toast({ title: "Not connected", description: "Start a session first.", variant: "destructive" });
      return;
    }
    if (!musicPrompt.trim()) {
      toast({ title: "Prompt required", description: "Describe what to generate.", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    setMusicGenProgress(0);
    appendLog({ role: "user", text: `Prompt: ${musicPrompt}${stemFile ? ` (with stem: ${stemFile.name})` : ""}` });
    appendLog({ role: "agent", text: "Calling tool: musicGen -> generating track..." });

    musicGenIntervalRef.current = window.setInterval(() => setMusicGenProgress((p) => Math.min(p + Math.random() * 10 + 5, 95)), 160);
    musicGenTimeoutRef.current = window.setTimeout(() => {
      if (musicGenIntervalRef.current) window.clearInterval(musicGenIntervalRef.current);
      setMusicGenProgress(100);
      const blob = new Blob([`Simulated music for prompt: ${musicPrompt}\nStem: ${stemFile?.name ?? "none"}`], { type: "audio/wav" });
      const url = URL.createObjectURL(blob);
      setMusicGenUrl(url);
      appendLog({ role: "tool", text: "musicGen produced track.wav (simulated)" });
      toast({ title: "Track ready", description: "Music generation completed (simulated)." });
      setIsGenerating(false);
    }, 3000);
  };

  const cancelMusicGen = () => {
    if (!isGenerating) return;
    if (musicGenIntervalRef.current) window.clearInterval(musicGenIntervalRef.current);
    if (musicGenTimeoutRef.current) window.clearTimeout(musicGenTimeoutRef.current);
    setIsGenerating(false);
    setMusicGenProgress(0);
    appendLog({ role: "system", text: "musicGen cancelled by user" });
    toast({ title: "Cancelled", description: "Music generation cancelled." });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Co-Writing Session</h2>
          <p className="text-sm text-muted-foreground">Prepare inputs, connect, and let {cowriterFirstName} take it from there.</p>
        </div>
      </div>

      <Card className="p-4 border-border/50 bg-card/50">
        <div className="flex items-center gap-3 mb-3">
          <Sparkles className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold">How do you want to start?</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            aria-pressed={preMode === "swap"}
            onClick={() => setPreMode("swap")}
            className={`text-left rounded-lg border p-4 transition focus:outline-none focus:ring-2 focus:ring-primary/50 hover:bg-muted/50 ${preMode === "swap" ? "border-primary bg-primary/10" : "border-border"}`}
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-md bg-primary/15 flex items-center justify-center">
                <Mic className="w-4 h-4 text-primary" />
              </div>
              <div className="space-y-1">
                <div className="text-sm font-semibold">Hear how {cowriterFirstName} would sing your clip</div>
                <div className="text-xs text-muted-foreground">Upload a vocal stem for instant voice swap.</div>
              </div>
            </div>
          </button>

          <button
            aria-pressed={preMode === "generate"}
            onClick={() => setPreMode("generate")}
            className={`text-left rounded-lg border p-4 transition focus:outline-none focus:ring-2 focus:ring-primary/50 hover:bg-muted/50 ${preMode === "generate" ? "border-primary bg-primary/10" : "border-border"}`}
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-md bg-primary/15 flex items-center justify-center">
                <Music className="w-4 h-4 text-primary" />
              </div>
              <div className="space-y-1">
                <div className="text-sm font-semibold">Describe what you want {cowriterFirstName} to compose</div>
                <div className="text-xs text-muted-foreground">Give a prompt; optionally add a reference stem.</div>
              </div>
            </div>
          </button>

          <button
            aria-pressed={preMode === "chat"}
            onClick={() => setPreMode("chat")}
            className={`text-left rounded-lg border p-4 transition focus:outline-none focus:ring-2 focus:ring-primary/50 hover:bg-muted/50 ${preMode === "chat" ? "border-primary bg-primary/10" : "border-border"}`}
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-md bg-primary/15 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div className="space-y-1">
                <div className="text-sm font-semibold">Jump straight in with {cowriterFirstName}</div>
                <div className="text-xs text-muted-foreground">Connect now and riff together live.</div>
              </div>
            </div>
          </button>
        </div>

        {preMode === "swap" && (
          <div className="mt-3 space-y-2">
            <Input type="file" accept="audio/*" onChange={(e) => setVoiceFile(e.target.files?.[0] ?? null)} />
            {voiceFile ? (
              <Badge variant="outline" className="truncate max-w-[16rem]" title={voiceFile.name}>
                Vocal: {voiceFile.name}
              </Badge>
            ) : (
              <p className="text-xs text-muted-foreground">Upload a vocal stem and {cowriterFirstName} will sing it.</p>
            )}
          </div>
        )}

        {preMode === "generate" && (
          <div className="mt-3 space-y-2">
            <Textarea
              placeholder={`Describe the vibe, structure, and mood you want ${cowriterFirstName} to compose...`}
              value={musicPrompt}
              onChange={(e) => setMusicPrompt(e.target.value)}
              rows={3}
              className="resize-none"
            />
            <div className="flex items-center gap-2">
              <Input type="file" accept="audio/*" onChange={(e) => setStemFile(e.target.files?.[0] ?? null)} />
              {stemFile && (
                <Badge variant="outline" className="truncate max-w-[12rem]" title={stemFile.name}>
                  Stem: {stemFile.name}
                </Badge>
              )}
            </div>
          </div>
        )}
      </Card>

      <Card className="p-4 border-border/50 bg-card/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={sessionStatus === "connected" ? "border-green-500 text-green-600" : sessionStatus === "connecting" ? "border-yellow-500 text-yellow-600" : "border-border/60 text-muted-foreground"}>
              {sessionStatus === "connected" ? "Connected" : sessionStatus === "connecting" ? "Connecting" : "Idle"}
            </Badge>
            {roomId && <span className="text-xs text-muted-foreground">Room: {roomId}</span>}
          </div>
          <div className="flex gap-2">
            <Button onClick={connectSession} disabled={sessionStatus !== "idle"}>
              {sessionStatus === "connecting" ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connecting
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  Start Session
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {sessionStatus === "connected" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4 border-border/50 bg-card/50">
            <div className="flex items-center gap-2 mb-3">
              <Music className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold">musicGen</h3>
              <span className="text-xs text-muted-foreground">Text to music, optional stem</span>
            </div>
            <div className="space-y-3">
              <Textarea placeholder="Describe the vibe, structure, and mood..." value={musicPrompt} onChange={(e) => setMusicPrompt(e.target.value)} rows={4} className="resize-none" />
              <div className="flex items-center gap-2">
                <Input type="file" accept="audio/*" onChange={(e) => setStemFile(e.target.files?.[0] ?? null)} />
                {stemFile && (
                  <Badge variant="outline" className="truncate max-w-[12rem]" title={stemFile.name}>
                    Stem: {stemFile.name}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={simulateMusicGen} disabled={isGenerating}>
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 mr-2" /> Generate
                    </>
                  )}
                </Button>
                {isGenerating && (<Button variant="outline" onClick={cancelMusicGen}>Cancel</Button>)}
                {musicGenUrl && (<a href={musicGenUrl} download="track.wav" className="text-sm underline text-primary">Download .wav (sim)</a>)}
              </div>
              {isGenerating && (
                <div className="pt-1">
                  <Progress value={musicGenProgress} />
                </div>
              )}
              {musicGenUrl && (<audio src={musicGenUrl} controls className="w-full" />)}
            </div>
          </Card>

          <Card className="p-4 border-border/50 bg-card/50">
            <div className="flex items-center gap-2 mb-3">
              <Mic className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold">voiceSwap</h3>
              <span className="text-xs text-muted-foreground">Swap uploaded vocals to {voiceLabel}</span>
            </div>
            <div className="space-y-3">
              <Input type="file" accept="audio/*" onChange={(e) => setVoiceFile(e.target.files?.[0] ?? null)} />
              {voiceFile && (
                <Badge variant="outline" className="truncate max-w-[16rem]" title={voiceFile.name}>
                  Vocal: {voiceFile.name}
                </Badge>
              )}
              <div className="flex items-center gap-2">
                <Button onClick={simulateVoiceSwap} disabled={isSwapping}>
                  {isSwapping ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Swapping
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 mr-2" /> Swap Voice
                    </>
                  )}
                </Button>
                {isSwapping && (<Button variant="outline" onClick={cancelVoiceSwap}>Cancel</Button>)}
                {voiceSwapUrl && (<a href={voiceSwapUrl} download="swapped_vocals.wav" className="text-sm underline text-primary">Download .wav (sim)</a>)}
              </div>
              {isSwapping && (
                <div className="pt-1">
                  <Progress value={voiceSwapProgress} />
                </div>
              )}
              {voiceSwapUrl && (<audio src={voiceSwapUrl} controls className="w-full" />)}
            </div>
          </Card>
        </div>
      ) : (
        <Card className="p-4 border-dashed border-border/50 bg-muted/10 text-sm text-muted-foreground">
          Tools unlock after the session starts. Choose how to begin, then hit Start.
        </Card>
      )}

      <Card className="p-4 border-border/50 bg-muted/30">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold">Session Log</h3>
        </div>
        <div className="h-40 overflow-auto rounded-md bg-background border border-border/50 p-2 text-xs space-y-1">
          {log.map((entry, idx) => (
            <div key={idx} className="flex gap-2">
              <span className="text-muted-foreground">[{new Date(entry.ts).toLocaleTimeString()}]</span>
              <span className="uppercase text-muted-foreground">{entry.role}:</span>
              <span className="whitespace-pre-wrap">{entry.text}</span>
            </div>
          ))}
          <div ref={logEndRef} />
        </div>
      </Card>
    </div>
  );
};

export default GenerativeStudio;
