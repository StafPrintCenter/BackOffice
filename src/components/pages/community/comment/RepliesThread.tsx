import { useState } from "react";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { useReplies } from "@/stores/useCommunityStore";
import { Pager } from "@/components/trainings/sessions/Pager";
import { CommentItem } from "./Item";

interface Props {
  commentId: string;
  repliesCount: number;
  canInteract: boolean;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initialPage?: number;
  highlightId?: string;
}

export function RepliesThread({ commentId, repliesCount, canInteract, open, onOpenChange, initialPage, highlightId }: Props) {
  const [page, setPage] = useState(initialPage ?? 1);
  const { replies, meta, isLoading, isError } = useReplies(commentId, page, open);

  if (repliesCount === 0 && !open) return null;

  return (
    <div className="pt-1">
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        className="inline-flex cursor-pointer items-center gap-1 px-1 text-xs font-medium text-primary hover:underline"
      >
        {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        {open ? "Masquer les réponses" : `Voir les ${repliesCount} réponse${repliesCount > 1 ? "s" : ""}`}
      </button>

      {open && (
        <div className="mt-3 space-y-4 border-l-2 pl-4">
          {isLoading ? (
            <p className="flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Chargement…</p>
          ) : isError ? (
            <p className="text-xs text-destructive">Impossible de charger les réponses.</p>
          ) : replies.length === 0 ? (
            <p className="text-xs text-muted-foreground">Aucune réponse.</p>
          ) : (
            replies.map((r) => <CommentItem key={r.id} comment={r} canInteract={canInteract} highlighted={r.id === highlightId} />)
          )}
          {meta && <Pager page={meta.currentPage} lastPage={meta.lastPage} onChange={setPage} />}
        </div>
      )}
    </div>
  );
}