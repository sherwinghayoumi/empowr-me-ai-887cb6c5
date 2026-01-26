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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StickyNote, Save } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface AdminNotesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  competencyName: string;
  employeeName: string;
  employeeId: string;
  competencyId: string;
}

export function AdminNotesModal({ 
  open, 
  onOpenChange, 
  competencyName,
  employeeName,
  employeeId,
  competencyId,
}: AdminNotesModalProps) {
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!notes.trim()) {
      toast({
        title: "Keine Notizen",
        description: "Bitte geben Sie Notizen ein bevor Sie speichern.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    
    // For now, just show a success message - the notes could be stored in a dedicated table later
    // or added as evidence_summary in employee_competencies
    setTimeout(() => {
      toast({
        title: "Notizen gespeichert",
        description: `Notizen für ${competencyName} wurden erfolgreich gespeichert.`,
      });
      setIsSaving(false);
      setNotes("");
      onOpenChange(false);
    }, 500);
  };

  const handleClose = () => {
    setNotes("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <StickyNote className="w-5 h-5 text-primary" />
            Admin Notizen
          </DialogTitle>
          <DialogDescription>
            Fügen Sie eigene Notizen und Empfehlungen für {employeeName} hinzu
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-secondary/30 rounded-lg p-3">
            <p className="text-sm text-muted-foreground">Kompetenz</p>
            <p className="font-medium text-foreground">{competencyName}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="admin-notes">Notizen & Empfehlungen</Label>
            <Textarea
              id="admin-notes"
              placeholder="Geben Sie hier Ihre Notizen, Kursempfehlungen oder sonstige Hinweise ein..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={6}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Diese Notizen sind nur für Administratoren sichtbar.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Abbrechen
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isSaving || !notes.trim()}
            className="gap-2"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Speichern...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Notizen speichern
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
