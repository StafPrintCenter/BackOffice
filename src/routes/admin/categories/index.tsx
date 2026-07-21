import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { AdminShell } from "@/layouts/AdminShell";
import { PageHeader, ConfirmDelete } from "@/components/admin/AdminBits";
import { DataTable } from "@/components/admin/DataTable";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAdminCategoriesList, useCreateAdminCategory, useDeleteAdminCategory } from "@/stores/useAdminCategoriesStore";
import type { APIAdminCategory, AdminCategoryPayload } from "@/data/admin-categories";

export const Route = createFileRoute("/admin/categories/")({
  head: () => ({ meta: [{ title: "Catégories — Admin" }, { name: "robots", content: "noindex" }] }),
  component: AdminCategories,
});

const schema = z.object({
  name: z.string().trim().min(2).max(50),
  slug: z.string().trim().max(50).optional(),
  color_class: z.string().trim().min(1).max(80),
  is_training_theme: z.boolean(),
  is_project_category: z.boolean(),
  is_article_category: z.boolean(),
});
type FormValues = z.infer<typeof schema>;
const empty: FormValues = {
  name: "", slug: "", color_class: "bg-slate-100 text-slate-700",
  is_training_theme: false, is_project_category: false, is_article_category: false,
};

function AdminCategories() {
  const navigate = useNavigate();
  const { items, isLoading } = useAdminCategoriesList({ perPage: 100 });
  const createMutation = useCreateAdminCategory();
  const removeMutation = useDeleteAdminCategory();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormValues>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toDelete, setToDelete] = useState<APIAdminCategory | null>(null);

  const openCreate = () => {
    setForm(empty);
    setErrors({});
    setOpen(true);
  };

  const submit = () => {
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => {
        errs[i.path[0] as string] = i.message;
      });
      setErrors(errs);
      return;
    }
    createMutation.mutate(parsed.data as AdminCategoryPayload, {
      onSuccess: () => { toast.success("Catégorie créée"); setOpen(false); },
      onError: () => toast.error("Erreur lors de la création"),
    });
  };

  return (
    <AdminShell>
      <PageHeader title="Catégories" description="Utilisées par formations, projets, articles et FAQ." />
      <DataTable<APIAdminCategory>
        data={items}
        isLoading={isLoading}
        searchKeys={["name", "slug"]}
        onCreate={openCreate}
        onDelete={(r) => setToDelete(r)}
        onView={(r) => navigate({ to: "/admin/categories/$id", params: { id: r.id } })}
        columns={[
          { key: "name", label: "Nom", render: (r) => <Link to="/admin/categories/$id" params={{ id: r.id }} className="font-medium hover:underline">{r.name}</Link> },
          { key: "slug", label: "Slug", render: (r) => <code className="text-xs">{r.slug}</code> },
          { key: "colorClass", label: "Couleur", render: (r) => <span className={"inline-flex px-2 py-1 rounded text-xs " + r.colorClass}>{r.name}</span> },
          {
            key: "flags", label: "Type", render: (r) => (
              <div className="flex flex-wrap gap-1 text-[10px]">
                {r.isTrainingTheme && <span className="rounded bg-primary/10 px-1.5 py-0.5">Formation</span>}
                {r.isProjectCategory && <span className="rounded bg-primary/10 px-1.5 py-0.5">Projet</span>}
                {r.isArticleCategory && <span className="rounded bg-primary/10 px-1.5 py-0.5">Article</span>}
              </div>
            )
          },
        ]}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nouvelle catégorie</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nom</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
            </div>
            <div>
              <Label>Slug (optionnel)</Label>
              <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            </div>
            <div>
              <Label>Classe couleur (Tailwind)</Label>
              <Input value={form.color_class} onChange={(e) => setForm({ ...form, color_class: e.target.value })} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <Label className="cursor-pointer">Thème de formation</Label>
                <Switch checked={form.is_training_theme} onCheckedChange={(v) => setForm({ ...form, is_training_theme: v })} />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <Label className="cursor-pointer">Catégorie de projet</Label>
                <Switch checked={form.is_project_category} onCheckedChange={(v) => setForm({ ...form, is_project_category: v })} />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <Label className="cursor-pointer">Catégorie d'article</Label>
                <Switch checked={form.is_article_category} onCheckedChange={(v) => setForm({ ...form, is_article_category: v })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
            <Button onClick={submit} disabled={createMutation.isPending}>Créer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDelete
        open={!!toDelete}
        onOpenChange={(v) => !v && setToDelete(null)}
        onConfirm={() => {
          if (!toDelete) return;
          removeMutation.mutate(toDelete.id, {
            onSuccess: () => { toast.success("Catégorie supprimée"); setToDelete(null); },
            onError: () => toast.error("Erreur lors de la suppression"),
          });
        }}
        title={`Supprimer "${toDelete?.name}" ?`}
      />
    </AdminShell>
  );
}