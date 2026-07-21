import { resolveApiUrl } from "@/lib/api-url";
import { getCookie, setCookie, deleteCookie } from "@/lib/cookies";

const TOKEN_COOKIE = "admin_token";

export function getAdminToken(): string | null {
  return getCookie(TOKEN_COOKIE);
}

export function setAdminToken(token: string): void {
  setCookie(TOKEN_COOKIE, token, 7);
}

export function clearAdminToken(): void {
  deleteCookie(TOKEN_COOKIE);
}

export async function adminFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = getAdminToken();
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  return fetch(resolveApiUrl(path), { ...init, headers });
}