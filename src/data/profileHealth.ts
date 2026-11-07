export type AdminHealthLevel = "excellent" | "good" | "fair" | "low";
export type AdminHealthCategory = "security" | "profile";

export interface APIAdminHealthBreakdownEntry {
  percent: number;
  earned: number;
  total: number;
}

export interface APIAdminHealthItem {
  id: string;
  category: AdminHealthCategory;
  label: string;
  done: boolean;
  points: number;
}

export interface APIAdminHealthRecommendation {
  id: string;
  priority: number;
  type: AdminHealthCategory;
  level: "warning" | "info";
  urgent: boolean;
  title: string;
  message: string;
  action: { label: string; target: string };
  points: number;
  dismissed: boolean;
  ageDays?: number;
  sessions?: number;
  staleSessions?: number;
  missing?: string[];
}

export interface APIAdminHealth {
  score: number;
  level: AdminHealthLevel;
  label: string;
  breakdown: Record<AdminHealthCategory, APIAdminHealthBreakdownEntry>;
  items: APIAdminHealthItem[];
  recommendations: APIAdminHealthRecommendation[];
  dismissedCount: number;
  snoozeDays: number;
}

export interface AdminHealthDismissPayload {
  id: string;
  restore?: boolean;
}

export interface APIAdminHealthDismissResponse {
  id: string;
  dismissed: boolean;
  snoozeDays: number;
}