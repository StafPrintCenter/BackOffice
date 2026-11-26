import { ConfirmDelete } from "@/components/site";

interface AssignmentRemovalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function InstructorAssignmentRemovalDialog({
  open,
  onOpenChange,
  onConfirm,
}: AssignmentRemovalDialogProps) {
  return (
    <ConfirmDelete
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
      title="Retirer cette formation de l'instructeur ?"
    />
  );
}
