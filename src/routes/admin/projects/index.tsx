import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { AdminShell, PageHeader, ConfirmDelete, DataTable } from "@/components/site";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAdminProjectsList, useCreateAdminProject, useDeleteAdminProject } from "@/stores/useProjectsStore";
import { useAdminCategoriesList } from "@/stores/useCategoriesStore";
import type { APIAdminProject, AdminProjectPayload } from "@/data/projects";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/admin/projects/")({
  head: () => ({
    meta: [
      { title: `Projets | ${SITE.name}` },
      { name: "robots", content: "noindex" }]
  }),
  component: AdminProjects,
});

const schema = z.object({
  title: z.string().trim().min(2).max(120),
  category_id: z.string().trim().min(1, "Choisissez une catégorie"),
  client: z.string().trim().min(1).max(100),
  cover: z.string().trim().url("URL image invalide"),
  description: z.string().trim().min(10).max(2000),
});
type FormValues = z.infer<typeof schema>;
const empty: FormValues = { title: "", category_id: "", client: "", cover: "", description: "" };

function AdminProjects() {
  const navigate = useNavigate();
  const { items, isLoading } = useAdminProjectsList({ perPage: 100 });
  const { items: categories } = useAdminCategoriesList({ perPage: 100, context: "project" });

  const createMutation = useCreateAdminProject();
  const removeMutation = useDeleteAdminProject();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormValues>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toDelete, setToDelete] = useState<APIAdminProject | null>(null);

  const openCreate = () => { setForm(empty); setErrors({}); setOpen(true); };

  const submit = () => {
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => { errs[i.path[0] as string] = i.message; });
      setErrors(errs);
      return;
    }
    createMutation.mutate(parsed.data as AdminProjectPayload, {
      onSuccess: () => { toast.success("Projet créé"); setOpen(false); },
      onError: () => toast.error("Erreur lors de la création"),
    });
  };

  return (
    <AdminShell>
      <PageHeader title="Projets" description="Portfolio du site." />
      <DataTable<APIAdminProject>
        data={items}
        isLoading={isLoading}
        searchKeys={["title", "category", "client"]}
        onCreate={openCreate}
        onView={(r) => navigate({ to: "/admin/projects/$id", params: { id: r.id } })}
        onDelete={(r) => setToDelete(r)}
        columns={[
          { key: "cover", label: "", render: (r) => <img src={r.cover} alt="" className="h-10 w-14 rounded object-cover" /> },
          { key: "title", label: "Titre", render: (r) => <div className="font-medium">{r.title}</div> },
          {
            key: "category",
            label: "Catégorie",
            render: (r) => {
              // 1. On cherche d'abord la catégorie correspondante dans le store par ID ou par nom/slug
              const match = categories.find(
                (c) => c.id === r.category_id || c.name.toLowerCase() === (typeof r.category === 'string' ? r.category.toLowerCase() : '')
              );

              // 2. Récupération de la classe couleur (ou fallback par défaut)
              const colorClass = match?.colorClass || "bg-slate-100 text-slate-700";
              const categoryName = typeof r.category === "string" ? r.category : match?.name || "Sans catégorie";

              return (
                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${colorClass}`}>
                  {categoryName}
                </span>
              );
            },
          },
          { key: "client", label: "Client" },
        ]}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Nouveau projet</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Titre</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              {errors.title && <p className="text-xs text-destructive mt-1">{errors.title}</p>}
            </div>
            <div>
              <Label>Catégorie</Label>
              <select
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">— Choisir —</option>
                {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
              </select>
              {errors.category_id && <p className="text-xs text-destructive mt-1">{errors.category_id}</p>}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Client</Label>
                <Input value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} />
                {errors.client && <p className="text-xs text-destructive mt-1">{errors.client}</p>}
              </div>
              <div>
                <Label>Image de couverture (URL)</Label>
                <Input value={form.cover} onChange={(e) => setForm({ ...form, cover: e.target.value })} />
                {errors.cover && <p className="text-xs text-destructive mt-1">{errors.cover}</p>}
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              {errors.description && <p className="text-xs text-destructive mt-1">{errors.description}</p>}
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
            onSuccess: () => { toast.success("Projet supprimé"); setToDelete(null); },
            onError: () => toast.error("Erreur lors de la suppression"),
          });
        }}
        title={`Supprimer "${toDelete?.title}" ?`}
      />
    </AdminShell>
  );
}