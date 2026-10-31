import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { APIPost } from "@/data/community";
import { AnsweredBadge, HiddenBadge, LockedBadge, PinnedBadge, PostTypeBadge } from "../../../community/PostBadges";
import { AttachmentList, PostSidebar } from "./";
import { PostFormDialog, DeletePostDialog } from "@/components/pages/community/shared";

export function PostDetailView({ post: p }: { post: APIPost }) {
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-end gap-2">
        {p.permissions.canEdit && (
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}><Pencil className="mr-1 h-4 w-4" /> Modifier</Button>
        )}
        {p.permissions.canDelete && (
          <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="mr-1 h-4 w-4" /> Supprimer
          </Button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {p.status === "hidden" && (
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-600">
              <p className="font-semibold">Publication masquée par la modération</p>
              {p.hiddenReason && <p className="mt-0.5 text-xs">Motif : {p.hiddenReason}</p>}
            </div>
          )}

          <article className="rounded-2xl border bg-card p-6">
            <div className="mb-3 flex flex-wrap items-center gap-1.5">
              <PostTypeBadge type={p.type} />
              {p.isPinned && <PinnedBadge />}
              {p.isLocked && <LockedBadge />}
              {p.status === "hidden" && <HiddenBadge />}
              {p.type === "question" && p.bestAnswerId && <AnsweredBadge />}
            </div>
            <h1 className="font-display text-2xl font-bold leading-tight">{p.title}</h1>
            <div className="mt-4 whitespace-pre-line text-sm leading-relaxed">{p.body ?? p.excerpt}</div>

            {p.tags.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-1.5 border-t pt-4 text-xs">
                {p.tags.map((t) => <span key={t} className="rounded-md bg-muted/60 px-2 py-0.5 text-muted-foreground">#{t}</span>)}
              </div>
            )}
          </article>

          <AttachmentList attachments={p.attachments ?? []} />
        </div>

        <PostSidebar post={p} />
      </div>

      {p.permissions.canEdit && <PostFormDialog mode="edit" post={p} open={editOpen} onOpenChange={setEditOpen} />}
      {p.permissions.canDelete && (
        <DeletePostDialog post={p} open={deleteOpen} onOpenChange={setDeleteOpen} onDeleted={() => navigate({ to: "/community" })} />
      )}
    </>
  );
}