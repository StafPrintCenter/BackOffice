import { useEffect, useState, useCallback } from "react";
import { loginAdmin, fetchAdminMe, logoutAdmin } from "@/stores/useAuthStore";
import type { APIAdminUser } from "@/data/admin-auth";

export interface AuthUser {
  id: string;
  first_name: string;
  last_name: string;
  name: string;
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

function toAuthUser(admin: APIAdminUser): AuthUser {
  return {
    id: admin.id,
    first_name: admin.first_name,
    last_name: admin.last_name,
    name: `${admin.first_name} ${admin.last_name}`.trim(),
    email: admin.email,
    photo: admin.photo,
    bio: admin.bio,
    email_verified_at: admin.email_verified_at,
    level: admin.level,
    invited_by: admin.invited_by,
    invited_at: admin.invited_at,
    accepted_at: admin.accepted_at,
    is_active: admin.is_active,
    blocked_at: admin.blocked_at,
    blocked_reason: admin.blocked_reason,
    created_at: admin.created_at,
    updated_at: admin.updated_at,
  };
}

// État partagé en dehors du hook pour que tous les composants qui l'utilisent
// restent synchronisés sans avoir besoin d'un vrai Context/Provider.
let sharedUser: AuthUser | null = null;
let sharedReady = false;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

async function bootstrap() {
  try {
    const admin = await fetchAdminMe();
    sharedUser = admin ? toAuthUser(admin) : null;
  } catch {
    sharedUser = null;
  } finally {
    sharedReady = true;
    notify();
  }
}

let bootstrapped = false;

export function useAuth() {
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
    const { admin } = await loginAdmin(email, password);
    sharedUser = toAuthUser(admin);
    sharedReady = true;
    notify();
  }, []);

  const logout = useCallback(async () => {
    await logoutAdmin();
    sharedUser = null;
    notify();
  }, []);

  return {
    user: sharedUser,
    isAuthenticated: !!sharedUser,
    ready: sharedReady,
    login,
    logout,
  };
}