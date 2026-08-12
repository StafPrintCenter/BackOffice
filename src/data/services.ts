export const SERVICE_CATEGORIES = [
  { value: "digital", label: "Digital" },
  { value: "impression", label: "Impression" },
  { value: "formation", label: "Formation" },
] as const;

export type ServiceCategoryEnum = typeof SERVICE_CATEGORIES[number]["value"];

export type APIAdminServiceListItem = {
  id: string;
  slug: string;
  title: string;
  icon: string;
  category: ServiceCategoryEnum;
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
  category: ServiceCategoryEnum;
  featured: boolean;
  short: string;
  long: string;
  color: string;
  features: string[];
  process: AdminServiceProcessStep[];
}