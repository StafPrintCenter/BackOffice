import {
  useAdminAdminsList,
  useAdminAnnouncementsList,
  useAdminArticlesList,
  useAdminContactsList,
  useAdminInstructorsList,
  useAdminInternshipRequestsList,
  useAdminJobApplicationsList,
  useAdminJobOffersList,
  useAdminProjectsList,
  useAdminReportsList,
  useAdminServicesList,
  useAdminShortLinksList,
  useAdminStudentsList,
  useAdminTestimonialsList,
  useAdminTrainingsList,
  useAdminUsersList,
} from "@/stores";
import {
  buildRecentDashboardActivity,
  calculateAverageTestimonialRating,
  calculateDashboardCharts,
  calculateDashboardStats,
} from "@/lib/dashboard";

export function useAdminDashboard() {
  const { items: contacts, isLoading: contactsLoading } = useAdminContactsList({ perPage: 100 });
  const { items: users, isLoading: usersLoading } = useAdminUsersList({ perPage: 100 });
  const { items: students, isLoading: studentsLoading } = useAdminStudentsList({ perPage: 100 });
  const { items: instructors, isLoading: instructorsLoading } = useAdminInstructorsList({
    perPage: 100,
  });
  const { items: admins, isLoading: adminsLoading } = useAdminAdminsList({ perPage: 100 });
  const { items: projects, isLoading: projectsLoading } = useAdminProjectsList({ perPage: 100 });
  const { items: testimonials, isLoading: testimonialsLoading } = useAdminTestimonialsList({
    perPage: 100,
  });
  const { items: shortLinks, isLoading: shortLinksLoading } = useAdminShortLinksList({
    perPage: 100,
  });
  const { items: services, isLoading: servicesLoading } = useAdminServicesList({ perPage: 100 });
  const { items: trainings, isLoading: trainingsLoading } = useAdminTrainingsList({ perPage: 100 });
  const { items: reports, isLoading: reportsLoading } = useAdminReportsList({ perPage: 100 });
  const { items: articles, isLoading: articlesLoading } = useAdminArticlesList({ perPage: 100 });
  const { items: announcements, isLoading: announcementsLoading } = useAdminAnnouncementsList({
    perPage: 100,
  });
  const { items: jobOffers, isLoading: jobOffersLoading } = useAdminJobOffersList({ perPage: 100 });
  const { items: jobApplications, isLoading: jobApplicationsLoading } = useAdminJobApplicationsList(
    { perPage: 100 },
  );
  const { items: internshipRequests, isLoading: internshipRequestsLoading } =
    useAdminInternshipRequestsList({ perPage: 100 });

  const data = {
    contacts,
    users,
    students,
    instructors,
    admins,
    projects,
    testimonials,
    shortLinks,
    services,
    trainings,
    reports,
    articles,
    announcements,
    jobOffers,
    jobApplications,
    internshipRequests,
  };

  return {
    stats: calculateDashboardStats(data),
    charts: calculateDashboardCharts(data),
    recent: buildRecentDashboardActivity(data),
    avgRating: calculateAverageTestimonialRating(testimonials),
    testimonials,
    jobOffers,
    jobApplications,
    loaders: {
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
      testimonialsLoading,
    },
  };
}
