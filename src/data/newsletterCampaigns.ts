export type NewsletterCampaignStatus = "draft" | "scheduled" | "sent";

export type APIAdminNewsletterCampaignListItem = {
  id: string;
  subject: string;
  category: string | null;
  sentBy: string;
  recipientsCount: number | null;
  status: NewsletterCampaignStatus;
  scheduledAt: string | null;
  sentAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type APIAdminNewsletterCampaignDetail = APIAdminNewsletterCampaignListItem & {
  body: string;
};

export interface AdminNewsletterCampaignPayload {
  subject: string;
  body: string;
  category_id?: string;
}

export interface AdminNewsletterCampaignSchedulePayload {
  scheduled_at: string; // ISO 8601
}

export const NEWSLETTER_CAMPAIGN_STATUS_MAP: Record<NewsletterCampaignStatus | string, string> = {
  draft: "bg-muted text-muted-foreground border-border",
  scheduled: "bg-amber-100 text-amber-700 border-amber-200",
  sent: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

export const NEWSLETTER_CAMPAIGN_STATUS_LABELS: Record<NewsletterCampaignStatus | string, string> = {
  draft: "Brouillon",
  scheduled: "Programmée",
  sent: "Envoyée",
};