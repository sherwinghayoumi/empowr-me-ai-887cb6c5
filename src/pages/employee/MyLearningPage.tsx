import { useMemo } from "react";
import { Header } from "@/components/Header";
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from "@/components/GlassCard";
import { ScrollReveal } from "@/components/ScrollReveal";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { ParallaxBackground } from "@/components/ParallaxBackground";
import { EmployeeSkillGapCard } from "@/components/EmployeeSkillGapCard";
import {
  employees,
  DEFAULT_EMPLOYEE_ID,
  getEmployeeById,
  getSkillById,
} from "@/data/mockData";
import {
  AlertTriangle,
  Target,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

interface SkillGapData {
  skillId: string;
  currentLevel: number;
  demandedLevel: number;
  futureLevel: number;
  category: string;
  currentGap: number;
  futureGap: number;
  weightedGap: number;
}

const MyLearningPage = () => {
  const employee = getEmployeeById(DEFAULT_EMPLOYEE_ID) || employees[0];

  // Calculate skill gaps
  const skillGaps = useMemo(() => {
    const gaps: SkillGapData[] = [];
    
    employee.skills.forEach((skill) => {
      const skillInfo = getSkillById(skill.skillId);
      const currentGap = skill.demandedLevel - skill.currentLevel;
      const futureGap = skill.futureLevel - skill.currentLevel;
      
      // Only include skills with gaps
      if (currentGap > 0 || futureGap > 0) {
        gaps.push({
          skillId: skill.skillId,
          currentLevel: skill.currentLevel,
          demandedLevel: skill.demandedLevel,
          futureLevel: skill.futureLevel,
          category: skillInfo?.category || "Other",
          currentGap,
          futureGap,
          weightedGap: currentGap * 0.4 + futureGap * 0.6,
        });
      }
    });
    
    // Sort by weighted gap (most severe first)
    return gaps.sort((a, b) => b.weightedGap - a.weightedGap);
  }, [employee]);

  // Group by category
  const gapsByCategory = useMemo(() => {
    const grouped: Record<string, SkillGapData[]> = {};
    
    skillGaps.forEach((gap) => {
      if (!grouped[gap.category]) {
        grouped[gap.category] = [];
      }
      grouped[gap.category].push(gap);
    });
    
    return grouped;
  }, [skillGaps]);

  // Stats
  const criticalGaps = skillGaps.filter((g) => g.weightedGap >= 30).length;
  const highGaps = skillGaps.filter((g) => g.weightedGap >= 15 && g.weightedGap < 30).length;
  const moderateGaps = skillGaps.filter((g) => g.weightedGap < 15).length;
  const avgGap = skillGaps.length > 0 
    ? Math.round(skillGaps.reduce((sum, g) => sum + g.weightedGap, 0) / skillGaps.length) 
    : 0;

  const categories = Object.keys(gapsByCategory);

  return (
    <div className="min-h-screen bg-background relative">
      <ParallaxBackground intensity="subtle" />
      <Header variant="employee" />

      <main className="container py-8 relative">
        <ScrollReveal>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">My Skill Gaps</h1>
            <p className="text-muted-foreground mt-1">
              Identify areas for improvement and get personalized learning recommendations
            </p>
          </div>
        </ScrollReveal>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <ScrollReveal delay={0}>
            <GlassCard className="hover-lift">
              <GlassCardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg. Gap</p>
                    <p className="text-3xl font-bold text-foreground">
                      <AnimatedCounter value={avgGap} suffix="%" duration={1500} />
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center group">
                    <Target className="w-6 h-6 text-primary transition-transform duration-300 group-hover:scale-110" />
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
                    <p className="text-sm text-muted-foreground">Critical</p>
                    <p className="text-3xl font-bold text-destructive">
                      <AnimatedCounter value={criticalGaps} duration={1500} delay={100} />
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-destructive/20 flex items-center justify-center group">
                    <AlertTriangle className="w-6 h-6 text-destructive transition-transform duration-300 group-hover:scale-110" />
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
                    <p className="text-sm text-muted-foreground">High Priority</p>
                    <p className="text-3xl font-bold text-orange-400">
                      <AnimatedCounter value={highGaps} duration={1500} delay={200} />
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center group">
                    <AlertCircle className="w-6 h-6 text-orange-400 transition-transform duration-300 group-hover:scale-110" />
                  </div>
                </div>
              </GlassCardContent>
            </GlassCard>
          </ScrollReveal>

          <ScrollReveal delay={300}>
            <GlassCard className="hover-lift">
              <GlassCardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">On Track</p>
                    <p className="text-3xl font-bold text-[hsl(var(--skill-very-strong))]">
                      <AnimatedCounter value={employee.skills.length - skillGaps.length} duration={1500} delay={300} />
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-[hsl(var(--skill-very-strong))]/20 flex items-center justify-center group">
                    <TrendingUp className="w-6 h-6 text-[hsl(var(--skill-very-strong))] transition-transform duration-300 group-hover:scale-110" />
                  </div>
                </div>
              </GlassCardContent>
            </GlassCard>
          </ScrollReveal>
        </div>

        {/* Skill Gaps by Category */}
        {skillGaps.length > 0 ? (
          <div className="space-y-8">
            {categories.map((category, catIndex) => (
              <ScrollReveal key={category} delay={catIndex * 100}>
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-muted-foreground" />
                    {category}
                    <span className="text-sm font-normal text-muted-foreground">
                      ({gapsByCategory[category].length} gap{gapsByCategory[category].length !== 1 ? 's' : ''})
                    </span>
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {gapsByCategory[category].map((gap, index) => (
                      <EmployeeSkillGapCard
                        key={gap.skillId}
                        skillId={gap.skillId}
                        currentLevel={gap.currentLevel}
                        demandedLevel={gap.demandedLevel}
                        futureLevel={gap.futureLevel}
                        employeeName={employee.name}
                        delay={index * 100}
                      />
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        ) : (
          <ScrollReveal>
            <GlassCard>
              <GlassCardContent className="p-12 text-center">
                <TrendingUp className="w-12 h-12 text-[hsl(var(--skill-very-strong))] mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Excellent! No Skill Gaps Detected
                </h3>
                <p className="text-muted-foreground">
                  Your competencies meet or exceed the current and future demands for your role.
                </p>
              </GlassCardContent>
            </GlassCard>
          </ScrollReveal>
        )}
      </main>
    </div>
  );
};

export default MyLearningPage;