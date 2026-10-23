import { Link } from "@tanstack/react-router";
import { User } from "lucide-react";
import { formatSessionDate, type APIReviewRequest } from "@/data/trainingSessions";
import { ReviewStatusBadge, ReviewActions } from "./";

export function ReviewRequestCard({ request: r }: { request: APIReviewRequest }) {
  return (
    <Link
      to="/trainings/sessions/$id"
      params={{ id: r.session.id }}
      className="block space-y-2 rounded-lg border p-4 text-sm transition bg-card hover:bg-card/80 hover:border-primary"
    >

      <div className="space-y-3 p-4 text-sm">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            {r.session.title}

            <div className="text-xs text-muted-foreground">
              {r.session.trainingTitle} · {formatSessionDate(r.session.startsAt)}
            </div>

          </div>
          <ReviewStatusBadge status={r.status} />
        </div>

        {r.session.suspensionReason && (
          <p className="rounded-md bg-destructive/5 px-2 py-1 text-xs text-destructive">
            Suspendue : {r.session.suspensionReason}</p>
        )}

        <div className="rounded-md bg-muted/40 p-3">
          <div className="mb-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
            <User className="h-3 w-3" />
            {r.instructorName} · {formatSessionDate(r.createdAt)}
          </div>
          <p className="whitespace-pre-line text-sm">
            {r.message}
          </p>
        </div>

        {r.status === "pending" ? (
          <ReviewActions requestId={r.id} sessionTitle={r.session.title} />
        ) : (
          <div className="text-xs text-muted-foreground">
            Traitée par {r.reviewedBy ?? "-"} le {formatSessionDate(r.reviewedAt)}
            {r.rejectionReason && <span className="block text-destructive">Motif du rejet : {r.rejectionReason}</span>}
          </div>
        )}
      </div>
    </Link>
  );
}