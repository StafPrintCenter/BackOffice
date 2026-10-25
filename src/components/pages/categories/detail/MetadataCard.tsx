import { Calendar } from "lucide-react";
import type { APIAdminCategory } from "@/data/categories";

interface CategoryMetadataCardProps {
  category: APIAdminCategory;
}

export function CategoryMetadataCard({ category }: CategoryMetadataCardProps) {
  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-2 border-b pb-3 mb-4">
        <Calendar className="h-4 w-4 text-primary" />
        <h3 className="font-display text-sm font-semibold">Métadonnées</h3>
      </div>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">ID</span>
          <span className="font-mono text-xs">{category.id}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Créée le</span>
          <span className="font-medium">
            {new Date(category.createdAt).toLocaleDateString("fr-FR")}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Modifiée le</span>
          <span className="font-medium">
            {new Date(category.updatedAt).toLocaleDateString("fr-FR")}
          </span>
        </div>
      </div>
    </div>
  );
}