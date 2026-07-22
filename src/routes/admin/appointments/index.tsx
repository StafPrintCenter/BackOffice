import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { MapPin, Video } from "lucide-react";
import { AdminShell, PageHeader, DataTable } from "@/components/site";
import { useAdminAppointmentsList } from "@/stores/useAppointmentsStore";
import { APPOINTMENT_MODE_LABELS, APPOINTMENT_STATUS_BADGES, APPOINTMENT_STATUS_LABELS, type APIAdminAppointment, type AppointmentMode, } from "@/data/appointments";

export const Route = createFileRoute("/admin/appointments/")({
  head: () => ({ meta: [{ title: "Rendez-vous — Admin" }, { name: "robots", content: "noindex" }] }),
  component: AdminAppointments,
});

const modeIcon = (m: AppointmentMode) =>
  ({ presentiel: MapPin, en_ligne: Video }[m]);

const statusBadge = (s: AppointmentStatus) =>
({
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-rose-100 text-rose-700",
  completed: "bg-blue-100 text-blue-700",
}[s]);

const statusLabel = (s: AppointmentStatus) =>
  ({ pending: "En attente", confirmed: "Confirmé", cancelled: "Annulé", completed: "Terminé" }[s]);

function AdminAppointments() {
  const navigate = useNavigate();
  const { items, isLoading } = useAdminAppointmentsList({ perPage: 100 });

  const rows = items.slice().sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));

  return (
    <AdminShell>
      <PageHeader title="Rendez-vous" description="Prises de rendez-vous depuis le site public." />
      <DataTable<APIAdminAppointment>
        data={rows}
        isLoading={isLoading}
        searchKeys={["firstName", "lastName", "email", "subject"]}
        onView={(r) => navigate({ to: "/admin/appointments/$id", params: { id: r.id } })}
        columns={[
          {
            key: "scheduledAt",
            label: "Créneau",
            render: (r) => {
              const dateObj = new Date(r.scheduledAt.replace("Z", ""));
              const dateFormatted = dateObj.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric", });
              const timeFormatted = dateObj.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", });

              return (
                <div className="text-xs">
                  <div className="font-medium text-foreground">{dateFormatted}</div>
                  <div className="text-muted-foreground mt-0.5">
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
            render: (r) => {
              const Icon = modeIcon(r.mode);
              return (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                  <Icon className="h-3 w-3" /> {APPOINTMENT_MODE_LABELS[r.mode]}
                </span>
              );
            },
          },
          {
            key: "subject",
            label: "Sujet",
            render: (r) => <span className="text-xs font-medium line-clamp-1 max-w-md">{r.subject}</span>,
          },
          {
            key: "status",
            label: "Statut",
            render: (r) => (
              <span className={"inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium " + APPOINTMENT_STATUS_BADGES[r.status]}>
                {APPOINTMENT_STATUS_LABELS[r.status]}
              </span>
            ),
          },
        ]}
      />
    </AdminShell>
  );
}