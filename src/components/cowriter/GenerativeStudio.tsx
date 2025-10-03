import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Sparkles,
  Music,
  Mic,
  ListMusic,
  Layers,
  Loader2,
  Wand2,
  User
} from "lucide-react";

interface GenerativeStudioProps {
  selectedArtists?: string[];
  onArtistSearch?: () => void;
}

export const GenerativeStudio = ({ selectedArtists = [], onArtistSearch }: GenerativeStudioProps) => {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('');
  const [mode, setMode] = useState<'full-generation' | 'stem-generation' | 'lyric-generation'>('full-generation');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt required",
        description: "Please enter a prompt to generate content",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedContent('');

    try {
      const { data, error } = await supabase.functions.invoke('cowriter-agent', {
        body: {
          prompt: prompt,
          style: style,
          artistNames: selectedArtists,
          mode: mode,
          context: null,
        }
      });

      if (error) throw error;

      if (data.error) {
        if (data.error.includes('Rate limit')) {
          toast({
            title: "Rate limit reached",
            description: "Please wait a moment before generating again.",
            variant: "destructive",
          });
        } else if (data.error.includes('credits')) {
          toast({
            title: "Credits depleted",
            description: "Please add AI credits to continue using generative features.",
            variant: "destructive",
          });
        } else {
          throw new Error(data.error);
        }
        return;
      }

      setGeneratedContent(data.content);
      toast({
        title: "Content generated!",
        description: "AI has created your musical content",
      });
    } catch (error) {
      console.error('Generation error:', error);
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Failed to generate content",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Generative Studio</h2>
            <p className="text-sm text-muted-foreground">
              AI-powered music creation with M.E Models™
            </p>
          </div>
        </div>
      </div>

      {/* Selected Artists */}
      {selectedArtists.length > 0 && (
        <Card className="p-4 border-primary/20 bg-primary/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Active M.E Models™:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedArtists.map((artist, index) => (
                <Badge key={index} className="bg-primary/20 text-primary">
                  <Mic className="w-3 h-3 mr-1" />
                  {artist}
                </Badge>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Generation Mode Tabs */}
      <Tabs value={mode} onValueChange={(v) => setMode(v as typeof mode)}>
        <TabsList className="grid w-full grid-cols-3 bg-muted/50">
          <TabsTrigger value="full-generation">
            <Music className="w-4 h-4 mr-2" />
            Full Song
          </TabsTrigger>
          <TabsTrigger value="stem-generation">
            <Layers className="w-4 h-4 mr-2" />
            Stem by Stem
          </TabsTrigger>
          <TabsTrigger value="lyric-generation">
            <ListMusic className="w-4 h-4 mr-2" />
            Lyrics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="full-generation" className="space-y-4">
          <Card className="p-6 border-border/50 bg-card/50">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Describe your song idea
                </label>
                <Textarea
                  placeholder="e.g., An upbeat summer anthem about road trips and freedom..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Style/Genre (optional)
                </label>
                <Textarea
                  placeholder="e.g., Pop with electronic influences, 120 BPM, major key..."
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  rows={2}
                  className="resize-none"
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="stem-generation" className="space-y-4">
          <Card className="p-6 border-border/50 bg-card/50">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Describe the stem you want to generate
                </label>
                <Textarea
                  placeholder="e.g., Create a driving bassline in the style of Daft Punk for a 120 BPM house track..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Stem Type
                </label>
                <Textarea
                  placeholder="e.g., Bass, Drums, Lead Melody, Harmony, Pad..."
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  rows={1}
                  className="resize-none"
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="lyric-generation" className="space-y-4">
          <Card className="p-6 border-border/50 bg-card/50">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Describe your lyrical concept
                </label>
                <Textarea
                  placeholder="e.g., Write verses about overcoming obstacles with a powerful, uplifting chorus..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Tone/Style (optional)
                </label>
                <Textarea
                  placeholder="e.g., Poetic, conversational, metaphorical, storytelling..."
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  rows={2}
                  className="resize-none"
                />
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="flex-1"
          size="lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4 mr-2" />
              Generate with AI
            </>
          )}
        </Button>
        {selectedArtists.length === 0 && onArtistSearch && (
          <Button
            variant="outline"
            onClick={onArtistSearch}
            size="lg"
          >
            <User className="w-4 h-4 mr-2" />
            Add M.E Models™
          </Button>
        )}
      </div>

      {/* Generated Content Display */}
      {generatedContent && (
        <Card className="p-6 border-primary/20 bg-card/50">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Generated Content
              </h3>
              <Badge className="bg-green-500/20 text-green-500">
                AI Generated
              </Badge>
            </div>
            <div className="prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap text-sm text-foreground bg-muted/50 p-4 rounded-lg">
                {generatedContent}
              </pre>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Music className="w-4 h-4 mr-2" />
                Export to DAW
              </Button>
              <Button variant="outline" size="sm">
                Copy to Clipboard
              </Button>
              <Button variant="outline" size="sm">
                Refine with AI
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Info Card */}
      <Card className="p-4 border-border/50 bg-accent/5">
        <p className="text-xs text-muted-foreground">
          💡 <strong>Pro Tip:</strong> Select M.E Models™ from Artist Vault to use specific vocal styles in your generation. 
          The AI will adapt the musical content to match their characteristic sound and performance style.
        </p>
      </Card>
    </div>
  );
};
