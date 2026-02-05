import { useState, useEffect } from 'react';
import { X, LogOut, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getImpersonationInfo, endImpersonation } from '@/hooks/useUsers';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function ImpersonationBanner() {
  const navigate = useNavigate();
  const [impersonation, setImpersonation] = useState<{ id: string; name: string; startedAt: string } | null>(null);

  useEffect(() => {
    setImpersonation(getImpersonationInfo());
    
    // Listen for storage changes (for multi-tab support)
    const handleStorage = () => {
      setImpersonation(getImpersonationInfo());
    };
    
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const handleEndImpersonation = async () => {
    if (!impersonation) return;
    
    try {
      // Sign out current impersonated user
      await supabase.auth.signOut();
      
      // Clear impersonation state
      endImpersonation();
      setImpersonation(null);
      
      toast.success('Impersonation beendet');
      
      // Redirect to login (super admin needs to re-login)
      navigate('/login');
    } catch {
      toast.error('Fehler beim Beenden der Impersonation');
    }
  };

  if (!impersonation) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-skill-moderate text-skill-moderate-foreground px-4 py-2">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5" />
          <span className="text-sm font-medium">
            Du bist eingeloggt als <strong>{impersonation.name}</strong>
          </span>
          <span className="text-xs opacity-75">
            (seit {new Date(impersonation.startedAt).toLocaleTimeString('de-DE')})
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-skill-moderate-foreground hover:bg-skill-moderate-foreground/20"
          onClick={handleEndImpersonation}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Zurück zu Super Admin
        </Button>
      </div>
    </div>
  );
}
