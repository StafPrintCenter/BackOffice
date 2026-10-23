import { Link } from "@tanstack/react-router";
import { CalendarClock, CheckCircle2, Clock, Flag, User, XCircle } from "lucide-react";
import { formatDuration, formatSessionRange, type APISession } from "@/data/trainingSessions";
import { ModalityBadge, SessionStatusBadge } from "./SessionBadges";

interface Props {
  session: APISession;
  /** Masque le titre de la formation (utile dans la fiche formation) */
  hideTraining?: boolean;
}

export function SessionCard({ session: s, hideTraining }: Props) {
  return (
    <Link
      to="/trainings/sessions/$id"
      params={{ id: s.id }}
      className="block space-y-2 rounded-lg border p-4 text-sm transition hover:bg-muted/40"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="font-medium">{s.title}</div>
          {!hideTraining && <div className="text-xs text-muted-foreground">{s.trainingTitle}</div>}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {s.pendingReviewRequest && (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-600">
              <Flag className="h-3 w-3" /> Examen demandé
            </span>
          )}
          <ModalityBadge modality={s.modality} />
          <SessionStatusBadge status={s.status} />
        </div>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1"><CalendarClock className="h-3 w-3" /> {formatSessionRange(s.startsAt, s.endsAt)}</span>
        <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {formatDuration(s.durationMinutes)}</span>
        <span className="inline-flex items-center gap-1"><User className="h-3 w-3" /> {s.instructorName}</span>
        <span className="inline-flex items-center gap-1 text-emerald-600"><CheckCircle2 className="h-3 w-3" /> {s.confirmedCount}</span>
        <span className="inline-flex items-center gap-1 text-rose-600"><XCircle className="h-3 w-3" /> {s.declinedCount}</span>
      </div>

      {s.status === "suspended" && s.suspensionReason && (
        <p className="rounded-md bg-rose-500/5 px-2 py-1 text-xs text-rose-600">Motif : {s.suspensionReason}</p>
      )}
    </Link>
  );
}