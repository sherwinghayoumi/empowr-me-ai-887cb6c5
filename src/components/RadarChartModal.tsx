import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { SwipeableRadarChart } from "./SwipeableRadarChart";
import { Target } from "lucide-react";

interface SkillData {
  skillId: string;
  skillName?: string;
  currentLevel: number;
  demandedLevel: number;
  futureLevel?: number;
  clusterName?: string;
}

interface RadarChartModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  skills: SkillData[];
  title?: string;
}

export function RadarChartModal({
  open,
  onOpenChange,
  skills,
  title = "Kompetenz-Radar",
}: RadarChartModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            {title}
          </DialogTitle>
          <DialogDescription>
            Detaillierte Übersicht aller Kompetenzen im Vergleich zu den Anforderungen
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {/* Large Radar Chart */}
          <SwipeableRadarChart 
            skills={skills} 
            className="h-[500px]"
            showDemanded={true}
          />
          
          {/* Legend */}
          <div className="mt-6 flex flex-wrap gap-4 justify-center text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-foreground">Aktuelles Level</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[hsl(var(--skill-moderate))]" style={{ opacity: 0.7 }} />
              <span className="text-foreground">Gefordertes Level</span>
            </div>
          </div>
          
          {/* Skills Table */}
          <div className="mt-6 border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-secondary/50">
                  <th className="text-left p-3 font-medium text-foreground">Kompetenz</th>
                  <th className="text-center p-3 font-medium text-foreground">Aktuell</th>
                  <th className="text-center p-3 font-medium text-foreground">Gefordert</th>
                  <th className="text-center p-3 font-medium text-foreground">Differenz</th>
                </tr>
              </thead>
              <tbody>
                {skills.map((skill) => {
                  const diff = skill.currentLevel - skill.demandedLevel;
                  return (
                    <tr key={skill.skillId} className="border-t border-border/50 hover:bg-secondary/20">
                      <td className="p-3 text-foreground">{skill.skillName || skill.skillId}</td>
                      <td className="p-3 text-center font-medium text-foreground">{skill.currentLevel}%</td>
                      <td className="p-3 text-center text-muted-foreground">{skill.demandedLevel}%</td>
                      <td className={`p-3 text-center font-medium ${diff >= 0 ? 'text-[hsl(var(--skill-very-strong))]' : 'text-destructive'}`}>
                        {diff >= 0 ? '+' : ''}{diff}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
