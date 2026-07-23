import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Pencil, Trash2, Save, X, Loader2, CalendarClock, Ban, Send, Tag, User, Users, Calendar } from "lucide-react";
import { AdminShell, ConfirmDelete, RichTextEditor } from "@/components/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  useAdminNewsletterCampaignDetail,
  useUpdateAdminNewsletterCampaign,
  useDeleteAdminNewsletterCampaign,
  useScheduleAdminNewsletterCampaign,
  useCancelScheduleAdminNewsletterCampaign,
  useSendAdminNewsletterCampaign,
} from "@/stores/useNewsletterCampaignsStore";
import { useAdminCategoriesList } from "@/stores/useCategoriesStore";
import type { AdminNewsletterCampaignPayload } from "@/data/newsletterCampaigns";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/admin/newsletter/campaigns/$id")({
  head: () => ({
    meta: [
      { title: `Campagne | ${SITE.name}` },
      { name: "robots", content: "noindex" }]
  }),
  component: CampaignDetail,
});

function statusBadge(status: string) {
  const map: Record<string, string> = {
    draft: "bg-muted text-muted-foreground border-border",
    scheduled: "bg-amber-100 text-amber-700 border-amber-200",
    sent: "bg-emerald-100 text-emerald-700 border-emerald-200",
  };
  const label: Record<string, string> = { draft: "Brouillon", scheduled: "Programmée", sent: "Envoyée" };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${map[status] ?? "bg-muted text-muted-foreground"}`}>
      {label[status] ?? status}
    </span>
  );
}

function CampaignDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

  const { item: campaign, isLoading } = useAdminNewsletterCampaignDetail(id);
  const { items: categories } = useAdminCategoriesList({ perPage: 100, context: "newsletter" });
  const updateMutation = useUpdateAdminNewsletterCampaign();
  const removeMutation = useDeleteAdminNewsletterCampaign();
  const scheduleMutation = useScheduleAdminNewsletterCampaign();
  const cancelScheduleMutation = useCancelScheduleAdminNewsletterCampaign();
  const sendMutation = useSendAdminNewsletterCampaign();

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<AdminNewsletterCampaignPayload | null>(null);
  const [toDelete, setToDelete] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [scheduledAt, setScheduledAt] = useState("");

  useEffect(() => {
    if (campaign && !form) {
      setForm({
        subject: campaign.subject,
        body: campaign.body,
        category_id: categories.find((c) => c.name === campaign.category)?.id ?? "",
      });
    }
  }, [campaign, form, categories]);

  if (isLoading) {
    return (
      <AdminShell>
        <div className="flex items-center justify-center py-24 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2" /> Chargement...
        </div>
      </AdminShell>
    );
  }

  if (!campaign || !form) {
    return (
      <AdminShell>
        <div className="mb-6">
          <Button variant="outline" size="sm" onClick={() => navigate({ to: "/admin/newsletter/campaigns" })}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Retour
          </Button>
        </div>
        <p className="text-muted-foreground">Campagne introuvable.</p>
      </AdminShell>
    );
  }

  const isSent = campaign.status === "sent";
  const isScheduled = campaign.status === "scheduled";

  const handleSave = () => {
    updateMutation.mutate({ id: campaign.id, payload: form }, {
      onSuccess: () => { toast.success("Campagne modifiée"); setIsEditing(false); },
      onError: () => toast.error("Erreur lors de la modification"),
    });
  };

  const handleCancel = () => {
    setForm({
      subject: campaign.subject,
      body: campaign.body,
      category_id: categories.find((c) => c.name === campaign.category)?.id ?? "",
    });
    setIsEditing(false);
  };

  const openScheduleDialog = () => { setScheduledAt(""); setScheduleDialogOpen(true); };

  const submitSchedule = () => {
    if (!scheduledAt) return;
    scheduleMutation.mutate({ id: campaign.id, payload: { scheduled_at: new Date(scheduledAt).toISOString() } }, {
      onSuccess: () => { toast.success("Campagne programmée"); setScheduleDialogOpen(false); },
      onError: () => toast.error("Erreur lors de la programmation"),
    });
  };

  const handleCancelSchedule = () => {
    cancelScheduleMutation.mutate(campaign.id, {
      onSuccess: () => toast.success("Programmation annulée"),
      onError: () => toast.error("Erreur lors de l'annulation"),
    });
  };

  const handleSend = () => {
    sendMutation.mutate(campaign.id, {
      onSuccess: () => toast.success("Campagne envoyée"),
      onError: () => toast.error("Erreur lors de l'envoi"),
    });
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr.replace("Z", "")).toLocaleString("fr-FR", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <AdminShell>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" size="sm" onClick={() => navigate({ to: "/admin/newsletter/campaigns" })}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Retour
        </Button>
        <div className="flex flex-wrap gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" size="sm" onClick={handleCancel}>
                <X className="h-4 w-4 mr-1" /> Annuler
              </Button>
              <Button size="sm" onClick={handleSave} disabled={updateMutation.isPending}>
                <Save className="h-4 w-4 mr-1" /> Enregistrer
              </Button>
            </>
          ) : (
            <>
              {!isSent && (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  <Pencil className="h-4 w-4 mr-1" /> Modifier
                </Button>
              )}
              {!isSent && !isScheduled && (
                <Button variant="outline" size="sm" onClick={openScheduleDialog}>
                  <CalendarClock className="h-4 w-4 mr-1" /> Programmer
                </Button>
              )}
              {isScheduled && (
                <Button variant="outline" size="sm" onClick={handleCancelSchedule} disabled={cancelScheduleMutation.isPending}>
                  <Ban className="h-4 w-4 mr-1" /> Annuler la programmation
                </Button>
              )}
              {!isSent && (
                <Button size="sm" onClick={handleSend} disabled={sendMutation.isPending}>
                  <Send className="h-4 w-4 mr-1" /> Envoyer maintenant
                </Button>
              )}
              {!isSent && (
                <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => setToDelete(true)}>
                  <Trash2 className="h-4 w-4 mr-1" /> Supprimer
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      <div className="max-w-4xl space-y-6">
        {/* Metadonnées sous forme de badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {statusBadge(campaign.status)}
          {campaign.category && (
            <span className="inline-flex items-center gap-1 rounded-full border bg-primary/10 border-primary/20 px-2.5 py-0.5 font-medium text-primary">
              <Tag className="h-3 w-3" /> {campaign.category}
            </span>
          )}
          <span className="inline-flex items-center gap-1 rounded-full border bg-muted px-2.5 py-0.5 text-muted-foreground">
            <User className="h-3 w-3" /> Par {campaign.sentBy}
          </span>
          {campaign.recipientsCount !== null && (
            <span className="inline-flex items-center gap-1 rounded-full border bg-muted px-2.5 py-0.5 text-muted-foreground">
              <Users className="h-3 w-3" /> {campaign.recipientsCount} destinataires
            </span>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-4 rounded-2xl border bg-card p-6">
            <div>
              <Label>Sujet</Label>
              <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label>Catégorie</Label>
              <select
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
              >
                <option value="">— Aucune —</option>
                {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
              </select>
            </div>
            <div>
              <Label className="mb-1.5 block">Contenu du message</Label>
              <RichTextEditor
                value={form.body}
                onChange={(html) => setForm({ ...form, body: html })}
                minHeightClassName="min-h-[300px]"
              />
            </div>
          </div>
        ) : (
          <>
            <h1 className="font-display text-2xl font-bold md:text-3xl">{campaign.subject}</h1>

            {/* Rendu HTML sécurisé du contenu rédigé avec RichTextEditor */}
            <div
              className="prose prose-sm max-w-none rounded-2xl border bg-card p-6 leading-relaxed text-foreground"
              dangerouslySetInnerHTML={{ __html: campaign.body }}
            />
          </>
        )}

        {(campaign.scheduledAt || campaign.sentAt) && (
          <div className="grid gap-4 sm:grid-cols-2 text-sm">
            {campaign.scheduledAt && (
              <div className="rounded-2xl border bg-card p-4 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CalendarClock className="h-3.5 w-3.5 text-amber-600" /> Programmée pour le
                </div>
                <div className="font-semibold text-foreground">{formatDate(campaign.scheduledAt)}</div>
              </div>
            )}
            {campaign.sentAt && (
              <div className="rounded-2xl border bg-card p-4 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5 text-emerald-600" /> Envoyée le
                </div>
                <div className="font-semibold text-foreground">{formatDate(campaign.sentAt)}</div>
              </div>
            )}
          </div>
        )}
      </div>

      <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Programmer la campagne</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Date et heure d'envoi</Label>
              <Input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} className="mt-1" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setScheduleDialogOpen(false)}>Annuler</Button>
            <Button onClick={submitSchedule} disabled={!scheduledAt || scheduleMutation.isPending}>Programmer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDelete
        open={toDelete}
        onOpenChange={setToDelete}
        onConfirm={() => {
          removeMutation.mutate(campaign.id, {
            onSuccess: () => { toast.success("Campagne supprimée"); navigate({ to: "/admin/newsletter/campaigns" }); },
            onError: () => toast.error("Erreur lors de la suppression"),
          });
        }}
        title={`Supprimer la campagne "${campaign.subject}" ?`}
      />
    </AdminShell>
  );
}