import type { Project } from "@/types";
import { seedProjects } from "@/data/seed";
import { delay, uid } from "./_helpers";

let db: Project[] = [...seedProjects];

export const projectsApi = {
  async list(): Promise<Project[]> {
    await delay();
    return [...db];
  },
  async getById(id: string): Promise<Project | null> {
    await delay(200);
    return db.find((p) => p.id === id) ?? null;
  },
  async create(input: Omit<Project, "id" | "createdAt">): Promise<Project> {
    await delay();
    const item: Project = { ...input, id: uid(), createdAt: new Date().toISOString() };
    db = [item, ...db];
    return item;
  },
  async update(id: string, input: Partial<Project>): Promise<Project> {
    await delay();
    db = db.map((p) => (p.id === id ? { ...p, ...input } : p));
    return db.find((p) => p.id === id)!;
  },
  async remove(id: string): Promise<void> {
    await delay();
    db = db.filter((p) => p.id !== id);
  },
};
