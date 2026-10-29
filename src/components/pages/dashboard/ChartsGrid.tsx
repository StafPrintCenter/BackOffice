import { ContentCharts } from "./charts/Content";
import { PlatformCharts } from "./charts/PlatformCharts";
import { TrafficCharts } from "./charts/TrafficCharts";
import type { DashboardCharts } from "@/lib/dashboard";

interface DashboardChartsGridProps extends DashboardCharts {
  activeShortLinks: number;
}

export function DashboardChartsGrid({ activeShortLinks, ...charts }: DashboardChartsGridProps) {
  return (
    <div className="mt-6 space-y-6">
      <ContentCharts
        jobOffersByContract={charts.jobOffersByContract}
        announcementsByType={charts.announcementsByType}
        articlesByAuthor={charts.articlesByAuthor}
        applicationsByStatus={charts.applicationsByStatus}
        internshipByStatus={charts.internshipByStatus}
      />
      <TrafficCharts
        topLinks={charts.topLinks}
        activeShortLinks={activeShortLinks}
        reportsByStatus={charts.reportsByStatus}
        linksByCategory={charts.linksByCategory}
        msgByStatus={charts.msgByStatus}
      />
      <PlatformCharts
        membersByType={charts.membersByType}
        servicesByCategory={charts.servicesByCategory}
        trainingsByLevel={charts.trainingsByLevel}
        projectsByCategory={charts.projectsByCategory}
      />
    </div>
  );
}
