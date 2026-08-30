import { createResourceStore } from "./createResourceStore";
import type { APIAdminEcosystemSite, AdminEcosystemSitePayload } from "@/data/ecosystemSites";

const store = createResourceStore<APIAdminEcosystemSite, AdminEcosystemSitePayload>({
  resourceKey: "ecosystem-sites",
  basePath: "ecosystem-sites",
});

export const fetchAdminEcosystemSites = store.fetchList;
export const fetchAdminEcosystemSiteById = store.fetchById;
export const createAdminEcosystemSite = store.createItem;
export const updateAdminEcosystemSite = store.updateItem;
export const deleteAdminEcosystemSite = store.removeItem;

export const useAdminEcosystemSitesList = store.useList;
export const useAdminEcosystemSiteDetail = store.useDetail;
export const useCreateAdminEcosystemSite = store.useCreate;
export const useUpdateAdminEcosystemSite = store.useUpdate;
export const useDeleteAdminEcosystemSite = store.useRemove;