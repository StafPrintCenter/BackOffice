export type APIAdminServiceListItem = {
  id: string;
  slug: string;
  title: string;
  icon: string;
  categoryId: string;
  category: string;
  featured: boolean;
  short: string;
  long: string;
  color: string;
  createdAt: string;
  updatedAt: string;
};

export interface AdminServiceProcessStep {
  step: string;
  text: string;
}

export type APIAdminServiceDetail = APIAdminServiceListItem & {
  features: string[];
  process: AdminServiceProcessStep[];
};

export interface AdminServicePayload {
  slug?: string;
  title: string;
  icon: string;
  project_category_id: string;
  featured: boolean;
  short: string;
  long: string;
  color: string;
  features: string[];
  process: AdminServiceProcessStep[];
}