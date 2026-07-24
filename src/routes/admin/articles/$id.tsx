import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Pencil, Trash2, Save, X, Loader2, FileText, Calendar, User, Tag, Image as ImageIcon, Link as LinkIcon } from "lucide-react";
import { AdminShell, ConfirmDelete } from "@/components/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminArticleDetail, useUpdateAdminArticle, useDeleteAdminArticle, useAdminCategoriesList } from "@/stores";
import type { AdminArticlePayload } from "@/data/articles";
import { RichTextEditor } from "@/components/site/RichTextEditor";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/admin/articles/$id")({
  head: () => ({
    meta: [
      { title: `Article | ${SITE.name}` },
      { name: "robots", content: "noindex" }]
  }),
  component: ArticleDetail,
});

function ArticleDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

  const { item: article, isLoading } = useAdminArticleDetail(id);
  const { items: categories } = useAdminCategoriesList({ perPage: 100 });
  const updateMutation = useUpdateAdminArticle();
  const removeMutation = useDeleteAdminArticle();

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<AdminArticlePayload | null>(null);
  const [toDelete, setToDelete] = useState(false);

  useEffect(() => {
    if (article && !form) {
      setForm({
        slug: article.slug,
        title: article.title,
        author: article.author,
        category_id: article.categoryId,
        published_at: article.date,
        excerpt: article.excerpt,
        cover: article.cover,
        body: article.body,
      });
    }
  }, [article, form]);

  if (isLoading) {
    return (
      <AdminShell>
        <div className="flex items-center justify-center py-24 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2" /> Chargement...
        </div>
      </AdminShell>
    );
  }

  if (!article || !form) {
    return (
      <AdminShell>
        <div className="mb-6">
          <Button variant="outline" size="sm" onClick={() => navigate({ to: "/admin/articles" })}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Retour
          </Button>
        </div>
        <div className="rounded-xl border p-8 text-center text-muted-foreground">
          Article introuvable.
        </div>
      </AdminShell>
    );
  }

  // Trouver la catégorie correspondante pour appliquer la couleur dynamique
  const selectedCatId = isEditing ? form.category_id : article.categoryId;
  const match = categories.find(
    (c) => c.id === selectedCatId || c.name.toLowerCase() === (typeof article.category === "string" ? article.category.toLowerCase() : "")
  );
  const categoryColorClass = match?.colorClass || "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
  const categoryName = match?.name || (typeof article.category === "string" ? article.category : "Sans catégorie");

  const handleSave = () => {
    updateMutation.mutate({ id: article.id, payload: form }, {
      onSuccess: () => { toast.success("Article modifié"); setIsEditing(false); },
      onError: () => toast.error("Erreur lors de la modification"),
    });
  };

  const handleCancel = () => {
    setForm({
      slug: article.slug,
      title: article.title,
      author: article.author,
      category_id: article.categoryId,
      published_at: article.date,
      excerpt: article.excerpt,
      cover: article.cover,
      body: article.body,
    });
    setIsEditing(false);
  };

  return (
    <AdminShell>
      {/* Barre d'action supérieure */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" size="sm" onClick={() => navigate({ to: "/admin/articles" })}>
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
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2 border-b pb-4">
              <FileText className="h-5 w-5 text-primary" />
              <h2 className="font-display text-lg font-semibold">Rédaction de l'article</h2>
            </div>

            <div className="mt-6 space-y-5">
              <div>
                <Label htmlFor="title">Titre de l'article</Label>
                {isEditing ? (
                  <Input
                    id="title"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="mt-1.5"
                  />
                ) : (
                  <h1 className="mt-1.5 font-display text-2xl font-bold">{article.title}</h1>
                )}
              </div>

              <div>
                <Label htmlFor="excerpt">Extrait (résumé)</Label>
                {isEditing ? (
                  <Input
                    id="excerpt"
                    value={form.excerpt}
                    onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                    className="mt-1.5"
                  />
                ) : (
                  <p className="mt-1.5 text-sm text-muted-foreground italic">
                    {article.excerpt || "Aucun extrait défini."}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="body">Contenu principal</Label>
                {isEditing ? (
                  <div className="mt-1.5">
                    <RichTextEditor
                      value={form.body}
                      onChange={(html) => setForm({ ...form, body: html })}
                      placeholder="Rédigez votre article..."
                    />
                  </div>
                ) : (
                  <div
                    className="mt-1.5 prose prose-sm max-w-none rounded-xl border bg-muted/10 p-6 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: article.body }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Barre Latérale (1/3) */}
        <div className="space-y-6 lg:col-span-1">
          {/* Image de Couverture */}
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2 border-b pb-3 mb-4">
              <ImageIcon className="h-4 w-4 text-primary" />
              <h3 className="font-display text-sm font-semibold">Image de couverture</h3>
            </div>
            <div className="overflow-hidden rounded-xl border bg-muted/20">
              <img
                src={isEditing ? form.cover : article.cover}
                alt={article.title}
                className="aspect-video w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://placehold.co/600x400?text=Pas+d'image";
                }}
              />
            </div>
            {isEditing && (
              <div className="mt-3">
                <Label htmlFor="cover" className="text-xs">URL de l'image</Label>
                <Input
                  id="cover"
                  value={form.cover}
                  onChange={(e) => setForm({ ...form, cover: e.target.value })}
                  className="mt-1 text-xs"
                />
              </div>
            )}
          </div>

          {/* Paramètres & Publication */}
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2 border-b pb-3 mb-4">
              <Tag className="h-4 w-4 text-primary" />
              <h3 className="font-display text-sm font-semibold">Paramètres de publication</h3>
            </div>

            <div className="space-y-4 text-sm">
              {/* Catégorie */}
              <div>
                <Label htmlFor="category" className="text-xs text-muted-foreground">Catégorie</Label>
                {isEditing ? (
                  <select
                    id="category"
                    value={form.category_id}
                    onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">— Choisir —</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="mt-1">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryColorClass}`}>
                      {categoryName}
                    </span>
                  </div>
                )}
              </div>

              {/* Auteur */}
              <div>
                <Label htmlFor="author" className="text-xs text-muted-foreground">Auteur</Label>
                {isEditing ? (
                  <Input
                    id="author"
                    value={form.author}
                    onChange={(e) => setForm({ ...form, author: e.target.value })}
                    className="mt-1 text-sm"
                  />
                ) : (
                  <div className="mt-1 flex items-center gap-1.5 font-medium">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{article.author || "Anonyme"}</span>
                  </div>
                )}
              </div>

              {/* Date de publication */}
              <div>
                <Label htmlFor="published_at" className="text-xs text-muted-foreground">Date de publication</Label>
                {isEditing ? (
                  <Input
                    id="published_at"
                    type="date"
                    value={form.published_at}
                    onChange={(e) => setForm({ ...form, published_at: e.target.value })}
                    className="mt-1 text-sm"
                  />
                ) : (
                  <div className="mt-1 flex items-center gap-1.5 text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{new Date(article.date).toLocaleDateString("fr-FR")}</span>
                  </div>
                )}
              </div>

              {/* Slug URL */}
              <div>
                <Label htmlFor="slug" className="text-xs text-muted-foreground">Slug URL</Label>
                {isEditing ? (
                  <Input
                    id="slug"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className="mt-1 font-mono text-xs"
                  />
                ) : (
                  <div className="mt-1 flex items-center gap-1.5 font-mono text-xs text-muted-foreground bg-muted/30 p-2 rounded-md truncate">
                    <LinkIcon className="h-3 w-3 shrink-0" />
                    <span className="truncate">{article.slug}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDelete
        open={toDelete}
        onOpenChange={setToDelete}
        onConfirm={() => {
          removeMutation.mutate(article.id, {
            onSuccess: () => { toast.success("Article supprimé"); navigate({ to: "/admin/articles" }); },
            onError: () => toast.error("Erreur lors de la suppression"),
          });
        }}
        title={`Supprimer "${article.title}" ?`}
      />
    </AdminShell>
  );
}