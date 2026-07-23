import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Pencil, Trash2, Save, X, Loader2, GraduationCap, FolderKanban, FileText, Mail, Tag, Calendar, Layers } from "lucide-react";
import { AdminShell, ConfirmDelete } from "@/components/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAdminCategoryDetail, useUpdateAdminCategory, useDeleteAdminCategory } from "@/stores/useCategoriesStore";
import type { AdminCategoryPayload } from "@/data/categories";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/admin/categories/$id")({
  head: () => ({
    meta: [
      { title: `Catégorie | ${SITE.name}` },
      { name: "robots", content: "noindex" }]
  }),
  component: CategoryDetail,
});

function CategoryDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

  const { item: cat, isLoading } = useAdminCategoryDetail(id);
  const updateMutation = useUpdateAdminCategory();
  const removeMutation = useDeleteAdminCategory();

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<AdminCategoryPayload | null>(null);
  const [toDelete, setToDelete] = useState(false);

  useEffect(() => {
    if (cat && !form) {
      setForm({
        name: cat.name,
        slug: cat.slug,
        color_class: cat.colorClass,
        is_training_theme: cat.isTrainingTheme,
        is_project_category: cat.isProjectCategory,
        is_article_category: cat.isArticleCategory,
        is_newsletter_category: cat.isNewsletterCategory,
      });
    }
  }, [cat, form]);

  if (isLoading) {
    return (
      <AdminShell>
        <div className="flex items-center justify-center py-24 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2" /> Chargement...
        </div>
      </AdminShell>
    );
  }

  if (!cat || !form) {
    return (
      <AdminShell>
        <div className="mb-6">
          <Button variant="outline" size="sm" onClick={() => navigate({ to: "/admin/categories" })}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Retour
          </Button>
        </div>
        <div className="rounded-xl border p-8 text-center text-muted-foreground">
          Catégorie introuvable.
          <div className="mt-2"><Link to="/admin/categories" className="text-primary underline">Retour à la liste</Link></div>
        </div>
      </AdminShell>
    );
  }

  const handleSave = () => {
    updateMutation.mutate({ id: cat.id, payload: form }, {
      onSuccess: () => { toast.success("Catégorie modifiée"); setIsEditing(false); },
      onError: () => toast.error("Erreur lors de la modification"),
    });
  };

  const handleCancel = () => {
    setForm({
      name: cat.name,
      slug: cat.slug,
      color_class: cat.colorClass,
      is_training_theme: cat.isTrainingTheme,
      is_project_category: cat.isProjectCategory,
      is_article_category: cat.isArticleCategory,
      is_newsletter_category: cat.isNewsletterCategory,
    });
    setIsEditing(false);
  };

  const usageBadges = [
    { label: "Formation", active: isEditing ? form.is_training_theme : cat.isTrainingTheme, icon: GraduationCap },
    { label: "Projet", active: isEditing ? form.is_project_category : cat.isProjectCategory, icon: FolderKanban },
    { label: "Article", active: isEditing ? form.is_article_category : cat.isArticleCategory, icon: FileText },
    { label: "Newsletter", active: isEditing ? form.is_newsletter_category : cat.isNewsletterCategory, icon: Mail },
  ];

  return (
    <AdminShell>
      {/* Barre d'action supérieure */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" size="sm" onClick={() => navigate({ to: "/admin/categories" })}>
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

      {/* Disposition à 2 colonnes */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Colonne Principale (2/3) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Informations Générales */}
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2 border-b pb-4">
              <Tag className="h-5 w-5 text-primary" />
              <h2 className="font-display text-lg font-semibold">Informations générales</h2>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <Label htmlFor="name">Nom de la catégorie</Label>
                {isEditing ? (
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="mt-1.5"
                  />
                ) : (
                  <div className="mt-1.5 text-lg font-medium">{cat.name}</div>
                )}
              </div>

              <div>
                <Label htmlFor="slug">Slug</Label>
                {isEditing ? (
                  <Input
                    id="slug"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className="mt-1.5 font-mono text-sm"
                  />
                ) : (
                  <div className="mt-1.5 font-mono text-sm text-muted-foreground">{cat.slug}</div>
                )}
              </div>

              <div>
                <Label htmlFor="color_class">Classe couleur (Tailwind)</Label>
                {isEditing ? (
                  <Input
                    id="color_class"
                    value={form.color_class}
                    onChange={(e) => setForm({ ...form, color_class: e.target.value })}
                    placeholder="ex: bg-indigo-500/10 text-indigo-600"
                    className="mt-1.5 font-mono text-sm"
                  />
                ) : (
                  <div className="mt-1.5 font-mono text-sm text-muted-foreground">
                    <code>{cat.colorClass || "Non spécifiée"}</code>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Configuration des usages */}
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2 border-b pb-4">
              <Layers className="h-5 w-5 text-primary" />
              <h2 className="font-display text-lg font-semibold">Affectation et Usages</h2>
            </div>

            <div className="mt-6">
              {isEditing ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-xl border p-4 hover:bg-muted/30 transition-colors">
                    <Label htmlFor="is_training" className="flex items-center gap-3 cursor-pointer">
                      <GraduationCap className="h-4 w-4 text-primary" />
                      <span>Thème de formation</span>
                    </Label>
                    <Switch id="is_training" checked={form.is_training_theme} onCheckedChange={(v) => setForm({ ...form, is_training_theme: v })} />
                  </div>

                  <div className="flex items-center justify-between rounded-xl border p-4 hover:bg-muted/30 transition-colors">
                    <Label htmlFor="is_project" className="flex items-center gap-3 cursor-pointer">
                      <FolderKanban className="h-4 w-4 text-primary" />
                      <span>Catégorie de projet</span>
                    </Label>
                    <Switch id="is_project" checked={form.is_project_category} onCheckedChange={(v) => setForm({ ...form, is_project_category: v })} />
                  </div>

                  <div className="flex items-center justify-between rounded-xl border p-4 hover:bg-muted/30 transition-colors">
                    <Label htmlFor="is_article" className="flex items-center gap-3 cursor-pointer">
                      <FileText className="h-4 w-4 text-primary" />
                      <span>Catégorie d'article</span>
                    </Label>
                    <Switch id="is_article" checked={form.is_article_category} onCheckedChange={(v) => setForm({ ...form, is_article_category: v })} />
                  </div>

                  <div className="flex items-center justify-between rounded-xl border p-4 hover:bg-muted/30 transition-colors">
                    <Label htmlFor="is_newsletter" className="flex items-center gap-3 cursor-pointer">
                      <Mail className="h-4 w-4 text-primary" />
                      <span>Catégorie newsletter</span>
                    </Label>
                    <Switch id="is_newsletter" checked={form.is_newsletter_category} onCheckedChange={(v) => setForm({ ...form, is_newsletter_category: v })} />
                  </div>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {usageBadges.map((b) => (
                    <div
                      key={b.label}
                      className={`flex items-center gap-3 rounded-xl border p-3.5 ${b.active ? "border-primary/30 bg-primary/5" : "border-border bg-muted/20 opacity-60"
                        }`}
                    >
                      <b.icon className={`h-4 w-4 ${b.active ? "text-primary" : "text-muted-foreground"}`} />
                      <span className="text-sm font-medium">{b.label}</span>
                      <span className={`ml-auto text-xs font-semibold ${b.active ? "text-primary" : "text-muted-foreground"}`}>
                        {b.active ? "Actif" : "Inactif"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Barre Latérale (1/3) */}
        <div className="space-y-6 lg:col-span-1">
          {/* Aperçu Visuel du Badge */}
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <h3 className="font-display text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              Aperçu du badge
            </h3>
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/20 p-8 text-center">
              <div className={`flex h-16 w-16 items-center justify-center rounded-2xl transition-all ${isEditing ? form.color_class : cat.colorClass}`}>
                <Tag className="h-7 w-7" />
              </div>
              <div className="mt-4 font-display text-lg font-bold">
                {isEditing ? form.name || "Titre" : cat.name}
              </div>
              <span className="mt-1 font-mono text-xs text-muted-foreground">
                {isEditing ? form.slug || "slug" : cat.slug}
              </span>
            </div>
          </div>

          {/* Métadonnées & Statistiques */}
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2 border-b pb-3 mb-4">
              <Calendar className="h-4 w-4 text-primary" />
              <h3 className="font-display text-sm font-semibold">Métadonnées</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">ID</span>
                <span className="font-mono text-xs">{cat.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Créée le</span>
                <span className="font-medium">{new Date(cat.createdAt).toLocaleDateString("fr-FR")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Modifiée le</span>
                <span className="font-medium">{new Date(cat.updatedAt).toLocaleDateString("fr-FR")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDelete
        open={toDelete}
        onOpenChange={setToDelete}
        onConfirm={() => {
          removeMutation.mutate(cat.id, {
            onSuccess: () => { toast.success("Catégorie supprimée"); navigate({ to: "/admin/categories" }); },
            onError: () => toast.error("Erreur lors de la suppression"),
          });
        }}
        title={`Supprimer "${cat.name}" ?`}
      />
    </AdminShell>
  );
}