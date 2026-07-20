import type { User } from "@/types";
import { delay } from "./_helpers";

const HARDCODED = { email: "admin@stafprint.com", password: "admin123" };
const STORAGE_KEY = "staf_auth";

export const authApi = {
  async login(email: string, password: string): Promise<User> {
    await delay(400);
    if (email !== HARDCODED.email || password !== HARDCODED.password) {
      throw new Error("Identifiants incorrects");
    }
    const user: User = { email, name: "Admin Staf", token: "mock-token-" + Date.now() };
    if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    return user;
  },
  async logout(): Promise<void> {
    await delay(100);
    if (typeof window !== "undefined") localStorage.removeItem(STORAGE_KEY);
  },
  current(): User | null {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try { return JSON.parse(raw) as User; } catch { return null; }
  },
};
