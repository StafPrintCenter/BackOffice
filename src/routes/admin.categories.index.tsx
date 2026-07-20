import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { categoriesApi } from "@/api/extra.api";
import { slugify } from "@/api/_helpers";
import type { Category } from "@/types";

export const Route = createFileRoute("/admin/categories/")({
  head: () => ({ meta: [{ title: "Catégories — Admin" }, { name: "robots", content: "noindex" }] }),
  component: AdminCategories,
});

const schema = z.object({
  name: z.string().trim().min(2).max(50),
  slug: z.string().trim().min(2).max(50),
  colorClass: z.string().trim().min(1).max(80),
  isTrainingTheme: z.boolean(),
  isProjectCategory: z.boolean(),
  isArticleCategory: z.boolean(),
});
type FormValues = z.infer<typeof schema>;
const empty: FormValues = { name: "", slug: "", colorClass: "bg-slate-100 text-slate-700", isTrainingTheme: false, isProjectCategory: false, isArticleCategory: false };

function AdminCategories() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["categories"], queryFn: categoriesApi.list });
  const [dialog, setDialog] = useState<{ open: boolean; row?: Category }>({ open: false });
  const [form, setForm] = useState<FormValues>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toDelete, setToDelete] = useState<Category | null>(null);

  const create = useMutation({ mutationFn: (v: FormValues) => categoriesApi.create(v), onSuccess: () => { qc.invalidateQueries({ queryKey: ["categories"] }); toast.success("Créé"); setDialog({ open: false }); } });
  const update = useMutation({ mutationFn: (v: FormValues & { id: string }) => categoriesApi.update(v.id, v), onSuccess: () => { qc.invalidateQueries({ queryKey: ["categories"] }); toast.success("Modifié"); setDialog({ open: false }); } });
  const remove = useMutation({ mutationFn: (id: string) => categoriesApi.remove(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ["categories"] }); toast.success("Supprimé"); setToDelete(null); } });

  const openCreate = () => { setForm(empty); setErrors({}); setDialog({ open: true }); };
  const openEdit = (row: Category) => { setForm({ name: row.name, slug: row.slug, colorClass: row.colorClass, isTrainingTheme: row.isTrainingTheme, isProjectCategory: row.isProjectCategory, isArticleCategory: row.isArticleCategory }); setErrors({}); setDialog({ open: true, row }); };
  const submit = () => {
    const parsed = schema.safeParse(form);
    if (!parsed.success) { const errs: Record<string, string> = {}; parsed.error.issues.forEach((i) => errs[i.path[0] as string] = i.message); setErrors(errs); return; }
    if (dialog.row) update.mutate({ ...parsed.data, id: dialog.row.id }); else create.mutate(parsed.data);
  };

  return (
    <AdminShell>
      <PageHeader title="Catégories" description="Utilisées par formations, projets, articles et FAQ." />
      <DataTable<Category>
        data={data ?? []}
        isLoading={isLoading}
        searchKeys={["name", "slug"]}
        onCreate={openCreate}
        onEdit={openEdit}
        onDelete={(r) => setToDelete(r)}
        columns={[
          { key: "name", label: "Nom", render: (r) => <Link to="/admin/categories/$slug" params={{ slug: r.slug }} className="font-medium hover:underline">{r.name}</Link> },
          { key: "slug", label: "Slug", render: (r) => <code className="text-xs">{r.slug}</code> },
          { key: "colorClass", label: "Couleur", render: (r) => <span className={"inline-flex px-2 py-1 rounded text-xs " + r.colorClass}>{r.name}</span> },
          { key: "flags", label: "Type", render: (r) => (
            <div className="flex flex-wrap gap-1 text-[10px]">
              {r.isTrainingTheme && <span className="rounded bg-primary/10 px-1.5 py-0.5">Formation</span>}
              {r.isProjectCategory && <span className="rounded bg-primary/10 px-1.5 py-0.5">Projet</span>}
              {r.isArticleCategory && <span className="rounded bg-primary/10 px-1.5 py-0.5">Article</span>}
            </div>
          ) },
        ]}
      />

      <Dialog open={dialog.open} onOpenChange={(v) => setDialog({ open: v, row: dialog.row })}>
        <DialogContent>
          <DialogHeader><DialogTitle>{dialog.row ? "Modifier la catégorie" : "Nouvelle catégorie"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Nom</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: form.slug || slugify(e.target.value) })} />{errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}</div>
            <div><Label>Slug</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })} />{errors.slug && <p className="text-xs text-destructive mt-1">{errors.slug}</p>}</div>
            <div><Label>Classe couleur (Tailwind)</Label><Input value={form.colorClass} onChange={(e) => setForm({ ...form, colorClass: e.target.value })} /></div>
            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-lg border p-3"><div><Label className="cursor-pointer">Thème de formation</Label></div><Switch checked={form.isTrainingTheme} onCheckedChange={(v) => setForm({ ...form, isTrainingTheme: v })} /></div>
              <div className="flex items-center justify-between rounded-lg border p-3"><div><Label className="cursor-pointer">Catégorie de projet</Label></div><Switch checked={form.isProjectCategory} onCheckedChange={(v) => setForm({ ...form, isProjectCategory: v })} /></div>
              <div className="flex items-center justify-between rounded-lg border p-3"><div><Label className="cursor-pointer">Catégorie d'article</Label></div><Switch checked={form.isArticleCategory} onCheckedChange={(v) => setForm({ ...form, isArticleCategory: v })} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog({ open: false })}>Annuler</Button>
            <Button onClick={submit}>{dialog.row ? "Enregistrer" : "Créer"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDelete open={!!toDelete} onOpenChange={(v) => !v && setToDelete(null)} onConfirm={() => toDelete && remove.mutate(toDelete.id)} title={`Supprimer "${toDelete?.name}" ?`} />
    </AdminShell>
  );
}
