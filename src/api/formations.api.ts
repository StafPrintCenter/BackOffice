import type { Formation } from "@/types";
import { seedFormations } from "@/data/seed";
import { delay, uid } from "./_helpers";

let db: Formation[] = [...seedFormations];

export const formationsApi = {
  async list(): Promise<Formation[]> {
    await delay();
    return [...db];
  },
  async getById(id: string): Promise<Formation | null> {
    await delay(200);
    return db.find((f) => f.id === id) ?? null;
  },
  async create(input: Omit<Formation, "id" | "createdAt">): Promise<Formation> {
    await delay();
    const item: Formation = { ...input, id: uid(), createdAt: new Date().toISOString() };
    db = [item, ...db];
    return item;
  },
  async update(id: string, input: Partial<Formation>): Promise<Formation> {
    await delay();
    db = db.map((f) => (f.id === id ? { ...f, ...input } : f));
    return db.find((f) => f.id === id)!;
  },
  async remove(id: string): Promise<void> {
    await delay();
    db = db.filter((f) => f.id !== id);
  },
};
