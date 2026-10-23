import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AlertTriangle, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE } from "@/data/site";
import { formatSessionDate } from "@/data/trainingSessions";
import { useSessionDetail } from "@/stores/useTrainingSessionsStore";
import { SessionInfoCard } from "@/components/trainings/sessions/SessionInfoCard";
import { SessionResponsesCard } from "@/components/trainings/sessions/SessionResponsesCard";
import { SessionReviewHistory } from "@/components/trainings/sessions/SessionReviewHistory";
import { SuspendSessionDialog } from "@/components/trainings/sessions/SuspendSessionDialog";
import { ReactivateSessionButton } from "@/components/trainings/sessions/ReactivateSessionButton";

export const Route = createFileRoute("/_admin/trainings/sessions/$id")({
  head: () => ({ meta: [{ title: `Session | ${SITE.name}` }, { name: "robots", content: "noindex" }] }),
  component: SessionDetail,
});

function SessionDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { session, isLoading } = useSessionDetail(id);

  const back = (
    <Button variant="outline" size="sm" onClick={() => navigate({ to: "/trainings/sessions" })}>
      <ArrowLeft className="mr-1 h-4 w-4" /> Retour
    </Button>
  );

  if (isLoading) {
    return <div className="flex items-center justify-center py-24 text-muted-foreground"><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Chargement…</div>;
  }
  if (!session) {
    return <><div className="mb-6">{back}</div><p className="text-muted-foreground">Session introuvable.</p></>;
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        {back}
        {session.status === "published"
          ? <SuspendSessionDialog sessionId={session.id} title={session.title} />
          : <ReactivateSessionButton sessionId={session.id} />}
      </div>

      <div className="max-w-3xl space-y-6">
        {session.status === "suspended" && (
          <div className="flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-destructive">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <div className="text-sm">
              <p className="font-semibold">Session suspendue</p>
              <p className="mt-0.5 text-xs text-destructive/80">
                Le {formatSessionDate(session.suspendedAt)}{session.suspendedBy && ` par ${session.suspendedBy}`}.
                {session.suspensionReason && ` Motif : « ${session.suspensionReason} »`}
              </p>
            </div>
          </div>
        )}

        <SessionInfoCard session={session} />
        <SessionResponsesCard session={session} />
        <SessionReviewHistory session={session} />
      </div>
    </>
  );
}