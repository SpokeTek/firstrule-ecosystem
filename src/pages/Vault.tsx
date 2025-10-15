import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Upload, Shield, X, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { supabase } from "@/lib/supabaseClient";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Vault = () => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    artistName: "",
    email: "",
    modelName: "",
    description: "",
    exclusions: "",
  });
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkVerificationStatus();
  }, []);

  const checkVerificationStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsVerified(false);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('artists')
        .select('identity_verified')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setIsVerified(data?.identity_verified || false);
    } catch (error) {
      console.error('Error checking verification:', error);
      setIsVerified(false);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
    toast({
      title: "Files uploaded",
      description: `${files.length} file(s) added to your vault`,
    });
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    if (step === 1 && (!formData.artistName || !formData.email)) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    if (step === 2 && uploadedFiles.length === 0) {
      toast({
        title: "No files uploaded",
        description: "Please upload at least one voice stem",
        variant: "destructive",
      });
      return;
    }
    setStep(prev => prev + 1);
  };

  const handleSubmit = () => {
    if (!isVerified) {
      toast({
        title: "Verification Required",
        description: "You must verify your identity before creating an M.E Model",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Vault created successfully!",
      description: "Your M.E Model is being processed and will be ready soon.",
    });
    // In production, this would submit to the database
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8 pt-24 flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8 pt-24">
        {/* Verification Warning */}
        {isVerified === false && (
          <Alert className="max-w-2xl mx-auto mb-6 border-destructive/50 bg-destructive/10">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-destructive">
              <strong>Identity Verification Required:</strong> You must verify your identity before creating an M.E Model. 
              This ensures that only the rightful owner can create and control voice models.
            </AlertDescription>
          </Alert>
        )}
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
            ← Back to Home
          </Link>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <span className="font-semibold">Artist Vault™</span>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((num) => (
              <div key={num} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                  step >= num 
                    ? "bg-primary text-primary-foreground shadow-glow-purple" 
                    : "bg-muted text-muted-foreground"
                }`}>
                  {num}
                </div>
                {num < 3 && (
                  <div className={`w-24 h-1 mx-2 transition-all ${
                    step > num ? "bg-primary" : "bg-muted"
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm">
            <span className={step === 1 ? "text-foreground font-medium" : "text-muted-foreground"}>
              Profile
            </span>
            <span className={step === 2 ? "text-foreground font-medium" : "text-muted-foreground"}>
              Upload Stems
            </span>
            <span className={step === 3 ? "text-foreground font-medium" : "text-muted-foreground"}>
              Preferences
            </span>
          </div>
        </div>

        {/* Form Content */}
        <Card className="max-w-2xl mx-auto p-8 bg-gradient-card backdrop-blur-sm border-primary/20">
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-2xl font-bold mb-2">Create Your Artist Profile</h2>
                <p className="text-muted-foreground">
                  Tell us about yourself to get started with your M.E Model
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="artistName">Artist Name *</Label>
                  <Input
                    id="artistName"
                    placeholder="e.g., Joel Kaiser"
                    value={formData.artistName}
                    onChange={(e) => handleInputChange("artistName", e.target.value)}
                    className="bg-background/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="bg-background/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="modelName">M.E Model Name</Label>
                  <Input
                    id="modelName"
                    placeholder="e.g., Vocal Essence v1"
                    value={formData.modelName}
                    onChange={(e) => handleInputChange("modelName", e.target.value)}
                    className="bg-background/50"
                  />
                </div>
              </div>

              <Button onClick={handleNext} className="w-full bg-primary hover:bg-primary/90">
                Continue
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-2xl font-bold mb-2">Upload Voice Stems</h2>
                <p className="text-muted-foreground">
                  Upload high-quality vocal recordings for your M.E Model training
                </p>
              </div>

              <div className="border-2 border-dashed border-primary/30 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-primary" />
                  <p className="text-lg font-medium mb-2">Drop files here or click to upload</p>
                  <p className="text-sm text-muted-foreground">
                    Supported formats: WAV, MP3, FLAC (Max 100MB per file)
                  </p>
                  <input
                    id="file-upload"
                    type="file"
                    multiple
                    accept="audio/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <Label>Uploaded Files ({uploadedFiles.length})</Label>
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                      <span className="text-sm truncate flex-1">{file.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="ml-2"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Back
                </Button>
                <Button onClick={handleNext} className="flex-1 bg-primary hover:bg-primary/90">
                  Continue
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-2xl font-bold mb-2">Licensing Preferences</h2>
                <p className="text-muted-foreground">
                  Set your licensing rules and usage restrictions
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description">Model Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your vocal style, range, and unique characteristics..."
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    className="bg-background/50 min-h-24"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="exclusions">Content Exclusions (Negative Prompting)</Label>
                  <Textarea
                    id="exclusions"
                    placeholder="List any content types, genres, or uses you want to exclude (e.g., explicit content, political messaging)..."
                    value={formData.exclusions}
                    onChange={(e) => handleInputChange("exclusions", e.target.value)}
                    className="bg-background/50 min-h-24"
                  />
                  <p className="text-xs text-muted-foreground">
                    Your voice will never be used for these purposes
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                  Back
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  disabled={!isVerified}
                  className="flex-1 bg-primary hover:bg-primary/90 shadow-glow-purple disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isVerified ? 'Create Vault' : 'Verification Required'}
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Info Cards */}
        <div className="max-w-2xl mx-auto mt-8 grid md:grid-cols-3 gap-4">
          <Card className="p-4 bg-gradient-card backdrop-blur-sm border-primary/10">
            <div className="text-sm font-medium mb-1">SessionChain™</div>
            <div className="text-xs text-muted-foreground">
              Every use is tracked and verified
            </div>
          </Card>
          <Card className="p-4 bg-gradient-card backdrop-blur-sm border-primary/10">
            <div className="text-sm font-medium mb-1">Fair Compensation</div>
            <div className="text-xs text-muted-foreground">
              Earn from every licensed use
            </div>
          </Card>
          <Card className="p-4 bg-gradient-card backdrop-blur-sm border-primary/10">
            <div className="text-sm font-medium mb-1">Full Control</div>
            <div className="text-xs text-muted-foreground">
              You decide how your voice is used
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Vault;
