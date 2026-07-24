import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Pencil, Trash2, Save, X, Loader2, Plus, Target, BookOpen, Clock, Signal, Users, Award, CalendarClock, ListChecks, } from "lucide-react";
import { AdminShell } from "@/components/site/AdminShell";
import { ConfirmDelete } from "@/components/site/AdminBits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdminTrainingDetail, useUpdateAdminTraining, useDeleteAdminTraining } from "@/stores/useTrainingsStore";
import { useAdminCategoriesList } from "@/stores/useCategoriesStore";
import { getTrainingLevelBadgeClass } from "@/data/trainings";
import type { AdminTrainingPayload, TrainingLevel, TrainingProgramModule } from "@/data/trainings";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/admin/trainings/catalogs/$id")({
  head: () => ({
    meta: [
      { title: `Formations | ${SITE.name}` },
      { name: "robots", content: "noindex" }]
  }),
  component: TrainingDetail,
});

function toPayload(t: NonNullable<ReturnType<typeof useAdminTrainingDetail>["item"]>): AdminTrainingPayload {
  return {
    title: t.title,
    theme_id: t.themeId,
    duration: t.duration,
    duration_hours: t.durationHours,
    level: t.level,
    price: t.price,
    short: t.short,
    audience: t.audience,
    objectives: [...t.objectives],
    prerequisites: [...t.prerequisites],
    program: t.program.map((m) => ({ title: m.title, items: [...m.items] })),
    certification: t.certification,
    schedule: t.schedule,
  };
}

function TrainingDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

  const { item: training, isLoading } = useAdminTrainingDetail(id);
  const { items: themes } = useAdminCategoriesList({ perPage: 100, context: "formation" });
  const updateMutation = useUpdateAdminTraining();
  const removeMutation = useDeleteAdminTraining();

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<AdminTrainingPayload | null>(null);
  const [toDelete, setToDelete] = useState(false);

  useEffect(() => {
    if (training && !form) setForm(toPayload(training));
  }, [training, form]);

  if (isLoading) {
    return (
      <AdminShell>
        <div className="flex items-center justify-center py-24 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2" /> Chargement...
        </div>
      </AdminShell>
    );
  }

  if (!training || !form) {
    return (
      <AdminShell>
        <div className="mb-6">
          <Button variant="outline" size="sm" onClick={() => navigate({ to: "/admin/trainings/catalogs" })}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Retour
          </Button>
        </div>
        <p className="text-muted-foreground">Formation introuvable.</p>
      </AdminShell>
    );
  }

  const themeMeta = themes.find((t) => t.id === training.themeId);
  const themeColorClass = themeMeta?.colorClass ?? "bg-slate-100 text-slate-700";

  const handleSave = () => {
    updateMutation.mutate({ id: training.id, payload: form }, {
      onSuccess: () => { toast.success("Formation modifiée"); setIsEditing(false); },
      onError: () => toast.error("Erreur lors de la modification"),
    });
  };

  const handleCancel = () => {
    setForm(toPayload(training));
    setIsEditing(false);
  };

  return (
    <AdminShell>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" size="sm" onClick={() => navigate({ to: "/admin/trainings" })}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Retour
        </Button>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" size="sm" onClick={handleCancel}><X className="h-4 w-4 mr-1" /> Annuler</Button>
              <Button size="sm" onClick={handleSave} disabled={updateMutation.isPending}><Save className="h-4 w-4 mr-1" /> Enregistrer</Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}><Pencil className="h-4 w-4 mr-1" /> Modifier</Button>
              <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => setToDelete(true)}>
                <Trash2 className="h-4 w-4 mr-1" /> Supprimer
              </Button>
            </>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="max-w-4xl space-y-4 rounded-2xl border bg-card p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label>Titre</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <Label>Thème</Label>
              <Select value={form.theme_id} onValueChange={(v) => setForm({ ...form, theme_id: v })}>
                <SelectTrigger><SelectValue placeholder="Choisir un thème" /></SelectTrigger>
                <SelectContent>
                  {themes.map((t) => (<SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>))}
                </SelectContent>
              </Select>
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
              <Input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
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
              <Input value={form.schedule} onChange={(e) => setForm({ ...form, schedule: e.target.value })} />
            </div>
          </div>
          <div>
            <Label>Résumé (short)</Label>
            <Input value={form.short} onChange={(e) => setForm({ ...form, short: e.target.value })} />
          </div>

          <div>
            <Label>Objectifs</Label>
            <div className="mt-2 space-y-2">
              {form.objectives.map((o: string, i: number) => (
                <div key={i} className="flex gap-2">
                  <Input value={o} onChange={(e) => { const arr = [...form.objectives]; arr[i] = e.target.value; setForm({ ...form, objectives: arr }); }} />
                  <Button variant="outline" size="icon" onClick={() => setForm({ ...form, objectives: form.objectives.filter((_: string, idx: number) => idx !== i) })}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              <Button variant="ghost" size="sm" onClick={() => setForm({ ...form, objectives: [...form.objectives, ""] })}>
                <Plus className="h-3 w-3 mr-1" /> Ajouter
              </Button>
            </div>
          </div>

          <div>
            <Label>Prérequis</Label>
            <div className="mt-2 space-y-2">
              {form.prerequisites.map((p: string, i: number) => (
                <div key={i} className="flex gap-2">
                  <Input value={p} onChange={(e) => { const arr = [...form.prerequisites]; arr[i] = e.target.value; setForm({ ...form, prerequisites: arr }); }} />
                  <Button variant="outline" size="icon" onClick={() => setForm({ ...form, prerequisites: form.prerequisites.filter((_: string, idx: number) => idx !== i) })}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              <Button variant="ghost" size="sm" onClick={() => setForm({ ...form, prerequisites: [...form.prerequisites, ""] })}>
                <Plus className="h-3 w-3 mr-1" /> Ajouter
              </Button>
            </div>
          </div>

          <div>
            <Label>Programme (modules)</Label>
            <div className="mt-2 space-y-3">
              {form.program.map((m: TrainingProgramModule, mi: number) => (
                <div key={mi} className="rounded-lg border p-3 space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Titre du module"
                      value={m.title}
                      onChange={(e) => { const arr = [...form.program]; arr[mi] = { ...arr[mi], title: e.target.value }; setForm({ ...form, program: arr }); }}
                    />
                    <Button variant="outline" size="icon" onClick={() => setForm({ ...form, program: form.program.filter((_: TrainingProgramModule, idx: number) => idx !== mi) })}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="space-y-1 pl-3 border-l-2">
                    {m.items.map((it: string, li: number) => (
                      <div key={li} className="flex gap-2">
                        <Input
                          value={it}
                          onChange={(e) => { const arr = [...form.program]; arr[mi].items[li] = e.target.value; setForm({ ...form, program: arr }); }}
                        />
                        <Button variant="ghost" size="icon" onClick={() => { const arr = [...form.program]; arr[mi].items = arr[mi].items.filter((_: string, x: number) => x !== li); setForm({ ...form, program: arr }); }}>
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
              <Button variant="ghost" size="sm" onClick={() => setForm({ ...form, program: [...form.program, { title: "", items: [""] }] })}>
                <Plus className="h-3 w-3 mr-1" /> Module
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className={`inline-flex px-2 py-1 rounded-full font-medium ${themeColorClass}`}>{training.theme}</span>

                {/* 💡 Badge de niveau stylisé avec getTrainingLevelBadgeClass */}
                <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${getTrainingLevelBadgeClass(training.level)}`}>
                  <Signal className="h-3 w-3" /> {training.level}
                </span>

                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-muted-foreground">
                  <Clock className="h-3 w-3" /> {training.duration}
                </span>
              </div>
              <h1 className="mt-3 font-display text-4xl font-bold leading-tight">{training.title}</h1>
              <p className="mt-2 text-muted-foreground">{training.short}</p>
            </div>

            <div className="rounded-2xl border bg-card p-6">
              <div className="mb-3 flex items-center gap-2 font-semibold">
                <Target className="h-4 w-4 text-primary" /> Objectifs
              </div>
              <ul className="space-y-1.5 text-sm">
                {training.objectives.map((o: string, i: number) => (
                  <li key={i} className="flex gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" /> {o}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border bg-card p-6">
              <div className="mb-4 flex items-center gap-2 font-semibold">
                <BookOpen className="h-4 w-4 text-primary" /> Programme
              </div>
              <div className="space-y-5">
                {training.program.map((m: TrainingProgramModule, i: number) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{m.title}</div>
                      <ul className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                        {m.items.map((it: string, j: number) => <li key={j}>{it}</li>)}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar sticky — fiche pratique */}
          <div className="lg:sticky lg:top-6 h-fit space-y-4">
            <div className="rounded-2xl border bg-card p-6">
              <div className="font-display text-3xl font-bold text-primary">{training.price.toLocaleString()} FCFA</div>

              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-start gap-2 text-muted-foreground">
                  <Users className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{training.audience || "—"}</span>
                </div>
                <div className="flex items-start gap-2 text-muted-foreground">
                  <Award className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{training.certification || "—"}</span>
                </div>
                <div className="flex items-start gap-2 text-muted-foreground">
                  <CalendarClock className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{training.schedule || "—"}</span>
                </div>
              </div>

              {training.prerequisites.length > 0 && (
                <div className="mt-4 border-t pt-4">
                  <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <ListChecks className="h-3.5 w-3.5" /> Prérequis
                  </div>
                  <ul className="space-y-1 text-sm">
                    {training.prerequisites.map((p: string, i: number) => (
                      <li key={i} className="flex gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/50" /> {p}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="rounded-2xl border bg-card p-4 text-xs text-muted-foreground">
              <div>Créée le {new Date(training.createdAt).toLocaleDateString("fr-FR")}</div>
              <div>Modifiée le {new Date(training.updatedAt).toLocaleDateString("fr-FR")}</div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDelete
        open={toDelete}
        onOpenChange={setToDelete}
        onConfirm={() => {
          removeMutation.mutate(training.id, {
            onSuccess: () => { toast.success("Formation supprimée"); navigate({ to: "/admin/trainings" }); },
            onError: () => toast.error("Erreur lors de la suppression"),
          });
        }}
        title={`Supprimer "${training.title}" ?`}
      />
    </AdminShell>
  );
}