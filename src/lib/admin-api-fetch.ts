import { resolveApiUrl } from "@/lib/api-url";

const TOKEN_KEY = "admin_auth_token";

export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setAdminToken(token: string): void {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearAdminToken(): void {
  window.localStorage.removeItem(TOKEN_KEY);
}

/**
 * fetch() authentifié pour les routes /admin/... — ajoute automatiquement
 * le Bearer token stocké. Distinct du fetch public (createResourceStore)
 * qui n'a jamais besoin d'Authorization.
 */
export async function adminFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = getAdminToken();
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  return fetch(resolveApiUrl(path), { ...init, headers });
}