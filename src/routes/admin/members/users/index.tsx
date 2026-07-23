import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AdminShell, PageHeader, DataTable } from "@/components/site";
import { useAdminUsersList } from "@/stores/useUsersStore";
import type { APIAdminUserListItem } from "@/data/users";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/admin/members/users/")({
  head: () => ({
    meta: [{ title: `Utilisateurs | ${SITE.name}` }, { name: "robots", content: "noindex" }],
  }),
  component: AdminUsers,
});

function AdminUsers() {
  const navigate = useNavigate();
  const { items, isLoading } = useAdminUsersList({ perPage: 100 });

  return (
    <AdminShell>
      <PageHeader title="Utilisateurs" description="Consultez et modérez les comptes utilisateurs." />

      <DataTable<APIAdminUserListItem>
        data={items}
        isLoading={isLoading}
        searchKeys={["fullname", "email"]}
        onView={(r) => navigate({ to: "/admin/members/users/$id", params: { id: r.id } })}
        columns={[
          {
            key: "fullname",
            label: "Utilisateur",
            render: (r) => (
              <div>
                <div className="font-medium">{r.fullname}</div>
                <div className="text-xs text-muted-foreground">{r.email}</div>
              </div>
            ),
          },
          { key: "role", label: "Rôle", render: (r) => <span className="text-xs capitalize">{r.role}</span> },
          {
            key: "isBlocked",
            label: "Statut",
            render: (r) => (
              <span
                className={
                  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium " +
                  (r.isBlocked
                    ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                    : r.isActive
                      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                      : "bg-muted text-muted-foreground border-border")
                }
              >
                {r.isBlocked ? "Bloqué" : r.isActive ? "Actif" : "Inactif"}
              </span>
            ),
          },
          {
            key: "createdAt",
            label: "Inscrit le",
            render: (r) => <span className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleDateString("fr-FR")}</span>,
          },
        ]}
      />
    </AdminShell>
  );
}