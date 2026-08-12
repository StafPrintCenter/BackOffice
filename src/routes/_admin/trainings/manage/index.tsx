import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Plus, Trash2, UserRoundPlus, Palette } from "lucide-react";
import { PageHeader, ConfirmDelete } from "@/components/site";
import { useAdminCategoriesList } from "@/stores/useCategoriesStore";
import { DataTable } from "@/components/site/DataTable";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdminTrainingsList, useCreateAdminTraining, useUpdateAdminTraining, useDeleteAdminTraining } from "@/stores/useTrainingsStore";
import { getTrainingLevelBadgeClass, getTrainingStatusBadgeClass, getTrainingStatusLabel, sanitizeTrainingPayload } from "@/data/trainings";
import type { APIAdminTrainingListItem, AdminTrainingPayload, TrainingLevel, TrainingStatus } from "@/data/trainings";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/_admin/trainings/manage/")({
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
  max_seats: z.number().min(0).nullable().optional(),
  registration_fee: z.number().min(0).nullable().optional(),
  access_min_ratio: z.number().min(0).max(1).nullable().optional(),
  registration_deadline: z.string().trim().optional(),
  start_date: z.string().trim().optional(),
  end_date: z.string().trim().optional(),
  location: z.string().trim().optional(),
  waiting_list_enabled: z.boolean().optional(),
  cover_color: z.string().trim().optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
}).refine(
  (data) => !data.start_date || !data.end_date || data.end_date >= data.start_date,
  { message: "La date de fin doit être après la date de début", path: ["end_date"] }
);
type FormValues = z.infer<typeof schema>;

const empty: FormValues = {
  title: "", theme_id: "", duration: "", duration_hours: 0, level: "Débutant", price: 0, short: "",
  audience: "", objectives: [""], prerequisites: [""], program: [{ title: "", items: [""] }],
  certification: "", schedule: "", max_seats: 0,
  registration_fee: 0, access_min_ratio: 0, registration_deadline: "", start_date: "", end_date: "",
  location: "", waiting_list_enabled: false, cover_color: "", status: "draft",
};

