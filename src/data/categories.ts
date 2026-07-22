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

export const TAILWIND_COLOR_SAFELIST = [
  "bg-rose-500/10 text-rose-600",
  "bg-teal-500/10 text-teal-600",
  "bg-indigo-500/10 text-indigo-600",
  "bg-emerald-500/10 text-emerald-600",
  "bg-amber-500/10 text-amber-600",
  "bg-cyan-500/10 text-cyan-600",
  "bg-purple-500/10 text-purple-600",
  "bg-sky-500/10 text-sky-600",
  "bg-slate-100 text-slate-700",
];