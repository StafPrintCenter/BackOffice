import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Plus, Pencil, Trash2, Rocket, ChevronDown, CircleChevronUp, Clock, ListChecks, Calendar, ShieldCheck, ShieldOff, Crown, GraduationCap, CheckCircle2, XCircle, BookOpen } from "lucide-react";
import { ConfirmDelete } from "@/components/site/AdminBits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useAdminTrainingDetail } from "@/stores/useTrainingsStore";
import { useTrainingModulesList, useCreateAdminTrainingModule, useUpdateAdminTrainingModule, useDeleteAdminTrainingModule, usePublishAdminTrainingModule, useAdminModuleDetail } from "@/stores/useTrainingModulesStore";
import { useCreateAdminLesson, useUpdateAdminLesson, useDeleteAdminLesson, usePublishAdminLesson, useAdminLessonDetail } from "@/stores/useLessonsStore";
import { useCreateAdminContentReview } from "@/stores/useContentReviewsStore";
import { QuizManager } from "@/components/site/QuizManager";
import { getContentStatusBadgeClass, getContentStatusLabel, LESSON_KIND_LABELS, getLessonKindIcon, toYoutubeEmbedUrl, getContentCreator } from "@/data/trainingModules";
import type { APIAdminTrainingModule, AdminTrainingModulePayload, APIAdminLesson, AdminLessonPayload, LessonKind } from "@/data/trainingModules";
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

interface LessonFormValues {
  title: string;
  kind: LessonKind;
  sort_order: string;
  duration_minutes: string;
  content: string;
  video_url: string;
  chapters: string[];
  brief: string;
  is_mandatory: boolean;
}

const emptyLessonForm: LessonFormValues = {
  title: "", kind: "video", sort_order: "0", duration_minutes: "", content: "",
  video_url: "", chapters: [""], brief: "", is_mandatory: false,
};

// Groupes de kinds partageant les mêmes champs conditionnels.
const KINDS_WITH_CHAPTERS: LessonKind[] = ["video", "reading"];
const KINDS_WITH_VIDEO_URL: LessonKind[] = ["video"];
const KINDS_WITH_CONTENT: LessonKind[] = ["reading"];
const KINDS_WITH_BRIEF: LessonKind[] = ["quiz", "exercise", "assignment", "project"];

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" });
}

