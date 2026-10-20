import { Image as ImageIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AdminArticlePayload } from "@/data/articles";

interface ArticleCoverSidebarCardProps {
  isEditing: boolean;
  article: { title: string; cover: string };
  form: AdminArticlePayload;
  onChangeForm: (form: AdminArticlePayload) => void;
}

export function ArticleCoverSidebarCard({
  isEditing,
  article,
  form,
  onChangeForm,
}: ArticleCoverSidebarCardProps) {
  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-2 border-b pb-3 mb-4">
        <ImageIcon className="h-4 w-4 text-primary" />
        <h3 className="font-display text-sm font-semibold">Image de couverture</h3>
      </div>
      <div className="overflow-hidden rounded-xl border bg-muted/20">
        <img
          src={isEditing ? form.cover : article.cover}
          alt={article.title}
          className="aspect-video w-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://placehold.co/600x400?text=Pas+d'image";
          }}
        />
      </div>
      {isEditing && (
        <div className="mt-3">
          <Label htmlFor="cover" className="text-xs">
            URL de l'image
          </Label>
          <Input
            id="cover"
            value={form.cover}
            onChange={(e) => onChangeForm({ ...form, cover: e.target.value })}
            className="mt-1 text-xs"
          />
        </div>
      )}
    </div>
  );
}