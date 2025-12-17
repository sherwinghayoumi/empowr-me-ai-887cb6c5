import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Certification, getCertificationsForCompetency } from "@/data/certificationsData";
import { getCompetencyById } from "@/data/competenciesData";
import { ExternalLink, Clock, GraduationCap, Monitor, Award } from "lucide-react";

interface CertificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  competencyId: string;
  employeeName: string;
  gapPercentage: number;
}

function getLevelColor(level: Certification["level"]): string {
  switch (level) {
    case "Beginner":
      return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    case "Intermediate":
      return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    case "Advanced":
      return "bg-purple-500/20 text-purple-400 border-purple-500/30";
    case "Expert":
      return "bg-amber-500/20 text-amber-400 border-amber-500/30";
  }
}

function getFormatIcon(format: Certification["format"]) {
  switch (format) {
    case "Online":
      return <Monitor className="w-3 h-3" />;
    case "In-Person":
      return <GraduationCap className="w-3 h-3" />;
    case "Hybrid":
      return <Award className="w-3 h-3" />;
  }
}

export function CertificationModal({
  open,
  onOpenChange,
  competencyId,
  employeeName,
  gapPercentage,
}: CertificationModalProps) {
  const competency = getCompetencyById(competencyId);
  const certifications = getCertificationsForCompetency(competencyId);

  if (!competency) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl text-foreground flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-primary" />
            Learning Recommendations
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Recommended certifications to close the{" "}
            <span className="text-foreground font-medium">{competency.name}</span> gap for{" "}
            <span className="text-foreground font-medium">{employeeName}</span>
            <span className="text-destructive font-medium ml-1">({gapPercentage}% gap)</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {certifications.length > 0 ? (
            certifications.map((cert, index) => (
              <div
                key={cert.id}
                className={`p-4 rounded-lg border transition-all hover:border-primary/50 ${
                  index === 0
                    ? "bg-primary/5 border-primary/30"
                    : "bg-secondary/30 border-border"
                }`}
              >
                {index === 0 && (
                  <Badge className="mb-2 bg-primary/20 text-primary border-primary/30">
                    Top Recommendation
                  </Badge>
                )}
                
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  {cert.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  by {cert.provider}
                </p>
                
                <p className="text-sm text-foreground/80 mb-4">
                  {cert.description}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="outline" className={getLevelColor(cert.level)}>
                    {cert.level}
                  </Badge>
                  <Badge variant="outline" className="bg-secondary/50">
                    <Clock className="w-3 h-3 mr-1" />
                    {cert.duration}
                  </Badge>
                  <Badge variant="outline" className="bg-secondary/50">
                    {getFormatIcon(cert.format)}
                    <span className="ml-1">{cert.format}</span>
                  </Badge>
                </div>
                
                <Button
                  variant={index === 0 ? "default" : "outline"}
                  size="sm"
                  className="w-full"
                  onClick={() => window.open(cert.url, "_blank")}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Certification Details
                </Button>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <GraduationCap className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No specific certifications found for this competency.</p>
              <p className="text-sm mt-2">
                Consider consulting with HR for personalized recommendations.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
