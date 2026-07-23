import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AdminShell, PageHeader, DataTable } from "@/components/site";
import { useAdminContactsList } from "@/stores/useContactsStore";
import {
  type APIAdminContactListItem,
  CONTACT_STATUS_BADGES,
  CONTACT_STATUS_LABELS,
} from "@/data/contact";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/admin/messages/")({
  head: () => ({
    meta: [
      { title: `Messages | ${SITE.name}` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminMessages,
});

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
              <span className={"inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium " + CONTACT_STATUS_BADGES[r.status]}>
                {CONTACT_STATUS_LABELS[r.status]}
              </span>
            ),
          },
        ]}
      />
    </AdminShell>
  );
}
