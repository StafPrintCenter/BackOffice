import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AdminShell, PageHeader, DataTable } from "@/components/site";
import { useAdminStudentsList } from "@/stores/useStudentsStore";
import type { APIAdminStudentListItem } from "@/data/students";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/admin/members/students/")({
  head: () => ({
    meta: [{ title: `Apprenants | ${SITE.name}` }, { name: "robots", content: "noindex" }],
  }),
  component: AdminStudents,
});

function AdminStudents() {
  const navigate = useNavigate();
  const { items, isLoading } = useAdminStudentsList({ perPage: 100 });

  return (
    <AdminShell>
      <PageHeader title="Apprenants" description="Consultez et modérez les comptes apprenants." />

      <DataTable<APIAdminStudentListItem>
        data={items}
        isLoading={isLoading}
        searchKeys={["fullname", "email", "occupation"]}
        onView={(r) => navigate({ to: "/admin/members/students/$id", params: { id: r.id } })}
        columns={[
          {
            key: "fullname",
            label: "Apprenant",
            render: (r) => (
              <div>
                <div className="font-medium">{r.fullname}</div>
                <div className="text-xs text-muted-foreground">{r.email}</div>
              </div>
            ),
          },
          { key: "phone", label: "Téléphone", render: (r) => <span className="text-xs">{r.phone || "-"}</span> },
          {
            key: "birthDate",
            label: "Date de naissance",
            render: (r) => <span className="text-xs">{r.birthDate || "-"
            }</span>
          },
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