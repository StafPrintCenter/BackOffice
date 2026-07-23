import type { Stat, Report, } from "@/types";
import { seedStats, seedReports } from "@/data/seedExtra";
import { makeApi } from "./_makeApi";

export const statsApi = makeApi<Stat>(seedStats);
export const reportsApi = makeApi<Report>(seedReports);
