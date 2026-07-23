import type { Stat, ShortLink, Report, } from "@/types";
import { seedStats, seedShortLinks, seedReports } from "@/data/seedExtra";
import { makeApi } from "./_makeApi";

export const statsApi = makeApi<Stat>(seedStats);
export const shortLinksApi = makeApi<ShortLink>(seedShortLinks);
export const reportsApi = makeApi<Report>(seedReports);
