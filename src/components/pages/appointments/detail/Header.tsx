import { Mail } from "lucide-react";
import { type APIAdminAppointment } from "@/data/appointments";
import { AppointmentBadge } from "../shared/Badge";
import { AppointmentModeTag } from "../shared/ModeTag";

interface AppointmentDetailHeaderProps {
  appointment: APIAdminAppointment;
}

export function AppointmentDetailHeader({ appointment: a }: AppointmentDetailHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-card p-6">
      <div>
        <div className="flex items-center gap-2">
          <AppointmentModeTag mode={a.mode} duration={a.duration} className="rounded bg-muted px-2.5 py-1 text-xs font-semibold" />
          <AppointmentBadge status={a.status} />
        </div>
        <h1 className="mt-2 font-display text-2xl font-bold">{a.subject}</h1>
        <a href={`mailto:${a.email}`} className="mt-0.5 inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
          <Mail className="h-3.5 w-3.5" /> {a.email}
        </a>
      </div>
    </div>
  );
}