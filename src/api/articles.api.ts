import type { Article } from "@/types";
import { seedArticles } from "@/data/seed";
import { delay, uid, slugify } from "./_helpers";

let db: Article[] = [...seedArticles];

export const articlesApi = {
  async list(): Promise<Article[]> {
    await delay();
    return [...db];
  },
  async getBySlug(slug: string): Promise<Article | null> {
    await delay(200);
    return db.find((a) => a.slug === slug) ?? null;
  },
  async create(input: Omit<Article, "id" | "createdAt">): Promise<Article> {
    await delay();
    const item: Article = { ...input, slug: input.slug || slugify(input.title), id: uid(), createdAt: new Date().toISOString() };
    db = [item, ...db];
    return item;
  },
  async update(id: string, input: Partial<Article>): Promise<Article> {
    await delay();
    db = db.map((a) => (a.id === id ? { ...a, ...input } : a));
    return db.find((a) => a.id === id)!;
  },
  async remove(id: string): Promise<void> {
    await delay();
    db = db.filter((a) => a.id !== id);
  },
};
