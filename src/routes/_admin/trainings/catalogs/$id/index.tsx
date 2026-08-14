import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Pencil, Trash2, Save, X, Loader2, Plus, Target, BookOpen, Clock, Signal, Users, Award, CalendarClock, ListChecks, UserCheck, UserPlus, Mail, MapPin, Wallet, PercentCircle, Palette } from "lucide-react";
import { ConfirmDelete } from "@/components/site/AdminBits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useAdminTrainingDetail, useUpdateAdminTraining, useDeleteAdminTraining } from "@/stores/useTrainingsStore";
import { useAdminCategoriesList } from "@/stores/useCategoriesStore";
import { useTrainingInstructorsList, useAssignAdminTrainingInstructor, useRemoveAdminTrainingInstructorAssignment } from "@/stores/useTrainingInstructorsStore";
import { useAdminInstructorsList } from "@/stores/useInstructorsStore";
import { TRAINING_INSTRUCTOR_ROLE_LABELS } from "@/data/trainingInstructors";
import type { TrainingInstructorRole } from "@/data/trainingInstructors";
import { getTrainingLevelBadgeClass, getTrainingStatusBadgeClass, getTrainingStatusLabel, sanitizeTrainingPayload } from "@/data/trainings";
import type { AdminTrainingPayload, TrainingLevel, TrainingProgramModule, TrainingStatus } from "@/data/trainings";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/_admin/trainings/catalogs/$id/")({
  head: () => ({
    meta: [
      { title: `Formations | ${SITE.name}` },
      { name: "robots", content: "noindex" }]
  }),
  component: TrainingDetail,
});

const STATUS_OPTIONS: { value: TrainingStatus; label: string }[] = [
  { value: "draft", label: "Brouillon" },
  { value: "published", label: "Publiée" },
  { value: "archived", label: "Archivée" },
];

function toPayload(t: NonNullable<ReturnType<typeof useAdminTrainingDetail>["item"]>): AdminTrainingPayload {
  return {
    title: t.title,
    theme_id: t.themeId,
    duration: t.duration,
    duration_hours: t.durationHours,
    level: t.level,
    price: t.price,
    max_seats: t.maxSeats ?? 0,
    short: t.short,
    audience: t.audience,
    objectives: [...t.objectives],
    prerequisites: [...t.prerequisites],
    program: t.program.map((m) => ({ title: m.title, items: [...m.items] })),
    certification: t.certification,
    schedule: t.schedule,
    registration_fee: t.registrationFee ?? 0,
    access_min_ratio: t.accessMinRatio ?? 0,
    registration_deadline: t.registrationDeadline ?? "",
    start_date: t.startDate ?? "",
    end_date: t.endDate ?? "",
    location: t.location ?? "",
    waiting_list_enabled: t.waitingListEnabled ?? false,
    cover_color: t.coverColor ?? "",
    status: t.status ?? "draft",
  };
}

function formatAssignedAt(dateStr: string): string {
  return new Date(dateStr).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });
}

