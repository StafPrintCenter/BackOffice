import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Send, FileText, MessageSquareText, } from "lucide-react";
import { AdminShell, PageHeader, ConfirmDelete, DataTable } from "@/components/site";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAdminReviewFormsList, useCreateAdminReviewForm, useDeleteAdminReviewForm } from "@/stores/useReviewFormsStore";
import { useAdminCategoriesList } from "@/stores/useCategoriesStore";
import { type APIAdminReviewFormListItem, type AdminReviewFormPayload, REVIEW_FORM_STATUS_BADGES, REVIEW_FORM_STATUS_LABELS, } from "@/data/reviewsForms";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/admin/reviews/forms/")({
  head: () => ({
    meta: [
      { title: `Formulaires d'avis | ${SITE.name}` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminReviewForms,
});

const schema = z.object({
  title: z.string().trim().min(2).max(150),
  description: z.string().trim().min(2).max(1000),
  category_id: z.string().trim().optional(),
  expires_at: z.string().trim().optional(),
  max_responses: z.number().int().min(0).optional(),
  allow_response_edit: z.boolean(),
});
type FormValues = z.infer<typeof schema>;
const empty: FormValues = { title: "", description: "", category_id: "", expires_at: "", max_responses: undefined, allow_response_edit: true };

function AdminReviewForms() {
  const navigate = useNavigate();
  const { items, isLoading } = useAdminReviewFormsList({ perPage: 100 });
  const { items: categories } = useAdminCategoriesList({ perPage: 100 });

  const createMutation = useCreateAdminReviewForm();
  const removeMutation = useDeleteAdminReviewForm();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormValues>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toDelete, setToDelete] = useState<APIAdminReviewFormListItem | null>(null);

  const openCreate = () => { setForm(empty); setErrors({}); setOpen(true); };

  const submit = () => {
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => { errs[i.path[0] as string] = i.message; });
      setErrors(errs);
      return;
    }
    const payload: AdminReviewFormPayload = {
      title: parsed.data.title,
      description: parsed.data.description,
      category_id: parsed.data.category_id || undefined,
      expires_at: parsed.data.expires_at ? new Date(parsed.data.expires_at).toISOString() : undefined,
      max_responses: parsed.data.max_responses,
      allow_response_edit: parsed.data.allow_response_edit,
    };
    createMutation.mutate(payload, {
      onSuccess: () => { toast.success("Formulaire créé en brouillon"); setOpen(false); },
      onError: () => toast.error("Erreur lors de la création"),
    });
  };

  return (
    <AdminShell>
      <PageHeader title="Formulaires d'avis" description="Créez et gérez vos formulaires de collecte d'avis." />

      {/* Raccourci */}
      <div className="mb-4">
        <Link to="/admin/reviews/invites"
          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
          <Send className="h-4 w-4"
          />
          Inviter le clients
        </Link>
      </div>
      <div className="mb-4">
        <Link to="/admin/reviews/subscribers"
          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
          <Send className="h-4 w-4"
          />
          Voir les reponses
        </Link>
      </div>

      <DataTable<APIAdminReviewFormListItem>
        data={items}
        isLoading={isLoading}
        searchKeys={["title", "description"]}
        onCreate={openCreate}
        onView={(r) => navigate({ to: "/admin/reviews/forms/$id", params: { id: r.id } })}
        onDelete={(r) => setToDelete(r)}
        columns={[
          {
            key: "title",
            label: "Titre",
            render: (r) => (
              <div>
                <div className="font-medium">{r.title}</div>
                <div className="line-clamp-1 text-xs text-muted-foreground">{r.description}</div>
              </div>
            ),
          },
          {
            key: "category",
            label: "Catégorie",
            render: (r) => {
              if (!r.category) return <span className="text-xs text-muted-foreground">—</span>;
              const catObj = categories.find((c) => c.id === r.categoryId || c.name === r.category);
              return (
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${catObj?.colorClass ?? "bg-muted text-muted-foreground"}`}>
                  {r.category}
                </span>
              );
            },
          },
          {
            key: "status",
            label: "Statut",
            render: (r) => (
              <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${REVIEW_FORM_STATUS_BADGES[r.status] ?? "bg-muted text-muted-foreground"}`}>
                {REVIEW_FORM_STATUS_LABELS[r.status] ?? r.status}
              </span>
            ),
          },
          {
            key: "responsesCount",
            label: "Réponses",
            render: (r) => <span className="text-xs">{r.responsesCount}{r.maxResponses ? ` / ${r.maxResponses}` : ""}</span>,
          },
          {
            key: "expiresAt",
            label: "Expire le",
            render: (r) => r.expiresAt ? new Date(r.expiresAt).toLocaleDateString("fr-FR") : "—",
          },
        ]}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Nouveau formulaire</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Titre</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              {errors.title && <p className="mt-1 text-xs text-destructive">{errors.title}</p>}
            </div>
            <div>
              <Label>Description</Label>
              <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              {errors.description && <p className="mt-1 text-xs text-destructive">{errors.description}</p>}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
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
                <Label>Expire le (optionnel)</Label>
                <Input type="datetime-local" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} />
              </div>
              <div>
                <Label>Nombre max. de réponses (optionnel)</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.max_responses ?? ""}
                  onChange={(e) => setForm({ ...form, max_responses: e.target.value === "" ? undefined : Number(e.target.value) })}
                />
              </div>
              <div className="flex items-end gap-3">
                <Label className="mb-2">Réponses modifiables</Label>
                <Switch checked={form.allow_response_edit} onCheckedChange={(v) => setForm({ ...form, allow_response_edit: v })} />
              </div>
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
            onSuccess: () => { toast.success("Formulaire supprimé"); setToDelete(null); },
            onError: () => toast.error("Erreur lors de la suppression"),
          });
        }}
        title={`Supprimer "${toDelete?.title}" ?`}
      />
    </AdminShell>
  );
}
