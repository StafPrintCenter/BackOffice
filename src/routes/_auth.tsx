import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AuthShell, AuthShellProvider } from "@/components/site/AuthShell";

export const Route = createFileRoute("/_auth")({
  component: AuthLayout,
});

function AuthLayout() {
  return (
    <AuthShellProvider>
      <AuthShell>
        <Outlet />
      </AuthShell>
    </AuthShellProvider>
  );
}