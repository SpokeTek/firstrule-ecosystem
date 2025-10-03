import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Navigation } from "@/components/Navigation";
import { Shield, Users, Sparkles, Music2, CheckCircle2, Mic, GitBranch } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section - HUMANS FIRST™ */}
      <section className="relative overflow-hidden pt-24">
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, hsl(215 100% 50% / 0.15) 1px, transparent 0)',
            backgroundSize: '32px 32px'
          }} />
        </div>
        
        <div className="container relative z-10 mx-auto px-4 py-20 md:py-32">
          <div className="max-w-5xl mx-auto text-center space-y-8 animate-fade-in">
            {/* Badge */}
            <div className="inline-block">
              <span className="px-4 py-2 rounded-full bg-card/50 backdrop-blur-sm border border-primary/30 text-sm font-medium">
                Harmonizing AI with The Music Industry
              </span>
            </div>
            
            {/* Main Hero Text */}
            <h1 className="text-6xl md:text-8xl font-bold leading-tight tracking-tight">
              HUMANS FIRST<span className="text-primary">™</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              First Rule™ empowers artists with ethical AI voice licensing. 
              Control how your voice is used, earn fair compensation, and maintain complete transparency.
            </p>
            
            {/* Three Pillars */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-6">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-secondary" />
                <span className="font-semibold">Consent</span>
              </div>
              <div className="hidden sm:block w-px h-6 bg-border" />
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-secondary" />
                <span className="font-semibold">Credit</span>
              </div>
              <div className="hidden sm:block w-px h-6 bg-border" />
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-secondary" />
                <span className="font-semibold">Compensation</span>
              </div>
            </div>
            
            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 shadow-glow-primary text-lg px-8 py-6 font-semibold"
                asChild
              >
                <Link to="/vault">Enter Artist Vault™</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary/30 hover:bg-primary/10 text-lg px-8 py-6 font-semibold"
              >
                Join Waitlist
              </Button>
            </div>
          </div>
        </div>
        
        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Mission Statement */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">
            Our Suite of Platforms + Tools + Services
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            At First Rule™, we are dedicated to harmonizing the complexities of music rights in the AI era. 
            Our mission is to streamline copyright aggregation, enabling rights holders to fully engage with 
            current and emerging AI opportunities while firmly holding the reins on Consent, Credit, and Compensation.
          </p>
        </div>
      </section>

      {/* Core Products */}
      <section className="container mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Artist Vault */}
          <Link to="/vault" className="group">
            <Card className="p-8 bg-gradient-card backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-all h-full hover:shadow-glow-primary">
              <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center mb-6 group-hover:bg-primary/30 transition-colors">
                <Shield className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Artist Vault™</h3>
              <p className="text-muted-foreground leading-relaxed">
                Creating and protecting Musical Essence (M.E) Models™ as securely licensable digital assets. 
                Get discovered based on your voice and musical talents.
              </p>
            </Card>
          </Link>

          {/* Co-Writer */}
          <Link to="/cowriter" className="group">
            <Card className="p-8 bg-gradient-card backdrop-blur-sm border-primary/20 hover:border-secondary/40 transition-all h-full hover:shadow-glow-secondary">
              <div className="w-14 h-14 rounded-xl bg-secondary/20 flex items-center justify-center mb-6 group-hover:bg-secondary/30 transition-colors">
                <Users className="w-7 h-7 text-secondary" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Co-Writer™</h3>
              <p className="text-muted-foreground leading-relaxed">
                Agentic AI co-writing with M.E Models™ integration. Generate full songs or stem-by-stem MIDI. 
                Real-time collaboration powered by SyncStage™ for zero-latency remote sessions. In-web and VST plugin.
              </p>
            </Card>
          </Link>

          {/* ClearVoice */}
          <Link to="/clearvoice" className="group">
            <Card className="p-8 bg-gradient-card backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-all h-full hover:shadow-glow-primary">
              <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center mb-6 group-hover:bg-primary/30 transition-colors">
                <Sparkles className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-3">ClearVoice™</h3>
              <p className="text-muted-foreground leading-relaxed">
                Our clearinghouse for songs, masters and digital voiceprints. 
                Contributing authorship rights with transparent tracking and compensation.
              </p>
            </Card>
          </Link>

          {/* M.E Models */}
          <Card className="p-8 bg-gradient-card backdrop-blur-sm border-primary/20 hover:border-secondary/40 transition-all h-full">
            <div className="w-14 h-14 rounded-xl bg-secondary/20 flex items-center justify-center mb-6">
              <Mic className="w-7 h-7 text-secondary" />
            </div>
            <h3 className="text-2xl font-bold mb-3">M.E Models™</h3>
            <p className="text-muted-foreground leading-relaxed">
              Musical Essence models capturing your unique voice, instrumental talents, and creative style. 
              Licensable, discoverable, and authentically you.
            </p>
          </Card>
        </div>
      </section>

      {/* Key Features */}
      <section className="container mx-auto px-4 py-20">
        <Card className="overflow-hidden bg-gradient-card backdrop-blur-sm border-primary/20">
          <div className="p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    Your Talent. Anywhere. Anytime. Securely.
                  </h2>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Unleash your musical legacy by joining today. License your Musical Essence (M.E)™ Model 
                    to band members, producers, and collaborators – at a price you set.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <Shield className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Ground Truth Verified</h3>
                      <p className="text-sm text-muted-foreground">
                        Cryptographic provenance ensures authenticity
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <GitBranch className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">SessionChain™ Attested</h3>
                      <p className="text-sm text-muted-foreground">
                        Immutable provenance ledger tracks every use
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Licensed & Compensated</h3>
                      <p className="text-sm text-muted-foreground">
                        Fair payment for every authorized use of your work
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 bg-gradient-hero-accent opacity-10 rounded-xl" />
                <div className="relative h-full min-h-[300px] rounded-xl overflow-hidden bg-muted/20 border border-primary/10 flex items-center justify-center">
                  <Music2 className="w-32 h-32 text-primary/30" />
                </div>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Featured Demo */}
      <section className="container mx-auto px-4 py-20">
        <Card className="overflow-hidden bg-gradient-card backdrop-blur-sm border-primary/20">
          <div className="p-8 md:p-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span className="text-sm font-medium text-secondary uppercase tracking-wide">Featured M.E Model™</span>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold">Joel Kaiser – Vocal Essence v1</h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Experience the power of ethical AI voice licensing with this demo model. 
                  Protected by SessionChain™ provenance and available for licensed use.
                </p>
                
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
                <Music2 className="w-24 h-24 text-primary/40 relative z-10" />
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Partnership Badge */}
      <section className="container mx-auto px-4 py-12">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">Powered by our partners at</p>
          <p className="text-lg font-semibold">Musical AI</p>
          <div className="flex items-center justify-center gap-8 mt-8">
            <div className="text-sm text-muted-foreground">NVIDIA Inception Member</div>
            <div className="w-px h-4 bg-border" />
            <div className="text-sm text-muted-foreground">Nashville-based</div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center space-y-8 bg-gradient-card backdrop-blur-sm rounded-2xl p-12 border border-primary/20">
          <h2 className="text-3xl md:text-4xl font-bold">Ready to protect your voice?</h2>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Join First Rule™ and take control of your AI voice licensing with transparency, 
            security, and fair compensation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 shadow-glow-primary text-lg px-8 py-6 font-semibold"
              asChild
            >
              <Link to="/vault">Get Started</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary/30 hover:bg-primary/10 text-lg px-8 py-6 font-semibold"
            >
              Join Waitlist
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="flex flex-col gap-1">
                <div className="flex gap-0.5">
                  <div className="w-1 h-4 bg-primary rounded-sm" />
                  <div className="w-1 h-4 bg-primary/80 rounded-sm" />
                  <div className="w-1 h-4 bg-primary/60 rounded-sm" />
                </div>
              </div>
              <span className="text-sm">
                © 2025 First Rule™ - All Rights Reserved
              </span>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">Privacy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms</a>
              <a href="#" className="hover:text-primary transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
