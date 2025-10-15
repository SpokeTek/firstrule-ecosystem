import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { Upload, Music, Sparkles, User, TrendingUp } from 'lucide-react';

interface ModelRecommendation {
  model_id: string;
  model_name: string;
  artist_name: string;
  match_score: number;
  reasoning: string;
  genre_fit: string;
  style_notes: string;
}

export const AudioAnalyzer = () => {
  const { toast } = useToast();
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [userPrompt, setUserPrompt] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendations, setRecommendations] = useState<ModelRecommendation[]>([]);
  const [mentionedArtists, setMentionedArtists] = useState<string[]>([]);

  const extractArtistNames = (prompt: string): string[] => {
    // Simple regex to find capitalized words that might be artist names
    const matches = prompt.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g);
    return matches || [];
  };

  const HighlightedText = ({ text, highlights }: { text: string; highlights: string[] }) => {
    if (!highlights || highlights.length === 0) return <>{text}</>;
    
    const parts: (string | JSX.Element)[] = [];
    let remaining = text;
    
    highlights.forEach((highlight, idx) => {
      const lowerRemaining = remaining.toLowerCase();
      const lowerHighlight = highlight.toLowerCase();
      const index = lowerRemaining.indexOf(lowerHighlight);
      
      if (index !== -1) {
        if (index > 0) {
          parts.push(remaining.substring(0, index));
        }
        parts.push(
          <mark key={`${highlight}-${idx}`} className="bg-primary/20 px-1 rounded">
            {remaining.substring(index, index + highlight.length)}
          </mark>
        );
        remaining = remaining.substring(index + highlight.length);
      }
    });
    
    if (remaining) parts.push(remaining);
    return <>{parts}</>;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('audio/')) {
        toast({
          title: 'Invalid File',
          description: 'Please upload an audio file',
          variant: 'destructive',
        });
        return;
      }
      setAudioFile(file);
      setAudioUrl(URL.createObjectURL(file));
    }
  };

  const handleAnalyze = async () => {
    if (!userPrompt.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please describe your creative vision',
        variant: 'destructive',
      });
      return;
    }

    setIsAnalyzing(true);
    setRecommendations([]);

    try {
      const artistNames = extractArtistNames(userPrompt);
      setMentionedArtists(artistNames);

      console.log('Analyzing audio with prompt:', userPrompt);
      console.log('Extracted artist names:', artistNames);

      const { data, error } = await supabase.functions.invoke('audio-analysis', {
        body: {
          audioUrl: audioUrl || null,
          userPrompt,
          artistNames,
        },
      });

      if (error) throw error;

      setRecommendations(data.recommendations || []);

      toast({
        title: 'Analysis Complete',
        description: `Found ${data.recommendations?.length || 0} matching M.E Models`,
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: 'Analysis Failed',
        description: error instanceof Error ? error.message : 'Failed to analyze audio',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Model Matchmaker
          </CardTitle>
          <CardDescription>
            Upload a reference track and describe your vision. Our AI agent will find the perfect M.E Models from the Artist Vault.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Reference Track (Optional)
            </label>
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept="audio/*"
                onChange={handleFileChange}
                className="flex-1"
              />
              {audioFile && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Music className="h-3 w-3" />
                  {audioFile.name}
                </Badge>
              )}
            </div>
            {audioUrl && (
              <audio controls src={audioUrl} className="mt-2 w-full" />
            )}
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Creative Vision *
            </label>
            <Textarea
              placeholder="Describe your project: 'I want to create a jazz cover of this track in the style of Ella Fitzgerald' or 'Looking for a pop vocal for an EDM remix, similar to Dua Lipa'"
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              rows={4}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Tip: Mention artist names to prioritize their M.E Models
            </p>
          </div>

          <Button 
            onClick={handleAnalyze} 
            disabled={isAnalyzing}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Find Matching Models
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {mentionedArtists.length > 0 && (
        <Alert>
          <User className="h-4 w-4" />
          <AlertDescription>
            Detected artists: {mentionedArtists.map((artist, i) => (
              <Badge key={i} variant="outline" className="ml-2">
                {artist}
              </Badge>
            ))}
          </AlertDescription>
        </Alert>
      )}

      {recommendations.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recommended M.E Models
          </h3>
          {recommendations.map((rec, index) => (
            <Card key={rec.model_id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">
                      {rec.model_name}
                    </CardTitle>
                    <CardDescription>
                      <HighlightedText 
                        text={`by ${rec.artist_name}`} 
                        highlights={mentionedArtists} 
                      />
                    </CardDescription>
                  </div>
                  <Badge 
                    variant={rec.match_score >= 80 ? "default" : "secondary"}
                    className="text-lg font-bold"
                  >
                    {rec.match_score}%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-sm font-medium">Why this matches:</span>
                  <p className="text-sm text-muted-foreground mt-1">
                    <HighlightedText text={rec.reasoning} highlights={mentionedArtists} />
                  </p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="outline">{rec.genre_fit}</Badge>
                  {rec.style_notes && (
                    <Badge variant="outline">{rec.style_notes}</Badge>
                  )}
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  <User className="mr-2 h-4 w-4" />
                  View Artist Profile
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
