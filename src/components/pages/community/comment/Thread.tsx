import { useState } from "react";
import type { APIComment } from "@/data/community";
import { CommentItem } from "./Item";
import { RepliesThread } from "./RepliesThread";

interface Props {
  comment: APIComment;
  canInteract: boolean;
  focus?: { targetId: string; replyPage?: number };
}

export function CommentThread({ comment, canInteract, focus }: Props) {
  const targetIsReply = focus?.replyPage !== undefined;
  const [open, setOpen] = useState(targetIsReply);

  return (
    <CommentItem
      comment={comment}
      canInteract={canInteract}
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