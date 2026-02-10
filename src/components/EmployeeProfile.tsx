import { useMemo, useState, useCallback } from "react";
import { useEmployee } from "@/hooks/useOrgData";
import { useQueryClient } from "@tanstack/react-query";
import { CompetencyBar } from "./CompetencyBar";
import { SubSkillModal } from "./SubSkillModal";
import { SwipeableRadarChart } from "./SwipeableRadarChart";
import { RadarChartModal } from "./RadarChartModal";
import { EmployeeSkillGapCard } from "./EmployeeSkillGapCard";
import { CertificateUploadModal } from "./CertificateUploadModal";
import { EmployeeLearningPathsTab } from "./EmployeeLearningPathsTab";
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from "@/components/GlassCard";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, Target, GraduationCap, Briefcase, AlertTriangle, Maximize2, ChevronDown, ChevronUp, FileUp, BookOpen, BarChart3 } from "lucide-react";
import { capLevel } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { GeneratedProfile } from "@/types/profileGeneration";
import { CertificateUpdateResult } from "@/types/certificateUpdate";

interface EmployeeProfileProps {
  employeeId: string;
  onClose?: () => void;
}

// Type for mapped competency data
interface MappedSubskill {
  id: string;
  name: string;
  description?: string;
  currentLevel: number | null;
  evidence?: string;
}

interface MappedCompetency {
  id: string;
  name: string;
  currentLevel: number;
  demandedLevel: number;
  futureLevel: number;
  gap: number;
  subskills: MappedSubskill[];
  clusterName: string;
}

