import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Trash2, Ban, RotateCcw, Loader2 } from "lucide-react";
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

export const Route = createFileRoute("/admin/newsletter/subscribers/$id")({
  head: () => ({
    meta: [
      { title: `Abonné | ${SITE.name}` },
      { name: "robots", content: "noindex" }]
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

  const openBlockDialog = () => { setReason(""); setReasonError(""); setBlockDialogOpen(true); };

  const submitBlock = () => {
    if (reason.trim().length < 2) {
      setReasonError("La raison est obligatoire.");
      return;
    }
    blockMutation.mutate({ id: subscriber.id, payload: { reason: reason.trim() } }, {
      onSuccess: () => { toast.success("Abonné bloqué"); setBlockDialogOpen(false); },
      onError: () => toast.error("Erreur lors du blocage"),
    });
  };

  const handleReactivate = () => {
    reactivateMutation.mutate(subscriber.id, {
      onSuccess: () => toast.success("Abonné réactivé"),
      onError: () => toast.error("Erreur lors de la réactivation"),
    });
  };

  return (
    <AdminShell>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" size="sm" onClick={() => navigate({ to: "/admin/newsletter/subscribers" })}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Retour
        </Button>
        <div className="flex gap-2">
          {subscriber.isBlocked ? (
            <Button variant="outline" size="sm" onClick={handleReactivate} disabled={reactivateMutation.isPending}>
              <RotateCcw className="h-4 w-4 mr-1" /> Réactiver
            </Button>
          ) : (
            <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10" onClick={openBlockDialog}>
              <Ban className="h-4 w-4 mr-1" /> Bloquer
            </Button>
          )}
          <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => setToDelete(true)}>
            <Trash2 className="h-4 w-4 mr-1" /> Supprimer
          </Button>
        </div>
      </div>

      <div className="max-w-2xl space-y-6">
        <div className="rounded-2xl border bg-card p-6">
          <div className="flex items-center gap-2 text-xs">
            {subscriber.isBlocked ? (
              <span className="rounded-full bg-destructive/10 px-2 py-0.5 font-semibold text-destructive">Bloqué</span>
            ) : subscriber.isActive ? (
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 font-semibold text-emerald-600">Actif</span>
            ) : (
              <span className="rounded-full bg-muted px-2 py-0.5 text-muted-foreground">Désabonné</span>
            )}
          </div>
          <h1 className="mt-3 font-display text-2xl font-bold">{subscriber.firstName} {subscriber.lastName}</h1>
          <div className="mt-1 text-muted-foreground">{subscriber.email}</div>

          <div className="mt-4 flex flex-wrap gap-1">
            {subscriber.categories.length === 0
              ? <span className="text-xs text-muted-foreground">Aucune catégorie</span>
              : subscriber.categories.map((c) => <span key={c.id} className="rounded-full bg-muted px-2 py-0.5 text-xs">{c.name}</span>)}
          </div>
        </div>

        {subscriber.isBlocked && subscriber.blockedReason && (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6">
            <div className="font-semibold mb-1 text-sm text-destructive">Raison du blocage</div>
            <p className="text-sm">{subscriber.blockedReason}</p>
          </div>
        )}

        {subscriber.notes && (
          <div className="rounded-2xl border bg-card p-6">
            <div className="font-semibold mb-2 text-sm">Notes</div>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{subscriber.notes}</p>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 text-sm">
          <div className="rounded-xl border p-4">
            <div className="text-xs text-muted-foreground">Abonné le</div>
            {new Date(subscriber.subscribedAt).toLocaleDateString("fr-FR")}
          </div>
          {subscriber.unsubscribedAt && (
            <div className="rounded-xl border p-4">
              <div className="text-xs text-muted-foreground">Désabonné le</div>
              {new Date(subscriber.unsubscribedAt).toLocaleDateString("fr-FR")}
            </div>
          )}
          {subscriber.blockedAt && (
            <div className="rounded-xl border p-4">
              <div className="text-xs text-muted-foreground">Bloqué le</div>
              {new Date(subscriber.blockedAt).toLocaleDateString("fr-FR")}
            </div>
          )}
        </div>
      </div>

      <Dialog open={blockDialogOpen} onOpenChange={setBlockDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Bloquer cet abonné</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Raison du blocage</Label>
              <Textarea rows={4} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Ex : demande de désabonnement forcé, adresse invalide..." />
              {reasonError && <p className="text-xs text-destructive mt-1">{reasonError}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBlockDialogOpen(false)}>Annuler</Button>
            <Button variant="destructive" onClick={submitBlock} disabled={blockMutation.isPending}>Bloquer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDelete
        open={toDelete}
        onOpenChange={setToDelete}
        onConfirm={() => {
          removeMutation.mutate(subscriber.id, {
            onSuccess: () => { toast.success("Abonné supprimé"); navigate({ to: "/admin/newsletter/subscribers" }); },
            onError: () => toast.error("Erreur lors de la suppression"),
          });
        }}
        title={`Supprimer l'abonné "${subscriber.email}" ?`}
      />
    </AdminShell>
  );
}