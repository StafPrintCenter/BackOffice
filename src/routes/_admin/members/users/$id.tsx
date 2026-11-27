import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import { MemberSecurityCard } from "@/components/pages/members/security/MemberSecurityCard";
import { MemberLastActivityCard } from "@/components/pages/members/MemberLastActivityCard";
import {
  UserActionDialogs,
  UserDetailHeader,
  UserProfileCard,
  UserStatusBanners,
} from "@/components/pages/members/users/detail";
import { Button } from "@/components/ui/button";
import { SITE } from "@/data/site";
import {
  useAdminUserDetail,
  useAlertAdminUser,
  useBlockAdminUser,
  useReactivateAdminUser,
} from "@/stores/useUsersStore";

export const Route = createFileRoute("/_admin/members/users/$id")({
  head: () => ({
    meta: [{ title: `Utilisateur | ${SITE.name}` }, { name: "robots", content: "noindex" }],
  }),
  component: UserDetail,
});

function UserDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { item: user, isLoading } = useAdminUserDetail(id);

  const alertMutation = useAlertAdminUser();
  const blockMutation = useBlockAdminUser();
  const reactivateMutation = useReactivateAdminUser();

  const [alertOpen, setAlertOpen] = useState(false);
  const [blockOpen, setBlockOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Chargement du profil...
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <div className="mb-6">
          <Button variant="outline" size="sm" onClick={() => navigate({ to: "/members/users" })}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Retour à la liste
          </Button>
        </div>
        <div className="rounded-2xl border bg-card p-8 text-center text-muted-foreground">
          <p>Utilisateur introuvable.</p>
        </div>
      </>
    );
  }

  const handleAlert = (subject: string, message: string) => {
    alertMutation.mutate(
      { id: user.id, subject, message },
      {
        onSuccess: () => {
          toast.success("Alerte envoyée avec succès");
          setAlertOpen(false);
        },
        onError: () => toast.error("Erreur lors de l'envoi de l'alerte"),
      }
    );
  };

  const handleBlock = (reason: string) => {
    blockMutation.mutate(
      { id: user.id, reason },
      {
        onSuccess: () => {
          toast.success("Utilisateur bloqué");
          setBlockOpen(false);
        },
        onError: () => toast.error("Erreur lors du blocage"),
      }
    );
  };

  const handleReactivate = () => {
    reactivateMutation.mutate(user.id, {
      onSuccess: () => toast.success("Utilisateur réactivé"),
      onError: () => toast.error("Erreur lors de la réactivation"),
    });
  };

  return (
    <>
      <UserDetailHeader
        user={user}
        isReactivatePending={reactivateMutation.isPending}
        onBack={() => navigate({ to: "/members/users" })}
        onAlert={() => setAlertOpen(true)}
        onBlock={() => setBlockOpen(true)}
        onReactivate={handleReactivate}
      />

      <div className="max-w-3xl space-y-6">
        <UserStatusBanners user={user} />
        <UserProfileCard user={user} />
        <MemberSecurityCard
          security={user.security}
          actor="user"
          memberId={user.id}
          memberName={user.fullname}
        />
        <MemberLastActivityCard activity={user} />
      </div>

      <UserActionDialogs
        userName={user.fullname}
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
