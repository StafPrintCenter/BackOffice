export type WaitlistPlatform = "instructor" | "student" | "meet" | "other";

export const WAITLIST_PLATFORM_LABELS: Record<WaitlistPlatform, string> = {
  instructor: "Espace Formateur",
  student: "Espace Apprenant",
  meet: "SPC Meet",
  other: "Autre",
};

export const WAITLIST_PLATFORM_BADGES: Record<WaitlistPlatform, string> = {
  instructor: "bg-violet-500/10 text-violet-600",
  student: "bg-sky-500/10 text-sky-600",
  meet: "bg-emerald-500/10 text-emerald-600",
  other: "bg-muted text-muted-foreground",
};

export function getWaitlistPlatformBadge(platform: WaitlistPlatform): string {
  return WAITLIST_PLATFORM_BADGES[platform] ?? "bg-muted text-muted-foreground";
}

export function getWaitlistPlatformLabel(platform: WaitlistPlatform): string {
  return WAITLIST_PLATFORM_LABELS[platform] ?? platform;
}

// Liste et détail renvoient les mêmes champs
export type APIAdminWaitlistEntry = {
  id: string;
  email: string;
  platformName: WaitlistPlatform;
  createdAt: string;
  updatedAt: string;
};