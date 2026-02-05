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

interface DeleteTeamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamName: string;
  memberCount: number;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function DeleteTeamDialog({
  open,
  onOpenChange,
  teamName,
  memberCount,
  onConfirm,
  isLoading
}: DeleteTeamDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Team löschen?</AlertDialogTitle>
          <AlertDialogDescription>
            Möchten Sie das Team <strong>"{teamName}"</strong> wirklich löschen?
            {memberCount > 0 && (
              <span className="block mt-2 text-amber-600 dark:text-amber-400">
                Achtung: {memberCount} Mitarbeiter werden aus diesem Team entfernt.
              </span>
            )}
            <span className="block mt-2">
              Diese Aktion kann nicht rückgängig gemacht werden.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Abbrechen</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? "Löschen..." : "Team löschen"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
