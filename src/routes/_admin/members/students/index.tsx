import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { DataTable, PageHeader } from "@/components/site";
import { studentTableColumns } from "@/components/pages/members/students/home";
import type { APIAdminStudentListItem } from "@/data/students";
import { SITE } from "@/data/site";
import { useAdminStudentsList } from "@/stores/useStudentsStore";

export const Route = createFileRoute("/_admin/members/students/")({
  head: () => ({
    meta: [{ title: `Apprenants | ${SITE.name}` }, { name: "robots", content: "noindex" }],
  }),
  component: AdminStudents,
});

function AdminStudents() {
  const navigate = useNavigate();
  const { items, isLoading } = useAdminStudentsList({ perPage: 100 });

  return (
    <>
      <PageHeader title="Apprenants" description="Consultez et modérez les comptes apprenants." />
      <DataTable<APIAdminStudentListItem>
        data={items}
        isLoading={isLoading}
        searchKeys={["fullname", "email", "occupation"]}
        onView={(student) =>
          navigate({ to: "/members/students/$id", params: { id: student.id } })
        }
        columns={studentTableColumns}
      />
    </>
  );
}
