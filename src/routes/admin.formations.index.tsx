import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Plus, Trash2 } from "lucide-react";
import { AdminShell } from "@/layouts/AdminShell";
import { PageHeader, ConfirmDelete } from "@/components/site/AdminBits";
import { DataTable } from "@/components/site/DataTable";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formationsApi } from "@/api/formations.api";
import type { Formation, FormationModule } from "@/types";

export const Route = createFileRoute("/admin/formations/")({
  head: () => ({ meta: [{ title: "Formations — Admin" }, { name: "robots", content: "noindex" }] }),
  component: AdminFormations,
});

const schema = z.object({
  title: z.string().trim().min(2).max(120),
  theme: z.string().trim().min(1).max(50),
  duration: z.string().trim().min(1).max(50),
  level: z.enum(["Débutant", "Intermédiaire", "Avancé"]),
  price: z.number().min(0),
  objectives: z.array(z.string().trim().min(1)).min(1),
  program: z.array(z.object({ title: z.string().min(1), lessons: z.array(z.string().min(1)) })).min(1),
});
type FormValues = z.infer<typeof schema>;
const empty: FormValues = { title: "", theme: "", duration: "", level: "Débutant", price: 0, objectives: [""], program: [{ title: "", lessons: [""] }] };

function AdminFormations() {
  const qc = useQueryClient();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({ queryKey: ["formations"], queryFn: formationsApi.list });
  const [dialog, setDialog] = useState<{ open: boolean; row?: Formation }>({ open: false });
  const [form, setForm] = useState<FormValues>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toDelete, setToDelete] = useState<Formation | null>(null);

  const create = useMutation({ mutationFn: (v: FormValues) => formationsApi.create(v), onSuccess: () => { qc.invalidateQueries({ queryKey: ["formations"] }); toast.success("Formation créée"); setDialog({ open: false }); } });
  const update = useMutation({ mutationFn: (v: FormValues & { id: string }) => formationsApi.update(v.id, v), onSuccess: () => { qc.invalidateQueries({ queryKey: ["formations"] }); toast.success("Formation modifiée"); setDialog({ open: false }); } });
  const remove = useMutation({ mutationFn: (id: string) => formationsApi.remove(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ["formations"] }); toast.success("Supprimée"); setToDelete(null); } });

  const openCreate = () => { setForm(empty); setErrors({}); setDialog({ open: true }); };
  const openEdit = (row: Formation) => {
    setForm({ title: row.title, theme: row.theme, duration: row.duration, level: row.level, price: row.price, objectives: [...row.objectives], program: row.program.map((m) => ({ title: m.title, lessons: [...m.lessons] })) });
    setErrors({}); setDialog({ open: true, row });
  };

  const submit = () => {
    const cleaned = { ...form, objectives: form.objectives.filter((o) => o.trim()), program: form.program.filter((m) => m.title.trim()).map((m) => ({ ...m, lessons: m.lessons.filter((l) => l.trim()) })) };
    const parsed = schema.safeParse(cleaned);
    if (!parsed.success) { const errs: Record<string, string> = {}; parsed.error.issues.forEach((i) => { errs[i.path[0] as string] = i.message; }); setErrors(errs); return; }
    if (dialog.row) update.mutate({ ...parsed.data, id: dialog.row.id }); else create.mutate(parsed.data);
  };

  return (
    <AdminShell>
      <PageHeader title="Formations" description="Programmes proposés au public." />
      <DataTable<Formation>
        data={data ?? []}
        isLoading={isLoading}
        searchKeys={["title", "theme"]}
        onCreate={openCreate}
        onView={(r) => navigate({ to: "/admin/formations/$id", params: { id: r.id } })}
        onEdit={openEdit}
        onDelete={(r) => setToDelete(r)}

        columns={[
          { key: "title", label: "Titre", render: (r) => <div className="font-medium">{r.title}</div> },
          { key: "theme", label: "Thème" },
          { key: "level", label: "Niveau" },
          { key: "duration", label: "Durée" },
          { key: "price", label: "Prix", render: (r) => <span className="font-semibold">{r.price.toLocaleString()} FCFA</span> },
        ]}
      />

      <Dialog open={dialog.open} onOpenChange={(v) => setDialog({ open: v, row: dialog.row })}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{dialog.row ? "Modifier la formation" : "Nouvelle formation"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2"><Label>Titre</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />{errors.title && <p className="text-xs text-destructive mt-1">{errors.title}</p>}</div>
              <div><Label>Thème</Label><Input value={form.theme} onChange={(e) => setForm({ ...form, theme: e.target.value })} /></div>
              <div><Label>Durée</Label><Input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="ex: 3 mois" /></div>
              <div>
                <Label>Niveau</Label>
                <Select value={form.level} onValueChange={(v) => setForm({ ...form, level: v as FormValues["level"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Débutant">Débutant</SelectItem>
                    <SelectItem value="Intermédiaire">Intermédiaire</SelectItem>
                    <SelectItem value="Avancé">Avancé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Prix (FCFA)</Label><Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} /></div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label>Objectifs</Label>
                <Button variant="outline" size="sm" onClick={() => setForm({ ...form, objectives: [...form.objectives, ""] })}><Plus className="h-3 w-3 mr-1" /> Ajouter</Button>
              </div>
              <div className="mt-2 space-y-2">
                {form.objectives.map((o, i) => (
                  <div key={i} className="flex gap-2">
                    <Input value={o} onChange={(e) => { const arr = [...form.objectives]; arr[i] = e.target.value; setForm({ ...form, objectives: arr }); }} />
                    <Button variant="outline" size="icon" onClick={() => setForm({ ...form, objectives: form.objectives.filter((_, idx) => idx !== i) })}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label>Programme (modules)</Label>
                <Button variant="outline" size="sm" onClick={() => setForm({ ...form, program: [...form.program, { title: "", lessons: [""] }] })}><Plus className="h-3 w-3 mr-1" /> Module</Button>
              </div>
              <div className="mt-2 space-y-3">
                {form.program.map((m: FormationModule, mi: number) => (
                  <div key={mi} className="rounded-lg border p-3 space-y-2">
                    <div className="flex gap-2">
                      <Input placeholder="Titre du module" value={m.title} onChange={(e) => { const arr = [...form.program]; arr[mi] = { ...arr[mi], title: e.target.value }; setForm({ ...form, program: arr }); }} />
                      <Button variant="outline" size="icon" onClick={() => setForm({ ...form, program: form.program.filter((_, idx) => idx !== mi) })}><Trash2 className="h-3 w-3" /></Button>
                    </div>
                    <div className="space-y-1 pl-3 border-l-2">
                      {m.lessons.map((l: string, li: number) => (
                        <div key={li} className="flex gap-2">
                          <Input placeholder="Leçon" value={l} onChange={(e) => { const arr = [...form.program]; arr[mi].lessons[li] = e.target.value; setForm({ ...form, program: arr }); }} />
                          <Button variant="ghost" size="icon" onClick={() => { const arr = [...form.program]; arr[mi].lessons = arr[mi].lessons.filter((_, x) => x !== li); setForm({ ...form, program: arr }); }}><Trash2 className="h-3 w-3" /></Button>
                        </div>
                      ))}
                      <Button variant="ghost" size="sm" onClick={() => { const arr = [...form.program]; arr[mi].lessons = [...arr[mi].lessons, ""]; setForm({ ...form, program: arr }); }}><Plus className="h-3 w-3 mr-1" /> Leçon</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
