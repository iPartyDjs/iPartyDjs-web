import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthTokenPayload, RoleName } from "@ipartydjs/shared";

interface AuthStore {
    user: AuthTokenPayload | null;
    token: string | null;

    setAuth: (token: string, user: AuthTokenPayload) => void;
    logout: () => void;

    isAuthenticated: boolean;
    hasRole: (role: RoleName) => boolean;
}

export const useAuthStore = create<AuthStore>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,

            setAuth: (token: string, user: AuthTokenPayload) => {
                // Also store token separately in localStorage for Axios interceptor
                localStorage.setItem("auth_token", token);
                set({ token, user });
            },

            logout: () => {
                localStorage.removeItem("auth_token");
                set({ token: null, user: null });
            },

            get isAuthenticated() {
                return !!get().user;
            },

            hasRole: (role: RoleName) => {
                const { user } = get();
                if (!user) return false;
                return user.rol?.includes(role) ?? false;
            },
        }),
        {
            name: "auth-storage",
            partialize: (state) => ({
                user: state.user,
                token: state.token,
            }),
        },
    ),
);
