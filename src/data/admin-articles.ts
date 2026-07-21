export type APIAdminArticleListItem = {
  id: string;
  slug: string;
  title: string;
  author: string;
  categoryId: string;
  category: string;
  date: string;
  readMinutes: number;
  excerpt: string;
  cover: string;
  createdAt: string;
  updatedAt: string;
};

export type APIAdminArticleDetail = APIAdminArticleListItem & {
  body: string;
};

export interface AdminArticlePayload {
  slug?: string;
  title: string;
  author: string;
  category_id: string;
  published_at: string; // YYYY-MM-DD
  excerpt: string;
  cover: string;
  body: string;
}