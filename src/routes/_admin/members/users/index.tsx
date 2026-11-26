import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { userTableColumns } from "@/components/pages/members/users/home";
import { DataTable, PageHeader } from "@/components/site";
import type { APIAdminUserListItem } from "@/data/users";
import { SITE } from "@/data/site";
import { useAdminUsersList } from "@/stores/useUsersStore";

export const Route = createFileRoute("/_admin/members/users/")({
  head: () => ({
    meta: [{ title: `Utilisateurs | ${SITE.name}` }, { name: "robots", content: "noindex" }],
  }),
  component: AdminUsers,
});

function AdminUsers() {
  const navigate = useNavigate();
  const { items, isLoading } = useAdminUsersList({ perPage: 100 });

  return (
    <>
      <PageHeader title="Utilisateurs" description="Consultez et modérez les comptes utilisateurs." />
      <DataTable<APIAdminUserListItem>
        data={items}
        isLoading={isLoading}
        searchKeys={["fullname", "email"]}
        onView={(user) => navigate({ to: "/members/users/$id", params: { id: user.id } })}
        columns={userTableColumns}
      />
    </>
  );
}
