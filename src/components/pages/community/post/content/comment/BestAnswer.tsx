import { toast } from "sonner";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useSetBestAnswer } from "@/stores/useCommunityStore";

export function BestAnswerButton({ postId, commentId }: { postId: string; commentId: string }) {
  const best = useSetBestAnswer();
  return (
    <button
      type="button"
      disabled={best.isPending}
      onClick={() => best.mutate({ postId, commentId }, {
        onSuccess: () => toast.success("Meilleure réponse désignée"),
        onError: (e) => toast.error(e.message),
      })}
      className="inline-flex cursor-pointer items-center gap-1 hover:text-emerald-600 disabled:opacity-50"
    >
      {best.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />} Meilleure réponse
    </button>
  );
}