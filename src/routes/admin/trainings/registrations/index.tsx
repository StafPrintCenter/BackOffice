import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { GraduationCap } from "lucide-react";
import { AdminShell, PageHeader, DataTable } from "@/components/site";
import { useAdminTrainingRegistrationsList } from "@/stores/useTrainingRegistrationsStore";
import type { APIAdminTrainingRegistration, TrainingRegistrationStatus } from "@/data/trainingRegistrations";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/admin/trainings/registrations/")({
  head: () => ({
    meta: [
      { title: `Inscriptions | ${SITE.name}` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminTrainingRegistrations,
});

const statusBadge = (s: TrainingRegistrationStatus) =>
({
  pending: "bg-amber-100 text-amber-700",
  contacted: "bg-sky-100 text-sky-700",
}[s] ?? "bg-muted text-muted-foreground");

const statusLabel = (s: TrainingRegistrationStatus) =>
({
  pending: "En attente",
  contacted: "Contacté",
}[s] ?? s);

function AdminTrainingRegistrations() {
  const navigate = useNavigate();
  const { items, isLoading } = useAdminTrainingRegistrationsList({ perPage: 100 });

  return (
    <AdminShell>
      <PageHeader title="Inscriptions aux formations" description="Demandes d'inscription reçues depuis le site public." />

      {/* Onglet retour vers la liste des formations */}
      <div className="mb-4">
        <Link to="/admin/trainings/catalogs"
          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
        >
          <GraduationCap className="h-4 w-4" />
          Voir les formations
        </Link>
      </div>

      <DataTable<APIAdminTrainingRegistration>
        data={items}
        isLoading={isLoading}
        searchKeys={["firstName", "lastName", "email", "training"]}
        onView={(r) => navigate({ to: "/admin/trainings/registrations/$id", params: { id: r.id } })}
        columns={[
          {
            key: "training",
            label: "Formation",
            render: (r) => <span className="text-xs font-medium">{r.training}</span>,
          },
          {
            key: "firstName",
            label: "Candidat",
            render: (r) => (
              <div>
                <div className="font-medium">{r.firstName} {r.lastName}</div>
                <div className="text-xs text-muted-foreground">{r.email}</div>
              </div>
            ),
          },
          {
            key: "schedulePreference",
            label: "Créneau souhaité",
            render: (r) => <span className="text-xs">{r.schedulePreference || "—"}</span>,
          },
          {
            key: "createdAt",
            label: "Reçu le",
            render: (r) => (
              <span className="text-xs text-muted-foreground">
                {new Date(r.createdAt.replace("Z", "")).toLocaleString("fr-FR", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </span>
            ),
          },
          {
            key: "status",
            label: "Statut",
            render: (r) => (
              <span className={"inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium " + statusBadge(r.status)}>
                {statusLabel(r.status)}
              </span>
            ),
          },
        ]}
      />
    </AdminShell>
  );
}