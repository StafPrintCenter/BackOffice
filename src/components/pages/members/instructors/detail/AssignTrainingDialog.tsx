import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { APIAdminTrainingListItem } from "@/data/trainings";
import type { TrainingInstructorRole } from "@/data/trainingInstructors";

interface AssignTrainingDialogProps {
  open: boolean;
  trainings: APIAdminTrainingListItem[];
  isPending: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (trainingId: string, role: TrainingInstructorRole) => void;
}

export function AssignTrainingDialog({
  open,
  trainings,
  isPending,
  onOpenChange,
  onSubmit,
}: AssignTrainingDialogProps) {
  const [trainingId, setTrainingId] = useState("");
  const [role, setRole] = useState<TrainingInstructorRole>("lead");

  useEffect(() => {
    if (open) {
      setTrainingId("");
      setRole("lead");
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Assigner une formation</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="instructor-training">Formation</Label>
            <Select value={trainingId} onValueChange={setTrainingId}>
              <SelectTrigger id="instructor-training">
                <SelectValue placeholder="Choisir une formation" />
              </SelectTrigger>
              <SelectContent>
                {trainings.map((training) => (
                  <SelectItem key={training.id} value={training.id}>{training.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="instructor-training-role">Rôle</Label>
            <Select value={role} onValueChange={(value) => setRole(value as TrainingInstructorRole)}>
              <SelectTrigger id="instructor-training-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lead">Formateur principal</SelectItem>
                <SelectItem value="assistant">Assistant</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button
            onClick={() => onSubmit(trainingId, role)}
            disabled={!trainingId || isPending}
          >
            Assigner
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
