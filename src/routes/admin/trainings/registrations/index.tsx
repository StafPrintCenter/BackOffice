import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Plus, Trash2 } from "lucide-react";
import { AdminShell, PageHeader, ConfirmDelete } from "@/components/site";
import { useAdminCategoriesList } from "@/stores/useCategoriesStore";
import { DataTable } from "@/components/site/DataTable";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdminTrainingsList, useCreateAdminTraining, useUpdateAdminTraining, useDeleteAdminTraining } from "@/stores/useTrainingsStore";
import { getTrainingLevelBadgeClass } from "@/data/trainings";
import type { APIAdminTrainingListItem, AdminTrainingPayload, TrainingLevel } from "@/data/trainings";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/admin/trainings/registrations/")({
  head: () => ({
    meta: [
      { title: `Formations | ${SITE.name}` },
      { name: "robots", content: "noindex" }]
  }),
  component: AdminTrainings,
});

const schema = z.object({
  title: z.string().trim().min(2).max(120),
  theme_id: z.string().trim().min(1, "Le thème est requis"),
  duration: z.string().trim().min(1).max(50),
  duration_hours: z.number().min(0),
  level: z.enum(["Débutant", "Intermédiaire", "Avancé"]),
  price: z.number().min(0),
  short: z.string().trim().min(2).max(300),
  audience: z.string().trim().min(1),
  objectives: z.array(z.string().trim().min(1)).min(1),
  prerequisites: z.array(z.string().trim().min(1)),
  program: z.array(z.object({ title: z.string().min(1), items: z.array(z.string().min(1)) })).min(1),
  certification: z.string().trim().min(1),
  schedule: z.string().trim().min(1),
});
type FormValues = z.infer<typeof schema>;

const empty: FormValues = {
  title: "", theme_id: "", duration: "", duration_hours: 0, level: "Débutant", price: 0, short: "",
  audience: "", objectives: [""], prerequisites: [""], program: [{ title: "", items: [""] }],
  certification: "", schedule: "",
};

