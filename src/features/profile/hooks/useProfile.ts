import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { UsuarioDTO } from "@ipartydjs/shared";
import { profileService } from "@/features/profile/services/profile.service";
import { useAuthStore } from "@/core/stores/auth.store";

export function useProfile() {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    return useQuery({
        queryKey: ["profile"],
        queryFn: profileService.getProfile,
        enabled: isAuthenticated,
    });
}

export function useUpdateProfile() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: profileService.updateProfile,
        onSuccess: (data: UsuarioDTO) => {
            queryClient.setQueryData(["profile"], data);
        },
    });
}

export function useChangePassword() {
    return useMutation({
        mutationFn: profileService.changePassword,
    });
}
