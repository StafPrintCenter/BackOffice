import { useState } from "react";
import { Calendar, CheckCircle2, ChevronDown, CircleChevronUp, Clock, Pencil, Rocket, Trash2, XCircle } from "lucide-react";
import { QuizManager } from "@/components/pages/trainings/manage/QuizManager";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAdminLessonDetail } from "@/stores/useLessonsStore";
import { getContentStatusBadgeClass, getContentStatusLabel, getLessonKindIcon, LESSON_KIND_LABELS, toYoutubeEmbedUrl } from "@/data/trainingModules";
import type { APIAdminLesson } from "@/data/trainingModules";
import { ContentCreatorBadge, formatContentDate } from "./ContentCreatorBadge";

type ReviewAction = (
  type: "module" | "lesson" | "quiz",
  id: string,
  title: string,
  decision: "approved" | "rejected",
) => void;

interface LessonItemProps {
  moduleId: string;
  lesson: APIAdminLesson;
  isExpanded: boolean;
  toggleLesson: (id: string) => void;
  openEditLesson: (moduleId: string, lesson: APIAdminLesson) => void;
  handlePublishLesson: (lesson: APIAdminLesson) => void;
  setLessonToDelete: (data: { moduleId: string; lesson: APIAdminLesson }) => void;
  openReview: ReviewAction;
  publishLessonPending: boolean;
}

export function LessonItem({
  moduleId,
  lesson,
  isExpanded,
  toggleLesson,
  openEditLesson,
  handlePublishLesson,
  setLessonToDelete,
  openReview,
  publishLessonPending,
}: LessonItemProps) {
  const Icon = getLessonKindIcon(lesson.kind);
  const { lesson: detail, isLoading: detailLoading } = useAdminLessonDetail(isExpanded ? lesson.id : undefined);
  const embedUrl = lesson.videoUrl ? toYoutubeEmbedUrl(lesson.videoUrl) : null;
  const [sessionQuizId, setSessionQuizId] = useState<string | null>(lesson.quizId ?? null);

  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <button
        type="button"
        onClick={() => toggleLesson(lesson.id)}
        className="flex w-full cursor-pointer items-center justify-between gap-3 p-3 text-left text-sm hover:bg-muted/30"
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Icon className="h-3.5 w-3.5 shrink-0 text-primary" />
            <span className="truncate font-medium">{lesson.title}</span>
            {lesson.isMandatory && <span className="text-xs text-destructive">*</span>}
            <span className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${getContentStatusBadgeClass(lesson.status)}`}>
              {getContentStatusLabel(lesson.status)}
            </span>
          </div>
          <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
            <span>{LESSON_KIND_LABELS[lesson.kind] ?? lesson.kind}</span>
            <span>· Ordre {lesson.sortOrder}</span>
            {lesson.durationMinutes != null && (
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" /> {lesson.durationMinutes} min
              </span>
            )}
          </div>
        </div>
        {isExpanded
          ? <CircleChevronUp className="h-4 w-4 shrink-0 text-primary" />
          : <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />}
      </button>

      <div className="flex flex-wrap items-center gap-2 border-t px-3 py-1.5">
        <Button type="button" variant="ghost" size="sm" onClick={() => openEditLesson(moduleId, lesson)}>
          <Pencil className="mr-1 h-3.5 w-3.5" /> Modifier
        </Button>
        {lesson.status === "pending_review" && (
          <>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-emerald-600 hover:bg-emerald-500/10"
              onClick={() => openReview("lesson", lesson.id, lesson.title, "approved")}
            >
              <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Approuver
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive hover:bg-destructive/10"
              onClick={() => openReview("lesson", lesson.id, lesson.title, "rejected")}
            >
              <XCircle className="mr-1 h-3.5 w-3.5" /> Rejeter
            </Button>
          </>
        )}
        {lesson.status !== "published" && lesson.status !== "pending_review" && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => handlePublishLesson(lesson)}
            disabled={publishLessonPending}
          >
            <Rocket className="mr-1 h-3.5 w-3.5" /> Publier
          </Button>
        )}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-destructive hover:bg-destructive/10"
          onClick={() => setLessonToDelete({ moduleId, lesson })}
        >
          <Trash2 className="mr-1 h-3.5 w-3.5" /> Supprimer
        </Button>
      </div>

      {isExpanded && (
        <div className="space-y-4 border-t bg-muted/10 p-4 text-sm">
          {detailLoading ? (
            <div className="text-muted-foreground">Chargement du détail...</div>
          ) : (
            <>
              {embedUrl && (
                <div className="aspect-video w-full overflow-hidden rounded-lg border">
                  <iframe src={embedUrl} title={lesson.title} className="h-full w-full" allowFullScreen />
                </div>
              )}
              {lesson.videoUrl && !embedUrl && (
                <a href={lesson.videoUrl} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">
                  Voir la vidéo ({lesson.videoUrl})
                </a>
              )}
              {lesson.brief && (
                <div>
                  <Label className="text-xs text-muted-foreground">Résumé / consigne</Label>
                  <div
                    className="rich-text-content mt-1 rounded-lg bg-muted/40 p-3 text-xs leading-relaxed whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: lesson.brief }}
                  />
                </div>
              )}
              {lesson.content && (
                <div>
                  <Label className="text-xs text-muted-foreground">Contenu</Label>
                  <div
                    className="rich-text-content mt-1 rounded-lg bg-muted/40 p-3 text-xs leading-relaxed whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: lesson.content }}
                  />
                </div>
              )}
              {lesson.chapters && lesson.chapters.length > 0 && (
                <div>
                  <Label className="text-xs text-muted-foreground">Chapitres</Label>
                  <ul className="mt-1 list-inside list-disc space-y-0.5 text-xs">
                    {lesson.chapters.map((chapter, index) => <li key={index}>{chapter}</li>)}
                  </ul>
                </div>
              )}
              {(lesson.kind === "quiz" || lesson.kind === "exercise") && (
                <QuizManager
                  lessonId={lesson.id}
                  quizId={sessionQuizId}
                  onQuizCreated={setSessionQuizId}
                  openReview={openReview}
                />
              )}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t pt-3 text-[11px] text-muted-foreground">
                {detail && (
                  <ContentCreatorBadge
                    createdByAdmin={detail.createdByAdmin}
                    createdByInstructor={detail.createdByInstructor}
                  />
                )}
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Créée le {formatContentDate(lesson.createdAt)}
                </span>
                <span>Obligatoire : {lesson.isMandatory ? "Oui" : "Non"}</span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
