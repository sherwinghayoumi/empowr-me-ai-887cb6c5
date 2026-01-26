import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from "@/components/GlassCard";
import { ScrollReveal } from "@/components/ScrollReveal";
import { 
  BookOpen, 
  Clock, 
  CheckCircle2, 
  Circle, 
  ExternalLink,
  Sparkles,
  Target,
  Calendar,
  Trash2
} from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { toast } from "sonner";

interface LearningModule {
  id: string;
  title: string;
  description: string | null;
  content_url: string | null;
  duration_minutes: number | null;
  sort_order: number | null;
  is_completed: boolean | null;
  completed_at: string | null;
}

interface LearningPath {
  id: string;
  title: string;
  description: string | null;
  ai_recommendation_reason: string | null;
  is_ai_generated: boolean | null;
  progress_percent: number | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string | null;
  target_level: number | null;
  modules: LearningModule[];
}

interface EmployeeLearningPathsTabProps {
  learningPaths: LearningPath[] | null | undefined;
  employeeName: string;
  employeeId: string;
}

export function EmployeeLearningPathsTab({ learningPaths, employeeName, employeeId }: EmployeeLearningPathsTabProps) {
  const queryClient = useQueryClient();
  const [deletePathId, setDeletePathId] = useState<string | null>(null);
  const [deletePathTitle, setDeletePathTitle] = useState<string>("");
  const [showCertificateHint, setShowCertificateHint] = useState(false);
  const [completedPathTitle, setCompletedPathTitle] = useState<string>("");

  const deleteMutation = useMutation({
    mutationFn: async (pathId: string) => {
      // First delete all modules
      const { error: modulesError } = await supabase
        .from('learning_modules')
        .delete()
        .eq('learning_path_id', pathId);
      
      if (modulesError) throw modulesError;

      // Then delete the learning path
      const { error: pathError } = await supabase
        .from('learning_paths')
        .delete()
        .eq('id', pathId);
      
      if (pathError) throw pathError;

      // Log audit event
      await supabase.rpc('log_audit_event', {
        p_action: 'delete',
        p_entity_type: 'learning_path',
        p_entity_id: pathId
      });
    },
    onSuccess: () => {
      toast.success("Lernpfad gelöscht");
      queryClient.invalidateQueries({ queryKey: ['employee', employeeId] });
      setDeletePathId(null);
    },
    onError: (error) => {
      console.error('Delete error:', error);
      toast.error("Fehler beim Löschen des Lernpfads");
    }
  });

  const completeMutation = useMutation({
    mutationFn: async (pathId: string) => {
      // Mark all modules as completed
      const { error: modulesError } = await supabase
        .from('learning_modules')
        .update({ 
          is_completed: true, 
          completed_at: new Date().toISOString() 
        })
        .eq('learning_path_id', pathId);
      
      if (modulesError) throw modulesError;

      // Mark the learning path as completed
      const { error: pathError } = await supabase
        .from('learning_paths')
        .update({ 
          completed_at: new Date().toISOString(),
          progress_percent: 100
        })
        .eq('id', pathId);
      
      if (pathError) throw pathError;

      // Log audit event
      await supabase.rpc('log_audit_event', {
        p_action: 'update',
        p_entity_type: 'learning_path',
        p_entity_id: pathId,
        p_new_values: { status: 'completed' }
      });
    },
    onSuccess: () => {
      toast.success("Lernpfad als abgeschlossen markiert");
      queryClient.invalidateQueries({ queryKey: ['employee', employeeId] });
      setShowCertificateHint(true);
    },
    onError: (error) => {
      console.error('Complete error:', error);
      toast.error("Fehler beim Abschließen des Lernpfads");
    }
  });

  const handleDeleteClick = (pathId: string, pathTitle: string) => {
    setDeletePathId(pathId);
    setDeletePathTitle(pathTitle);
  };

  const handleCompleteClick = (pathId: string, pathTitle: string) => {
    setCompletedPathTitle(pathTitle);
    completeMutation.mutate(pathId);
  };

  const confirmDelete = () => {
    if (deletePathId) {
      deleteMutation.mutate(deletePathId);
    }
  };

  const sortedPaths = useMemo(() => {
    if (!learningPaths) return [];
    return [...learningPaths].sort((a, b) => {
      const aCompleted = a.completed_at ? 1 : 0;
      const bCompleted = b.completed_at ? 1 : 0;
      if (aCompleted !== bCompleted) return aCompleted - bCompleted;
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    });
  }, [learningPaths]);

  const stats = useMemo(() => {
    if (!learningPaths || learningPaths.length === 0) {
      return { total: 0, completed: 0, inProgress: 0, totalModules: 0, completedModules: 0 };
    }
    
    const completed = learningPaths.filter(p => p.completed_at).length;
    const inProgress = learningPaths.filter(p => !p.completed_at && (p.progress_percent || 0) > 0).length;
    const totalModules = learningPaths.reduce((sum, p) => sum + (p.modules?.length || 0), 0);
    const completedModules = learningPaths.reduce(
      (sum, p) => sum + (p.modules?.filter(m => m.is_completed).length || 0), 
      0
    );
    
    return { total: learningPaths.length, completed, inProgress, totalModules, completedModules };
  }, [learningPaths]);

  if (!learningPaths || learningPaths.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <BookOpen className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-foreground">Keine Lernpfade vorhanden</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-md">
          Für {employeeName} wurden noch keine Lernpfade erstellt. 
          Lernpfade können über die Skill Gap-Analyse generiert werden.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <ScrollReveal>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <GlassCard>
            <GlassCardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Lernpfade gesamt</p>
            </GlassCardContent>
          </GlassCard>
          <GlassCard>
            <GlassCardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-primary">{stats.inProgress}</p>
              <p className="text-sm text-muted-foreground">In Bearbeitung</p>
            </GlassCardContent>
          </GlassCard>
          <GlassCard>
            <GlassCardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.completed}</p>
              <p className="text-sm text-muted-foreground">Abgeschlossen</p>
            </GlassCardContent>
          </GlassCard>
          <GlassCard>
            <GlassCardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-foreground">
                {stats.completedModules}/{stats.totalModules}
              </p>
              <p className="text-sm text-muted-foreground">Module erledigt</p>
            </GlassCardContent>
          </GlassCard>
        </div>
      </ScrollReveal>

      {/* Learning Paths List */}
      <div className="space-y-4">
        {sortedPaths.map((path, index) => (
          <ScrollReveal key={path.id} delay={index * 100}>
            <LearningPathCard 
              path={path} 
              onDelete={() => handleDeleteClick(path.id, path.title)}
              onComplete={() => handleCompleteClick(path.id, path.title)}
              isDeleting={deleteMutation.isPending && deletePathId === path.id}
              isCompleting={completeMutation.isPending}
            />
          </ScrollReveal>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletePathId} onOpenChange={(open) => !open && setDeletePathId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Lernpfad löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie den Lernpfad "{deletePathTitle}" wirklich löschen? 
              Diese Aktion kann nicht rückgängig gemacht werden. Alle zugehörigen Module werden ebenfalls gelöscht.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Wird gelöscht..." : "Löschen"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Certificate Upload Hint Dialog */}
      <AlertDialog open={showCertificateHint} onOpenChange={setShowCertificateHint}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              Lernpfad abgeschlossen!
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                Herzlichen Glückwunsch! Der Lernpfad "{completedPathTitle}" wurde erfolgreich abgeschlossen.
              </p>
              <p>
                Falls Sie ein Zertifikat oder Teilnahmebestätigung erhalten haben, können Sie dieses 
                über den <strong>"Zertifikat hochladen"</strong>-Button im Mitarbeiterprofil hochladen.
              </p>
              <p className="text-sm">
                Das Zertifikat wird analysiert und kann zur automatischen Aktualisierung der Kompetenzwerte verwendet werden.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowCertificateHint(false)}>
              Verstanden
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

interface LearningPathCardProps {
  path: LearningPath;
  onDelete: () => void;
  onComplete: () => void;
  isDeleting: boolean;
  isCompleting: boolean;
}

function LearningPathCard({ path, onDelete, onComplete, isDeleting, isCompleting }: LearningPathCardProps) {
  const completedModules = path.modules?.filter(m => m.is_completed).length || 0;
  const totalModules = path.modules?.length || 0;
  const progress = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;
  const totalDuration = path.modules?.reduce((sum, m) => sum + (m.duration_minutes || 0), 0) || 0;
  const isCompleted = !!path.completed_at;

  return (
    <GlassCard className={isCompleted ? "opacity-75" : ""}>
      <GlassCardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <GlassCardTitle className="text-lg">{path.title}</GlassCardTitle>
              {path.is_ai_generated && (
                <Badge variant="secondary" className="gap-1">
                  <Sparkles className="w-3 h-3" />
                  KI-generiert
                </Badge>
              )}
              {isCompleted && (
                <Badge variant="default" className="bg-emerald-600 dark:bg-emerald-500 gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Abgeschlossen
                </Badge>
              )}
            </div>
            {path.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">{path.description}</p>
            )}
          </div>
          <div className="flex items-start gap-3 shrink-0">
            <div className="text-right">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                {Math.round(totalDuration / 60)}h {totalDuration % 60}min
              </div>
              {path.target_level && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                  <Target className="w-4 h-4" />
                  Ziel: {path.target_level}%
                </div>
              )}
            </div>
            {!isCompleted && (
              <Button
                variant="outline"
                size="sm"
                onClick={onComplete}
                disabled={isCompleting}
                className="gap-1 text-emerald-600 dark:text-emerald-400 border-emerald-600/30 hover:bg-emerald-500/10"
              >
                <CheckCircle2 className="w-4 h-4" />
                {isCompleting ? "..." : "Abschließen"}
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
              disabled={isDeleting}
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </GlassCardHeader>
      <GlassCardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Fortschritt</span>
            <span className="font-medium text-foreground">{completedModules}/{totalModules} Module ({progress}%)</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* AI Recommendation Reason */}
        {path.ai_recommendation_reason && (
          <div className="bg-secondary/50 rounded-lg p-3 text-sm">
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <p className="text-muted-foreground">{path.ai_recommendation_reason}</p>
            </div>
          </div>
        )}

        {/* Modules List */}
        {path.modules && path.modules.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Module</p>
            <div className="space-y-2">
              {path.modules
                .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
                .map((module) => (
                  <ModuleItem key={module.id} module={module} />
                ))}
            </div>
          </div>
        )}

        {/* Dates */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t border-border">
          {path.created_at && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Erstellt: {format(new Date(path.created_at), "dd.MM.yyyy", { locale: de })}
            </div>
          )}
          {path.started_at && (
            <div className="flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              Gestartet: {format(new Date(path.started_at), "dd.MM.yyyy", { locale: de })}
            </div>
          )}
          {path.completed_at && (
            <div className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Abgeschlossen: {format(new Date(path.completed_at), "dd.MM.yyyy", { locale: de })}
            </div>
          )}
        </div>
      </GlassCardContent>
    </GlassCard>
  );
}

function ModuleItem({ module }: { module: LearningModule }) {
  return (
    <div className={`flex items-center gap-3 p-2 rounded-lg border ${
      module.is_completed 
        ? "bg-emerald-500/10 border-emerald-500/20" 
        : "bg-secondary/30 border-border"
    }`}>
      {module.is_completed ? (
        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
      ) : (
        <Circle className="w-5 h-5 text-muted-foreground shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${module.is_completed ? "text-muted-foreground line-through" : "text-foreground"}`}>
          {module.title}
        </p>
        {module.duration_minutes && (
          <p className="text-xs text-muted-foreground">
            {module.duration_minutes} Minuten
          </p>
        )}
      </div>
      {module.content_url && (
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="shrink-0"
        >
          <a href={module.content_url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-4 h-4" />
          </a>
        </Button>
      )}
    </div>
  );
}
