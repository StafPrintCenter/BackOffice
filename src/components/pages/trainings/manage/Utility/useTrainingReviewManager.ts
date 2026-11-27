import { useState } from "react";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api/error";
import { useCreateAdminContentReview } from "@/stores/useContentReviewsStore";
import type { ContentReviewDialogState } from "../Training/ManageDialogs";

export function useTrainingReviewManager() {
  const reviewMutation = useCreateAdminContentReview();
  const [dialog, setDialog] = useState<ContentReviewDialogState | null>(null);
  const [comment, setComment] = useState("");

  const open = (
    type: "module" | "lesson" | "quiz",
    id: string,
    title: string,
    decision: "approved" | "rejected",
  ) => {
    setComment("");
    setDialog({ type, id, title, decision });
  };

  const submit = () => {
    if (!dialog) return;
    reviewMutation.mutate(
      {
        reviewable_type: dialog.type,
        reviewable_id: dialog.id,
        decision: dialog.decision,
        comment: comment.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast.success(dialog.decision === "approved" ? "Contenu approuvé" : "Contenu rejeté");
          setDialog(null);
        },
        onError: (error) => toast.error(getApiErrorMessage(error, "Erreur lors de l'enregistrement de la décision")),
      }
    );
  };

  return {
    dialog,
    setDialog,
    comment,
    setComment,
    open,
    submit,
    isSubmitting: reviewMutation.isPending,
  };
}
