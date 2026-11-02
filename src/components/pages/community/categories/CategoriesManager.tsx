import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useCommunityCategories } from "@/stores/useCommunityStore";
import { CategoryFormDialog } from "./CategoryFormDialog";
import { CategoryRow } from "./CategoryRow";

export function CategoriesManager() {
  const { categories, isLoading } = useCommunityCategories({ includeInactive: true });
  const [createOpen, setCreateOpen] = useState(false);
  const nextOrder = categories.reduce((max, c) => Math.max(max, c.sortOrder + 1), 0);

  return (
    <>
      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Chargement…</div>
      ) : categories.length === 0 ? (
        <p className="rounded-xl border border-dashed py-16 text-center text-sm text-muted-foreground">Aucune catégorie.</p>
      ) : (
        <div className="max-w-3xl space-y-3">{categories.map((c) => <CategoryRow key={c.id} category={c} />)}</div>
      )}

      <CategoryFormDialog open={createOpen} onOpenChange={setCreateOpen} nextOrder={nextOrder} />
    </>
  );
}