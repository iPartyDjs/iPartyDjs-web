import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/auth.service";
import { useAuthStore } from "@/core/stores/auth.store";
import type { LoginInput, RegisterClientInput } from "@ipartydjs/shared";

export const useLogin = () => {
    const setAuth = useAuthStore((state) => state.setAuth);

    return useMutation({
        mutationFn: (data: LoginInput) => authService.login(data),
        onSuccess: (data) => {
            const { token, user } = data;
            setAuth(token, user);
        },
    });
};

export const useRegister = () => {
    const navigate = useNavigate();

    return useMutation({
        mutationFn: (data: RegisterClientInput) => authService.register(data),
        onSuccess: () => {
            navigate("/login");
        },
    });
};

export const useLogout = () => {
    const queryClient = useQueryClient();
    const logout = useAuthStore((state) => state.logout);
    const navigate = useNavigate();

    return () => {
        logout();
        queryClient.clear();
        navigate("/");
    };
};
