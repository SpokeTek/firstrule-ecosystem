import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Music, Shield, Users, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-50" />
        <div className="container relative z-10 mx-auto px-4 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
            <div className="inline-block">
              <span className="px-4 py-2 rounded-full bg-card/50 backdrop-blur-sm border border-primary/20 text-sm font-medium">
                Ethical AI Music Licensing
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              Your Voice.
              <br />
              <span className="bg-gradient-accent bg-clip-text text-transparent">
                Your Rights.
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              First Rule™ empowers artists with ethical AI voice licensing. Control how your voice is used, 
              earn fair compensation, and maintain complete transparency.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 shadow-glow-purple text-lg px-8 py-6"
                asChild
              >
                <Link to="/vault">Enter Artist Vault</Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-primary/30 hover:bg-primary/10 text-lg px-8 py-6"
              >
                Explore M.E Models
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 bg-gradient-card backdrop-blur-sm border-primary/10 hover:border-primary/30 transition-all">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Artist Vault™</h3>
            <p className="text-muted-foreground">
              Secure voice stem storage with granular licensing controls and negative prompting.
            </p>
          </Card>

          <Card className="p-6 bg-gradient-card backdrop-blur-sm border-primary/10 hover:border-primary/30 transition-all">
            <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-secondary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">ClearVoice™</h3>
            <p className="text-muted-foreground">
              Transparent licensing dashboard with real-time usage tracking and revenue splits.
            </p>
          </Card>

          <Card className="p-6 bg-gradient-card backdrop-blur-sm border-primary/10 hover:border-primary/30 transition-all">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Co-Writer™</h3>
            <p className="text-muted-foreground">
              Real-time collaboration tools for producers and artists with MIDI sync.
            </p>
          </Card>

          <Card className="p-6 bg-gradient-card backdrop-blur-sm border-primary/10 hover:border-primary/30 transition-all">
            <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center mb-4">
              <Music className="w-6 h-6 text-secondary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">SessionChain™</h3>
            <p className="text-muted-foreground">
              Immutable provenance ledger ensuring every use of your voice is tracked.
            </p>
          </Card>
        </div>
      </section>

      {/* Featured Artist Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="overflow-hidden bg-gradient-card backdrop-blur-sm border-primary/20">
          <div className="p-8 md:p-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span className="text-sm font-medium text-secondary">Featured M.E Model</span>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <h2 className="text-4xl font-bold">Joel Kaiser – Vocal Essence v1</h2>
                <p className="text-lg text-muted-foreground">
                  Experience the power of ethical AI voice licensing with this demo model. 
                  Joel Kaiser's vocal essence is protected by SessionChain™ provenance and 
                  available for licensed use.
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span>Ground Truth Verified</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span>SessionChain™ Attested</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span>Commercial License Available</span>
                  </div>
                </div>

                <audio 
                  controls 
                  className="w-full mt-6"
                  src="/assets/stems/joel-kaiser-vocal-essence-v1.mp3"
                >
                  Your browser does not support the audio element.
                </audio>
              </div>

              <div className="relative h-64 md:h-80 rounded-xl overflow-hidden bg-muted/20 border border-primary/10 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-hero opacity-20" />
                <Music className="w-24 h-24 text-primary/40 relative z-10" />
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center space-y-8 bg-gradient-card backdrop-blur-sm rounded-2xl p-12 border border-primary/20">
          <h2 className="text-4xl font-bold">Ready to protect your voice?</h2>
          <p className="text-xl text-muted-foreground">
            Join First Rule™ and take control of your AI voice licensing with transparency, 
            security, and fair compensation.
          </p>
          <Button 
            size="lg" 
            className="bg-primary hover:bg-primary/90 shadow-glow-purple text-lg px-8 py-6"
            asChild
          >
            <Link to="/vault">Get Started</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
