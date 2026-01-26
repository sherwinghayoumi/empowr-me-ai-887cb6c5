import { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Upload, FileText, AlertTriangle, CheckCircle, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { GeneratedProfile } from "@/types/profileGeneration";
import { CertificateUpdateResult, RatingChange } from "@/types/certificateUpdate";
import { analyzeCertificate, analyzeCertificateImage } from "@/lib/certificateAnalyzer";
import { extractTextFromPdf } from "@/lib/documentParser";
import { cn } from "@/lib/utils";

interface CertificateUploadModalProps {
  open: boolean;
  onClose: () => void;
  currentProfile: GeneratedProfile;
  onUpdateConfirmed: (result: CertificateUpdateResult) => void;
}

type AnalysisState = "idle" | "analyzing" | "done";

export function CertificateUploadModal({
  open,
  onClose,
  currentProfile,
  onUpdateConfirmed,
}: CertificateUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [analysisState, setAnalysisState] = useState<AnalysisState>("idle");
  const [result, setResult] = useState<CertificateUpdateResult | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const resetState = useCallback(() => {
    setFile(null);
    setAnalysisState("idle");
    setResult(null);
  }, []);

  const handleClose = useCallback(() => {
    resetState();
    onClose();
  }, [onClose, resetState]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      validateAndSetFile(droppedFile);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  }, []);

  const validateAndSetFile = (f: File) => {
    const validTypes = ["application/pdf", "image/png", "image/jpeg", "image/jpg"];
    if (!validTypes.includes(f.type)) {
      toast({
        title: "Ungültiges Format",
        description: "Erlaubt sind: PDF, PNG, JPG",
        variant: "destructive",
      });
      return;
    }
    setFile(f);
    setResult(null);
    setAnalysisState("idle");
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setAnalysisState("analyzing");

    try {
      let analysisResult: CertificateUpdateResult;

      if (file.type === "application/pdf") {
        // PDF: Extract text and analyze
        const textContent = await extractTextFromPdf(file);
        analysisResult = await analyzeCertificate(currentProfile, textContent, file.name);
      } else {
        // Image: Convert to base64 and analyze
        const base64 = await fileToBase64(file);
        analysisResult = await analyzeCertificateImage(
          currentProfile,
          base64,
          file.type,
          file.name
        );
      }

      setResult(analysisResult);
      setAnalysisState("done");

      if (analysisResult.isRelevant) {
        toast({
          title: "Analyse abgeschlossen",
          description: `${analysisResult.ratingChanges.length} Kompetenz-Änderungen gefunden`,
        });
      }
    } catch (error) {
      console.error("Certificate analysis error:", error);
      toast({
        title: "Analysefehler",
        description: error instanceof Error ? error.message : "Unbekannter Fehler",
        variant: "destructive",
      });
      setAnalysisState("idle");
    }
  };

  const handleConfirm = () => {
    if (result) {
      onUpdateConfirmed(result);
      handleClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl flex items-center gap-2">
            📜 Zertifikat hochladen
          </DialogTitle>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Upload Dropzone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer",
              isDragOver
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50 hover:bg-secondary/30",
              file && "border-primary/50 bg-primary/5"
            )}
          >
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleFileSelect}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            
            {file ? (
              <div className="flex flex-col items-center gap-3">
                <FileText className="w-12 h-12 text-primary" />
                <div>
                  <p className="font-medium text-foreground">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    resetState();
                  }}
                >
                  Andere Datei wählen
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <Upload className="w-12 h-12 text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground">
                    Zertifikat hier ablegen oder klicken
                  </p>
                  <p className="text-sm text-muted-foreground">
                    PDF, PNG, JPG (max. 10 MB)
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Analyze Button */}
          {analysisState !== "done" && (
            <Button
              onClick={handleAnalyze}
              disabled={!file || analysisState === "analyzing"}
              className="w-full"
              size="lg"
            >
              {analysisState === "analyzing" ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analysiere...
                </>
              ) : (
                <>🔍 Analysieren</>
              )}
            </Button>
          )}

          {/* Results */}
          {result && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
              {!result.isRelevant ? (
                // Not Relevant
                <div className="bg-secondary/50 rounded-xl p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">
                    Nicht relevant für dein Profil
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {result.relevanceReason}
                  </p>
                </div>
              ) : (
                <>
                  {/* Document Info */}
                  <div className="bg-secondary/30 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {result.documentAnalysis.documentType}
                      </Badge>
                      <ConfidenceBadge confidence={result.documentAnalysis.confidence} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">
                        {result.documentAnalysis.title}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {result.documentAnalysis.issuer}
                      </p>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <span className="text-muted-foreground">
                        📅 {result.documentAnalysis.issueDate}
                      </span>
                      {result.documentAnalysis.expiryDate && (
                        <span className="text-muted-foreground">
                          ⏳ Bis {result.documentAnalysis.expiryDate}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Rating Changes */}
                  {result.ratingChanges.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-foreground flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-[hsl(var(--skill-very-strong))]" />
                        Kompetenz-Änderungen
                      </h4>
                      {result.ratingChanges.map((change, idx) => (
                        <RatingChangeCard key={idx} change={change} />
                      ))}
                    </div>
                  )}

                  {/* Overall Score Change */}
                  <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-4">
                    <p className="text-sm text-muted-foreground mb-2">Gesamtscore</p>
                    <div className="flex items-center gap-3">
                      <span className="text-3xl font-bold text-foreground">
                        {result.overallScoreChange.oldScore}%
                      </span>
                      <ArrowRight className="w-6 h-6 text-primary animate-pulse" />
                      <span className="text-3xl font-bold text-primary">
                        {result.overallScoreChange.newScore}%
                      </span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "ml-auto text-sm",
                          result.overallScoreChange.change.startsWith("+")
                            ? "bg-[hsl(var(--skill-very-strong))]/10 text-[hsl(var(--skill-very-strong))] border-[hsl(var(--skill-very-strong))]/30"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {result.overallScoreChange.change}
                      </Badge>
                    </div>
                  </div>

                  {/* Warnings */}
                  {result.warnings.length > 0 && (
                    <div className="bg-[hsl(var(--skill-moderate))]/10 border border-[hsl(var(--skill-moderate))]/30 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-[hsl(var(--skill-moderate))] mt-0.5 shrink-0" />
                        <div className="space-y-1">
                          {result.warnings.map((warning, idx) => (
                            <p key={idx} className="text-sm text-[hsl(var(--skill-moderate))]">
                              {warning}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={handleClose}>
                  Abbrechen
                </Button>
                {result.isRelevant && result.ratingChanges.length > 0 && (
                  <Button className="flex-1" onClick={handleConfirm}>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Änderungen übernehmen
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Helper Components

function ConfidenceBadge({ confidence }: { confidence: "HIGH" | "MEDIUM" | "LOW" }) {
  const styles = {
    HIGH: "bg-[hsl(var(--skill-very-strong))]/10 text-[hsl(var(--skill-very-strong))] border-[hsl(var(--skill-very-strong))]/30",
    MEDIUM: "bg-[hsl(var(--skill-moderate))]/10 text-[hsl(var(--skill-moderate))] border-[hsl(var(--skill-moderate))]/30",
    LOW: "bg-[hsl(var(--skill-weak))]/10 text-[hsl(var(--skill-weak))] border-[hsl(var(--skill-weak))]/30",
  };
  const labels = { HIGH: "Hohe Konfidenz", MEDIUM: "Mittlere Konfidenz", LOW: "Niedrige Konfidenz" };

  return (
    <Badge variant="outline" className={cn("text-xs", styles[confidence])}>
      {labels[confidence]}
    </Badge>
  );
}

function RatingChangeCard({ change }: { change: RatingChange }) {
  return (
    <div className="bg-[hsl(var(--skill-very-strong))]/5 border border-[hsl(var(--skill-very-strong))]/20 rounded-lg p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-medium text-foreground">{change.competency}</span>
        <Badge variant="outline" className="text-xs text-muted-foreground">
          {change.cluster}
        </Badge>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-lg font-semibold text-muted-foreground">
          {change.oldRating.toFixed(1)}
        </span>
        <ArrowRight className="w-4 h-4 text-[hsl(var(--skill-very-strong))]" />
        <span className="text-lg font-semibold text-[hsl(var(--skill-very-strong))]">
          {change.newRating.toFixed(1)}
        </span>
        <Badge className="bg-[hsl(var(--skill-very-strong))]/20 text-[hsl(var(--skill-very-strong))] border-0 ml-2">
          {change.change}
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground italic">"{change.justification}"</p>
    </div>
  );
}

// Utility

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix (e.g., "data:image/png;base64,")
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
