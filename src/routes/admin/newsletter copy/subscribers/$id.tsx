import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  Trash2,
  Ban,
  RotateCcw,
  Loader2,
  Mail,
  User,
  Calendar,
  ShieldAlert,
  FileText,
  Tag,
  Clock,
  UserX,
  UserCheck,
} from "lucide-react";
import { AdminShell, ConfirmDelete } from "@/components/site";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  useAdminNewsletterSubscriberDetail,
  useDeleteAdminNewsletterSubscriber,
  useBlockAdminNewsletterSubscriber,
  useReactivateAdminNewsletterSubscriber,
} from "@/stores/useNewsletterSubscribersStore";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/admin/newsletter copy/subscribers/$id")({
  head: () => ({
    meta: [
      { title: `Abonné — Admin | ${SITE.name}` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SubscriberDetail,
});

function SubscriberDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

  const { item: subscriber, isLoading } = useAdminNewsletterSubscriberDetail(id);
  const removeMutation = useDeleteAdminNewsletterSubscriber();
  const blockMutation = useBlockAdminNewsletterSubscriber();
  const reactivateMutation = useReactivateAdminNewsletterSubscriber();

  const [toDelete, setToDelete] = useState(false);
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState("");

  if (isLoading) {
    return (
      <AdminShell>
        <div className="flex items-center justify-center py-24 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2" /> Chargement...
        </div>
      </AdminShell>
    );
  }

  if (!subscriber) {
    return (
      <AdminShell>
        <div className="mb-6">
          <Button variant="outline" size="sm" onClick={() => navigate({ to: "/admin/newsletter/subscribers" })}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Retour
          </Button>
        </div>
        <p className="text-muted-foreground">Abonné introuvable.</p>
      </AdminShell>
    );
  }

  const openBlockDialog = () => {
    setReason("");
    setReasonError("");
    setBlockDialogOpen(true);
  };

  const submitBlock = () => {
    if (reason.trim().length < 2) {
      setReasonError("La raison est obligatoire.");
      return;
    }
    blockMutation.mutate(
      { id: subscriber.id, payload: { reason: reason.trim() } },
      {
        onSuccess: () => {
          toast.success("Abonné bloqué");
          setBlockDialogOpen(false);
        },
        onError: () => toast.error("Erreur lors du blocage"),
      }
    );
  };

  const handleReactivate = () => {
    reactivateMutation.mutate(subscriber.id, {
      onSuccess: () => toast.success("Abonné réactivé"),
      onError: () => toast.error("Erreur lors de la réactivation"),
    });
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "—";
    const cleaned = dateStr.includes("T") ? dateStr.replace("Z", "") : dateStr;
    return new Date(cleaned).toLocaleString("fr-FR", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const getInitials = (firstName?: string | null, lastName?: string | null, email?: string) => {
    if (firstName || lastName) {
      return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase();
    }
    return email ? email[0].toUpperCase() : "A";
  };

  const categories = subscriber.categories ?? [];

  return (
    <AdminShell>
      {/* Barre d'actions */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" size="sm" onClick={() => navigate({ to: "/admin/newsletter/subscribers" })}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Retour
        </Button>

        <div className="flex items-center gap-2">
          {subscriber.isBlocked ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleReactivate}
              disabled={reactivateMutation.isPending}
            >
              {reactivateMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <RotateCcw className="h-4 w-4 mr-1 text-emerald-600" />
              )}
              Réactiver
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={openBlockDialog}
            >
              <Ban className="h-4 w-4 mr-1" /> Bloquer
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => setToDelete(true)}
          >
            <Trash2 className="h-4 w-4 mr-1" /> Supprimer
          </Button>
        </div>
      </div>

      <div className="max-w-4xl space-y-6">
        {/* Carte Profil Abonné */}
        <div className="rounded-2xl border bg-card p-6 md:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary font-display text-xl font-bold">
                {getInitials(subscriber.firstName, subscriber.lastName, subscriber.email)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-display text-2xl font-bold text-foreground">
                    {subscriber.firstName || subscriber.lastName
                      ? `${subscriber.firstName ?? ""} ${subscriber.lastName ?? ""}`.trim()
                      : "Abonné sans nom"}
                  </h1>
                </div>
                <a
                  href={`mailto:${subscriber.email}`}
                  className="mt-0.5 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                >
                  <Mail className="h-3.5 w-3.5" />
                  {subscriber.email}
                </a>
              </div>
            </div>

            {/* Badges de statut */}
            <div>
              {subscriber.isBlocked ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-destructive/30 bg-destructive/10 px-3 py-1 text-xs font-semibold text-destructive">
                  <Ban className="h-3.5 w-3.5" /> Bloqué
                </span>
              ) : subscriber.isActive ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600">
                  <UserCheck className="h-3.5 w-3.5" /> Actif
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                  <UserX className="h-3.5 w-3.5" /> Désabonné
                </span>
              )}
            </div>
          </div>

          {/* Section Catégories d'intérêt */}
          <div className="mt-6">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              <Tag className="h-3.5 w-3.5 text-primary" /> Catégories d'intérêt
            </div>
            {categories.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">Aucune catégorie sélectionnée</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {categories.map((c) => (
                  <span
                    key={c.id}
                    className="inline-flex items-center rounded-full border bg-muted/50 px-3 py-1 text-xs font-medium text-foreground"
                  >
                    {c.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Alerte si bloqué */}
        {subscriber.isBlocked && subscriber.blockedReason && (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 space-y-2">
            <div className="flex items-center gap-2 font-display text-base font-semibold text-destructive">
              <ShieldAlert className="h-5 w-5" /> Raison du blocage
            </div>
            <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap bg-background/60 p-3.5 rounded-xl border border-destructive/20">
              {subscriber.blockedReason}
            </p>
          </div>
        )}

        {/* Section Notes internes */}
        {subscriber.notes && (
          <div className="rounded-2xl border bg-card p-6 space-y-3">
            <div className="flex items-center gap-2 font-display text-base font-semibold border-b pb-3">
              <FileText className="h-4 w-4 text-primary" /> Notes internes
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap rounded-xl bg-muted/40 p-4 border">
              {subscriber.notes}
            </p>
          </div>
        )}

        {/* Grille d'historique temporel */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border bg-card p-4 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5 text-primary" /> Abonné le
            </div>
            <div className="text-sm font-semibold text-foreground">
              {formatDate(subscriber.subscribedAt)}
            </div>
          </div>

          {subscriber.unsubscribedAt && (
            <div className="rounded-2xl border bg-card p-4 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <UserX className="h-3.5 w-3.5 text-amber-600" /> Désabonné le
              </div>
              <div className="text-sm font-semibold text-foreground">
                {formatDate(subscriber.unsubscribedAt)}
              </div>
            </div>
          )}

          {subscriber.blockedAt && (
            <div className="rounded-2xl border bg-card p-4 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Ban className="h-3.5 w-3.5 text-destructive" /> Bloqué le
              </div>
              <div className="text-sm font-semibold text-foreground">
                {formatDate(subscriber.blockedAt)}
              </div>
            </div>
          )}
        </div>

        {/* Métadonnées de création / modification */}
        <div className="rounded-2xl border bg-card p-4 text-xs text-muted-foreground flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            <span>Créé le : <b className="text-foreground">{formatDate(subscriber.createdAt)}</b></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            <span>Dernière modification : <b className="text-foreground">{formatDate(subscriber.updatedAt)}</b></span>
          </div>
        </div>
      </div>

      {/* Modal de blocage */}
      <Dialog open={blockDialogOpen} onOpenChange={setBlockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ban className="h-5 w-5 text-destructive" /> Bloquer cet abonné
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label className="text-xs">Raison du blocage *</Label>
              <Textarea
                rows={4}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ex : demande de désabonnement forcé, adresse invalide, comportement inapproprié..."
                className="mt-1 text-sm"
              />
              {reasonError && <p className="text-xs text-destructive mt-1.5 font-medium">{reasonError}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBlockDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={submitBlock} disabled={blockMutation.isPending}>
              {blockMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              Confirmer le blocage
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de confirmation de suppression */}
      <ConfirmDelete
        open={toDelete}
        onOpenChange={setToDelete}
        onConfirm={() => {
          removeMutation.mutate(subscriber.id, {
            onSuccess: () => {
              toast.success("Abonné supprimé");
              navigate({ to: "/admin/newsletter/subscribers" });
            },
            onError: () => toast.error("Erreur lors de la suppression"),
          });
        }}
        title={`Supprimer l'abonné "${subscriber.email}" ?`}
      />
    </AdminShell>
  );
}
