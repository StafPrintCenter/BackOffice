import { useEffect, useState, useCallback } from "react";
import {
  loginAdmin,
  fetchAdminMe,
  logoutAdmin,
  verifyAdminInvite,
  acceptAdminInvite,
  forgotAdminPassword,
  resetAdminPassword,
  AdminAuthApiError,
  sendAdminMfaEmailCode,
  verifyAdminMfa,
} from "@/stores/useAuthStore";
import { isAdminMfaChallenge } from "@/data/auth";
import type {
  AdminInviteVerifyResponse,
  AdminMfaVerifyPayload,
  APIAdminMfaChallenge,
  APIAdminMfaEmailResend,
} from "@/data/auth";

export interface AuthUser {
  id: string;
  // first_name: string;
  // last_name: string;
  firstName: string;
  lastName: string;
  name: string;
  fullname: string;
  email: string;
  photo: string | null;
  bio: string | null;
  email_verified_at: string | null;
  level: string;
  invited_by: string | null;
  invited_at: string | null;
  accepted_at: string | null;
  is_active: boolean;
  blocked_at: string | null;
  blocked_reason: string | null;
  created_at: string;
  updated_at: string;
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function stringValue(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function nullableString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function booleanValue(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function toAdminAuthUser(rawAdmin: unknown): AuthUser {
  const response = asRecord(rawAdmin);
  const admin = asRecord(response.data ?? response.admin ?? response);
  const firstName = stringValue(admin.firstName ?? admin.first_name);
  const lastName = stringValue(admin.lastName ?? admin.last_name);
  const fullName =
    stringValue(admin.fullname ?? admin.name) ||
    `${firstName} ${lastName}`.trim() ||
    "Administrateur";

  return {
    id: stringValue(admin.id),
    // first_name: firstName,
    // last_name: lastName,
    firstName: firstName,
    lastName: lastName,
    name: fullName,
    fullname: fullName,
    email: stringValue(admin.email),
    photo: nullableString(admin.photo),
    bio: nullableString(admin.bio),
    email_verified_at: nullableString(admin.email_verified_at),
    level: stringValue(admin.level, "admin"),
    invited_by: nullableString(admin.invitedBy ?? admin.invited_by),
    invited_at: nullableString(admin.invitedAt ?? admin.invited_at),
    accepted_at: nullableString(admin.acceptedAt ?? admin.accepted_at),
    is_active: booleanValue(admin.isActive ?? admin.is_active, true),
    blocked_at: nullableString(admin.blockedAt ?? admin.blocked_at),
    blocked_reason: nullableString(admin.blockedReason ?? admin.blocked_reason),
    created_at: stringValue(admin.createdAt ?? admin.created_at),
    updated_at: stringValue(admin.updatedAt ?? admin.updated_at),
  };
}

let sharedUser: AuthUser | null = null;
let sharedReady = false;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

async function bootstrap() {
  try {
    const admin = await fetchAdminMe();
    sharedUser = admin ? toAdminAuthUser(admin) : null;
  } catch {
    sharedUser = null;
  } finally {
    sharedReady = true;
    notify();
  }
}

let bootstrapped = false;

export type AdminLoginOutcome =
  { status: "authenticated" } | { status: "mfa"; challenge: APIAdminMfaChallenge };

async function completeSession() {
  const admin = await fetchAdminMe();
  if (!admin) {
    throw new AdminAuthApiError("La session n'a pas pu être établie.");
  }
  sharedUser = toAdminAuthUser(admin);
  sharedReady = true;
  notify();
}

export function useAdminAuth() {
  const [, forceRender] = useState(0);

  useEffect(() => {
    const listener = () => forceRender((n) => n + 1);
    listeners.add(listener);

    if (!bootstrapped) {
      bootstrapped = true;
      bootstrap();
    }

    return () => {
      listeners.delete(listener);
    };
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<AdminLoginOutcome> => {
    const result = await loginAdmin(email, password);
    if (isAdminMfaChallenge(result)) {
      return { status: "mfa", challenge: result };
    }
    await completeSession();
    return { status: "authenticated" };
  }, []);

  const verifyMfa = useCallback(async (payload: AdminMfaVerifyPayload): Promise<void> => {
    await verifyAdminMfa(payload);
    await completeSession();
  }, []);

  const sendMfaEmailCode = useCallback(
    (challengeToken: string): Promise<APIAdminMfaEmailResend> =>
      sendAdminMfaEmailCode(challengeToken),
    [],
  );

  const refresh = useCallback(async () => {
    await bootstrap();
  }, []);

  const logout = useCallback(async () => {
    await logoutAdmin();
    sharedUser = null;
    notify();
  }, []);

  const verifyInvite = useCallback(
    async (params: {
      admin: string;
      expires: string;
      signature: string;
    }): Promise<AdminInviteVerifyResponse> => {
      return verifyAdminInvite(params);
    },
    [],
  );

  const acceptInvite = useCallback(
    async (params: {
      admin: string;
      expires: string;
      signature: string;
      password: string;
    }): Promise<{ message: string }> => {
      return acceptAdminInvite(params);
    },
    [],
  );

  const forgotPassword = useCallback(
    async (email: string): Promise<{ message: string }> => forgotAdminPassword(email),
    [],
  );

  const resetPassword = useCallback(
    async (params: {
      email: string;
      token: string;
      password: string;
      passwordConfirmation: string;
    }): Promise<{ message: string }> => resetAdminPassword(params),
    [],
  );

  const setUser = useCallback((rawAdmin: unknown) => {
    sharedUser = toAdminAuthUser(rawAdmin);
    sharedReady = true;
    notify();
  }, []);

  return {
    user: sharedUser,
    isAuthenticated: !!sharedUser,
    ready: sharedReady,
    login,
    logout,
    verifyInvite,
    acceptInvite,
    forgotPassword,
    resetPassword,
    setUser,
    verifyMfa,
    sendMfaEmailCode,
    refresh,
  };
}
