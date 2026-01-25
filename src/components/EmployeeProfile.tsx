import { useMemo, useState } from "react";
import { useEmployee } from "@/hooks/useOrgData";
import { CompetencyBar } from "./CompetencyBar";
import { SubSkillModal } from "./SubSkillModal";
import { GrowthJourneyChart } from "./GrowthJourneyChart";
import { StrengthsWeaknessesRadar } from "./StrengthsWeaknessesRadar";
import { EmployeeSkillGapCard } from "./EmployeeSkillGapCard";
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from "@/components/GlassCard";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Skeleton } from "@/components/ui/skeleton";
import { X, Target, GraduationCap, Briefcase, TrendingUp, AlertTriangle } from "lucide-react";

interface EmployeeProfileProps {
  employeeId: string;
  onClose?: () => void;
}

// Type for mapped competency data
interface MappedCompetency {
  id: string;
  name: string;
  currentLevel: number;
  demandedLevel: number;
  futureLevel: number;
  gap: number;
  subskills: Array<{ id: string; name: string; description?: string }>;
  clusterName: string;
}

export function EmployeeProfile({ employeeId, onClose }: EmployeeProfileProps) {
  const { data: employee, isLoading } = useEmployee(employeeId);
  const [selectedCompetencyId, setSelectedCompetencyId] = useState<string | null>(null);

  // Map competencies from database structure to component-friendly format
  const mappedCompetencies = useMemo<MappedCompetency[]>(() => {
    if (!employee?.competencies) return [];
    
    return employee.competencies.map((ec) => ({
      id: ec.competency?.id || ec.competency_id,
      name: ec.competency?.name || 'Unknown',
      currentLevel: ec.current_level || 0,
      demandedLevel: ec.demanded_level || 0,
      futureLevel: ec.future_level || 0,
      gap: ec.gap_to_current || 0,
      subskills: ec.competency?.subskills || [],
      clusterName: ec.competency?.cluster?.name || 'Sonstige'
    }));
  }, [employee?.competencies]);

  // Data for radar chart
  const radarSkills = useMemo(() => {
    return mappedCompetencies.map((comp) => ({
      skillId: comp.id,
      skillName: comp.name,
      currentLevel: comp.currentLevel,
      demandedLevel: comp.demandedLevel,
      futureLevel: comp.futureLevel
    }));
  }, [mappedCompetencies]);

  // Get employee first name for journey title
  const employeeFirstName = employee?.full_name?.split(" ")[0] || "";

  // Selected competency for modal
  const selectedCompetency = useMemo(() => {
    if (!selectedCompetencyId) return null;
    return mappedCompetencies.find(c => c.id === selectedCompetencyId) || null;
  }, [selectedCompetencyId, mappedCompetencies]);

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="w-16 h-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-lg" />
      </div>
    );
  }

  // Not found state
  if (!employee) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertTriangle className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-foreground">Mitarbeiter nicht gefunden</h3>
        <p className="text-sm text-muted-foreground mt-1">Die angeforderten Daten konnten nicht geladen werden.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary">
            {employee.full_name.split(" ").map(n => n[0]).join("")}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">{employee.full_name}</h2>
            <p className="text-muted-foreground">{employee.role_profile?.role_title} • {employee.team?.name}</p>
            <p className="text-sm text-muted-foreground">{employee.email}</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ScrollReveal delay={0}>
          <GlassCard className="hover-lift">
            <GlassCardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-foreground">
                <AnimatedCounter value={employee.age || 0} duration={1200} />
              </p>
              <p className="text-sm text-muted-foreground">Alter</p>
            </GlassCardContent>
          </GlassCard>
        </ScrollReveal>
        <ScrollReveal delay={100}>
          <GlassCard className="hover-lift">
            <GlassCardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-foreground">
                <AnimatedCounter value={employee.total_experience_years || 0} duration={1200} delay={100} />
              </p>
              <p className="text-sm text-muted-foreground">Jahre Erfahrung</p>
            </GlassCardContent>
          </GlassCard>
        </ScrollReveal>
        <ScrollReveal delay={200}>
          <GlassCard className="hover-lift">
            <GlassCardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-foreground">
                <AnimatedCounter value={employee.firm_experience_years || 0} duration={1200} delay={200} />
              </p>
              <p className="text-sm text-muted-foreground">Jahre im Unternehmen</p>
            </GlassCardContent>
          </GlassCard>
        </ScrollReveal>
        <ScrollReveal delay={300}>
          <GlassCard className="hover-lift">
            <GlassCardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-primary">
                <AnimatedCounter value={Math.round(employee.overall_score || 0)} suffix="%" duration={1500} delay={300} />
              </p>
              <p className="text-sm text-muted-foreground">Kompetenz-Score</p>
            </GlassCardContent>
          </GlassCard>
        </ScrollReveal>
      </div>

      {/* Education & Career */}
      {(employee.education || employee.career_objective) && (
        <ScrollReveal delay={400}>
          <div className="grid md:grid-cols-2 gap-4">
            {employee.education && (
              <GlassCard className="hover-lift">
                <GlassCardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <GraduationCap className="w-5 h-5 text-primary" />
                    <span className="font-medium text-foreground">Ausbildung</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{employee.education}</p>
                </GlassCardContent>
              </GlassCard>
            )}
            {employee.career_objective && (
              <GlassCard className="hover-lift">
                <GlassCardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-5 h-5 text-primary" />
                    <span className="font-medium text-foreground">Karriereziel</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{employee.career_objective}</p>
                </GlassCardContent>
              </GlassCard>
            )}
          </div>
        </ScrollReveal>
      )}

      {/* Charts Section */}
      <ScrollReveal delay={450}>
        <div className="grid md:grid-cols-2 gap-4">
          <GlassCard className="hover-glow">
            <GlassCardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <GlassCardTitle>Entwicklungs-Journey</GlassCardTitle>
              </div>
              <p className="text-sm text-muted-foreground">Lernfortschritt & Meilensteine</p>
            </GlassCardHeader>
            <GlassCardContent>
              <GrowthJourneyChart variant="employee" employeeName={employeeFirstName} />
            </GlassCardContent>
          </GlassCard>

          <GlassCard className="hover-glow">
            <GlassCardHeader>
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                <GlassCardTitle>Stärken & Schwächen</GlassCardTitle>
              </div>
              <p className="text-sm text-muted-foreground">Kompetenzübersicht auf einen Blick</p>
            </GlassCardHeader>
            <GlassCardContent>
              <StrengthsWeaknessesRadar skills={radarSkills} />
            </GlassCardContent>
          </GlassCard>
        </div>
      </ScrollReveal>

      {/* Competencies Section */}
      <ScrollReveal delay={500}>
        <GlassCard>
          <GlassCardHeader>
            <GlassCardTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Kompetenz-Fit-Analyse
            </GlassCardTitle>
            <p className="text-sm text-muted-foreground">Klicken Sie auf eine Kompetenz, um Subskills anzuzeigen</p>
          </GlassCardHeader>
          <GlassCardContent className="space-y-2">
            {mappedCompetencies.map((comp, index) => (
              <CompetencyBar
                key={comp.id}
                competencyName={comp.name}
                currentLevel={comp.currentLevel}
                demandedLevel={comp.demandedLevel}
                futureLevel={comp.futureLevel}
                delay={index * 100}
                onClick={() => setSelectedCompetencyId(comp.id)}
              />
            ))}
          </GlassCardContent>
        </GlassCard>
      </ScrollReveal>

      {/* Skill Gaps Section */}
      {(() => {
        const skillGaps = mappedCompetencies.filter((comp) => {
          const currentGap = comp.demandedLevel - comp.currentLevel;
          const futureGap = comp.futureLevel - comp.currentLevel;
          return currentGap > 0 || futureGap > 0;
        }).sort((a, b) => {
          const aWeighted = (a.demandedLevel - a.currentLevel) * 0.4 + (a.futureLevel - a.currentLevel) * 0.6;
          const bWeighted = (b.demandedLevel - b.currentLevel) * 0.4 + (b.futureLevel - b.currentLevel) * 0.6;
          return bWeighted - aWeighted;
        });
        
        if (skillGaps.length === 0) return null;
        
        return (
          <ScrollReveal delay={600}>
            <GlassCard>
              <GlassCardHeader>
                <GlassCardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  Skill Gaps & Lernempfehlungen
                </GlassCardTitle>
                <p className="text-sm text-muted-foreground">
                  {skillGaps.length} Kompetenz{skillGaps.length === 1 ? '' : 'en'} unter Zielniveau
                </p>
              </GlassCardHeader>
              <GlassCardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {skillGaps.slice(0, 4).map((comp, index) => (
                    <EmployeeSkillGapCard
                      key={comp.id}
                      skillId={comp.id}
                      skillName={comp.name}
                      currentLevel={comp.currentLevel}
                      demandedLevel={comp.demandedLevel}
                      futureLevel={comp.futureLevel}
                      employeeName={employee.full_name}
                      delay={index * 100}
                    />
                  ))}
                </div>
              </GlassCardContent>
            </GlassCard>
          </ScrollReveal>
        );
      })()}

      {/* Sub-Skill Modal */}
      <SubSkillModal
        open={!!selectedCompetencyId}
        onOpenChange={(open) => !open && setSelectedCompetencyId(null)}
        competencyName={selectedCompetency?.name || null}
        subskills={selectedCompetency?.subskills || []}
        competencyLevel={selectedCompetency?.currentLevel ?? 0}
      />
    </div>
  );
}
