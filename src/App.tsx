import { Routes, Route } from "react-router-dom";

import GuestLayout from "@/layouts/GuestLayout";
import DashboardLayout from "@/layouts/DashboardLayout";

import Home from "@/features/public/pages/Home";
import Login from "@/features/auth/pages/Login";
import Register from "@/features/auth/pages/Register";
import { ClientDashboard } from "@/features/cliente/pages/ClientDashboard";
import MySolicitudes from "@/features/solicitudes/pages/MySolicitudes";
import EventRequest from "@/features/solicitudes/pages/EventRequest";
import MisCitas from "@/features/citas/pages/Miscitas";

function App() {
    return (
        <Routes>
            {/* Rutas públicas */}
            <Route element={<GuestLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
            </Route>

            {/* Rutas privadas */}
            <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<ClientDashboard />} />
                <Route path="solicitudes" element={<MySolicitudes />} />
                <Route path="solicitudes/nueva" element={<EventRequest />} />
                <Route path="citas" element={<MisCitas />} />
            </Route>
        </Routes>
    );
}

export default App;
