import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { AdminShell, PageHeader, ConfirmDelete, DataTable } from "@/components/site";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { shortLinksApi } from "@/api/extra.api";
import type { ShortLink } from "@/types";

export const Route = createFileRoute("/admin/short-links/")({
  head: () => ({ meta: [{ title: "Liens courts — Admin" }, { name: "robots", content: "noindex" }] }),
  component: AdminShortLinks,
});

const schema = z.object({
  longUrl: z.string().url(),
  alias: z.string().trim().min(2).max(30),
  category: z.string().trim().min(1),
  activateAt: z.string().min(1),
  expiresAt: z.string().min(1),
  isActive: z.boolean(),
});
type FormValues = z.infer<typeof schema>;
const empty: FormValues = { longUrl: "", alias: "", category: "", activateAt: new Date().toISOString().slice(0, 10), expiresAt: new Date(Date.now() + 365 * 864e5).toISOString().slice(0, 10), isActive: true };

function AdminShortLinks() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["short-links"], queryFn: shortLinksApi.list });
  const [dialog, setDialog] = useState<{ open: boolean; row?: ShortLink }>({ open: false });
  const [form, setForm] = useState<FormValues>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toDelete, setToDelete] = useState<ShortLink | null>(null);

  const create = useMutation({
    mutationFn: (v: FormValues) => shortLinksApi.create({ ...v, longUrlHash: Math.random().toString(36).slice(2, 8), createdBy: "admin@stafprint.com", clicksCount: 0 }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["short-links"] }); toast.success("Créé"); setDialog({ open: false }); },
  });
  const update = useMutation({ mutationFn: (v: FormValues & { id: string }) => shortLinksApi.update(v.id, v), onSuccess: () => { qc.invalidateQueries({ queryKey: ["short-links"] }); toast.success("Modifié"); setDialog({ open: false }); } });
  const remove = useMutation({ mutationFn: (id: string) => shortLinksApi.remove(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ["short-links"] }); toast.success("Supprimé"); setToDelete(null); } });

  const openCreate = () => { setForm(empty); setErrors({}); setDialog({ open: true }); };
  const openEdit = (row: ShortLink) => { setForm({ longUrl: row.longUrl, alias: row.alias, category: row.category, activateAt: row.activateAt.slice(0, 10), expiresAt: row.expiresAt.slice(0, 10), isActive: row.isActive }); setErrors({}); setDialog({ open: true, row }); };
  const submit = () => {
    const parsed = schema.safeParse(form);
    if (!parsed.success) { const errs: Record<string, string> = {}; parsed.error.issues.forEach((i) => errs[i.path[0] as string] = i.message); setErrors(errs); return; }
    if (dialog.row) update.mutate({ ...parsed.data, id: dialog.row.id }); else create.mutate(parsed.data);
  };

  return (
    <AdminShell>
      <PageHeader title="Liens courts" description="Redirections trackées avec statistiques de clics." />
      <DataTable<ShortLink>
        data={data ?? []}
        isLoading={isLoading}
        searchKeys={["alias", "longUrl", "category"]}
        onCreate={openCreate}
        onEdit={openEdit}
        onDelete={(r) => setToDelete(r)}
        columns={[
          { key: "alias", label: "Alias", render: (r) => <Link to="/admin/shortlinks/$id" params={{ id: r.id }} className="font-mono text-xs font-medium text-primary hover:underline">/{r.alias}</Link> },
          { key: "longUrl", label: "URL cible", render: (r) => <a href={r.longUrl} target="_blank" rel="noreferrer" className="text-xs text-muted-foreground line-clamp-1 max-w-xs hover:underline">{r.longUrl}</a> },
          { key: "category", label: "Catégorie" },
          { key: "clicksCount", label: "Clics", render: (r) => <b>{r.clicksCount}</b> },
          { key: "isActive", label: "Statut", render: (r) => <span className={"text-xs rounded-full px-2 py-0.5 " + (r.isActive ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground")}>{r.isActive ? "Actif" : "Inactif"}</span> },
        ]}
      />

      <Dialog open={dialog.open} onOpenChange={(v) => setDialog({ open: v, row: dialog.row })}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>{dialog.row ? "Modifier le lien" : "Nouveau lien court"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>URL longue</Label><Input value={form.longUrl} onChange={(e) => setForm({ ...form, longUrl: e.target.value })} />{errors.longUrl && <p className="text-xs text-destructive mt-1">{errors.longUrl}</p>}</div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label>Alias</Label><Input value={form.alias} onChange={(e) => setForm({ ...form, alias: e.target.value })} /></div>
              <div><Label>Catégorie</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
              <div><Label>Activation</Label><Input type="date" value={form.activateAt} onChange={(e) => setForm({ ...form, activateAt: e.target.value })} /></div>
              <div><Label>Expiration</Label><Input type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} /></div>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3"><Label>Actif</Label><Switch checked={form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: v })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog({ open: false })}>Annuler</Button>
            <Button onClick={submit}>{dialog.row ? "Enregistrer" : "Créer"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDelete open={!!toDelete} onOpenChange={(v) => !v && setToDelete(null)} onConfirm={() => toDelete && remove.mutate(toDelete.id)} title={`Supprimer "${toDelete?.alias}" ?`} />
    </AdminShell>
  );
}
