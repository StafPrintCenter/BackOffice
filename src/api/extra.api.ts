import type { Category, Stat, Faq, ShortLink, ShortLinkClick, Message, Report, AppUser } from "@/types";
import { seedCategories, seedStats, seedShortLinks, seedShortLinkClicks, seedMessages, seedReports, seedUsers } from "@/data/seedExtra";
import { makeApi } from "./_makeApi";

export const categoriesApi = makeApi<Category>(seedCategories);
export const statsApi = makeApi<Stat>(seedStats);
export const shortLinksApi = makeApi<ShortLink>(seedShortLinks);
export const shortLinkClicksApi = makeApi<ShortLinkClick>(seedShortLinkClicks);
export const messagesApi = makeApi<Message>(seedMessages);
export const reportsApi = makeApi<Report>(seedReports);
export const usersApi = makeApi<AppUser>(seedUsers);
