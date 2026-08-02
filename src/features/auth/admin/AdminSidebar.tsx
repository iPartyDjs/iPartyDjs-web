import { NavLink, useNavigate } from "react-router-dom";
import { setAdminAuthenticated } from "@/features/auth/admin/RequireAdminAuth";
import "./AdminSidebar.css";
import type { JSX } from "react";

/* ------------------------------------------------------------------ */
/*  Icons (stroke-based, no external deps)                            */
/* ------------------------------------------------------------------ */
const Icon = {
  users: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  camera: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  ),
  calendar: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  ),
  events: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M12 2 2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  ),
  star: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  ),
  file: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
    </svg>
  ),
  reports: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M3 3v18h18" />
      <path d="M18 17V9M13 17V5M8 17v-3" />
    </svg>
  ),
  logout: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5M21 12H9" />
    </svg>
  ),
};

interface AdminNavLinkProps {
  to: string;
  end?: boolean;
  icon: JSX.Element;
  label: string;
}

function AdminNavItem({ to, end, icon, label }: AdminNavLinkProps) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        isActive ? "ipdj-nav-item active" : "ipdj-nav-item"
      }
    >
      <span className="ipdj-nav-label-wrap">
        <span className="ipdj-nav-icon">{icon}</span>
        {label}
      </span>
    </NavLink>
  );
}

interface AdminSidebarProps {
  adminName?: string;
  adminInitials?: string;
}

export default function AdminSidebar({
  adminName = "Arturo Ramírez",
  adminInitials = "AR",
}: AdminSidebarProps) {
  const navigate = useNavigate();

  function handleLogout() {
    setAdminAuthenticated(false);
    navigate("/admin");
  }

  return (
    <aside className="ipdj-sidebar">
      <div className="ipdj-brand">
        <span className="ipdj-logo">
          iParty<span className="ipdj-logo-accent">DJs</span>
        </span>
      </div>
      <nav className="ipdj-nav-section">
        <div className="ipdj-nav-label">Administración</div>
        <AdminNavItem
          to="/dashboard/admin"
          end
          icon={Icon.users}
          label="Usuarios"
        />
        <AdminNavItem
          to="/dashboard/admin/fotografias"
          icon={Icon.camera}
          label="Fotografías"
        />
        <AdminNavItem
          to="/dashboard/admin/citas"
          icon={Icon.calendar}
          label="Citas"
        />
        <AdminNavItem
          to="/dashboard/admin/eventos"
          icon={Icon.events}
          label="Eventos"
        />
        <AdminNavItem
          to="/dashboard/admin/resenas"
          icon={Icon.star}
          label="Reseñas"
        />
        <AdminNavItem
          to="/dashboard/admin/solicitudes"
          icon={Icon.file}
          label="Solicitudes"
        />
        <AdminNavItem
          to="/dashboard/admin/reportes"
          icon={Icon.reports}
          label="Reportes"
        />
      </nav>
      <nav className="ipdj-nav-section">
        <div className="ipdj-nav-label">Sistema</div>
        <button type="button" className="ipdj-nav-item" onClick={handleLogout}>
          <span className="ipdj-nav-label-wrap">
            <span className="ipdj-nav-icon">{Icon.logout}</span>
            Salir
          </span>
        </button>
      </nav>
      <div className="ipdj-sidebar-footer">
        <div className="ipdj-avatar-sm">{adminInitials}</div>
        <div>
          <div className="ipdj-sf-name">{adminName}</div>
          <div className="ipdj-sf-role">Superadmin</div>
        </div>
      </div>
    </aside>
  );
}
