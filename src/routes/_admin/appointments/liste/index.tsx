import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CalendarDays } from "lucide-react";
import { PageHeader, DataTable } from "@/components/site";
import { Button } from "@/components/ui/button";
import { useAdminAppointmentsList } from "@/stores/useAppointmentsStore";
import { type APIAdminAppointment } from "@/data/appointments";
import { SITE } from "@/data/site";
import { appointmentColumns } from "@/components/pages/appointments/home";

export const Route = createFileRoute("/_admin/appointments/liste/")({
  head: () => ({
    meta: [
      { title: `Rendez-vous | ${SITE.name}` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminAppointments,
});

function AdminAppointments() {
  const navigate = useNavigate();
  const { items, isLoading } = useAdminAppointmentsList({ perPage: 100 });

  const rows = items.slice().sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));

  return (
    <>
      <PageHeader
        title="Rendez-vous"
        description="Prises de rendez-vous depuis le site public."
        actions={
          <div >
            <Button variant="outline" onClick={() => navigate({ to: "/appointments/calendar" })}>
              <CalendarDays className="h-4 w-4" />
              Vue calendrier
            </Button>
          </div>
        }
      />

      <DataTable<APIAdminAppointment>
        data={rows}
        isLoading={isLoading}
        searchKeys={["firstName", "lastName", "email", "subject"]}
        onView={(r) => navigate({ to: "/appointments/liste/$id", params: { id: r.id } })}
        columns={appointmentColumns}
      />
    </>
  );
}