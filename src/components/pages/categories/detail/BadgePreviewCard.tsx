import { Tag } from "lucide-react";
import type { APIAdminCategory, AdminCategoryPayload } from "@/data/categories";

interface CategoryBadgePreviewCardProps {
  isEditing: boolean;
  category: APIAdminCategory;
  form: AdminCategoryPayload;
}

export function CategoryBadgePreviewCard({
  isEditing,
  category,
  form,
}: CategoryBadgePreviewCardProps) {
  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <h3 className="font-display text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
        Aperçu du badge
      </h3>
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/20 p-8 text-center">
        <div
          className={`flex h-16 w-16 items-center justify-center rounded-2xl transition-all ${isEditing ? form.color_class : category.colorClass
            }`}
        >
          <Tag className="h-7 w-7" />
        </div>
        <div className="mt-4 font-display text-lg font-bold">
          {isEditing ? form.name || "Titre" : category.name}
        </div>
        <span className="mt-1 font-mono text-xs text-muted-foreground">
          {isEditing ? form.slug || "slug" : category.slug}
        </span>
      </div>
    </div>
  );
}