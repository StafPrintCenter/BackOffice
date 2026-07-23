export interface APIAdminNewsletterCategoryRef {
  id: string;
  name: string;
  slug: string;
}

export type APIAdminNewsletterSubscriberListItem = {
  id: string;
  email: string;
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