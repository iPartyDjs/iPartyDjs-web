// src/core/stores/auth.store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthTokenPayload, RoleName } from "@ipartydjs/shared";

interface AuthState {
    user: AuthTokenPayload | null;
    token: string | null;
    isAuthenticated: boolean;
    setAuth: (token: string, user: AuthTokenPayload) => void;
    logout: () => void;
    hasRole: (role: RoleName) => boolean;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: false,

            setAuth: (token, user) => {
                localStorage.setItem("auth_token", token);
                set({ token, user, isAuthenticated: true });
            },

            logout: () => {
                localStorage.removeItem("auth_token");
                set({ token: null, user: null, isAuthenticated: false });
            },

            hasRole: (role) => get().user?.rol === role,
        }),
        { name: "auth-storage" },
    ),
);
