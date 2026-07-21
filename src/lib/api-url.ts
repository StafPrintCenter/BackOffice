/**
 * Résout une URL d'API relative pour qu'elle fonctionne à la fois côté client (navigateur)
 * et côté serveur (SSR / loaders exécutés sur Node).
 */

function resolveApiUrl(path: string): string {
  const versionedPath = path.replace(/^\/api\//, "/api/v1/");

  if (typeof window !== "undefined") {
    return versionedPath;
  }

  const apiOrigin = import.meta.env.VITE_API_ORIGIN;
  return `${apiOrigin}${versionedPath}`;
}

export async function adminFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");

  return fetch(resolveApiUrl(path), {
    ...init,
    headers,
    credentials: "include",
  });
}