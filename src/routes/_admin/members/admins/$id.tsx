import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api/error";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MemberSecurityCard } from "@/components/pages/members/security/MemberSecurityCard";
import { MemberLastActivityCard } from "@/components/pages/members/MemberLastActivityCard";
import {
  AdminActionDialogs,
  AdminDetailHeader,
  AdminProfileCard,
  AdminStatusBanners,
} from "@/components/pages/members/admins/detail";
import {
  useAdminAdminDetail,
  useAlertAdminAdmin,
  useBlockAdminAdmin,
  useReactivateAdminAdmin,
  useRevokeAdminAdminInvite,
  useResendAdminAdminInvite,
} from "@/stores/useAdminsStore";
import { useCurrentAdmin } from "@/stores/useAuthStore";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/_admin/members/admins/$id")({
  head: () => ({
    meta: [{ title: `Administrateur | ${SITE.name}` }, { name: "robots", content: "noindex" }],
  }),
  component: AdminDetail,
});

function AdminDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { item: admin, isLoading } = useAdminAdminDetail(id);
  const { admin: currentAdmin } = useCurrentAdmin();

  const alertMutation = useAlertAdminAdmin();
  const blockMutation = useBlockAdminAdmin();
  const reactivateMutation = useReactivateAdminAdmin();
  const revokeInviteMutation = useRevokeAdminAdminInvite();
  const resendInviteMutation = useResendAdminAdminInvite();

  const [alertOpen, setAlertOpen] = useState(false);
  const [blockOpen, setBlockOpen] = useState(false);
  const [revokeInviteOpen, setRevokeInviteOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Chargement du profil...
      </div>
    );
  }

  if (!admin) {
    return (
      <>
        <div className="mb-6">
          <Button variant="outline" size="sm" onClick={() => navigate({ to: "/members/admins" })}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Retour à la liste
          </Button>
        </div>
        <div className="rounded-2xl border bg-card p-8 text-center text-muted-foreground">
          <p>Administrateur introuvable.</p>
        </div>
      </>
    );
  }

  const isSelf = currentAdmin?.id === admin.id;

  const submitAlert = ({ subject, message }: { subject: string; message: string }) => {
    alertMutation.mutate(
      { id: admin.id, subject, message },
      {
        onSuccess: () => {
          toast.success("Alerte envoyée avec succès");
          setAlertOpen(false);
        },
        onError: (error) => toast.error(getApiErrorMessage(error, "Erreur lors de l'envoi de l'alerte")),
      }
    );
  };

  const submitBlock = (reason: string) => {
    blockMutation.mutate(
      { id: admin.id, reason },
      {
        onSuccess: () => {
          toast.success("Administrateur bloqué");
          setBlockOpen(false);
        },
        onError: (error) => toast.error(getApiErrorMessage(error, "Erreur lors du blocage")),
      }
    );
  };

  const handleReactivate = () => {
    reactivateMutation.mutate(admin.id, {
      onSuccess: () => toast.success("Administrateur réactivé"),
      onError: (error) => toast.error(getApiErrorMessage(error, "Erreur lors de la réactivation")),
    });
  };

  const handleResendInvite = () => {
    resendInviteMutation.mutate(admin.id, {
      onSuccess: () => toast.success("Invitation renvoyée"),
      onError: (error) => toast.error(getApiErrorMessage(error, "Erreur lors du renvoi de l'invitation")),
    });
  };

  const handleRevokeInvite = () => {
    revokeInviteMutation.mutate(admin.id, {
      onSuccess: () => {
        toast.success("Invitation révoquée");
        setRevokeInviteOpen(false);
      },
      onError: (error) => toast.error(getApiErrorMessage(error, "Erreur lors de la révocation de l'invitation")),
    });
  };

  return (
    <>
      <AdminDetailHeader
        admin={admin}
        isSelf={isSelf}
        isReactivatePending={reactivateMutation.isPending}
        isResendInvitePending={resendInviteMutation.isPending}
        onBack={() => navigate({ to: "/members/admins" })}
        onAlert={() => setAlertOpen(true)}
        onBlock={() => setBlockOpen(true)}
        onReactivate={handleReactivate}
        onRevokeInvite={() => setRevokeInviteOpen(true)}
      />

      <div className="max-w-3xl space-y-6">
        <AdminStatusBanners admin={admin} isSelf={isSelf} />
        <AdminProfileCard admin={admin} />
        <MemberSecurityCard
          security={admin.security}
          actor="admin"
          memberId={admin.id}
          memberName={admin.fullname}
        />
        <MemberLastActivityCard activity={admin} />
      </div>

      <AdminActionDialogs
        admin={admin}
        isSelf={isSelf}
        alertOpen={alertOpen}
        blockOpen={blockOpen}
        revokeInviteOpen={revokeInviteOpen}
        isAlertPending={alertMutation.isPending}
        isBlockPending={blockMutation.isPending}
        isRevokeInvitePending={revokeInviteMutation.isPending}
        onAlertOpenChange={setAlertOpen}
        onBlockOpenChange={setBlockOpen}
        onRevokeInviteOpenChange={setRevokeInviteOpen}
        onSubmitAlert={submitAlert}
        onSubmitBlock={submitBlock}
        onConfirmRevokeInvite={handleRevokeInvite}
      />
    </>
  );
}
