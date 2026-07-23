import type { Category, Stat, ShortLink, ShortLinkClick, Report, } from "@/types";
import { seedCategories, seedStats, seedShortLinks, seedShortLinkClicks, seedReports } from "@/data/seedExtra";
import { makeApi } from "./_makeApi";

export const categoriesApi = makeApi<Category>(seedCategories);
export const statsApi = makeApi<Stat>(seedStats);
export const shortLinksApi = makeApi<ShortLink>(seedShortLinks);
export const shortLinkClicksApi = makeApi<ShortLinkClick>(seedShortLinkClicks);
export const reportsApi = makeApi<Report>(seedReports);
