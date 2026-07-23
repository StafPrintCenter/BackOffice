import { useQuery } from "@tanstack/react-query";
import { adminFetch } from "@/lib/api-url";
import type { APIAdminUser, APILoginResponse } from "@/data/auth";

export class AdminAuthApiError extends Error { }

export async function loginAdmin(email: string, password: string): Promise<APILoginResponse> {
  const formData = new FormData();
  formData.append("email", email);
  formData.append("password", password);

  const response = await adminFetch(`/api/admin/auth/login`, { method: "POST", body: formData });
  if (!response.ok) {
    throw new AdminAuthApiError("Email ou mot de passe incorrect.");
  }

  return response.json();
}

/**
 * Revalide la session via le cookie httpOnly envoyé automatiquement.
 * Retourne null si aucune session valide n'est active (401).
 */
export async function fetchAdminMe(): Promise<APIAdminUser | null> {
  const response = await adminFetch(`/api/admin/auth/me`);
  if (response.status === 401) return null;
  if (!response.ok) {
    throw new AdminAuthApiError("Erreur lors de la vérification de la session.");
  }
  return response.json();
}

export async function logoutAdmin(): Promise<void> {
  await adminFetch(`/api/admin/auth/logout`, { method: "POST" });
}

/**
 * Hook pour récupérer l'administrateur actuellement connecté
 */
export function useCurrentAdmin() {
  const { data: admin, isLoading, error } = useQuery({
    queryKey: ["current-admin"],
    queryFn: fetchAdminMe,
    staleTime: 1000 * 60 * 5, // Met en cache les données pendant 5 minutes
    retry: false, // Ne pas réessayer indéfiniment en cas de 401
  });

  return {
    admin: admin ?? null,
    isLoading,
    isAuthenticated: !!admin,
    error,
  };
}