import React from "react";
import { useNavigate } from "react-router-dom";
import { useLogout } from "@/features/auth/hooks/useAuth";
import "./AdminSidebar.css";

export type AdminNavKey =
    | "dashboard"
    | "usuarios"
    | "fotografias"
    | "citas"
    | "eventos"
    | "solicitudes"
    | "reportes";

interface NavItem {
    key: AdminNavKey;
    label: string;
    icon: React.ReactNode;
    badge?: number;
}

interface AdminSidebarProps {
    active: AdminNavKey;
    /**
     * Opcional: si se pasa, se usa en vez de la navegación por defecto
     * (útil para tests o para interceptar la navegación). Si se omite,
     * el sidebar navega directamente con React Router usando ROUTES_BY_KEY.
     */
    onNavigate?: (key: AdminNavKey) => void;
    onLogout?: () => void;
    adminName?: string;
    adminRole?: string;
    counts?: Partial<Record<AdminNavKey, number>>;
}

/**
 * Mapeo 1:1 entre cada ítem del sidebar y su ruta real, tal como están
 * declaradas en App.tsx bajo /dashboard/admin/*. Antes el sidebar llamaba
 * a `onNavigate?.(key)`, pero AdminPageShell nunca pasaba esa prop, así
 * que ningún botón navegaba a ningún lado realmente.
 *
 * NOTA: "ajustes" no tiene ruta registrada todavía en App.tsx. Si haces
 * clic ahí y no pasa nada (o da 404), hay que agregar esa <Route> primero.
 */
const ROUTES_BY_KEY: Record<AdminNavKey, string> = {
    dashboard: "/dashboard/admin",
    usuarios: "/dashboard/admin/usuarios",
    fotografias: "/dashboard/admin/fotografias",
    citas: "/dashboard/admin/citas",
    eventos: "/dashboard/admin/eventos",
    solicitudes: "/dashboard/admin/solicitudes",
    reportes: "/dashboard/admin/reportes",
};

/* ---------------------------------------------------
   Iconos de navegación (inline SVG, trazo fino)
--------------------------------------------------- */
const icons: Record<AdminNavKey, React.ReactNode> = {
    dashboard: (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
        >
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
        </svg>
    ),
    usuarios: (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
        >
            <circle cx="9" cy="8" r="3.2" />
            <path d="M3.5 19c.6-3.4 3-5.2 5.5-5.2s4.9 1.8 5.5 5.2" />
            <path d="M16 8.4a2.8 2.8 0 1 1 0 5.6" />
            <path d="M15 13.9c2 .3 3.7 1.7 4.2 4.6" />
        </svg>
    ),
    fotografias: (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
        >
            <path d="M4 8h3.2l1.4-2h6.8l1.4 2H20a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" />
            <circle cx="12" cy="14" r="3.2" />
        </svg>
    ),
    citas: (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
        >
            <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
            <path d="M3.5 9.5h17M8 3v3.5M16 3v3.5" />
        </svg>
    ),
    eventos: (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
        >
            <path d="M12 3c2 2.2 3 4.2 3 6.2A3 3 0 0 1 9 9.2C9 7.2 10 5.2 12 3Z" />
            <path d="M6.5 21c0-4.5 2.4-7 5.5-7s5.5 2.5 5.5 7" />
        </svg>
    ),
    solicitudes: (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
        >
            <path d="M7 3.5h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-16a1 1 0 0 1 1-1Z" />
            <path d="M14 3.5v4h4M9 12.5h6M9 16h6" />
        </svg>
    ),
    reportes: (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
        >
            <path d="M4 20V10M11 20V4M18 20v-7" />
            <path d="M2.5 20.5h19" />
        </svg>
    ),
};

const LogoutIcon = () => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
    >
        <path d="M9 4H5.5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1H9" />
        <path d="M14 8l4.5 4-4.5 4M8.5 12h10" />
    </svg>
);

const NAV_MAIN: NavItem[] = [
    { key: "usuarios", label: "Usuarios", icon: icons.usuarios },
    { key: "fotografias", label: "Fotografías", icon: icons.fotografias },
    { key: "citas", label: "Citas", icon: icons.citas },
    { key: "eventos", label: "Eventos", icon: icons.eventos },
    { key: "solicitudes", label: "Solicitudes", icon: icons.solicitudes },
    { key: "reportes", label: "Reportes", icon: icons.reportes },
];

export default function AdminSidebar({
    active,
    onNavigate,
    onLogout,
    adminName = "Arturo Ramírez",
    adminRole = "Superadmin",
    counts = {},
}: AdminSidebarProps) {
    const navigate = useNavigate();
    const logoutFromHook = useLogout();

    function handleNavigate(key: AdminNavKey) {
        if (onNavigate) {
            onNavigate(key);
            return;
        }
        navigate(ROUTES_BY_KEY[key]);
    }

    // Igual que con la navegación: si no pasan onLogout explícito, se usa
    // el hook useLogout() de verdad, en vez de quedar en undefined (que era
    // por qué el botón "Salir" no hacía nada — AdminPageShell nunca pasaba
    // esta prop).
    function handleLogout() {
        if (onLogout) {
            onLogout();
            return;
        }
        logoutFromHook();
    }

    const isFotografo =
        adminRole === "colaborador_fotografico" ||
        adminRole === "Fotógrafo" ||
        adminRole === "Colaborador fotográfico";

    const initials = adminName
        .split(" ")
        .map((p) => p.charAt(0))
        .slice(0, 2)
        .join("")
        .toUpperCase();

    return (
        <aside className="admin-sidebar">
            <div className="admin-sidebar-logo">
                <span className="admin-sidebar-logo-mark">iP</span>
                <span className="admin-sidebar-logo-text">iPartyDJs</span>
            </div>

            <nav className="admin-sidebar-nav">
                <p className="admin-sidebar-group-label">Administración</p>
                <ul>
                    {(isFotografo
                        ? NAV_MAIN.filter((i) => i.key === "fotografias")
                        : NAV_MAIN
                    ).map((item) => (
                        <li key={item.key}>
                            <button
                                type="button"
                                className={`admin-nav-item ${active === item.key ? "is-active" : ""}`}
                                onClick={() => handleNavigate(item.key)}
                            >
                                <span className="admin-nav-icon">
                                    {item.icon}
                                </span>
                                <span className="admin-nav-label">
                                    {item.label}
                                </span>
                                {typeof counts[item.key] === "number" && (
                                    <span className="admin-nav-badge">
                                        {counts[item.key]}
                                    </span>
                                )}
                            </button>
                        </li>
                    ))}
                </ul>

                <p className="admin-sidebar-group-label">Sistema</p>
                <ul>
                    <li>
                        <button
                            type="button"
                            className="admin-nav-item admin-nav-item--logout"
                            onClick={handleLogout}
                        >
                            <span className="admin-nav-icon">
                                <LogoutIcon />
                            </span>
                            <span className="admin-nav-label">Salir</span>
                        </button>
                    </li>
                </ul>
            </nav>

            <div className="admin-sidebar-profile">
                <span className="admin-sidebar-avatar">{initials}</span>
                <div>
                    <p className="admin-sidebar-profile-name">{adminName}</p>
                    <p className="admin-sidebar-profile-role">{adminRole}</p>
                </div>
            </div>
        </aside>
    );
}
