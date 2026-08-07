import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useCursor } from "@/core/hooks/useCursor";
import "../styles/layouts.css";
import { useAuthStore } from "@/core/stores/auth.store";
import { useLogout } from "@/features/auth/hooks/useAuth";

export default function DashboardLayout() {
    const user = useAuthStore((state) => state.user);
    const logout = useLogout();

    useCursor();

    const navigate = useNavigate();

    return (
        <div className="dashboard-layout">
            <aside className="dashboard-layout__sidebar sidebar">
                <nav className="dashboard-layout__nav">
                    <div className="sidebar-logo">
                        <span className="logo-text">iPartyDjs</span>
                    </div>
                    <NavLink
                        to="/dashboard"
                        className={({ isActive }) =>
                            isActive
                                ? "dashboard-layout__link nav-item is-active"
                                : "dashboard-layout__link nav-item"
                        }
                        end
                    >
                        Dashboard
                    </NavLink>
                    <NavLink
                        to="/dashboard/solicitudes/nueva"
                        className={({ isActive }) =>
                            isActive
                                ? "dashboard-layout__link nav-item is-active"
                                : "dashboard-layout__link nav-item"
                        }
                        end
                    >
                        Nueva solicitud
                    </NavLink>
                    <NavLink
                        to="/dashboard/solicitudes"
                        className={({ isActive }) =>
                            isActive
                                ? "dashboard-layout__link nav-item is-active"
                                : "dashboard-layout__link nav-item"
                        }
                        end
                    >
                        Mis Solicitudes
                    </NavLink>
                    <NavLink
                        to="/dashboard/citas"
                        className={({ isActive }) =>
                            isActive
                                ? "dashboard-layout__link nav-item is-active"
                                : "dashboard-layout__link nav-item"
                        }
                        end
                    >
                        Mis Citas
                    </NavLink>
                    <NavLink
                        to="/dashboard/eventos"
                        className={({ isActive }) =>
                            isActive
                                ? "dashboard-layout__link nav-item is-active"
                                : "dashboard-layout__link nav-item"
                        }
                        end
                    >
                        Mis eventos
                    </NavLink>
                    <NavLink
                        to="/dashboard/resenias"
                        className={({ isActive }) =>
                            isActive
                                ? "dashboard-layout__link nav-item is-active"
                                : "dashboard-layout__link nav-item"
                        }
                        end
                    >
                        Mis reseñas
                    </NavLink>

                    <p className="er-eyebrow">CUENTA</p>

                    <button
                        type="button"
                        className="btn-outline"
                        onClick={() => navigate("/dashboard/profile")}
                    >
                        Mi perfil
                    </button>
                    <button
                        type="button"
                        className="btn-outline"
                        onClick={logout}
                    >
                        Cerrar Sesión
                    </button>
                </nav>
                <div className="sidebar-footer">
                    <div className="user-avatar">MG</div>
                    <div className="user-info">
                        <span className="user-name">
                            {user ? user.email : "cargando..."}
                        </span>
                        <span className="user-role">Cliente</span>
                    </div>
                </div>
            </aside>

            <div className="dashboard-layout__main">
                <main className="dashboard-layout__content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
