import type { Dispatch, SetStateAction } from "react";
import { Loader2 } from "lucide-react";
import { ConfirmDelete } from "@/components/site";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LessonFormDialog } from "../Lesson/FormDialog";
import type { LessonFormValues } from "../Lesson/FormDialog";
import { TrainingModuleEditorDialog } from "./ModuleEditorDialog";
import type {
  APIAdminLesson,
  APIAdminTrainingModule,
  AdminTrainingModulePayload,
} from "@/data/trainingModules";

export interface ModuleDialogState {
  open: boolean;
  row?: APIAdminTrainingModule;
}

export interface LessonDialogState {
  open: boolean;
  moduleId: string;
  row?: APIAdminLesson;
}

export interface ContentReviewDialogState {
  type: "module" | "lesson" | "quiz";
  id: string;
  title: string;
  decision: "approved" | "rejected";
}

interface TrainingManageDialogsProps {
  moduleDialog: ModuleDialogState;
  setModuleDialog: Dispatch<SetStateAction<ModuleDialogState>>;
  moduleForm: AdminTrainingModulePayload;
  setModuleForm: Dispatch<SetStateAction<AdminTrainingModulePayload>>;
  moduleErrors: Record<string, string>;
  modulePending: boolean;
  onSubmitModule: () => void;
  lessonDialog: LessonDialogState;
  setLessonDialog: Dispatch<SetStateAction<LessonDialogState>>;
  lessonForm: LessonFormValues;
  setLessonForm: Dispatch<SetStateAction<LessonFormValues>>;
  lessonErrors: Record<string, string>;
  lessonPending: boolean;
  onSubmitLesson: () => void;
  reviewDialog: ContentReviewDialogState | null;
  setReviewDialog: Dispatch<SetStateAction<ContentReviewDialogState | null>>;
  reviewComment: string;
  setReviewComment: Dispatch<SetStateAction<string>>;
  reviewPending: boolean;
  onSubmitReview: () => void;
  moduleToDelete: APIAdminTrainingModule | null;
  onModuleDeleteDialogChange: (open: boolean) => void;
  onConfirmModuleDelete: () => void;
  lessonToDelete: { moduleId: string; lesson: APIAdminLesson } | null;
  onLessonDeleteDialogChange: (open: boolean) => void;
  onConfirmLessonDelete: () => void;
}

export function TrainingManageDialogs({
  moduleDialog,
  setModuleDialog,
  moduleForm,
  setModuleForm,
  moduleErrors,
  modulePending,
  onSubmitModule,
  lessonDialog,
  setLessonDialog,
  lessonForm,
  setLessonForm,
  lessonErrors,
  lessonPending,
  onSubmitLesson,
  reviewDialog,
  setReviewDialog,
  reviewComment,
  setReviewComment,
  reviewPending,
  onSubmitReview,
  moduleToDelete,
  onModuleDeleteDialogChange,
  onConfirmModuleDelete,
  lessonToDelete,
  onLessonDeleteDialogChange,
  onConfirmLessonDelete,
}: TrainingManageDialogsProps) {
  return (
    <>
      <TrainingModuleEditorDialog
        dialog={moduleDialog}
        setDialog={setModuleDialog}
        form={moduleForm}
        setForm={setModuleForm}
        errors={moduleErrors}
        isPending={modulePending}
        onSubmit={onSubmitModule}
      />

      <LessonFormDialog
        open={lessonDialog.open}
        lesson={lessonDialog.row}
        form={lessonForm}
        errors={lessonErrors}
        setForm={setLessonForm}
        onOpenChange={(open) => setLessonDialog((current) => ({ ...current, open }))}
        onSubmit={onSubmitLesson}
        isPending={lessonPending}
      />

      <Dialog open={!!reviewDialog} onOpenChange={(open) => !open && setReviewDialog(null)}>
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
                onChange={(event) => setReviewComment(event.target.value)}
                placeholder="Précisez votre décision..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialog(null)}>Annuler</Button>
            <Button
              variant={reviewDialog?.decision === "rejected" ? "destructive" : "default"}
              onClick={onSubmitReview}
              disabled={reviewPending}
            >
              {reviewPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDelete
        open={!!moduleToDelete}
        onOpenChange={onModuleDeleteDialogChange}
        onConfirm={onConfirmModuleDelete}
        title={`Supprimer le module "${moduleToDelete?.title}" et toutes ses leçons ?`}
      />
      <ConfirmDelete
        open={!!lessonToDelete}
        onOpenChange={onLessonDeleteDialogChange}
        onConfirm={onConfirmLessonDelete}
        title={`Supprimer la leçon "${lessonToDelete?.lesson.title}" ?`}
      />
    </>
  );
}
