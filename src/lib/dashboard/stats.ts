import type { DashboardData, DashboardStats } from "./types";

export function calculateDashboardStats(data: DashboardData): DashboardStats {
  const activeUsers = data.users.filter((user) => user.isActive && !user.isBlocked).length;
  const activeStudents = data.students.filter(
    (student) => student.isActive && !student.isBlocked,
  ).length;
  const activeInstructors = data.instructors.filter(
    (instructor) => instructor.isActive && !instructor.isBlocked && !instructor.isPending,
  ).length;
  const activeAdmins = data.admins.filter(
    (admin) => admin.isActive && !admin.isBlocked && !admin.isPending,
  ).length;

  return {
    publishedJobOffers: data.jobOffers.filter((job) => job.status === "published").length,
    jobOffersTotal: data.jobOffers.length,
    jobApplicationsTotal: data.jobApplications.length,
    pendingJobApplications: data.jobApplications.filter(
      (application) => application.status === "pending" || application.status === "reviewing",
    ).length,
    internshipRequestsTotal: data.internshipRequests.length,
    pendingInternshipRequests: data.internshipRequests.filter(
      (request) => request.status === "pending" || request.status === "under_review",
    ).length,
    servicesTotal: data.services.length,
    featuredServices: data.services.filter((service) => service.featured).length,
    trainingsTotal: data.trainings.length,
    projectsTotal: data.projects.length,
    publicProjects: data.projects.filter((project) => project.isPublic).length,
    articlesTotal: data.articles.length,
    newMessages: data.contacts.filter((contact) => contact.status === "new").length,
    contactsTotal: data.contacts.length,
    openReports: data.reports.filter(
      (report) => report.status === "pending" || report.status === "in_review",
    ).length,
    reportsTotal: data.reports.length,
    activeAnnouncements: data.announcements.filter(
      (announcement) => announcement.isEnabled && announcement.isActive,
    ).length,
    announcementsTotal: data.announcements.length,
    totalClicks: data.shortLinks.reduce((total, link) => total + link.clicksCount, 0),
    activeShortLinks: data.shortLinks.filter((link) => link.isActive).length,
    activeMembers: activeUsers + activeStudents + activeInstructors + activeAdmins,
    totalMembers:
      data.users.length + data.students.length + data.instructors.length + data.admins.length,
    activeUsers,
    usersTotal: data.users.length,
    activeStudents,
    studentsTotal: data.students.length,
    activeInstructors,
    instructorsTotal: data.instructors.length,
    activeAdmins,
    adminsTotal: data.admins.length,
  };
}

export function calculateAverageTestimonialRating(
  testimonials: DashboardData["testimonials"],
): string {
  return testimonials.length
    ? (
        testimonials.reduce((total, testimonial) => total + testimonial.rating, 0) /
        testimonials.length
      ).toFixed(1)
    : "…";
}
