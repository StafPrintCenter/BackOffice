import type { Dispatch, SetStateAction } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { QUESTION_TYPE_LABELS } from "@/data/quizzes";
import type { QuizQuestionType } from "@/data/quizzes";
import type { QuestionDialogState, QuestionFormValues } from "./quiz-form-types";

interface QuestionEditorDialogProps {
  dialog: QuestionDialogState;
  form: QuestionFormValues;
  setForm: Dispatch<SetStateAction<QuestionFormValues>>;
  errors: Record<string, string>;
  isPending: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
}

export function QuestionEditorDialog({
  dialog,
  form,
  setForm,
  errors,
  isPending,
  onOpenChange,
  onSubmit,
}: QuestionEditorDialogProps) {
  return (
    <Dialog open={dialog.open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{dialog.row ? "Modifier la question" : "Nouvelle question"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Énoncé</Label>
            <Textarea rows={2} value={form.prompt} onChange={(event) => setForm({ ...form, prompt: event.target.value })} />
            {errors.prompt && <p className="mt-1 text-xs text-destructive">{errors.prompt}</p>}
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(type) => setForm({ ...form, type: type as QuizQuestionType })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(QUESTION_TYPE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Points</Label>
              <Input type="number" min={0} value={form.points} onChange={(event) => setForm({ ...form, points: event.target.value })} />
            </div>
            <div>
              <Label>Ordre</Label>
              <Input type="number" min={0} value={form.sort_order} onChange={(event) => setForm({ ...form, sort_order: event.target.value })} />
            </div>
          </div>
          <div>
            <Label>Explication (optionnel)</Label>
            <Textarea rows={2} value={form.explanation} onChange={(event) => setForm({ ...form, explanation: event.target.value })} />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <Label>Options de réponse</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setForm({ ...form, choices: [...form.choices, { label: "", is_correct: false }] })}
              >
                <Plus className="mr-1 h-3 w-3" /> Ajouter
              </Button>
            </div>
            <div className="mt-2 space-y-2">
              {form.choices.map((choice, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Switch
                    checked={choice.is_correct}
                    aria-label={`Marquer l'option ${index + 1} comme correcte`}
                    onCheckedChange={(checked) => {
                      const choices = [...form.choices];
                      if (checked && form.type === "single") {
                        choices.forEach((item, itemIndex) => {
                          choices[itemIndex] = { ...item, is_correct: itemIndex === index };
                        });
                      } else {
                        choices[index] = { ...choices[index], is_correct: checked };
                      }
                      setForm({ ...form, choices });
                    }}
                  />
                  <Input
                    aria-label={`Option ${index + 1}`}
                    placeholder={`Option ${index + 1}`}
                    value={choice.label}
                    onChange={(event) => {
                      const choices = [...form.choices];
                      choices[index] = { ...choices[index], label: event.target.value };
                      setForm({ ...form, choices });
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label={`Supprimer l'option ${index + 1}`}
                    onClick={() => setForm({
                      ...form,
                      choices: form.choices.filter((_, choiceIndex) => choiceIndex !== index),
                    })}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
            {errors.choices && <p className="mt-1 text-xs text-destructive">{errors.choices}</p>}
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button type="button" onClick={onSubmit} disabled={isPending}>
            {dialog.row ? "Enregistrer" : "Ajouter"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
