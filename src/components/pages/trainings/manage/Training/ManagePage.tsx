import { ArrowLeft, BookOpen, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { APIAdminTrainingDetail } from "@/data/trainings";
import type { APIAdminTrainingModule } from "@/data/trainingModules";
import type { useTrainingLessonManager } from "../useTrainingLessonManager";
import type { useTrainingModuleManager } from "../useTrainingModuleManager";
import type { useTrainingReviewManager } from "../useTrainingReviewManager";
import { TrainingManageDialogs } from "./ManageDialogs";
import { TrainingModuleList } from "./ModuleList";

interface TrainingManagePageProps {
  training: APIAdminTrainingDetail | null;
  trainingLoading: boolean;
  modules: APIAdminTrainingModule[];
  modulesLoading: boolean;
  moduleManager: ReturnType<typeof useTrainingModuleManager>;
  lessonManager: ReturnType<typeof useTrainingLessonManager>;
  reviewManager: ReturnType<typeof useTrainingReviewManager>;
  onBack: () => void;
  onViewContent: (trainingId: string) => void;
}

export function TrainingManagePage({
  training,
  trainingLoading,
  modules,
  modulesLoading,
  moduleManager,
  lessonManager,
  reviewManager,
  onBack,
  onViewContent,
}: TrainingManagePageProps) {
  if (trainingLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Chargement...
      </div>
    );
  }

  if (!training) {
    return (
      <>
        <div className="mb-6">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Retour
          </Button>
        </div>
        <p className="text-muted-foreground">Formation introuvable.</p>
      </>
    );
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="mr-1 h-4 w-4" /> Retour
        </Button>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" size="sm" onClick={() => onViewContent(training.id)}>
            <BookOpen className="mr-1 h-4 w-4" /> Voir le contenu
          </Button>
          <Button size="sm" onClick={moduleManager.openCreate}>
            <Plus className="mr-1 h-4 w-4" /> Nouveau module
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold">{training.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">Gestion des modules et leçons de cette formation.</p>
      </div>

      {modulesLoading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Chargement des modules...
        </div>
      ) : modules.length === 0 ? (
        <div className="rounded-2xl border bg-card p-8 text-center text-muted-foreground">
          Aucun module pour le moment. Cliquez sur "Nouveau module" pour commencer.
        </div>
      ) : (
        <TrainingModuleList
          modules={modules}
          expandedModuleIds={moduleManager.expandedIds}
          expandedLessonIds={lessonManager.expandedIds}
          toggleModule={moduleManager.toggle}
          toggleLesson={lessonManager.toggle}
          openEditModule={moduleManager.openEdit}
          handlePublishModule={moduleManager.publish}
          publishModulePending={moduleManager.isPublishing}
          setModuleToDelete={moduleManager.setModuleToDelete}
          openCreateLesson={lessonManager.openCreate}
          openEditLesson={lessonManager.openEdit}
          handlePublishLesson={lessonManager.publish}
          setLessonToDelete={lessonManager.setLessonToDelete}
          openReview={reviewManager.open}
          publishLessonPending={lessonManager.isPublishing}
        />
      )}

      <TrainingManageDialogs
        moduleDialog={moduleManager.dialog}
        setModuleDialog={moduleManager.setDialog}
        moduleForm={moduleManager.form}
        setModuleForm={moduleManager.setForm}
        moduleErrors={moduleManager.errors}
        modulePending={moduleManager.isSaving}
        onSubmitModule={moduleManager.submit}
        lessonDialog={lessonManager.dialog}
        setLessonDialog={lessonManager.setDialog}
        lessonForm={lessonManager.form}
        setLessonForm={lessonManager.setForm}
        lessonErrors={lessonManager.errors}
        lessonPending={lessonManager.isSaving}
        onSubmitLesson={lessonManager.submit}
        reviewDialog={reviewManager.dialog}
        setReviewDialog={reviewManager.setDialog}
        reviewComment={reviewManager.comment}
        setReviewComment={reviewManager.setComment}
        reviewPending={reviewManager.isSubmitting}
        onSubmitReview={reviewManager.submit}
        moduleToDelete={moduleManager.moduleToDelete}
        onModuleDeleteDialogChange={(open) => !open && moduleManager.setModuleToDelete(null)}
        onConfirmModuleDelete={moduleManager.confirmDelete}
        lessonToDelete={lessonManager.lessonToDelete}
        onLessonDeleteDialogChange={(open) => !open && lessonManager.setLessonToDelete(null)}
        onConfirmLessonDelete={lessonManager.confirmDelete}
      />
    </>
  );
}
