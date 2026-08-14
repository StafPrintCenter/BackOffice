import { useEffect, useState, useCallback } from "react";
import { loginAdmin, fetchAdminMe, logoutAdmin, verifyAdminInvite, acceptAdminInvite, AdminAuthApiError, } from "@/stores/useAuthStore";
import type { APIAdminUser, AdminInviteVerifyResponse } from "@/data/auth";

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

function toAdminAuthUser(rawAdmin: any): AuthUser {
  const admin = rawAdmin?.data ?? rawAdmin?.admin ?? rawAdmin ?? {};
  const firstName = admin.firstName ?? admin.first_name ?? "";
  const lastName = admin.lastName ?? admin.last_name ?? "";
  const fullName = (admin.fullname ?? admin.name ?? `${firstName} ${lastName}`.trim()) || "Administrateur";

  return {
    id: admin.id ?? "",
    // first_name: firstName,
    // last_name: lastName,
    firstName: firstName,
    lastName: lastName,
    name: fullName,
    fullname: fullName,
    email: admin.email ?? "",
    photo: admin.photo ?? null,
    bio: admin.bio ?? null,
    email_verified_at: admin.email_verified_at ?? null,
    level: admin.level ?? "admin",
    invited_by: admin.invitedBy ?? admin.invited_by ?? null,
    invited_at: admin.invitedAt ?? admin.invited_at ?? null,
    accepted_at: admin.acceptedAt ?? admin.accepted_at ?? null,
    is_active: admin.isActive ?? admin.is_active ?? true,
    blocked_at: admin.blockedAt ?? admin.blocked_at ?? null,
    blocked_reason: admin.blockedReason ?? admin.blocked_reason ?? null,
    created_at: admin.createdAt ?? admin.created_at ?? "",
    updated_at: admin.updatedAt ?? admin.updated_at ?? "",
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

  const login = useCallback(async (email: string, password: string) => {
    await loginAdmin(email, password);
    const admin = await fetchAdminMe();
    if (!admin) {
      throw new AdminAuthApiError(
        "La session n'a pas pu être établie."
      );
    }
    sharedUser = toAdminAuthUser(admin);
    sharedReady = true;
    notify();
  }, []);

  const logout = useCallback(async () => {
    await logoutAdmin();
    sharedUser = null;
    notify();
  }, []);

  const verifyInvite = useCallback(
    async (params: { admin: string; expires: string; signature: string }): Promise<AdminInviteVerifyResponse> => {
      return verifyAdminInvite(params);
    },
    []
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
    []
  );

  return {
    user: sharedUser,
    isAuthenticated: !!sharedUser,
    ready: sharedReady,
    login,
    logout,
    verifyInvite,
    acceptInvite,
  };
}