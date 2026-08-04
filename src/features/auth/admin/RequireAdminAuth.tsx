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
  const user = useAuthStore((state) => state.user);

  // Verificamos si existe un usuario y su rol es de administración
  // Nota: Ajusta los nombres de los roles ("ADMIN", "administrador", etc.) según tu base de datos / constants.
  const isStaff =
    user?.rol === "administrador" || user?.rol === "superadministrador";
  if (!token || !isStaff) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
