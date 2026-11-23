export interface APIAdminNewsletterCategoryRef {
  id: string;
  name: string;
  slug: string;
}

export const NEWSLETTER_SUBSCRIBER_SOURCES = [
  "direct",
  "admin_conversion",
  "instructor_conversion",
  "student_conversion",
] as const;

export type APIAdminNewsletterSubscriberSource =
  (typeof NEWSLETTER_SUBSCRIBER_SOURCES)[number];

export function getNewsletterSubscriberSourceLabel(
  source: APIAdminNewsletterSubscriberSource,
): string {
  const labels: Record<APIAdminNewsletterSubscriberSource, string> = {
    direct: "Inscription directe",
    admin_conversion: "Conversion depuis l'administration",
    instructor_conversion: "Conversion depuis l'espace formateur",
    student_conversion: "Conversion depuis l'espace étudiant",
  };

  return labels[source];
}

export type APIAdminNewsletterSubscriberListItem = {
  id: string;
  email: string;
  source: APIAdminNewsletterSubscriberSource;
  firstName: string;
  lastName: string;
  notes: string | null;
  categories: APIAdminNewsletterCategoryRef[];
  isActive: boolean;
  isBlocked: boolean;
  subscribedAt: string;
  unsubscribedAt: string | null;
  blockedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type APIAdminNewsletterSubscriberDetail = APIAdminNewsletterSubscriberListItem & {
  blockedReason: string | null;
};

export interface AdminNewsletterBlockPayload {
  reason: string;
}