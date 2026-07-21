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
  name: z.string().trim().min(2, "Le nom doit faire au moins 2 caractères").max(50),
  slug: z.string().trim().max(50).optional(),
  colorClass: z.string().trim().min(1, "La classe couleur est requise").max(80),
  isTrainingTheme: z.boolean(),
  isProjectCategory: z.boolean(),
  isArticleCategory: z.boolean(),
  isNewsletterCategory: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

const empty: FormValues = {
  name: "",
  slug: "",
  colorClass: "bg-slate-100 text-slate-700",
  isTrainingTheme: false,
  isProjectCategory: false,
  isArticleCategory: false,
  isNewsletterCategory: false,
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
      <PageHeader title="Catégories" description="Utilisées par formations, projets, articles, newsletter et FAQ." />

      <DataTable<APIAdminCategory>
        data={items}
        isLoading={isLoading}
        searchKeys={["name", "slug"]}
        onCreate={openCreate}
        onDelete={(r) => setToDelete(r)}
        onView={(r) => navigate({ to: "/admin/categories/$id", params: { id: r.id } })}
        columns={[
          {
            key: "name",
            label: "Nom",
            render: (r) => (
              <Link to="/admin/categories/$id" params={{ id: r.id }} className="font-medium hover:underline">
                {r.name}
              </Link>
            ),
          },
          {
            key: "slug",
            label: "Slug",
            render: (r) => <code className="text-xs">{r.slug}</code>,
          },
          {
            key: "colorClass",
            label: "Couleur",
            render: (r) => (
              <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${r.colorClass || "bg-slate-100 text-slate-700"}`}>
                {r.name}
              </span>
            ),
          },
          {
            key: "flags",
            label: "Type",
            render: (r) => (
              <div className="flex flex-wrap gap-1 text-[10px] font-medium">
                {r.isTrainingTheme && <span className="rounded bg-indigo-500/10 text-indigo-600 px-1.5 py-0.5">Formation</span>}
                {r.isProjectCategory && <span className="rounded bg-emerald-500/10 text-emerald-600 px-1.5 py-0.5">Projet</span>}
                {r.isArticleCategory && <span className="rounded bg-sky-500/10 text-sky-600 px-1.5 py-0.5">Article</span>}
                {r.isNewsletterCategory && <span className="rounded bg-amber-500/10 text-amber-600 px-1.5 py-0.5">Newsletter</span>}
              </div>
            ),
          },
        ]}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvelle catégorie</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nom</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
            </div>
            <div>
              <Label>Slug (optionnel)</Label>
              <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            </div>
            <div>
              <Label>Classe couleur (Tailwind)</Label>
              <Input
                value={form.colorClass}
                onChange={(e) => setForm({ ...form, colorClass: e.target.value })}
                placeholder="ex: bg-indigo-500/10 text-indigo-600"
              />
              {errors.colorClass && <p className="mt-1 text-xs text-destructive">{errors.colorClass}</p>}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <Label className="cursor-pointer">Thème de formation</Label>
                <Switch
                  checked={form.isTrainingTheme}
                  onCheckedChange={(v) => setForm({ ...form, isTrainingTheme: v })}
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <Label className="cursor-pointer">Catégorie de projet</Label>
                <Switch
                  checked={form.isProjectCategory}
                  onCheckedChange={(v) => setForm({ ...form, isProjectCategory: v })}
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <Label className="cursor-pointer">Catégorie d'article</Label>
                <Switch
                  checked={form.isArticleCategory}
                  onCheckedChange={(v) => setForm({ ...form, isArticleCategory: v })}
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <Label className="cursor-pointer">Catégorie de newsletter</Label>
                <Switch
                  checked={form.isNewsletterCategory}
                  onCheckedChange={(v) => setForm({ ...form, isNewsletterCategory: v })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button onClick={submit} disabled={createMutation.isPending}>
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDelete
        open={!!toDelete}
        onOpenChange={(v) => !v && setToDelete(null)}
        onConfirm={() => {
          if (!toDelete) return;
          removeMutation.mutate(toDelete.id, {
            onSuccess: () => {
              toast.success("Catégorie supprimée");
              setToDelete(null);
            },
            onError: () => toast.error("Erreur lors de la suppression"),
          });
        }}
        title={`Supprimer "${toDelete?.name}" ?`}
      />
    </AdminShell>
  );
}