import { NavLink, Outlet, useNavigate } from "react-router-dom";

// TODO: reemplazar por tu fuente real de datos de sesión (context/store)
// cuando exista. Placeholder deliberado, no funcional.
const CURRENT_USER_NAME = "Maria G";

function handleLogout(navigate: ReturnType<typeof useNavigate>) {
    // TODO: limpiar token/sesión real aquí antes de redirigir
    navigate("/login");
}

export default function DashboardLayout() {
    const navigate = useNavigate();

    return (
        <div className="dashboard-layout">
            <aside className="dashboard-layout__sidebar sidebar">
                <nav className="dashboard-layout__nav">
                    <div className="sidebar-logo">
                        <img
                            src="/logo-ipartydjs.png"
                            alt="iPartyDjs"
                            className="logo-img"
                        />
                        <span className="logo-text">iPartyDjs</span>
                    </div>
                    <p className="er-eyebrow">PANEL CLIENTE</p>
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
                        to="/dashboard/"
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
                        onClick={() => {}}
                    >
                        Mi perfil
                    </button>
                    <button
                        type="button"
                        className="btn-outline"
                        onClick={() => handleLogout(navigate)}
                    >
                        Cerrar Sesión
                    </button>
                </nav>
                <div className="sidebar-footer">
                    <div className="user-avatar">MG</div>
                    <div className="user-info">
                        <span className="user-name">{CURRENT_USER_NAME}</span>
                        <span className="user-role">cliente</span>
                    </div>
                </div>
            </aside>

            <div className="dashboard-layout__main">
                <main className="flex flex-col flex-1 p-10">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
