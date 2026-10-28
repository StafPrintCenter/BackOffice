import { createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useNotificationPreferences } from "@/stores/useNotificationsStore";
import { PreferencesHeader, PreferencesGrid } from "@/components/pages/notifications/preferences";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/_admin/notifications/preferences")({
  head: () => ({
    meta: [
      { title: `${SITE.tool} - Préférences de notifications | ${SITE.name}` },
      { name: "description", content: "Choisissez les notifications que vous souhaitez recevoir au sujet de vos travaux et de cos activités." },
    ],
  }),
  component: PreferencesPage,
});


function PreferencesPage() {
  const { preferences, isLoading, isError } = useNotificationPreferences();

  return (
    <div className="mx-auto max-w-4xl pb-16 px-4 sm:px-0">
      <PreferencesHeader />

      {isLoading ? (
        <div className="flex flex-col items-center justify-center gap-2 py-24 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="text-sm">Chargement…</span>
        </div>
      ) : isError ? (
        <p className="text-sm text-destructive py-10 text-center">Impossible de charger vos préférences.</p>
      ) : (
        <PreferencesGrid preferences={preferences} />
      )}
    </div>
  );
}
