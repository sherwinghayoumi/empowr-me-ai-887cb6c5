import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldX, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import futuraLogo from "@/assets/futura-teams-logo.png";

const UnauthorizedPage = () => {
  const navigate = useNavigate();
  const { profile, isAuthenticated } = useAuth();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 30;
      const y = (e.clientY / window.innerHeight - 0.5) * 30;
      setMousePosition({ x, y });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const getHomeLink = () => {
    if (!isAuthenticated || !profile) return '/login';
    
    switch (profile.role) {
      case 'super_admin':
      case 'org_admin':
        return '/admin';
      case 'employee':
        return '/employee';
      default:
        return '/employee';
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute w-[800px] h-[800px] rounded-full opacity-30 blur-[120px] animate-gradient-shift"
          style={{
            background: "radial-gradient(circle, hsl(0 84% 60% / 0.3), hsl(0 84% 60% / 0.1) 40%, transparent 70%)",
            top: "-10%",
            left: "-10%",
            transform: `translate(${mousePosition.x * 2}px, ${mousePosition.y * 2}px)`,
            transition: "transform 0.2s ease-out"
          }}
        />
        <div 
          className="absolute w-[600px] h-[600px] rounded-full opacity-20 blur-[100px] animate-gradient-shift-reverse"
          style={{
            background: "radial-gradient(circle, hsl(222 60% 30% / 0.6), transparent 70%)",
            bottom: "-5%",
            right: "-5%",
            transform: `translate(${-mousePosition.x * 1.5}px, ${-mousePosition.y * 1.5}px)`,
            transition: "transform 0.2s ease-out"
          }}
        />
        <div className="absolute inset-0 hex-pattern opacity-50" />
        <div 
          className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse at center, transparent 0%, hsl(222 47% 6% / 0.6) 70%)" }}
        />
      </div>

      {/* Logo */}
      <div className="mb-8 text-center animate-fade-in-up relative">
        <div className="flex items-center justify-center mb-4">
          <img alt="FUTURA TEAMS" src={futuraLogo} className="h-14 w-auto object-scale-down" />
        </div>
      </div>

      {/* Card */}
      <div className="w-full max-w-md relative animate-fade-in-up stagger-1 opacity-0">
        <div className="glass-card p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
            <ShieldX className="w-10 h-10 text-destructive" />
          </div>
          
          <h1 className="text-2xl font-semibold text-foreground mb-2">Zugriff verweigert</h1>
          <p className="text-muted-foreground text-sm mb-8">
            Sie haben nicht die erforderlichen Berechtigungen, um auf diese Seite zuzugreifen.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              className="flex-1 h-11 rounded-xl font-medium border-border/50 hover:bg-secondary"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zurück
            </Button>
            <Link to={getHomeLink()} className="flex-1">
              <Button className="w-full h-11 rounded-xl font-medium bg-primary text-primary-foreground hover:bg-primary/90">
                <Home className="w-4 h-4 mr-2" />
                Zur Startseite
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center animate-fade-in stagger-3 opacity-0 relative">
        <p className="text-xs text-muted-foreground">
          FUTURA TEAMS • AI-Driven Team Intelligence Platform
        </p>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
