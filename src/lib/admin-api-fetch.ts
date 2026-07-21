import { resolveApiUrl } from "@/lib/api-url";

export async function adminFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");

  return fetch(resolveApiUrl(path), {
    ...init,
    headers,
    credentials: "include",
  });
}