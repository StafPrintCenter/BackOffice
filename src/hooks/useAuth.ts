import { useEffect, useState } from "react";
import { authApi } from "@/api/auth.api";
import type { User } from "@/types";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUser(authApi.current());
    setReady(true);
    const onStorage = () => setUser(authApi.current());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const login = async (email: string, password: string) => {
    const u = await authApi.login(email, password);
    setUser(u);
    return u;
  };
  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

  return { user, ready, login, logout, isAuthenticated: !!user };
}
