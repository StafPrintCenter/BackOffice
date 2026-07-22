import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { AdminShell, PageHeader, ConfirmDelete, DataTable } from "@/components/site";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdminStatsList, useCreateAdminStat, useDeleteAdminStat } from "@/stores/useStatsStore";
import { STAT_KEYS, type APIAdminStat, type AdminStatPayload, type StatKeyType } from "@/data/stats";
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
  key: z.enum(["projects", "clients", "experience", "trainings"], {
    message: "Choisissez une clé valide",
  }),
  value: z.number().min(0),
  suffix: z.string().max(10),
  label: z.string().trim().min(2).max(80),
});

type FormValues = z.infer<typeof schema>;
const empty: FormValues = { key: "projects", value: 0, suffix: "", label: "" };

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
          { key: "key", label: "Clé", render: (r) => <code className="font-mono text-xs font-medium text-primary">{r.key}</code> },
          { key: "label", label: "Libellé", render: (r) => <div className="font-medium">{r.label}</div> },
          { key: "value", label: "Valeur", render: (r) => <span className="font-display text-lg font-bold text-primary">{r.value}{r.suffix}</span> },
        ]}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nouvelle statistique</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Libellé</Label>
              <Input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="ex: Projets réalisés" />
              {errors.label && <p className="text-xs text-destructive mt-1">{errors.label}</p>}
            </div>

            <div>
              <Label>Clé de statistique</Label>
              <Select value={form.key} onValueChange={(v) => setForm({ ...form, key: v as StatKeyType })}>
                <SelectTrigger><SelectValue placeholder="Choisir une clé" /></SelectTrigger>
                <SelectContent>
                  {STAT_KEYS.map((k) => (
                    <SelectItem key={k.value} value={k.value}>{k.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.key && <p className="text-xs text-destructive mt-1">{errors.key}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Valeur</Label>
                <Input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} />
                {errors.value && <p className="text-xs text-destructive mt-1">{errors.value}</p>}
              </div>
              <div>
                <Label>Suffixe</Label>
                <Input value={form.suffix} onChange={(e) => setForm({ ...form, suffix: e.target.value })} placeholder="ex: +, %, ans" />
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
