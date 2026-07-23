import type { Category, Stat, ShortLink, ShortLinkClick, Report } from "@/types";

export const seedCategories: Category[] = [
  { id: "c1", name: "Design", slug: "design", colorClass: "bg-orange-100 text-orange-700", isTrainingTheme: true, isProjectCategory: false, isArticleCategory: true, createdAt: "2024-01-01" },
  { id: "c2", name: "Web", slug: "web", colorClass: "bg-blue-100 text-blue-700", isTrainingTheme: true, isProjectCategory: true, isArticleCategory: true, createdAt: "2024-01-01" },
  { id: "c3", name: "Impression", slug: "impression", colorClass: "bg-emerald-100 text-emerald-700", isTrainingTheme: false, isProjectCategory: true, isArticleCategory: true, createdAt: "2024-01-01" },
  { id: "c4", name: "Marketing", slug: "marketing", colorClass: "bg-pink-100 text-pink-700", isTrainingTheme: true, isProjectCategory: false, isArticleCategory: false, createdAt: "2024-01-01" },
  { id: "c5", name: "Formation", slug: "formation", colorClass: "bg-amber-100 text-amber-700", isTrainingTheme: false, isProjectCategory: false, isArticleCategory: true, createdAt: "2024-01-01" },
  { id: "c6", name: "Branding", slug: "branding", colorClass: "bg-purple-100 text-purple-700", isTrainingTheme: false, isProjectCategory: true, isArticleCategory: false, createdAt: "2024-01-01" },
];

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

const devices = ["Desktop", "Mobile", "Tablet"];
const browsers = ["Chrome", "Safari", "Firefox", "Edge"];
const platforms = ["Windows", "macOS", "Android", "iOS", "Linux"];
const countries = ["Bénin", "France", "Sénégal", "Côte d'Ivoire", "Togo"];
const cities = ["Cotonou", "Paris", "Dakar", "Abidjan", "Lomé"];

export const seedShortLinkClicks: ShortLinkClick[] = Array.from({ length: 60 }).map((_, i) => {
  const link = seedShortLinks[i % seedShortLinks.length];
  const daysAgo = Math.floor(Math.random() * 30);
  const date = new Date(); date.setDate(date.getDate() - daysAgo);
  const idx = i % 5;
  return {
    id: `slc${i + 1}`,
    shortLinkId: link.id,
    ipAddress: `41.234.${(i * 7) % 255}.${(i * 13) % 255}`,
    userAgent: "Mozilla/5.0",
    referer: i % 3 === 0 ? "https://facebook.com" : i % 3 === 1 ? "https://google.com" : "direct",
    country: countries[idx],
    region: countries[idx],
    city: cities[idx],
    device: devices[i % 3],
    browser: browsers[i % 4],
    platform: platforms[i % 5],
    clickedAt: date.toISOString(),
    createdAt: date.toISOString(),
  };
});

export const seedReports: Report[] = [
  { id: "r1", reportableType: "Article", reportableId: "a1", reason: "Contenu inapproprié", message: "Certaines images ne sont pas libres de droits.", reporterEmail: "veille@example.com", status: "ouvert", createdAt: "2024-08-01" },
  { id: "r2", reportableType: "Testimonial", reportableId: "t3", reason: "Faux témoignage", message: "Ce client n'existe pas selon mes recherches.", reporterEmail: "anonymous@example.com", status: "en_cours", createdAt: "2024-08-05" },
  { id: "r3", reportableType: "Project", reportableId: "p2", reason: "Copyright", message: "Image utilisée sans autorisation.", reporterEmail: "legal@modabenin.com", status: "resolu", resolvedBy: "admin@stafprint.com", resolvedAt: "2024-08-08", createdAt: "2024-08-03" },
];

