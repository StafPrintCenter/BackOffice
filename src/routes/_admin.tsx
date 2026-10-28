import { useEffect, useRef } from "react";
import { createFileRoute, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { LogoLoader } from "@/components/site/Logo/Loader";
import { AdminShell } from "@/components/site/AdminShell";
import { useAdminAuth } from "@/hooks/useAdminAuth";

export const Route = createFileRoute("/_admin")({
  head: () => ({
    meta: [{ name: "robots", content: "noindex, nofollow" }],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  const { ready, isAuthenticated } = useAdminAuth();
  const navigate = useNavigate();
  const currentHref = useLocation({ select: (location) => location.href });
  const requestedHref = useRef(currentHref);
  const redirectStarted = useRef(false);
  const wasAuthenticated = useRef(false);

  useEffect(() => {
    if (!ready) return;

    if (isAuthenticated) {
      wasAuthenticated.current = true;
      return;
    }

    if (!redirectStarted.current) {
      redirectStarted.current = true;
      navigate({
        to: "/login",
        search: {
          redirectTo: wasAuthenticated.current ? undefined : requestedHref.current,
        },
      });
    }
  }, [ready, isAuthenticated, navigate]);

  if (!ready || !isAuthenticated) {
    return (
      <LogoLoader
        fullScreen
        size={140}
        text="Vérification de votre session…"
      />
    );
  }

  return (
    <AdminShell>
      <Outlet />
    </AdminShell>
  );
}
