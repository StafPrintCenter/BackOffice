export const SERVICE_CATEGORIES = [
  {
    value: "digital",
    label: "Digital",
    badgeClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200/20",
  },
  {
    value: "impression",
    label: "Impression",
    badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200/20",
  },
  {
    value: "formation",
    label: "Formation",
    badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200/20",
  },
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