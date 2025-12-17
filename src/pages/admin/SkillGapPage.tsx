import { useMemo } from "react";
import { Header } from "@/components/Header";
import { GlassCard, GlassCardContent } from "@/components/GlassCard";
import { ScrollReveal } from "@/components/ScrollReveal";
import { SkillGapCard } from "@/components/SkillGapCard";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { employees, skills } from "@/data/mockData";
import { AlertTriangle, TrendingDown, Users } from "lucide-react";

interface EmployeeGap {
  employee: (typeof employees)[0];
  competencyId: string;
  currentLevel: number;
  demandedLevel: number;
  futureLevel: number;
  weightedGap: number;
}

const SkillGapPage = () => {
  // Calculate all skill gaps and group by competency category
  const gapsByCategory = useMemo(() => {
    const gaps: EmployeeGap[] = [];

    employees.forEach((emp) => {
      emp.skills.forEach((skill) => {
        const currentGap = skill.demandedLevel - skill.currentLevel;
        const futureGap = skill.futureLevel - skill.currentLevel;
        const weightedGap = currentGap * 0.4 + futureGap * 0.6;

        // Only include if there's a meaningful gap
        if (weightedGap >= 10) {
          gaps.push({
            employee: emp,
            competencyId: skill.skillId,
            currentLevel: skill.currentLevel,
            demandedLevel: skill.demandedLevel,
            futureLevel: skill.futureLevel,
            weightedGap,
          });
        }
      });
    });

    // Group by skill category
    const grouped: Record<string, EmployeeGap[]> = {};
    
    skills.forEach((skill) => {
      const categoryGaps = gaps
        .filter((g) => g.competencyId === skill.id)
        .sort((a, b) => b.weightedGap - a.weightedGap);
      
      if (categoryGaps.length > 0) {
        if (!grouped[skill.category]) {
          grouped[skill.category] = [];
        }
        grouped[skill.category].push(...categoryGaps);
      }
    });

    // Sort within each category by weighted gap
    Object.keys(grouped).forEach((cat) => {
      grouped[cat].sort((a, b) => b.weightedGap - a.weightedGap);
    });

    return grouped;
  }, []);

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

  const categoryOrder = ["Legal Core", "Business Acumen", "Technology", "Soft Skills"];
  const sortedCategories = Object.keys(gapsByCategory).sort(
    (a, b) => categoryOrder.indexOf(a) - categoryOrder.indexOf(b)
  );

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
                  <p className="text-sm text-muted-foreground">Total Skill Gaps</p>
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
                  <p className="text-sm text-muted-foreground">Critical Gaps</p>
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
                  <p className="text-sm text-muted-foreground">Employees Affected</p>
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
              <span className="text-muted-foreground">Current Level</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-foreground/70" />
              <span className="text-muted-foreground">Demanded Level</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-primary" />
              <span className="text-muted-foreground">Future Demand</span>
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
                    const skill = skills.find((s) => s.id === competencyId);
                    if (!skill) return null;

                    return (
                      <div key={competencyId} className="space-y-2">
                        <h3 className="text-sm font-medium text-muted-foreground pl-2">
                          {skill.name} ({gaps.length} gaps)
                        </h3>
                        <ScrollArea className="w-full whitespace-nowrap">
                          <div className="flex gap-4 pb-4">
                            {gaps.map((gap, idx) => (
                              <SkillGapCard
                                key={`${gap.employee.id}-${gap.competencyId}`}
                                employee={gap.employee}
                                competencyId={gap.competencyId}
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
              <p className="text-foreground">No significant skill gaps detected</p>
              <p className="text-sm text-muted-foreground mt-2">
                All employees meet or exceed their competency requirements
              </p>
            </GlassCardContent>
          </GlassCard>
        )}
      </main>
    </div>
  );
};

export default SkillGapPage;
