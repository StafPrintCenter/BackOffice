import { delay, uid } from "./_helpers";

export function makeApi<T extends { id: string; createdAt: string }>(seed: T[]) {
  let db: T[] = [...seed];
  return {
    async list(): Promise<T[]> { await delay(); return [...db]; },
    async getById(id: string): Promise<T | null> { await delay(200); return db.find((x) => x.id === id) ?? null; },
    async create(input: Omit<T, "id" | "createdAt">): Promise<T> {
      await delay();
      const item = { ...(input as object), id: uid(), createdAt: new Date().toISOString() } as T;
      db = [item, ...db];
      return item;
    },
    async update(id: string, input: Partial<T>): Promise<T> {
      await delay();
      db = db.map((x) => (x.id === id ? { ...x, ...input } : x));
      return db.find((x) => x.id === id)!;
    },
    async remove(id: string): Promise<void> { await delay(); db = db.filter((x) => x.id !== id); },
    async all(): Promise<T[]> { return [...db]; },
  };
}
