import { useCallback, useState } from "react";
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

export function useDiscardConfirmation(hasChanges: boolean, onDiscard: () => void) {
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

  const requestDiscard = useCallback(() => {
    if (hasChanges) {
      setIsConfirmationOpen(true);
      return;
    }

    onDiscard();
  }, [hasChanges, onDiscard]);

  const confirmationDialog = (
    <AlertDialog open={isConfirmationOpen} onOpenChange={setIsConfirmationOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Abandonner les modifications ?</AlertDialogTitle>
          <AlertDialogDescription>
            Voulez-vous vraiment abandonner sans enregistrer vos modifications ?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Continuer</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={onDiscard}
          >
            Abandonner
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return { requestDiscard, confirmationDialog };
}
