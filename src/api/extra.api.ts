import type { Report, } from "@/types";
import { seedReports } from "@/data/seedExtra";
import { makeApi } from "./_makeApi";

export const reportsApi = makeApi<Report>(seedReports);
