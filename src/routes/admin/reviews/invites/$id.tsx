import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Ban, Copy, Send } from "lucide-react";
import { AdminShell } from "@/components/site";
import { Button } from "@/components/ui/button";
import { useAdminReviewInvitationDetail, useRevokeAdminReviewInvitation } from "@/stores/useReviewInvitationsStore";
import { REVIEW_INVITATION_STATUS_BADGES, REVIEW_INVITATION_STATUS_LABELS } from "@/data/reviewInvitations";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/admin/reviews/invites/$id")({
  head: () => ({
    meta: [{ title: `Invitation | ${SITE.name}` }, { name: "robots", content: "noindex" }],
  }),
  component: InvitationDetail,
});

function InvitationDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { item: invitation, isLoading } = useAdminReviewInvitationDetail(id);
  const revokeMutation = useRevokeAdminReviewInvitation();

  if (isLoading) {
    return (
      <AdminShell>
        <div className="flex items-center justify-center py-24 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Chargement...
        </div>
      </AdminShell>
    );
  }

  if (!invitation) {
    return (
      <AdminShell>
        <div className="mb-6">
          <Button variant="outline" size="sm" onClick={() => navigate({ to: "/admin/reviews/invites" })}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Retour
          </Button>
        </div>
        <p className="text-muted-foreground">Invitation introuvable.</p>
      </AdminShell>
    );
  }

  const canRevoke = invitation.status !== "revoked" && invitation.status !== "completed";

  const copyLink = () => {
    navigator.clipboard.writeText(invitation.link);
    toast.success("Lien copié");
  };

  const handleRevoke = () => {
    revokeMutation.mutate(invitation.id, {
      onSuccess: () => toast.success("Invitation révoquée"),
      onError: () => toast.error("Erreur lors de la révocation"),
    });
  };

  return (
    <AdminShell>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" size="sm" onClick={() => navigate({ to: "/admin/reviews/invites" })}>
          <ArrowLeft className="mr-1 h-4 w-4" /> Retour
        </Button>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={copyLink}>
            <Copy className="mr-1 h-4 w-4" /> Copier le lien
          </Button>
          {/* Renvoyer désactivé tant que l'endpoint réel n'est pas confirmé (voir note dans le store) */}
          <Button variant="outline" size="sm" disabled title="Endpoint à confirmer côté backend">
            <Send className="mr-1 h-4 w-4" /> Renvoyer
          </Button>
          {canRevoke && (
            <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10" onClick={handleRevoke} disabled={revokeMutation.isPending}>
              <Ban className="mr-1 h-4 w-4" /> Révoquer
            </Button>
          )}
        </div>
      </div>

      <div className="max-w-3xl space-y-6">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${REVIEW_INVITATION_STATUS_BADGES[invitation.status] ?? "bg-muted text-muted-foreground"}`}>
            {REVIEW_INVITATION_STATUS_LABELS[invitation.status] ?? invitation.status}
          </span>
          <span className="rounded-full bg-muted px-2 py-0.5">Créée par {invitation.createdBy}</span>
        </div>

        <div className="rounded-2xl border bg-card p-6 space-y-3">
          <h1 className="font-display text-2xl font-bold">{invitation.clientName}</h1>
          <div className="text-sm text-muted-foreground">{invitation.clientEmail}</div>
          <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>Formulaire : <b>{invitation.reviewForm}</b></div>
            <div>Projet : <b>{invitation.project ?? invitation.projectName ?? "—"}</b></div>
            <div>Réponses : <b>{invitation.responsesCount} / {invitation.maxResponses}</b></div>
            <div>Expire le : <b>{invitation.expiresAt ? new Date(invitation.expiresAt).toLocaleString() : "—"}</b></div>
            <div>Créée le : <b>{new Date(invitation.createdAt).toLocaleString()}</b></div>
          </div>
          <div className="mt-4 rounded-lg bg-muted/50 p-3 font-mono text-xs break-all">{invitation.link}</div>
        </div>
      </div>
    </AdminShell>
  );
}