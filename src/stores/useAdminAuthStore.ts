import { adminFetch, setAdminToken, clearAdminToken, getAdminToken } from "@/lib/admin-api-fetch";
import type { APIAdminUser, APILoginResponse } from "@/data/admin-auth";

export class AdminAuthApiError extends Error { }

export async function loginAdmin(email: string, password: string): Promise<APILoginResponse> {
  const formData = new FormData();
  formData.append("email", email);
  formData.append("password", password);

  const response = await adminFetch(`/api/admin/auth/login`, { method: "POST", body: formData });
  if (!response.ok) {
    throw new AdminAuthApiError("Email ou mot de passe incorrect.");
  }
  // Le cookie httpOnly "admin_token" est posé automatiquement par le Set-Cookie
  // de cette réponse — rien à stocker manuellement côté front.
  return response.json();
}

/**
 * Revalide le token stocké et récupère l'utilisateur à jour.
 * Retourne null si aucun token n'est présent ou si le token est invalide/expiré.
 */
export async function fetchAdminMe(): Promise<APIAdminUser | null> {
  if (!getAdminToken()) return null;

  const response = await adminFetch(`/api/admin/auth/me`);
  if (response.status === 401) {
    clearAdminToken();
    return null;
  }
  if (!response.ok) {
    throw new AdminAuthApiError("Erreur lors de la vérification de la session.");
  }
  return response.json();
}

export async function logoutAdmin(): Promise<void> {
  try {
    await adminFetch(`/api/admin/auth/logout`, { method: "POST" });
  } finally {
    // Le nettoyage local doit toujours avoir lieu, même si l'appel réseau échoue
    clearAdminToken();
  }
}