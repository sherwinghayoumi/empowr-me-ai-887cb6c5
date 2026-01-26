import { useState } from "react";
import { useMyCompetencies, useSubmitSelfAssessment } from "@/hooks/useEmployeeData";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Star, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelfAssessmentModalProps {
  open: boolean;
  onClose: () => void;
}

interface AssessmentEntry {
  rating: number;
  notes: string;
}

export function SelfAssessmentModal({ open, onClose }: SelfAssessmentModalProps) {
  const { data: competencies, isLoading } = useMyCompetencies();
  const submitAssessment = useSubmitSelfAssessment();
  
  const [assessments, setAssessments] = useState<Record<string, AssessmentEntry>>({});
  const [showSummary, setShowSummary] = useState(false);

  const handleRatingChange = (competencyId: string, rating: number) => {
    setAssessments(prev => ({
      ...prev,
      [competencyId]: { 
        rating, 
        notes: prev[competencyId]?.notes || '' 
      }
    }));
  };

  const handleNotesChange = (competencyId: string, notes: string) => {
    setAssessments(prev => ({
      ...prev,
      [competencyId]: { 
        rating: prev[competencyId]?.rating || 0, 
        notes 
      }
    }));
  };

  const handleSubmit = async () => {
    const data = Object.entries(assessments)
      .filter(([_, value]) => value.rating > 0)
      .map(([competencyId, { rating, notes }]) => ({
        competencyId,
        rating: rating * 20, // 1-5 zu 0-100
        notes
      }));
    
    await submitAssessment.mutateAsync(data);
    setAssessments({});
    setShowSummary(false);
    onClose();
  };

  const handleClose = () => {
    setAssessments({});
    setShowSummary(false);
    onClose();
  };

  const assessedCount = Object.values(assessments).filter(a => a.rating > 0).length;
  const totalCount = competencies?.length || 0;

  const getRatingLabel = (rating: number) => {
    switch (rating) {
      case 1: return "Grundkenntnisse";
      case 2: return "Fortgeschritten";
      case 3: return "Kompetent";
      case 4: return "Erfahren";
      case 5: return "Experte";
      default: return "Nicht bewertet";
    }
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </DialogHeader>
          <div className="space-y-4 py-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            📝 Self-Assessment
          </DialogTitle>
          <DialogDescription>
            Bewerte deine Kompetenzen ehrlich. Diese Einschätzung hilft bei der Entwicklungsplanung.
          </DialogDescription>
        </DialogHeader>

        {!showSummary ? (
          <>
            {/* Progress indicator */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground border-b pb-3">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span>{assessedCount} von {totalCount} bewertet</span>
              <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${totalCount > 0 ? (assessedCount / totalCount) * 100 : 0}%` }}
                />
              </div>
            </div>

            <ScrollArea className="flex-1 pr-4 -mr-4">
              <div className="space-y-4 py-4">
                {competencies?.map(ec => (
                  <div 
                    key={ec.id} 
                    className={cn(
                      "border rounded-lg p-4 transition-colors",
                      assessments[ec.competency_id]?.rating > 0 
                        ? "border-primary/50 bg-primary/5" 
                        : "border-border"
                    )}
                  >
                    <h4 className="font-medium text-foreground">{ec.competency?.name}</h4>
                    {ec.competency?.definition && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {ec.competency.definition}
                      </p>
                    )}
                    
                    {/* Star Rating */}
                    <div className="flex items-center gap-4 mb-3">
                      <span className="text-sm text-muted-foreground min-w-[120px]">
                        Deine Einschätzung:
                      </span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => handleRatingChange(ec.competency_id, star)}
                            className={cn(
                              "w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200",
                              "hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary/50",
                              (assessments[ec.competency_id]?.rating || 0) >= star
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary hover:bg-secondary/80"
                            )}
                          >
                            <Star 
                              className={cn(
                                "w-5 h-5",
                                (assessments[ec.competency_id]?.rating || 0) >= star && "fill-current"
                              )} 
                            />
                          </button>
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {getRatingLabel(assessments[ec.competency_id]?.rating || 0)}
                      </span>
                    </div>
                    
                    {/* Notes */}
                    <Textarea
                      placeholder="Begründung / Beispiele (optional) – z.B. Projekte, Zertifikate, Erfahrungen"
                      value={assessments[ec.competency_id]?.notes || ''}
                      onChange={(e) => handleNotesChange(ec.competency_id, e.target.value)}
                      className="min-h-[60px] resize-none"
                    />
                  </div>
                ))}
              </div>
            </ScrollArea>

            <DialogFooter className="border-t pt-4 gap-2">
              <Button variant="outline" onClick={handleClose}>
                Abbrechen
              </Button>
              <Button 
                onClick={() => setShowSummary(true)}
                disabled={assessedCount === 0}
              >
                Weiter zur Zusammenfassung
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            {/* Summary View */}
            <ScrollArea className="flex-1 pr-4 -mr-4">
              <div className="space-y-4 py-4">
                <div className="bg-secondary/50 rounded-lg p-4">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    Zusammenfassung
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Du hast {assessedCount} von {totalCount} Kompetenzen bewertet.
                  </p>
                </div>

                {Object.entries(assessments)
                  .filter(([_, value]) => value.rating > 0)
                  .map(([competencyId, { rating, notes }]) => {
                    const competency = competencies?.find(c => c.competency_id === competencyId);
                    return (
                      <div key={competencyId} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">
                            {competency?.competency?.name}
                          </span>
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map(star => (
                              <Star 
                                key={star}
                                className={cn(
                                  "w-4 h-4",
                                  rating >= star 
                                    ? "text-primary fill-primary" 
                                    : "text-muted-foreground/30"
                                )}
                              />
                            ))}
                          </div>
                        </div>
                        {notes && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {notes}
                          </p>
                        )}
                      </div>
                    );
                  })}

                {/* GDPR Notice */}
                <div className="bg-muted/50 rounded-lg p-4 flex gap-3">
                  <AlertCircle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium text-foreground mb-1">Datenschutzhinweis</p>
                    <p>
                      Deine Selbsteinschätzung wird gespeichert und kann von deinem Vorgesetzten 
                      eingesehen werden. Die Daten werden gemäß DSGVO verarbeitet und dienen 
                      ausschließlich der Personalentwicklung.
                    </p>
                  </div>
                </div>
              </div>
            </ScrollArea>

            <DialogFooter className="border-t pt-4 gap-2">
              <Button variant="outline" onClick={() => setShowSummary(false)}>
                Zurück
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={submitAssessment.isPending}
              >
                {submitAssessment.isPending ? 'Speichern...' : 'Assessment absenden'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
