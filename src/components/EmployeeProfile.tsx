import { useMemo, useState } from "react";
import { Employee, getSkillById, getRoleById, getTeamById } from "@/data/mockData";
import { getCompetencyById, generateSubSkillRatings } from "@/data/competenciesData";
import { CompetencyBar } from "./CompetencyBar";
import { SubSkillModal } from "./SubSkillModal";
import { SkillImpactChart, generateSkillProgressData } from "./SkillImpactChart";
import { EmployeeSkillGapCard } from "./EmployeeSkillGapCard";
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from "@/components/GlassCard";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { ScrollReveal } from "@/components/ScrollReveal";
import { X, Target, GraduationCap, Briefcase, TrendingUp, AlertTriangle } from "lucide-react";

interface EmployeeProfileProps {
  employee: Employee;
  onClose?: () => void;
}

export function EmployeeProfile({ employee, onClose }: EmployeeProfileProps) {
  const role = getRoleById(employee.roleId);
  const team = getTeamById(employee.teamId);
  
  const [selectedCompetencyId, setSelectedCompetencyId] = useState<string | null>(null);

  // Generate stable sub-skill ratings for each competency
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
  }, [employee.id]); // Only regenerate when employee changes

  // Calculate base scores by category for impact chart
  const categoryScores = useMemo(() => {
    const scores = { legalCore: 0, businessAcumen: 0, technology: 0, softSkills: 0 };
    const counts = { legalCore: 0, businessAcumen: 0, technology: 0, softSkills: 0 };

    employee.skills.forEach((skill) => {
      const skillId = skill.skillId;
      if (skillId === 'legal-analysis' || skillId === 'contract-drafting' || skillId === 'ma-structuring') {
        scores.legalCore += skill.currentLevel;
        counts.legalCore++;
      } else if (skillId === 'commercial-awareness') {
        scores.businessAcumen += skill.currentLevel;
        counts.businessAcumen++;
      } else if (skillId === 'tech-legal-ops') {
        scores.technology += skill.currentLevel;
        counts.technology++;
      } else {
        scores.softSkills += skill.currentLevel;
        counts.softSkills++;
      }
    });

    return {
      legalCore: counts.legalCore ? Math.round(scores.legalCore / counts.legalCore) : 50,
      businessAcumen: counts.businessAcumen ? Math.round(scores.businessAcumen / counts.businessAcumen) : 50,
      technology: counts.technology ? Math.round(scores.technology / counts.technology) : 50,
      softSkills: counts.softSkills ? Math.round(scores.softSkills / counts.softSkills) : 50,
    };
  }, [employee]);

  const progressData = useMemo(() => generateSkillProgressData(categoryScores), [categoryScores]);

  const selectedCompetency = selectedCompetencyId ? getCompetencyById(selectedCompetencyId) : null;
  const selectedSkill = employee.skills.find(s => s.skillId === selectedCompetencyId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary">
            {employee.name.split(" ").map(n => n[0]).join("")}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">{employee.name}</h2>
            <p className="text-muted-foreground">{role?.name} • {team?.name}</p>
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
                <AnimatedCounter value={employee.age} duration={1200} />
              </p>
              <p className="text-sm text-muted-foreground">Age</p>
            </GlassCardContent>
          </GlassCard>
        </ScrollReveal>
        <ScrollReveal delay={100}>
          <GlassCard className="hover-lift">
            <GlassCardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-foreground">
                <AnimatedCounter value={employee.totalExperience} duration={1200} delay={100} />
              </p>
              <p className="text-sm text-muted-foreground">Years Experience</p>
            </GlassCardContent>
          </GlassCard>
        </ScrollReveal>
        <ScrollReveal delay={200}>
          <GlassCard className="hover-lift">
            <GlassCardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-foreground">
                <AnimatedCounter value={employee.firmExperience} duration={1200} delay={200} />
              </p>
              <p className="text-sm text-muted-foreground">Years at Firm</p>
            </GlassCardContent>
          </GlassCard>
        </ScrollReveal>
        <ScrollReveal delay={300}>
          <GlassCard className="hover-lift">
            <GlassCardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-primary">
                <AnimatedCounter value={employee.overallScore} suffix="%" duration={1500} delay={300} />
              </p>
              <p className="text-sm text-muted-foreground">Competency Score</p>
            </GlassCardContent>
          </GlassCard>
        </ScrollReveal>
      </div>

      {/* Education & Career */}
      <ScrollReveal delay={400}>
        <div className="grid md:grid-cols-2 gap-4">
          <GlassCard className="hover-lift">
            <GlassCardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <GraduationCap className="w-5 h-5 text-primary" />
                <span className="font-medium text-foreground">Education</span>
              </div>
              <p className="text-sm text-muted-foreground">{employee.education}</p>
            </GlassCardContent>
          </GlassCard>
          <GlassCard className="hover-lift">
            <GlassCardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-primary" />
                <span className="font-medium text-foreground">Career Objective</span>
              </div>
              <p className="text-sm text-muted-foreground">{employee.careerObjective}</p>
            </GlassCardContent>
          </GlassCard>
        </div>
      </ScrollReveal>

      {/* Competency Development Impact */}
      <ScrollReveal delay={450}>
        <GlassCard className="hover-glow">
          <GlassCardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <GlassCardTitle>Competency Development Impact</GlassCardTitle>
            </div>
            <p className="text-sm text-muted-foreground">Your progress over the last 6 months</p>
          </GlassCardHeader>
          <GlassCardContent>
            <SkillImpactChart data={progressData} showLegend={true} />
          </GlassCardContent>
        </GlassCard>
      </ScrollReveal>

      {/* Competencies Section */}
      <ScrollReveal delay={500}>
        <GlassCard>
          <GlassCardHeader>
            <GlassCardTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Competency Fit Analysis
            </GlassCardTitle>
            <p className="text-sm text-muted-foreground">Click on a competency to see sub-skills</p>
          </GlassCardHeader>
          <GlassCardContent className="space-y-2">
            {employee.skills.map((skill, index) => {
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

      {/* Skill Gaps Section */}
      {(() => {
        const skillGaps = employee.skills.filter((skill) => {
          const currentGap = skill.demandedLevel - skill.currentLevel;
          const futureGap = skill.futureLevel - skill.currentLevel;
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
                  Skill Gaps & Learning Recommendations
                </GlassCardTitle>
                <p className="text-sm text-muted-foreground">
                  {skillGaps.length} competenc{skillGaps.length === 1 ? 'y' : 'ies'} below target level
                </p>
              </GlassCardHeader>
              <GlassCardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {skillGaps.slice(0, 4).map((skill, index) => (
                    <EmployeeSkillGapCard
                      key={skill.skillId}
                      skillId={skill.skillId}
                      currentLevel={skill.currentLevel}
                      demandedLevel={skill.demandedLevel}
                      futureLevel={skill.futureLevel}
                      employeeName={employee.name}
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
        competency={selectedCompetency ?? null}
        subSkillRatings={selectedCompetencyId ? (subSkillRatingsMap[selectedCompetencyId] || []) : []}
        competencyLevel={selectedSkill?.currentLevel ?? 0}
      />
    </div>
  );
}
