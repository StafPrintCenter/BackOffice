import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/site";
import { GraduationCap, ClipboardClock, UserRoundPlus, Speech } from "lucide-react";
import { SITE } from "@/data/site";
import { useReviewRequests } from "@/stores/useTrainingSessionsStore";
import { SessionsTab } from "@/components/trainings/sessions/SessionsTab";
import { ReviewRequestsTab } from "@/components/trainings/sessions/ReviewRequestsTab";

type Search = { tab?: "sessions" | "reviews"; trainingId?: string };

export const Route = createFileRoute("/_admin/trainings/sessions/")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    tab: s.tab === "reviews" ? "reviews" : undefined,
    trainingId: typeof s.trainingId === "string" ? s.trainingId : undefined,
  }),
  head: () => ({ meta: [{ title: `Sessions | ${SITE.name}` }, { name: "robots", content: "noindex" }] }),
  component: SessionsPage,
});

function SessionsPage() {
  const { tab = "sessions", trainingId } = Route.useSearch();
  const navigate = useNavigate({ from: "/trainings/sessions/" });
  const { meta } = useReviewRequests({ status: "pending", trainingId, perPage: 1 });
  const pending = meta?.pendingTotal ?? 0;

  const go = (t: "sessions" | "reviews") => navigate({ search: (p) => ({ ...p, tab: t === "sessions" ? undefined : t }), replace: true });

  const tabClass = (active: boolean) =>
    `cursor-pointer border-b-2 px-4 py-2 text-sm font-medium transition ${active ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`;

  return (
    <>
      <PageHeader
        title="Sessions"
        description="Sessions de toutes les formations."
      />
      <p className="text-sm text-muted-foreground">
        Sessions de toutes les formations{trainingId && " (filtrées sur une formation)"}.
      </p>

      {/* Raccourci */}
      <div className="flex items-center gap-6 mb-4">
        <Link to="/trainings/catalogs" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
          <GraduationCap className="h-4 w-4" /> Voir le catalogue des formations
        </Link>

        <Link to="/trainings/reviews" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
          <ClipboardClock className="h-4 w-4" /> Voir les soumissions en attente
        </Link>

        <Link to="/trainings/registrations" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
          <UserRoundPlus className="h-4 w-4" /> Voir les inscriptions
        </Link>

        <Link to="/trainings/sessions" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
          <Speech className="h-4 w-4" /> Voir sessions
        </Link>
      </div>

      <div className="mb-6 flex gap-1 border-b">
        <button className={tabClass(tab === "sessions")} onClick={() => go("sessions")}>Sessions</button>
        <button className={tabClass(tab === "reviews")} onClick={() => go("reviews")}>
          Demandes d'examen
          {pending > 0 && <span className="ml-2 rounded-full bg-destructive px-1.5 py-0.5 text-[10px] font-bold text-white">{pending}</span>}
        </button>
      </div>

      {tab === "reviews" ? <ReviewRequestsTab trainingId={trainingId} /> : <SessionsTab trainingId={trainingId} />}
    </>
  );
}