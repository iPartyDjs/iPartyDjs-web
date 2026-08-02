import type { ReactNode } from "react";
import AdminSidebar from "./AdminSidebar";
import "./AdminPageShell.css";

interface AdminPageShellProps {
  /** Título mostrado en la barra superior gris. */
  topbarTitle: string;
  /** Contenido central (stats, filtros, tabla/grid, paginación). */
  children: ReactNode;
  /** Panel derecho opcional (detalle/edición). Si se omite, el main ocupa el espacio restante. */
  sidePanel?: ReactNode;
}

/**
 * Shell compartido por todas las pantallas del panel de administración
 * (Usuarios, Fotografías, Citas, Eventos, Reseñas, Solicitudes, Reportes).
 * Contiene: topbar, sidebar de navegación real (react-router) y el grid
 * de 2 o 3 columnas. Cada pantalla solo aporta su contenido central y,
 * si aplica, su panel lateral de detalle/edición.
 */
export default function AdminPageShell({
  topbarTitle,
  children,
  sidePanel,
}: AdminPageShellProps) {
  return (
    <div className="ipdj-app">
      <div className="ipdj-topbar">
        <h1>{topbarTitle}</h1>
      </div>

      <div className={sidePanel ? "ipdj-layout with-panel" : "ipdj-layout"}>
        <AdminSidebar />
        <main className="ipdj-main">{children}</main>
        {sidePanel && <aside className="ipdj-edit-panel">{sidePanel}</aside>}
      </div>
    </div>
  );
}
