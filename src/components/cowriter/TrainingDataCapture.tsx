import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Database, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';

interface TrainingDataCaptureProps {
  selectedModelId?: string;
}

const TrainingDataCapture = ({ selectedModelId }: TrainingDataCaptureProps) => {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [sessionType, setSessionType] = useState<string>('daw_capture');
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file size (20MB)
      if (selectedFile.size > 20 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 20MB",
          variant: "destructive",
        });
        return;
      }
      setFile(selectedFile);
      setUploadStatus('idle');
    }
  };

  const handleUpload = async () => {
    if (!file || !selectedModelId) {
      toast({
        title: "Missing information",
        description: "Please select a file and a model first",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setUploadStatus('idle');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('modelId', selectedModelId);
      formData.append('sessionType', sessionType);
      formData.append('metadata', JSON.stringify({
        notes: notes,
        originalFileName: file.name,
        uploadedAt: new Date().toISOString(),
      }));

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/training-upload`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();
      
      setUploadStatus('success');
      toast({
        title: "Upload successful",
        description: "Your training data has been uploaded and is ready for processing",
      });

      // Reset form
      setFile(null);
      setNotes('');
      const fileInput = document.getElementById('training-file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('error');
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload training data",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          <CardTitle>DAW Training Data Capture</CardTitle>
        </div>
        <CardDescription>
          Upload audio stems, MIDI files, or production sessions to train and fine-tune your M.E. Models™
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!selectedModelId && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-warning/10 border border-warning/20">
            <AlertCircle className="h-4 w-4 text-warning flex-shrink-0" />
            <p className="text-sm text-warning">
              Please select a M.E. Model™ from the Artist Vault first
            </p>
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="session-type">Session Type</Label>
            <Select value={sessionType} onValueChange={setSessionType}>
              <SelectTrigger>
                <SelectValue placeholder="Select session type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daw_capture">DAW Production Session</SelectItem>
                <SelectItem value="stem_upload">Individual Stems</SelectItem>
                <SelectItem value="midi_data">MIDI Data</SelectItem>
                <SelectItem value="mixed_audio">Mixed Audio</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="training-file-input">Audio File</Label>
            <div className="flex items-center gap-2">
              <input
                id="training-file-input"
                type="file"
                accept=".wav,.mp3,.midi,.mid,.ogg,.flac,.aac"
                onChange={handleFileChange}
                className="hidden"
                disabled={!selectedModelId || uploading}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('training-file-input')?.click()}
                disabled={!selectedModelId || uploading}
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                {file ? file.name : 'Choose file'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Supported formats: WAV, MP3, MIDI, OGG, FLAC, AAC (max 20MB)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any relevant notes about this training data (e.g., genre, BPM, key, production style)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={uploading}
              rows={3}
            />
          </div>

          <Button
            onClick={handleUpload}
            disabled={!file || !selectedModelId || uploading}
            className="w-full"
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : uploadStatus === 'success' ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Uploaded Successfully
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload Training Data
              </>
            )}
          </Button>
        </div>

        <div className="pt-4 border-t border-border/50">
          <h4 className="text-sm font-medium mb-2">Best Practices:</h4>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>Upload high-quality, uncompressed audio when possible</li>
            <li>Include diverse production styles to improve model versatility</li>
            <li>Label MIDI data with genre and production notes</li>
            <li>Organize stems by instrument type for better model training</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default TrainingDataCapture;
