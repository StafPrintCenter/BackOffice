import { useState } from "react";
import type { APIComment } from "@/data/community";
import { CommentItem, RepliesThread } from "../../../posts/content/comments";

interface Props {
  comment: APIComment;
  canInteract: boolean;
  canMarkBest?: boolean;
  focus?: { targetId: string; replyPage?: number };
}

export function CommentThread({ comment, canInteract, canMarkBest, focus }: Props) {
  const targetIsReply = focus?.replyPage !== undefined;
  const [open, setOpen] = useState(targetIsReply);

  return (
    <CommentItem
      comment={comment}
      canInteract={canInteract}
      canMarkBest={canMarkBest}
      highlighted={!!focus && !targetIsReply && focus.targetId === comment.id}
      onReplied={() => setOpen(true)}
    >
      <RepliesThread
        commentId={comment.id}
        repliesCount={comment.repliesCount}
        canInteract={canInteract}
        open={open}
        onOpenChange={setOpen}
        initialPage={focus?.replyPage}
        highlightId={targetIsReply ? focus?.targetId : undefined}
      />
    </CommentItem>
  );
}