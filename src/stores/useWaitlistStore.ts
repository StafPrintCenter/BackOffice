import { createResourceStore } from "./createResourceStore";
import type { APIAdminWaitlistEntry } from "@/data/waitlist";

const store = createResourceStore<APIAdminWaitlistEntry>({
  resourceKey: "waitlist",
  basePath: "waitlist",
});

export const fetchAdminWaitlistEntries = store.fetchList;
export const fetchAdminWaitlistEntryById = store.fetchById;

export const useAdminWaitlistList = store.useList;
export const useAdminWaitlistDetail = store.useDetail;