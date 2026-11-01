import { useState } from "react";
import type { APIComment } from "@/data/community";
import { CommentItem } from "./Item";
import { RepliesThread } from "./RepliesThread";

export function CommentThread({ comment, canInteract }: { comment: APIComment; canInteract: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <CommentItem comment={comment} canInteract={canInteract} onReplied={() => setOpen(true)}>
      <RepliesThread
        commentId={comment.id}
        repliesCount={comment.repliesCount}
        canInteract={canInteract}
        open={open}
        onOpenChange={setOpen}
      />
    </CommentItem>
  );
}