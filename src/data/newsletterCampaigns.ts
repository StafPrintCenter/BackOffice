export type NewsletterCampaignStatus = "draft" | "scheduled" | "sent" | string;

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