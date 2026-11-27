import type { Dispatch, SetStateAction } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { QUIZ_MODE_LABELS } from "@/data/quizzes";
import type { QuizFormValues } from "./FormTypes";

interface QuizSettingsDialogProps {
  open: boolean;
  quizId: string | null;
  form: QuizFormValues;
  setForm: Dispatch<SetStateAction<QuizFormValues>>;
  error: string;
  isPending: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
}

export function QuizSettingsDialog({
  open,
  quizId,
  form,
  setForm,
  error,
  isPending,
  onOpenChange,
  onSubmit,
}: QuizSettingsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{quizId ? "Modifier les réglages du quiz" : "Configurer un quiz"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Mode</Label>
            <p className="text-sm text-muted-foreground">{QUIZ_MODE_LABELS[form.mode]}</p>
          </div>
          {form.mode === "quiz" && (
            <div>
              <Label>Durée limite (secondes)</Label>
              <Input
                type="number"
                min={10}
                value={form.time_limit_sec}
                onChange={(event) => setForm({ ...form, time_limit_sec: event.target.value })}
              />
              {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Seuil de réussite (%)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={form.pass_score}
                onChange={(event) => setForm({ ...form, pass_score: event.target.value })}
              />
            </div>
            <div>
              <Label>Tentatives max</Label>
              <Input
                type="number"
                min={1}
                value={form.max_attempts}
                onChange={(event) => setForm({ ...form, max_attempts: event.target.value })}
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Label>
              {form.mode === "quiz" ? "Soumission auto à la fin du temps" : "Soumission automatique"}
            </Label>
            <Switch
              checked={form.auto_submit_on_timeout}
              onCheckedChange={(autoSubmit) => setForm({ ...form, auto_submit_on_timeout: autoSubmit })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button type="button" onClick={onSubmit} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {quizId ? "Enregistrer" : "Créer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
