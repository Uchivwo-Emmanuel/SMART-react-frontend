// src/context/AuthProvider.tsx
import { type ReactNode, useEffect, useState } from "react";
import type { UserDto, LoginRequest } from "../api/types";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { AuthCtx } from "./AuthContext.tsx";
import { meApi } from "../api/user.ts";
import { authApi } from "../api/auth.ts";
import { getCsrfToken } from "../api/csrf.ts";

/* ----------  TYPES  ---------- */
interface Auth {
  user: UserDto | null;
  email: string | null;
  loading: boolean;
  login: (body: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
}

/* ----------  PROVIDER COMPONENT  ---------- */
export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const nav = useNavigate();
  const [user, setUser] = useState<UserDto | null>(null);
  const [loading, setLoading] = useState(true);

  const probe = async () => {
    try {
      const me = await meApi.me();
      console.log("✅ Me:", me);
      setUser(me);
    } catch (err) {
      console.error("❌ Me failed:", err);
      setUser(null);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // 1. Always initialize CSRF token FIRST
        await getCsrfToken(); // Sets XSRF-TOKEN cookie
      } catch (e) {
        console.warn("CSRF init failed – some actions may be blocked");
      }

      // 2. THEN check if user is already logged in
      if (document.cookie.includes("jwt=")) {
        await probe();
      }

      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (body: LoginRequest) => {
    await authApi.login(body);

    // 🔁 Critical: Get a NEW CSRF token after login
    await getCsrfToken(); // This syncs the XSRF-TOKEN cookie with the new session

    await probe();
    toast.success("Welcome back!");
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
    nav("/login");
  };

  const value: Auth = {
    user,
    email: user?.email ?? null,
    loading,
    login,
    logout,
  };

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
};
