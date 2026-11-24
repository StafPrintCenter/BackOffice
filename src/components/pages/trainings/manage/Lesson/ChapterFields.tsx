import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LessonChapterFieldsProps {
  chapters: string[];
  onChange: (chapters: string[]) => void;
}

export function LessonChapterFields({ chapters, onChange }: LessonChapterFieldsProps) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <Label>Chapitres (optionnel)</Label>
        <Button type="button" variant="outline" size="sm" onClick={() => onChange([...chapters, ""])}>
          <Plus className="mr-1 h-3 w-3" /> Ajouter
        </Button>
      </div>
      <div className="mt-2 space-y-2">
        {chapters.map((chapter, index) => (
          <div key={index} className="flex gap-2">
            <Input
              placeholder={`Chapitre ${index + 1}`}
              value={chapter}
              onChange={(event) => {
                const nextChapters = [...chapters];
                nextChapters[index] = event.target.value;
                onChange(nextChapters);
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label={`Supprimer le chapitre ${index + 1}`}
              onClick={() => onChange(chapters.filter((_, chapterIndex) => chapterIndex !== index))}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
