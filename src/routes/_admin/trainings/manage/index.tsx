import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/site";
import { DataTable } from "@/components/site/DataTable";
import { useAdminTrainingsList } from "@/stores/useTrainingsStore";
import { useAdminCategoriesList } from "@/stores/useCategoriesStore";
import { getTrainingLevelBadgeClass, getTrainingStatusBadgeClass, getTrainingStatusLabel } from "@/data/trainings";
import type { APIAdminTrainingListItem } from "@/data/trainings";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/_admin/trainings/manage/")({
  head: () => ({
    meta: [
      { title: `Contenu des formations | ${SITE.name}` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminTrainingsManage,
});

function AdminTrainingsManage() {
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
            label: "Statut de la formation",
            render: (r) => (
              <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${getTrainingStatusBadgeClass(r.status)}`}>
                {TRAINING_STATUS_LABELS[r.status]}
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