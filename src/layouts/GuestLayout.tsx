import { Outlet } from "react-router-dom";
import Navbar from "@/shared/Navbar";
import Footer from "@/shared/Footer";

export default function GuestLayout() {
    return (
        <div className="guest-layout">
            <Navbar />
            <main className="guest-layout__content">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}
