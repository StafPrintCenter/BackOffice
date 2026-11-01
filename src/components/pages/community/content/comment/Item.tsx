import { useEffect, useRef, useState } from "react";
import { CornerDownRight, CheckCircle2, EyeOff, Pencil, Reply, SmilePlus, Trash2 } from "lucide-react";
import { formatPostDate, initials, type APIComment } from "@/data/community";
import { AuthorRoleBadge } from "@/components/pages/community/shared";
import { CommentForm, DeleteCommentDialog } from ".";
import { ReactionBar, BestAnswerButton } from "../../reactions";

interface Props {
  comment: APIComment;
  canInteract: boolean;
  highlighted?: boolean;
  canMarkBest?: boolean;
  onReplied?: () => void;
  children?: React.ReactNode;
}

export function CommentItem({ comment: c, canInteract, highlighted, canMarkBest, onReplied, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [editing, setEditing] = useState(false);
  const [replying, setReplying] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const isReply = c.parentId !== null;

  useEffect(() => {
    if (highlighted) ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [highlighted]);

  return (
    <div
      ref={ref}
      id={highlighted ? `comment-${c.id}` : undefined}
      className={`flex gap-3 rounded-xl transition ${highlighted ? "bg-primary/5 p-2 ring-2 ring-primary/40" : ""}`}
    >
      {c.author.photo ? (
        <img src={c.author.photo} alt="" className={`shrink-0 rounded-full object-cover ${isReply ? "h-7 w-7" : "h-9 w-9"}`} />
      ) : (
        <span className={`flex shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary ${isReply ? "h-7 w-7 text-[10px]" : "h-9 w-9 text-xs"}`}>
          {initials(c.author.name)}
        </span>
      )}

      <div className="min-w-0 flex-1 space-y-1.5">
        <div className={`rounded-xl px-3.5 py-2.5 ${c.isBestAnswer ? "border border-emerald-500/30 bg-emerald-500/5" : "bg-muted/40"} ${c.status === "hidden" ? "opacity-70" : ""}`}>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
            <span className="font-medium">{c.author.name}{c.isMine && <span className="font-normal text-muted-foreground"> (vous)</span>}</span>
            <AuthorRoleBadge role={c.author.role} />
            {c.isPostAuthor && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">Auteur</span>}
            {c.isBestAnswer && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
                <CheckCircle2 className="h-3 w-3" /> Meilleure réponse
              </span>
            )}
            {c.status === "hidden" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-semibold text-rose-600">
                <EyeOff className="h-3 w-3" /> Masqué
              </span>
            )}
          </div>

          {c.replyTo && (
            <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
              <CornerDownRight className="h-3 w-3" /> en réponse à <b className="font-medium text-foreground">{c.replyTo.authorName}</b>
            </p>
          )}

          {editing ? (
            <div className="mt-2">
              <CommentForm mode="edit" comment={c} onDone={() => setEditing(false)} onCancel={() => setEditing(false)} />
            </div>
          ) : (
            <p className="mt-1 whitespace-pre-line wrap-break-word text-sm">{c.body}</p>
          )}

          {c.status === "hidden" && c.hiddenReason && <p className="mt-1 text-xs text-rose-600">Motif : {c.hiddenReason}</p>}
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-1 text-xs text-muted-foreground">
          <span>{formatPostDate(c.createdAt)}{c.editedAt && " · modifié"}</span>
          {c.reactionsTotal > 0 && <span className="inline-flex items-center gap-1"><SmilePlus className="h-3 w-3" /> {c.reactionsTotal}</span>}

          <ReactionBar
            compact
            target="comments"
            targetId={c.id}
            myReaction={c.myReaction}
            reactions={c.reactions}
            reactionsTotal={c.reactionsTotal}
            canReact={canInteract && c.permissions.canReact}
          />
          {canMarkBest && !c.isBestAnswer && c.status === "published" && (
            <BestAnswerButton postId={c.postId} commentId={c.id} />
          )}

          {canInteract && c.permissions.canReply && !editing && (
            <button type="button" onClick={() => setReplying((v) => !v)} className="inline-flex cursor-pointer items-center gap-1 hover:text-foreground">
              <Reply className="h-3 w-3" /> Répondre
            </button>
          )}
          {c.permissions.canEdit && !editing && (
            <button type="button" onClick={() => setEditing(true)} className="inline-flex cursor-pointer items-center gap-1 hover:text-foreground">
              <Pencil className="h-3 w-3" /> Modifier
            </button>
          )}
          {c.permissions.canDelete && (
            <button type="button" onClick={() => setDeleteOpen(true)} className="inline-flex cursor-pointer items-center gap-1 hover:text-destructive">
              <Trash2 className="h-3 w-3" /> Supprimer
            </button>
          )}
        </div>

        {replying && (
          <CommentForm
            mode="create"
            postId={c.postId}
            parentId={c.id}
            replyToName={c.author.name}
            onDone={() => { setReplying(false); onReplied?.(); }}
            onCancel={() => setReplying(false)}
          />
        )}

        {children}
      </div>

      <DeleteCommentDialog comment={c} open={deleteOpen} onOpenChange={setDeleteOpen} />
    </div>
  );
}