import { useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { CompetencyBar } from "@/components/CompetencyBar";
import { SubSkillModal } from "@/components/SubSkillModal";
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from "@/components/GlassCard";
import { ScrollReveal } from "@/components/ScrollReveal";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { ParallaxBackground } from "@/components/ParallaxBackground";
import { GrowthJourneyChart } from "@/components/GrowthJourneyChart";
import { StrengthsWeaknessesRadar } from "@/components/StrengthsWeaknessesRadar";
import {
  employees,
  DEFAULT_EMPLOYEE_ID,
  getEmployeeById,
  getSkillById,
  getRoleById,
} from "@/data/mockData";
import { getCompetencyById, generateSubSkillRatings } from "@/data/competenciesData";
import { Target, TrendingUp, AlertTriangle } from "lucide-react";

const MySkillsPage = () => {
  const employee = getEmployeeById(DEFAULT_EMPLOYEE_ID) || employees[0];
  const role = getRoleById(employee.roleId);
  
  const [selectedCompetencyId, setSelectedCompetencyId] = useState<string | null>(null);

  // Generate stable sub-skill ratings
  const subSkillRatingsMap = useMemo(() => {
    const map: Record<string, { subSkillId: string; rating: number }[]> = {};
    
    employee.skills.forEach((skill) => {
      const competency = getCompetencyById(skill.skillId);
      if (competency) {
        const ratings = generateSubSkillRatings(skill.currentLevel, competency.subSkills.length);
        map[skill.skillId] = competency.subSkills.map((subSkill, idx) => ({
          subSkillId: subSkill.id,
          rating: ratings[idx],
        }));
      }
    });
    
    return map;
  }, [employee.id]);

  // Calculate competency statistics
  const avgCurrentLevel = Math.round(
    employee.skills.reduce((sum, s) => sum + s.currentLevel, 0) / employee.skills.length
  );
  const competenciesAboveDemand = employee.skills.filter(
    (s) => s.currentLevel >= s.demandedLevel
  ).length;
  const competenciesBelowDemand = employee.skills.filter(
    (s) => s.currentLevel < s.demandedLevel
  ).length;

  // Get employee first name for journey display
  const employeeFirstName = employee.name.split(" ")[0];

  // Group competencies by category
  const coreCompetencies = employee.skills.filter((s) => {
    const skill = getSkillById(s.skillId);
    return skill?.category === "Legal Core";
  });
  const techCompetencies = employee.skills.filter((s) => {
    const skill = getSkillById(s.skillId);
    return skill?.category === "Technology";
  });
  const softCompetencies = employee.skills.filter((s) => {
    const skill = getSkillById(s.skillId);
    return skill?.category === "Soft Skills";
  });
  const businessCompetencies = employee.skills.filter((s) => {
    const skill = getSkillById(s.skillId);
    return skill?.category === "Business Acumen";
  });

  const selectedCompetency = selectedCompetencyId ? getCompetencyById(selectedCompetencyId) : null;
  const selectedSkill = employee.skills.find(s => s.skillId === selectedCompetencyId);

  const renderCompetencySection = (
    title: string,
    competencies: typeof employee.skills,
    delay: number
  ) => {
    if (competencies.length === 0) return null;
    return (
      <ScrollReveal delay={delay}>
        <GlassCard>
          <GlassCardHeader>
            <GlassCardTitle className="text-foreground text-lg">{title}</GlassCardTitle>
            <p className="text-sm text-muted-foreground">Click to view sub-skills</p>
          </GlassCardHeader>
          <GlassCardContent className="space-y-2">
            {competencies.map((skill, index) => {
              const competency = getCompetencyById(skill.skillId);
              return (
                <CompetencyBar
                  key={skill.skillId}
                  competencyName={competency?.name || skill.skillId}
                  currentLevel={skill.currentLevel}
                  demandedLevel={skill.demandedLevel}
                  futureLevel={skill.futureLevel}
                  delay={index * 100}
                  onClick={() => setSelectedCompetencyId(skill.skillId)}
                />
              );
            })}
          </GlassCardContent>
        </GlassCard>
      </ScrollReveal>
    );
  };

  return (
    <div className="min-h-screen bg-background relative">
      <ParallaxBackground intensity="subtle" />
      <Header variant="employee" />

      <main className="container py-8 relative">
        <ScrollReveal>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">My Competencies</h1>
            <p className="text-muted-foreground mt-1">
              {role?.name} • Detailed Competency Analysis
            </p>
          </div>
        </ScrollReveal>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <ScrollReveal delay={0}>
            <GlassCard className="hover-lift">
              <GlassCardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg. Competency Level</p>
                    <p className="text-3xl font-bold text-foreground">
                      <AnimatedCounter value={avgCurrentLevel} suffix="%" duration={1500} />
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
                    <p className="text-sm text-muted-foreground">Above Benchmark</p>
                    <p className="text-3xl font-bold text-[hsl(var(--skill-very-strong))]">
                      <AnimatedCounter value={competenciesAboveDemand} duration={1500} delay={100} />
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-[hsl(var(--skill-very-strong))]/20 flex items-center justify-center group">
                    <TrendingUp className="w-6 h-6 text-[hsl(var(--skill-very-strong))] transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-1" />
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
                    <p className="text-sm text-muted-foreground">Below Benchmark</p>
                    <p className="text-3xl font-bold text-[hsl(var(--skill-weak))]">
                      <AnimatedCounter value={competenciesBelowDemand} duration={1500} delay={200} />
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-[hsl(var(--skill-weak))]/20 flex items-center justify-center group">
                    <AlertTriangle className="w-6 h-6 text-[hsl(var(--skill-weak))] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
                  </div>
                </div>
              </GlassCardContent>
            </GlassCard>
          </ScrollReveal>
        </div>

        {/* Charts Section */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <ScrollReveal delay={250}>
            <GlassCard className="hover-glow">
              <GlassCardHeader>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <GlassCardTitle>Deine Entwicklungs-Journey</GlassCardTitle>
                </div>
                <p className="text-sm text-muted-foreground">Lernfortschritt & Meilensteine</p>
              </GlassCardHeader>
              <GlassCardContent>
                <GrowthJourneyChart variant="employee" employeeName={employeeFirstName} />
              </GlassCardContent>
            </GlassCard>
          </ScrollReveal>

          <ScrollReveal delay={300}>
            <GlassCard className="hover-glow">
              <GlassCardHeader>
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  <GlassCardTitle>Strengths & Weaknesses</GlassCardTitle>
                </div>
                <p className="text-sm text-muted-foreground">Competency overview at a glance</p>
              </GlassCardHeader>
              <GlassCardContent>
                <StrengthsWeaknessesRadar skills={employee.skills} />
              </GlassCardContent>
            </GlassCard>
          </ScrollReveal>
        </div>

        {/* Legend */}
        <ScrollReveal delay={300}>
          <GlassCard className="mb-6">
            <GlassCardContent className="p-4">
              <div className="flex flex-wrap items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-primary" />
                  <span className="text-muted-foreground">Current Level</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[hsl(var(--skill-moderate))]" />
                  <span className="text-muted-foreground">Current Demand</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[hsl(var(--skill-weak))]" />
                  <span className="text-muted-foreground">Future Demand</span>
                </div>
              </div>
            </GlassCardContent>
          </GlassCard>
        </ScrollReveal>

        {/* Competencies by Category */}
        <div className="space-y-6">
          {renderCompetencySection("Core Legal Competencies", coreCompetencies, 400)}
          {renderCompetencySection("Technology Competencies", techCompetencies, 500)}
          {renderCompetencySection("Business Competencies", businessCompetencies, 600)}
          {renderCompetencySection("Soft Competencies", softCompetencies, 700)}
        </div>
      </main>

      {/* Sub-Skill Modal */}
      <SubSkillModal
        open={!!selectedCompetencyId}
        onOpenChange={(open) => !open && setSelectedCompetencyId(null)}
        competencyName={selectedCompetency?.name ?? null}
        subskills={selectedCompetency?.subSkills?.map(s => ({ id: s.id, name: s.name, name_de: s.nameDE })) || []}
        competencyLevel={selectedSkill?.currentLevel ?? 0}
      />
    </div>
  );
};

export default MySkillsPage;