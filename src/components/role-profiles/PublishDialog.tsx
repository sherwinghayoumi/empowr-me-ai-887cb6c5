import { useState } from 'react';
import { 
  Globe, 
  Building2, 
  Users, 
  Loader2,
  AlertTriangle,
  Check,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { publishRoleProfiles, propagateToEmployees } from '@/hooks/useRoleProfiles';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface PublishDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quarter: string;
  year: number;
  draftCount: number;
  onSuccess: () => void;
}

export function PublishDialog({
  open,
  onOpenChange,
  quarter,
  year,
  draftCount,
  onSuccess,
}: PublishDialogProps) {
  const { profile } = useAuth();
  const [isPublishing, setIsPublishing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [propagate, setPropagate] = useState(true);
  const [result, setResult] = useState<{ orgs: number; employees: number } | null>(null);

  const handlePublish = async () => {
    if (!profile?.id) return;
    
    setIsPublishing(true);
    setProgress(20);
    
    try {
      // Publish role profiles
      const publishResult = await publishRoleProfiles(quarter, year, profile.id);
      setProgress(50);
      
      if (!publishResult.success) {
        throw new Error(publishResult.error);
      }
      
      setResult(publishResult.affected || { orgs: 0, employees: 0 });
      
      // Optionally propagate to employees
      if (propagate) {
        setProgress(70);
        const propResult = await propagateToEmployees(quarter, year);
        
        if (!propResult.success) {
          toast.warning('Teilweise erfolgreich', {
            description: 'Veröffentlichung erfolgreich, aber Propagierung fehlgeschlagen.',
          });
        }
      }
      
      setProgress(100);
      
      toast.success('Erfolgreich veröffentlicht', {
        description: `${draftCount} Role Profiles für ${quarter} ${year} veröffentlicht`,
      });
      
      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 1000);
    } catch (error) {
      toast.error('Veröffentlichung fehlgeschlagen', {
        description: (error as Error).message,
      });
      setIsPublishing(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setIsPublishing(false);
      setProgress(0);
      setResult(null);
    }, 200);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            Role Profiles veröffentlichen
          </DialogTitle>
          <DialogDescription>
            Alle Entwürfe für {quarter} {year} werden veröffentlicht und für alle Organisationen sichtbar.
          </DialogDescription>
        </DialogHeader>

        {isPublishing ? (
          <div className="py-6 space-y-4">
            <div className="text-center">
              {progress < 100 ? (
                <Loader2 className="w-12 h-12 mx-auto animate-spin text-primary" />
              ) : (
                <div className="w-12 h-12 mx-auto rounded-full bg-skill-very-strong/20 flex items-center justify-center">
                  <Check className="w-6 h-6 text-skill-very-strong" />
                </div>
              )}
            </div>
            <Progress value={progress} />
            <p className="text-sm text-center text-muted-foreground">
              {progress < 50 
                ? 'Role Profiles werden veröffentlicht...'
                : progress < 100
                ? 'Änderungen werden propagiert...'
                : 'Abgeschlossen!'}
            </p>
            
            {result && (
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="p-4 rounded-lg bg-muted/30 text-center">
                  <Building2 className="w-6 h-6 mx-auto text-primary mb-2" />
                  <p className="text-xl font-bold">{result.orgs}</p>
                  <p className="text-xs text-muted-foreground">Organisationen</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/30 text-center">
                  <Users className="w-6 h-6 mx-auto text-primary mb-2" />
                  <p className="text-xl font-bold">{result.employees}</p>
                  <p className="text-xs text-muted-foreground">Mitarbeiter</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-4 py-4">
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-center gap-3">
                  <Badge className="bg-primary/20 text-primary border-primary/30">
                    {draftCount}
                  </Badge>
                  <span className="text-sm">
                    Entwürfe bereit zur Veröffentlichung
                  </span>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 rounded-lg bg-muted/30">
                <Checkbox 
                  id="propagate" 
                  checked={propagate}
                  onCheckedChange={(checked) => setPropagate(checked as boolean)}
                />
                <div className="space-y-1">
                  <Label htmlFor="propagate" className="text-sm font-medium cursor-pointer">
                    <RefreshCw className="w-4 h-4 inline mr-2" />
                    Änderungen an Mitarbeiter propagieren
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Aktualisiert demanded_level und future_level für alle betroffenen Mitarbeiter
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-skill-moderate/10 border border-skill-moderate/20">
                <AlertTriangle className="w-5 h-5 text-skill-moderate shrink-0 mt-0.5" />
                <p className="text-sm text-skill-moderate">
                  Diese Aktion kann nicht rückgängig gemacht werden. Alle Organisationen sehen die neuen Kompetenzen.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Abbrechen
              </Button>
              <Button onClick={handlePublish}>
                <Globe className="w-4 h-4 mr-2" />
                Jetzt veröffentlichen
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
