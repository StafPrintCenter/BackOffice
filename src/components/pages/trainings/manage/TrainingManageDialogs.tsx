import type { Dispatch, SetStateAction } from "react";
import { Loader2 } from "lucide-react";
import { ConfirmDelete } from "@/components/site";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { LessonFormDialog } from "./LessonFormDialog";
import type { LessonFormValues } from "./LessonFormDialog";
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
      <Dialog
        open={moduleDialog.open}
        onOpenChange={(open) => setModuleDialog((current) => ({ ...current, open }))}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{moduleDialog.row ? "Modifier le module" : "Nouveau module"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Titre</Label>
              <Input value={moduleForm.title} onChange={(event) => setModuleForm({ ...moduleForm, title: event.target.value })} />
              {moduleErrors.title && <p className="mt-1 text-xs text-destructive">{moduleErrors.title}</p>}
            </div>
            <div>
              <Label>Description</Label>
              <Textarea rows={3} value={moduleForm.description} onChange={(event) => setModuleForm({ ...moduleForm, description: event.target.value })} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Ordre d'affichage</Label>
                <Input
                  type="number"
                  min={0}
                  value={moduleForm.sort_order ?? 0}
                  onChange={(event) => setModuleForm({ ...moduleForm, sort_order: Number(event.target.value) })}
                />
              </div>
              {moduleDialog.row && (
                <div className="flex items-end gap-3">
                  <Label className="mb-2">Module activé</Label>
                  <Switch
                    checked={!!moduleForm.is_enabled}
                    onCheckedChange={(enabled) => setModuleForm({ ...moduleForm, is_enabled: enabled })}
                  />
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModuleDialog({ open: false })}>Annuler</Button>
            <Button onClick={onSubmitModule} disabled={modulePending}>
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
