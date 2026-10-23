import { useState } from "react";
import { Loader2 } from "lucide-react";
import { REVIEW_STATUS_LABELS, type ReviewStatus } from "@/data/trainingSessions";
import { useReviewRequests } from "@/stores/useTrainingSessionsStore";
import { Pager, ReviewRequestCard } from "./";

export function ReviewRequestsTab({ trainingId }: { trainingId?: string }) {
  const [status, setStatus] = useState<ReviewStatus | "">("pending");
  const [page, setPage] = useState(1);
  const { requests, meta, isLoading, isError } = useReviewRequests({ status, trainingId, page, perPage: 12 });

  return (
    <>
      <div className="mb-4 flex flex-wrap gap-2">
        {(["", "pending", "validated", "rejected"] as const).map((s) => (
          <button
            key={s || "all"}
            onClick={() => { setStatus(s); setPage(1); }}
            className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition ${status === s ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary"}`}
          >
            {s ? REVIEW_STATUS_LABELS[s] : "Toutes"}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Chargement…</div>
      ) : isError ? (
        <p className="text-sm text-destructive">
          Impossible de charger les demandes.
        </p>
      ) : requests.length === 0 ? (
        <p className="rounded-xl border border-dashed py-16 text-center text-sm text-muted-foreground">
          Aucune demande d'examen.
        </p>
      ) : (
        <div className="max-w-3xl space-y-3">
          {requests.map((r) => <ReviewRequestCard key={r.id} request={r} />)}
        </div>
      )}
      {meta &&
        <Pager
          page={meta.currentPage}
          lastPage={meta.lastPage}
          total={meta.total}
          onChange={setPage}
        />
      }
    </>
  );
}