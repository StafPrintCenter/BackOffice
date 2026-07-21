import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { articlesApi } from "@/api/articles.api";
import { slugify } from "@/api/_helpers";
import type { Article } from "@/types";

export const Route = createFileRoute("/admin/articles/")({
  head: () => ({ meta: [{ title: "Articles — Admin" }, { name: "robots", content: "noindex" }] }),
  component: AdminArticles,
});

const schema = z.object({
  title: z.string().trim().min(2).max(150),
  slug: z.string().trim().min(2).max(150),
  htmlContent: z.string().trim().min(10),
  excerpt: z.string().trim().min(2).max(300),
  author: z.string().trim().min(1).max(80),
  category: z.string().trim().min(1).max(50),
  coverImage: z.string().trim().url(),
  publishedAt: z.string().trim().min(1),
});
type FormValues = z.infer<typeof schema>;
const empty: FormValues = { title: "", slug: "", htmlContent: "", excerpt: "", author: "Staf Print", category: "", coverImage: "", publishedAt: new Date().toISOString().slice(0, 10) };

function AdminArticles() {
  const qc = useQueryClient();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({ queryKey: ["articles"], queryFn: articlesApi.list });
  const [dialog, setDialog] = useState<{ open: boolean; row?: Article }>({ open: false });
  const [form, setForm] = useState<FormValues>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toDelete, setToDelete] = useState<Article | null>(null);

  const create = useMutation({ mutationFn: (v: FormValues) => articlesApi.create(v), onSuccess: () => { qc.invalidateQueries({ queryKey: ["articles"] }); toast.success("Article créé"); setDialog({ open: false }); } });
  const update = useMutation({ mutationFn: (v: FormValues & { id: string }) => articlesApi.update(v.id, v), onSuccess: () => { qc.invalidateQueries({ queryKey: ["articles"] }); toast.success("Article modifié"); setDialog({ open: false }); } });
  const remove = useMutation({ mutationFn: (id: string) => articlesApi.remove(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ["articles"] }); toast.success("Supprimé"); setToDelete(null); } });

  const openCreate = () => { setForm(empty); setErrors({}); setDialog({ open: true }); };
  const openEdit = (row: Article) => { setForm({ title: row.title, slug: row.slug, htmlContent: row.htmlContent, excerpt: row.excerpt, author: row.author, category: row.category, coverImage: row.coverImage, publishedAt: row.publishedAt.slice(0, 10) }); setErrors({}); setDialog({ open: true, row }); };

  const submit = () => {
    const parsed = schema.safeParse({ ...form, slug: form.slug || slugify(form.title) });
    if (!parsed.success) { const errs: Record<string, string> = {}; parsed.error.issues.forEach((i) => errs[i.path[0] as string] = i.message); setErrors(errs); return; }
    if (dialog.row) update.mutate({ ...parsed.data, id: dialog.row.id }); else create.mutate(parsed.data);
  };

  return (
    <AdminShell>
      <PageHeader title="Articles" description="Blog du site." />
      <DataTable<Article>
        data={data ?? []}
        isLoading={isLoading}
        searchKeys={["title", "category", "author"]}
        onCreate={openCreate}
        onView={(r) => navigate({ to: "/admin/articles/$slug", params: { slug: r.slug } })}
        onEdit={openEdit}
        onDelete={(r) => setToDelete(r)}

        columns={[
          { key: "coverImage", label: "", render: (r) => <img src={r.coverImage} alt="" className="h-10 w-14 rounded object-cover" /> },
          { key: "title", label: "Titre", render: (r) => <div><div className="font-medium">{r.title}</div><div className="text-xs text-muted-foreground">{r.slug}</div></div> },
          { key: "category", label: "Catégorie" },
          { key: "author", label: "Auteur" },
          { key: "publishedAt", label: "Publié", render: (r) => new Date(r.publishedAt).toLocaleDateString("fr-FR") },
        ]}
      />

      <Dialog open={dialog.open} onOpenChange={(v) => setDialog({ open: v, row: dialog.row })}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{dialog.row ? "Modifier l'article" : "Nouvel article"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label>Titre</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value, slug: form.slug || slugify(e.target.value) })} />{errors.title && <p className="text-xs text-destructive mt-1">{errors.title}</p>}</div>
              <div><Label>Slug</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></div>
              <div><Label>Catégorie</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
              <div><Label>Auteur</Label><Input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} /></div>
              <div><Label>Image de couverture (URL)</Label><Input value={form.coverImage} onChange={(e) => setForm({ ...form, coverImage: e.target.value })} />{errors.coverImage && <p className="text-xs text-destructive mt-1">{errors.coverImage}</p>}</div>
              <div><Label>Date de publication</Label><Input type="date" value={form.publishedAt} onChange={(e) => setForm({ ...form, publishedAt: e.target.value })} /></div>
            </div>
            <div><Label>Extrait</Label><Input value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} /></div>
            <div>
              <Label>Contenu HTML</Label>
              <Textarea rows={12} value={form.htmlContent} onChange={(e) => setForm({ ...form, htmlContent: e.target.value })} className="font-mono text-xs" placeholder="<p>Votre article...</p>" />
              {errors.htmlContent && <p className="text-xs text-destructive mt-1">{errors.htmlContent}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog({ open: false })}>Annuler</Button>
            <Button onClick={submit}>{dialog.row ? "Enregistrer" : "Créer"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDelete open={!!toDelete} onOpenChange={(v) => !v && setToDelete(null)} onConfirm={() => toDelete && remove.mutate(toDelete.id)} title={`Supprimer "${toDelete?.title}" ?`} />
    </AdminShell>
  );
}
