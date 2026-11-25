import { useAdminModuleDetail } from "@/stores/useTrainingModulesStore";
import type { APIAdminLesson } from "@/data/trainingModules";
import { LessonItem } from "../Lesson/Item";

interface ModuleLessonsListProps {
  moduleId: string;
  expandedLessonIds: string[];
  toggleLesson: (id: string) => void;
  openEditLesson: (moduleId: string, lesson: APIAdminLesson) => void;
  handlePublishLesson: (lesson: APIAdminLesson) => void;
  setLessonToDelete: (data: { moduleId: string; lesson: APIAdminLesson }) => void;
  openReview: (
    type: "module" | "lesson" | "quiz",
    id: string,
    title: string,
    decision: "approved" | "rejected",
  ) => void;
  publishLessonPending: boolean;
}

export function ModuleLessonsList({
  moduleId,
  expandedLessonIds,
  toggleLesson,
  openEditLesson,
  handlePublishLesson,
  setLessonToDelete,
  openReview,
  publishLessonPending,
}: ModuleLessonsListProps) {
  const { lessons, isLoading } = useAdminModuleDetail(moduleId);

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Chargement des leçons...</div>;
  }

  if (lessons.length === 0) {
    return <p className="text-sm text-muted-foreground">Aucune leçon pour ce module.</p>;
  }

  return (
    <div className="space-y-2">
      {[...lessons].sort((a, b) => a.sortOrder - b.sortOrder).map((lesson) => (
        <LessonItem
          key={lesson.id}
          moduleId={moduleId}
          lesson={lesson}
          isExpanded={expandedLessonIds.includes(lesson.id)}
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
