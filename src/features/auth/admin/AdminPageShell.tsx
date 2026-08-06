import type { ReactNode } from "react";
import AdminSidebar, { type AdminNavKey } from "./AdminSidebar";
import "./AdminPageShell.css";

interface AdminPageShellProps {
  /** Título mostrado en la barra superior gris. */
  topbarTitle: string;

  /**
   * Identifica qué ítem del sidebar debe marcarse como activo.
   * IMPORTANTE: se llama `navKey` (no `key`) a propósito. `key` es una
   * prop reservada por React para reconciliar listas: si un componente
   * declara una prop propia llamada `key`, React la intercepta antes de
   * que llegue al componente y siempre resulta en `undefined` dentro de
   * él, además de emitir el warning "`key` is not a prop". Por eso NUNCA
   * se debe nombrar así una prop propia.
   */
  navKey: AdminNavKey;
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
  navKey,
  children,
  sidePanel,
}: AdminPageShellProps) {
  return (
    <div className="ipdj-app">
      <div className="ipdj-topbar">
        <h1>{topbarTitle}</h1>
      </div>

      <div className={sidePanel ? "ipdj-layout with-panel" : "ipdj-layout"}>
        <AdminSidebar active={navKey} />
        <main className="main-content">{children}</main>
        {sidePanel && <aside className="ipdj-edit-panel">{sidePanel}</aside>}
      </div>
    </div>
  );
}
