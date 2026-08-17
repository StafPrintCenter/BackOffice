import { Wrench, GraduationCap, FolderKanban, FileText, Users, Inbox, ShieldAlert, MousePointerClick, ShieldUser, CircleUser, SquareUser, UserCheck, Megaphone, Briefcase, FileCheck2, UserPlus } from "lucide-react";
import { StatCard } from "@/components/site";

interface DashboardKpiGridProps {
  stats: {
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
  };
  loaders: {
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
  };
}

export function DashboardKpiGrid({ stats, loaders }: DashboardKpiGridProps) {
  return (
    <div className="space-y-4">
      {/* KPIs Emplois, Candidatures, Stages */}
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-3">
        <StatCard
          label="Offres d'emploi"
          value={loaders.jobOffersLoading ? "…" : stats.publishedJobOffers}
          icon={<Briefcase className="h-5 w-5" />}
          hint={`${stats.jobOffersTotal} au total`}
        />
        <StatCard
          label="Candidatures"
          value={loaders.jobApplicationsLoading ? "…" : stats.jobApplicationsTotal}
          icon={<FileCheck2 className="h-5 w-5" />}
          hint={`${stats.pendingJobApplications} à traiter`}
        />
        <StatCard
          label="Demandes de stage"
          value={loaders.internshipRequestsLoading ? "…" : stats.internshipRequestsTotal}
          icon={<UserPlus className="h-5 w-5" />}
          hint={`${stats.pendingInternshipRequests} en attente`}
        />
      </div>

      {/* KPIs Services, Formations, Projets, Articles */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Services"
          value={loaders.servicesLoading ? "…" : stats.servicesTotal}
          icon={<Wrench className="h-5 w-5" />}
          hint={`${stats.featuredServices} en vedette`}
        />
        <StatCard
          label="Formations"
          value={loaders.trainingsLoading ? "…" : stats.trainingsTotal}
          icon={<GraduationCap className="h-5 w-5" />}
          hint="Programmes actifs"
        />
        <StatCard
          label="Projets"
          value={loaders.projectsLoading ? "…" : stats.projectsTotal}
          icon={<FolderKanban className="h-5 w-5" />}
          hint={`${stats.publicProjects} publics`}
        />
        <StatCard
          label="Articles"
          value={loaders.articlesLoading ? "…" : stats.articlesTotal}
          icon={<FileText className="h-5 w-5" />}
          hint="Publiés"
        />
      </div>

      {/* KPIs Messages, Signalements, Annonces, Liens */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Messages nouveaux"
          value={loaders.contactsLoading ? "…" : stats.newMessages}
          icon={<Inbox className="h-5 w-5" />}
          hint={`${stats.contactsTotal} au total`}
        />
        <StatCard
          label="Signalements ouverts"
          value={loaders.reportsLoading ? "…" : stats.openReports}
          icon={<ShieldAlert className="h-5 w-5" />}
          hint={`${stats.reportsTotal} au total`}
        />
        <StatCard
          label="Annonces actives"
          value={loaders.announcementsLoading ? "…" : stats.activeAnnouncements}
          icon={<Megaphone className="h-5 w-5" />}
          hint={`${stats.announcementsTotal} au total`}
        />
        <StatCard
          label="Clics liens courts"
          value={loaders.shortLinksLoading ? "…" : stats.totalClicks}
          icon={<MousePointerClick className="h-5 w-5" />}
          hint={`${stats.activeShortLinks} liens actifs`}
        />
      </div>

      {/* KPIs Membres */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          className="sm:col-span-2 lg:col-span-1"
          label="Membres actifs"
          value={loaders.membersLoading ? "…" : stats.activeMembers}
          icon={<Users className="h-5 w-5" />}
          hint={`${stats.totalMembers} au total`}
        />
        <StatCard
          label="Utilisateurs actifs"
          value={loaders.usersLoading ? "…" : stats.activeUsers}
          icon={<SquareUser className="h-5 w-5" />}
          hint={`${stats.usersTotal} au total`}
        />
        <StatCard
          label="Apprenants actifs"
          value={loaders.studentsLoading ? "…" : stats.activeStudents}
          icon={<CircleUser className="h-5 w-5" />}
          hint={`${stats.studentsTotal} au total`}
        />
        <StatCard
          label="Formateurs actifs"
          value={loaders.instructorsLoading ? "…" : stats.activeInstructors}
          icon={<UserCheck className="h-5 w-5" />}
          hint={`${stats.instructorsTotal} au total`}
        />
        <StatCard
          label="Administrateurs actifs"
          value={loaders.adminsLoading ? "…" : stats.activeAdmins}
          icon={<ShieldUser className="h-5 w-5" />}
          hint={`${stats.adminsTotal} au total`}
        />
      </div>
    </div>
  );
}