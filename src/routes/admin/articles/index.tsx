import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { AdminShell } from "@/layouts/AdminShell";
import { PageHeader, ConfirmDelete } from "@/components/admin/AdminBits";
import { DataTable } from "@/components/admin/DataTable";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAdminArticlesList, useCreateAdminArticle, useDeleteAdminArticle } from "@/stores/useAdminArticlesStore";
import { useAdminCategoriesList } from "@/stores/useAdminCategoriesStore";
import type { APIAdminArticleListItem, AdminArticlePayload } from "@/data/admin-articles";

export const Route = createFileRoute("/admin/articles/")({
  head: () => ({ meta: [{ title: "Articles — Admin" }, { name: "robots", content: "noindex" }] }),
  component: AdminArticles,
});

const schema = z.object({
  title: z.string().trim().min(2).max(150),
  slug: z.string().trim().max(150).optional(),
  body: z.string().trim().min(10),
  excerpt: z.string().trim().min(2).max(300),
  author: z.string().trim().min(1).max(80),
  category_id: z.string().trim().min(1, "Choisissez une catégorie"),
  cover: z.string().trim().url(),
  published_at: z.string().trim().min(1),
});
type FormValues = z.infer<typeof schema>;
const empty: FormValues = {
  title: "", slug: "", body: "", excerpt: "", author: "", category_id: "", cover: "",
  published_at: new Date().toISOString().slice(0, 10),
};

function AdminArticles() {
  const navigate = useNavigate();
  const { items, isLoading } = useAdminArticlesList({ perPage: 100 });
  const { items: categories } = useAdminCategoriesList({ perPage: 100 });

  const createMutation = useCreateAdminArticle();
  const removeMutation = useDeleteAdminArticle();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormValues>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toDelete, setToDelete] = useState<APIAdminArticleListItem | null>(null);

  const openCreate = () => { setForm(empty); setErrors({}); setOpen(true); };

  const submit = () => {
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => { errs[i.path[0] as string] = i.message; });
      setErrors(errs);
      return;
    }
    createMutation.mutate(parsed.data as AdminArticlePayload, {
      onSuccess: () => { toast.success("Article créé"); setOpen(false); },
      onError: () => toast.error("Erreur lors de la création"),
    });
  };

  return (
    <AdminShell>
      <PageHeader title="Articles" description="Blog du site." />
      <DataTable<APIAdminArticleListItem>
        data={items}
        isLoading={isLoading}
        searchKeys={["title", "category", "author"]}
        onCreate={openCreate}
        onView={(r) => navigate({ to: "/admin/articles/$id", params: { id: r.id } })}
        onDelete={(r) => setToDelete(r)}
        columns={[
          { key: "cover", label: "", render: (r) => <img src={r.cover} alt="" className="h-10 w-14 rounded object-cover" /> },
          { key: "title", label: "Titre", render: (r) => <div><div className="font-medium">{r.title}</div><div className="text-xs text-muted-foreground">{r.slug}</div></div> },
          { key: "category", label: "Catégorie" },
          { key: "author", label: "Auteur" },
          { key: "date", label: "Publié", render: (r) => new Date(r.date).toLocaleDateString("fr-FR") },
        ]}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Nouvel article</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Titre</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                {errors.title && <p className="text-xs text-destructive mt-1">{errors.title}</p>}
              </div>
              <div>
                <Label>Slug (optionnel — auto-généré sinon)</Label>
                <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
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
              <div>
                <Label>Auteur</Label>
                <Input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
                {errors.author && <p className="text-xs text-destructive mt-1">{errors.author}</p>}
              </div>
              <div>
                <Label>Image de couverture (URL)</Label>
                <Input value={form.cover} onChange={(e) => setForm({ ...form, cover: e.target.value })} />
                {errors.cover && <p className="text-xs text-destructive mt-1">{errors.cover}</p>}
              </div>
              <div>
                <Label>Date de publication</Label>
                <Input type="date" value={form.published_at} onChange={(e) => setForm({ ...form, published_at: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Extrait</Label>
              <Input value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
              {errors.excerpt && <p className="text-xs text-destructive mt-1">{errors.excerpt}</p>}
            </div>
            <div>
              <Label>Contenu HTML</Label>
              <Textarea rows={12} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} className="font-mono text-xs" placeholder="<p>Votre article...</p>" />
              {errors.body && <p className="text-xs text-destructive mt-1">{errors.body}</p>}
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
            onSuccess: () => { toast.success("Article supprimé"); setToDelete(null); },
            onError: () => toast.error("Erreur lors de la suppression"),
          });
        }}
        title={`Supprimer "${toDelete?.title}" ?`}
      />
    </AdminShell>
  );
}