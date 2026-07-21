import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { AdminShell } from "@/layouts/AdminShell";
import { PageHeader, ConfirmDelete } from "@/components/site/AdminBits";
import { DataTable } from "@/components/admin/DataTable";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { servicesApi } from "@/api/services.api";
import { slugify } from "@/api/_helpers";
import type { Service } from "@/types";

export const Route = createFileRoute("/admin/services/")({
  head: () => ({ meta: [{ title: "Services — Admin" }, { name: "robots", content: "noindex" }] }),
  component: AdminServices,
});

const schema = z.object({
  title: z.string().trim().min(2).max(100),
  slug: z.string().trim().min(2).max(100),
  category: z.string().trim().min(1).max(50),
  shortDescription: z.string().trim().min(2).max(200),
  longDescription: z.string().trim().min(10).max(2000),
  icon: z.string().trim().min(1).max(50),
  color: z.string().trim().min(1).max(20),
  featured: z.boolean(),
});
type FormValues = z.infer<typeof schema>;
const empty: FormValues = { title: "", slug: "", category: "", shortDescription: "", longDescription: "", icon: "Sparkles", color: "#E07856", featured: false };

function AdminServices() {
  const qc = useQueryClient();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({ queryKey: ["services"], queryFn: servicesApi.list });
  const [dialog, setDialog] = useState<{ open: boolean; row?: Service }>({ open: false });
  const [form, setForm] = useState<FormValues>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toDelete, setToDelete] = useState<Service | null>(null);

  const create = useMutation({ mutationFn: (v: FormValues) => servicesApi.create(v), onSuccess: () => { qc.invalidateQueries({ queryKey: ["services"] }); toast.success("Service créé"); setDialog({ open: false }); } });
  const update = useMutation({ mutationFn: (v: FormValues & { id: string }) => servicesApi.update(v.id, v), onSuccess: () => { qc.invalidateQueries({ queryKey: ["services"] }); toast.success("Service modifié"); setDialog({ open: false }); } });
  const remove = useMutation({ mutationFn: (id: string) => servicesApi.remove(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ["services"] }); toast.success("Service supprimé"); setToDelete(null); } });

  const openCreate = () => { setForm(empty); setErrors({}); setDialog({ open: true }); };
  const openEdit = (row: Service) => { setForm({ title: row.title, slug: row.slug, category: row.category, shortDescription: row.shortDescription, longDescription: row.longDescription, icon: row.icon, color: row.color, featured: row.featured }); setErrors({}); setDialog({ open: true, row }); };

  const submit = () => {
    const parsed = schema.safeParse({ ...form, slug: form.slug || slugify(form.title) });
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => { errs[i.path[0] as string] = i.message; });
      setErrors(errs);
      return;
    }
    if (dialog.row) update.mutate({ ...parsed.data, id: dialog.row.id });
    else create.mutate(parsed.data);
  };

  return (
    <AdminShell>
      <PageHeader title="Services" description="Gérez les prestations affichées sur le site." />
      <DataTable<Service>
        data={data ?? []}
        isLoading={isLoading}
        searchKeys={["title", "category"]}
        onCreate={openCreate}
        onView={(r) => navigate({ to: "/admin/services/$slug", params: { slug: r.slug } })}
        onEdit={openEdit}
        onDelete={(r) => setToDelete(r)}

        columns={[
          { key: "title", label: "Titre", render: (r) => <div><div className="font-medium">{r.title}</div><div className="text-xs text-muted-foreground">{r.slug}</div></div> },
          { key: "category", label: "Catégorie" },
          { key: "featured", label: "En vedette", render: (r) => r.featured ? <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">Oui</span> : <span className="text-xs text-muted-foreground">—</span> },
          { key: "shortDescription", label: "Description", render: (r) => <div className="max-w-md text-muted-foreground line-clamp-1">{r.shortDescription}</div> },
        ]}
      />

      <Dialog open={dialog.open} onOpenChange={(v) => setDialog({ open: v, row: dialog.row })}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{dialog.row ? "Modifier le service" : "Nouveau service"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label>Titre</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value, slug: form.slug || slugify(e.target.value) })} />{errors.title && <p className="text-xs text-destructive mt-1">{errors.title}</p>}</div>
              <div><Label>Slug</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />{errors.slug && <p className="text-xs text-destructive mt-1">{errors.slug}</p>}</div>
              <div><Label>Catégorie</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />{errors.category && <p className="text-xs text-destructive mt-1">{errors.category}</p>}</div>
              <div><Label>Icône (lucide)</Label><Input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="Palette" /></div>
              <div><Label>Couleur (hex)</Label><Input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} /></div>
              <div className="flex items-end gap-3"><Label className="mb-2">En vedette</Label><Switch checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v })} /></div>
            </div>
            <div><Label>Description courte</Label><Input value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} />{errors.shortDescription && <p className="text-xs text-destructive mt-1">{errors.shortDescription}</p>}</div>
            <div><Label>Description longue</Label><Textarea rows={5} value={form.longDescription} onChange={(e) => setForm({ ...form, longDescription: e.target.value })} />{errors.longDescription && <p className="text-xs text-destructive mt-1">{errors.longDescription}</p>}</div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog({ open: false })}>Annuler</Button>
            <Button onClick={submit} disabled={create.isPending || update.isPending}>{dialog.row ? "Enregistrer" : "Créer"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDelete open={!!toDelete} onOpenChange={(v) => !v && setToDelete(null)} onConfirm={() => toDelete && remove.mutate(toDelete.id)} title={`Supprimer "${toDelete?.title}" ?`} />
    </AdminShell>
  );
}
