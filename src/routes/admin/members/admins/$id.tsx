import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Loader2, AlertTriangle, Ban, ShieldCheck, Mail, CalendarArrowUp, CalendarArrowDown, Shield, UserCheck, Info, CalendarPlus, Send, XCircle, MailWarning, } from "lucide-react";
import { AdminShell } from "@/components/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, } from "@/components/ui/dialog";
import { useAdminAdminDetail, useAlertAdminAdmin, useBlockAdminAdmin, useReactivateAdminAdmin, useRevokeAdminAdminInvite, useResendAdminAdminInvite, } from "@/stores/useAdminsStore";
import { useCurrentAdmin } from "@/stores/useAuthStore";
import { ADMIN_LEVEL_BADGES, ADMIN_LEVEL_LABELS } from "@/data/admins";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/admin/members/admins/$id")({
  head: () => ({
    meta: [{ title: `Administrateur | ${SITE.name}` }, { name: "robots", content: "noindex" }],
  }),
  component: AdminDetail,
});

function getInitials(name: string): string {
  if (!name) return "A";
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function AdminDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

  // Données de l'administrateur consulté
  const { item: admin, isLoading } = useAdminAdminDetail(id);
  // Administrateur actuellement connecté
  const { admin: currentAdmin } = useCurrentAdmin();

  // Mutations
  const alertMutation = useAlertAdminAdmin();
  const blockMutation = useBlockAdminAdmin();
  const reactivateMutation = useReactivateAdminAdmin();

  // États des modales
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

  if (!admin) {
    return (
      <AdminShell>
        <div className="mb-6">
          <Button variant="outline" size="sm" onClick={() => navigate({ to: "/admin/members/admins" })}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Retour à la liste
          </Button>
        </div>
        <div className="rounded-2xl border bg-card p-8 text-center text-muted-foreground">
          <p>Administrateur introuvable.</p>
        </div>
      </AdminShell>
    );
  }

  const isSelf = currentAdmin?.id === admin.id;

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
      { id: admin.id, subject: alertForm.subject, message: alertForm.message },
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
      { id: admin.id, reason: blockReason },
      {
        onSuccess: () => {
          toast.success("Administrateur bloqué");
          setBlockOpen(false);
          setBlockReason("");
        },
        onError: () => toast.error("Erreur lors du blocage"),
      }
    );
  };

  const handleReactivate = () => {
    reactivateMutation.mutate(admin.id, {
      onSuccess: () => toast.success("Administrateur réactivé"),
      onError: () => toast.error("Erreur lors de la réactivation"),
    });
  };

  return (
    <AdminShell>
      {/* Top Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" size="sm" onClick={() => navigate({ to: "/admin/members/admins" })}>
          <ArrowLeft className="mr-1 h-4 w-4" /> Retour
        </Button>

        {!isSelf && (
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => setAlertOpen(true)}>
              <AlertTriangle className="mr-1.5 h-4 w-4 text-amber-500" /> Avertir l'administrateur
            </Button>
            {admin.isBlocked ? (
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
        )}
      </div>

      <div className="max-w-3xl space-y-6">
        {/* Message d'avertissement compte personnel */}
        {isSelf && (
          <div className="flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-amber-700 dark:text-amber-400">
            <Info className="h-5 w-5 shrink-0" />
            <p className="text-sm">
              C'est votre propre compte : vous ne pouvez pas vous alerter ni vous bloquer vous-même.
            </p>
          </div>
        )}

        {/* Banner de blocage si actif */}
        {admin.isBlocked && (
          <div className="flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-destructive">
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold">Ce compte administrateur est actuellement bloqué.</p>
              <p className="mt-0.5 text-xs text-destructive/80">
                Bloqué le {admin.blockedAt ? new Date(admin.blockedAt).toLocaleString("fr-FR") : "—"}.
                {admin.blockedReason && ` Motif : "${admin.blockedReason}"`}
              </p>
            </div>
          </div>
        )}

        {/* Profil Header & Body Card */}
        <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
          {/* Header Visuel */}
          <div className="border-b bg-muted/40 p-6 sm:p-8">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary font-display text-xl font-bold">
                  {getInitials(admin.fullname)}
                </div>
                <div>
                  <h1 className="font-display text-2xl font-bold tracking-tight">{admin.fullname}</h1>
                  <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-3.5 w-3.5" />
                    <span>{admin.email}</span>
                  </div>
                </div>
              </div>

              {/* Badges rôle & statut */}
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${ADMIN_LEVEL_BADGES[admin.level] ?? "bg-muted text-muted-foreground border-border"
                    }`}
                >
                  {ADMIN_LEVEL_LABELS[admin.level] ?? admin.level}
                </span>

                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${admin.isPending
                    ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                    : admin.isBlocked
                      ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                      : admin.isActive
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                        : "bg-muted text-muted-foreground border-border"
                    }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${admin.isPending
                      ? "bg-amber-500"
                      : admin.isBlocked
                        ? "bg-rose-500"
                        : admin.isActive
                          ? "bg-emerald-500"
                          : "bg-muted-foreground"
                      }`}
                  />
                  {admin.isPending ? "Invitation en attente" : admin.isBlocked ? "Bloqué" : admin.isActive ? "Actif" : "Inactif"}
                </span>
              </div>
            </div>
          </div>

          {/* Grille d'informations */}
          <div className="p-6 sm:p-8 space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-xl border p-4 bg-background/50">
                <Shield className="h-5 w-5 text-muted-foreground shrink-0" />
                <div>
                  <div className="text-xs text-muted-foreground font-medium">Niveau de privilège</div>
                  <div className="text-sm font-semibold mt-0.5">
                    {ADMIN_LEVEL_LABELS[admin.level] ?? admin.level}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl border p-4 bg-background/50">
                <UserCheck className="h-5 w-5 text-muted-foreground shrink-0" />
                <div>
                  <div className="text-xs text-muted-foreground font-medium">Invité par</div>
                  <div className="text-sm font-semibold mt-0.5">{admin.invitedBy || "—"}</div>
                </div>
              </div>

              {admin.invitedAt && (
                <div className="flex items-center gap-3 rounded-xl border p-4 bg-background/50">
                  <CalendarArrowUp className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div>
                    <div className="text-xs text-muted-foreground font-medium">Invité le</div>
                    <div className="text-sm font-semibold mt-0.5">
                      {new Date(admin.invitedAt).toLocaleDateString("fr-FR")} à{" "}
                      {new Date(admin.invitedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
              )}

              {admin.acceptedAt && (
                <div className="flex items-center gap-3 rounded-xl border p-4 bg-background/50">
                  <CalendarArrowDown className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div>
                    <div className="text-xs text-muted-foreground font-medium">Invitation acceptée le</div>
                    <div className="text-sm font-semibold mt-0.5">
                      {new Date(admin.acceptedAt).toLocaleDateString("fr-FR")} à{" "}
                      {new Date(admin.acceptedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 rounded-xl border p-4 bg-background/50 sm:col-span-2">
                <CalendarPlus className="h-5 w-5 text-muted-foreground shrink-0" />
                <div>
                  <div className="text-xs text-muted-foreground font-medium">Ajouté le</div>
                  <div className="text-sm font-semibold mt-0.5">
                    {new Date(admin.createdAt).toLocaleDateString("fr-FR")} à{" "}
                    {new Date(admin.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </div>
            </div>

            {/* Bio Section */}
            {admin.bio && (
              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <Info className="h-3.5 w-3.5" /> Biographie
                </div>
                <p className="rounded-xl border bg-background p-4 text-sm leading-relaxed text-foreground/90">
                  {admin.bio}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modales d'action */}
      {!isSelf && (
        <>
          {/* Dialog Alerte */}
          <Dialog open={alertOpen} onOpenChange={setAlertOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Avertir l'administrateur</DialogTitle>
                <DialogDescription>
                  Envoie une notification d'avertissement directement à l'administrateur.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div>
                  <Label>Sujet de l'avertissement</Label>
                  <Input
                    placeholder="Ex: Respect des consignes de sécurité"
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
                <Button variant="outline" onClick={() => setAlertOpen(false)}>
                  Annuler
                </Button>
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
                <DialogTitle className="text-destructive">Bloquer {admin.fullname}</DialogTitle>
                <DialogDescription>
                  Cette action restreindra immédiatement les accès d'administration de ce compte.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div>
                  <Label>Motif explicite du blocage</Label>
                  <Textarea
                    rows={3}
                    placeholder="Renseignez le motif qui justifie la suspension de cet administrateur..."
                    value={blockReason}
                    onChange={(e) => setBlockReason(e.target.value)}
                  />
                  {blockError && <p className="mt-1 text-xs text-destructive">{blockError}</p>}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setBlockOpen(false)}>
                  Annuler
                </Button>
                <Button variant="destructive" onClick={submitBlock} disabled={blockMutation.isPending}>
                  {blockMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Confirmer le blocage
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </AdminShell>
  );
}