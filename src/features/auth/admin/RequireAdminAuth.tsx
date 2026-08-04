import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/core/stores/auth.store";

/**
 * Envuelve cualquier ruta del panel admin. Si no hay token, o el rol del usuario
 * no pertenece a la administración, redirige al login.
 */
export default function RequireAdminAuth({
  children,
}: {
  children: React.ReactElement;
}) {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user) as {
    rol?: string;
    rol_nombre?: string;
  } | null;

  // Verificamos tanto 'rol_nombre' como 'rol' para evitar conflictos con la base de datos
  const userRole = user?.rol_nombre || user?.rol || "";
  const isStaff =
    userRole === "administrador" || userRole === "superadministrador";

  if (!token || !isStaff) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
