import { useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, Lock, LockOpen, Pin, PinOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { APIPost, PostModerationAction } from "@/data/community";
import { useModeratePost } from "@/stores/useCommunityStore";
import { HideDialog } from "./HideDialog";

const DONE: Record<PostModerationAction, string> = {
  pin: "Publication épinglée", unpin: "Publication désépinglée",
  lock: "Commentaires fermés", unlock: "Commentaires rouverts",
  hide: "Publication masquée", unhide: "Publication rétablie",
};

export function PostModerationBar({ post: p }: { post: APIPost }) {
  const moderate = useModeratePost();
  const [hideOpen, setHideOpen] = useState(false);
  const [hideError, setHideError] = useState<string | null>(null);

  const hidden = p.status === "hidden";
  const { canModerate, canLock, canHide } = p.permissions;
  if (!canModerate && !canLock && !canHide) return null;

  const run = (action: PostModerationAction, reason?: string) =>
    moderate.mutate({ id: p.id, action, reason }, {
      onSuccess: () => { toast.success(DONE[action]); setHideOpen(false); setHideError(null); },
      onError: (e) => (action === "hide" ? setHideError(e.message) : toast.error(e.message)),
    });

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 rounded-xl border bg-muted/30 px-3 py-2">
        <span className="text-xs font-medium text-muted-foreground">Modération</span>
        {canModerate && (
          <Button size="sm" variant="outline" disabled={moderate.isPending} onClick={() => run(p.isPinned ? "unpin" : "pin")}>
            {p.isPinned ? <><PinOff className="mr-1 h-3.5 w-3.5" /> Désépingler</> : <><Pin className="mr-1 h-3.5 w-3.5" /> Épingler</>}
          </Button>
        )}
        {canLock && (
          <Button size="sm" variant="outline" disabled={moderate.isPending} onClick={() => run(p.isLocked ? "unlock" : "lock")}>
            {p.isLocked ? <><LockOpen className="mr-1 h-3.5 w-3.5" /> Rouvrir les commentaires</> : <><Lock className="mr-1 h-3.5 w-3.5" /> Fermer les commentaires</>}
          </Button>
        )}
        {canHide && (
          hidden ? (
            <Button size="sm" variant="outline" disabled={moderate.isPending} onClick={() => run("unhide")}>
              <Eye className="mr-1 h-3.5 w-3.5" /> Rétablir
            </Button>
          ) : (
            <Button size="sm" variant="outline" className="text-destructive hover:bg-destructive/10" onClick={() => setHideOpen(true)}>
              <EyeOff className="mr-1 h-3.5 w-3.5" /> Masquer
            </Button>
          )
        )}
      </div>

      <HideDialog
        open={hideOpen}
        onOpenChange={setHideOpen}
        subject="la publication"
        pending={moderate.isPending}
        error={hideError}
        onConfirm={(reason) => run("hide", reason)}
      />
    </>
  );
}