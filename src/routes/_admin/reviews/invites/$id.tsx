import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Ban, Copy, Check, Send, User, Clock, FileText, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminReviewInvitationDetail, useRevokeAdminReviewInvitation, useResendAdminReviewInvitation } from "@/stores/useReviewInvitationsStore";
import { REVIEW_INVITATION_STATUS_BADGES, REVIEW_INVITATION_STATUS_LABELS } from "@/data/reviewInvitations";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/_admin/reviews/invites/$id")({
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
  const resendMutation = useResendAdminReviewInvitation();

  const [copied, setCopied] = useState(false);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-muted-foreground">
        <Loader2 className="mb-2 size-6 animate-spin text-primary" />
        <p className="text-sm font-medium">Chargement...</p>
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="space-y-6">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate({ to: "/reviews/invites" })}
          >
            <ArrowLeft className="mr-1 size-4" /> Retour
          </Button>
        </div>
        <div className="rounded-2xl border bg-card p-12 text-center shadow-sm">
          <ShieldAlert className="mx-auto size-10 text-muted-foreground/60" />
          <h2 className="mt-3 text-lg font-semibold">Invitation introuvable</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            L'invitation demandée n'existe pas ou a été supprimée.
          </p>
        </div>
      </div>
    );
  }

  const canRevoke =
    invitation.status !== "revoked" && invitation.status !== "completed";
  const canResend =
    invitation.status !== "revoked" && invitation.status !== "completed";

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(invitation.link);
      setCopied(true);
      toast.success("Lien copié dans le presse-papier");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Impossible de copier le lien");
    }
  };

  const handleRevoke = () => {
    revokeMutation.mutate(invitation.id, {
      onSuccess: () => toast.success("Invitation révoquée"),
      onError: () => toast.error("Erreur lors de la révocation"),
    });
  };

  const handleResend = () => {
    resendMutation.mutate(invitation.id, {
      onSuccess: () => toast.success("Invitation renvoyée"),
      onError: () => toast.error("Erreur lors du renvoi de l'invitation"),
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate({ to: "/reviews/invites" })}
        >
          <ArrowLeft className="mr-1 size-4" /> Retour
        </Button>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={copyLink}>
            {copied ? (
              <Check className="mr-1.5 size-4 text-emerald-500" />
            ) : (
              <Copy className="mr-1.5 size-4" />
            )}
            {copied ? "Copié !" : "Copier le lien"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleResend}
            disabled={!canResend || resendMutation.isPending}
          >
            <Send className="mr-1.5 size-4" /> Renvoyer
          </Button>
          {canRevoke && (
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:bg-destructive/10"
              onClick={handleRevoke}
              disabled={revokeMutation.isPending}
            >
              <Ban className="mr-1.5 size-4" /> Révoquer
            </Button>
          )}
        </div>
      </div>

      {/* Grid Design 2 Colonnes */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Colonne Principale */}
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <span className="text-xs uppercase tracking-wider text-muted-foreground">
                  Destinataire
                </span>
                <h1 className="mt-1 break-all font-display text-2xl font-bold tracking-tight">
                  {invitation.clientName}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {invitation.clientEmail}
                </p>
              </div>

              <span
                className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${REVIEW_INVITATION_STATUS_BADGES[invitation.status] ??
                  "bg-muted text-muted-foreground"
                  }`}
              >
                {REVIEW_INVITATION_STATUS_LABELS[invitation.status] ??
                  invitation.status}
              </span>
            </div>

            {/* Zone du lien d'invitation */}
            <div className="mt-6 rounded-xl border bg-muted/40 p-4">
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Lien d'invitation unique
              </div>
              <div className="mt-2 flex items-center justify-between gap-3 rounded-lg border bg-background p-2.5">
                <span className="truncate font-mono text-xs text-muted-foreground">
                  {invitation.link}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
                  onClick={copyLink}
                  title="Copier le lien"
                >
                  {copied ? (
                    <Check className="size-4 text-emerald-500" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Fiche de détails */}
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <FileText className="size-4 text-primary" /> Détails de l'invitation
            </div>
            <dl className="mt-4 divide-y divide-border text-sm">
              <div className="flex justify-between py-3">
                <dt className="text-muted-foreground">Formulaire</dt>
                <dd className="font-medium text-foreground">
                  {invitation.reviewForm}
                </dd>
              </div>
              <div className="flex justify-between py-3">
                <dt className="text-muted-foreground">Projet associé</dt>
                <dd className="font-medium text-foreground">
                  {invitation.project ?? invitation.projectName ?? "—"}
                </dd>
              </div>
              <div className="flex justify-between py-3">
                <dt className="text-muted-foreground">Réponses enregistrées</dt>
                <dd className="font-medium text-foreground">
                  {invitation.responsesCount} / {invitation.maxResponses}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Colonne Secondaire */}
        <div className="space-y-6">
          {/* Métadonnées & Créateur */}
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <User className="size-4 text-primary" /> Origine
            </div>
            <div className="mt-4 rounded-xl border bg-muted/40 p-4">
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Créé par
              </div>
              <div className="mt-1 font-semibold text-foreground">
                {invitation.createdBy}
              </div>
            </div>
          </div>

          {/* Horodatage */}
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Clock className="size-4 text-primary" /> Horodatage
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <Clock className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <div>
                  <span className="block font-medium text-foreground">
                    Date de création
                  </span>
                  <span className="text-muted-foreground">
                    {new Date(invitation.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 border-t pt-3">
                <Clock className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <div>
                  <span className="block font-medium text-foreground">
                    Date d'expiration
                  </span>
                  <span className="text-muted-foreground">
                    {invitation.expiresAt
                      ? new Date(invitation.expiresAt).toLocaleString()
                      : "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}