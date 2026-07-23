import type { Stat, ShortLink, Report } from "@/types";

export const seedStats: Stat[] = [
  { id: "st1", key: "projects_completed", value: 320, suffix: "+", label: "Projets réalisés", createdAt: "2024-01-01" },
  { id: "st2", key: "clients_served", value: 180, suffix: "+", label: "Clients satisfaits", createdAt: "2024-01-01" },
  { id: "st3", key: "trainings_delivered", value: 45, suffix: "", label: "Formations livrées", createdAt: "2024-01-01" },
  { id: "st4", key: "years_experience", value: 8, suffix: "", label: "Années d'expérience", createdAt: "2024-01-01" },
];

export const seedShortLinks: ShortLink[] = [
  { id: "sl1", longUrl: "https://stafprint.com/formations/graphisme", longUrlHash: "a1b2c3", alias: "form-graph", category: "Formation", createdBy: "admin@stafprint.com", clicksCount: 148, activateAt: "2024-06-01", expiresAt: "2025-06-01", isActive: true, createdAt: "2024-06-01" },
  { id: "sl2", longUrl: "https://stafprint.com/services/impression", longUrlHash: "d4e5f6", alias: "print-promo", category: "Service", createdBy: "admin@stafprint.com", clicksCount: 92, activateAt: "2024-07-15", expiresAt: "2025-01-15", isActive: true, createdAt: "2024-07-15" },
  { id: "sl3", longUrl: "https://stafprint.com/blog/tendances-2024", longUrlHash: "g7h8i9", alias: "blog-2024", category: "Blog", createdBy: "admin@stafprint.com", clicksCount: 220, activateAt: "2024-04-01", expiresAt: "2025-04-01", isActive: true, createdAt: "2024-04-01" },
  { id: "sl4", longUrl: "https://stafprint.com/contact", longUrlHash: "j0k1l2", alias: "contact-fb", category: "Contact", createdBy: "admin@stafprint.com", clicksCount: 34, activateAt: "2024-08-01", expiresAt: "2024-12-01", isActive: false, createdAt: "2024-08-01" },
];

export const seedReports: Report[] = [
  { id: "r1", reportableType: "Article", reportableId: "a1", reason: "Contenu inapproprié", message: "Certaines images ne sont pas libres de droits.", reporterEmail: "veille@example.com", status: "ouvert", createdAt: "2024-08-01" },
  { id: "r2", reportableType: "Testimonial", reportableId: "t3", reason: "Faux témoignage", message: "Ce client n'existe pas selon mes recherches.", reporterEmail: "anonymous@example.com", status: "en_cours", createdAt: "2024-08-05" },
  { id: "r3", reportableType: "Project", reportableId: "p2", reason: "Copyright", message: "Image utilisée sans autorisation.", reporterEmail: "legal@modabenin.com", status: "resolu", resolvedBy: "admin@stafprint.com", resolvedAt: "2024-08-08", createdAt: "2024-08-03" },
];

