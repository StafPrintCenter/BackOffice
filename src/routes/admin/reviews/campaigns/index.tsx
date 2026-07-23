import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";
import { AdminShell, PageHeader, ConfirmDelete, DataTable, RichTextEditor } from "@/components/site";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAdminNewsletterCampaignsList, useCreateAdminNewsletterCampaign, useDeleteAdminNewsletterCampaign } from "@/stores/useNewsletterCampaignsStore";
import { useAdminCategoriesList } from "@/stores/useCategoriesStore";
import {
  type APIAdminNewsletterCampaignListItem,
  type AdminNewsletterCampaignPayload,
  NEWSLETTER_CAMPAIGN_STATUS_MAP,
  NEWSLETTER_CAMPAIGN_STATUS_LABELS,
} from "@/data/newsletterCampaigns";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/admin/reviews/campaigns/")({
  head: () => ({
    meta: [
      { title: `Campagnes newsletter | ${SITE.name}` },
      { name: "robots", content: "noindex" }]
  }),
  component: AdminNewsletterCampaigns,
});

const schema = z.object({
  subject: z.string().trim().min(2, "Le sujet doit contenir au moins 2 caractères").max(150),
  body: z.string().trim().min(10, "Le contenu doit contenir au moins 10 caractères"),
  category_id: z.string().trim().optional(),
});
type FormValues = z.infer<typeof schema>;
const empty: FormValues = { subject: "", body: "", category_id: "" };

function statusBadge(status: string) {
  const colorClass = NEWSLETTER_CAMPAIGN_STATUS_MAP[status] ?? "bg-muted text-muted-foreground border-border";
  const label = NEWSLETTER_CAMPAIGN_STATUS_LABELS[status] ?? status;
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${colorClass}`}>
      {label}
    </span>
  );
}

function AdminNewsletterCampaigns() {
  const navigate = useNavigate();
  const { items, isLoading } = useAdminNewsletterCampaignsList({ perPage: 100 });
  const { items: categories } = useAdminCategoriesList({ perPage: 100, context: "newsletter" });

  const createMutation = useCreateAdminNewsletterCampaign();
  const removeMutation = useDeleteAdminNewsletterCampaign();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormValues>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toDelete, setToDelete] = useState<APIAdminNewsletterCampaignListItem | null>(null);

  const openCreate = () => { setForm(empty); setErrors({}); setOpen(true); };

  const submit = () => {
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => { errs[i.path[0] as string] = i.message; });
      setErrors(errs);
      return;
    }
    createMutation.mutate(parsed.data as AdminNewsletterCampaignPayload, {
      onSuccess: () => { toast.success("Campagne créée en brouillon"); setOpen(false); },
      onError: () => toast.error("Erreur lors de la création"),
    });
  };

  return (
    <AdminShell>
      <div className="mb-4">
        <Button variant="outline" size="sm" onClick={() => navigate({ to: "/admin/newsletter" })}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Retour
        </Button>
      </div>
      <PageHeader title="Campagnes newsletter" description="Créez, programmez et envoyez vos campagnes d'emailing." />
      <DataTable<APIAdminNewsletterCampaignListItem>
        data={items}
        isLoading={isLoading}
        searchKeys={["subject", "category"]}
        onCreate={openCreate}
        onView={(r) => navigate({ to: "/admin/newsletter/campaigns/$id", params: { id: r.id } })}
        onDelete={(r) => setToDelete(r)}
        columns={[
          { key: "subject", label: "Sujet", render: (r) => <div className="font-medium text-foreground max-w-sm">{r.subject}</div> },
          {
            key: "category",
            label: "Catégorie",
            render: (r) => {
              if (!r.category) return <span className="text-xs text-muted-foreground">—</span>;

              const match = categories.find(
                (c) => c.name.toLowerCase() === r.category?.toLowerCase()
              );

              const colorClass = match?.colorClass || "bg-slate-100 text-slate-700";

              return (
                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${colorClass}`}>
                  {r.category}
                </span>
              );
            },
          },
          { key: "status", label: "Statut", render: (r) => statusBadge(r.status) },
          { key: "recipientsCount", label: "Destinataires", render: (r) => <span className="text-xs font-medium">{r.recipientsCount ?? "—"}</span> },
          {
            key: "scheduledAt",
            label: "Programmée le",
            render: (r) => r.scheduledAt ? (
              <span className="text-xs text-muted-foreground">
                {new Date(r.scheduledAt.replace("Z", "")).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}
              </span>
            ) : "—"
          },
        ]}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Nouvelle campagne</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Sujet *</Label>
              <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Ex: Découvrez nos nouveautés du mois !" />
              {errors.subject && <p className="text-xs text-destructive mt-1 font-medium">{errors.subject}</p>}
            </div>
            <div>
              <Label>Catégorie (optionnel)</Label>
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
              <Label className="mb-1.5 block">Contenu du message *</Label>
              <RichTextEditor
                value={form.body}
                onChange={(html) => setForm({ ...form, body: html })}
                placeholder="Rédigez le contenu de votre email ici..."
                minHeightClassName="min-h-[220px]"
              />
              {errors.body && <p className="text-xs text-destructive mt-1 font-medium">{errors.body}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
            <Button onClick={submit} disabled={createMutation.isPending}>Créer en brouillon</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDelete
        open={!!toDelete}
        onOpenChange={(v) => !v && setToDelete(null)}
        onConfirm={() => {
          if (!toDelete) return;
          removeMutation.mutate(toDelete.id, {
            onSuccess: () => { toast.success("Campagne supprimée"); setToDelete(null); },
            onError: () => toast.error("Erreur lors de la suppression"),
          });
        }}
        title={`Supprimer la campagne "${toDelete?.subject}" ?`}
      />
    </AdminShell>
  );
}