function CreatorBadge({ createdByAdmin, createdByInstructor }: { createdByAdmin?: string | null; createdByInstructor?: string | null }) {
  const creator = getContentCreator(createdByAdmin, createdByInstructor);
  if (!creator) return null;

  const Icon = creator.role === "admin" ? Crown : GraduationCap;
  const className =
    creator.role === "admin"
      ? "bg-violet-500/10 text-violet-600" : "bg-sky-500/10 text-sky-600";

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 ${className}`}>
      <Icon className="h-3 w-3" />
      {creator.label}
      <span className="opacity-70">({creator.role === "admin" ? "Admin" : "Instructeur"})</span>
    </span>
  );
}

// Composant pour afficher les leçons d'un module ouvert
function ModuleLessonsList({
  moduleId,
  expandedLessonIds,
  toggleLesson,
  openCreateLesson,
  openEditLesson,
  handlePublishLesson,
  setLessonToDelete,
  openReview,
  publishLessonPending,
}: {
  moduleId: string;
  expandedLessonIds: string[];
  toggleLesson: (id: string) => void;
  openCreateLesson: (moduleId: string) => void;
  openEditLesson: (moduleId: string, l: APIAdminLesson) => void;
  handlePublishLesson: (l: APIAdminLesson) => void;
  setLessonToDelete: (data: { moduleId: string; lesson: APIAdminLesson }) => void;
  openReview: (type: "module" | "lesson", id: string, title: string, decision: "approved" | "rejected") => void;
  publishLessonPending: boolean;
}) {
  const { lessons, isLoading } = useAdminModuleDetail(moduleId);

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Chargement des leçons...</div>;
  }

  if (lessons.length === 0) {
    return <p className="text-sm text-muted-foreground">Aucune leçon pour ce module.</p>;
  }

  return (
    <div className="space-y-2">
      {[...lessons]
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((l) => (
          <LessonItem
            key={l.id}
            moduleId={moduleId}
            lesson={l}
            isExpanded={expandedLessonIds.includes(l.id)}
            toggleLesson={toggleLesson}
            openEditLesson={openEditLesson}
            handlePublishLesson={handlePublishLesson}
            setLessonToDelete={setLessonToDelete}
            openReview={openReview}
            publishLessonPending={publishLessonPending}
          />
        ))}
    </div>
  );
}

// Composant pour le détail d'une leçon dépliée
function LessonItem({
  moduleId,
  lesson: l,
  isExpanded,
  toggleLesson,
  openEditLesson,
  handlePublishLesson,
  setLessonToDelete,
  openReview,
  publishLessonPending,
}: {
  moduleId: string;
  lesson: APIAdminLesson;
  isExpanded: boolean;
  toggleLesson: (id: string) => void;
  openEditLesson: (moduleId: string, l: APIAdminLesson) => void;
  handlePublishLesson: (l: APIAdminLesson) => void;
  setLessonToDelete: (data: { moduleId: string; lesson: APIAdminLesson }) => void;
  openReview: (type: "module" | "lesson", id: string, title: string, decision: "approved" | "rejected") => void;
  publishLessonPending: boolean;
}) {
  const Icon = getLessonKindIcon(l.kind);
  const { lesson: detail, isLoading: detailLoading } = useAdminLessonDetail(isExpanded ? l.id : undefined);
  const embedUrl = l.videoUrl ? toYoutubeEmbedUrl(l.videoUrl) : null;
  const [sessionQuizId, setSessionQuizId] = useState<string | null>(l.quizId ?? null);

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <button
        type="button"
        onClick={() => toggleLesson(l.id)}
        className="flex w-full items-center justify-between gap-3 p-3 text-left text-sm hover:bg-muted/30 cursor-pointer"
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Icon className="h-3.5 w-3.5 shrink-0 text-primary" />
            <span className="font-medium truncate">{l.title}</span>
            {l.isMandatory && <span className="text-destructive text-xs">*</span>}
            <span className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${getContentStatusBadgeClass(l.status)}`}>
              {getContentStatusLabel(l.status)}
            </span>
          </div>
          <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
            <span>{LESSON_KIND_LABELS[l.kind] ?? l.kind}</span>
            <span>· Ordre {l.sortOrder}</span>
            {l.durationMinutes != null && (
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" /> {l.durationMinutes} min
              </span>
            )}
          </div>
        </div>
        {isExpanded ? <CircleChevronUp className="h-4 w-4 shrink-0 text-primary" /> : <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />}
      </button>

      <div className="flex flex-wrap items-center gap-2 border-t px-3 py-1.5">
        <Button type="button" variant="ghost" size="sm" onClick={() => openEditLesson(moduleId, l)}>
          <Pencil className="h-3.5 w-3.5 mr-1" /> Modifier
        </Button>
        {l.status === "pending_review" && (
          <>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-emerald-600 hover:bg-emerald-500/10"
              onClick={() => openReview("lesson", l.id, l.title, "approved")}
            >
              <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Approuver
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive hover:bg-destructive/10"
              onClick={() => openReview("lesson", l.id, l.title, "rejected")}
            >
              <XCircle className="h-3.5 w-3.5 mr-1" /> Rejeter
            </Button>
          </>
        )}
        {l.status !== "published" && l.status !== "pending_review" && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => handlePublishLesson(l)}
            disabled={publishLessonPending}
          >
            <Rocket className="h-3.5 w-3.5 mr-1" /> Publier
          </Button>
        )}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-destructive hover:bg-destructive/10"
          onClick={() => setLessonToDelete({ moduleId, lesson: l })}
        >
          <Trash2 className="h-3.5 w-3.5 mr-1" /> Supprimer
        </Button>
      </div>

      {isExpanded && (
        <div className="border-t bg-muted/10 p-4 space-y-4 text-sm">
          {detailLoading ? (
            <div className="text-muted-foreground">Chargement du détail...</div>
          ) : (
            <>
              {embedUrl && (
                <div className="aspect-video w-full overflow-hidden rounded-lg border">
                  <iframe
                    src={embedUrl}
                    title={l.title}
                    className="h-full w-full"
                    allowFullScreen
                  />
                </div>
              )}
              {l.videoUrl && !embedUrl && (
                <a href={l.videoUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline text-xs">
                  Voir la vidéo ({l.videoUrl})
                </a>
              )}

              {l.brief && (
                <div>
                  <Label className="text-xs text-muted-foreground">Résumé / consigne</Label>
                  <p className="mt-1 rounded-lg bg-muted/40 p-3 text-xs leading-relaxed whitespace-pre-wrap">{l.brief}</p>
                </div>
              )}

              {l.content && (
                <div>
                  <Label className="text-xs text-muted-foreground">Contenu</Label>
                  <p className="mt-1 rounded-lg bg-muted/40 p-3 text-xs leading-relaxed whitespace-pre-wrap">{l.content}</p>
                </div>
              )}

              {l.chapters && l.chapters.length > 0 && (
                <div>
                  <Label className="text-xs text-muted-foreground">Chapitres</Label>
                  <ul className="mt-1 list-inside list-disc text-xs space-y-0.5">
                    {l.chapters.map((c, i) => (<li key={i}>{c}</li>))}
                  </ul>
                </div>
              )}

              {/* INTÉGRATION DU QUIZ MANAGER ICI */}
              {(l.kind === "quiz" || l.kind === "exercise") && (
                <QuizManager
                  lessonId={l.id}
                  quizId={sessionQuizId}
                  onQuizCreated={(newId) => setSessionQuizId(newId)}
                />
              )}

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t pt-3 text-[11px] text-muted-foreground">
                {detail && (
                  <CreatorBadge createdByAdmin={detail.createdByAdmin} createdByInstructor={detail.createdByInstructor} />
                )}
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Créée le {formatDate(l.createdAt)}
                </span>
                <span>Obligatoire : {l.isMandatory ? "Oui" : "Non"}</span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
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
  const [lessonForm, setLessonForm] = useState<LessonFormValues>(emptyLessonForm);
  const [lessonErrors, setLessonErrors] = useState<Record<string, string>>({});
  const [lessonToDelete, setLessonToDelete] = useState<{ moduleId: string; lesson: APIAdminLesson } | null>(null);

  const [reviewDialog, setReviewDialog] = useState<{
    open: boolean;
    type: "module" | "lesson";
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
    setLessonForm({ ...emptyLessonForm, sort_order: "0" });
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

  const openReview = (type: "module" | "lesson", reviewId: string, title: string, decision: "approved" | "rejected") => {
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

  const showChapters = KINDS_WITH_CHAPTERS.includes(lessonForm.kind);
  const showVideoUrl = KINDS_WITH_VIDEO_URL.includes(lessonForm.kind);
  const showContent = KINDS_WITH_CONTENT.includes(lessonForm.kind);
  const showBrief = KINDS_WITH_BRIEF.includes(lessonForm.kind);

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
        <div className="space-y-3">
          {[...modules].sort((a, b) => a.sortOrder - b.sortOrder).map((m) => {
            const isExpanded = expandedModuleIds.includes(m.id);
            return (
              <div key={m.id} className="rounded-2xl border bg-card overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleModule(m.id)}
                  className="flex w-full items-center justify-between gap-3 p-4 text-left hover:bg-muted/30 cursor-pointer"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium truncate">{m.title}</span>
                      <span className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${getContentStatusBadgeClass(m.status)}`}>
                        {getContentStatusLabel(m.status)}
                      </span>
                      <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${m.isEnabled ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
                        {m.isEnabled ? <ShieldCheck className="h-2.5 w-2.5" /> : <ShieldOff className="h-2.5 w-2.5" />}
                        {m.isEnabled ? "Activé" : "Désactivé"}
                      </span>
                    </div>
                    {m.description && <div className="mt-0.5 text-xs text-muted-foreground truncate">{m.description}</div>}
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground/70">
                      <span>{m.lessonsCount} leçon{m.lessonsCount !== 1 ? "s" : ""} · Ordre {m.sortOrder}</span>
                      <CreatorBadge createdByAdmin={m.createdByAdmin} createdByInstructor={m.createdByInstructor} />
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {formatDate(m.createdAt)}
                      </span>
                    </div>
                  </div>
                  {isExpanded ? <CircleChevronUp className="h-4 w-4 shrink-0 text-primary" /> : <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />}
                </button>

                <div className="flex flex-wrap items-center gap-2 border-t px-4 py-2">
                  <Button type="button" variant="ghost" size="sm" onClick={() => openEditModule(m)}>
                    <Pencil className="h-3.5 w-3.5 mr-1" /> Modifier
                  </Button>
                  {m.status === "pending_review" && (
                    <>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-emerald-600 hover:bg-emerald-500/10"
                        onClick={() => openReview("module", m.id, m.title, "approved")}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Approuver
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => openReview("module", m.id, m.title, "rejected")}
                      >
                        <XCircle className="h-3.5 w-3.5 mr-1" /> Rejeter
                      </Button>
                    </>
                  )}
                  {m.status !== "published" && m.status !== "pending_review" && (
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

                    <ModuleLessonsList
                      moduleId={m.id}
                      expandedLessonIds={expandedLessonIds}
                      toggleLesson={toggleLesson}
                      openCreateLesson={openCreateLesson}
                      openEditLesson={openEditLesson}
                      handlePublishLesson={handlePublishLesson}
                      setLessonToDelete={setLessonToDelete}
                      openReview={openReview}
                      publishLessonPending={publishLessonMutation.isPending}
                    />
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
                <Select value={lessonForm.kind} onValueChange={(v) => setLessonForm({ ...lessonForm, kind: v as LessonKind })}>
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

            {showVideoUrl && (
              <div>
                <Label>URL de la vidéo</Label>
                <Input value={lessonForm.video_url} onChange={(e) => setLessonForm({ ...lessonForm, video_url: e.target.value })} placeholder="https://..." />
              </div>
            )}

            {showContent && (
              <div>
                <Label>Contenu</Label>
                <Textarea rows={5} value={lessonForm.content} onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })} />
              </div>
            )}

            {showBrief && (
              <div>
                <Label>Résumé / consigne</Label>
                <Textarea rows={3} value={lessonForm.brief} onChange={(e) => setLessonForm({ ...lessonForm, brief: e.target.value })} />
              </div>
            )}

            {showChapters && (
              <div>
                <div className="flex items-center justify-between">
                  <Label>Chapitres (optionnel)</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setLessonForm({ ...lessonForm, chapters: [...lessonForm.chapters, ""] })}
                  >
                    <Plus className="h-3 w-3 mr-1" /> Ajouter
                  </Button>
                </div>
                <div className="mt-2 space-y-2">
                  {lessonForm.chapters.map((c, i) => (
                    <div key={i} className="flex gap-2">
                      <Input
                        placeholder={`Chapitre ${i + 1}`}
                        value={c}
                        onChange={(e) => {
                          const arr = [...lessonForm.chapters];
                          arr[i] = e.target.value;
                          setLessonForm({ ...lessonForm, chapters: arr });
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setLessonForm({ ...lessonForm, chapters: lessonForm.chapters.filter((_, idx) => idx !== i) })}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLessonDialog({ open: false, moduleId: "" })}>Annuler</Button>
            <Button onClick={submitLesson} disabled={createLessonMutation.isPending || updateLessonMutation.isPending}>
              {lessonDialog.row ? "Enregistrer" : "Ajouter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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