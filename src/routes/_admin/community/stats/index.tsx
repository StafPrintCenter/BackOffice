import { createFileRoute } from "@tanstack/react-router";
import { SITE } from "@/data/site";
import { CommunityStatsPanel } from "@/components/pages/community/reports";

export const Route = createFileRoute("/_admin/community/stats/")({
  validateSearch: (s: Record<string, unknown>): { report?: string } => ({
    report: typeof s.report === "string" && s.report ? s.report : undefined,
  }),
  head: () => (
    {
      meta: [{ title: `Signalements communauté | ${SITE.name}` },
      { name: "robots", content: "noindex" }]
    }),
  component: StatsPage,
});

function StatsPage() {
  return (
    <>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold">Signalements de la communauté</h1>
        <p className="text-sm text-muted-foreground">File de modération et chiffres clés.</p>
      </div>
      <CommunityStatsPanel />
    </>
  );
}