import { z } from "zod";

export const RESOURCE_CATEGORIES = ["Gabarit", "Guide", "Outil"] as const;
export type ResourceCategory = (typeof RESOURCE_CATEGORIES)[number];

export interface APIAdminResourceListItem {
  id: string;
  slug: string;
  title: string;
  category: ResourceCategory;
  price: number;
  originalPrice: number | null;
  discountPercentage: number;
  status: string | null;
  short: string;
  format: string;
  meta: string;
  viewsCount: number;
  downloadsCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface APIAdminResource extends APIAdminResourceListItem {
  description?: string;
  includes?: string[];
  outcomes?: string[];
  audience?: string;
  requirements?: string[];
  license?: string;
  downloadUrl?: string | null;
  downloadFileName?: string | null;
}

export interface AdminResourcePayload {
  slug?: string;
  title: string;
  category: ResourceCategory;
  price: number;
  originalPrice: number | null;
  status?: string;
  short: string;
  description: string;
  format: string;
  meta: string;
  includes: string[];
  outcomes: string[];
  audience: string;
  requirements: string[];
  license: string;
  file?: File;
}

export const adminResourcePayloadSchema = z.object({
  slug: z.string().trim().max(200).optional(),
  title: z.string().trim().min(1, "Le titre est requis").max(255),
  category: z.enum(RESOURCE_CATEGORIES),
  price: z.number().int().min(0, "Le prix doit être positif ou nul"),
  originalPrice: z.number().int().min(0).nullable(),
  status: z.string().trim().max(100).optional(),
  short: z.string().trim().min(1, "La description courte est requise").max(1000),
  description: z.string().trim().min(1, "La description est requise").max(20000),
  format: z.string().trim().min(1, "Le format est requis").max(255),
  meta: z.string().trim().min(1, "Les métadonnées sont requises").max(255),
  includes: z.array(z.string().trim().min(1)).min(1, "Ajoutez au moins un élément inclus"),
  outcomes: z.array(z.string().trim().min(1)).min(1, "Ajoutez au moins un résultat"),
  audience: z.string().trim().min(1, "Le public cible est requis").max(5000),
  requirements: z.array(z.string().trim().min(1)).min(1, "Ajoutez au moins un prérequis"),
  license: z.string().trim().min(1, "La licence est requise").max(10000),
  file: z.instanceof(File).optional(),
});
