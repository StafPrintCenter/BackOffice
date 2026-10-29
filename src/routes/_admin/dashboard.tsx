import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site";
import {
  DashboardChartsGrid,
  DashboardKpiGrid,
  DashboardRecentActivity,
  DashboardRecentLists,
} from "@/components/pages/dashboard";
import { SITE } from "@/data/site";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";

export const Route = createFileRoute("/_admin/dashboard")({
  head: () => ({
    meta: [
      { title: `${SITE.tool} - Tableau de bord et gestion de la plateforme | ${SITE.name}` },
      {
        name: "description",
        content: `Gérez les activités, les contenus, les utilisateurs et les opérations de ${SITE.name} depuis votre espace d'administration.`,
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { stats, charts, recent, avgRating, testimonials, jobOffers, jobApplications, loaders } =
    useAdminDashboard();

  return (
    <>
      <PageHeader title="Tableau de bord" description="Vue d'ensemble de votre activité." />

      <DashboardKpiGrid stats={stats} loaders={loaders} />

      <DashboardChartsGrid {...charts} activeShortLinks={stats.activeShortLinks} />

      <DashboardRecentLists
        jobOffers={jobOffers}
        jobOffersLoading={loaders.jobOffersLoading}
        jobApplications={jobApplications}
        jobApplicationsLoading={loaders.jobApplicationsLoading}
      />

      <DashboardRecentActivity
        recent={recent}
        testimonials={testimonials}
        testimonialsLoading={loaders.testimonialsLoading}
        avgRating={avgRating}
      />
    </>
  );
}
