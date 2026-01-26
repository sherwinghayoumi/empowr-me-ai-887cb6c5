import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Archive, Trash2 } from "lucide-react";

interface DeleteEmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onArchive: () => void;
  onPermanentDelete: () => void;
  isLoading?: boolean;
  employeeName: string;
}

export function DeleteEmployeeDialog({
  open,
  onOpenChange,
  onArchive,
  onPermanentDelete,
  isLoading,
  employeeName,
}: DeleteEmployeeDialogProps) {
  const [confirmPermanent, setConfirmPermanent] = useState(false);

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setConfirmPermanent(false);
    }
    onOpenChange(newOpen);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {confirmPermanent ? "Endgültig löschen?" : "Mitarbeiter entfernen?"}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              {confirmPermanent ? (
                <>
                  <p>
                    <strong className="text-destructive">Achtung:</strong> Diese Aktion kann nicht
                    rückgängig gemacht werden!
                  </p>
                  <p>
                    <strong>{employeeName}</strong> und alle zugehörigen Daten werden
                    unwiderruflich gelöscht:
                  </p>
                  <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                    <li>Kompetenzbewertungen</li>
                    <li>Subskill-Ratings</li>
                    <li>Zertifikate</li>
                    <li>Lernpfade</li>
                  </ul>
                </>
              ) : (
                <p>
                  Wie möchten Sie <strong>{employeeName}</strong> entfernen?
                </p>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          {confirmPermanent ? (
            <>
              <AlertDialogCancel
                disabled={isLoading}
                onClick={() => setConfirmPermanent(false)}
              >
                Abbrechen
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={onPermanentDelete}
                disabled={isLoading}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Endgültig löschen
              </AlertDialogAction>
            </>
          ) : (
            <>
              <AlertDialogCancel disabled={isLoading}>Abbrechen</AlertDialogCancel>
              <Button
                variant="outline"
                onClick={onArchive}
                disabled={isLoading}
                className="gap-2"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                <Archive className="w-4 h-4" />
                Archivieren
              </Button>
              <Button
                variant="destructive"
                onClick={() => setConfirmPermanent(true)}
                disabled={isLoading}
                className="gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Permanent löschen
              </Button>
            </>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
