import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/core/stores/auth.store";

/**
 * Envuelve cualquier ruta del panel admin. Si no hay token, o el rol del usuario
 * no pertenece a la administración, redirige al login.
 */
export default function RequireAdminAuth({
    children,
    allowedRoles,
}: {
    children: React.ReactElement;
    /** Lista de roles permitidos para acceder a la ruta. Por defecto son los admins. */
    allowedRoles?: string[];
}) {
    const token = useAuthStore((state) => state.token);
    const user = useAuthStore((state) => state.user) as {
        rol?: string;
        rol_nombre?: string;
    } | null;

    const userRole = user?.rol_nombre || user?.rol || "";

    const allowed = allowedRoles ?? ["administrador", "superadministrador"];

    const allowedMatch = allowed.includes(userRole);

    if (!token || !allowedMatch) {
        return <Navigate to="/admin/login" replace />;
    }

    return children;
}