function AdminTrainings() {
  const navigate = useNavigate();
  const { items, isLoading } = useAdminTrainingsList({ perPage: 100 });
  const { items: themes } = useAdminCategoriesList({ perPage: 100, context: "formation" });

  const createMutation = useCreateAdminTraining();
  const updateMutation = useUpdateAdminTraining();
  const removeMutation = useDeleteAdminTraining();

  const [dialog, setDialog] = useState<{ open: boolean; row?: APIAdminTrainingListItem }>({ open: false });
  const [form, setForm] = useState<FormValues>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toDelete, setToDelete] = useState<APIAdminTrainingListItem | null>(null);

  const openCreate = () => { setForm(empty); setErrors({}); setDialog({ open: true }); };

  const submit = () => {
    const cleaned: FormValues = {
      ...form,
      objectives: form.objectives.filter((o) => o.trim()),
      prerequisites: form.prerequisites.filter((p) => p.trim()),
      program: form.program
        .filter((m) => m.title.trim())
        .map((m) => ({ ...m, items: m.items.filter((i) => i.trim()) })),
    };
    const parsed = schema.safeParse(cleaned);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => { errs[i.path[0] as string] = i.message; });
      setErrors(errs);
      return;
    }

    const payload = parsed.data as AdminTrainingPayload;

    if (dialog.row) {
      updateMutation.mutate({ id: dialog.row.id, payload }, {
        onSuccess: () => { toast.success("Formation modifiée"); setDialog({ open: false }); },
        onError: () => toast.error("Erreur lors de la modification"),
      });
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => { toast.success("Formation créée"); setDialog({ open: false }); },
        onError: () => toast.error("Erreur lors de la création"),
      });
    }
  };

  return (
    <AdminShell>
      <PageHeader title="Formations" description="Programmes proposés au public." />
      <DataTable<APIAdminTrainingListItem>
        data={items}
        isLoading={isLoading}
        searchKeys={["title", "theme"]}
        onCreate={openCreate}
        onView={(r) => navigate({ to: "/admin/trainings/$id", params: { id: r.id } })}
        onDelete={(r) => setToDelete(r)}
        columns={[
          { key: "title", label: "Titre", render: (r) => <div className="font-medium">{r.title}</div> },
          {
            key: "theme",
            label: "Thème",
            render: (r) => {
              const match = themes.find(
                (t) => t.id === r.themeId || t.name.toLowerCase() === (typeof r.theme === "string" ? r.theme.toLowerCase() : "")
              );

              const colorClass = match?.colorClass || "bg-slate-100 text-slate-700";
              const themeName = typeof r.theme === "string" ? r.theme : match?.name || "Sans thème";

              return (
                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${colorClass}`}>
                  {themeName}
                </span>
              );
            },
          },
          {
            key: "level",
            label: "Niveau",
            render: (r) => (
              <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors ${getTrainingLevelBadgeClass(r.level)}`}>
                {r.level}
              </span>
            ),
          },
          { key: "duration", label: "Durée" },
          { key: "price", label: "Prix", render: (r) => <span className="font-semibold">{r.price.toLocaleString()} FCFA</span> },
        ]}
      />

      <Dialog open={dialog.open} onOpenChange={(v) => setDialog({ open: v, row: dialog.row })}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{dialog.row ? "Modifier la formation" : "Nouvelle formation"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label>Titre</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                {errors.title && <p className="text-xs text-destructive mt-1">{errors.title}</p>}
              </div>
              <div>
                <Label>Thème</Label>
                <Select value={form.theme_id} onValueChange={(v) => setForm({ ...form, theme_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Choisir un thème" /></SelectTrigger>
                  <SelectContent>
                    {themes.map((t) => (<SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>))}
                  </SelectContent>
                </Select>
                {errors.theme_id && <p className="text-xs text-destructive mt-1">{errors.theme_id}</p>}
              </div>
              <div>
                <Label>Niveau</Label>
                <Select value={form.level} onValueChange={(v) => setForm({ ...form, level: v as TrainingLevel })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Débutant">Débutant</SelectItem>
                    <SelectItem value="Intermédiaire">Intermédiaire</SelectItem>
                    <SelectItem value="Avancé">Avancé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Durée (libellé)</Label>
                <Input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="ex: 36h (5 semaines)" />
              </div>
              <div>
                <Label>Durée (heures)</Label>
                <Input type="number" value={form.duration_hours} onChange={(e) => setForm({ ...form, duration_hours: Number(e.target.value) })} />
              </div>
              <div>
                <Label>Prix (FCFA)</Label>
                <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
              </div>
              <div className="sm:col-span-2">
                <Label>Public visé</Label>
                <Input value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <Label>Certification</Label>
                <Input value={form.certification} onChange={(e) => setForm({ ...form, certification: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <Label>Horaires</Label>
                <Input value={form.schedule} onChange={(e) => setForm({ ...form, schedule: e.target.value })} placeholder="ex: 2 séances de 3h30 par semaine" />
              </div>
            </div>

            <div>
              <Label>Résumé (short)</Label>
              <Input value={form.short} onChange={(e) => setForm({ ...form, short: e.target.value })} />
              {errors.short && <p className="text-xs text-destructive mt-1">{errors.short}</p>}
            </div>

            {/* Objectifs */}
            <div>
              <div className="flex items-center justify-between">
                <Label>Objectifs</Label>
                <Button variant="outline" size="sm" onClick={() => setForm({ ...form, objectives: [...form.objectives, ""] })}>
                  <Plus className="h-3 w-3 mr-1" /> Ajouter
                </Button>
              </div>
              <div className="mt-2 space-y-2">
                {form.objectives.map((o, i) => (
                  <div key={i} className="flex gap-2">
                    <Input value={o} onChange={(e) => { const arr = [...form.objectives]; arr[i] = e.target.value; setForm({ ...form, objectives: arr }); }} />
                    <Button variant="outline" size="icon" onClick={() => setForm({ ...form, objectives: form.objectives.filter((_, idx) => idx !== i) })}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Prérequis */}
            <div>
              <div className="flex items-center justify-between">
                <Label>Prérequis</Label>
                <Button variant="outline" size="sm" onClick={() => setForm({ ...form, prerequisites: [...form.prerequisites, ""] })}>
                  <Plus className="h-3 w-3 mr-1" /> Ajouter
                </Button>
              </div>
              <div className="mt-2 space-y-2">
                {form.prerequisites.map((p, i) => (
                  <div key={i} className="flex gap-2">
                    <Input value={p} onChange={(e) => { const arr = [...form.prerequisites]; arr[i] = e.target.value; setForm({ ...form, prerequisites: arr }); }} />
                    <Button variant="outline" size="icon" onClick={() => setForm({ ...form, prerequisites: form.prerequisites.filter((_, idx) => idx !== i) })}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Programme */}
            <div>
              <div className="flex items-center justify-between">
                <Label>Programme (modules)</Label>
                <Button variant="outline" size="sm" onClick={() => setForm({ ...form, program: [...form.program, { title: "", items: [""] }] })}>
                  <Plus className="h-3 w-3 mr-1" /> Module
                </Button>
              </div>
              <div className="mt-2 space-y-3">
                {form.program.map((m, mi) => (
                  <div key={mi} className="rounded-lg border p-3 space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Titre du module"
                        value={m.title}
                        onChange={(e) => { const arr = [...form.program]; arr[mi] = { ...arr[mi], title: e.target.value }; setForm({ ...form, program: arr }); }}
                      />
                      <Button variant="outline" size="icon" onClick={() => setForm({ ...form, program: form.program.filter((_, idx) => idx !== mi) })}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="space-y-1 pl-3 border-l-2">
                      {m.items.map((it, li) => (
                        <div key={li} className="flex gap-2">
                          <Input
                            placeholder="Élément"
                            value={it}
                            onChange={(e) => { const arr = [...form.program]; arr[mi].items[li] = e.target.value; setForm({ ...form, program: arr }); }}
                          />
                          <Button variant="ghost" size="icon" onClick={() => { const arr = [...form.program]; arr[mi].items = arr[mi].items.filter((_, x) => x !== li); setForm({ ...form, program: arr }); }}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                      <Button variant="ghost" size="sm" onClick={() => { const arr = [...form.program]; arr[mi].items = [...arr[mi].items, ""]; setForm({ ...form, program: arr }); }}>
                        <Plus className="h-3 w-3 mr-1" /> Élément
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog({ open: false })}>Annuler</Button>
            <Button onClick={submit} disabled={createMutation.isPending || updateMutation.isPending}>
              {dialog.row ? "Enregistrer" : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDelete
        open={!!toDelete}
        onOpenChange={(v) => !v && setToDelete(null)}
        onConfirm={() => {
          if (!toDelete) return;
          removeMutation.mutate(toDelete.id, {
            onSuccess: () => { toast.success("Formation supprimée"); setToDelete(null); },
            onError: () => toast.error("Erreur lors de la suppression"),
          });
        }}
        title={`Supprimer "${toDelete?.title}" ?`}
      />
    </AdminShell>
  );
}
