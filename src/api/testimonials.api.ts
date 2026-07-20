import type { Testimonial } from "@/types";
import { seedTestimonials } from "@/data/seed";
import { delay, uid } from "./_helpers";

let db: Testimonial[] = [...seedTestimonials];

export const testimonialsApi = {
  async list(): Promise<Testimonial[]> {
    await delay();
    return [...db];
  },
  async create(input: Omit<Testimonial, "id" | "createdAt">): Promise<Testimonial> {
    await delay();
    const item: Testimonial = { ...input, id: uid(), createdAt: new Date().toISOString() };
    db = [item, ...db];
    return item;
  },
  async update(id: string, input: Partial<Testimonial>): Promise<Testimonial> {
    await delay();
    db = db.map((t) => (t.id === id ? { ...t, ...input } : t));
    return db.find((t) => t.id === id)!;
  },
  async remove(id: string): Promise<void> {
    await delay();
    db = db.filter((t) => t.id !== id);
  },
};
