// src/features/auth/hooks/useAuth.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { AuthTokenPayloadSchema } from "@ipartydjs/shared";
import { authService } from "@/features/auth/services/auth.service";
import { useAuthStore } from "@/core/stores/auth.store";

export function useLogin() {
    const setAuth = useAuthStore((state) => state.setAuth);
    const logout = useAuthStore((state) => state.logout);

    return useMutation({
        mutationFn: authService.login,
        onSuccess: ({ token }) => {
            const decoded: unknown = jwtDecode(token);
            const result = AuthTokenPayloadSchema.safeParse(decoded);

            if (!result.success) {
                logout();
                throw new Error("Token recibido con formato inesperado");
            }

            setAuth(token, result.data);
        },
    });
}

export function useRegister() {
    const navigate = useNavigate();

    return useMutation({
        mutationFn: authService.register,
        onSuccess: () => {
            navigate("/login");
        },
    });
}

export function useLogout() {
    const logout = useAuthStore((state) => state.logout);
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    return () => {
        logout();
        queryClient.clear();
        navigate("/");
    };
}