function formatDate(dateStr?: string | null): string {
  return dateStr ? new Date(dateStr).toLocaleDateString("fr-FR") : "-";
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

  const { assignments, isLoading: assignmentsLoading } = useTrainingInstructorsList(id);
  const { items: allInstructors } = useAdminInstructorsList({ perPage: 100 });
  const assignMutation = useAssignAdminTrainingInstructor();
  const removeAssignmentMutation = useRemoveAdminTrainingInstructorAssignment();

  const [assignOpen, setAssignOpen] = useState(false);
  const [assignForm, setAssignForm] = useState<{ instructorId: string; role: TrainingInstructorRole }>({
    instructorId: "",
    role: "lead",
  });
  const [assignmentToRemove, setAssignmentToRemove] = useState<string | null>(null);

  useEffect(() => {
    if (training && !form) setForm(toPayload(training));
  }, [training, form]);

  if (isLoading) {
    return (
      <>
        <div className="flex items-center justify-center py-24 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2" /> Chargement...
        </div>
      </>
    );
  }

  if (!training || !form) {
    return (
      <>
        <div className="mb-6">
          <Button variant="outline" size="sm" onClick={() => navigate({ to: "/trainings/catalogs" })}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Retour
          </Button>
        </div>
        <p className="text-muted-foreground">Formation introuvable.</p>
      </>
    );
  }

  const themeMeta = themes.find((t) => t.id === training.themeId);
  const themeColorClass = themeMeta?.colorClass ?? "bg-slate-100 text-slate-700";
  const mainColor = training.coverColor || "var(--primary)";

  const assignedInstructorIds = new Set(assignments.map((a) => a.instructorId));

  const availableInstructors = allInstructors.filter(
    (i) => !assignedInstructorIds.has(i.id) && i.isActive && !i.isBlocked && !i.isPending && !i.needsApproval
  );

  const handleSave = () => {
    updateMutation.mutate({ id: training.id, payload: sanitizeTrainingPayload(form) }, {
      onSuccess: () => { toast.success("Formation modifiée"); setIsEditing(false); },
      onError: () => toast.error("Erreur lors de la modification"),
    });
  };

  const handleCancel = () => {
    setForm(toPayload(training));
    setIsEditing(false);
  };

  const submitAssign = () => {
    if (!assignForm.instructorId) return;
    assignMutation.mutate(
      { trainingId: id, payload: { instructor_id: assignForm.instructorId, role: assignForm.role } },
      {
        onSuccess: () => {
          toast.success("Formateur assigné");
          setAssignOpen(false);
          setAssignForm({ instructorId: "", role: "lead" });
        },
        onError: (error) => toast.error(error instanceof Error ? error.message : "Erreur lors de l'assignation"),
      }
    );
  };

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" size="sm" onClick={() => navigate({ to: "/trainings/catalogs" })}>
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
              <Button variant="default" size="sm" onClick={() => navigate({ to: "/trainings/manage/$id", params: { id: training.id } })}>
                <BookOpen className="h-4 w-4 mr-1" /> Gérer le contenu
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
            <div>
              <Label>Places Max (0 = illimité)</Label>
              <Input type="number" value={form.max_seats ?? 0} onChange={(e) => setForm({ ...form, max_seats: Number(e.target.value) })} />
            </div>
            <div>
              <Label>Frais d'inscription (FCFA)</Label>
              <Input type="number" min={0} value={form.registration_fee ?? 0} onChange={(e) => setForm({ ...form, registration_fee: Number(e.target.value) })} />
            </div>
            <div>
              <Label>Ratio d'accès min. (0 à 1)</Label>
              <Input type="number" min={0} max={1} step={0.05} value={form.access_min_ratio ?? 0} onChange={(e) => setForm({ ...form, access_min_ratio: Number(e.target.value) })} />
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
            </div>
            <div className="sm:col-span-2">
              <Label>Lieu</Label>
              <Input value={form.location ?? ""} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </div>
            <div>
              <Label>Couleur de couverture</Label>
              <div className="flex items-center gap-2">
                <Input value={form.cover_color ?? ""} onChange={(e) => setForm({ ...form, cover_color: e.target.value })} placeholder="#8B5CF6" />
                <span className="h-9 w-9 shrink-0 rounded-md border shadow-sm" style={{ backgroundColor: form.cover_color || "transparent" }} />
              </div>
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input
                id="waiting_list_enabled_edit"
                type="checkbox"
                className="h-4 w-4 rounded border-input"
                checked={form.waiting_list_enabled ?? false}
                onChange={(e) => setForm({ ...form, waiting_list_enabled: e.target.checked })}
              />
              <Label htmlFor="waiting_list_enabled_edit">Liste d'attente activée</Label>
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
        <div className="space-y-6">
          {/* Header Immersif coloré */}
          <div
            className="relative overflow-hidden rounded-2xl border p-6 lg:p-8"
            style={{ background: `linear-gradient(135deg, ${mainColor}15 0%, ${mainColor}03 100%)` }}
          >
            <div
              className="pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full blur-3xl opacity-20"
              style={{ backgroundColor: mainColor }}
            />
            <div className="relative space-y-4">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className={`inline-flex px-2 py-1 rounded-full font-medium ${themeColorClass}`}>{training.theme}</span>

                <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${getTrainingLevelBadgeClass(training.level)}`}>
                  <Signal className="h-3 w-3" /> {training.level}
                </span>

                <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${getTrainingStatusBadgeClass(training.status)}`}>
                  {getTrainingStatusLabel(training.status)}
                </span>

                {training.coverColor && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border bg-background/80 backdrop-blur px-2.5 py-0.5 text-xs font-medium shadow-sm">
                    <span
                      className="h-2.5 w-2.5 rounded-full border shrink-0"
                      style={{ backgroundColor: training.coverColor }}
                    />
                    <span className="font-mono uppercase text-[11px] text-muted-foreground">{training.coverColor}</span>
                  </span>
                )}

                <span className="inline-flex items-center gap-1 rounded-full bg-background/80 backdrop-blur px-2 py-1 text-muted-foreground">
                  <Clock className="h-3 w-3" /> {training.duration}
                </span>

                {training.location && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-background/80 backdrop-blur px-2 py-1 text-muted-foreground">
                    <MapPin className="h-3 w-3" /> {training.location}
                  </span>
                )}
              </div>

              <div className="flex items-stretch gap-3.5">
                <div className="w-1.5 rounded-full shrink-0 my-1" style={{ backgroundColor: mainColor }} />
                <h1 className="font-display text-3xl sm:text-4xl font-bold leading-tight">{training.title}</h1>
              </div>

              <p className="max-w-3xl text-muted-foreground">{training.short}</p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Colonne principale */}
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-2xl border bg-card p-6">
                <div className="mb-3 flex items-center gap-2 font-semibold">
                  <Target className="h-4 w-4" style={{ color: mainColor }} /> Objectifs
                </div>
                <ul className="space-y-1.5 text-sm">
                  {training.objectives.map((o: string, i: number) => (
                    <li key={i} className="flex gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: mainColor }} /> {o}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border bg-card p-6">
                <div className="mb-4 flex items-center gap-2 font-semibold">
                  <BookOpen className="h-4 w-4" style={{ color: mainColor }} /> Programme
                </div>
                <div className="space-y-5">
                  {training.program.map((m: TrainingProgramModule, i: number) => (
                    <div key={i} className="flex gap-3">
                      <div
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                        style={{ backgroundColor: `${mainColor}20`, color: mainColor }}
                      >
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

              {/* Formateurs assignés */}
              <div className="rounded-2xl border bg-card p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 font-semibold">
                    <UserCheck className="h-4 w-4" style={{ color: mainColor }} /> Formateurs assignés
                  </div>
                  <Button type="button" size="sm" variant="outline" onClick={() => setAssignOpen(true)}>
                    <UserPlus className="h-3.5 w-3.5 mr-1" /> Assigner
                  </Button>
                </div>

                {assignmentsLoading ? (
                  <div className="text-sm text-muted-foreground">Chargement...</div>
                ) : assignments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucun formateur assigné pour le moment.</p>
                ) : (
                  <div className="space-y-2">
                    {assignments.map((a) => (
                      <div key={a.assignmentId} className="flex items-center justify-between gap-3 rounded-lg border p-3 text-sm">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <Link
                              to="/members/instructors/$id"
                              params={{ id: a.instructorId }}
                              className="font-medium text-primary hover:underline truncate"
                            >
                              {a.instructorName}
                            </Link>
                            <span className="inline-flex shrink-0 items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium">
                              {TRAINING_INSTRUCTOR_ROLE_LABELS[a.role]}
                            </span>
                            {a.instructorIsBlocked && (
                              <span className="inline-flex shrink-0 items-center rounded-full bg-destructive/10 text-destructive px-2 py-0.5 text-[10px] font-medium">
                                Bloqué
                              </span>
                            )}
                          </div>
                          <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Mail className="h-3 w-3" /> {a.instructorEmail}
                          </div>
                          <div className="mt-0.5 text-[11px] text-muted-foreground/70">
                            Assigné le {formatAssignedAt(a.assignedAt)} par {a.assignedBy}
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="shrink-0 text-destructive hover:bg-destructive/10"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setAssignmentToRemove(a.assignmentId);
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar sticky - fiche pratique */}
            <div className="lg:sticky lg:top-6 h-fit space-y-4">
              <div className="rounded-2xl border bg-card p-6">
                <div className="font-display text-3xl font-bold" style={{ color: mainColor }}>
                  {training.price.toLocaleString()} FCFA
                </div>

                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex items-start gap-2 text-muted-foreground">
                    <Users className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{training.audience || "-"}</span>
                  </div>
                  <div className="flex items-start gap-2 text-muted-foreground">
                    <Award className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{training.certification || "-"}</span>
                  </div>
                  <div className="flex items-start gap-2 text-muted-foreground">
                    <CalendarClock className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{training.schedule || "-"}</span>
                  </div>
                  {training.coverColor && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Palette className="h-4 w-4 shrink-0" />
                      <span className="flex items-center gap-2">
                        Couleur :
                        <span className="font-mono text-xs uppercase">{training.coverColor}</span>
                        <span
                          className="h-4 w-4 rounded-md border shadow-sm shrink-0"
                          style={{ backgroundColor: training.coverColor }}
                        />
                      </span>
                    </div>
                  )}
                  {training.registrationFee !== undefined && training.registrationFee !== null && training.registrationFee > 0 && (
                    <div className="flex items-start gap-2 text-muted-foreground">
                      <Wallet className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>Frais d'inscription : {training.registrationFee.toLocaleString()} FCFA</span>
                    </div>
                  )}
                  {training.accessMinRatio !== undefined && training.accessMinRatio !== null && (
                    <div className="flex items-start gap-2 text-muted-foreground">
                      <PercentCircle className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>Ratio d'accès min. : {Math.round(training.accessMinRatio * 100)}%</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 border-t pt-4 space-y-1.5 text-xs text-muted-foreground">
                  <div>Inscriptions jusqu'au : {formatDate(training.registrationDeadline)}</div>
                  <div>Début : {formatDate(training.startDate)}</div>
                  <div>Fin : {formatDate(training.endDate)}</div>
                  <div>Liste d'attente : {training.waitingListEnabled ? "Activée" : "Désactivée"}</div>
                </div>

                {training.prerequisites.length > 0 && (
                  <div className="mt-4 border-t pt-4">
                    <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      <ListChecks className="h-3.5 w-3.5" /> Prérequis
                    </div>
                    <ul className="space-y-1 text-sm">
                      {training.prerequisites.map((p: string, i: number) => (
                        <li key={i} className="flex gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: mainColor }} /> {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="rounded-2xl border bg-card p-4 text-xs text-muted-foreground">
                <div>Créée le {new Date(training.createdAt).toLocaleDateString("fr-FR")}</div>
                <div>Modifiée le {new Date(training.updatedAt).toLocaleDateString("fr-FR")}</div>
                {training.publishedAt && <div>Publiée le {new Date(training.publishedAt).toLocaleDateString("fr-FR")}</div>}
              </div>
            </div>
          </div>
        </div>
      )}

      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Assigner un formateur</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Formateur</Label>
              <Select value={assignForm.instructorId} onValueChange={(v) => setAssignForm({ ...assignForm, instructorId: v })}>
                <SelectTrigger><SelectValue placeholder="Choisir un formateur" /></SelectTrigger>
                <SelectContent>
                  {availableInstructors.map((i) => (
                    <SelectItem key={i.id} value={i.id}>{i.name} ({i.email})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Seuls les formateurs actifs, non bloqués et sans invitation/approbation en attente sont assignables.
              </p>
            </div>
            <div>
              <Label>Rôle</Label>
              <Select value={assignForm.role} onValueChange={(v) => setAssignForm({ ...assignForm, role: v as TrainingInstructorRole })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="lead">Formateur principal</SelectItem>
                  <SelectItem value="assistant">Assistant</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignOpen(false)}>Annuler</Button>
            <Button onClick={submitAssign} disabled={!assignForm.instructorId || assignMutation.isPending}>
              Assigner
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDelete
        open={!!assignmentToRemove}
        onOpenChange={(v) => { if (!v) setAssignmentToRemove(null); }}
        onConfirm={() => {
          if (!assignmentToRemove) return;
          removeAssignmentMutation.mutate(
            { trainingId: id, assignmentId: assignmentToRemove },
            {
              onSuccess: () => { toast.success("Formateur retiré"); setAssignmentToRemove(null); },
              onError: () => toast.error("Erreur lors du retrait"),
            }
          );
        }}
        title="Retirer ce formateur de la formation ?"
      />

      <ConfirmDelete
        open={toDelete}
        onOpenChange={setToDelete}
        onConfirm={() => {
          removeMutation.mutate(training.id, {
            onSuccess: () => {
              toast.success("Formation supprimée");
              navigate({ to: "/trainings/catalogs" });
            },
            onError: () => toast.error("Erreur lors de la suppression"),
          });
        }}
        title={`Supprimer "${training.title}" ?`}
      />
    </>
  );
}