export interface APIAdminCategory {
  id: string;
  slug: string;
  name: string;
  colorClass: string;
  isTrainingTheme: boolean;
  isProjectCategory: boolean;
  isArticleCategory: boolean;
  isNewsletterCategory: boolean;
  createdAt: string;
  updatedAt: string;
};

export interface AdminCategoryPayload {
  name: string;
  slug?: string;
  color_class: string;
  is_training_theme: boolean;
  is_project_category: boolean;
  is_article_category: boolean;
  is_newsletter_category?: boolean;
}