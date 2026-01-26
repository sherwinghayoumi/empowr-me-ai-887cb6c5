import { Header } from "@/components/Header";
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from "@/components/GlassCard";
import { ScrollReveal } from "@/components/ScrollReveal";
import { ParallaxBackground } from "@/components/ParallaxBackground";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Target, 
  Clock, 
  ExternalLink, 
  Sparkles,
  CheckCircle2,
  GraduationCap
} from "lucide-react";
import { useMyLearningPaths, useUpdateModuleProgress } from "@/hooks/useEmployeeData";
import { cn } from "@/lib/utils";

const MyLearningPage = () => {
  const { data: learningPaths, isLoading } = useMyLearningPaths();
  const updateModule = useUpdateModuleProgress();

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background relative">
        <ParallaxBackground intensity="subtle" />
        <Header variant="employee" />
        <main className="container py-8 relative">
          <div className="mb-8">
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-5 w-48" />
          </div>
          <div className="space-y-6">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  // Calculate total stats
  const totalModules = learningPaths?.reduce((sum, lp) => sum + (lp.modules?.length || 0), 0) || 0;
  const completedModules = learningPaths?.reduce(
    (sum, lp) => sum + (lp.modules?.filter(m => m.is_completed).length || 0), 
    0
  ) || 0;
  const activePaths = learningPaths?.filter(lp => !lp.completed_at).length || 0;

  return (
    <div className="min-h-screen bg-background relative">
      <ParallaxBackground intensity="subtle" />
      <Header variant="employee" />

      <main className="container py-8 relative">
        <ScrollReveal>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Meine Lernpfade</h1>
            <p className="text-muted-foreground mt-1">
              Personalisierte Entwicklungspfade für deine Karriere
            </p>
          </div>
        </ScrollReveal>

        {/* Stats Cards */}
        {learningPaths && learningPaths.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <ScrollReveal delay={0}>
              <GlassCard className="hover-lift">
                <GlassCardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Aktive Lernpfade</p>
                      <p className="text-3xl font-bold text-foreground">{activePaths}</p>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Target className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                </GlassCardContent>
              </GlassCard>
            </ScrollReveal>

            <ScrollReveal delay={100}>
              <GlassCard className="hover-lift">
                <GlassCardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Module abgeschlossen</p>
                      <p className="text-3xl font-bold text-[hsl(var(--skill-very-strong))]">
                        {completedModules}/{totalModules}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-[hsl(var(--skill-very-strong))]/20 flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-[hsl(var(--skill-very-strong))]" />
                    </div>
                  </div>
                </GlassCardContent>
              </GlassCard>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <GlassCard className="hover-lift">
                <GlassCardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Gesamtfortschritt</p>
                      <p className="text-3xl font-bold text-foreground">
                        {totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0}%
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                      <GraduationCap className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                </GlassCardContent>
              </GlassCard>
            </ScrollReveal>
          </div>
        )}

        {/* Learning Paths */}
        {!learningPaths || learningPaths.length === 0 ? (
          <ScrollReveal>
            <GlassCard className="max-w-2xl mx-auto">
              <GlassCardContent className="p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  Noch keine Lernpfade zugewiesen
                </h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Sobald dir Lernpfade zugewiesen werden, siehst du hier deine 
                  personalisierten Entwicklungsmodule und kannst deinen Fortschritt verfolgen.
                </p>
              </GlassCardContent>
            </GlassCard>
          </ScrollReveal>
        ) : (
          <div className="space-y-6">
            {learningPaths.map((lp, lpIndex) => {
              const moduleCount = lp.modules?.length || 0;
              const completedCount = lp.modules?.filter(m => m.is_completed).length || 0;
              const progressPercent = moduleCount > 0 
                ? Math.round((completedCount / moduleCount) * 100) 
                : (lp.progress_percent || 0);

              return (
                <ScrollReveal key={lp.id} delay={lpIndex * 100}>
                  <GlassCard className="hover-glow">
                    <GlassCardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <GlassCardTitle className="flex items-center gap-2">
                            {lp.title}
                            {lp.is_ai_generated && (
                              <Badge variant="secondary" className="gap-1">
                                <Sparkles className="w-3 h-3" />
                                KI-generiert
                              </Badge>
                            )}
                            {lp.completed_at && (
                              <Badge className="bg-[hsl(var(--skill-very-strong))] text-white gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                Abgeschlossen
                              </Badge>
                            )}
                          </GlassCardTitle>
                          {lp.target_competency && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <Target className="w-4 h-4" />
                              Ziel: {lp.target_competency.name}
                              {lp.target_level && ` (Level ${lp.target_level}%)`}
                            </p>
                          )}
                          {lp.description && (
                            <p className="text-sm text-muted-foreground mt-2">
                              {lp.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </GlassCardHeader>
                    <GlassCardContent className="space-y-4">
                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Fortschritt</span>
                          <span className="font-medium text-foreground">
                            {progressPercent}% ({completedCount}/{moduleCount} Module)
                          </span>
                        </div>
                        <Progress value={progressPercent} className="h-2" />
                      </div>

                      {/* AI Recommendation */}
                      {lp.ai_recommendation_reason && (
                        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 flex gap-2">
                          <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          <p className="text-sm text-muted-foreground">
                            {lp.ai_recommendation_reason}
                          </p>
                        </div>
                      )}

                      {/* Modules */}
                      {lp.modules && lp.modules.length > 0 && (
                        <div className="space-y-2 pt-2">
                          <h4 className="text-sm font-medium text-foreground">Module</h4>
                          <div className="space-y-2">
                            {lp.modules
                              .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
                              .map((module) => (
                                <div
                                  key={module.id}
                                  className={cn(
                                    "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                                    module.is_completed 
                                      ? "bg-[hsl(var(--skill-very-strong))]/5 border-[hsl(var(--skill-very-strong))]/20" 
                                      : "bg-secondary/30 border-border hover:bg-secondary/50"
                                  )}
                                >
                                  <Checkbox
                                    id={module.id}
                                    checked={module.is_completed || false}
                                    onCheckedChange={(checked) =>
                                      updateModule.mutate({ 
                                        moduleId: module.id, 
                                        completed: !!checked 
                                      })
                                    }
                                    disabled={updateModule.isPending}
                                  />
                                  <div className="flex-1 min-w-0">
                                    <label
                                      htmlFor={module.id}
                                      className={cn(
                                        "text-sm font-medium cursor-pointer",
                                        module.is_completed && "line-through text-muted-foreground"
                                      )}
                                    >
                                      {module.title}
                                    </label>
                                    {module.description && (
                                      <p className="text-xs text-muted-foreground line-clamp-1">
                                        {module.description}
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {module.duration_minutes && (
                                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        ~{module.duration_minutes} Min.
                                      </span>
                                    )}
                                    {module.content_url && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 px-2"
                                        asChild
                                      >
                                        <a
                                          href={module.content_url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                        >
                                          <ExternalLink className="w-3 h-3 mr-1" />
                                          Öffnen
                                        </a>
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </GlassCardContent>
                  </GlassCard>
                </ScrollReveal>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyLearningPage;
