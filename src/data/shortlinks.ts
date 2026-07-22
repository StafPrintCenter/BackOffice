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

export interface ShortLinkStats {
  alias: string;
  totalClicks: number;
  byCountry: { country: string; total: number }[];
  byDevice: { device: string; total: number }[];
  byDay: { day: string; total: number }[];
}