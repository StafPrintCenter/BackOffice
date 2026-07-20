import type { Service } from "@/types";
import { seedServices } from "@/data/seed";
import { delay, uid, slugify } from "./_helpers";

let db: Service[] = [...seedServices];

export const servicesApi = {
  async list(): Promise<Service[]> {
    await delay();
    return [...db];
  },
  async getBySlug(slug: string): Promise<Service | null> {
    await delay(200);
    return db.find((s) => s.slug === slug) ?? null;
  },
  async create(input: Omit<Service, "id" | "createdAt">): Promise<Service> {
    await delay();
    const item: Service = { ...input, slug: input.slug || slugify(input.title), id: uid(), createdAt: new Date().toISOString() };
    db = [item, ...db];
    return item;
  },
  async update(id: string, input: Partial<Service>): Promise<Service> {
    await delay();
    db = db.map((s) => (s.id === id ? { ...s, ...input } : s));
    return db.find((s) => s.id === id)!;
  },
  async remove(id: string): Promise<void> {
    await delay();
    db = db.filter((s) => s.id !== id);
  },
};
