import { useState } from "react";
import { toast } from "sonner";
import { LESSON_FORM_KINDS } from "./Lesson/FormDialog";
import { EMPTY_LESSON_FORM } from "./Lesson/FormDialog";
import type { LessonFormValues } from "./Lesson/FormDialog";
import type { APIAdminLesson, AdminLessonPayload } from "@/data/trainingModules";
import {
  useCreateAdminLesson,
  useDeleteAdminLesson,
  usePublishAdminLesson,
  useUpdateAdminLesson,
} from "@/stores/useLessonsStore";
import type { LessonDialogState } from "./TrainingManageDialogs";

export function useTrainingLessonManager() {
  const createMutation = useCreateAdminLesson();
  const updateMutation = useUpdateAdminLesson();
  const deleteMutation = useDeleteAdminLesson();
  const publishMutation = usePublishAdminLesson();

  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [dialog, setDialog] = useState<LessonDialogState>({ open: false, moduleId: "" });
  const [form, setForm] = useState<LessonFormValues>(EMPTY_LESSON_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [lessonToDelete, setLessonToDelete] = useState<{ moduleId: string; lesson: APIAdminLesson } | null>(null);

  const toggle = (lessonId: string) => {
    setExpandedIds((current) =>
      current.includes(lessonId)
        ? current.filter((id) => id !== lessonId)
        : [...current, lessonId]
    );
  };

  const openCreate = (moduleId: string) => {
    setForm({ ...EMPTY_LESSON_FORM, sort_order: "0" });
    setErrors({});
    setDialog({ open: true, moduleId });
  };

  const openEdit = (moduleId: string, lesson: APIAdminLesson) => {
    setForm({
      title: lesson.title,
      kind: lesson.kind,
      sort_order: String(lesson.sortOrder),
      duration_minutes: lesson.durationMinutes != null ? String(lesson.durationMinutes) : "",
      content: lesson.content ?? "",
      video_url: lesson.videoUrl ?? "",
      chapters: lesson.chapters?.length ? lesson.chapters : [""],
      brief: lesson.brief ?? "",
      is_mandatory: lesson.isMandatory,
    });
    setErrors({});
    setDialog({ open: true, moduleId, row: lesson });
  };

  const submit = () => {
    if (!form.title.trim()) {
      setErrors({ title: "Le titre est requis" });
      return;
    }

    setErrors({});
    const showChapters = LESSON_FORM_KINDS.chapters.includes(form.kind);
    const showVideoUrl = LESSON_FORM_KINDS.videoUrl.includes(form.kind);
    const showContent = LESSON_FORM_KINDS.content.includes(form.kind);
    const showBrief = LESSON_FORM_KINDS.brief.includes(form.kind);
    const chapters = showChapters ? form.chapters.map((chapter) => chapter.trim()).filter(Boolean) : [];

    const payload: AdminLessonPayload = {
      title: form.title.trim(),
      kind: form.kind,
      sort_order: form.sort_order === "" ? undefined : Number(form.sort_order),
      duration_minutes: form.duration_minutes === "" ? undefined : Number(form.duration_minutes),
      content: showContent ? (form.content.trim() || undefined) : undefined,
      video_url: showVideoUrl ? (form.video_url.trim() || undefined) : undefined,
      chapters: showChapters && chapters.length ? chapters : undefined,
      brief: showBrief ? (form.brief.trim() || undefined) : undefined,
      is_mandatory: form.is_mandatory,
    };

    if (dialog.row) {
      updateMutation.mutate(
        { lessonId: dialog.row.id, payload },
        {
          onSuccess: () => { toast.success("Leçon modifiée"); setDialog({ open: false, moduleId: "" }); },
          onError: () => toast.error("Erreur lors de la modification de la leçon"),
        }
      );
    } else {
      createMutation.mutate(
        { moduleId: dialog.moduleId, payload },
        {
          onSuccess: () => { toast.success("Leçon ajoutée"); setDialog({ open: false, moduleId: "" }); },
          onError: () => toast.error("Erreur lors de l'ajout de la leçon"),
        }
      );
    }
  };

  const publish = (lesson: APIAdminLesson) => {
    publishMutation.mutate(lesson.id, {
      onSuccess: () => toast.success("Leçon publiée"),
      onError: () => toast.error("Erreur lors de la publication de la leçon"),
    });
  };

  const confirmDelete = () => {
    if (!lessonToDelete) return;
    deleteMutation.mutate(
      { moduleId: lessonToDelete.moduleId, lessonId: lessonToDelete.lesson.id },
      {
        onSuccess: () => {
          toast.success("Leçon supprimée");
          setExpandedIds((current) => current.filter((id) => id !== lessonToDelete.lesson.id));
          setLessonToDelete(null);
        },
        onError: () => toast.error("Erreur lors de la suppression de la leçon"),
      }
    );
  };

  return {
    expandedIds,
    toggle,
    dialog,
    setDialog,
    form,
    setForm,
    errors,
    lessonToDelete,
    setLessonToDelete,
    openCreate,
    openEdit,
    submit,
    publish,
    confirmDelete,
    isSaving: createMutation.isPending || updateMutation.isPending,
    isPublishing: publishMutation.isPending,
  };
}
