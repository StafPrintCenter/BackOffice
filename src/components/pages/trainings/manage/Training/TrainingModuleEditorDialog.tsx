import type { Dispatch, SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { AdminTrainingModulePayload } from "@/data/trainingModules";
import type { ModuleDialogState } from "./TrainingManageDialogs";

interface TrainingModuleEditorDialogProps {
  dialog: ModuleDialogState;
  setDialog: Dispatch<SetStateAction<ModuleDialogState>>;
  form: AdminTrainingModulePayload;
  setForm: Dispatch<SetStateAction<AdminTrainingModulePayload>>;
  errors: Record<string, string>;
  isPending: boolean;
  onSubmit: () => void;
}

export function TrainingModuleEditorDialog({
  dialog,
  setDialog,
  form,
  setForm,
  errors,
  isPending,
  onSubmit,
}: TrainingModuleEditorDialogProps) {
  return (
    <Dialog open={dialog.open} onOpenChange={(open) => setDialog((current) => ({ ...current, open }))}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{dialog.row ? "Modifier le module" : "Nouveau module"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Titre</Label>
            <Input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
            {errors.title && <p className="mt-1 text-xs text-destructive">{errors.title}</p>}
          </div>
          <div>
            <Label>Description</Label>
            <Textarea rows={3} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Ordre d'affichage</Label>
              <Input
                type="number"
                min={0}
                value={form.sort_order ?? 0}
                onChange={(event) => setForm({ ...form, sort_order: Number(event.target.value) })}
              />
            </div>
            {dialog.row && (
              <div className="flex items-end gap-3">
                <Label className="mb-2">Module activé</Label>
                <Switch
                  checked={!!form.is_enabled}
                  onCheckedChange={(enabled) => setForm({ ...form, is_enabled: enabled })}
                />
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDialog({ open: false })}>Annuler</Button>
          <Button onClick={onSubmit} disabled={isPending}>
            {dialog.row ? "Enregistrer" : "Créer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
