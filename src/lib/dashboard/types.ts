import type { LucideIcon } from "lucide-react";
import type { APIAdminAnnouncement } from "@/data/announcements";
import type { APIAdminAdminListItem } from "@/data/admins";
import type { APIAdminArticleListItem } from "@/data/articles";
import type { APIAdminContactListItem } from "@/data/contact";
import type { APIAdminInstructor } from "@/data/instructors";
import type { APIAdminJobApplication } from "@/data/jobApplications";
import type { APIAdminJobOffer } from "@/data/jobOffers";
import type { APIAdminInternshipRequest } from "@/data/internshipRequests";
import type { APIAdminProject } from "@/data/projects";
import type { APIAdminReport } from "@/data/reports";
import type { APIAdminServiceListItem } from "@/data/services";
import type { APIAdminShortLinkListItem } from "@/data/shortlinks";
import type { APIAdminStudentListItem } from "@/data/students";
import type { APIAdminTestimonial } from "@/data/testimonials";
import type { APIAdminTrainingListItem } from "@/data/trainings";
import type { APIAdminUserListItem } from "@/data/users";

export interface DashboardData {
  contacts: APIAdminContactListItem[];
  users: APIAdminUserListItem[];
  students: APIAdminStudentListItem[];
  instructors: APIAdminInstructor[];
  admins: APIAdminAdminListItem[];
  projects: APIAdminProject[];
  testimonials: APIAdminTestimonial[];
  shortLinks: APIAdminShortLinkListItem[];
  services: APIAdminServiceListItem[];
  trainings: APIAdminTrainingListItem[];
  reports: APIAdminReport[];
  articles: APIAdminArticleListItem[];
  announcements: APIAdminAnnouncement[];
  jobOffers: APIAdminJobOffer[];
  jobApplications: APIAdminJobApplication[];
  internshipRequests: APIAdminInternshipRequest[];
}

export interface DashboardStats {
  publishedJobOffers: number;
  jobOffersTotal: number;
  jobApplicationsTotal: number;
  pendingJobApplications: number;
  internshipRequestsTotal: number;
  pendingInternshipRequests: number;
  servicesTotal: number;
  featuredServices: number;
  trainingsTotal: number;
  projectsTotal: number;
  publicProjects: number;
  articlesTotal: number;
  newMessages: number;
  contactsTotal: number;
  openReports: number;
  reportsTotal: number;
  activeAnnouncements: number;
  announcementsTotal: number;
  totalClicks: number;
  activeShortLinks: number;
  activeMembers: number;
  totalMembers: number;
  activeUsers: number;
  usersTotal: number;
  activeStudents: number;
  studentsTotal: number;
  activeInstructors: number;
  instructorsTotal: number;
  activeAdmins: number;
  adminsTotal: number;
}

export interface DashboardLoaders {
  jobOffersLoading: boolean;
  jobApplicationsLoading: boolean;
  internshipRequestsLoading: boolean;
  servicesLoading: boolean;
  trainingsLoading: boolean;
  projectsLoading: boolean;
  articlesLoading: boolean;
  contactsLoading: boolean;
  reportsLoading: boolean;
  announcementsLoading: boolean;
  shortLinksLoading: boolean;
  membersLoading: boolean;
  usersLoading: boolean;
  studentsLoading: boolean;
  instructorsLoading: boolean;
  adminsLoading: boolean;
  testimonialsLoading: boolean;
}

export interface DashboardChartItem {
  name?: string;
  type?: string;
  value: number;
}

export interface DashboardCharts {
  jobOffersByContract: DashboardChartItem[];
  announcementsByType: DashboardChartItem[];
  articlesByAuthor: DashboardChartItem[];
  applicationsByStatus: DashboardChartItem[];
  internshipByStatus: DashboardChartItem[];
  topLinks: DashboardChartItem[];
  reportsByStatus: DashboardChartItem[];
  linksByCategory: DashboardChartItem[];
  msgByStatus: DashboardChartItem[];
  membersByType: DashboardChartItem[];
  servicesByCategory: DashboardChartItem[];
  trainingsByLevel: DashboardChartItem[];
  projectsByCategory: DashboardChartItem[];
}

export interface DashboardRecentItem {
  type: string;
  title: string;
  meta: string;
  icon: LucideIcon;
}
