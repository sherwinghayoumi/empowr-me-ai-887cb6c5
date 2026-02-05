import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  Sparkles, 
  Clock, 
  GraduationCap, 
  ExternalLink, 
  AlertTriangle,
  BookOpen,
  Building2,
  CheckCircle2,
  Search
} from "lucide-react";
import { useGenerateLearningPath, useSaveLearningPath } from "@/hooks/useGenerateLearningPath";
import { GeneratedLearningPath, LearningRecommendation, SkillGapInput } from "@/types/learningPath";

interface LearningPathGeneratorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  skillGapInput: SkillGapInput;
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} Min.`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) return `${hours} Std.`;
  return `${hours} Std. ${remainingMinutes} Min.`;
}

function getLevelColor(level: string): string {
  switch (level) {
    case 'Beginner': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    case 'Intermediate': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'Advanced': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    case 'Expert': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    default: return 'bg-secondary text-secondary-foreground';
  }
}

function ModuleUrlLink({ module }: { module: LearningRecommendation }) {
  const url = module.verifiedUrl || module.contentUrl || module.searchFallbackUrl;
  const isVerified = module.isUrlVerified;
  
  if (!url) return null;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <a 
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-1.5 text-xs mt-2 transition-colors ${
              isVerified 
                ? 'text-emerald-500 hover:text-emerald-400' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {isVerified ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Kurs öffnen</span>
                <ExternalLink className="w-3 h-3" />
              </>
            ) : (
              <>
                <Search className="w-3.5 h-3.5" />
                <span>Auf {module.provider} suchen</span>
                <ExternalLink className="w-3 h-3" />
              </>
            )}
          </a>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          {isVerified ? (
            <p className="text-xs">
              <span className="text-emerald-400 font-medium">✓ Verifizierte URL</span>
              <br />
              Dieser Link führt direkt zur offiziellen Kursseite.
            </p>
          ) : (
            <p className="text-xs">
              <span className="text-muted-foreground font-medium">Suchlink</span>
              <br />
              Die exakte Kurs-URL konnte nicht verifiziert werden. 
              Dieser Link öffnet eine Suche bei {module.provider}.
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function LearningPathGeneratorModal({ 
  open, 
  onOpenChange, 
  skillGapInput 
}: LearningPathGeneratorModalProps) {
  const [generatedPath, setGeneratedPath] = useState<GeneratedLearningPath | null>(null);
  const [selectedModules, setSelectedModules] = useState<Set<number>>(new Set());
  const [hasGenerated, setHasGenerated] = useState(false);
  
  const { generatePath, isGenerating } = useGenerateLearningPath();
  const saveLearningPath = useSaveLearningPath();

  const handleGenerate = async () => {
    try {
      const result = await generatePath({
        competencyId: skillGapInput.competencyId,
        competencyName: skillGapInput.competencyName,
        competencyDefinition: skillGapInput.competencyDefinition,
        subskills: skillGapInput.subskills,
        currentLevel: skillGapInput.currentLevel,
        targetLevel: skillGapInput.targetLevel,
        employeeRole: skillGapInput.employeeRole,
        employeeExperience: skillGapInput.employeeExperience,
      });
      
      setGeneratedPath(result);
      setSelectedModules(new Set(result.modules.map((_, i) => i)));
      setHasGenerated(true);
    } catch {
      // Error handling already done by the hook
    }
  };

  const handleToggleModule = (index: number) => {
    const newSelected = new Set(selectedModules);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedModules(newSelected);
  };

  const handleSave = async () => {
    if (!generatedPath) return;
    
    const filteredModules = generatedPath.modules.filter((_, i) => selectedModules.has(i));
    const pathToSave: GeneratedLearningPath = {
      ...generatedPath,
      modules: filteredModules,
      totalDurationMinutes: filteredModules.reduce((sum, m) => sum + m.durationMinutes, 0),
    };

    await saveLearningPath.mutateAsync({
      employeeId: skillGapInput.employeeId,
      competencyId: skillGapInput.competencyId,
      learningPath: pathToSave,
    });

    onOpenChange(false);
    resetState();
  };

  const resetState = () => {
    setGeneratedPath(null);
    setSelectedModules(new Set());
    setHasGenerated(false);
  };

  const handleClose = () => {
    onOpenChange(false);
    resetState();
  };

  const gap = skillGapInput.targetLevel - skillGapInput.currentLevel;
  
  // Count verified URLs
  const verifiedCount = generatedPath?.modules.filter(m => m.isUrlVerified).length ?? 0;
  const totalModules = generatedPath?.modules.length ?? 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl h-[85vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI Lernpfad-Generator
          </DialogTitle>
          <DialogDescription>
            Generiere einen personalisierten Lernpfad für {skillGapInput.employeeName}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="min-h-0 flex-1 pr-4">
          {/* Skill Gap Summary */}
          <div className="bg-secondary/30 rounded-lg p-4 mb-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium text-foreground">{skillGapInput.competencyName}</h3>
                {skillGapInput.competencyDefinition && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {skillGapInput.competencyDefinition}
                  </p>
                )}
              </div>
              <Badge variant="outline" className="bg-destructive/20 text-destructive border-destructive/30">
                <AlertTriangle className="w-3 h-3 mr-1" />
                -{gap}%
              </Badge>
            </div>
            <div className="flex gap-4 mt-3 text-sm">
              <span className="text-muted-foreground">
                Aktuell: <span className="text-foreground font-medium">{skillGapInput.currentLevel}%</span>
              </span>
              <span className="text-muted-foreground">
                Ziel: <span className="text-foreground font-medium">{skillGapInput.targetLevel}%</span>
              </span>
            </div>
          </div>

          {/* Generate Button or Results */}
          {!hasGenerated ? (
            <div className="flex justify-center py-8">
              <Button 
                size="lg" 
                onClick={handleGenerate}
                disabled={isGenerating}
                className="gap-2"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Generiere Lernpfad...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Lernpfad generieren
                  </>
                )}
              </Button>
            </div>
          ) : isGenerating ? (
            <div className="space-y-4 py-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : generatedPath ? (
            <div className="space-y-4">
              {/* Generated Path Header */}
              <div className="border-b border-border pb-3">
                <h3 className="font-semibold text-foreground">{generatedPath.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{generatedPath.description}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {formatDuration(generatedPath.totalDurationMinutes)}
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    {generatedPath.modules.length} Module
                  </span>
                  {verifiedCount > 0 && (
                    <span className="flex items-center gap-1 text-emerald-500">
                      <CheckCircle2 className="w-4 h-4" />
                      {verifiedCount}/{totalModules} verifiziert
                    </span>
                  )}
                </div>
              </div>

              {/* Modules List */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">
                  Module auswählen ({selectedModules.size} von {generatedPath.modules.length}):
                </p>
                
                {generatedPath.modules.map((module, index) => (
                  <div 
                    key={index}
                    className={`border rounded-lg p-4 transition-all ${
                      selectedModules.has(index) 
                        ? 'border-primary/50 bg-primary/5' 
                        : 'border-border/50 bg-secondary/20 opacity-60'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedModules.has(index)}
                        onCheckedChange={() => handleToggleModule(index)}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-foreground">{module.title}</h4>
                              {module.isUrlVerified && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="text-xs">URL verifiziert</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                <Building2 className="w-3 h-3 mr-1" />
                                {module.provider}
                              </Badge>
                              <Badge variant="outline" className={`text-xs ${getLevelColor(module.level)}`}>
                                {module.level}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDuration(module.durationMinutes)}
                            </p>
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mt-2">
                          {module.description}
                        </p>
                        
                        <p className="text-xs text-primary/80 mt-2 italic">
                          💡 {module.reason}
                        </p>

                        <ModuleUrlLink module={module} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </ScrollArea>

        <DialogFooter className="mt-4 pt-4 border-t border-border">
          <Button variant="outline" onClick={handleClose}>
            Abbrechen
          </Button>
          {hasGenerated && generatedPath && (
            <Button 
              onClick={handleSave}
              disabled={selectedModules.size === 0 || saveLearningPath.isPending}
              className="gap-2"
            >
              {saveLearningPath.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Speichern...
                </>
              ) : (
                <>
                  <GraduationCap className="w-4 h-4" />
                  Lernpfad speichern ({selectedModules.size} Module)
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
