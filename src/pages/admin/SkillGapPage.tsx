import { useMemo } from "react";
import { Header } from "@/components/Header";
import { GlassCard, GlassCardContent } from "@/components/GlassCard";
import { ScrollReveal } from "@/components/ScrollReveal";
import { SkillGapCardDb } from "@/components/SkillGapCardDb";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useEmployees } from "@/hooks/useOrgData";
import { AlertTriangle, TrendingDown, Users, FileQuestion } from "lucide-react";

// DB Employee Type (from useEmployees hook)
interface DbEmployee {
  id: string;
  full_name: string;
  overall_score: number | null;
  avatar_url: string | null;
  role_profile: {
    id: string;
    role_title: string;
    role_key: string;
  } | null;
  team: {
    id: string;
    name: string;
  } | null;
  competencies: Array<{
    id: string;
    current_level: number | null;
    demanded_level: number | null;
    future_level: number | null;
    gap_to_current: number | null;
    competency: {
      id: string;
      name: string;
      status: string | null;
      cluster: {
        name: string;
      } | null;
    } | null;
  }>;
}

interface EmployeeGap {
  employee: DbEmployee;
  competencyId: string;
  competencyName: string;
  clusterName: string;
  currentLevel: number;
  demandedLevel: number;
  futureLevel: number;
  weightedGap: number;
}

