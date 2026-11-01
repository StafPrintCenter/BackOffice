import { useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import type { APIComment } from "@/data/community";
import { useModerateComment } from "@/stores/useCommunityStore";
import { HideDialog } from "./HideDialog";

export function CommentModeration({ comment: c }: { comment: APIComment }) {
  const moderate = useModerateComment();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!c.permissions.canHide) return null;
  const hidden = c.status === "hidden";

  const run = (action: "hide" | "unhide", reason?: string) =>
    moderate.mutate({ id: c.id, action, reason }, {
      onSuccess: () => { toast.success(action === "hide" ? "Commentaire masqué" : "Commentaire rétabli"); setOpen(false); setError(null); },
      onError: (e) => (action === "hide" ? setError(e.message) : toast.error(e.message)),
    });

  return (
    <>
      {hidden ? (
        <button type="button" disabled={moderate.isPending} onClick={() => run("unhide")} className="inline-flex cursor-pointer items-center gap-1 hover:text-foreground disabled:opacity-50">
          <Eye className="h-3 w-3" /> Rétablir
        </button>
      ) : (
        <button type="button" onClick={() => setOpen(true)} className="inline-flex cursor-pointer items-center gap-1 hover:text-destructive">
          <EyeOff className="h-3 w-3" /> Masquer
        </button>
      )}
      <HideDialog open={open} onOpenChange={setOpen} subject="le commentaire" pending={moderate.isPending} error={error} onConfirm={(r) => run("hide", r)} />
    </>
  );
}