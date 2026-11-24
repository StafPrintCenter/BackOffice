import { Label } from "@/components/ui/label";

interface LessonRichContentProps {
  brief: string | null;
  content: string | null;
  chapters: string[] | null;
}

export function LessonRichContent({ brief, content, chapters }: LessonRichContentProps) {
  if (!brief && !content && !chapters?.length) return null;

  return (
    <>
      {brief && (
        <div>
          <Label className="text-xs text-muted-foreground">Résumé / consigne</Label>
          <div
            className="rich-text-content mt-1 rounded-lg bg-muted/40 p-3 text-xs leading-relaxed whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: brief }}
          />
        </div>
      )}
      {content && (
        <div>
          <Label className="text-xs text-muted-foreground">Contenu</Label>
          <div
            className="rich-text-content mt-1 rounded-lg bg-muted/40 p-3 text-xs leading-relaxed whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      )}
      {chapters && chapters.length > 0 && (
        <div>
          <Label className="text-xs text-muted-foreground">Chapitres</Label>
          <ul className="mt-1 list-inside list-disc space-y-0.5 text-xs">
            {chapters.map((chapter, index) => <li key={index}>{chapter}</li>)}
          </ul>
        </div>
      )}
    </>
  );
}
