import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Pencil, Trash2, Save, X, Loader2 } from "lucide-react";
import { AdminShell } from "@/layouts/AdminShell";
import { ConfirmDelete } from "@/components/admin/AdminBits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminArticleDetail, useUpdateAdminArticle, useDeleteAdminArticle } from "@/stores/useArticlesStore";
import { useAdminCategoriesList } from "@/stores/useAdminCategoriesStore";
import type { AdminArticlePayload } from "@/data/articles";
import { RichTextEditor } from "@/components/admin/RichTextEditor";

export const Route = createFileRoute("/admin/articles/$id")({
  head: () => ({ meta: [{ title: "Article — Admin" }, { name: "robots", content: "noindex" }] }),
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
        <p className="text-muted-foreground">Article introuvable.</p>
      </AdminShell>
    );
  }

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

      <div className="max-w-4xl space-y-6">
        <div className="overflow-hidden rounded-2xl border">
          <img src={isEditing ? form.cover : article.cover} alt={article.title} className="aspect-video w-full object-cover" />
        </div>

        {isEditing ? (
          <div className="space-y-4 rounded-2xl border bg-card p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Titre</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div>
                <Label>Slug</Label>
                <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
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
              <div>
                <Label>Auteur</Label>
                <Input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
              </div>
              <div>
                <Label>Image de couverture (URL)</Label>
                <Input value={form.cover} onChange={(e) => setForm({ ...form, cover: e.target.value })} />
              </div>
              <div>
                <Label>Date de publication</Label>
                <Input type="date" value={form.published_at} onChange={(e) => setForm({ ...form, published_at: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Extrait</Label>
              <Input value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
            </div>
            <div>
              <Label>Contenu</Label>
              <RichTextEditor value={form.body} onChange={(html) => setForm({ ...form, body: html })} placeholder="Rédigez votre article..." />
            </div>
          </div>
        ) : (
          <>
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-full bg-muted px-2 py-0.5">{article.category}</span>
                <span className="text-muted-foreground">par {article.author}</span>
                <span className="text-muted-foreground">· {new Date(article.date).toLocaleDateString("fr-FR")}</span>
              </div>
              <h1 className="mt-3 font-display text-4xl font-bold">{article.title}</h1>
              <p className="mt-2 text-muted-foreground italic">{article.excerpt}</p>
            </div>
            <div className="prose prose-sm max-w-none rounded-2xl border bg-card p-6" dangerouslySetInnerHTML={{ __html: article.body }} />
          </>
        )}
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