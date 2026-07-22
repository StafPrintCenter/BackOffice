import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { AdminShell, PageHeader, ConfirmDelete, DataTable } from "@/components/site";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { statsApi } from "@/api/extra.api";
import type { Stat } from "@/types";

export const Route = createFileRoute("/admin/stats/admin/stats/")({
  head: () => ({ meta: [{ title: "Statistiques — Admin" }, { name: "robots", content: "noindex" }] }),
  component: AdminStats,
});

const schema = z.object({
  key: z.string().trim().min(2).max(50),
  value: z.number().min(0),
  suffix: z.string().max(10),
  label: z.string().trim().min(2).max(80),
});
type FormValues = z.infer<typeof schema>;
const empty: FormValues = { key: "", value: 0, suffix: "", label: "" };

function AdminStats() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["stats"], queryFn: statsApi.list });
  const [dialog, setDialog] = useState<{ open: boolean; row?: Stat }>({ open: false });
  const [form, setForm] = useState<FormValues>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toDelete, setToDelete] = useState<Stat | null>(null);

  const create = useMutation({ mutationFn: (v: FormValues) => statsApi.create(v), onSuccess: () => { qc.invalidateQueries({ queryKey: ["stats"] }); toast.success("Créé"); setDialog({ open: false }); } });
  const update = useMutation({ mutationFn: (v: FormValues & { id: string }) => statsApi.update(v.id, v), onSuccess: () => { qc.invalidateQueries({ queryKey: ["stats"] }); toast.success("Modifié"); setDialog({ open: false }); } });
  const remove = useMutation({ mutationFn: (id: string) => statsApi.remove(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ["stats"] }); toast.success("Supprimé"); setToDelete(null); } });

  const openCreate = () => { setForm(empty); setErrors({}); setDialog({ open: true }); };
  const openEdit = (row: Stat) => { setForm({ key: row.key, value: row.value, suffix: row.suffix, label: row.label }); setErrors({}); setDialog({ open: true, row }); };
  const submit = () => {
    const parsed = schema.safeParse(form);
    if (!parsed.success) { const errs: Record<string, string> = {}; parsed.error.issues.forEach((i) => errs[i.path[0] as string] = i.message); setErrors(errs); return; }
    if (dialog.row) update.mutate({ ...parsed.data, id: dialog.row.id }); else create.mutate(parsed.data);
  };

  return (
    <AdminShell>
      <PageHeader title="Statistiques vitrine" description="Chiffres affichés en front (projets, clients, années...)" />
      <DataTable<Stat>
        data={data ?? []}
        isLoading={isLoading}
        searchKeys={["key", "label"]}
        onCreate={openCreate}
        onEdit={openEdit}
        onDelete={(r) => setToDelete(r)}
        columns={[
          { key: "label", label: "Libellé", render: (r) => <div className="font-medium">{r.label}</div> },
          { key: "value", label: "Valeur", render: (r) => <span className="font-display text-lg font-bold text-primary">{r.value}{r.suffix}</span> },
          { key: "key", label: "Clé", render: (r) => <code className="text-xs">{r.key}</code> },
        ]}
      />

      <Dialog open={dialog.open} onOpenChange={(v) => setDialog({ open: v, row: dialog.row })}>
        <DialogContent>
          <DialogHeader><DialogTitle>{dialog.row ? "Modifier la statistique" : "Nouvelle statistique"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Libellé</Label><Input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />{errors.label && <p className="text-xs text-destructive mt-1">{errors.label}</p>}</div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="sm:col-span-1"><Label>Valeur</Label><Input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} /></div>
              <div className="sm:col-span-1"><Label>Suffixe</Label><Input value={form.suffix} onChange={(e) => setForm({ ...form, suffix: e.target.value })} placeholder="+" /></div>
              <div className="sm:col-span-1"><Label>Clé (unique)</Label><Input value={form.key} onChange={(e) => setForm({ ...form, key: e.target.value })} />{errors.key && <p className="text-xs text-destructive mt-1">{errors.key}</p>}</div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog({ open: false })}>Annuler</Button>
            <Button onClick={submit}>{dialog.row ? "Enregistrer" : "Créer"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDelete open={!!toDelete} onOpenChange={(v) => !v && setToDelete(null)} onConfirm={() => toDelete && remove.mutate(toDelete.id)} title={`Supprimer "${toDelete?.label}" ?`} />
    </AdminShell>
  );
}
