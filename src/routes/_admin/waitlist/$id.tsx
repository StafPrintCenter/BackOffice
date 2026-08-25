import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Loader2, Mail, Calendar, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminWaitlistDetail } from "@/stores/useWaitlistStore";
import { getWaitlistPlatformBadge, getWaitlistPlatformLabel } from "@/data/waitlist";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/_admin/waitlist/$id")({
  head: () => ({
    meta: [
      { title: `Inscription liste d'attente | ${SITE.name}` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: WaitlistEntryDetail,
});

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" });
}

function WaitlistEntryDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { item: entry, isLoading } = useAdminWaitlistDetail(id);

  return (
    <>
      <div className="mb-6">
        <Button variant="outline" size="sm" onClick={() => navigate({ to: "/waitlist" })}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Retour
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2" /> Chargement...
        </div>
      ) : !entry ? (
        <p className="text-muted-foreground">Inscription introuvable.</p>
      ) : (
        <div className="max-w-2xl space-y-6">
          <div className="rounded-2xl border bg-card p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="font-display text-2xl font-bold">{entry.email}</h1>
                <span className={`mt-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getWaitlistPlatformBadge(entry.platformName)}`}>
                  {getWaitlistPlatformLabel(entry.platformName)}
                </span>
              </div>
            </div>

            <div className="mt-6 space-y-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4 shrink-0" />
                <a href={`mailto:${entry.email}`} className="text-primary hover:underline">{entry.email}</a>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Layers className="h-4 w-4 shrink-0" />
                <span>Espace demandé : <strong className="text-foreground">{getWaitlistPlatformLabel(entry.platformName)}</strong></span>
              </div>
            </div>

            <div className="mt-6 border-t pt-4 space-y-1.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" /> Inscrit le {formatDate(entry.createdAt)}
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" /> Modifié le {formatDate(entry.updatedAt)}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}