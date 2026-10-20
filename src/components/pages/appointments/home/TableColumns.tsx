import { type Column } from "@/components/site/DataTable"; // Ajustez l'import selon votre type Column
import { type APIAdminAppointment } from "@/data/appointments";
import { AppointmentBadge } from "../shared/Badge";
import { AppointmentModeTag } from "../shared/ModeTag";

export const appointmentColumns: Column<APIAdminAppointment>[] = [
  {
    key: "scheduledAt",
    label: "Créneau",
    render: (r) => {
      const dateObj = new Date(r.scheduledAt.replace("Z", ""));
      const dateFormatted = dateObj.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
      const timeFormatted = dateObj.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

      return (
        <div className="text-xs">
          <div className="font-medium text-foreground">{dateFormatted}</div>
          <div className="mt-0.5 text-muted-foreground">
            {timeFormatted} · {r.duration} min
          </div>
        </div>
      );
    },
  },
  {
    key: "firstName",
    label: "Contact",
    render: (r) => (
      <div>
        <div className="font-medium text-foreground">{r.firstName} {r.lastName}</div>
        <div className="text-xs text-muted-foreground">{r.email}</div>
      </div>
    ),
  },
  {
    key: "mode",
    label: "Mode",
    render: (r) => <AppointmentModeTag mode={r.mode} />,
  },
  {
    key: "subject",
    label: "Sujet",
    render: (r) => <span className="line-clamp-1 max-w-md text-xs font-medium">{r.subject}</span>,
  },
  {
    key: "status",
    label: "Statut",
    render: (r) => <AppointmentBadge status={r.status} />,
  },
];