import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader, DataTable } from "@/components/site";
import { useAdminAppointmentsList } from "@/stores/useAppointmentsStore";
import { type APIAdminAppointment } from "@/data/appointments";
import { SITE } from "@/data/site";
import { appointmentColumns } from "@/components/pages/admin/appointments/home";

export const Route = createFileRoute("/_admin/appointments/")({
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
      <PageHeader title="Rendez-vous" description="Prises de rendez-vous depuis le site public." />
      <DataTable<APIAdminAppointment>
        data={rows}
        isLoading={isLoading}
        searchKeys={["firstName", "lastName", "email", "subject"]}
        onView={(r) => navigate({ to: "/appointments/$id", params: { id: r.id } })}
        columns={appointmentColumns}
      />
    </>
  );
}