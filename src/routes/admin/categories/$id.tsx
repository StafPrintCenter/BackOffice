import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Pencil, Trash2, Save, X, Loader2, GraduationCap, FolderKanban, FileText, Mail, Tag } from "lucide-react";
import { AdminShell } from "@/components/site/AdminShell";
import { ConfirmDelete } from "@/components/site/AdminBits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAdminCategoryDetail, useUpdateAdminCategory, useDeleteAdminCategory } from "@/stores/useCategoriesStore";
import type { AdminCategoryPayload } from "@/data/admin-categories";

export const Route = createFileRoute("/admin/categories/$id")({
  head: () => ({ meta: [{ title: "Catégorie — Admin" }, { name: "robots", content: "noindex" }] }),
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

      <div className="max-w-3xl space-y-6">
        {/* En-tête visuel */}
        <div className="overflow-hidden rounded-2xl border bg-card">
          <div className="flex items-center gap-4 border-b bg-muted/30 p-6">
            <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${cat.colorClass}`}>
              <Tag className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              {isEditing ? (
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="font-display text-xl font-bold h-auto py-1.5"
                />
              ) : (
                <h1 className="font-display text-2xl font-bold truncate">{cat.name}</h1>
              )}
              <div className="mt-1 text-sm text-muted-foreground">
                Slug : <code className="text-xs">{cat.slug}</code>
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="grid gap-4 p-6 sm:grid-cols-2">
              <div>
                <Label>Slug</Label>
                <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
              </div>
              <div>
                <Label>Classe couleur (Tailwind)</Label>
                <Input
                  value={form.color_class}
                  onChange={(e) => setForm({ ...form, color_class: e.target.value })}
                  placeholder="ex: bg-indigo-500/10 text-indigo-600"
                />
              </div>
            </div>
          )}
        </div>

        {/* Utilisation */}
        <div className="rounded-2xl border bg-card p-6">
          <div className="mb-4 font-display text-lg font-semibold">Utilisation</div>

          {isEditing ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <Label className="flex items-center gap-2 cursor-pointer"><GraduationCap className="h-4 w-4" /> Thème de formation</Label>
                <Switch checked={form.is_training_theme} onCheckedChange={(v) => setForm({ ...form, is_training_theme: v })} />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <Label className="flex items-center gap-2 cursor-pointer"><FolderKanban className="h-4 w-4" /> Catégorie de projet</Label>
                <Switch checked={form.is_project_category} onCheckedChange={(v) => setForm({ ...form, is_project_category: v })} />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <Label className="flex items-center gap-2 cursor-pointer"><FileText className="h-4 w-4" /> Catégorie d'article</Label>
                <Switch checked={form.is_article_category} onCheckedChange={(v) => setForm({ ...form, is_article_category: v })} />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <Label className="flex items-center gap-2 cursor-pointer"><Mail className="h-4 w-4" /> Catégorie newsletter</Label>
                <Switch checked={form.is_newsletter_category} onCheckedChange={(v) => setForm({ ...form, is_newsletter_category: v })} />
              </div>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {usageBadges.map((b) => (
                <div
                  key={b.label}
                  className={`flex items-center gap-3 rounded-lg border p-3 ${b.active ? "border-primary/30 bg-primary/5" : "border-border bg-muted/20 opacity-60"}`}
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

        {/* Métadonnées */}
        {!isEditing && (
          <div className="rounded-2xl border bg-card p-6 text-sm text-muted-foreground">
            <div className="flex flex-wrap gap-x-6 gap-y-1">
              <span>Créée le {new Date(cat.createdAt).toLocaleDateString("fr-FR")}</span>
              <span>Modifiée le {new Date(cat.updatedAt).toLocaleDateString("fr-FR")}</span>
            </div>
          </div>
        )}
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