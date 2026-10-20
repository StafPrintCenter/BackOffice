import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PreferenceCard } from "@/components/pages/notifications/PreferenceCard";
import { useNotificationPreferences } from "@/stores/useAdminNotificationsStore";

export const Route = createFileRoute("/_admin/notifications/preferences")({
  head: () => ({
    meta: [
      { title: "Préférences de notifications - Admin" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PreferencesPage,
});

function PreferencesPage() {
  const { preferences, isLoading, isError } = useNotificationPreferences();

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Préférences de notifications</h1>
          <p className="text-sm text-muted-foreground">
            Choisissez ce que vous recevez, et à quels moments.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to="/notifications">
            <ArrowLeft className="mr-1 h-4 w-4" /> Notifications
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-24 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" /> Chargement…
        </div>
      ) : isError ? (
        <p className="text-sm text-destructive">Impossible de charger vos préférences.</p>
      ) : (
        <div className="grid max-w-4xl gap-4 md:grid-cols-2">
          {preferences.map((p) => (
            <PreferenceCard key={p.category} preference={p} />
          ))}
        </div>
      )}
    </>
  );
}
