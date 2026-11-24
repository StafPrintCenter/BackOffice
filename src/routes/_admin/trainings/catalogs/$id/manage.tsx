import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Plus, BookOpen } from "lucide-react";
import { ConfirmDelete } from "@/components/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useAdminTrainingDetail } from "@/stores/useTrainingsStore";
import { useTrainingModulesList, useCreateAdminTrainingModule, useUpdateAdminTrainingModule, useDeleteAdminTrainingModule, usePublishAdminTrainingModule } from "@/stores/useTrainingModulesStore";
import { useCreateAdminLesson, useUpdateAdminLesson, useDeleteAdminLesson, usePublishAdminLesson } from "@/stores/useLessonsStore";
import { useCreateAdminContentReview } from "@/stores/useContentReviewsStore";
import {
  EMPTY_LESSON_FORM,
  LESSON_FORM_KINDS,
  LessonFormDialog,
  TrainingModuleList,
  type LessonFormValues,
} from "@/components/pages/trainings/manage";
import type { APIAdminTrainingModule, AdminTrainingModulePayload, APIAdminLesson, AdminLessonPayload } from "@/data/trainingModules";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/_admin/trainings/catalogs/$id/manage")({
  head: () => ({
    meta: [
      { title: `Contenu de la formation | ${SITE.name}` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: TrainingManageDetail,
});

const emptyModuleForm: AdminTrainingModulePayload = { title: "", description: "", sort_order: 0, is_enabled: true };

// Groupes de kinds partageant les mêmes champs conditionnels.
const KINDS_WITH_CHAPTERS = LESSON_FORM_KINDS.chapters;
const KINDS_WITH_VIDEO_URL = LESSON_FORM_KINDS.videoUrl;
const KINDS_WITH_CONTENT = LESSON_FORM_KINDS.content;
const KINDS_WITH_BRIEF = LESSON_FORM_KINDS.brief;

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
  const reviewMutation = useCreateAdminContentReview();
  const [expandedModuleIds, setExpandedModuleIds] = useState<string[]>([]);
  const [expandedLessonIds, setExpandedLessonIds] = useState<string[]>([]);

  const [moduleDialog, setModuleDialog] = useState<{ open: boolean; row?: APIAdminTrainingModule }>({ open: false });
  const [moduleForm, setModuleForm] = useState<AdminTrainingModulePayload>(emptyModuleForm);
  const [moduleErrors, setModuleErrors] = useState<Record<string, string>>({});
  const [moduleToDelete, setModuleToDelete] = useState<APIAdminTrainingModule | null>(null);

  const [lessonDialog, setLessonDialog] = useState<{ open: boolean; moduleId: string; row?: APIAdminLesson }>({
    open: false,
    moduleId: "",
  });
  const [lessonForm, setLessonForm] = useState<LessonFormValues>(EMPTY_LESSON_FORM);
  const [lessonErrors, setLessonErrors] = useState<Record<string, string>>({});
  const [lessonToDelete, setLessonToDelete] = useState<{ moduleId: string; lesson: APIAdminLesson } | null>(null);

  const [reviewDialog, setReviewDialog] = useState<{
    open: boolean;
    type: "module" | "lesson" | "quiz";
    id: string;
    title: string;
    decision: "approved" | "rejected";
  } | null>(null);
  const [reviewComment, setReviewComment] = useState("");

  const toggleModule = (moduleId: string) => {
    setExpandedModuleIds((prev) =>
      prev.includes(moduleId) ? prev.filter((id) => id !== moduleId) : [...prev, moduleId]
    );
  };

  const toggleLesson = (lessonId: string) => {
    setExpandedLessonIds((prev) =>
      prev.includes(lessonId) ? prev.filter((id) => id !== lessonId) : [...prev, lessonId]
    );
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
    setLessonForm({ ...EMPTY_LESSON_FORM, sort_order: "0" });
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
      chapters: l.chapters && l.chapters.length > 0 ? l.chapters : [""],
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

    const showChapters = KINDS_WITH_CHAPTERS.includes(lessonForm.kind);
    const showVideoUrl = KINDS_WITH_VIDEO_URL.includes(lessonForm.kind);
    const showContent = KINDS_WITH_CONTENT.includes(lessonForm.kind);
    const showBrief = KINDS_WITH_BRIEF.includes(lessonForm.kind);

    const cleanChapters = showChapters ? lessonForm.chapters.map((c) => c.trim()).filter(Boolean) : [];

    const payload: AdminLessonPayload = {
      title: lessonForm.title.trim(),
      kind: lessonForm.kind,
      sort_order: lessonForm.sort_order === "" ? undefined : Number(lessonForm.sort_order),
      duration_minutes: lessonForm.duration_minutes === "" ? undefined : Number(lessonForm.duration_minutes),
      content: showContent ? (lessonForm.content.trim() || undefined) : undefined,
      video_url: showVideoUrl ? (lessonForm.video_url.trim() || undefined) : undefined,
      chapters: showChapters && cleanChapters.length > 0 ? cleanChapters : undefined,
      brief: showBrief ? (lessonForm.brief.trim() || undefined) : undefined,
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

  const openReview = (type: "module" | "lesson" | "quiz", reviewId: string, title: string, decision: "approved" | "rejected") => {
    setReviewComment("");
    setReviewDialog({ open: true, type, id: reviewId, title, decision });
  };

  const submitReview = () => {
    if (!reviewDialog) return;
    reviewMutation.mutate(
      {
        reviewable_type: reviewDialog.type,
        reviewable_id: reviewDialog.id,
        decision: reviewDialog.decision,
        comment: reviewComment.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast.success(reviewDialog.decision === "approved" ? "Contenu approuvé" : "Contenu rejeté");
          setReviewDialog(null);
        },
        onError: () => toast.error("Erreur lors de l'enregistrement de la décision"),
      }
    );
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
          <Button variant="outline" size="sm" onClick={() => navigate({ to: "/trainings/catalogs" })}>
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
        <Button variant="outline" size="sm" onClick={() => navigate({ to: "/trainings/catalogs" })}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Retour
        </Button>

        <div className="flex flex-wrap gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate({ to: "/trainings/catalogs/$id", params: { id: training.id } })}>
            <BookOpen className="h-4 w-4 mr-1" />  Voir le contenu
          </Button>
          <Button size="sm" onClick={openCreateModule}>
            <Plus className="h-4 w-4 mr-1" /> Nouveau module
          </Button>
        </div>
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
        <TrainingModuleList
          modules={modules}
          expandedModuleIds={expandedModuleIds}
          expandedLessonIds={expandedLessonIds}
          toggleModule={toggleModule}
          toggleLesson={toggleLesson}
          openEditModule={openEditModule}
          handlePublishModule={handlePublishModule}
          publishModulePending={publishModuleMutation.isPending}
          setModuleToDelete={setModuleToDelete}
          openCreateLesson={openCreateLesson}
          openEditLesson={openEditLesson}
          handlePublishLesson={handlePublishLesson}
          setLessonToDelete={setLessonToDelete}
          openReview={openReview}
          publishLessonPending={publishLessonMutation.isPending}
        />
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

      <LessonFormDialog
        open={lessonDialog.open}
        lesson={lessonDialog.row}
        form={lessonForm}
        errors={lessonErrors}
        setForm={setLessonForm}
        onOpenChange={(open) => setLessonDialog((current) => ({ ...current, open }))}
        onSubmit={submitLesson}
        isPending={createLessonMutation.isPending || updateLessonMutation.isPending}
      />

      {/* Dialog revue */}
      <Dialog open={!!reviewDialog} onOpenChange={(v) => !v && setReviewDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {reviewDialog?.decision === "approved" ? "Approuver" : "Rejeter"} "{reviewDialog?.title}"
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Commentaire (optionnel)</Label>
              <Textarea
                rows={3}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Précisez votre décision..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialog(null)}>Annuler</Button>
            <Button
              variant={reviewDialog?.decision === "rejected" ? "destructive" : "default"}
              onClick={submitReview}
              disabled={reviewMutation.isPending}
            >
              {reviewMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmer
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
                setExpandedModuleIds((prev) => prev.filter((id) => id !== moduleToDelete.id));
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
              onSuccess: () => {
                toast.success("Leçon supprimée");
                setExpandedLessonIds((prev) => prev.filter((id) => id !== lessonToDelete.lesson.id));
                setLessonToDelete(null);
              },
              onError: () => toast.error("Erreur lors de la suppression de la leçon"),
            }
          );
        }}
        title={`Supprimer la leçon "${lessonToDelete?.lesson.title}" ?`}
      />
    </>
  );
}