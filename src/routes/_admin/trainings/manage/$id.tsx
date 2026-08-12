import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft, Loader2, Plus, Pencil, Trash2, Rocket, ChevronDown, ChevronUp,
  BookOpen, Clock, Video, FileText, ListChecks,
} from "lucide-react";
import { ConfirmDelete } from "@/components/site/AdminBits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useAdminTrainingDetail } from "@/stores/useTrainingsStore";
import {
  useTrainingModulesList, useCreateAdminTrainingModule, useUpdateAdminTrainingModule,
  useDeleteAdminTrainingModule, usePublishAdminTrainingModule, useAdminModuleDetail,
} from "@/stores/useTrainingModulesStore";
import {
  useCreateAdminLesson, useUpdateAdminLesson, useDeleteAdminLesson, usePublishAdminLesson,
} from "@/stores/useLessonsStore";
import {
  getModuleStatusBadge, MODULE_STATUS_LABELS, getLessonStatusBadge, LESSON_STATUS_LABELS,
  LESSON_KIND_LABELS,
} from "@/data/trainingModules";
import type {
  APIAdminTrainingModule, AdminTrainingModulePayload, APIAdminLesson, AdminLessonPayload, LessonKind,
} from "@/data/trainingModules";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/_admin/trainings/manage/$id")({
  head: () => ({
    meta: [
      { title: `Contenu de la formation | ${SITE.name}` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: TrainingManageDetail,
});

const emptyModuleForm: AdminTrainingModulePayload = { title: "", description: "", sort_order: 0, is_enabled: true };

interface LessonFormValues {
  title: string;
  kind: LessonKind;
  sort_order: string;
  duration_minutes: string;
  content: string;
  video_url: string;
  chapters: string;
  brief: string;
  is_mandatory: boolean;
}

const emptyLessonForm: LessonFormValues = {
  title: "", kind: "video", sort_order: "0", duration_minutes: "", content: "",
  video_url: "", chapters: "", brief: "", is_mandatory: false,
};

function lessonKindIcon(kind: LessonKind) {
  if (kind === "video") return Video;
  if (kind === "assignment") return FileText;
  return BookOpen;
}

function TrainingManageDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

  const { item: training, isLoading: trainingLoading } = useAdminTrainingDetail(id);
  const { modules, isLoading: modulesLoading } = useTrainingModulesList(id);

  const createModuleMutation = useCreateAdminTrainingModule();
  const updateModuleMutation = useUpdateAdminTrainingModule();
  const deleteModuleMutation = useDeleteAdminTrainingModule();
  const publishModuleMutation = usePublishAdminTrainingModule();

  const createLessonMutation = useCreateAdminLesson();
  const updateLessonMutation = useUpdateAdminLesson();
  const deleteLessonMutation = useDeleteAdminLesson();
  const publishLessonMutation = usePublishAdminLesson();

  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(null);
  const { module: expandedModule, lessons, isLoading: lessonsLoading } = useAdminModuleDetail(expandedModuleId ?? undefined);

  const [moduleDialog, setModuleDialog] = useState<{ open: boolean; row?: APIAdminTrainingModule }>({ open: false });
  const [moduleForm, setModuleForm] = useState<AdminTrainingModulePayload>(emptyModuleForm);
  const [moduleErrors, setModuleErrors] = useState<Record<string, string>>({});
  const [moduleToDelete, setModuleToDelete] = useState<APIAdminTrainingModule | null>(null);

  const [lessonDialog, setLessonDialog] = useState<{ open: boolean; moduleId: string; row?: APIAdminLesson }>({
    open: false,
    moduleId: "",
  });
  const [lessonForm, setLessonForm] = useState<LessonFormValues>(emptyLessonForm);
  const [lessonErrors, setLessonErrors] = useState<Record<string, string>>({});
  const [lessonToDelete, setLessonToDelete] = useState<{ moduleId: string; lesson: APIAdminLesson } | null>(null);

  const toggleModule = (moduleId: string) => {
    setExpandedModuleId((current) => (current === moduleId ? null : moduleId));
  };

  const openCreateModule = () => {
    setModuleForm({ ...emptyModuleForm, sort_order: modules.length });
    setModuleErrors({});
    setModuleDialog({ open: true });
  };

  const openEditModule = (m: APIAdminTrainingModule) => {
    setModuleForm({ title: m.title, description: m.description ?? "", sort_order: m.sortOrder, is_enabled: m.isEnabled });
    setModuleErrors({});
    setModuleDialog({ open: true, row: m });
  };

  const submitModule = () => {
    if (!moduleForm.title.trim()) {
      setModuleErrors({ title: "Le titre est requis" });
      return;
    }
    setModuleErrors({});

    if (moduleDialog.row) {
      updateModuleMutation.mutate(
        { moduleId: moduleDialog.row.id, payload: moduleForm },
        {
          onSuccess: () => { toast.success("Module modifié"); setModuleDialog({ open: false }); },
          onError: () => toast.error("Erreur lors de la modification du module"),
        }
      );
    } else {
      createModuleMutation.mutate(
        { trainingId: id, payload: moduleForm },
        {
          onSuccess: () => { toast.success("Module créé"); setModuleDialog({ open: false }); },
          onError: () => toast.error("Erreur lors de la création du module"),
        }
      );
    }
  };

  const handlePublishModule = (m: APIAdminTrainingModule) => {
    publishModuleMutation.mutate(m.id, {
      onSuccess: () => toast.success("Module publié"),
      onError: () => toast.error("Erreur lors de la publication du module"),
    });
  };

  const openCreateLesson = (moduleId: string) => {
    setLessonForm({ ...emptyLessonForm, sort_order: String(lessons.length) });
    setLessonErrors({});
    setLessonDialog({ open: true, moduleId });
  };

  const openEditLesson = (moduleId: string, l: APIAdminLesson) => {
    setLessonForm({
      title: l.title,
      kind: l.kind,
      sort_order: String(l.sortOrder),
      duration_minutes: l.durationMinutes != null ? String(l.durationMinutes) : "",
      content: l.content ?? "",
      video_url: l.videoUrl ?? "",
      chapters: l.chapters ?? "",
      brief: l.brief ?? "",
      is_mandatory: l.isMandatory,
    });
    setLessonErrors({});
    setLessonDialog({ open: true, moduleId, row: l });
  };

  const submitLesson = () => {
    if (!lessonForm.title.trim()) {
      setLessonErrors({ title: "Le titre est requis" });
      return;
    }
    setLessonErrors({});

    const payload: AdminLessonPayload = {
      title: lessonForm.title.trim(),
      kind: lessonForm.kind,
      sort_order: lessonForm.sort_order === "" ? undefined : Number(lessonForm.sort_order),
      duration_minutes: lessonForm.duration_minutes === "" ? undefined : Number(lessonForm.duration_minutes),
      content: lessonForm.content.trim() || undefined,
      video_url: lessonForm.video_url.trim() || undefined,
      chapters: lessonForm.chapters.trim() || undefined,
      brief: lessonForm.brief.trim() || undefined,
      is_mandatory: lessonForm.is_mandatory,
    };

    if (lessonDialog.row) {
      updateLessonMutation.mutate(
        { lessonId: lessonDialog.row.id, payload },
        {
          onSuccess: () => { toast.success("Leçon modifiée"); setLessonDialog({ open: false, moduleId: "" }); },
          onError: () => toast.error("Erreur lors de la modification de la leçon"),
        }
      );
    } else {
      createLessonMutation.mutate(
        { moduleId: lessonDialog.moduleId, payload },
        {
          onSuccess: () => { toast.success("Leçon ajoutée"); setLessonDialog({ open: false, moduleId: "" }); },
          onError: () => toast.error("Erreur lors de l'ajout de la leçon"),
        }
      );
    }
  };

  const handlePublishLesson = (l: APIAdminLesson) => {
    publishLessonMutation.mutate(l.id, {
      onSuccess: () => toast.success("Leçon publiée"),
      onError: () => toast.error("Erreur lors de la publication de la leçon"),
    });
  };

  if (trainingLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin mr-2" /> Chargement...
      </div>
    );
  }

  if (!training) {
    return (
      <>
        <div className="mb-6">
          <Button variant="outline" size="sm" onClick={() => navigate({ to: "/trainings/manage" })}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Retour
          </Button>
        </div>
        <p className="text-muted-foreground">Formation introuvable.</p>
      </>
    );
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" size="sm" onClick={() => navigate({ to: "/trainings/manage" })}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Retour
        </Button>
        <Button size="sm" onClick={openCreateModule}>
          <Plus className="h-4 w-4 mr-1" /> Nouveau module
        </Button>
      </div>

      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold">{training.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">Gestion des modules et leçons de cette formation.</p>
      </div>

      {modulesLoading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2" /> Chargement des modules...
        </div>
      ) : modules.length === 0 ? (
        <div className="rounded-2xl border bg-card p-8 text-center text-muted-foreground">
          Aucun module pour le moment. Cliquez sur "Nouveau module" pour commencer.
        </div>
      ) : (
        <div className="space-y-3">
          {[...modules].sort((a, b) => a.sortOrder - b.sortOrder).map((m) => {
            const isExpanded = expandedModuleId === m.id;
            return (
              <div key={m.id} className="rounded-2xl border bg-card overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleModule(m.id)}
                  className="flex w-full items-center justify-between gap-3 p-4 text-left hover:bg-muted/30"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{m.title}</span>
                      <span className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${getModuleStatusBadge(m.status)}`}>
                        {MODULE_STATUS_LABELS[m.status]}
                      </span>
                      {!m.isEnabled && (
                        <span className="inline-flex shrink-0 items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                          Désactivé
                        </span>
                      )}
                    </div>
                    {m.description && <div className="mt-0.5 text-xs text-muted-foreground truncate">{m.description}</div>}
                    <div className="mt-0.5 text-[11px] text-muted-foreground/70">
                      {m.lessonsCount} leçon{m.lessonsCount !== 1 ? "s" : ""} · Ordre {m.sortOrder}
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />}
                </button>

                <div className="flex flex-wrap items-center gap-2 border-t px-4 py-2">
                  <Button type="button" variant="ghost" size="sm" onClick={() => openEditModule(m)}>
                    <Pencil className="h-3.5 w-3.5 mr-1" /> Modifier
                  </Button>
                  {m.status === "draft" && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => handlePublishModule(m)} disabled={publishModuleMutation.isPending}>
                      <Rocket className="h-3.5 w-3.5 mr-1" /> Publier
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => setModuleToDelete(m)}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" /> Supprimer
                  </Button>
                </div>

                {isExpanded && (
                  <div className="border-t bg-muted/20 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <ListChecks className="h-4 w-4 text-primary" /> Leçons
                      </div>
                      <Button type="button" size="sm" variant="outline" onClick={() => openCreateLesson(m.id)}>
                        <Plus className="h-3.5 w-3.5 mr-1" /> Ajouter une leçon
                      </Button>
                    </div>

                    {lessonsLoading ? (
                      <div className="text-sm text-muted-foreground">Chargement...</div>
                    ) : lessons.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Aucune leçon pour ce module.</p>
                    ) : (
                      <div className="space-y-2">
                        {[...lessons].sort((a, b) => a.sortOrder - b.sortOrder).map((l) => {
                          const Icon = lessonKindIcon(l.kind);
                          return (
                            <div key={l.id} className="flex items-center justify-between gap-3 rounded-lg border bg-card p-3 text-sm">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <Icon className="h-3.5 w-3.5 shrink-0 text-primary" />
                                  <span className="font-medium truncate">{l.title}</span>
                                  {l.isMandatory && <span className="text-destructive text-xs">*</span>}
                                  <span className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${getLessonStatusBadge(l.status)}`}>
                                    {LESSON_STATUS_LABELS[l.status]}
                                  </span>
                                </div>
                                <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                                  <span>{LESSON_KIND_LABELS[l.kind] ?? l.kind}</span>
                                  {l.durationMinutes != null && (
                                    <span className="inline-flex items-center gap-1">
                                      <Clock className="h-3 w-3" /> {l.durationMinutes} min
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex shrink-0 items-center gap-1">
                                <Button type="button" variant="ghost" size="sm" onClick={() => openEditLesson(m.id, l)}>
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                {l.status !== "published" && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handlePublishLesson(l)}
                                    disabled={publishLessonMutation.isPending}
                                  >
                                    <Rocket className="h-3.5 w-3.5" />
                                  </Button>
                                )}
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive hover:bg-destructive/10"
                                  onClick={() => setLessonToDelete({ moduleId: m.id, lesson: l })}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Dialog module */}
      <Dialog open={moduleDialog.open} onOpenChange={(v) => setModuleDialog({ open: v, row: moduleDialog.row })}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{moduleDialog.row ? "Modifier le module" : "Nouveau module"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Titre</Label>
              <Input value={moduleForm.title} onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })} />
              {moduleErrors.title && <p className="text-xs text-destructive mt-1">{moduleErrors.title}</p>}
            </div>
            <div>
              <Label>Description</Label>
              <Textarea rows={3} value={moduleForm.description} onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Ordre d'affichage</Label>
                <Input
                  type="number"
                  min={0}
                  value={moduleForm.sort_order ?? 0}
                  onChange={(e) => setModuleForm({ ...moduleForm, sort_order: Number(e.target.value) })}
                />
              </div>
              {moduleDialog.row && (
                <div className="flex items-end gap-3">
                  <Label className="mb-2">Module activé</Label>
                  <Switch
                    checked={!!moduleForm.is_enabled}
                    onCheckedChange={(v) => setModuleForm({ ...moduleForm, is_enabled: v })}
                  />
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModuleDialog({ open: false })}>Annuler</Button>
            <Button onClick={submitModule} disabled={createModuleMutation.isPending || updateModuleMutation.isPending}>
              {moduleDialog.row ? "Enregistrer" : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog leçon */}
      <Dialog open={lessonDialog.open} onOpenChange={(v) => setLessonDialog({ ...lessonDialog, open: v })}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{lessonDialog.row ? "Modifier la leçon" : "Nouvelle leçon"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Titre</Label>
              <Input value={lessonForm.title} onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })} />
              {lessonErrors.title && <p className="text-xs text-destructive mt-1">{lessonErrors.title}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Type</Label>
                <Select value={lessonForm.kind} onValueChange={(v) => setLessonForm({ ...lessonForm, kind: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(LESSON_KIND_LABELS).map(([k, l]) => (<SelectItem key={k} value={k}>{l}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Durée (minutes)</Label>
                <Input
                  type="number"
                  min={0}
                  value={lessonForm.duration_minutes}
                  onChange={(e) => setLessonForm({ ...lessonForm, duration_minutes: e.target.value })}
                />
              </div>
              <div>
                <Label>Ordre d'affichage</Label>
                <Input
                  type="number"
                  min={0}
                  value={lessonForm.sort_order}
                  onChange={(e) => setLessonForm({ ...lessonForm, sort_order: e.target.value })}
                />
              </div>
              <div className="flex items-end gap-3">
                <Label className="mb-2">Obligatoire</Label>
                <Switch
                  checked={lessonForm.is_mandatory}
                  onCheckedChange={(v) => setLessonForm({ ...lessonForm, is_mandatory: v })}
                />
              </div>
            </div>

            {lessonForm.kind === "video" && (
              <div>
                <Label>URL de la vidéo</Label>
                <Input value={lessonForm.video_url} onChange={(e) => setLessonForm({ ...lessonForm, video_url: e.target.value })} placeholder="https://..." />
              </div>
            )}

            <div>
              <Label>Résumé / consigne courte</Label>
              <Textarea rows={2} value={lessonForm.brief} onChange={(e) => setLessonForm({ ...lessonForm, brief: e.target.value })} />
            </div>

            <div>
              <Label>Contenu détaillé (optionnel)</Label>
              <Textarea rows={4} value={lessonForm.content} onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })} />
            </div>

            <div>
              <Label>Chapitres (optionnel)</Label>
              <Textarea rows={2} value={lessonForm.chapters} onChange={(e) => setLessonForm({ ...lessonForm, chapters: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLessonDialog({ open: false, moduleId: "" })}>Annuler</Button>
            <Button onClick={submitLesson} disabled={createLessonMutation.isPending || updateLessonMutation.isPending}>
              {lessonDialog.row ? "Enregistrer" : "Ajouter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDelete
        open={!!moduleToDelete}
        onOpenChange={(v) => !v && setModuleToDelete(null)}
        onConfirm={() => {
          if (!moduleToDelete) return;
          deleteModuleMutation.mutate(
            { trainingId: id, moduleId: moduleToDelete.id },
            {
              onSuccess: () => {
                toast.success("Module supprimé");
                if (expandedModuleId === moduleToDelete.id) setExpandedModuleId(null);
                setModuleToDelete(null);
              },
              onError: () => toast.error("Erreur lors de la suppression du module"),
            }
          );
        }}
        title={`Supprimer le module "${moduleToDelete?.title}" et toutes ses leçons ?`}
      />

      <ConfirmDelete
        open={!!lessonToDelete}
        onOpenChange={(v) => !v && setLessonToDelete(null)}
        onConfirm={() => {
          if (!lessonToDelete) return;
          deleteLessonMutation.mutate(
            { moduleId: lessonToDelete.moduleId, lessonId: lessonToDelete.lesson.id },
            {
              onSuccess: () => { toast.success("Leçon supprimée"); setLessonToDelete(null); },
              onError: () => toast.error("Erreur lors de la suppression de la leçon"),
            }
          );
        }}
        title={`Supprimer la leçon "${lessonToDelete?.lesson.title}" ?`}
      />
    </>
  );
}