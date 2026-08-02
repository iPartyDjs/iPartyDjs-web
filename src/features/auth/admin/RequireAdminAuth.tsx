import React from "react";
import { Navigate } from "react-router-dom";

/**
 * RequireAdminAuth
 * Envuelve cualquier ruta del panel admin. Si no hay sesión activa,
 * redirige a /admin/login conservando la ruta a la que intentaba entrar.
 *
 * NOTA: sessionStorage es un mock simple para desarrollo. En producción
 * reemplaza isAdminAuthenticated() por la verificación real de tu backend
 * (token JWT, cookie httpOnly, etc.).
 */
// eslint-disable-next-line react-refresh/only-export-components
export function isAdminAuthenticated(): boolean {
  return sessionStorage.getItem("ipartydjs_admin_auth") === "true";
}

// eslint-disable-next-line react-refresh/only-export-components
export function setAdminAuthenticated(value: boolean) {
  if (value) {
    sessionStorage.setItem("ipartydjs_admin_auth", "true");
  } else {
    sessionStorage.removeItem("ipartydjs_admin_auth");
  }
}

export default function RequireAdminAuth({ children }: { children: React.ReactElement }) {
  if (!isAdminAuthenticated()) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
}
