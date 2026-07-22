import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AdminShell, PageHeader, DataTable } from "@/components/site";
import { useAdminContactsList } from "@/stores/useContactsStore";
import type { APIAdminContactListItem, ContactStatus } from "@/data/contact";

export const Route = createFileRoute("/admin/messages/")({
  head: () => ({ meta: [{ title: "Messages — Admin" }, { name: "robots", content: "noindex" }] }),
  component: AdminMessages,
});

const statusBadge = (s: ContactStatus) =>
({
  new: "bg-blue-100 text-blue-700",
  in_progress: "bg-amber-100 text-amber-700",
  resolved: "bg-emerald-100 text-emerald-700",
  closed: "bg-muted text-muted-foreground",
}[s]);

const statusLabel = (s: ContactStatus) =>
  ({ new: "Nouveau", in_progress: "En cours", resolved: "Résolu", closed: "Fermé" }[s]);

function AdminMessages() {
  const navigate = useNavigate();
  const { items, isLoading } = useAdminContactsList({ perPage: 100 });

  return (
    <AdminShell>
      <PageHeader title="Messages" description="Messages reçus depuis le formulaire de contact." />
      <DataTable<APIAdminContactListItem>
        data={items}
        isLoading={isLoading}
        searchKeys={["name", "email", "ticketNumber", "service"]}
        onView={(r) => navigate({ to: "/admin/messages/$id", params: { id: r.id } })}
        columns={[
          {
            key: "ticketNumber",
            label: "Ticket",
            render: (r) => <span className="font-mono text-xs font-medium text-primary">{r.ticketNumber}</span>,
          },
          {
            key: "name",
            label: "Expéditeur",
            render: (r) => (
              <div>
                <div className="font-medium text-foreground">{r.name}</div>
                <div className="text-xs text-muted-foreground">{r.email}</div>
              </div>
            ),
          },
          {
            key: "service",
            label: "Service",
            render: (r) => <span className="text-xs font-medium">{r.customService || r.service}</span>,
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
