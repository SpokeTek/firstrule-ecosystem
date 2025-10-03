import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

export const Navigation = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex flex-col gap-1">
              <div className="flex gap-0.5">
                <div className="w-1 h-6 bg-primary rounded-sm" />
                <div className="w-1 h-6 bg-primary/80 rounded-sm" />
                <div className="w-1 h-6 bg-primary/60 rounded-sm" />
              </div>
            </div>
            <span className="text-xl font-bold tracking-tight">
              first rule<span className="text-primary">™</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link 
              to="/vault"  
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Artist Vault™
            </Link>
            <Link 
              to="/clearvoice" 
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              ClearVoice™
            </Link>
            <Link 
              to="/cowriter" 
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Co-Writer™
            </Link>
            <Button 
              size="sm"
              className="bg-primary hover:bg-primary/90 shadow-glow-primary"
            >
              Join Waitlist
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-4">
              <Link 
                to="/vault" 
                className="text-sm font-medium hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Artist Vault™
              </Link>
              <Link 
                to="/clearvoice" 
                className="text-sm font-medium hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                ClearVoice™
              </Link>
              <Link 
                to="/cowriter" 
                className="text-sm font-medium hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Co-Writer™
              </Link>
              <Button 
                size="sm"
                className="bg-primary hover:bg-primary/90 w-full"
              >
                Join Waitlist
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
