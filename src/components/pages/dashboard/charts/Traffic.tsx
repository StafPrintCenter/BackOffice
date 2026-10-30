import { Link2 } from "lucide-react";
import { BarChartCard, PieChartCard } from "./Cards";
import type { DashboardChartItem, DashboardCharts } from "@/lib/dashboard";

const TOP_LINK_COLORS = ["#3C82AB", "#E07856", "#5A9B6E", "#C89A3E", "#8B5CF6"];

type TrafficChartData = Pick<
  DashboardCharts,
  "topLinks" | "reportsByStatus" | "linksByCategory" | "msgByStatus"
> & {
  activeShortLinks: number;
};

export function TrafficCharts({
  topLinks,
  activeShortLinks,
  reportsByStatus,
  linksByCategory,
  msgByStatus,
}: TrafficChartData) {
  return (
    <>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border bg-card p-6 shadow-elegant lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link2 className="h-5 w-5 text-primary" />
              <div className="font-display text-lg font-semibold">Top 5 liens courts</div>
            </div>
            <span className="text-xs text-muted-foreground">{activeShortLinks} liens actifs</span>
          </div>
          <div className="mt-6">
            <TopLinksChart data={topLinks} />
          </div>
        </div>
        <PieChartCard title="Signalements par statut" data={reportsByStatus} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <BarChartCard title="Liens courts par catégorie" data={linksByCategory} />
        </div>
        <PieChartCard title="Messages par statut" data={msgByStatus} />
      </div>
    </>
  );
}

function TopLinksChart({ data }: { data: DashboardChartItem[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">
        Aucune donnée à afficher.
      </div>
    );
  }

  const maxClicks = Math.max(...data.map((link) => link.value), 1);

  return (
    <ul className="space-y-5" aria-label="Top 5 liens courts par nombre de clics">
      {data.map((link, index) => {
        const width = link.value > 0 ? Math.max((link.value / maxClicks) * 100, 1) : 0;

        return (
          <li key={`${link.name}-${index}`}>
            <div className="mb-1.5 flex items-center justify-between gap-4 text-sm">
              <span className="truncate font-medium">{link.name || "Lien sans nom"}</span>
              <span className="shrink-0 text-muted-foreground">{link.value} clics</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${width}%`,
                  backgroundColor: TOP_LINK_COLORS[index % TOP_LINK_COLORS.length],
                }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
