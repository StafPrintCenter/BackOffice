import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HealthSummaryCard } from "@/components/pages/health/SummaryCard";
import { HealthChecklist } from "@/components/pages/health/Checklist";
import { HealthRecommendationCard } from "@/components/pages/health/RecommendationCard";
import {
  useAdminProfileHealth,
  useDismissAdminHealthRecommendation,
} from "@/stores/useProfileHealthStore";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/_admin/health")({
  head: () => ({
    meta: [
      { title: `${SITE.tool} - Santé du compte | ${SITE.name}` },
      { name: "description", content: "Suivez le score de votre compte administrateur et appliquez les recommandations de sécurité et de profil." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: HealthPage,
});

function HealthPage() {
  const { health, recommendations, isLoading, isError, refetch } = useAdminProfileHealth({ includeDismissed: true });
  const dismiss = useDismissAdminHealthRecommendation();

  const handleDismiss = (id: string, restore: boolean) => {
    dismiss.mutate({ id, restore }, {
      onSuccess: (res) =>
        toast.success(restore ? "Recommandation restaurée" : `Recommandation masquée pour ${res.snoozeDays} jours`),
      onError: (e) => toast.error(e.message),
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Chargement...
      </div>
    );
  }

  if (isError || !health) {
    return (
      <div className="rounded-2xl border p-8 text-center text-muted-foreground">
        Impossible de charger la santé de votre compte.
        <div className="mt-4"><Button variant="outline" size="sm" onClick={() => refetch()}>Réessayer</Button></div>
      </div>
    );
  }

  const active = recommendations.filter((r) => !r.dismissed);
  const hidden = recommendations.filter((r) => r.dismissed);

  return (
    <>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold">Santé du compte</h1>
        <p className="text-sm text-muted-foreground">Votre score de sécurité et de profil, avec les actions pour l'améliorer.</p>
      </div>

      <div className="max-w-3xl space-y-6">
        <HealthSummaryCard health={health} />

        <section>
          <h2 className="mb-3 font-display text-lg font-semibold">Recommandations</h2>
          {active.length === 0 ? (
            <div className="rounded-2xl border bg-card p-6 text-sm text-muted-foreground">
              Aucune recommandation pour le moment. Votre compte est en bonne santé.
            </div>
          ) : (
            <ul className="space-y-3">
              {active.map((rec) => (
                <HealthRecommendationCard key={rec.id} rec={rec} busy={dismiss.isPending} onDismiss={handleDismiss} />
              ))}
            </ul>
          )}
        </section>

        {hidden.length > 0 && (
          <section>
            <h2 className="mb-1 font-display text-lg font-semibold">Masquées ({hidden.length})</h2>
            <p className="mb-3 text-xs text-muted-foreground">
              Elles réapparaissent après {health.snoozeDays} jours si le problème persiste.
            </p>
            <ul className="space-y-3">
              {hidden.map((rec) => (
                <HealthRecommendationCard key={rec.id} rec={rec} busy={dismiss.isPending} onDismiss={handleDismiss} />
              ))}
            </ul>
          </section>
        )}

        <HealthChecklist items={health.items} />
      </div>
    </>
  );
}