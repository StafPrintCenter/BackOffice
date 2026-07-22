import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { AdminShell, PageHeader, ConfirmDelete, DataTable } from "@/components/site";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAdminStatsList, useCreateAdminStat, useDeleteAdminStat } from "@/stores/useStatsStore";
import type { APIAdminStat, AdminStatPayload } from "@/data/stats";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/admin/stats/")({
  head: () => ({
    meta: [
      { title: `Statistiques | ${SITE.name}` },
      { name: "robots", content: "noindex" }]
  }),
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
  const navigate = useNavigate();
  const { items, isLoading } = useAdminStatsList({ perPage: 100 });

  const createMutation = useCreateAdminStat();
  const removeMutation = useDeleteAdminStat();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormValues>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toDelete, setToDelete] = useState<APIAdminStat | null>(null);

  const openCreate = () => { setForm(empty); setErrors({}); setOpen(true); };

  const submit = () => {
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => { errs[i.path[0] as string] = i.message; });
      setErrors(errs);
      return;
    }
    createMutation.mutate(parsed.data as AdminStatPayload, {
      onSuccess: () => { toast.success("Statistique créée"); setOpen(false); },
      onError: () => toast.error("Erreur lors de la création"),
    });
  };

  return (
    <AdminShell>
      <PageHeader title="Statistiques vitrine" description="Chiffres affichés en front (projets, clients, années...)." />
      <DataTable<APIAdminStat>
        data={items}
        isLoading={isLoading}
        searchKeys={["key", "label"]}
        onCreate={openCreate}
        onView={(r) => navigate({ to: "/admin/stats/$id", params: { id: r.id } })}
        onDelete={(r) => setToDelete(r)}
        columns={[
          { key: "label", label: "Libellé", render: (r) => <div className="font-medium">{r.label}</div> },
          { key: "value", label: "Valeur", render: (r) => <span className="font-display text-lg font-bold text-primary">{r.value}{r.suffix}</span> },
          { key: "key", label: "Clé", render: (r) => <code className="text-xs">{r.key}</code> },
        ]}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nouvelle statistique</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Libellé</Label>
              <Input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
              {errors.label && <p className="text-xs text-destructive mt-1">{errors.label}</p>}
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="sm:col-span-1">
                <Label>Valeur</Label>
                <Input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} />
                {errors.value && <p className="text-xs text-destructive mt-1">{errors.value}</p>}
              </div>
              <div className="sm:col-span-1">
                <Label>Suffixe</Label>
                <Input value={form.suffix} onChange={(e) => setForm({ ...form, suffix: e.target.value })} placeholder="+" />
              </div>
              <div className="sm:col-span-1">
                <Label>Clé (unique)</Label>
                <Input value={form.key} onChange={(e) => setForm({ ...form, key: e.target.value })} />
                {errors.key && <p className="text-xs text-destructive mt-1">{errors.key}</p>}
              </div>
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
            onSuccess: () => { toast.success("Statistique supprimée"); setToDelete(null); },
            onError: () => toast.error("Erreur lors de la suppression"),
          });
        }}
        title={`Supprimer "${toDelete?.label}" ?`}
      />
    </AdminShell>
  );
}
