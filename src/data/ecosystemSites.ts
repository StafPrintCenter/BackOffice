export type EcosystemSiteCategory = "principal" | "outil" | "formation" | "communication" | "divertissement";
export type EcosystemSiteStatus = "available" | "building";

export const ECOSYSTEM_SITE_CATEGORY_LABELS: Record<EcosystemSiteCategory, string> = {
  principal: "Principal",
  outil: "Outil",
  formation: "Formation",
  communication: "Communication",
  divertissement: "Divertissement",
};

export const ECOSYSTEM_SITE_STATUS_LABELS: Record<EcosystemSiteStatus, string> = {
  available: "Disponible",
  building: "En construction",
};

export const ECOSYSTEM_SITE_STATUS_BADGES: Record<EcosystemSiteStatus, string> = {
  available: "bg-emerald-500/10 text-emerald-600",
  building: "bg-amber-500/10 text-amber-600",
};

export function getEcosystemSiteStatusBadge(status: EcosystemSiteStatus): string {
  return ECOSYSTEM_SITE_STATUS_BADGES[status] ?? "bg-muted text-muted-foreground";
}

export interface EcosystemSiteLogoVariants {
  mc: string;
  mw: string;
  dc: string;
  dw: string;
}

// Liste et détail renvoient les mêmes champs → un seul type, comme APIAdminCategory.
export type APIAdminEcosystemSite = {
  id: string;
  name: string;
  description: string;
  url: string;
  logoKey: string;
  // Champs calculés côté backend à partir de logo_key — jamais envoyés en écriture.
  logoBaseUrl: string;
  logoUrl: string;
  logoVariants: EcosystemSiteLogoVariants;
  category: EcosystemSiteCategory;
  status: EcosystemSiteStatus;
  createdAt: string;
  updatedAt: string;
};

export interface AdminEcosystemSitePayload {
  name: string;
  description: string;
  url: string;
  logo_key: string;
  category: EcosystemSiteCategory;
  status: EcosystemSiteStatus;
}
