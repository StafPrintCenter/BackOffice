import { BarChartCard } from "./Cards";
import type { DashboardCharts } from "@/lib/dashboard";

type PlatformChartData = Pick<
  DashboardCharts,
  "membersByType" | "servicesByCategory" | "trainingsByLevel" | "projectsByCategory"
>;

export function PlatformCharts({
  membersByType,
  servicesByCategory,
  trainingsByLevel,
  projectsByCategory,
}: PlatformChartData) {
  return (
    <>
      <div className="grid gap-6 lg:grid-cols-2">
        <BarChartCard title="Répartition des membres" data={membersByType} categoryKey="type" />
        <BarChartCard title="Services par catégorie" data={servicesByCategory} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <BarChartCard title="Formations par niveau" data={trainingsByLevel} fontSize={12} />
        <BarChartCard
          title="Projets par catégorie"
          data={projectsByCategory}
          layout="vertical"
          fontSize={12}
          categoryAxisWidth={90}
        />
      </div>
    </>
  );
}
