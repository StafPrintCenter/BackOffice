import { createFileRoute } from "@tanstack/react-router";
import { Briefcase, UserPlus, FolderKanban, Megaphone, FileText } from "lucide-react";
import { PageHeader } from "@/components/site";
import {
  useAdminContactsList,
  useAdminUsersList,
  useAdminStudentsList,
  useAdminAdminsList,
  useAdminInstructorsList,
  useAdminProjectsList,
  useAdminTestimonialsList,
  useAdminShortLinksList,
  useAdminServicesList,
  useAdminTrainingsList,
  useAdminReportsList,
  useAdminArticlesList,
  useAdminAnnouncementsList,
  useAdminJobOffersList,
  useAdminJobApplicationsList,
  useAdminInternshipRequestsList,
} from "@/stores";
import { SITE } from "@/data/site";
import { ANNOUNCEMENT_TYPE_LABELS } from "@/data/announcements";
import { JOB_OFFER_CONTRACT_LABELS } from "@/data/jobOffers";
import { JOB_APPLICATION_STATUS_LABELS } from "@/data/jobApplications";
import { INTERNSHIP_REQUEST_STATUS_LABELS } from "@/data/internshipRequests";
import {
  DashboardKpiGrid,
  DashboardChartsGrid,
  DashboardRecentLists,
  DashboardRecentActivity,
  type RecentItem,
} from "@/components/pages/admin/dashboard";

