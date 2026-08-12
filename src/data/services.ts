export const SERVICE_CATEGORIES = [
  { value: "digital", label: "Digital" },
  { value: "impression", label: "Impression" },
  { value: "formation", label: "Formation" },
] as const;

export type ServiceCategoryEnum = typeof SERVICE_CATEGORIES[number]["value"];

/**
 * Récupère les métadonnées d'une catégorie (label, badgeClass) à partir de sa clé.
 */
export const getServiceCategoryConfig = (category: string) => {
  return (
    SERVICE_CATEGORIES.find((cat) => cat.value === category) ?? {
      value: category,
      label: category,
      badgeClass: "bg-primary/10 text-primary border-primary/20",
    }
  );
};

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