const SkillGapPage = () => {
  const { data: employees, isLoading, error } = useEmployees();

  // Calculate all skill gaps and group by cluster (category)
  const gapsByCategory = useMemo(() => {
    if (!employees || employees.length === 0) return {};
    
    const gaps: EmployeeGap[] = [];

    (employees as DbEmployee[]).forEach((emp) => {
      (emp.competencies || []).forEach((comp) => {
        const currentLevel = comp.current_level || 0;
        const demandedLevel = comp.demanded_level || 0;
        const futureLevel = comp.future_level || 0;
        
        const currentGap = demandedLevel - currentLevel;
        const futureGap = futureLevel - currentLevel;
        const weightedGap = currentGap * 0.4 + futureGap * 0.6;

        // Only include if there's a meaningful gap (>= 10%)
        if (weightedGap >= 10 && comp.competency) {
          gaps.push({
            employee: emp,
            competencyId: comp.competency.id,
            competencyName: comp.competency.name,
            clusterName: comp.competency.cluster?.name || "Other",
            currentLevel,
            demandedLevel,
            futureLevel,
            weightedGap,
          });
        }
      });
    });

    // Group by cluster (category)
    const grouped: Record<string, EmployeeGap[]> = {};
    
    gaps.forEach((gap) => {
      if (!grouped[gap.clusterName]) {
        grouped[gap.clusterName] = [];
      }
      grouped[gap.clusterName].push(gap);
    });

    // Sort within each category by weighted gap (highest first)
    Object.keys(grouped).forEach((cat) => {
      grouped[cat].sort((a, b) => b.weightedGap - a.weightedGap);
    });

    return grouped;
  }, [employees]);

  // Stats
  const totalGaps = Object.values(gapsByCategory).flat().length;
  const criticalGaps = Object.values(gapsByCategory)
    .flat()
    .filter((g) => g.weightedGap >= 30).length;
  const affectedEmployees = new Set(
    Object.values(gapsByCategory)
      .flat()
      .map((g) => g.employee.id)
  ).size;

  // Sort categories alphabetically
  const sortedCategories = Object.keys(gapsByCategory).sort();

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header variant="admin" />
        <main className="container py-8">
          <ScrollReveal>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                  <AlertTriangle className="w-8 h-8 text-destructive" />
                  Skill Gap Detector
                </h1>
                <p className="text-muted-foreground mt-1">
                  Identify competency gaps and recommend targeted learning paths
                </p>
              </div>
            </div>
          </ScrollReveal>

          {/* Loading Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>

          {/* Loading Cards */}
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <div className="flex gap-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-64 w-80 rounded-xl" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header variant="admin" />
        <main className="container py-8">
          <GlassCard>
            <GlassCardContent className="py-12 text-center">
              <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
              <p className="text-foreground">Fehler beim Laden der Daten</p>
              <p className="text-sm text-muted-foreground mt-2">
                {error.message}
              </p>
            </GlassCardContent>
          </GlassCard>
        </main>
      </div>
    );
  }

  // Empty state - no employees
  if (!employees || employees.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header variant="admin" />
        <main className="container py-8">
          <ScrollReveal>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                  <AlertTriangle className="w-8 h-8 text-destructive" />
                  Skill Gap Detector
                </h1>
                <p className="text-muted-foreground mt-1">
                  Identify competency gaps and recommend targeted learning paths
                </p>
              </div>
            </div>
          </ScrollReveal>

          <GlassCard>
            <GlassCardContent className="py-12 text-center">
              <FileQuestion className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-foreground font-medium">Keine Mitarbeiter vorhanden</p>
              <p className="text-sm text-muted-foreground mt-2">
                Fügen Sie zuerst Mitarbeiter hinzu, um Skill-Gaps zu analysieren.
              </p>
            </GlassCardContent>
          </GlassCard>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header variant="admin" />
      <main className="container py-8">
        <ScrollReveal>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <AlertTriangle className="w-8 h-8 text-destructive" />
                Skill Gap Detector
              </h1>
              <p className="text-muted-foreground mt-1">
                Identify competency gaps and recommend targeted learning paths
              </p>
            </div>
          </div>
        </ScrollReveal>

        {/* Stats Overview */}
        <ScrollReveal delay={100}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <GlassCard>
              <GlassCardContent className="py-4 flex items-center gap-4">
                <div className="p-3 rounded-full bg-destructive/20">
                  <TrendingDown className="w-6 h-6 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{totalGaps}</p>
                  <p className="text-sm text-muted-foreground">Skill Gaps gesamt</p>
                </div>
              </GlassCardContent>
            </GlassCard>
            
            <GlassCard>
              <GlassCardContent className="py-4 flex items-center gap-4">
                <div className="p-3 rounded-full bg-orange-500/20">
                  <AlertTriangle className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{criticalGaps}</p>
                  <p className="text-sm text-muted-foreground">Kritische Gaps</p>
                </div>
              </GlassCardContent>
            </GlassCard>
            
            <GlassCard>
              <GlassCardContent className="py-4 flex items-center gap-4">
                <div className="p-3 rounded-full bg-primary/20">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{affectedEmployees}</p>
                  <p className="text-sm text-muted-foreground">Betroffene Mitarbeiter</p>
                </div>
              </GlassCardContent>
            </GlassCard>
          </div>
        </ScrollReveal>

        {/* Legend */}
        <ScrollReveal delay={150}>
          <div className="flex flex-wrap gap-4 mb-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-primary/60" />
              <span className="text-muted-foreground">Aktuelles Niveau</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-foreground/70" />
              <span className="text-muted-foreground">Gefordert</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-primary" />
              <span className="text-muted-foreground">Zukünftig gefordert</span>
            </div>
          </div>
        </ScrollReveal>

        {/* Gaps by Category */}
        <div className="space-y-8">
          {sortedCategories.map((category, catIndex) => {
            const categoryGaps = gapsByCategory[category];
            if (!categoryGaps || categoryGaps.length === 0) return null;

            // Group by competency within category
            const byCompetency: Record<string, EmployeeGap[]> = {};
            categoryGaps.forEach((gap) => {
              if (!byCompetency[gap.competencyId]) {
                byCompetency[gap.competencyId] = [];
              }
              byCompetency[gap.competencyId].push(gap);
            });

            return (
              <ScrollReveal key={category} delay={200 + catIndex * 100}>
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-foreground border-b border-border pb-2">
                    {category}
                  </h2>
                  
                  {Object.entries(byCompetency).map(([competencyId, gaps]) => {
                    const firstGap = gaps[0];
                    if (!firstGap) return null;

                    return (
                      <div key={competencyId} className="space-y-2">
                        <h3 className="text-sm font-medium text-muted-foreground pl-2">
                          {firstGap.competencyName} ({gaps.length} Gaps)
                        </h3>
                        <ScrollArea className="w-full whitespace-nowrap">
                          <div className="flex gap-4 pb-4">
                            {gaps.map((gap, idx) => (
                              <SkillGapCardDb
                                key={`${gap.employee.id}-${gap.competencyId}`}
                                employee={{
                                  id: gap.employee.id,
                                  full_name: gap.employee.full_name,
                                  role_profile: gap.employee.role_profile,
                                }}
                                competency={{
                                  id: gap.competencyId,
                                  name: gap.competencyName,
                                  currentLevel: gap.currentLevel,
                                  demandedLevel: gap.demandedLevel,
                                  futureLevel: gap.futureLevel,
                                }}
                                delay={idx * 50}
                              />
                            ))}
                          </div>
                          <ScrollBar orientation="horizontal" />
                        </ScrollArea>
                      </div>
                    );
                  })}
                </div>
              </ScrollReveal>
            );
          })}
        </div>

        {totalGaps === 0 && (
          <GlassCard>
            <GlassCardContent className="py-12 text-center">
              <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-foreground">Keine signifikanten Skill Gaps erkannt</p>
              <p className="text-sm text-muted-foreground mt-2">
                Alle Mitarbeiter erfüllen oder übertreffen ihre Kompetenzanforderungen
              </p>
            </GlassCardContent>
          </GlassCard>
        )}
      </main>
    </div>
  );
};

export default SkillGapPage;
