import { useState, useCallback, useEffect } from 'react';
import { X, Upload, FileText, User, Briefcase, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { parseAllDocuments } from '@/lib/documentParser';
import { generateProfile } from '@/lib/profileGenerator';
import { GeneratedProfile, UploadedDocuments } from '@/types/profileGeneration';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ProfileGenerationModalProps {
  open: boolean;
  onClose: () => void;
  employee: {
    id: string;
    full_name: string;
    role_profile: { id: string; role_key: string } | null;
  };
  onProfileGenerated: (profile: GeneratedProfile) => void;
}

type UploadStep = 'upload' | 'processing' | 'result';
type ProcessingPhase = 'extracting' | 'analyzing' | 'generating';

const PROCESSING_MESSAGES: Record<ProcessingPhase, string> = {
  extracting: 'Extrahiere Text aus Dokumenten...',
  analyzing: 'Analysiere Kompetenzen mit KI...',
  generating: 'Erstelle Profil...',
};

export function ProfileGenerationModal({
  open,
  onClose,
  employee,
  onProfileGenerated,
}: ProfileGenerationModalProps) {
  const [step, setStep] = useState<UploadStep>('upload');
  const [processingPhase, setProcessingPhase] = useState<ProcessingPhase>('extracting');
  const [documents, setDocuments] = useState<UploadedDocuments>({
    cv: null,
    selfAssessment: null,
    managerAssessment: null,
  });
  const [generatedProfile, setGeneratedProfile] = useState<GeneratedProfile | null>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setStep('upload');
      setDocuments({ cv: null, selfAssessment: null, managerAssessment: null });
      setGeneratedProfile(null);
    }
  }, [open]);

  const handleFileUpload = useCallback((type: keyof UploadedDocuments, file: File | null) => {
    setDocuments(prev => ({ ...prev, [type]: file }));
  }, []);

  const handleDrop = useCallback((type: keyof UploadedDocuments, e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(type, file);
  }, [handleFileUpload]);

  const allFilesUploaded = documents.cv && documents.selfAssessment && documents.managerAssessment;

  const handleGenerate = async () => {
    if (!allFilesUploaded) return;

    try {
      setStep('processing');
      setProcessingPhase('extracting');

      // Parse documents
      const parsedDocs = await parseAllDocuments(documents);

      setProcessingPhase('analyzing');

      // Small delay to show phase change
      await new Promise(resolve => setTimeout(resolve, 500));

      setProcessingPhase('generating');

      // Generate profile with proper role key fallback
      const roleKey = employee.role_profile?.role_key || 'mid-level_associate_(mla)';
      
      // Query ACTUAL DB competencies for this employee's role profile
      // This ensures the AI uses EXACT DB names - no fuzzy matching needed
      let dbCompetencySchema: Array<{ clusterName: string; competencyName: string; subskills: string[] }> = [];
      if (employee.role_profile?.id) {
        const { data: dbComps } = await supabase
          .from('competencies')
          .select(`
            name,
            cluster:competency_clusters(name),
            subskills(name)
          `)
          .eq('role_profile_id', employee.role_profile.id)
          .eq('status', 'active');

        if (dbComps && dbComps.length > 0) {
          dbCompetencySchema = dbComps.map((c: any) => ({
            clusterName: c.cluster?.name || 'Uncategorized',
            competencyName: c.name,
            subskills: (c.subskills || []).map((s: any) => s.name),
          }));
          console.log(`Loaded ${dbCompetencySchema.length} competencies from DB for role profile`);
        }
      }

      const profile = await generateProfile(
        parsedDocs,
        roleKey,
        dbCompetencySchema.length > 0 ? dbCompetencySchema : undefined
      );

      // Validate profile structure
      if (!profile || !profile.analysis || typeof profile.analysis.overallScore !== 'number') {
        throw new Error('Unvollständiges Profil von der KI erhalten. Bitte versuchen Sie es erneut.');
      }

      setGeneratedProfile(profile);
      setStep('result');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Fehler bei der Profilgenerierung');
      setStep('upload');
    }
  };

  const handleSaveProfile = () => {
    if (generatedProfile) {
      onProfileGenerated(generatedProfile);
      onClose();
    }
  };

  const gdprVerified = generatedProfile?.compliance?.gdprConsentVerified ?? false;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-[900px] w-[90vw] max-h-[90vh] overflow-y-auto bg-card/95 backdrop-blur-xl border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <span>🤖</span>
            <span>KI-Profil erstellen für {employee.full_name}</span>
          </DialogTitle>
        </DialogHeader>

        {/* Upload Step */}
        {step === 'upload' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <UploadBox
                icon={<FileText className="w-8 h-8" />}
                emoji="📄"
                label="Lebenslauf (CV)"
                accept=".pdf"
                file={documents.cv}
                onFileChange={(f) => handleFileUpload('cv', f)}
                onDrop={(e) => handleDrop('cv', e)}
              />
              <UploadBox
                icon={<User className="w-8 h-8" />}
                emoji="📝"
                label="Self-Assessment"
                accept=".docx"
                file={documents.selfAssessment}
                onFileChange={(f) => handleFileUpload('selfAssessment', f)}
                onDrop={(e) => handleDrop('selfAssessment', e)}
              />
              <UploadBox
                icon={<Briefcase className="w-8 h-8" />}
                emoji="👔"
                label="Manager-Assessment"
                accept=".docx"
                file={documents.managerAssessment}
                onFileChange={(f) => handleFileUpload('managerAssessment', f)}
                onDrop={(e) => handleDrop('managerAssessment', e)}
              />
            </div>

            <div className="flex justify-end">
              <Button
                size="lg"
                disabled={!allFilesUploaded}
                onClick={handleGenerate}
                className="gap-2"
              >
                <span>🚀</span>
                Profil generieren
              </Button>
            </div>
          </div>
        )}

        {/* Processing Step */}
        {step === 'processing' && (
          <div className="flex flex-col items-center justify-center py-16 space-y-6">
            <div className="relative">
              <Loader2 className="w-16 h-16 animate-spin text-primary" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-lg font-medium animate-pulse">
                ⏳ {PROCESSING_MESSAGES[processingPhase]}
              </p>
              <p className="text-sm text-muted-foreground">
                Dies kann 15-30 Sekunden dauern
              </p>
            </div>
            <Progress value={
              processingPhase === 'extracting' ? 33 :
              processingPhase === 'analyzing' ? 66 : 90
            } className="w-64" />
          </div>
        )}

        {/* Result Step */}
        {step === 'result' && generatedProfile && (
          <div className="space-y-6">
            {/* Overall Score */}
            <div className="flex items-center justify-center">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-muted"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${(generatedProfile.analysis.overallScore / 100) * 352} 352`}
                    className="text-primary transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold">
                    {generatedProfile.analysis.overallScore}%
                  </span>
                </div>
              </div>
            </div>

            {/* GDPR Status */}
            <div className={cn(
              "p-4 rounded-lg border flex items-center gap-3",
              gdprVerified 
                ? "bg-emerald-500/10 border-emerald-500/30" 
                : "bg-destructive/10 border-destructive/30"
            )}>
              {gdprVerified ? (
                <>
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <span className="text-emerald-500 font-medium">
                    ✅ DSGVO-Einwilligung bestätigt
                  </span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  <span className="text-destructive font-medium">
                    ⚠️ DSGVO-Einwilligung fehlt! Speichern nicht möglich.
                  </span>
                </>
              )}
            </div>

            {/* Competency Overview - NEW */}
            <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <span>📊</span>
                Bewertete Kompetenzen ({generatedProfile.competencyProfile?.clusters?.reduce((acc, c) => acc + (c.competencies?.length || 0), 0) || 0})
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                {generatedProfile.competencyProfile?.clusters?.flatMap(cluster => 
                  cluster.competencies?.map(comp => (
                    <div 
                      key={`${cluster.clusterName}-${comp.name}`}
                      className="flex items-center justify-between p-2 rounded bg-background/50 text-sm"
                    >
                      <span className="truncate flex-1 mr-2" title={comp.name}>
                        {comp.name.length > 25 ? comp.name.slice(0, 25) + '...' : comp.name}
                      </span>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "shrink-0",
                          comp.rating === 'NB' 
                            ? "bg-muted text-muted-foreground" 
                            : (comp.rating as number) >= 4 
                              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                              : (comp.rating as number) >= 3
                                ? "bg-primary/20 text-primary border-primary/30"
                                : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                        )}
                      >
                        {comp.rating === 'NB' ? 'NB' : `${comp.rating}/5`}
                      </Badge>
                    </div>
                  )) || []
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Top Strengths */}
              <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <span className="text-emerald-500">💪</span>
                  Top 3 Stärken
                </h4>
                <div className="space-y-2">
                  {generatedProfile.analysis.topStrengths.slice(0, 3).map((strength, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-sm">{strength.competency}</span>
                      <Badge variant="outline" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                        {strength.rating}/5
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Development Areas */}
              <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <span className="text-amber-500">📈</span>
                  Top 3 Entwicklungsfelder
                </h4>
                <div className="space-y-2">
                  {generatedProfile.analysis.developmentAreas.slice(0, 3).map((area, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-sm">{area.competency}</span>
                      <Badge variant="outline" className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                        Gap: {area.gap}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Promotion Readiness */}
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">🎯 Beförderungsbereitschaft</span>
                <span className="text-primary font-bold">
                  {generatedProfile.analysis.promotionReadiness.readinessPercentage}%
                </span>
              </div>
              <Progress 
                value={generatedProfile.analysis.promotionReadiness.readinessPercentage} 
                className="h-2 mb-2"
              />
              <p className="text-sm text-muted-foreground">
                Bereit für: {generatedProfile.analysis.promotionReadiness.targetRole}
                {generatedProfile.analysis.promotionReadiness.estimatedTimeline && (
                  <> • Geschätzte Zeit: {generatedProfile.analysis.promotionReadiness.estimatedTimeline}</>
                )}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button variant="outline" onClick={onClose}>
                Abbrechen
              </Button>
              <Button 
                onClick={handleSaveProfile}
                disabled={!gdprVerified}
                className="gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Profil speichern
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Upload Box Component
interface UploadBoxProps {
  icon: React.ReactNode;
  emoji: string;
  label: string;
  accept: string;
  file: File | null;
  onFileChange: (file: File | null) => void;
  onDrop: (e: React.DragEvent) => void;
}

function UploadBox({ emoji, label, accept, file, onFileChange, onDrop }: UploadBoxProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDropInternal = (e: React.DragEvent) => {
    setIsDragging(false);
    onDrop(e);
  };

  return (
    <div
      className={cn(
        "relative p-6 rounded-lg border-2 border-dashed transition-all duration-200 cursor-pointer",
        "hover:border-primary/50 hover:bg-primary/5",
        isDragging && "border-primary bg-primary/10",
        file ? "border-emerald-500/50 bg-emerald-500/5" : "border-border"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDropInternal}
    >
      <input
        type="file"
        accept={accept}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={(e) => onFileChange(e.target.files?.[0] || null)}
      />
      
      <div className="flex flex-col items-center text-center space-y-3">
        <span className="text-4xl">{emoji}</span>
        <div>
          <p className="font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">
            {accept.toUpperCase().replace('.', '')} • Drag & Drop
          </p>
        </div>
        
        {file ? (
          <div className="flex items-center gap-2 text-sm text-emerald-500">
            <CheckCircle className="w-4 h-4" />
            <span className="truncate max-w-[120px]">{file.name}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onFileChange(null);
              }}
              className="p-1 hover:bg-destructive/20 rounded"
            >
              <X className="w-3 h-3 text-destructive" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Upload className="w-3 h-3" />
            <span>Klicken oder ziehen</span>
          </div>
        )}
      </div>
    </div>
  );
}
