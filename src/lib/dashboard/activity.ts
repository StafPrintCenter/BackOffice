import { Briefcase, FileText, FolderKanban, Megaphone, UserPlus } from "lucide-react";
import { ANNOUNCEMENT_TYPE_LABELS } from "@/data/announcements";
import { JOB_OFFER_CONTRACT_LABELS } from "@/data/jobOffers";
import type { DashboardData, DashboardRecentItem } from "./types";

export function buildRecentDashboardActivity(data: DashboardData): DashboardRecentItem[] {
  return [
    ...data.jobOffers.slice(0, 2).map((job) => ({
      type: "Emploi",
      title: job.title,
      meta: JOB_OFFER_CONTRACT_LABELS[job.contractType],
      icon: Briefcase,
    })),
    ...data.internshipRequests.slice(0, 2).map((request) => ({
      type: "Stage",
      title: `${request.firstName} ${request.lastName}`,
      meta: request.institution || "Demande de stage",
      icon: UserPlus,
    })),
    ...data.projects.slice(0, 1).map((project) => ({
      type: "Projet",
      title: project.title,
      meta: project.client,
      icon: FolderKanban,
    })),
    ...data.announcements.slice(0, 1).map((announcement) => ({
      type: "Annonce",
      title: announcement.title,
      meta: ANNOUNCEMENT_TYPE_LABELS[announcement.type],
      icon: Megaphone,
    })),
    ...data.articles.slice(0, 1).map((article) => ({
      type: "Article",
      title: article.title,
      meta: article.author,
      icon: FileText,
    })),
  ].slice(0, 6);
}
