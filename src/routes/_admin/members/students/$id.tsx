import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api/error";
import { ArrowLeft, Loader2 } from "lucide-react";
import { MemberSecurityCard } from "@/components/pages/members/security/MemberSecurityCard";
import { MemberLastActivityCard } from "@/components/pages/members/MemberLastActivityCard";
import {
  StudentActionDialogs,
  StudentDetailHeader,
  StudentProfileCard,
  StudentStatusBanners,
} from "@/components/pages/members/students/detail";
import { StudentTrainingsSection } from "@/components/pages/trainings/enrollments/StudentTrainingsSection";
import { Button } from "@/components/ui/button";
import { SITE } from "@/data/site";
import {
  useAdminStudentDetail,
  useAlertAdminStudent,
  useBlockAdminStudent,
  useReactivateAdminStudent,
  useResendAdminStudentInvite,
} from "@/stores/useStudentsStore";

export const Route = createFileRoute("/_admin/members/students/$id")({
  head: () => ({
    meta: [{ title: `Apprenant | ${SITE.name}` }, { name: "robots", content: "noindex" }],
  }),
  component: StudentDetail,
});

function StudentDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { item: student, isLoading } = useAdminStudentDetail(id);

  const alertMutation = useAlertAdminStudent();
  const blockMutation = useBlockAdminStudent();
  const reactivateMutation = useReactivateAdminStudent();
  const resendInviteMutation = useResendAdminStudentInvite();

  const [alertOpen, setAlertOpen] = useState(false);
  const [blockOpen, setBlockOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Chargement du profil...
      </div>
    );
  }

  if (!student) {
    return (
      <>
        <div className="mb-6">
          <Button variant="outline" size="sm" onClick={() => navigate({ to: "/members/students" })}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Retour à la liste
          </Button>
        </div>
        <div className="rounded-2xl border bg-card p-8 text-center text-muted-foreground">
          <p>Apprenant introuvable.</p>
        </div>
      </>
    );
  }

  const handleAlert = (subject: string, message: string) => {
    alertMutation.mutate(
      { id: student.id, subject, message },
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
      { id: student.id, reason },
      {
        onSuccess: () => {
          toast.success("Apprenant bloqué");
          setBlockOpen(false);
        },
        onError: (error) => toast.error(getApiErrorMessage(error, "Erreur lors du blocage")),
      }
    );
  };

  const handleReactivate = () => {
    reactivateMutation.mutate(student.id, {
      onSuccess: () => toast.success("Apprenant réactivé"),
      onError: (error) => toast.error(getApiErrorMessage(error, "Erreur lors de la réactivation")),
    });
  };

  const handleResendInvite = () => {
    resendInviteMutation.mutate(student.id, {
      onSuccess: () => toast.success("Invitation renvoyée"),
      onError: (error) => toast.error(getApiErrorMessage(error, "Erreur lors du renvoi de l'invitation")),
    });
  };

  return (
    <>
      <StudentDetailHeader
        student={student}
        isResendInvitePending={resendInviteMutation.isPending}
        isReactivatePending={reactivateMutation.isPending}
        onBack={() => navigate({ to: "/members/students" })}
        onResendInvite={handleResendInvite}
        onAlert={() => setAlertOpen(true)}
        onBlock={() => setBlockOpen(true)}
        onReactivate={handleReactivate}
      />

      <div className="max-w-3xl space-y-6">
        <StudentStatusBanners student={student} />
        <StudentProfileCard student={student} />
        <MemberSecurityCard
          security={student.security}
          actor="student"
          memberId={student.id}
          memberName={student.fullname}
        />
        <MemberLastActivityCard activity={student} />
        <StudentTrainingsSection trainings={student.trainings ?? []} />
      </div>

      <StudentActionDialogs
        studentName={student.fullname}
        alertOpen={alertOpen}
        blockOpen={blockOpen}
        isAlertPending={alertMutation.isPending}
        isBlockPending={blockMutation.isPending}
        onAlertOpenChange={setAlertOpen}
        onBlockOpenChange={setBlockOpen}
        onSubmitAlert={handleAlert}
        onSubmitBlock={handleBlock}
      />
    </>
  );
}