export const Route = createFileRoute("/_admin/dashboard")({
  head: () => ({
    meta: [
      { title: `Tableau de bord | ${SITE.name}` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { items: contacts, isLoading: contactsLoading } = useAdminContactsList({ perPage: 100 });
  const { items: users, isLoading: usersLoading } = useAdminUsersList({ perPage: 100 });
  const { items: students, isLoading: studentsLoading } = useAdminStudentsList({ perPage: 100 });
  const { items: instructors, isLoading: instructorsLoading } = useAdminInstructorsList({ perPage: 100 });
  const { items: admins, isLoading: adminsLoading } = useAdminAdminsList({ perPage: 100 });
  const { items: projects, isLoading: projectsLoading } = useAdminProjectsList({ perPage: 100 });
  const { items: testimonials, isLoading: testimonialsLoading } = useAdminTestimonialsList({ perPage: 100 });
  const { items: shortLinks, isLoading: shortLinksLoading } = useAdminShortLinksList({ perPage: 100 });
  const { items: services, isLoading: servicesLoading } = useAdminServicesList({ perPage: 100 });
  const { items: trainings, isLoading: trainingsLoading } = useAdminTrainingsList({ perPage: 100 });
  const { items: reports, isLoading: reportsLoading } = useAdminReportsList({ perPage: 100 });
  const { items: articles, isLoading: articlesLoading } = useAdminArticlesList({ perPage: 100 });
  const { items: announcements, isLoading: announcementsLoading } = useAdminAnnouncementsList({ perPage: 100 });
  const { items: jobOffers, isLoading: jobOffersLoading } = useAdminJobOffersList({ perPage: 100 });
  const { items: jobApplications, isLoading: jobApplicationsLoading } = useAdminJobApplicationsList({ perPage: 100 });
  const { items: internshipRequests, isLoading: internshipRequestsLoading } = useAdminInternshipRequestsList({ perPage: 100 });

  // --- Calculs KPIs ---
  const activeUsers = users.filter((u) => u.isActive && !u.isBlocked).length;
  const activeStudents = students.filter((s) => s.isActive && !s.isBlocked).length;
  const activeInstructors = instructors.filter((i) => i.isActive && !i.isBlocked && !i.isPending).length;
  const activeAdmins = admins.filter((a) => a.isActive && !a.isBlocked && !a.isPending).length;

  const stats = {
    publishedJobOffers: jobOffers.filter((j) => j.status === "published").length,
    jobOffersTotal: jobOffers.length,
    jobApplicationsTotal: jobApplications.length,
    pendingJobApplications: jobApplications.filter((a) => a.status === "pending" || a.status === "reviewing").length,
    internshipRequestsTotal: internshipRequests.length,
    pendingInternshipRequests: internshipRequests.filter((i) => i.status === "pending" || i.status === "under_review").length,
    servicesTotal: services.length,
    featuredServices: services.filter((s) => s.featured).length,
    trainingsTotal: trainings.length,
    projectsTotal: projects.length,
    publicProjects: projects.filter((p) => p.isPublic).length,
    articlesTotal: articles.length,
    newMessages: contacts.filter((c) => c.status === "new").length,
    contactsTotal: contacts.length,
    openReports: reports.filter((r) => r.status === "pending" || r.status === "in_review").length,
    reportsTotal: reports.length,
    activeAnnouncements: announcements.filter((a) => a.isEnabled && a.isActive).length,
    announcementsTotal: announcements.length,
    totalClicks: shortLinks.reduce((s, l) => s + l.clicksCount, 0),
    activeShortLinks: shortLinks.filter((l) => l.isActive).length,
    activeMembers: activeUsers + activeStudents + activeInstructors + activeAdmins,
    totalMembers: users.length + students.length + instructors.length + admins.length,
    activeUsers,
    usersTotal: users.length,
    activeStudents,
    studentsTotal: students.length,
    activeInstructors,
    instructorsTotal: instructors.length,
    activeAdmins,
    adminsTotal: admins.length,
  };

  const avgRating = testimonials.length
    ? (testimonials.reduce((s, t) => s + t.rating, 0) / testimonials.length).toFixed(1)
    : "…";

  // --- Mappings des données de graphiques ---
  const topLinks = [...shortLinks]
    .sort((a, b) => b.clicksCount - a.clicksCount)
    .slice(0, 5)
    .map((l) => ({ name: l.alias, value: l.clicksCount }));

  const jobOffersByContract = Object.entries(
    jobOffers.reduce<Record<string, number>>((acc, j) => {
      const label = JOB_OFFER_CONTRACT_LABELS[j.contractType] || j.contractType;
      acc[label] = (acc[label] ?? 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const announcementsByType = Object.entries(
    announcements.reduce<Record<string, number>>((acc, a) => {
      const label = ANNOUNCEMENT_TYPE_LABELS[a.type] || a.type;
      acc[label] = (acc[label] ?? 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const articlesByAuthor = Object.entries(
    articles.reduce<Record<string, number>>((acc, a) => {
      const key = a.author || "Anonyme";
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const applicationsByStatus = Object.entries(
    jobApplications.reduce<Record<string, number>>((acc, a) => {
      const label = JOB_APPLICATION_STATUS_LABELS[a.status] || a.status;
      acc[label] = (acc[label] ?? 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const internshipByStatus = Object.entries(
    internshipRequests.reduce<Record<string, number>>((acc, i) => {
      const label = INTERNSHIP_REQUEST_STATUS_LABELS[i.status] || i.status;
      acc[label] = (acc[label] ?? 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const reportsByStatus = Object.entries(
    reports.reduce<Record<string, number>>((acc, r) => {
      acc[r.status] = (acc[r.status] ?? 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const msgByStatus = Object.entries(
    contacts.reduce<Record<string, number>>((a, c) => {
      a[c.status] = (a[c.status] ?? 0) + 1;
      return a;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const membersByType = [
    { type: "Utilisateurs", value: users.length },
    { type: "Apprenants", value: students.length },
    { type: "Formateurs", value: instructors.length },
    { type: "Administrateurs", value: admins.length },
  ];

  const projectsByCategory = Object.entries(
    projects.reduce<Record<string, number>>((acc, p) => {
      const key = p.category || "Sans catégorie";
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const linksByCategory = Object.entries(
    shortLinks.reduce<Record<string, number>>((acc, l) => {
      acc[l.category] = (acc[l.category] ?? 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const trainingsByLevel = Object.entries(
    trainings.reduce<Record<string, number>>((acc, t) => {
      acc[t.level] = (acc[t.level] ?? 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const servicesByCategory = Object.entries(
    services.reduce<Record<string, number>>((acc, s) => {
      const key = s.category || "Sans catégorie";
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const recent: RecentItem[] = [
    ...jobOffers.slice(0, 2).map((j) => ({
      type: "Emploi",
      title: j.title,
      meta: JOB_OFFER_CONTRACT_LABELS[j.contractType],
      icon: Briefcase,
    })),
    ...internshipRequests.slice(0, 2).map((i) => ({
      type: "Stage",
      title: `${i.firstName} ${i.lastName}`,
      meta: i.institution || "Demande de stage",
      icon: UserPlus,
    })),
    ...projects.slice(0, 1).map((p) => ({
      type: "Projet",
      title: p.title,
      meta: p.client,
      icon: FolderKanban,
    })),
    ...announcements.slice(0, 1).map((a) => ({
      type: "Annonce",
      title: a.title,
      meta: ANNOUNCEMENT_TYPE_LABELS[a.type],
      icon: Megaphone,
    })),
    ...articles.slice(0, 1).map((a) => ({
      type: "Article",
      title: a.title,
      meta: a.author,
      icon: FileText,
    })),
  ].slice(0, 6);

  const loaders = {
    jobOffersLoading,
    jobApplicationsLoading,
    internshipRequestsLoading,
    servicesLoading,
    trainingsLoading,
    projectsLoading,
    articlesLoading,
    contactsLoading,
    reportsLoading,
    announcementsLoading,
    shortLinksLoading,
    membersLoading: usersLoading || studentsLoading || instructorsLoading || adminsLoading,
    usersLoading,
    studentsLoading,
    instructorsLoading,
    adminsLoading,
  };

  return (
    <>
      <PageHeader title="Tableau de bord" description="Vue d'ensemble de votre activité." />

      <DashboardKpiGrid stats={stats} loaders={loaders} />

      <DashboardChartsGrid
        jobOffersByContract={jobOffersByContract}
        announcementsByType={announcementsByType}
        articlesByAuthor={articlesByAuthor}
        applicationsByStatus={applicationsByStatus}
        internshipByStatus={internshipByStatus}
        topLinks={topLinks}
        reportsByStatus={reportsByStatus}
        linksByCategory={linksByCategory}
        msgByStatus={msgByStatus}
        membersByType={membersByType}
        servicesByCategory={servicesByCategory}
        trainingsByLevel={trainingsByLevel}
        projectsByCategory={projectsByCategory}
        activeShortLinks={stats.activeShortLinks}
      />

      <DashboardRecentLists
        jobOffers={jobOffers}
        jobOffersLoading={jobOffersLoading}
        jobApplications={jobApplications}
        jobApplicationsLoading={jobApplicationsLoading}
      />

      <DashboardRecentActivity
        recent={recent}
        testimonials={testimonials}
        testimonialsLoading={testimonialsLoading}
        avgRating={avgRating}
      />
    </>
  );
}