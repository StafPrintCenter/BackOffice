import { useEffect, useRef } from "react";
import { createFileRoute, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { AdminShell } from "@/components/site/AdminShell";
import { useAdminAuth } from "@/hooks/useAdminAuth";

export const Route = createFileRoute("/_admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const { ready, isAuthenticated } = useAdminAuth();
  const navigate = useNavigate();
  const currentHref = useLocation({ select: (location) => location.href });
  const requestedHref = useRef(currentHref);
  const redirectStarted = useRef(false);

  useEffect(() => {
    if (ready && !isAuthenticated && !redirectStarted.current) {
      redirectStarted.current = true;
      navigate({ to: "/login", search: { redirectTo: requestedHref.current } });
    }
  }, [ready, isAuthenticated, navigate]);

  if (!ready || !isAuthenticated) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background text-foreground">
        <Loader2 className="size-8 animate-spin text-accent" />
        <p className="text-sm text-muted-foreground">
          Vérification de votre session…
        </p>
      </div>
    );
  }

  return (
    <AdminShell>
      <Outlet />
    </AdminShell>
  );
}
