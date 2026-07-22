import { createFileRoute, Link } from "@tanstack/react-router";
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
  const { items, isLoading } = useAdminContactsList({ perPage: 100 });

  return (
    <AdminShell>
      <PageHeader title="Messages" description="Messages reçus depuis le formulaire de contact." />
      <DataTable<APIAdminContactListItem>
        data={items}
        isLoading={isLoading}
        searchKeys={["name", "email", "ticketNumber", "service"]}
        columns={[
          {
            key: "ticketNumber",
            label: "Ticket",
            render: (r) => (
              <Link
                to="/admin/messages/$id"
                params={{ id: r.id }}
                className="font-mono text-xs font-medium text-primary hover:underline"
              >
                {r.ticketNumber}
              </Link>
            ),
          },
          {
            key: "name",
            label: "Expéditeur",
            render: (r) => (
              <div>
                <div className="font-medium">{r.name}</div>
                <div className="text-xs text-muted-foreground">{r.email}</div>
              </div>
            ),
          },
          {
            key: "service",
            label: "Service",
            render: (r) => <span className="text-xs">{r.customService || r.service}</span>,
          },
          {
            key: "createdAt",
            label: "Reçu le",
            render: (r) => (
              <span className="text-xs text-muted-foreground">
                {new Date(r.createdAt).toLocaleString()}
              </span>
            ),
          },
          {
            key: "status",
            label: "Statut",
            render: (r) => (
              <span className={"rounded-full px-2 py-0.5 text-xs " + statusBadge(r.status)}>
                {statusLabel(r.status)}
              </span>
            ),
          },
        ]}
      />
    </AdminShell>
  );
}
