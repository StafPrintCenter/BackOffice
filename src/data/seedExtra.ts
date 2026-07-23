import type { Stat, Report } from "@/types";

export const seedStats: Stat[] = [
  { id: "st1", key: "projects_completed", value: 320, suffix: "+", label: "Projets réalisés", createdAt: "2024-01-01" },
  { id: "st2", key: "clients_served", value: 180, suffix: "+", label: "Clients satisfaits", createdAt: "2024-01-01" },
  { id: "st3", key: "trainings_delivered", value: 45, suffix: "", label: "Formations livrées", createdAt: "2024-01-01" },
  { id: "st4", key: "years_experience", value: 8, suffix: "", label: "Années d'expérience", createdAt: "2024-01-01" },
];

export const seedReports: Report[] = [
  { id: "r1", reportableType: "Article", reportableId: "a1", reason: "Contenu inapproprié", message: "Certaines images ne sont pas libres de droits.", reporterEmail: "veille@example.com", status: "ouvert", createdAt: "2024-08-01" },
  { id: "r2", reportableType: "Testimonial", reportableId: "t3", reason: "Faux témoignage", message: "Ce client n'existe pas selon mes recherches.", reporterEmail: "anonymous@example.com", status: "en_cours", createdAt: "2024-08-05" },
  { id: "r3", reportableType: "Project", reportableId: "p2", reason: "Copyright", message: "Image utilisée sans autorisation.", reporterEmail: "legal@modabenin.com", status: "resolu", resolvedBy: "admin@stafprint.com", resolvedAt: "2024-08-08", createdAt: "2024-08-03" },
];

