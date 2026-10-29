import { ANNOUNCEMENT_TYPE_LABELS } from "@/data/announcements";
import { JOB_APPLICATION_STATUS_LABELS } from "@/data/jobApplications";
import { JOB_OFFER_CONTRACT_LABELS } from "@/data/jobOffers";
import { INTERNSHIP_REQUEST_STATUS_LABELS } from "@/data/internshipRequests";
import type { DashboardChartItem, DashboardCharts, DashboardData } from "./types";

function countBy<T>(items: T[], getKey: (item: T) => string): DashboardChartItem[] {
  const counts = items.reduce<Record<string, number>>((result, item) => {
    const key = getKey(item);
    result[key] = (result[key] ?? 0) + 1;
    return result;
  }, {});

  return Object.entries(counts).map(([name, value]) => ({ name, value }));
}

export function calculateDashboardCharts(data: DashboardData): DashboardCharts {
  return {
    jobOffersByContract: countBy(
      data.jobOffers,
      (job) => JOB_OFFER_CONTRACT_LABELS[job.contractType] || job.contractType,
    ),
    announcementsByType: countBy(
      data.announcements,
      (announcement) => ANNOUNCEMENT_TYPE_LABELS[announcement.type] || announcement.type,
    ),
    articlesByAuthor: countBy(data.articles, (article) => article.author || "Anonyme"),
    applicationsByStatus: countBy(
      data.jobApplications,
      (application) => JOB_APPLICATION_STATUS_LABELS[application.status] || application.status,
    ),
    internshipByStatus: countBy(
      data.internshipRequests,
      (request) => INTERNSHIP_REQUEST_STATUS_LABELS[request.status] || request.status,
    ),
    topLinks: [...data.shortLinks]
      .sort((first, second) => second.clicksCount - first.clicksCount)
      .slice(0, 5)
      .map((link) => ({ name: link.alias, value: link.clicksCount })),
    reportsByStatus: countBy(data.reports, (report) => report.status),
    linksByCategory: countBy(data.shortLinks, (link) => link.category),
    msgByStatus: countBy(data.contacts, (contact) => contact.status),
    membersByType: [
      { type: "Utilisateurs", value: data.users.length },
      { type: "Apprenants", value: data.students.length },
      { type: "Formateurs", value: data.instructors.length },
      { type: "Administrateurs", value: data.admins.length },
    ],
    servicesByCategory: countBy(data.services, (service) => service.category || "Sans catégorie"),
    trainingsByLevel: countBy(data.trainings, (training) => training.level),
    projectsByCategory: countBy(data.projects, (project) => project.category || "Sans catégorie"),
  };
}
