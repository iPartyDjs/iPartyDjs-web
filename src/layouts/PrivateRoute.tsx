import { useAuthStore } from "@/core/stores/auth.store";
import type { RoleName } from "@ipartydjs/shared";
import { Navigate } from "react-router-dom";

interface Props {
    children: React.ReactNode;
    requiredRole?: RoleName;
}

export default function PrivateRoute({ children, requiredRole }: Props) {
    const user = useAuthStore((state) => state.user);

    if (!user) return <Navigate to="/login" replace />;
    if (requiredRole && user.rol !== requiredRole)
        return <Navigate to="/" replace />;

    return <>{children}</>;
}