const STATUS_OPTIONS: { value: TrainingStatus; label: string }[] = [
  { value: "draft", label: "Brouillon" },
  { value: "published", label: "Publiée" },
  { value: "archived", label: "Archivée" },
];

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

    const payload = sanitizeTrainingPayload(parsed.data as AdminTrainingPayload);

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
    <>
      <PageHeader title="Formations" description="Programmes proposés au public." />

      {/* Raccourci */}
      <div className="mb-4">
        <Link to="/trainings/registrations"
          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
          <UserRoundPlus className="h-4 w-4" />
          Voir les inscriptions
        </Link>
      </div>

      <DataTable<APIAdminTrainingListItem>
        data={items}
        isLoading={isLoading}
        searchKeys={["title", "theme"]}
        onCreate={openCreate}
        onView={(r) => navigate({ to: "/trainings/catalogs/$id", params: { id: r.id } })}
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
            key: "coverColor",
            label: "Couleur",
            render: (r) => (
              r.coverColor ? (
                <div className="flex items-center gap-1.5">
                  <span
                    className="h-3.5 w-3.5 rounded-full border shadow-sm shrink-0"
                    style={{ backgroundColor: r.coverColor }}
                  />
                  <span className="font-mono text-xs uppercase text-muted-foreground">{r.coverColor}</span>
                </div>
              ) : (
                <span className="text-xs text-muted-foreground">-</span>
              )
            ),
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
          {
            key: "status",
            label: "Statut",
            render: (r) => (
              <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getTrainingStatusBadgeClass(r.status)}`}>
                {getTrainingStatusLabel(r.status)}
              </span>
            ),
          },
          { key: "duration", label: "Durée" },
          { key: "price", label: "Prix", render: (r) => <span className="font-semibold">{r.price.toLocaleString()} FCFA</span> },
          {
            key: "max_seats",
            label: "Places max",
            render: (r) => (
              <span className="text-sm">
                {r.maxSeats && r.maxSeats > 0 ? `${r.maxSeats} places` : "Illimité"}
              </span>
            ),
          },
          {
            key: "period",
            label: "Période",
            render: (r) => (
              <span className="text-xs text-muted-foreground">
                {r.startDate ? new Date(r.startDate).toLocaleDateString("fr-FR") : "-"}
                {" → "}
                {r.endDate ? new Date(r.endDate).toLocaleDateString("fr-FR") : "-"}
              </span>
            ),
          },
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
              <div className="sm:col-span-2">
                <Label>Résumé court</Label>
                <Input value={form.short} onChange={(e) => setForm({ ...form, short: e.target.value })} />
                {errors.short && <p className="text-xs text-destructive mt-1">{errors.short}</p>}
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
              <div className="sm:col-span-2">
                <Label>Horaires</Label>
                <Input value={form.schedule} onChange={(e) => setForm({ ...form, schedule: e.target.value })} placeholder="ex: 2 séances de 3h30 par semaine" />
              </div>
              <div>
                <Label>Prix (FCFA)</Label>
                <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
              </div>
              <div>
                <Label>Frais d'inscription (FCFA)</Label>
                <Input type="number" min={0} value={form.registration_fee ?? 0} onChange={(e) => setForm({ ...form, registration_fee: Number(e.target.value) })} />
              </div>
              <div>
                <Label>Nombre de places max (0 = Illimité)</Label>
                <Input type="number" min={0} value={form.max_seats ?? 0} onChange={(e) => setForm({ ...form, max_seats: Number(e.target.value) })} placeholder="0 pour illimité" />
              </div>
              <div>
                <Label>Ratio d'accès min. (0 à 1)</Label>
                <Input type="number" min={0} max={1} step={0.05} value={form.access_min_ratio ?? 0} onChange={(e) => setForm({ ...form, access_min_ratio: Number(e.target.value) })} />
                {errors.access_min_ratio && <p className="text-xs text-destructive mt-1">{errors.access_min_ratio}</p>}
              </div>
              <div>
                <Label>Statut</Label>
                <Select value={form.status ?? "draft"} onValueChange={(v) => setForm({ ...form, status: v as TrainingStatus })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((s) => (<SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Date limite d'inscription</Label>
                <Input type="date" value={form.registration_deadline ?? ""} onChange={(e) => setForm({ ...form, registration_deadline: e.target.value })} />
              </div>
              <div>
                <Label>Date de début</Label>
                <Input type="date" value={form.start_date ?? ""} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
              </div>
              <div>
                <Label>Date de fin</Label>
                <Input type="date" value={form.end_date ?? ""} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
                {errors.end_date && <p className="text-xs text-destructive mt-1">{errors.end_date}</p>}
              </div>
              <div className="sm:col-span-2">
                <Label>Lieu</Label>
                <Input value={form.location ?? ""} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="ex: Porto-Novo, Bénin" />
              </div>
              <div>
                <Label>Couleur de couverture</Label>
                <div className="flex items-center gap-2">
                  <Input value={form.cover_color ?? ""} onChange={(e) => setForm({ ...form, cover_color: e.target.value })} placeholder="#8B5CF6" />
                  <span
                    className="h-9 w-9 shrink-0 rounded-md border shadow-sm"
                    style={{ backgroundColor: form.cover_color || "transparent" }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-6">
                <input
                  id="waiting_list_enabled"
                  type="checkbox"
                  className="h-4 w-4 rounded border-input"
                  checked={form.waiting_list_enabled ?? false}
                  onChange={(e) => setForm({ ...form, waiting_list_enabled: e.target.checked })}
                />
                <Label htmlFor="waiting_list_enabled">Liste d'attente activée</Label>
              </div>
              <div className="sm:col-span-2">
                <Label>Public visé</Label>
                <Input value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <Label>Certification</Label>
                <Input value={form.certification} onChange={(e) => setForm({ ...form, certification: e.target.value })} />
              </div>
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
    </>
  );
}