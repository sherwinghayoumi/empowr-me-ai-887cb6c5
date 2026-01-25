import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import futuraLogo from "@/assets/futura-teams-logo.png";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Die Passwörter stimmen nicht überein');
      return;
    }

    if (password.length < 8) {
      setError('Das Passwort muss mindestens 8 Zeichen lang sein');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        setError('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
        setIsLoading(false);
        return;
      }

      setSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch {
      setError('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
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
        <div className="glass-card p-8">
          {success ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl font-semibold text-foreground mb-2">Passwort geändert</h1>
              <p className="text-muted-foreground text-sm mb-6">
                Ihr Passwort wurde erfolgreich geändert. Sie werden in Kürze zum Login weitergeleitet.
              </p>
              <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-semibold text-foreground mb-2">Neues Passwort</h1>
              <p className="text-muted-foreground text-sm mb-6">
                Geben Sie Ihr neues Passwort ein.
              </p>

              {error && (
                <div className="mb-6 p-3 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-xs font-medium text-foreground/80">
                    Neues Passwort
                  </Label>
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
                      minLength={8}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="text-xs font-medium text-foreground/80">
                    Passwort bestätigen
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10 h-11 bg-background/40 backdrop-blur-sm border-border/30 rounded-xl focus:bg-background/60 focus:border-primary/50 transition-all"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      minLength={8}
                    />
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  Das Passwort muss mindestens 8 Zeichen lang sein.
                </p>

                <Button
                  type="submit"
                  className="w-full h-11 rounded-xl font-medium bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Passwort ändern"
                  )}
                </Button>
              </form>
            </>
          )}
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

export default ResetPasswordPage;
