import { useState } from "react";
import { GraduationCap, Eye, MessageCircle, Paperclip, Pencil, SmilePlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPostDate, initials, type APIPost } from "@/data/community";
import { AnsweredBadge, AuthorRoleBadge, HiddenBadge, LockedBadge, PinnedBadge, PostTypeBadge } from "./PostBadges";
import { PostFormDialog } from "./PostFormDialog";
import { DeletePostDialog } from "./DeletePostDialog";

export function PostCard({ post: p }: { post: APIPost }) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <article className={`space-y-3 rounded-2xl border bg-card p-5 ${p.status === "hidden" ? "opacity-70" : ""}`}>
      <div className="flex items-start gap-3">
        {p.author.photo ? (
          <img src={p.author.photo} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" />
        ) : (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
            {initials(p.author.name)}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium">{p.author.name}{p.isMine && <span className="text-muted-foreground"> (vous)</span>}</span>
            <AuthorRoleBadge role={p.author.role} />
          </div>
          <div className="text-xs text-muted-foreground">
            {formatPostDate(p.createdAt)}{p.editedAt && " · modifiée"}
          </div>
        </div>
        <div className="flex shrink-0 gap-1">
          {p.permissions.canEdit && (
            <Button variant="ghost" size="icon" title="Modifier" onClick={() => setEditOpen(true)}><Pencil className="h-4 w-4" /></Button>
          )}
          {p.permissions.canDelete && (
            <Button variant="ghost" size="icon" title="Supprimer" className="text-destructive hover:bg-destructive/10" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <PostTypeBadge type={p.type} />
        <span className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-semibold" style={{ borderColor: `${p.category.color}40`, backgroundColor: `${p.category.color}15`, color: p.category.color }}>
          {p.category.name}
        </span>
        {p.isPinned && <PinnedBadge />}
        {p.isLocked && <LockedBadge />}
        {p.status === "hidden" && <HiddenBadge />}
        {p.type === "question" && p.bestAnswerId && <AnsweredBadge />}
      </div>

      <div>
        <h2 className="font-display text-lg font-semibold leading-snug">{p.title}</h2>
        <p className="mt-1 line-clamp-3 whitespace-pre-line text-sm text-muted-foreground">{p.excerpt}</p>
      </div>

      {p.status === "hidden" && p.hiddenReason && (
        <p className="rounded-md bg-rose-500/5 px-2 py-1 text-xs text-rose-600">Masquée : {p.hiddenReason}</p>
      )}

      {(p.training || p.tags.length > 0) && (
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {p.training && (
            <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-muted-foreground">
              <GraduationCap className="h-3 w-3" /> {p.training.title}
            </span>
          )}
          {p.tags.map((t) => <span key={t} className="rounded-md bg-muted/60 px-2 py-0.5 text-muted-foreground">#{t}</span>)}
        </div>
      )}

      <div className="flex flex-wrap gap-x-5 gap-y-1 border-t pt-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5" /> {p.commentsCount}</span>
        <span className="inline-flex items-center gap-1"><SmilePlus className="h-3.5 w-3.5" /> {p.reactionsTotal}</span>
        <span className="inline-flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {p.viewsCount}</span>
        {p.attachmentsCount > 0 && <span className="inline-flex items-center gap-1"><Paperclip className="h-3.5 w-3.5" /> {p.attachmentsCount}</span>}
      </div>

      {p.permissions.canEdit && <PostFormDialog mode="edit" post={p} open={editOpen} onOpenChange={setEditOpen} />}
      {p.permissions.canDelete && <DeletePostDialog post={p} open={deleteOpen} onOpenChange={setDeleteOpen} />}
    </article>
  );
}