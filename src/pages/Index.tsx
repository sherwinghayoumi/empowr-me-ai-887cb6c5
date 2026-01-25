import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Mail, Lock, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import futuraLogo from "@/assets/futura-teams-logo.png";

const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, isAuthenticated, isLoading: authLoading, profile } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Get the redirect path from location state
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname;

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 30;
      const y = (e.clientY / window.innerHeight - 0.5) * 30;
      setMousePosition({ x, y });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && profile && !authLoading) {
      const redirectTo = from || getDefaultRedirect(profile.role, profile.is_super_admin);
      
      toast({
        title: "Willkommen zurück!",
        description: `Angemeldet als ${profile.full_name || profile.email}`,
      });
      
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, profile, authLoading, navigate, from]);

  const getDefaultRedirect = (role: string, isSuperAdmin: boolean) => {
    if (isSuperAdmin || role === 'super_admin') {
      return '/super-admin';
    }
    switch (role) {
      case 'org_admin':
        return '/admin';
      case 'employee':
        return '/employee';
      default:
        return '/employee';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      setError(getErrorMessage(error.message));
      setIsLoading(false);
      
      toast({
        title: "Anmeldung fehlgeschlagen",
        description: getErrorMessage(error.message),
        variant: "destructive",
      });
    }
  };

  const getErrorMessage = (message: string) => {
    if (message.includes('Invalid login credentials')) {
      return 'Ungültige E-Mail oder Passwort';
    }
    if (message.includes('Email not confirmed')) {
      return 'Bitte bestätigen Sie Ihre E-Mail-Adresse';
    }
    if (message.includes('Too many requests')) {
      return 'Zu viele Anmeldeversuche. Bitte warten Sie einen Moment.';
    }
    return 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.';
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">Lade...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 overflow-hidden">
      {/* Enhanced animated background with FUTURA theme */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Primary gold orb */}
        <div 
          className="absolute w-[800px] h-[800px] rounded-full opacity-30 blur-[120px] animate-gradient-shift"
          style={{
            background: "radial-gradient(circle, hsl(45 75% 50% / 0.4), hsl(45 75% 50% / 0.1) 40%, transparent 70%)",
            top: "-10%",
            left: "-10%",
            transform: `translate(${mousePosition.x * 2}px, ${mousePosition.y * 2}px)`,
            transition: "transform 0.2s ease-out"
          }}
        />
        {/* Secondary blue orb */}
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
        {/* Center pulse orb */}
        <div 
          className="absolute w-[500px] h-[500px] rounded-full opacity-15 blur-[80px] animate-gradient-pulse"
          style={{
            background: "radial-gradient(circle, hsl(45 75% 55% / 0.3), transparent 70%)",
            top: "50%",
            left: "50%",
            transform: `translate(-50%, -50%) translate(${mousePosition.x * 0.8}px, ${mousePosition.y * 0.8}px)`,
            transition: "transform 0.2s ease-out"
          }}
        />
        {/* Additional floating orbs */}
        <div 
          className="absolute w-[300px] h-[300px] rounded-full opacity-15 blur-[60px]"
          style={{
            background: "radial-gradient(circle, hsl(45 75% 50% / 0.4), transparent 70%)",
            top: "60%",
            left: "20%",
            transform: `translate(${mousePosition.x * -1.2}px, ${mousePosition.y * 1.2}px)`,
            transition: "transform 0.25s ease-out",
            animation: "float 8s ease-in-out infinite"
          }}
        />
        <div 
          className="absolute w-[250px] h-[250px] rounded-full opacity-10 blur-[50px]"
          style={{
            background: "radial-gradient(circle, hsl(222 60% 40% / 0.4), transparent 70%)",
            top: "20%",
            right: "25%",
            transform: `translate(${mousePosition.x * 1}px, ${mousePosition.y * -1}px)`,
            transition: "transform 0.25s ease-out",
            animation: "float 6s ease-in-out infinite reverse"
          }}
        />
        
        {/* Hexagon pattern overlay */}
        <div className="absolute inset-0 hex-pattern opacity-50" />
        
        {/* Animated grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(hsl(45 75% 50%) 1px, transparent 1px),
              linear-gradient(90deg, hsl(45 75% 50%) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
            transform: `translate(${mousePosition.x * 0.1}px, ${mousePosition.y * 0.1}px)`,
            transition: "transform 0.3s ease-out"
          }}
        />
        
        {/* Subtle radial gradient overlay */}
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
        <p className="text-muted-foreground text-base max-w-md italic">
          „Empower your teams for the future"
        </p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md relative animate-fade-in-up stagger-1 opacity-0">
        <div className="glass-card p-8">
          <h1 className="text-2xl font-semibold text-foreground mb-2">Willkommen</h1>
          <p className="text-muted-foreground text-sm mb-6">
            Melden Sie sich an, um fortzufahren
          </p>

          {error && (
            <div className="mb-6 p-3 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-3 animate-shake">
              <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium text-foreground/80">
                E-Mail
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@unternehmen.de"
                  className="pl-10 h-11 bg-background/40 backdrop-blur-sm border-border/30 rounded-xl focus:bg-background/60 focus:border-primary/50 transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-medium text-foreground/80">
                  Passwort
                </Label>
                <Link 
                  to="/forgot-password" 
                  className="text-xs text-primary hover:text-primary/80 transition-colors"
                >
                  Passwort vergessen?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10 h-11 bg-background/40 backdrop-blur-sm border-border/30 rounded-xl focus:bg-background/60 focus:border-primary/50 transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  autoComplete="current-password"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 rounded-xl group/btn font-medium bg-primary text-primary-foreground hover:bg-primary/90 mt-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Anmelden...
                </>
              ) : (
                <>
                  <span>Anmelden</span>
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover/btn:translate-x-1" />
                </>
              )}
            </Button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center animate-fade-in stagger-3 opacity-0 relative">
        <p className="text-xs text-muted-foreground">
          FUTURA TEAMS • AI-Driven Team Intelligence Platform
        </p>
        <p className="text-xs text-muted-foreground/60 mt-1">
          © {new Date().getFullYear()} FUTURA INTELLIGENCE
        </p>
      </div>
    </div>
  );
};

export default Index;
