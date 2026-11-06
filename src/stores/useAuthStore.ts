import { useQuery } from "@tanstack/react-query";
import { adminFetch } from "@/lib/api/resolve-url";
import { parseApiError } from "@/lib/api/error";
import type {
  APIAdminUser,
  AdminInviteVerifyResponse,
  APIAdminLoginResult,
  APIAdminMfaEmailResend,
  AdminMfaVerifyPayload,
} from "@/data/auth";
import type { APIAdminPasskeyRequestOptions } from "@/data/passkeys";

export class AdminAuthApiError extends Error { }

export async function loginAdmin(email: string, password: string): Promise<APIAdminLoginResult> {
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
  const response = await adminFetch(`/api/admin/account/me`);
  if (response.status === 401) return null;
  if (!response.ok) {
    const error = await parseApiError(response, "Erreur lors de la vérification de la session.");
    throw new AdminAuthApiError(error.message);
  }
  const body = await response.json();
  return body?.data ?? body?.admin ?? body;
}

export async function logoutAdmin(): Promise<void> {
  const response = await adminFetch(`/api/admin/account/logout`, { method: "POST" });
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
  const response = await adminFetch(`/api/admin/auth/invite-accept?${buildInviteQuery(params)}`);
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

  const response = await adminFetch(`/api/admin/auth/invite-accept?${buildInviteQuery(params)}`, {
    method: "POST",
    body: fd,
  });
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
  const {
    data: admin,
    isLoading,
    error,
  } = useQuery({
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

export async function forgotAdminPassword(email: string): Promise<{ message: string }> {
  const fd = new FormData();
  fd.append("email", email);

  const response = await adminFetch(`/api/admin/auth/forgot-password`, {
    method: "POST",
    body: fd,
  });
  if (!response.ok) {
    const error = await parseApiError(
      response,
      "Impossible d'envoyer l'e-mail de réinitialisation.",
    );
    throw new AdminAuthApiError(error.message);
  }
  return (await response.json()) as { message: string };
}

export async function resetAdminPassword(params: {
  email: string;
  token: string;
  password: string;
  passwordConfirmation: string;
}): Promise<{ message: string }> {
  const fd = new FormData();
  fd.append("email", params.email);
  fd.append("token", params.token);
  fd.append("password", params.password);
  fd.append("password_confirmation", params.passwordConfirmation);

  const response = await adminFetch(`/api/admin/auth/reset-password`, { method: "POST", body: fd });
  if (!response.ok) {
    const error = await parseApiError(
      response,
      "Ce lien de réinitialisation est invalide ou a expiré.",
    );
    throw new AdminAuthApiError(error.message);
  }
  return (await response.json()) as { message: string };
}

export class AdminMfaLoginError extends AdminAuthApiError {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
    public readonly attemptsLeft?: number,
    public readonly retryAfter?: number,
  ) {
    super(message);
    this.name = "AdminMfaLoginError";
  }
}

async function buildMfaLoginError(
  response: Response,
  fallback: string,
): Promise<AdminMfaLoginError> {
  const body = await response.json().catch(() => null);
  return new AdminMfaLoginError(
    body?.message || fallback,
    response.status,
    body?.code,
    body?.attemptsLeft,
    body?.retryAfter,
  );
}

export async function sendAdminMfaEmailCode(
  challengeToken: string,
): Promise<APIAdminMfaEmailResend> {
  const formData = new FormData();
  formData.append("challengeToken", challengeToken);

  const response = await adminFetch(`/api/admin/auth/mfa/send-email`, {
    method: "POST",
    body: formData,
  });
  if (!response.ok) {
    throw await buildMfaLoginError(response, "Impossible d'envoyer le code par e-mail.");
  }
  return response.json();
}

export async function verifyAdminMfa(payload: AdminMfaVerifyPayload): Promise<void> {
  const formData = new FormData();
  formData.append("challengeToken", payload.challengeToken);
  formData.append("method", payload.method);
  formData.append("code", payload.code);

  const response = await adminFetch(`/api/admin/auth/mfa/verify`, {
    method: "POST",
    body: formData,
  });
  if (!response.ok) {
    throw await buildMfaLoginError(response, "Code invalide ou expiré.");
  }
}

export async function fetchAdminPasskeyLoginOptions(
  challengeToken: string
): Promise<APIAdminPasskeyRequestOptions> {
  const fd = new FormData();
  fd.append("challengeToken", challengeToken);

  const response = await instructorFetch(`/api/instructor/auth/mfa/passkey/options`, { method: "POST", body: fd });
  if (!response.ok) throw await buildMfaLoginError(response, "Impossible de démarrer la vérification par clé d'accès.");

  const body = await response.json();
  return (body.publicKey ?? body) as APIAdminPasskeyRequestOptions;
}