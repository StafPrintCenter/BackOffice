import { useQuery } from "@tanstack/react-query";
import { adminFetch } from "@/lib/api/resolve-url";
import { parseApiError } from "@/lib/api-error";
import type { APIAdminUser, APIAdminLoginResponse, AdminInviteVerifyResponse } from "@/data/auth";

export class AdminAuthApiError extends Error { }

export async function loginAdmin(email: string, password: string): Promise<APIAdminLoginResponse> {
  const formData = new FormData();
  formData.append("email", email);
  formData.append("password", password);

  const response = await adminFetch(`/api/admin/auth/login`, { method: "POST", body: formData });
  if (!response.ok) {
    const error = await parseApiError(response, "Email ou mot de passe incorrect.");
    throw new AdminAuthApiError(error.message);
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
    const error = await parseApiError(response, "Erreur lors de la vérification de la session.");
    throw new AdminAuthApiError(error.message);
  }
  const body = await response.json();
  return body?.data ?? body?.admin ?? body;
}

export async function logoutAdmin(): Promise<void> {
  const response = await adminFetch(`/api/admin/auth/logout`, { method: "POST" });
  if (!response.ok) {
    throw await parseApiError(response, "Erreur lors de la déconnexion.");
  }
}

function buildInviteQuery(params: { admin: string; expires: string; signature: string }) {
  return new URLSearchParams({
    admin: params.admin,
    expires: params.expires,
    signature: params.signature,
  }).toString();
}

export async function verifyAdminInvite(params: {
  admin: string;
  expires: string;
  signature: string;
}): Promise<AdminInviteVerifyResponse> {
  const response = await adminFetch(
    `/api/admin/auth/invite-accept?${buildInviteQuery(params)}`
  );
  if (!response.ok) {
    const error = await parseApiError(response, "Ce lien d'invitation est invalide ou a expiré.");
    throw new AdminAuthApiError(error.message);
  }
  const body = await response.json();
  return body.data as AdminInviteVerifyResponse;
}

export async function acceptAdminInvite(params: {
  admin: string;
  expires: string;
  signature: string;
  password: string;
}): Promise<{ message: string }> {
  const fd = new FormData();
  fd.append("password", params.password);

  const response = await adminFetch(
    `/api/admin/auth/invite-accept?${buildInviteQuery(params)}`,
    {
      method: "POST",
      body: fd,
    }
  );
  if (!response.ok) {
    const error = await parseApiError(response, "Ce lien d'invitation est invalide ou a expiré.");
    throw new AdminAuthApiError(error.message);
  }
  const body = await response.json();
  return body as { message: string };
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
