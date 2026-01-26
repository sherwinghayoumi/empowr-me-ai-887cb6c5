import { useState } from "react";
import { Header } from "@/components/Header";
import { CompetencyBar } from "@/components/CompetencyBar";
import { SubSkillModal } from "@/components/SubSkillModal";
import { SelfAssessmentModal } from "@/components/SelfAssessmentModal";
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from "@/components/GlassCard";
import { ScrollReveal } from "@/components/ScrollReveal";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { ParallaxBackground } from "@/components/ParallaxBackground";
import { GrowthJourneyChart } from "@/components/GrowthJourneyChart";
import { StrengthsWeaknessesRadar } from "@/components/StrengthsWeaknessesRadar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Target, TrendingUp, AlertTriangle, BookOpen, ClipboardEdit } from "lucide-react";
import { 
  useEmployeeSkills, 
  groupByCluster, 
  transformForRadar,
  type ClusterGroup
} from "@/hooks/useEmployeeSkills";

const MySkillsPage = () => {
  const { data: employee, isLoading, error } = useEmployeeSkills();
  const [selectedCompetency, setSelectedCompetency] = useState<{
    name: string;
    level: number;
    subskills: { id: string; name: string; description: string | null; currentLevel: number | null; evidence?: string }[];
  } | null>(null);
  const [showSelfAssessment, setShowSelfAssessment] = useState(false);

  // Show loading state
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-28" />
            ))}
          </div>
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <Skeleton className="h-80" />
            <Skeleton className="h-80" />
          </div>
        </main>
      </div>
    );
  }

  // Show empty state if no employee data or no competencies
  if (!employee || employee.employee_competencies.length === 0) {
    return (
      <div className="min-h-screen bg-background relative">
        <ParallaxBackground intensity="subtle" />
        <Header variant="employee" />
        <main className="container py-8 relative">
          <ScrollReveal>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground">Meine Kompetenzen</h1>
              <p className="text-muted-foreground mt-1">
                {employee?.role_profile?.role_title || "Rolle nicht zugewiesen"}
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <GlassCard className="max-w-2xl mx-auto">
              <GlassCardContent className="p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  Noch keine Bewertungen vorhanden
                </h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Deine Kompetenzen wurden noch nicht bewertet. Sobald dein Profil
                  analysiert wurde, siehst du hier deine Stärken und Entwicklungsfelder.
                </p>
              </GlassCardContent>
            </GlassCard>
          </ScrollReveal>
        </main>
      </div>
    );
  }

  // Transform data for display
  const clusterGroups = groupByCluster(
    employee.employee_competencies,
    employee.employee_subskills
  );
  const radarData = transformForRadar(employee.employee_competencies);

  // Calculate statistics
  const allCompetencies = clusterGroups.flatMap((g) => g.competencies);
  const avgCurrentLevel = allCompetencies.length > 0
    ? Math.round(allCompetencies.reduce((sum, c) => sum + c.currentLevel, 0) / allCompetencies.length)
    : 0;
  const competenciesAboveDemand = allCompetencies.filter(
    (c) => c.currentLevel >= c.demandedLevel
  ).length;
  const competenciesBelowDemand = allCompetencies.filter(
    (c) => c.currentLevel < c.demandedLevel
  ).length;

  const employeeFirstName = employee.full_name.split(" ")[0];

  const handleCompetencyClick = (competency: ClusterGroup["competencies"][0]) => {
    setSelectedCompetency({
      name: competency.competencyName,
      level: competency.currentLevel,
      subskills: competency.subskills,
    });
  };

  const renderClusterSection = (cluster: ClusterGroup, delay: number) => {
    return (
      <ScrollReveal key={cluster.clusterId} delay={delay}>
        <GlassCard>
          <GlassCardHeader>
            <GlassCardTitle className="text-foreground text-lg">
              {cluster.clusterNameDe || cluster.clusterName}
            </GlassCardTitle>
            <p className="text-sm text-muted-foreground">
              Klicke für Subskills • Ø {cluster.avgLevel}%
            </p>
          </GlassCardHeader>
          <GlassCardContent className="space-y-2">
            {cluster.competencies.map((comp, index) => (
              <CompetencyBar
                key={comp.competencyId}
                competencyName={comp.competencyName}
                currentLevel={comp.currentLevel}
                demandedLevel={comp.demandedLevel}
                futureLevel={comp.futureLevel}
                delay={index * 100}
                onClick={() => handleCompetencyClick(comp)}
              />
            ))}
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
          <div className="mb-8 flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Meine Kompetenzen</h1>
              <p className="text-muted-foreground mt-1">
                {employee.role_profile?.role_title || "Rolle"} • Detaillierte Kompetenzanalyse
              </p>
            </div>
            <Button 
              onClick={() => setShowSelfAssessment(true)}
              className="gap-2"
            >
              <ClipboardEdit className="w-4 h-4" />
              Self-Assessment
            </Button>
          </div>
        </ScrollReveal>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <ScrollReveal delay={0}>
            <GlassCard className="hover-lift">
              <GlassCardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Ø Kompetenzniveau</p>
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
                    <p className="text-sm text-muted-foreground">Über Benchmark</p>
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
                    <p className="text-sm text-muted-foreground">Unter Benchmark</p>
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
                  <GlassCardTitle>Stärken & Schwächen</GlassCardTitle>
                </div>
                <p className="text-sm text-muted-foreground">Kompetenzübersicht auf einen Blick</p>
              </GlassCardHeader>
              <GlassCardContent>
                <StrengthsWeaknessesRadar skills={radarData} />
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
                  <span className="text-muted-foreground">Aktuelles Level</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[hsl(var(--skill-moderate))]" />
                  <span className="text-muted-foreground">Aktuelle Anforderung</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[hsl(var(--skill-weak))]" />
                  <span className="text-muted-foreground">Zukünftige Anforderung</span>
                </div>
              </div>
            </GlassCardContent>
          </GlassCard>
        </ScrollReveal>

        {/* Competencies by Cluster */}
        <div className="space-y-6">
          {clusterGroups.map((cluster, index) =>
            renderClusterSection(cluster, 400 + index * 100)
          )}
        </div>
      </main>

      {/* Sub-Skill Modal */}
      <SubSkillModal
        open={!!selectedCompetency}
        onOpenChange={(open) => !open && setSelectedCompetency(null)}
        competencyName={selectedCompetency?.name ?? null}
        subskills={selectedCompetency?.subskills || []}
        competencyLevel={selectedCompetency?.level ?? 0}
      />

      {/* Self-Assessment Modal */}
      <SelfAssessmentModal
        open={showSelfAssessment}
        onClose={() => setShowSelfAssessment(false)}
      />
    </div>
  );
};

export default MySkillsPage;
