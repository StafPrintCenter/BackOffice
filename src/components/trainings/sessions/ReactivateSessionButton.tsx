import { toast } from "sonner";
import { Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useReactivateSession } from "@/stores/useTrainingSessionsStore";

export function ReactivateSessionButton({ sessionId }: { sessionId: string }) {
  const reactivate = useReactivateSession();
  return (
    <Button
      size="sm"
      disabled={reactivate.isPending}
      onClick={() => reactivate.mutate(sessionId, {
        onSuccess: () => toast.success("Session réactivée"),
        onError: (e) => toast.error(e.message),
      })}
    >
      {
        reactivate.isPending ? <Loader2 className="mr-1 h-4 w-4 animate-spin" />
          : <ShieldCheck className="mr-1 h-4 w-4" />
      }
      Réactiver
    </Button>
  );
}