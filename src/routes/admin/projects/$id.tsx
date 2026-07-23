import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Pencil, Trash2, Save, X, Loader2, Globe, Lock, User, FolderCog, Calendar, Image as ImageIcon } from "lucide-react";
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
      { name: "robots", content: "noindex" }
    ]
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
        category_id: project.categoryId ?? "",
        client: project.client,
        cover: project.cover,
        description: project.description,
        is_public: project.isPublic ?? true,
      });
    }
  }, [project, form]);

  if (isLoading) {
    return (
      <AdminShell>
        <div className="flex h-96 items-center justify-center text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin mr-2 text-primary" /> Chargement du projet...
        </div>
      </AdminShell>
    );
  }

  if (!project || !form) {
    return (
      <AdminShell>
        <div className="mb-6">
          <Button variant="outline" size="sm" onClick={() => navigate({ to: "/admin/projects" })}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Retour aux projets
          </Button>
        </div>
        <div className="rounded-2xl border bg-card p-12 text-center">
          <p className="text-muted-foreground">Projet introuvable ou supprimé.</p>
        </div>
      </AdminShell>
    );
  }

  const matchedCategory = categories.find(
    (c) => c.id === project.categoryId || c.name.toLowerCase() === (typeof project.category === "string" ? project.category.toLowerCase() : "")
  );
  const categoryColorClass = matchedCategory?.colorClass || "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
  const categoryName = typeof project.category === "string" ? project.category : matchedCategory?.name || "Sans catégorie";

  const handleSave = () => {
    updateMutation.mutate({ id: project.id, payload: form }, {
      onSuccess: () => {
        toast.success("Projet mis à jour avec succès");
        setIsEditing(false);
      },
      onError: () => toast.error("Erreur lors de la mise à jour"),
    });
  };

  const handleCancel = () => {
    setForm({
      title: project.title,
      category_id: project.categoryId ?? "",
      client: project.client,
      cover: project.cover,
      description: project.description,
      is_public: project.isPublic ?? true,
    });
    setIsEditing(false);
  };

  return (
    <AdminShell>
      {/* Barre d'actions supérieure */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/admin/projects" })} className="-ml-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Retour à la liste
        </Button>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" size="sm" onClick={handleCancel}>
                <X className="h-4 w-4 mr-1.5" /> Annuler
              </Button>
              <Button size="sm" onClick={handleSave} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Save className="h-4 w-4 mr-1.5" />}
                Enregistrer
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Pencil className="h-4 w-4 mr-1.5" /> Modifier
              </Button>
              <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => setToDelete(true)}>
                <Trash2 className="h-4 w-4 mr-1.5" /> Supprimer
              </Button>
            </>
          )}
        </div>
      </div>

      {/* En-tête principal */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {/* Badge Catégorie */}
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${categoryColorClass}`}>
            <FolderCog className="h-3.5 w-3.5 mr-1 opacity-70" />
            {categoryName}
          </span>

          {/* Badge Visibilité */}
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${(isEditing ? form.is_public : project.isPublic)
            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400"
            : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400"
            }`}>
            {(isEditing ? form.is_public : project.isPublic) ? (
              <><Globe className="h-3.5 w-3.5 mr-1" /> Public</>
            ) : (
              <><Lock className="h-3.5 w-3.5 mr-1" /> Privé</>
            )}
          </span>
        </div>

        {isEditing ? (
          <Input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="text-2xl font-bold md:text-3xl font-display max-w-2xl"
            placeholder="Titre du projet"
          />
        ) : (
          <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">{project.title}</h1>
        )}
      </div>

      {/* Disposition principale : 2 Colonnes */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Colonne Gauche : Média & Description (2/3) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Bloc Cover Image */}
          <div className="group relative overflow-hidden rounded-2xl border bg-card shadow-sm">
            <img
              src={isEditing ? form.cover : project.cover}
              alt={project.title}
              className="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-[1.01]"
            />
            {isEditing && (
              <div className="p-4 border-t bg-muted/40">
                <Label className="text-xs font-medium text-muted-foreground flex items-center mb-1.5">
                  <ImageIcon className="h-3.5 w-3.5 mr-1" /> URL de l'image de couverture
                </Label>
                <Input
                  value={form.cover}
                  onChange={(e) => setForm({ ...form, cover: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                />
              </div>
            )}
          </div>

          {/* Bloc Description */}
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <h2 className="text-base font-semibold mb-4">À propos du projet</h2>
            {isEditing ? (
              <Textarea
                rows={8}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="leading-relaxed"
                placeholder="Description détaillée du projet..."
              />
            ) : (
              <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                {project.description || "Aucune description fournie."}
              </p>
            )}
          </div>
        </div>

        {/* Colonne Droite : Métadonnées & Paramètres (1/3) */}
        <div className="space-y-6">
          <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-5">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Informations clés</h3>

            <div className="space-y-4 text-sm">
              {/* Client */}
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                  <User className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-muted-foreground">Client</div>
                  {isEditing ? (
                    <Input
                      value={form.client}
                      onChange={(e) => setForm({ ...form, client: e.target.value })}
                      className="mt-1 h-8 text-xs"
                    />
                  ) : (
                    <div className="font-medium text-foreground truncate">{project.client}</div>
                  )}
                </div>
              </div>

              {/* Catégorie */}
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                  <FolderCog className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-muted-foreground">Catégorie</div>
                  {isEditing ? (
                    <select
                      value={form.category_id}
                      onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                      className="mt-1 w-full rounded-md border border-input bg-background px-2 py-1 text-xs"
                    >
                      <option value="">— Choisir —</option>
                      {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                    </select>
                  ) : (
                    <div className="font-medium text-foreground">{categoryName}</div>
                  )}
                </div>
              </div>

              {/* Date de création */}
              {project.createdAt && (
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Créé le</div>
                    <div className="font-medium text-foreground">
                      {new Date(project.createdAt).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <hr className="my-4 border-border" />

            {/* Toggle Visibilité en mode Édition */}
            <div>
              <div className="text-xs font-medium text-muted-foreground mb-2">Visibilité sur le site</div>
              {isEditing ? (
                <label className="flex items-center justify-between p-3 rounded-xl border bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors">
                  <span className="text-xs font-medium">Projet public</span>
                  <input
                    type="checkbox"
                    checked={form.is_public}
                    onChange={(e) => setForm({ ...form, is_public: e.target.checked })}
                    className="h-4 w-4 rounded accent-primary cursor-pointer"
                  />
                </label>
              ) : (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {project.isPublic ? (
                    <>
                      <Globe className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Visible dans le portfolio public</span>
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      <span>Masqué du public (Back-office uniquement)</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Boîte de dialogue de confirmation de suppression */}
      <ConfirmDelete
        open={toDelete}
        onOpenChange={setToDelete}
        onConfirm={() => {
          removeMutation.mutate(project.id, {
            onSuccess: () => {
              toast.success("Projet supprimé");
              navigate({ to: "/admin/projects" });
            },
            onError: () => toast.error("Erreur lors de la suppression"),
          });
        }}
        title={`Supprimer "${project.title}" ?`}
      />
    </AdminShell>
  );
}