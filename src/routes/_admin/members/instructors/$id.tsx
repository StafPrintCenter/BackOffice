import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api/error";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MemberSecurityCard } from "@/components/pages/members/security/MemberSecurityCard";
import { MemberLastActivityCard } from "@/components/pages/members/MemberLastActivityCard";
import {
  InstructorAssignTrainingDialog,
  InstructorAssignmentRemovalDialog,
  InstructorActionDialogs,
  InstructorDetailHeader,
  InstructorProfileCard,
  InstructorStatusBanners,
  InstructorTrainingAssignments,
} from "@/components/pages/members/instructors/detail";
import type { TrainingInstructorRole } from "@/data/trainingInstructors";
import {
  useAdminInstructorDetail,
  useAlertAdminInstructor,
  useApproveAdminInstructor,
  useBlockAdminInstructor,
  useReactivateAdminInstructor,
  useResendAdminInstructorInvite,
  useRevokeAdminInstructorInvite,
} from "@/stores/useInstructorsStore";
import {
  useAssignAdminTrainingInstructor,
  useRemoveAdminTrainingInstructorAssignment,
} from "@/stores/useTrainingInstructorsStore";
import { useAdminTrainingsList } from "@/stores/useTrainingsStore";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/_admin/members/instructors/$id")({
  head: () => ({
    meta: [{ title: `Instructeur | ${SITE.name}` }, { name: "robots", content: "noindex" }],
  }),
  component: InstructorDetail,
});

function InstructorDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { item: instructor, isLoading } = useAdminInstructorDetail(id);
  const { items: allTrainings } = useAdminTrainingsList({ perPage: 100 });

  const approveMutation = useApproveAdminInstructor();
  const resendInviteMutation = useResendAdminInstructorInvite();
  const revokeInviteMutation = useRevokeAdminInstructorInvite();
  const alertMutation = useAlertAdminInstructor();
  const blockMutation = useBlockAdminInstructor();
  const reactivateMutation = useReactivateAdminInstructor();
  const assignMutation = useAssignAdminTrainingInstructor();
  const removeAssignmentMutation = useRemoveAdminTrainingInstructorAssignment();

  const [alertOpen, setAlertOpen] = useState(false);
  const [blockOpen, setBlockOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignmentToRemove, setAssignmentToRemove] = useState<{
    trainingId: string;
    assignmentId: string;
  } | null>(null);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Chargement du profil...
      </div>
    );
  }

  if (!instructor) {
    return (
      <>
        <div className="mb-6">
          <Button variant="outline" size="sm" onClick={() => navigate({ to: "/members/instructors" })}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Retour à la liste
          </Button>
        </div>
        <div className="rounded-2xl border bg-card p-8 text-center text-muted-foreground">
          <p>Instructeur introuvable.</p>
        </div>
      </>
    );
  }

  const assignedTrainingIds = new Set(instructor.trainings.map((training) => training.trainingId));
  const availableTrainings = allTrainings.filter((training) => !assignedTrainingIds.has(training.id));
  const isEligibleForAssignment =
    instructor.isActive &&
    !instructor.isBlocked &&
    !instructor.isPending &&
    !instructor.needsApproval;

  const handleAlert = (subject: string, message: string) => {
    alertMutation.mutate(
      { id: instructor.id, payload: { subject, message } },
      {
        onSuccess: () => {
          toast.success("Alerte envoyée avec succès");
          setAlertOpen(false);
        },
        onError: (error) => toast.error(getApiErrorMessage(error, "Erreur lors de l'envoi de l'alerte")),
      }
    );
  };

  const handleBlock = (reason: string) => {
    blockMutation.mutate(
      { id: instructor.id, payload: { reason } },
      {
        onSuccess: () => {
          toast.success("Instructeur bloqué");
          setBlockOpen(false);
        },
        onError: (error) => toast.error(getApiErrorMessage(error, "Erreur lors du blocage")),
      }
    );
  };

  const handleReactivate = () => {
    reactivateMutation.mutate(instructor.id, {
      onSuccess: () => toast.success("Instructeur réactivé"),
      onError: (error) => toast.error(getApiErrorMessage(error, "Erreur lors de la réactivation")),
    });
  };

  const handleApprove = () => {
    approveMutation.mutate(instructor.id, {
      onSuccess: () => toast.success("Inscription approuvée"),
      onError: (error) => toast.error(getApiErrorMessage(error, "Erreur lors de l'approbation")),
    });
  };

  const handleResendInvite = () => {
    resendInviteMutation.mutate(instructor.id, {
      onSuccess: () => toast.success("Invitation renvoyée"),
      onError: (error) => toast.error(getApiErrorMessage(error, "Erreur lors du renvoi de l'invitation")),
    });
  };

  const handleRevokeInvite = () => {
    revokeInviteMutation.mutate(instructor.id, {
      onSuccess: () => toast.success("Invitation révoquée"),
      onError: (error) => toast.error(getApiErrorMessage(error, "Erreur lors de la révocation")),
    });
  };

  const handleAssignTraining = (trainingId: string, role: TrainingInstructorRole) => {
    if (!trainingId) return;
    assignMutation.mutate(
      { trainingId, payload: { instructor_id: instructor.id, role } },
      {
        onSuccess: () => {
          toast.success("Formation assignée");
          setAssignOpen(false);
        },
        onError: (error) =>
          toast.error(error instanceof Error ? error.message : "Erreur lors de l'assignation"),
      }
    );
  };

  const handleRemoveAssignment = () => {
    if (!assignmentToRemove) return;
    removeAssignmentMutation.mutate(assignmentToRemove, {
      onSuccess: () => {
        toast.success("Formation retirée");
        setAssignmentToRemove(null);
      },
      onError: (error) => toast.error(getApiErrorMessage(error, "Erreur lors du retrait")),
    });
  };

  return (
    <>
      <InstructorDetailHeader
        instructor={instructor}
        isApprovePending={approveMutation.isPending}
        isResendInvitePending={resendInviteMutation.isPending}
        isRevokeInvitePending={revokeInviteMutation.isPending}
        isReactivatePending={reactivateMutation.isPending}
        onBack={() => navigate({ to: "/members/instructors" })}
        onApprove={handleApprove}
        onResendInvite={handleResendInvite}
        onRevokeInvite={handleRevokeInvite}
        onAlert={() => setAlertOpen(true)}
        onBlock={() => setBlockOpen(true)}
        onReactivate={handleReactivate}
      />

      <div className="max-w-3xl space-y-6">
        <InstructorStatusBanners instructor={instructor} />
        <InstructorProfileCard instructor={instructor} />
        <MemberSecurityCard
          security={instructor.security}
          actor="instructor"
          memberId={instructor.id}
          memberName={instructor.name}
        />
        <MemberLastActivityCard activity={instructor} />
        <InstructorTrainingAssignments
          instructor={instructor}
          isEligibleForAssignment={isEligibleForAssignment}
          onAssign={() => setAssignOpen(true)}
          onRemove={(assignment) =>
            setAssignmentToRemove({
              trainingId: assignment.trainingId,
              assignmentId: assignment.assignmentId,
            })
          }
        />
      </div>

      <InstructorAssignTrainingDialog
        open={assignOpen}
        trainings={availableTrainings}
        isPending={assignMutation.isPending}
        onOpenChange={setAssignOpen}
        onSubmit={handleAssignTraining}
      />
      <InstructorActionDialogs
        instructorName={instructor.name}
        alertOpen={alertOpen}
        blockOpen={blockOpen}
        isAlertPending={alertMutation.isPending}
        isBlockPending={blockMutation.isPending}
        onAlertOpenChange={setAlertOpen}
        onBlockOpenChange={setBlockOpen}
        onSubmitAlert={handleAlert}
        onSubmitBlock={handleBlock}
      />
      <InstructorAssignmentRemovalDialog
        open={Boolean(assignmentToRemove)}
        onOpenChange={(open) => {
          if (!open) setAssignmentToRemove(null);
        }}
        onConfirm={handleRemoveAssignment}
      />
    </>
  );
}
