import { useState } from "react";
import { Link2Off, Loader2, Lock, MessageCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AUTHOR_ROLE_LABELS, COMMENT_SORT_LABELS, type APIPost, type AuthorRole, type CommentSort } from "@/data/community";
import { useCommentsList, useLocateComment } from "@/stores/useCommunityStore";
import { Pager } from "@/components/trainings/sessions/Pager";
import { CommentForm } from "./Form";
import { CommentThread } from "./Thread";

const select = "h-8 cursor-pointer rounded-md border border-input bg-background px-2 text-xs";

interface Props {
  post: APIPost;
  focusCommentId?: string;
  onClearFocus?: () => void;
}

export function CommentsSection({ post, focusCommentId, onClearFocus }: Props) {
  const [sort, setSort] = useState<CommentSort>("recent");
  const [authorRole, setAuthorRole] = useState<AuthorRole | "">("");
  const [page, setPage] = useState(1);

  const { comments, meta, isLoading, isError } = useCommentsList(post.id, { sort, authorRole, page, perPage: 12 });
  const { located, isLoading: locating } = useLocateComment(post.id, focusCommentId);

  const focusMode = !!focusCommentId && (locating || !!located);
  const notFound = !!focusCommentId && !locating && !located;

  const closed = post.status === "hidden" || !post.permissions.canComment;
  const closedMessage = post.status === "hidden"
    ? "Cette publication est masquée : les commentaires sont fermés."
    : post.isLocked
      ? "Les commentaires sont fermés sur cette publication."
      : "Vous ne pouvez pas commenter cette publication.";

  return (
    <section className="rounded-2xl border bg-card p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-semibold">
          <MessageCircle className="h-4 w-4" /> Commentaires {meta && <span className="text-muted-foreground">({meta.total})</span>}
        </h2>
        <div className="flex gap-2">
          <select className={select} value={authorRole} onChange={(e) => { setAuthorRole(e.target.value as AuthorRole | ""); setPage(1); }}>
            <option value="">Tous les auteurs</option>
            {(Object.keys(AUTHOR_ROLE_LABELS) as AuthorRole[]).map((r) => <option key={r} value={r}>{AUTHOR_ROLE_LABELS[r]}</option>)}
          </select>
          <select className={select} value={sort} onChange={(e) => { setSort(e.target.value as CommentSort); setPage(1); }}>
            {(Object.keys(COMMENT_SORT_LABELS) as CommentSort[]).map((s) => <option key={s} value={s}>{COMMENT_SORT_LABELS[s]}</option>)}
          </select>
        </div>
      </div>

      {closed ? (
        <p className="mb-5 flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
          <Lock className="h-3.5 w-3.5" /> {closedMessage}
        </p>
      ) : (
        <div className="mb-6"><CommentForm mode="create" postId={post.id} /></div>
      )}

      {notFound && (
        <p className="mb-4 flex items-center gap-2 rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-700">
          <Link2Off className="h-3.5 w-3.5" /> Le commentaire ciblé est introuvable ou a été supprimé.
          {onClearFocus && <button onClick={onClearFocus} className="ml-auto cursor-pointer underline">Fermer</button>}
        </p>
      )}

      {focusMode ? (
        <div className="space-y-4">
          {onClearFocus && (
            <Button variant="outline" size="sm" onClick={onClearFocus}>
              <ArrowLeft className="mr-1 h-4 w-4" /> Voir tous les commentaires
            </Button>
          )}
          {locating ? (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Recherche du commentaire…
            </div>
          ) : (
            located && (
              <CommentThread
                comment={located.root}
                canInteract={!closed}
                focus={{ targetId: focusCommentId as string, replyPage: located.replyPage }}
              />
            )
          )}
        </div>
      ) : isLoading ? (
        <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Chargement…</div>
      ) : isError ? (
        <p className="text-sm text-destructive">Impossible de charger les commentaires.</p>
      ) : comments.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">Aucun commentaire pour le moment.</p>
      ) : (
        <div className="space-y-5">
          {comments.map((c) => <CommentThread key={c.id} comment={c} canInteract={!closed} />)}
        </div>
      )}

      {meta && <Pager page={meta.currentPage} lastPage={meta.lastPage} total={meta.total} onChange={setPage} />}
    </section>
  );
}