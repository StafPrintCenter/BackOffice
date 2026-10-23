import { Flag } from "lucide-react";
import { formatSessionDate, type APISessionDetail } from "@/data/trainingSessions";
import { ReviewStatusBadge, ReviewActions } from "./";

export function SessionReviewHistory({ session: s }: { session: APISessionDetail }) {
  return (
    <div className="rounded-2xl border bg-card p-6">
      <h2 className="mb-3 flex items-center gap-2 font-semibold"><Flag className="h-4 w-4" /> Demandes d'examen</h2>
      {s.reviewRequests.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aucune demande.</p>
      ) : (
        <ul className="space-y-3">
          {s.reviewRequests.map((r) => (
            <li key={r.id} className="space-y-2 rounded-lg border p-3 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">{formatSessionDate(r.createdAt)}</span>
                <ReviewStatusBadge status={r.status} />
              </div>
              <p className="whitespace-pre-line">{r.message}</p>
              {r.status === "pending" ? (
                <ReviewActions requestId={r.id} sessionTitle={s.title} />
              ) : (
                <p className="text-xs text-muted-foreground">
                  Traitée le {formatSessionDate(r.reviewedAt)}
                  {r.rejectionReason && <span className="block text-destructive">Motif du rejet : {r.rejectionReason}</span>}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}