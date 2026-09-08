import { Routes, Route } from "react-router-dom";

import GuestLayout from "@/layouts/GuestLayout";
import DashboardLayout from "@/layouts/DashboardLayout";

import Home from "@/features/public/pages/Home";
import HomeV2 from "@/features/public/pages/HomeV2";
import Login from "@/features/auth/pages/Login";
import Register from "@/features/auth/pages/Register";
import { ClientDashboard } from "@/features/cliente/pages/ClientDashboard";
import ReviewForm from "./features/resenias/Reviewform";
import Profile from "./features/profile/pages/profile";
import AdminLogin from "./features/auth/admin/Adminlogin";
import AdminUsersDashboard from "./features/auth/admin/Adminuserdashboard";
import AdminPhotosGallery from "./features/auth/admin/AdminPhotosGallery";
import RequireAdminAuth from "./features/auth/admin/RequireAdminAuth";
//import Admincitas from "./features/auth/admin/Admincitas";
import Admineventos from "./features/auth/admin/Admineventos";
//import Adminresenas from "./features/auth/admin/Adminresenas";
import Adminsolicitudes from "./features/auth/admin/Adminsolicitudes";
import Adminreportes from "./features/auth/admin/Adminreportes";

// Importas tu hook del cursor
import { useCursor } from "./core/hooks/useCursor"; // Ajusta la ruta exacta de donde tengas este hook
import PrivateRoute from "./layouts/PrivateRoute";
import MisSolicitudes from "./features/solicitudes/pages/MisSolicitudes";
import CrearSolicitud from "./features/solicitudes/pages/CrearSolicitud";
import EventRequest from "./features/solicitudes/pages/EventRequest";
import MisCitas from "./features/citas/pages/MisCitas";
import MisResenias from "./features/resenias/pages/MisResenias";
import MisEventos from "./features/eventos/pages/MisEventos";
import ListaCitasAdmin from "./features/citas/pages/ListaCitasAdmin";
import ListaReseniasAdmin from "./features/resenias/pages/ListaReseniasAdmin";

// Componente Wrapper para activar el cursor en TODA la app
const GlobalCursor = () => {
    useCursor(true);
    return null;
};

function App() {
    return (
        <>
            <GlobalCursor />
            <Routes>
                {/* Rutas públicas */}
                <Route element={<GuestLayout />}>
                    <Route path="/" element={<HomeV2 />} />
                    <Route path="/legacy" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/registro" element={<Register />} />
                    <Route path="/admin" element={<AdminLogin />} />
                    <Route path="/admin/login" element={<AdminLogin />} />
                </Route>

                {/* Rutas privadas — panel CLIENTE */}
                <Route
                    path="/dashboard"
                    element={
                        <PrivateRoute>
                            <DashboardLayout />
                        </PrivateRoute>
                    }
                >
                    <Route index element={<ClientDashboard />} />
                    <Route path="solicitudes" element={<MisSolicitudes />} />
                    <Route
                        path="solicitudes/nueva"
                        element={<CrearSolicitud />}
                    />
                    <Route path="old/n" element={<EventRequest />} />
                    <Route path="citas" element={<MisCitas />} />
                    <Route path="eventos" element={<MisEventos />} />
                    <Route path="resenias" element={<MisResenias />} />
                    <Route path="Reviewform" element={<ReviewForm />} />
                    <Route path="profile" element={<Profile />} />
                </Route>

                {/* Rutas privadas — panel ADMIN */}
                <Route
                    path="/dashboard/admin"
                    element={
                        <RequireAdminAuth>
                            <AdminUsersDashboard />
                        </RequireAdminAuth>
                    }
                />

                <Route
                    path="/dashboard/admin/usuarios"
                    element={
                        <RequireAdminAuth>
                            <AdminUsersDashboard />
                        </RequireAdminAuth>
                    }
                />
                <Route
                    path="/dashboard/admin/fotografias"
                    element={
                        <RequireAdminAuth
                            allowedRoles={[
                                "administrador",
                                "superadministrador",
                                "colaborador_fotografico",
                            ]}
                        >
                            <AdminPhotosGallery />
                        </RequireAdminAuth>
                    }
                />
                <Route
                    path="/dashboard/admin/citas"
                    element={
                        <RequireAdminAuth>
                            <ListaCitasAdmin />
                        </RequireAdminAuth>
                    }
                />

                <Route
                    path="/dashboard/admin/eventos"
                    element={
                        <RequireAdminAuth>
                            <Admineventos />
                        </RequireAdminAuth>
                    }
                />

                <Route
                    path="/dashboard/admin/resenas"
                    element={
                        <RequireAdminAuth>
                            <ListaReseniasAdmin />
                        </RequireAdminAuth>
                    }
                />

                <Route
                    path="/dashboard/admin/solicitudes"
                    element={
                        <RequireAdminAuth>
                            <Adminsolicitudes />
                        </RequireAdminAuth>
                    }
                />

                <Route
                    path="/dashboard/admin/reportes"
                    element={
                        <RequireAdminAuth>
                            <Adminreportes />
                        </RequireAdminAuth>
                    }
                />
            </Routes>
        </>
    );
}

export default App;
