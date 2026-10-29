import { BarChartCard, PieChartCard } from "./ChartCards";
import type { DashboardCharts } from "@/lib/dashboard";

type ContentChartData = Pick<
  DashboardCharts,
  | "jobOffersByContract"
  | "announcementsByType"
  | "articlesByAuthor"
  | "applicationsByStatus"
  | "internshipByStatus"
>;

export function ContentCharts({
  jobOffersByContract,
  announcementsByType,
  articlesByAuthor,
  applicationsByStatus,
  internshipByStatus,
}: ContentChartData) {
  return (
    <>
      <div className="grid gap-6 lg:grid-cols-3">
        <BarChartCard title="Offres d'emploi par type de contrat" data={jobOffersByContract} />
        <PieChartCard title="Annonces par type" data={announcementsByType} />
        <BarChartCard title="Articles par auteur" data={articlesByAuthor} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <BarChartCard title="Candidatures par statut" data={applicationsByStatus} />
        <BarChartCard title="Demandes de stage par statut" data={internshipByStatus} />
      </div>
    </>
  );
}