export function EmployeeProfile({ employeeId, onClose }: EmployeeProfileProps) {
  const { data: employee, isLoading } = useEmployee(employeeId);
  const queryClient = useQueryClient();
  const [selectedCompetencyId, setSelectedCompetencyId] = useState<string | null>(null);
  const [isRadarModalOpen, setIsRadarModalOpen] = useState(false);
  const [showAllGaps, setShowAllGaps] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);

  // Build a GeneratedProfile from current employee data for certificate analysis
  const currentProfile = useMemo<GeneratedProfile | null>(() => {
    if (!employee?.competencies) return null;

    // Group competencies by cluster
    const clusterMap = new Map<string, { clusterName: string; competencies: any[] }>();
    
    for (const ec of employee.competencies) {
      const clusterName = ec.competency?.cluster?.name || 'Sonstige';
      if (!clusterMap.has(clusterName)) {
        clusterMap.set(clusterName, { clusterName, competencies: [] });
      }
      
      clusterMap.get(clusterName)!.competencies.push({
        name: ec.competency?.name || 'Unknown',
        rating: (ec.current_level || 0) / 20, // Convert 0-100 back to 1-5
        confidence: 'HIGH' as const,
        selfRating: ec.self_rating ? ec.self_rating / 20 : null,
        managerRating: ec.manager_rating ? ec.manager_rating / 20 : null,
        evidenceSummary: ec.evidence_summary || '',
        subskills: (ec.competency?.subskills || []).map((ss: any) => ({
          name: ss.name,
          rating: ss.employee_rating?.current_level ? ss.employee_rating.current_level / 20 : 'NB',
          evidence: ss.employee_rating?.evidence || ''
        }))
      });
    }

    return {
      extractedData: {
        source: {
          cvPresent: true,
          selfAssessmentPresent: true,
          managerAssessmentPresent: true,
          extractionQuality: 'HIGH'
        },
        employee: {
          name: employee.full_name,
          currentRole: employee.role_profile?.role_title || '',
          yearsAtCompany: employee.firm_experience_years || 0,
          totalYearsInBusiness: employee.total_experience_years || 0,
          targetRole: '',
          gdprConsentGiven: !!employee.gdpr_consent_given_at
        },
        cvHighlights: {
          education: employee.education ? [employee.education] : [],
          certifications: [],
          keyExperience: [],
          toolProficiency: [],
          languages: []
        }
      },
      competencyProfile: {
        role: employee.role_profile?.role_title || '',
        assessmentDate: new Date().toISOString().split('T')[0],
        clusters: Array.from(clusterMap.values())
      },
      analysis: {
        overallScore: employee.overall_score || 0,
        topStrengths: [],
        developmentAreas: [],
        promotionReadiness: {
          targetRole: '',
          readinessPercentage: employee.promotion_readiness || 0,
          criticalGaps: [],
          estimatedTimeline: ''
        }
      },
      compliance: {
        gdprConsentVerified: !!employee.gdpr_consent_given_at,
        disclaimer: ''
      }
    };
  }, [employee]);

  // Apply rating changes from certificate analysis
  const applyRatingChanges = useCallback(async (result: CertificateUpdateResult) => {
    try {
      // Update overall_score
      const { error: updateError } = await supabase
        .from('employees')
        .update({ 
          overall_score: result.overallScoreChange.newScore,
          updated_at: new Date().toISOString()
        })
        .eq('id', employeeId);

      if (updateError) throw updateError;

      // Log to audit
      await supabase.rpc('log_audit_event', {
        p_action: 'certificate_upload',
        p_entity_type: 'employee',
        p_entity_id: employeeId,
        p_new_values: {
          certificate: result.documentAnalysis.title,
          issuer: result.documentAnalysis.issuer,
          changes: result.ratingChanges.map(c => ({
            competency: c.competency,
            change: c.change
          })),
          newScore: result.overallScoreChange.newScore
        }
      });

      // Save certification record
      if (employee?.organization_id) {
        const { error: certInsertError } = await supabase
          .from('certifications')
          .insert([{
            employee_id: employeeId,
            organization_id: employee.organization_id,
            document_type: result.documentAnalysis.documentType,
            title: result.documentAnalysis.title,
            issuer: result.documentAnalysis.issuer,
            issue_date: result.documentAnalysis.issueDate || null,
            expiry_date: result.documentAnalysis.expiryDate || null,
            ai_analysis: JSON.parse(JSON.stringify(result)),
            affected_competencies: JSON.parse(JSON.stringify(result.ratingChanges)),
            is_processed: true,
            is_verified: false
          }]);

        // Silently handle certification save errors
      }

      toast({
        title: "Profil aktualisiert!",
        description: `${result.ratingChanges.length} Kompetenz(en) wurden angepasst.`,
      });

      // Refresh employee data
      queryClient.invalidateQueries({ queryKey: ['employee', employeeId] });
      
    } catch {
      toast({
        title: "Fehler",
        description: "Rating-Änderungen konnten nicht gespeichert werden.",
        variant: "destructive"
      });
    }
  }, [employeeId, employee?.organization_id, queryClient]);

  // Map competencies from database structure to component-friendly format
  const mappedCompetencies = useMemo<MappedCompetency[]>(() => {
    if (!employee?.competencies) return [];
    
    return employee.competencies.map((ec) => ({
      id: ec.competency?.id || ec.competency_id,
      name: ec.competency?.name || 'Unknown',
      currentLevel: capLevel(ec.current_level),
      demandedLevel: capLevel(ec.demanded_level),
      futureLevel: capLevel(ec.future_level),
      gap: Math.max(0, capLevel(ec.demanded_level) - capLevel(ec.current_level)),
      subskills: (ec.competency?.subskills || []).map((ss: any) => ({
        id: ss.id,
        name: ss.name,
        description: ss.description,
        currentLevel: ss.employee_rating?.current_level ?? null,
        evidence: ss.employee_rating?.evidence
      })),
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
      futureLevel: comp.futureLevel,
      clusterName: comp.clusterName,
    }));
  }, [mappedCompetencies]);

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

  const learningPathCount = employee.learning_paths?.length || 0;

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
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCertModal(true)}
            className="gap-2"
          >
            <FileUp className="w-4 h-4" />
            Zertifikat hochladen
          </Button>
          {onClose && (
            <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          )}
        </div>
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

      {/* Tabs */}
      <Tabs defaultValue="competencies" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="competencies" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            Kompetenzen
          </TabsTrigger>
          <TabsTrigger value="learning" className="gap-2">
            <BookOpen className="w-4 h-4" />
            Lernpfade
            {learningPathCount > 0 && (
              <span className="ml-1 rounded-full bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">
                {learningPathCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="competencies" className="mt-6 space-y-6">

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

      {/* Radar Chart Section */}
      <ScrollReveal delay={450}>
        <GlassCard className="hover-glow">
          <GlassCardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                <GlassCardTitle>Stärken & Schwächen</GlassCardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsRadarModalOpen(true)}
                className="text-muted-foreground hover:text-foreground"
              >
                <Maximize2 className="w-4 h-4 mr-1" />
                Vergrößern
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">Kompetenzübersicht auf einen Blick</p>
          </GlassCardHeader>
          <GlassCardContent>
            <SwipeableRadarChart skills={radarSkills} />
          </GlassCardContent>
        </GlassCard>
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
        
        const displayedGaps = showAllGaps ? skillGaps : skillGaps.slice(0, 4);
        const hasMore = skillGaps.length > 4;
        
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
              <GlassCardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  {displayedGaps.map((comp, index) => (
                    <EmployeeSkillGapCard
                      key={comp.id}
                      skillId={comp.id}
                      skillName={comp.name}
                      currentLevel={comp.currentLevel}
                      demandedLevel={comp.demandedLevel}
                      futureLevel={comp.futureLevel}
                      employeeId={employeeId}
                      employeeName={employee.full_name}
                      delay={index * 100}
                    />
                  ))}
                </div>
                
                {hasMore && (
                  <div className="flex justify-center pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAllGaps(!showAllGaps)}
                      className="gap-2"
                    >
                      {showAllGaps ? (
                        <>
                          <ChevronUp className="w-4 h-4" />
                          Weniger anzeigen
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4" />
                          Alle {skillGaps.length} Gaps anzeigen
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </GlassCardContent>
            </GlassCard>
          </ScrollReveal>
        );
      })()}
        </TabsContent>

        <TabsContent value="learning" className="mt-6">
          <EmployeeLearningPathsTab 
            learningPaths={employee.learning_paths} 
            employeeName={employee.full_name}
            employeeId={employeeId}
          />
        </TabsContent>
      </Tabs>

      {/* Sub-Skill Modal */}
      <SubSkillModal
        open={!!selectedCompetencyId}
        onOpenChange={(open) => !open && setSelectedCompetencyId(null)}
        competencyName={selectedCompetency?.name || null}
        subskills={selectedCompetency?.subskills || []}
        competencyLevel={selectedCompetency?.currentLevel ?? 0}
      />

      {/* Radar Chart Modal */}
      <RadarChartModal
        open={isRadarModalOpen}
        onOpenChange={setIsRadarModalOpen}
        skills={radarSkills}
        title={`Kompetenz-Radar: ${employee.full_name}`}
      />

      {/* Certificate Upload Modal */}
      {showCertModal && currentProfile && (
        <CertificateUploadModal
          open={showCertModal}
          onClose={() => setShowCertModal(false)}
          currentProfile={currentProfile}
          onUpdateConfirmed={async (result) => {
            await applyRatingChanges(result);
            setShowCertModal(false);
          }}
        />
      )}
    </div>
  );
}
