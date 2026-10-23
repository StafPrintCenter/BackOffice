import { Link } from "@tanstack/react-router";
import { CalendarClock, Clock, ExternalLink, GraduationCap, MapPin, User } from "lucide-react";
import { formatDuration, formatSessionDate, formatSessionRange, type APISessionDetail } from "@/data/trainingSessions";
import { ModalityBadge, SessionStatusBadge } from "./SessionBadges";

const Row = ({ icon: Icon, children }: { icon: typeof Clock; children: React.ReactNode }) => (
  <div className="flex items-start gap-2 text-sm text-muted-foreground"><Icon className="mt-0.5 h-4 w-4 shrink-0" /><span>{children}</span></div>
);

export function SessionInfoCard({ session: s }: { session: APISessionDetail }) {
  return (
    <div className="rounded-2xl border bg-card p-6">
      <div className="flex flex-wrap items-center gap-2"><SessionStatusBadge status={s.status} /><ModalityBadge modality={s.modality} /></div>
      <h1 className="mt-3 font-display text-2xl font-bold">
        {s.title}
      </h1>
      {
        s.description && <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">
          {s.description}
        </p>
      }

      <div className="mt-5 space-y-2.5">
        <Row icon={GraduationCap}>
          <Link
            to="/trainings/catalogs/$id"
            params={{ id: s.trainingId }}
            className="text-primary hover:underline"
          >
            {s.trainingTitle}
          </Link>
        </Row>
        <Row icon={CalendarClock}>{formatSessionRange(s.startsAt, s.endsAt)}</Row>
        <Row icon={Clock}>{formatDuration(s.durationMinutes)}</Row>
        <Row icon={User}>
          <Link
            to="/members/instructors/$id"
            params={{ id: s.instructorId }}
            className="text-primary hover:underline"
          >
            {s.instructorName}
          </Link>
        </Row>
        {s.location && <Row icon={MapPin}>{s.location}</Row>}
        {s.meetingUrl && (
          <Row icon={ExternalLink}>
            <a
              href={s.meetingUrl}
              target="_blank"
              rel="noreferrer"
              className="break-all text-primary hover:underline"
            >
              {s.meetingUrl}
            </a>
          </Row>
        )}
      </div>
      <p className="mt-4 text-[11px] text-muted-foreground/70">
        Créée le {formatSessionDate(s.createdAt)}
      </p>
    </div>
  );
}