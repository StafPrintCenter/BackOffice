import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Pencil, Trash2, Save, X, Loader2 } from "lucide-react";
import { AdminShell, ConfirmDelete } from "@/components/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAdminProjectDetail, useUpdateAdminProject, useDeleteAdminProject } from "@/stores/useProjectsStore";
import { useAdminCategoriesList } from "@/stores/useCategoriesStore";
import type { AdminProjectPayload } from "@/data/projects";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/admin/projects/$id")({
  head: () => ({
    meta: [
      { title: `Projet | ${SITE.name}` },
      { name: "robots", content: "noindex" }]
  }),
  component: ProjectDetail,
});

function ProjectDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

  const { item: project, isLoading } = useAdminProjectDetail(id);
  const { items: categories } = useAdminCategoriesList({ perPage: 100, context: "project" });
  const updateMutation = useUpdateAdminProject();
  const removeMutation = useDeleteAdminProject();

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<AdminProjectPayload | null>(null);
  const [toDelete, setToDelete] = useState(false);

  useEffect(() => {
    if (project && !form) {
      setForm({
        title: project.title,
        category_id: project.categoryId,
        client: project.client,
        cover: project.cover,
        description: project.description,
      });
    }
  }, [project, form]);

  if (isLoading) {
    return (
      <AdminShell>
        <div className="flex items-center justify-center py-24 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2" /> Chargement...
        </div>
      </AdminShell>
    );
  }

  if (!project || !form) {
    return (
      <AdminShell>
        <div className="mb-6">
          <Button variant="outline" size="sm" onClick={() => navigate({ to: "/admin/projects" })}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Retour
          </Button>
        </div>
        <p className="text-muted-foreground">Projet introuvable.</p>
      </AdminShell>
    );
  }

  const handleSave = () => {
    updateMutation.mutate({ id: project.id, payload: form }, {
      onSuccess: () => { toast.success("Projet modifié"); setIsEditing(false); },
      onError: () => toast.error("Erreur lors de la modification"),
    });
  };

  const handleCancel = () => {
    setForm({
      title: project.title,
      category_id: project.categoryId,
      client: project.client,
      cover: project.cover,
      description: project.description,
    });
    setIsEditing(false);
  };

  return (
    <AdminShell>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" size="sm" onClick={() => navigate({ to: "/admin/projects" })}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Retour
        </Button>
        <div className="flex gap-2">
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
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Pencil className="h-4 w-4 mr-1" /> Modifier
              </Button>
              <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => setToDelete(true)}>
                <Trash2 className="h-4 w-4 mr-1" /> Supprimer
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="max-w-4xl space-y-6">
        <div className="overflow-hidden rounded-2xl border">
          <img src={isEditing ? form.cover : project.cover} alt={project.title} className="aspect-video w-full object-cover" />
        </div>

        {isEditing ? (
          <div className="space-y-4 rounded-2xl border bg-card p-6">
            <div>
              <Label>Titre</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <Label>Catégorie</Label>
              <select
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
              </select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Client</Label>
                <Input value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} />
              </div>
              <div>
                <Label>Image de couverture (URL)</Label>
                <Input value={form.cover} onChange={(e) => setForm({ ...form, cover: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
          </div>
        ) : (
          <>
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-full bg-muted px-2 py-0.5">{project.category}</span>
              </div>
              <h1 className="mt-3 font-display text-4xl font-bold">{project.title}</h1>
              <div className="mt-1 text-muted-foreground">Client : <b className="text-foreground">{project.client}</b></div>
            </div>
            <div className="rounded-2xl border bg-card p-6">
              <div className="font-semibold mb-2">Description</div>
              <p className="text-sm leading-relaxed">{project.description}</p>
            </div>
          </>
        )}
      </div>

      <ConfirmDelete
        open={toDelete}
        onOpenChange={setToDelete}
        onConfirm={() => {
          removeMutation.mutate(project.id, {
            onSuccess: () => { toast.success("Projet supprimé"); navigate({ to: "/admin/projects" }); },
            onError: () => toast.error("Erreur lors de la suppression"),
          });
        }}
        title={`Supprimer "${project.title}" ?`}
      />
    </AdminShell>
  );
}