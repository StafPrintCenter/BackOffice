import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Loader2, AlertTriangle, Ban, ShieldCheck, Mail, Calendar, Info, MailCheck, MailX, CheckCircle2, UserCheck, } from "lucide-react";
import { AdminShell } from "@/components/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { useAdminInstructorDetail, useApproveAdminInstructor, useResendAdminInstructorInvite, useRevokeAdminInstructorInvite, useAlertAdminInstructor, useBlockAdminInstructor, useReactivateAdminInstructor, } from "@/stores/useInstructorsStore";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/admin/members/instructors/$id")({
  head: () => ({
    meta: [{ title: `Instructeur | ${SITE.name}` }, { name: "robots", content: "noindex" }],
  }),
  component: InstructorDetail,
});

function getInitials(name: string): string {
  if (!name) return "I";
  return name.split(" ").map((p) => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" });
}

function InstructorDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { item: instructor, isLoading } = useAdminInstructorDetail(id);

  const approveMutation = useApproveAdminInstructor();
  const resendInviteMutation = useResendAdminInstructorInvite();
  const revokeInviteMutation = useRevokeAdminInstructorInvite();
  const alertMutation = useAlertAdminInstructor();
  const blockMutation = useBlockAdminInstructor();
  const reactivateMutation = useReactivateAdminInstructor();

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertForm, setAlertForm] = useState({ subject: "", message: "" });
  const [alertErrors, setAlertErrors] = useState<Record<string, string>>({});

  const [blockOpen, setBlockOpen] = useState(false);
  const [blockReason, setBlockReason] = useState("");
  const [blockError, setBlockError] = useState("");

  if (isLoading) {
    return (
      <AdminShell>
        <div className="flex h-64 items-center justify-center text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Chargement du profil...
        </div>
      </AdminShell>
    );
  }

  if (!instructor) {
    return (
      <AdminShell>
        <div className="mb-6">
          <Button variant="outline" size="sm" onClick={() => navigate({ to: "/admin/members/instructors" })}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Retour à la liste
          </Button>
        </div>
        <div className="rounded-2xl border bg-card p-8 text-center text-muted-foreground">
          <p>Instructeur introuvable.</p>
        </div>
      </AdminShell>
    );
  }

  const isInvited = instructor.registrationSource === "invited";

  const submitAlert = () => {
    if (!alertForm.subject.trim() || !alertForm.message.trim()) {
      setAlertErrors({
        subject: !alertForm.subject.trim() ? "Le sujet est requis" : "",
        message: !alertForm.message.trim() ? "Le message est requis" : "",
      });
      return;
    }
    setAlertErrors({});
    alertMutation.mutate(
      { id: instructor.id, payload: { subject: alertForm.subject, message: alertForm.message } },
      {
        onSuccess: () => {
          toast.success("Alerte envoyée avec succès");
          setAlertOpen(false);
          setAlertForm({ subject: "", message: "" });
        },
        onError: () => toast.error("Erreur lors de l'envoi de l'alerte"),
      }
    );
  };

  const submitBlock = () => {
    if (!blockReason.trim()) {
      setBlockError("Le motif du blocage est obligatoire");
      return;
    }
    setBlockError("");
    blockMutation.mutate(
      { id: instructor.id, payload: { reason: blockReason } },
      {
        onSuccess: () => {
          toast.success("Instructeur bloqué");
          setBlockOpen(false);
          setBlockReason("");
        },
        onError: () => toast.error("Erreur lors du blocage"),
      }
    );
  };

  const handleReactivate = () => {
    reactivateMutation.mutate(instructor.id, {
      onSuccess: () => toast.success("Instructeur réactivé"),
      onError: () => toast.error("Erreur lors de la réactivation"),
    });
  };

  const handleApprove = () => {
    approveMutation.mutate(instructor.id, {
      onSuccess: () => toast.success("Inscription approuvée"),
      onError: () => toast.error("Erreur lors de l'approbation"),
    });
  };

  const handleResendInvite = () => {
    resendInviteMutation.mutate(instructor.id, {
      onSuccess: () => toast.success("Invitation renvoyée"),
      onError: () => toast.error("Erreur lors du renvoi de l'invitation"),
    });
  };

  const handleRevokeInvite = () => {
    revokeInviteMutation.mutate(instructor.id, {
      onSuccess: () => toast.success("Invitation révoquée"),
      onError: () => toast.error("Erreur lors de la révocation"),
    });
  };

  return (
    <AdminShell>
      {/* Top Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" size="sm" onClick={() => navigate({ to: "/admin/members/instructors" })}>
          <ArrowLeft className="mr-1 h-4 w-4" /> Retour
        </Button>
        <div className="flex flex-wrap gap-2">
          {/* Invitation en attente : renvoyer / révoquer */}
          {isInvited && instructor.isPending && (
            <>
              <Button variant="outline" size="sm" onClick={handleResendInvite} disabled={resendInviteMutation.isPending}>
                {resendInviteMutation.isPending ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <MailCheck className="mr-1.5 h-4 w-4 text-primary" />}
                Renvoyer l'invitation
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-destructive/30 text-destructive hover:bg-destructive/10"
                onClick={handleRevokeInvite}
                disabled={revokeInviteMutation.isPending}
              >
                <MailX className="mr-1.5 h-4 w-4" /> Révoquer l'invitation
              </Button>
            </>
          )}

          {/* Auto-inscription en attente d'approbation */}
          {instructor.needsApproval && (
            <Button size="sm" onClick={handleApprove} disabled={approveMutation.isPending}>
              <CheckCircle2 className="mr-1.5 h-4 w-4" /> Approuver l'inscription
            </Button>
          )}

          <Button variant="outline" size="sm" onClick={() => setAlertOpen(true)}>
            <AlertTriangle className="mr-1.5 h-4 w-4 text-amber-500" /> Avertir l'instructeur
          </Button>

          {instructor.isBlocked ? (
            <Button size="sm" onClick={handleReactivate} disabled={reactivateMutation.isPending}>
              <ShieldCheck className="mr-1.5 h-4 w-4" /> Réactiver le compte
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="border-destructive/30 text-destructive hover:bg-destructive/10"
              onClick={() => setBlockOpen(true)}
            >
              <Ban className="mr-1.5 h-4 w-4" /> Bloquer l'accès
            </Button>
          )}
        </div>
      </div>

      <div className="max-w-3xl space-y-6">
        {/* Banner de blocage si actif */}
        {instructor.isBlocked && (
          <div className="flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-destructive">
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold">Ce compte instructeur est actuellement bloqué.</p>
              <p className="mt-0.5 text-xs text-destructive/80">
                Bloqué le {formatDate(instructor.blockedAt)}.
                {instructor.blockedReason && ` Motif : "${instructor.blockedReason}"`}
              </p>
            </div>
          </div>
        )}

        {/* Banner invitation en attente */}
        {isInvited && instructor.isPending && !instructor.isBlocked && (
          <div className="flex items-start gap-3 rounded-xl border border-sky-500/20 bg-sky-500/10 p-4 text-sky-700">
            <MailCheck className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold">Invitation en attente de réponse.</p>
              <p className="mt-0.5 text-xs text-sky-700/80">
                Invité le {formatDate(instructor.invitedAt)}. Il n'a pas encore accepté l'invitation.
              </p>
            </div>
          </div>
        )}

        {/* Banner auto-inscription à approuver */}
        {instructor.needsApproval && !instructor.isBlocked && (
          <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-amber-700">
            <UserCheck className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold">Cette inscription attend une approbation.</p>
              <p className="mt-0.5 text-xs text-amber-700/80">
                Cet instructeur s'est inscrit directement et doit être approuvé avant de pouvoir accéder à la plateforme.
              </p>
            </div>
          </div>
        )}

        {/* Profil Header & Body Card */}
        <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
          <div className="border-b bg-muted/40 p-6 sm:p-8">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary font-display text-xl font-bold">
                  {getInitials(instructor.name)}
                </div>
                <div>
                  <h1 className="font-display text-2xl font-bold tracking-tight">{instructor.name}</h1>
                  <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-3.5 w-3.5" />
                    <span>{instructor.email}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${instructor.isBlocked
                    ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                    : instructor.isActive
                      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                      : "bg-muted text-muted-foreground border-border"
                    }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${instructor.isBlocked ? "bg-rose-500" : instructor.isActive ? "bg-emerald-500" : "bg-muted-foreground"}`} />
                  {instructor.isBlocked ? "Bloqué" : instructor.isActive ? "Actif" : instructor.isPending ? "Invitation en attente" : "Inactif"}
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-xl border p-4 bg-background/50">
                <Mail className="h-5 w-5 text-muted-foreground shrink-0" />
                <div>
                  <div className="text-xs text-muted-foreground font-medium">Origine du compte</div>
                  <div className="text-sm font-semibold mt-0.5">
                    {instructor.registrationSource === "invited" ? "Invité par l'administration" : "Auto-inscription"}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl border p-4 bg-background/50">
                <Calendar className="h-5 w-5 text-muted-foreground shrink-0" />
                <div>
                  <div className="text-xs text-muted-foreground font-medium">Créé le</div>
                  <div className="text-sm font-semibold mt-0.5">{formatDate(instructor.createdAt)}</div>
                </div>
              </div>

              {instructor.invitedAt && (
                <div className="flex items-center gap-3 rounded-xl border p-4 bg-background/50">
                  <Calendar className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div>
                    <div className="text-xs text-muted-foreground font-medium">Invité le</div>
                    <div className="text-sm font-semibold mt-0.5">{formatDate(instructor.invitedAt)}</div>
                  </div>
                </div>
              )}

              {instructor.acceptedAt && (
                <div className="flex items-center gap-3 rounded-xl border p-4 bg-background/50">
                  <CheckCircle2 className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div>
                    <div className="text-xs text-muted-foreground font-medium">Invitation acceptée le</div>
                    <div className="text-sm font-semibold mt-0.5">{formatDate(instructor.acceptedAt)}</div>
                  </div>
                </div>
              )}

              {instructor.approvedAt && (
                <div className="flex items-center gap-3 rounded-xl border p-4 bg-background/50">
                  <UserCheck className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div>
                    <div className="text-xs text-muted-foreground font-medium">Approuvé le</div>
                    <div className="text-sm font-semibold mt-0.5">{formatDate(instructor.approvedAt)}</div>
                  </div>
                </div>
              )}
            </div>

            {instructor.bio && (
              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <Info className="h-3.5 w-3.5" /> Biographie
                </div>
                <p className="rounded-xl border bg-background p-4 text-sm leading-relaxed text-foreground/90">
                  {instructor.bio}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dialog Alerte */}
      <Dialog open={alertOpen} onOpenChange={setAlertOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Avertir l'instructeur</DialogTitle>
            <DialogDescription>
              Envoie une notification d'avertissement directement à l'instructeur.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Sujet de l'avertissement</Label>
              <Input
                placeholder="Ex: Non-respect du règlement"
                value={alertForm.subject}
                onChange={(e) => setAlertForm({ ...alertForm, subject: e.target.value })}
              />
              {alertErrors.subject && <p className="mt-1 text-xs text-destructive">{alertErrors.subject}</p>}
            </div>
            <div>
              <Label>Message</Label>
              <Textarea
                rows={4}
                placeholder="Explication détaillée..."
                value={alertForm.message}
                onChange={(e) => setAlertForm({ ...alertForm, message: e.target.value })}
              />
              {alertErrors.message && <p className="mt-1 text-xs text-destructive">{alertErrors.message}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAlertOpen(false)}>Annuler</Button>
            <Button onClick={submitAlert} disabled={alertMutation.isPending}>
              {alertMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Envoyer l'avertissement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Blocage */}
      <Dialog open={blockOpen} onOpenChange={setBlockOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive">Bloquer {instructor.name}</DialogTitle>
            <DialogDescription>
              Cette action restreindra immédiatement l'accès de l'instructeur à ses formations et espaces.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Motif explicite du blocage</Label>
              <Textarea
                rows={3}
                placeholder="Renseignez le motif qui justifie la suspension du compte..."
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
              />
              {blockError && <p className="mt-1 text-xs text-destructive">{blockError}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBlockOpen(false)}>Annuler</Button>
            <Button variant="destructive" onClick={submitBlock} disabled={blockMutation.isPending}>
              {blockMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmer le blocage
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}