export const SHORT_LINK_CATEGORIES = [
  { value: "design", label: "Design" },
  { value: "web", label: "Web" },
  { value: "print", label: "Impression" },
  { value: "video", label: "Vidéo" },
  { value: "formation", label: "Formation" },
  { value: "tips", label: "Conseils" },
  { value: "news", label: "Actus" },
  { value: "blog", label: "Blog" },
  { value: "newsletter", label: "Newsletter" },
  { value: "other", label: "Autre" },
] as const;

export interface ShortLinkStats {
  alias: string;
  totalClicks: number;
  byCountry: { country: string; total: number }[];
  byDevice: { device: string; total: number }[];
  byBrowser: { browser: string; total: number }[];
  byCity: { city: string; total: number }[];
  byDay: { day: string; total: number }[];
  history: {
    country: string | null;
    city: string | null;
    device: string;
    browser: string;
    referer: string | null;
    clicked_at: string;
  }[];
}

export type APIAdminShortLinkListItem = {
  id: string;
  alias: string;
  shortUrl: string;
  longUrl: string;
  category: string;
  clicksCount: number;
  isActive: boolean;
  activateAt: string | null;
  expiresAt: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type APIAdminShortLinkDetail = APIAdminShortLinkListItem;

export interface AdminShortLinkPayload {
  long_url: string;
  alias?: string;
  category: string;
  is_active?: boolean;
  activate_at?: string;
  expires_at?: string;
}
