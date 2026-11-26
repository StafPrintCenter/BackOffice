import { Link } from "@tanstack/react-router";
import { GraduationCap, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TRAINING_INSTRUCTOR_ROLE_LABELS } from "@/data/trainingInstructors";
import type { APIAdminInstructor, APIAdminInstructorTrainingAssignment } from "@/data/instructors";

interface TrainingAssignmentsProps {
  instructor: APIAdminInstructor;
  isEligibleForAssignment: boolean;
  onAssign: () => void;
  onRemove: (assignment: APIAdminInstructorTrainingAssignment) => void;
}

function formatDate(date: string) {
  return new Date(date).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" });
}

export function TrainingAssignments({
  instructor,
  isEligibleForAssignment,
  onAssign,
  onRemove,
}: TrainingAssignmentsProps) {
  return (
    <div className="rounded-2xl border bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold">
          <GraduationCap className="h-4 w-4 text-primary" /> Formations assignées
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onAssign}
          disabled={!isEligibleForAssignment}
          title={
            !isEligibleForAssignment
              ? "Ce formateur n'est pas éligible à une assignation pour le moment"
              : undefined
          }
        >
          <Plus className="mr-1 h-3.5 w-3.5" /> Assigner
        </Button>
      </div>

      {!isEligibleForAssignment && (
        <p className="mb-3 text-xs text-muted-foreground">
          Ce formateur doit être actif, non bloqué, et avoir accepté son invitation / vu son inscription
          approuvée avant de pouvoir être assigné à une formation.
        </p>
      )}

      {instructor.trainings.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aucune formation assignée pour le moment.</p>
      ) : (
        <div className="space-y-2">
          {instructor.trainings.map((training) => (
            <div
              key={training.assignmentId}
              className="flex items-center justify-between gap-3 rounded-lg border p-3 text-sm"
            >
              <div className="min-w-0 flex-1">
                <Link
                  to="/trainings/catalogs/$id"
                  params={{ id: training.trainingId }}
                  className="truncate font-medium text-primary hover:underline"
                >
                  {training.trainingTitle}
                </Link>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium">
                    {TRAINING_INSTRUCTOR_ROLE_LABELS[training.role]}
                  </span>
                  <span>Assigné le {formatDate(training.assignedAt)}</span>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="shrink-0 text-destructive hover:bg-destructive/10"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onRemove(training);
                }}
                aria-label={`Retirer ${training.trainingTitle}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
