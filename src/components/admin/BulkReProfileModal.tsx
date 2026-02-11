import { useState, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, CheckCircle, XCircle, Clock, SkipForward, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { parseAllDocuments } from '@/lib/documentParser';
import { generateProfile } from '@/lib/profileGenerator';
import { saveProfileToDatabase, downloadDocumentsFromStorage } from '@/hooks/useProfileSaving';
import { toast } from 'sonner';

interface BulkEmployee {
  id: string;
  full_name: string;
  cv_storage_path: string | null;
  self_assessment_path: string | null;
  manager_assessment_path: string | null;
  role_profile: { id: string; role_key: string } | null;
}

type EmployeeStatus = 'waiting' | 'processing' | 'done' | 'error' | 'skipped';

interface EmployeeProgress {
  id: string;
  name: string;
  status: EmployeeStatus;
  error?: string;
  matched?: number;
}

interface BulkReProfileModalProps {
  open: boolean;
  onClose: () => void;
  employees: BulkEmployee[];
  onComplete: () => void;
}

export function BulkReProfileModal({ open, onClose, employees, onComplete }: BulkReProfileModalProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [progress, setProgress] = useState<EmployeeProgress[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const abortRef = useRef(false);

  const eligibleEmployees = employees.filter(
    emp => emp.cv_storage_path && emp.self_assessment_path && emp.manager_assessment_path
  );
  const skippedEmployees = employees.filter(
    emp => !emp.cv_storage_path || !emp.self_assessment_path || !emp.manager_assessment_path
  );

  const startBulkUpdate = useCallback(async () => {
    abortRef.current = false;
    setIsRunning(true);
    setIsDone(false);

    const initialProgress: EmployeeProgress[] = [
      ...skippedEmployees.map(emp => ({
        id: emp.id,
        name: emp.full_name,
        status: 'skipped' as EmployeeStatus,
        error: 'Keine gespeicherten Dokumente',
      })),
      ...eligibleEmployees.map(emp => ({
        id: emp.id,
        name: emp.full_name,
        status: 'waiting' as EmployeeStatus,
      })),
    ];
    setProgress(initialProgress);

    for (let i = 0; i < eligibleEmployees.length; i++) {
      if (abortRef.current) break;

      const emp = eligibleEmployees[i];
      setCurrentIndex(i);

      // Set current to processing
      setProgress(prev => prev.map(p =>
        p.id === emp.id ? { ...p, status: 'processing' } : p
      ));

      try {
        // 1. Download documents from storage
        const docs = await downloadDocumentsFromStorage({
          cv_storage_path: emp.cv_storage_path,
          self_assessment_path: emp.self_assessment_path,
          manager_assessment_path: emp.manager_assessment_path,
        });

        if (!docs.cv && !docs.selfAssessment && !docs.managerAssessment) {
          throw new Error('Dokumente konnten nicht heruntergeladen werden');
        }

        // 2. Parse documents
        const parsedDocs = await parseAllDocuments(docs);

        // 3. Get DB competencies for role profile
        const roleKey = emp.role_profile?.role_key || 'mid-level_associate_(mla)';
        let dbCompetencySchema: Array<{ clusterName: string; competencyName: string; subskills: string[] }> = [];

        if (emp.role_profile?.id) {
          const { data: dbComps } = await supabase
            .from('competencies')
            .select(`name, cluster:competency_clusters(name), subskills(name)`)
            .eq('role_profile_id', emp.role_profile.id)
            .eq('status', 'active');

          if (dbComps && dbComps.length > 0) {
            dbCompetencySchema = dbComps.map((c: any) => ({
              clusterName: c.cluster?.name || 'Uncategorized',
              competencyName: c.name,
              subskills: (c.subskills || []).map((s: any) => s.name),
            }));
          }
        }

        // 4. Generate profile via AI
        const profile = await generateProfile(
          parsedDocs,
          roleKey,
          dbCompetencySchema.length > 0 ? dbCompetencySchema : undefined
        );

        if (!profile || !profile.analysis || typeof profile.analysis.overallScore !== 'number') {
          throw new Error('Unvollständiges Profil erhalten');
        }

        // 5. Save profile to database
        const result = await saveProfileToDatabase(emp.id, profile);

        setProgress(prev => prev.map(p =>
          p.id === emp.id ? { ...p, status: 'done', matched: result.matched } : p
        ));
      } catch (error) {
        setProgress(prev => prev.map(p =>
          p.id === emp.id ? {
            ...p,
            status: 'error',
            error: error instanceof Error ? error.message : 'Unbekannter Fehler',
          } : p
        ));
      }

      // 6. Wait 5 seconds between employees (rate-limiting)
      if (i < eligibleEmployees.length - 1 && !abortRef.current) {
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }

    setIsRunning(false);
    setIsDone(true);
    onComplete();
  }, [eligibleEmployees, skippedEmployees, onComplete]);

  const handleAbort = () => {
    abortRef.current = true;
  };

  const handleClose = () => {
    if (isRunning) {
      abortRef.current = true;
    }
    onClose();
  };

  const completedCount = progress.filter(p => p.status === 'done').length;
  const errorCount = progress.filter(p => p.status === 'error').length;
  const skippedCount = progress.filter(p => p.status === 'skipped').length;
  const totalEligible = eligibleEmployees.length;
  const progressPercent = totalEligible > 0 ? (completedCount / totalEligible) * 100 : 0;

  const statusIcon = (status: EmployeeStatus) => {
    switch (status) {
      case 'waiting': return <Clock className="w-4 h-4 text-muted-foreground" />;
      case 'processing': return <Loader2 className="w-4 h-4 text-primary animate-spin" />;
      case 'done': return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'error': return <XCircle className="w-4 h-4 text-destructive" />;
      case 'skipped': return <SkipForward className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="max-w-[600px] w-[90vw] max-h-[85vh] overflow-hidden bg-card/95 backdrop-blur-xl border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />
            Profile aktualisieren
          </DialogTitle>
        </DialogHeader>

        {!isRunning && !isDone && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {eligibleEmployees.length} Mitarbeiter mit gespeicherten Dokumenten werden
              sequentiell neu profiliert. {skippedEmployees.length > 0 && (
                <span className="text-amber-500">
                  {skippedEmployees.length} werden übersprungen (keine Dokumente).
                </span>
              )}
            </p>
            <p className="text-xs text-muted-foreground">
              ⏱ Geschätzte Dauer: ~{Math.ceil(eligibleEmployees.length * 35 / 60)} Minuten
              (ca. 30s pro Profil + 5s Pause)
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={onClose}>Abbrechen</Button>
              <Button onClick={startBulkUpdate} disabled={eligibleEmployees.length === 0} className="gap-2">
                <RefreshCw className="w-4 h-4" />
                {eligibleEmployees.length} Profile aktualisieren
              </Button>
            </div>
          </div>
        )}

        {(isRunning || isDone) && (
          <div className="space-y-4">
            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{completedCount}/{totalEligible} Profile aktualisiert</span>
                <span>{Math.round(progressPercent)}%</span>
              </div>
              <Progress value={progressPercent} className="h-2" />
              {errorCount > 0 && (
                <p className="text-xs text-destructive">{errorCount} Fehler</p>
              )}
            </div>

            {/* Employee list */}
            <ScrollArea className="h-[350px]">
              <div className="space-y-1 pr-4">
                {progress.map((emp) => (
                  <div
                    key={emp.id}
                    className={cn(
                      "flex items-center justify-between p-2 rounded text-sm",
                      emp.status === 'processing' && "bg-primary/10",
                      emp.status === 'done' && "bg-emerald-500/5",
                      emp.status === 'error' && "bg-destructive/5",
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {statusIcon(emp.status)}
                      <span className="truncate">{emp.name}</span>
                    </div>
                    <div className="shrink-0 ml-2">
                      {emp.status === 'done' && emp.matched !== undefined && (
                        <Badge variant="outline" className="text-xs bg-emerald-500/20 text-emerald-500 border-emerald-500/30">
                          {emp.matched} ✓
                        </Badge>
                      )}
                      {emp.status === 'error' && (
                        <span className="text-xs text-destructive truncate max-w-[150px]" title={emp.error}>
                          {emp.error}
                        </span>
                      )}
                      {emp.status === 'skipped' && (
                        <span className="text-xs text-muted-foreground">Übersprungen</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Action buttons */}
            <div className="flex justify-end gap-3 pt-2 border-t border-border">
              {isRunning ? (
                <Button variant="destructive" onClick={handleAbort} className="gap-2">
                  Abbrechen
                </Button>
              ) : (
                <Button onClick={handleClose}>Schließen</Button>
              )}
            </div>

            {/* Summary */}
            {isDone && (
              <div className="p-3 rounded-lg bg-muted/30 border border-border/50 text-sm">
                <p className="font-medium mb-1">Zusammenfassung</p>
                <p>✅ {completedCount} erfolgreich • ❌ {errorCount} Fehler • ⏭ {skippedCount} übersprungen</p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
