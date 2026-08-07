import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AdminShell } from "@/components/site/AdminShell";

export const Route = createFileRoute("/_admin copy")({
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <AdminShell>
      <Outlet />
    </AdminShell>
  );
}