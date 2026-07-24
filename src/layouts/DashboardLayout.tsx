import { NavLink, Outlet, useNavigate } from "react-router-dom";

// TODO: reemplazar por tu fuente real de datos de sesión (context/store)
// cuando exista. Placeholder deliberado, no funcional.
const CURRENT_USER_NAME = "Usuario";

function handleLogout(navigate: ReturnType<typeof useNavigate>) {
    // TODO: limpiar token/sesión real aquí antes de redirigir
    navigate("/login");
}

export default function DashboardLayout() {
    const navigate = useNavigate();

    return (
        <div className="dashboard-layout">
            <aside className="dashboard-layout__sidebar">
                <nav className="dashboard-layout__nav">
                    <NavLink
                        to="/dashboard"
                        className={({ isActive }) =>
                            isActive
                                ? "dashboard-layout__link is-active"
                                : "dashboard-layout__link"
                        }
                        end
                    >
                        Dashboard
                    </NavLink>
                    <NavLink
                        to="/dashboard/solicitudes"
                        className={({ isActive }) =>
                            isActive
                                ? "dashboard-layout__link is-active"
                                : "dashboard-layout__link"
                        }
                    >
                        Mis Solicitudes
                    </NavLink>
                    <NavLink
                        to="/dashboard/citas"
                        className={({ isActive }) =>
                            isActive
                                ? "dashboard-layout__link is-active"
                                : "dashboard-layout__link"
                        }
                    >
                        Mis Citas
                    </NavLink>
                    <button
                        type="button"
                        className="dashboard-layout__link dashboard-layout__logout"
                        onClick={() => handleLogout(navigate)}
                    >
                        Cerrar Sesión
                    </button>
                </nav>
            </aside>

            <div className="dashboard-layout__main">
                <header className="dashboard-layout__header">
                    <span className="dashboard-layout__username">
                        {CURRENT_USER_NAME}
                    </span>
                </header>

                <main className="dashboard-layout__content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
