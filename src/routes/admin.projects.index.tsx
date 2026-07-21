import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { AdminShell } from "@/layouts/AdminShell";
import { PageHeader, ConfirmDelete } from "@/components/site/AdminBits";
import { DataTable } from "@/components/site/DataTable";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { projectsApi } from "@/api/projects.api";
import type { Project } from "@/types";

export const Route = createFileRoute("/admin/projects/")({
  head: () => ({ meta: [{ title: "Projets — Admin" }, { name: "robots", content: "noindex" }] }),
  component: AdminProjects,
});

const schema = z.object({
  title: z.string().trim().min(2).max(120),
  imageUrl: z.string().trim().url("URL image invalide"),
  category: z.string().trim().min(1).max(50),
  client: z.string().trim().min(1).max(100),
  description: z.string().trim().min(10).max(2000),
  year: z.number().min(2000).max(2100),
});
type FormValues = z.infer<typeof schema>;
const empty: FormValues = { title: "", imageUrl: "", category: "", client: "", description: "", year: new Date().getFullYear() };

function AdminProjects() {
  const qc = useQueryClient();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({ queryKey: ["projects"], queryFn: projectsApi.list });
  const [dialog, setDialog] = useState<{ open: boolean; row?: Project }>({ open: false });
  const [form, setForm] = useState<FormValues>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toDelete, setToDelete] = useState<Project | null>(null);

  const create = useMutation({ mutationFn: (v: FormValues) => projectsApi.create(v), onSuccess: () => { qc.invalidateQueries({ queryKey: ["projects"] }); toast.success("Projet créé"); setDialog({ open: false }); } });
  const update = useMutation({ mutationFn: (v: FormValues & { id: string }) => projectsApi.update(v.id, v), onSuccess: () => { qc.invalidateQueries({ queryKey: ["projects"] }); toast.success("Projet modifié"); setDialog({ open: false }); } });
  const remove = useMutation({ mutationFn: (id: string) => projectsApi.remove(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ["projects"] }); toast.success("Supprimé"); setToDelete(null); } });

  const openCreate = () => { setForm(empty); setErrors({}); setDialog({ open: true }); };
  const openEdit = (row: Project) => { setForm({ title: row.title, imageUrl: row.imageUrl, category: row.category, client: row.client, description: row.description, year: row.year }); setErrors({}); setDialog({ open: true, row }); };
  const submit = () => {
    const parsed = schema.safeParse(form);
    if (!parsed.success) { const errs: Record<string, string> = {}; parsed.error.issues.forEach((i) => errs[i.path[0] as string] = i.message); setErrors(errs); return; }
    if (dialog.row) update.mutate({ ...parsed.data, id: dialog.row.id }); else create.mutate(parsed.data);
  };

  return (
    <AdminShell>
      <PageHeader title="Projets" description="Portfolio public." />
      <DataTable<Project>
        data={data ?? []}
        isLoading={isLoading}
        searchKeys={["title", "client", "category"]}
        onCreate={openCreate}
        onView={(r) => navigate({ to: "/admin/projects/$id", params: { id: r.id } })}
        onEdit={openEdit}
        onDelete={(r) => setToDelete(r)}

        columns={[
          { key: "imageUrl", label: "", render: (r) => <img src={r.imageUrl} alt="" className="h-10 w-14 rounded object-cover" /> },
          { key: "title", label: "Titre", render: (r) => <div className="font-medium">{r.title}</div> },
          { key: "category", label: "Catégorie" },
          { key: "client", label: "Client" },
          { key: "year", label: "Année" },
        ]}
      />

      <Dialog open={dialog.open} onOpenChange={(v) => setDialog({ open: v, row: dialog.row })}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{dialog.row ? "Modifier le projet" : "Nouveau projet"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Titre</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />{errors.title && <p className="text-xs text-destructive mt-1">{errors.title}</p>}</div>
            <div><Label>URL image</Label><Input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />{errors.imageUrl && <p className="text-xs text-destructive mt-1">{errors.imageUrl}</p>}</div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div><Label>Catégorie</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
              <div><Label>Client</Label><Input value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} /></div>
              <div><Label>Année</Label><Input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: Number(e.target.value) })} /></div>
            </div>
            <div><Label>Description</Label><Textarea rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />{errors.description && <p className="text-xs text-destructive mt-1">{errors.description}</p>}</div>
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
