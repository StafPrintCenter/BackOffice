import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ConfirmDelete } from "@/components/site/AdminBits";
import type { APICommunityCategory } from "@/data/community";
import { useDeleteCommunityCategory, useUpdateCommunityCategory } from "@/stores/useCommunityAdminStore";
import { CategoryFormDialog } from "./CategoryFormDialog";

export function CategoryRow({ category: c }: { category: APICommunityCategory }) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const update = useUpdateCommunityCategory();
  const del = useDeleteCommunityCategory();

  const toggle = (isActive: boolean) =>
    update.mutate({ id: c.id, payload: { isActive } }, {
      onSuccess: () => toast.success(isActive ? "Catégorie activée" : "Catégorie désactivée"),
      onError: (e) => toast.error(e.message),
    });

  return (
    <div className={`flex items-center gap-4 rounded-xl border bg-card p-4 ${c.isActive ? "" : "opacity-60"}`}>
      <span className="h-8 w-2 shrink-0 rounded-full" style={{ backgroundColor: c.color }} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium">{c.name}</span>
          <code className="text-[11px] text-muted-foreground">{c.slug}</code>
          {!c.isActive && <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase text-muted-foreground">Inactive</span>}
        </div>
        {c.description && <p className="truncate text-xs text-muted-foreground">{c.description}</p>}
      </div>
      <div className="hidden text-right text-xs text-muted-foreground sm:block">
        <div><b className="text-foreground">{c.postsCount ?? 0}</b> publication(s)</div>
        <div>Ordre {c.sortOrder}</div>
      </div>
      <Switch checked={c.isActive} onCheckedChange={toggle} disabled={update.isPending} aria-label="Activer la catégorie" />
      <div className="flex gap-1">
        <Button variant="ghost" size="icon" title="Modifier" onClick={() => setEditOpen(true)}><Pencil className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon" title="Supprimer" className="text-destructive hover:bg-destructive/10" onClick={() => setDeleteOpen(true)}><Trash2 className="h-4 w-4" /></Button>
      </div>

      <CategoryFormDialog category={c} open={editOpen} onOpenChange={setEditOpen} />
      <ConfirmDelete
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={`Supprimer « ${c.name} » ?${(c.postsCount ?? 0) > 0 ? ` ${c.postsCount} publication(s) y sont rattachées.` : ""}`}
        onConfirm={() => del.mutate(c.id, {
          onSuccess: () => { toast.success("Catégorie supprimée"); setDeleteOpen(false); },
          onError: (e) => toast.error(e.message),
        })}
      />
    </div>
  );
}