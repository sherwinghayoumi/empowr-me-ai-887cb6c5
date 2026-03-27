import { useMemo, useState, useCallback } from "react";
import { differenceInYears, parseISO } from "date-fns";
import { useEmployee } from "@/hooks/useOrgData";
import { useQueryClient } from "@tanstack/react-query";
import { CompetencyBar } from "./CompetencyBar";
import { SubSkillModal } from "./SubSkillModal";
import { SwipeableRadarChart } from "./SwipeableRadarChart";
import { RadarChartModal } from "./RadarChartModal";
import { EmployeeSkillGapCard } from "./EmployeeSkillGapCard";
import { CertificateUploadModal } from "./CertificateUploadModal";
import { EmployeeLearningPathsTab } from "./EmployeeLearningPathsTab";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { X, Target, GraduationCap, Briefcase, AlertTriangle, Maximize2, ChevronDown, ChevronUp, FileUp, BookOpen, BarChart3, ArrowLeft } from "lucide-react";
import { capLevel } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { GeneratedProfile } from "@/types/profileGeneration";
import { CertificateUpdateResult } from "@/types/certificateUpdate";

interface EmployeeProfileProps {
  employeeId: string;
  onClose?: () => void;
}

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
  migratedFrom: string | null;
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

  const currentProfile = useMemo<GeneratedProfile | null>(() => {
    if (!employee?.competencies) return null;
    const clusterMap = new Map<string, { clusterName: string; competencies: any[] }>();
    for (const ec of employee.competencies) {
      const clusterName = ec.competency?.cluster?.name || 'Sonstige';
      if (!clusterMap.has(clusterName)) clusterMap.set(clusterName, { clusterName, competencies: [] });
      clusterMap.get(clusterName)!.competencies.push({
        name: ec.competency?.name || 'Unknown',
        rating: (ec.current_level || 0) / 20,
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
        source: { cvPresent: true, selfAssessmentPresent: true, managerAssessmentPresent: true, extractionQuality: 'HIGH' },
        employee: { name: employee.full_name, currentRole: employee.role_profile?.role_title || '', yearsAtCompany: employee.firm_experience_years || 0, totalYearsInBusiness: employee.total_experience_years || 0, targetRole: '', gdprConsentGiven: !!employee.gdpr_consent_given_at },
        cvHighlights: { education: employee.education ? [employee.education] : [], certifications: [], keyExperience: [], toolProficiency: [], languages: [] }
      },
      competencyProfile: { role: employee.role_profile?.role_title || '', assessmentDate: new Date().toISOString().split('T')[0], clusters: Array.from(clusterMap.values()) },
      analysis: { overallScore: employee.overall_score || 0, topStrengths: [], developmentAreas: [], promotionReadiness: { targetRole: '', readinessPercentage: employee.promotion_readiness || 0, criticalGaps: [], estimatedTimeline: '' } },
      compliance: { gdprConsentVerified: !!employee.gdpr_consent_given_at, disclaimer: '' }
    };
  }, [employee]);

  const applyRatingChanges = useCallback(async (result: CertificateUpdateResult) => {
    try {
      const { error: updateError } = await supabase
        .from('employees')
        .update({ overall_score: result.overallScoreChange.newScore, updated_at: new Date().toISOString() })
        .eq('id', employeeId);
      if (updateError) throw updateError;
      await supabase.rpc('log_audit_event', {
        p_action: 'certificate_upload', p_entity_type: 'employee', p_entity_id: employeeId,
        p_new_values: { certificate: result.documentAnalysis.title, issuer: result.documentAnalysis.issuer, changes: result.ratingChanges.map(c => ({ competency: c.competency, change: c.change })), newScore: result.overallScoreChange.newScore }
      });
      if (employee?.organization_id) {
        await supabase.from('certifications').insert([{
          employee_id: employeeId, organization_id: employee.organization_id, document_type: result.documentAnalysis.documentType,
          title: result.documentAnalysis.title, issuer: result.documentAnalysis.issuer, issue_date: result.documentAnalysis.issueDate || null,
          expiry_date: result.documentAnalysis.expiryDate || null, ai_analysis: JSON.parse(JSON.stringify(result)),
          affected_competencies: JSON.parse(JSON.stringify(result.ratingChanges)), is_processed: true, is_verified: false
        }]);
      }
      toast({ title: "Profil aktualisiert!", description: `${result.ratingChanges.length} Kompetenz(en) wurden angepasst.` });
      queryClient.invalidateQueries({ queryKey: ['employee', employeeId] });
    } catch {
      toast({ title: "Fehler", description: "Rating-Änderungen konnten nicht gespeichert werden.", variant: "destructive" });
    }
  }, [employeeId, employee?.organization_id, queryClient]);

  const mappedCompetencies = useMemo<MappedCompetency[]>(() => {
    if (!employee?.competencies) return [];
    return employee.competencies.map((ec) => ({
      id: ec.competency?.id || ec.competency_id,
      name: ec.competency?.name || 'Unknown',
      currentLevel: capLevel(ec.current_level),
      demandedLevel: capLevel(ec.demanded_level),
      futureLevel: capLevel(ec.future_level),
      gap: Math.max(0, capLevel(ec.demanded_level) - capLevel(ec.current_level)),
      migratedFrom: (ec as any).migrated_from || null,
      subskills: (ec.competency?.subskills || []).map((ss: any) => ({
        id: ss.id, name: ss.name, description: ss.description,
        currentLevel: ss.employee_rating?.current_level ?? null, evidence: ss.employee_rating?.evidence
      })),
      clusterName: ec.competency?.cluster?.name || 'Sonstige'
    }));
  }, [employee?.competencies]);

  const radarSkills = useMemo(() => mappedCompetencies.map((comp) => ({
    skillId: comp.id, skillName: comp.name, currentLevel: comp.currentLevel,
    demandedLevel: comp.demandedLevel, futureLevel: comp.futureLevel, clusterName: comp.clusterName,
  })), [mappedCompetencies]);

  const selectedCompetency = useMemo(() => {
    if (!selectedCompetencyId) return null;
    return mappedCompetencies.find(c => c.id === selectedCompetencyId) || null;
  }, [selectedCompetencyId, mappedCompetencies]);

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertTriangle className="w-10 h-10 text-muted-foreground mb-3" />
        <p className="text-sm text-foreground font-medium">Mitarbeiter nicht gefunden</p>
      </div>
    );
  }

  const learningPathCount = employee.learning_paths?.length || 0;
  const age = (employee as any).birth_date ? differenceInYears(new Date(), parseISO((employee as any).birth_date)) : null;

  const skillGaps = mappedCompetencies.filter((comp) => {
    const currentGap = comp.demandedLevel - comp.currentLevel;
    const futureGap = comp.futureLevel - comp.currentLevel;
    return currentGap > 0 || futureGap > 0;
  }).sort((a, b) => {
    const aW = (a.demandedLevel - a.currentLevel) * 0.4 + (a.futureLevel - a.currentLevel) * 0.6;
    const bW = (b.demandedLevel - b.currentLevel) * 0.4 + (b.futureLevel - b.currentLevel) * 0.6;
    return bW - aW;
  });

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 animate-fade-in">
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="text-muted-foreground hover:text-primary">
            <X className="h-4 w-4" />
          </Button>
        )}
        <div className="flex-1">
          <h1 className="text-lg font-semibold">{employee.full_name}</h1>
          <p className="text-xs text-muted-foreground">
            {employee.role_profile?.role_title} · {employee.team?.name || 'Kein Team'}
            {age && ` · ${age} Jahre`}
            {employee.total_experience_years && ` · ${employee.total_experience_years}J Erfahrung`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold tabular-nums text-primary">{Math.round(employee.overall_score || 0)}%</span>
          <Button variant="outline" size="sm" onClick={() => setShowCertModal(true)} className="h-8 text-xs gap-1.5">
            <FileUp className="w-3.5 h-3.5" />Zertifikat
          </Button>
        </div>
      </div>

      {/* Info row */}
      {(employee.education || employee.career_objective) && (
        <div className="grid grid-cols-2 gap-3 animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
          {employee.education && (
            <Card className="bg-card/80 border-border/50">
              <CardContent className="p-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Ausbildung</p>
                <p className="text-xs text-foreground">{employee.education}</p>
              </CardContent>
            </Card>
          )}
          {employee.career_objective && (
            <Card className="bg-card/80 border-border/50">
              <CardContent className="p-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Karriereziel</p>
                <p className="text-xs text-foreground">{employee.career_objective}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="competencies" className="w-full">
        <TabsList className="h-8">
          <TabsTrigger value="competencies" className="text-xs h-7 gap-1.5">
            <BarChart3 className="w-3.5 h-3.5" />Kompetenzen
          </TabsTrigger>
          <TabsTrigger value="learning" className="text-xs h-7 gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />Lernpfade
            {learningPathCount > 0 && (
              <span className="ml-1 text-[10px] bg-primary/20 px-1.5 py-0.5 rounded-full tabular-nums text-primary">{learningPathCount}</span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="competencies" className="mt-4 space-y-4">
          {/* Radar + Competency Matrix side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Radar */}
            <Card className="bg-card/80 border-border/50 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <CardHeader className="py-3 px-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Kompetenz-Radar</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setIsRadarModalOpen(true)} className="h-7 text-xs text-muted-foreground hover:text-foreground">
                    <Maximize2 className="w-3.5 h-3.5 mr-1" />Vergrößern
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <SwipeableRadarChart skills={radarSkills} />
              </CardContent>
            </Card>

            {/* Competency Matrix */}
            <Card className="bg-card/80 border-border/50 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm font-medium">Kompetenz-Matrix</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/50">
                      <TableHead className="text-xs">Kompetenz</TableHead>
                      <TableHead className="text-xs text-right">Ist</TableHead>
                      <TableHead className="text-xs text-right">Soll</TableHead>
                      <TableHead className="text-xs text-right">Gap</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mappedCompetencies.map(comp => {
                      const gap = comp.demandedLevel - comp.currentLevel;
                      return (
                        <TableRow
                          key={comp.id}
                          className="border-border/30 cursor-pointer hover:bg-muted/30"
                          onClick={() => setSelectedCompetencyId(comp.id)}
                        >
                          <TableCell className="text-xs py-1.5 font-medium truncate max-w-[160px]">{comp.name}</TableCell>
                          <TableCell className="text-xs py-1.5 text-right tabular-nums">{comp.currentLevel}%</TableCell>
                          <TableCell className="text-xs py-1.5 text-right tabular-nums">{comp.demandedLevel}%</TableCell>
                          <TableCell className="text-xs py-1.5 text-right tabular-nums font-semibold">
                            {gap > 0 ? <span className="text-[hsl(var(--severity-critical))]">-{gap}</span> : gap === 0 ? '0' : <span className="text-[hsl(var(--severity-low))]">+{Math.abs(gap)}</span>}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Skill Gaps */}
          {skillGaps.length > 0 && (
            <Card className="bg-card/80 border-border/50 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-primary" />
                  Kompetenz-Gaps ({skillGaps.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid md:grid-cols-2 gap-3">
                  {(showAllGaps ? skillGaps : skillGaps.slice(0, 4)).map((comp, index) => (
                    <EmployeeSkillGapCard
                      key={comp.id}
                      skillId={comp.id}
                      skillName={comp.name}
                      currentLevel={comp.currentLevel}
                      demandedLevel={comp.demandedLevel}
                      futureLevel={comp.futureLevel}
                      employeeId={employeeId}
                      employeeName={employee.full_name}
                      delay={index * 60}
                    />
                  ))}
                </div>
                {skillGaps.length > 4 && (
                  <div className="flex justify-center">
                    <Button variant="ghost" size="sm" onClick={() => setShowAllGaps(!showAllGaps)} className="h-7 text-xs gap-1.5">
                      {showAllGaps ? <><ChevronUp className="w-3.5 h-3.5" />Weniger</> : <><ChevronDown className="w-3.5 h-3.5" />Alle {skillGaps.length} anzeigen</>}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="learning" className="mt-4">
          <EmployeeLearningPathsTab
            learningPaths={employee.learning_paths}
            employeeName={employee.full_name}
            employeeId={employeeId}
          />
        </TabsContent>
      </Tabs>

      <SubSkillModal
        open={!!selectedCompetencyId}
        onOpenChange={(open) => !open && setSelectedCompetencyId(null)}
        competencyName={selectedCompetency?.name || null}
        subskills={selectedCompetency?.subskills || []}
        competencyLevel={selectedCompetency?.currentLevel ?? 0}
      />
      <RadarChartModal open={isRadarModalOpen} onOpenChange={setIsRadarModalOpen} skills={radarSkills} title={`Kompetenz-Radar: ${employee.full_name}`} />
      {showCertModal && currentProfile && (
        <CertificateUploadModal
          open={showCertModal}
          onClose={() => setShowCertModal(false)}
          currentProfile={currentProfile}
          practiceGroup={employee.role_profile?.practice_group || undefined}
          onUpdateConfirmed={async (result) => { await applyRatingChanges(result); setShowCertModal(false); }}
        />
      )}
    </div>
  );
}
