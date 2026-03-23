import { useState, useEffect } from 'react';
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
import { 
  publishRoleProfiles, 
  propagateToEmployees, 
  migrateEmployeeRatings, 
  reassignEmployeesToNewQuarter 
} from '@/hooks/useRoleProfiles';
import { supabase } from '@/integrations/supabase/client';
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
  const [migrateRatings, setMigrateRatings] = useState(true);
  const [previousQuarter, setPreviousQuarter] = useState<{ quarter: string; year: number } | null>(null);
  const [migrationResult, setMigrationResult] = useState<{
    migrated: number;
    unmigrated: string[];
    employeesAffected: number;
    reassigned: number;
  } | null>(null);
  const [publishStep, setPublishStep] = useState<
    'publishing' | 'migrating' | 'reassigning' | 'propagating' | 'done'
  >('publishing');

  // Detect previous quarter with published profiles
  useEffect(() => {
    if (!open) return;
    
    const detectPreviousQuarter = async () => {
      const qNum = parseInt(quarter.replace('Q', ''));
      let prevQ: string;
      let prevY = year;
      if (qNum === 1) {
        prevQ = 'Q4';
        prevY = year - 1;
      } else {
        prevQ = `Q${qNum - 1}`;
      }
      
      const { count } = await supabase
        .from('role_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('quarter', prevQ)
        .eq('year', prevY)
        .eq('is_published', true);
      
      setPreviousQuarter(count && count > 0 ? { quarter: prevQ, year: prevY } : null);
    };
    
    detectPreviousQuarter();
  }, [open, quarter, year]);

  const handlePublish = async () => {
    if (!profile?.id) return;
    
    setIsPublishing(true);
    setPublishStep('publishing');
    setProgress(10);
    
    try {
      // Step 1: Publish role profiles
      const publishResult = await publishRoleProfiles(quarter, year, profile.id);
      setProgress(25);
      
      if (!publishResult.success) {
        throw new Error(publishResult.error);
      }
      
      setResult(publishResult.affected || { orgs: 0, employees: 0 });
      
      // Step 2: Migrate ratings from previous quarter
      let migResult = { migrated: 0, unmigrated: [] as string[], employeesAffected: 0 };
      let reassignResult = { reassigned: 0 };
      
      if (migrateRatings && previousQuarter) {
        setPublishStep('migrating');
        setProgress(40);
        
        const migResponse = await migrateEmployeeRatings(
          previousQuarter.quarter, previousQuarter.year,
          quarter, year
        );
        
        if (!migResponse.success) {
          console.error('Migration warning:', migResponse.error);
          toast.warning('Bewertungs-Migration teilweise fehlgeschlagen', {
            description: migResponse.error,
          });
        }
        
        migResult = {
          migrated: migResponse.migrated,
          unmigrated: migResponse.unmigrated,
          employeesAffected: migResponse.employeesAffected,
        };
        
        // Step 3: Reassign employees
        setPublishStep('reassigning');
        setProgress(60);
        
        const reassignResponse = await reassignEmployeesToNewQuarter(
          previousQuarter.quarter, previousQuarter.year,
          quarter, year
        );
        
        if (!reassignResponse.success) {
          console.error('Reassignment warning:', reassignResponse.error);
          toast.warning('Mitarbeiter-Zuordnung teilweise fehlgeschlagen', {
            description: reassignResponse.error,
          });
        }
        
        reassignResult = { reassigned: reassignResponse.reassigned };
      }
      
      // Step 4: Propagate demands
      if (propagate) {
        setPublishStep('propagating');
        setProgress(80);
        
        const propResult = await propagateToEmployees(quarter, year);
        
        if (!propResult.success) {
          toast.warning('Anforderungs-Propagierung teilweise fehlgeschlagen', {
            description: propResult.error,
          });
        }
      }
      
      // Done
      setPublishStep('done');
      setProgress(100);
      
      setMigrationResult({
        ...migResult,
        reassigned: reassignResult.reassigned,
      });
      
      toast.success('Erfolgreich veröffentlicht', {
        description: `${draftCount} Role Profiles für ${quarter} ${year} veröffentlicht`,
      });
      
      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 3000);
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
      setMigrationResult(null);
      setPublishStep('publishing');
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
              {publishStep === 'publishing' && 'Role Profiles werden veröffentlicht...'}
              {publishStep === 'migrating' && 'Bewertungen werden migriert...'}
              {publishStep === 'reassigning' && 'Mitarbeiter werden zugeordnet...'}
              {publishStep === 'propagating' && 'Anforderungen werden propagiert...'}
              {publishStep === 'done' && 'Abgeschlossen!'}
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

            {migrationResult && (
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-muted/30 text-center">
                    <RefreshCw className="w-6 h-6 mx-auto text-primary mb-2" />
                    <p className="text-xl font-bold">{migrationResult.migrated}</p>
                    <p className="text-xs text-muted-foreground">Bewertungen migriert</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/30 text-center">
                    <Users className="w-6 h-6 mx-auto text-primary mb-2" />
                    <p className="text-xl font-bold">{migrationResult.reassigned}</p>
                    <p className="text-xs text-muted-foreground">Mitarbeiter umgestellt</p>
                  </div>
                </div>
                
                {migrationResult.unmigrated.length > 0 && (
                  <div className="p-3 rounded-lg bg-skill-moderate/10 border border-skill-moderate/20">
                    <p className="text-sm font-medium text-skill-moderate mb-1">
                      {migrationResult.unmigrated.length} Kompetenz(en) nicht migriert:
                    </p>
                    <ul className="text-xs text-muted-foreground space-y-0.5">
                      {migrationResult.unmigrated.slice(0, 5).map((name, i) => (
                        <li key={i}>• {name} (neu oder umbenannt)</li>
                      ))}
                      {migrationResult.unmigrated.length > 5 && (
                        <li>...und {migrationResult.unmigrated.length - 5} weitere</li>
                      )}
                    </ul>
                  </div>
                )}
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

              {previousQuarter && (
                <div className="flex items-start space-x-3 p-4 rounded-lg bg-muted/30">
                  <Checkbox 
                    id="migrate" 
                    checked={migrateRatings}
                    onCheckedChange={(checked) => setMigrateRatings(checked as boolean)}
                  />
                  <div className="space-y-1">
                    <Label htmlFor="migrate" className="text-sm font-medium cursor-pointer">
                      <ArrowRightLeft className="w-4 h-4 inline mr-2" />
                      Bewertungen aus {previousQuarter.quarter} {previousQuarter.year} übernehmen
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Kopiert bestehende Mitarbeiter-Bewertungen auf die neuen Kompetenzen 
                      und stellt Mitarbeiter auf die neuen Role Profiles um
                    </p>
                  </div>
                </div>
              )}

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
                  {previousQuarter && migrateRatings
                    ? `Veröffentlicht ${draftCount} Profile, migriert Bewertungen aus ${previousQuarter.quarter} ${previousQuarter.year}, und stellt alle Mitarbeiter um. Bestehende Daten bleiben als Backup erhalten.`
                    : 'Diese Aktion kann nicht rückgängig gemacht werden. Alle Organisationen sehen die neuen Kompetenzen.'}
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
