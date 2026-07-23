import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";
import { AdminShell, PageHeader, ConfirmDelete, DataTable, RichTextEditor } from "@/components/site";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAdminNewsletterCampaignsList, useCreateAdminNewsletterCampaign, useDeleteAdminNewsletterCampaign } from "@/stores/useNewsletterCampaignsStore";
import { useAdminCategoriesList } from "@/stores/useCategoriesStore";
import type { APIAdminNewsletterCampaignListItem, AdminNewsletterCampaignPayload } from "@/data/newsletterCampaigns";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/admin/newsletter/campaigns/")({
  head: () => ({
    meta: [
      { title: `Campagnes newsletter | ${SITE.name}` },
      { name: "robots", content: "noindex" }]
  }),
  component: AdminNewsletterCampaigns,
});

const schema = z.object({
  subject: z.string().trim().min(2).max(150),
  body: z.string().trim().min(10),
  category_id: z.string().trim().optional(),
});
type FormValues = z.infer<typeof schema>;
const empty: FormValues = { subject: "", body: "", category_id: "" };

function statusBadge(status: string) {
  const map: Record<string, string> = {
    draft: "bg-muted text-muted-foreground",
    scheduled: "bg-amber-500/10 text-amber-600",
    sent: "bg-emerald-500/10 text-emerald-600",
  };
  const label: Record<string, string> = { draft: "Brouillon", scheduled: "Programmée", sent: "Envoyée" };
  return <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${map[status] ?? "bg-muted text-muted-foreground"}`}>{label[status] ?? status}</span>;
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
        searchKeys={["subject"]}
        onCreate={openCreate}
        onView={(r) => navigate({ to: "/admin/newsletter/campaigns/$id", params: { id: r.id } })}
        onDelete={(r) => setToDelete(r)}
        columns={[
          { key: "subject", label: "Sujet", render: (r) => <div className="font-medium max-w-sm">{r.subject}</div> },
          { key: "category", label: "Catégorie", render: (r) => <span className="text-xs">{r.category ?? "—"}</span> },
          { key: "status", label: "Statut", render: (r) => statusBadge(r.status) },
          { key: "recipientsCount", label: "Destinataires", render: (r) => <span className="text-xs">{r.recipientsCount ?? "—"}</span> },
          { key: "scheduledAt", label: "Programmée le", render: (r) => r.scheduledAt ? new Date(r.scheduledAt).toLocaleString("fr-FR") : "—" },
        ]}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Nouvelle campagne</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Sujet</Label>
              <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
              {errors.subject && <p className="text-xs text-destructive mt-1">{errors.subject}</p>}
            </div>
            <div>
              <Label>Catégorie (optionnel)</Label>
              <select
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">— Aucune —</option>
                {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
              </select>
            </div>
            <div>
              <Label>Contenu</Label>
              <Textarea rows={8} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
              {errors.body && <p className="text-xs text-destructive mt-1">{errors.body}</p>}
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