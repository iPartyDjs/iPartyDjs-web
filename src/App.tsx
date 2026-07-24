import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import "./App.css";
import { ClientDashboard } from "./pages/Dashboard_Cliente/ClientDashboard";
import EventRequest from "./pages/EventRequest/EventRequest";
import MySolicitudes from "./pages/MySolicitudes/MySolicitudes";
import MisCitas from "./pages/MisCitas/MisCitas";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/registro" element={<Register />} />
                <Route path="/dashboard" element={<ClientDashboard />} />
                <Route path="/EventRequest" element={<EventRequest />} />
                <Route path="/MySolicitudes" element={<MySolicitudes />} />
                <Route path="/Mis-Citas" element={<MisCitas />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
