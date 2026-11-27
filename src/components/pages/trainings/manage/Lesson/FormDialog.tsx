import type { Dispatch, SetStateAction } from "react";
import { RichTextEditor } from "@/components/site";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { LESSON_KIND_LABELS, type APIAdminLesson, type LessonKind } from "@/data/trainingModules";
import { LessonChapterFields } from "./";

export interface LessonFormValues {
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

export const EMPTY_LESSON_FORM: LessonFormValues = {
  title: "",
  kind: "video",
  sort_order: "0",
  duration_minutes: "15",
  content: "",
  video_url: "",
  chapters: [""],
  brief: "",
  is_mandatory: true,
};

export const LESSON_FORM_KINDS: Record<string, readonly LessonKind[]> = {
  chapters: ["video", "reading"],
  videoUrl: ["video"],
  content: ["reading"],
  brief: ["quiz", "exercise", "assignment", "project"],
};

interface LessonFormDialogProps {
  open: boolean;
  lesson?: APIAdminLesson;
  form: LessonFormValues;
  errors: Record<string, string>;
  setForm: Dispatch<SetStateAction<LessonFormValues>>;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
  isPending: boolean;
}

export function LessonFormDialog({
  open,
  lesson,
  form,
  errors,
  setForm,
  onOpenChange,
  onSubmit,
  isPending,
}: LessonFormDialogProps) {
  const showChapters = LESSON_FORM_KINDS.chapters.includes(form.kind);
  const showVideoUrl = LESSON_FORM_KINDS.videoUrl.includes(form.kind);
  const showContent = LESSON_FORM_KINDS.content.includes(form.kind);
  const showBrief = LESSON_FORM_KINDS.brief.includes(form.kind);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{lesson ? "Modifier la leçon" : "Nouvelle leçon"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Titre</Label>
            <Input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
            {errors.title && <p className="mt-1 text-xs text-destructive">{errors.title}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Type</Label>
              <Select value={form.kind} onValueChange={(kind) => setForm({ ...form, kind: kind as LessonKind })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(LESSON_KIND_LABELS).map(([kind, label]) => (
                    <SelectItem key={kind} value={kind}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Durée (minutes)</Label>
              <Input
                type="number"
                min={0}
                value={form.duration_minutes}
                onChange={(event) => setForm({ ...form, duration_minutes: event.target.value })}
              />
            </div>
            <div>
              <Label>Ordre d'affichage</Label>
              <Input
                type="number"
                min={0}
                value={form.sort_order}
                onChange={(event) => setForm({ ...form, sort_order: event.target.value })}
              />
            </div>
            <div className="flex items-end gap-3">
              <Label className="mb-2">Obligatoire</Label>
              <Switch
                checked={form.is_mandatory}
                onCheckedChange={(isMandatory) => setForm({ ...form, is_mandatory: isMandatory })}
              />
            </div>
          </div>

          {showVideoUrl && (
            <div>
              <Label>URL de la vidéo</Label>
              <Input
                value={form.video_url}
                onChange={(event) => setForm({ ...form, video_url: event.target.value })}
                placeholder="https://..."
              />
            </div>
          )}

          {showContent && (
            <div>
              <Label>Contenu</Label>
              <div className="mt-1">
                <RichTextEditor
                  value={form.content}
                  onChange={(content) => setForm({ ...form, content })}
                  placeholder="Rédigez le contenu de la leçon..."
                  minHeightClassName="min-h-[160px]"
                />
              </div>
            </div>
          )}

          {showBrief && (
            <div>
              <Label>Résumé / consigne</Label>
              <div className="mt-1">
                <RichTextEditor
                  value={form.brief}
                  onChange={(brief) => setForm({ ...form, brief })}
                  placeholder="Rédigez le résumé ou la consigne..."
                  minHeightClassName="min-h-[120px]"
                />
              </div>
            </div>
          )}

          {showChapters && (
            <LessonChapterFields
              chapters={form.chapters}
              onChange={(chapters) => setForm({ ...form, chapters })}
            />
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">Annuler</Button>
          </DialogClose>
          <Button type="button" onClick={onSubmit} disabled={isPending}>
            {lesson ? "Enregistrer" : "Ajouter"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
