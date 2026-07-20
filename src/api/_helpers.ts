export const delay = (ms = 300) => new Promise<void>((r) => setTimeout(r, ms));

export const uid = () => Math.random().toString(36).slice(2, 10);

export const slugify = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
