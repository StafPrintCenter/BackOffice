import { useEffect } from "react";
import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { InstructorShell } from "@/components/instructor/instructor-shell";
import { useInstructorAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/_instructor")({
  component: InstructorLayout,
});

function InstructorLayout() {
  const { user, isAuthenticated, ready } = useInstructorAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (ready && !isAuthenticated) {
      navigate({ to: "/" });
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
    <InstructorShell>
      <Outlet />
    </InstructorShell>
  );
}
