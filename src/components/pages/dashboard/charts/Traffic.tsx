import { Link2 } from "lucide-react";
import { BarChartCard, BarChartView, PieChartCard } from "./Cards";
import type { DashboardCharts } from "@/lib/dashboard";

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
          <div className="mt-4 h-64">
            <BarChartView data={topLinks} layout="vertical" categoryAxisWidth={100} />
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
