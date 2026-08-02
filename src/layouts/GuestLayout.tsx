import { Outlet } from "react-router-dom";
import Navbar from "@/shared/Navbar";
import Footer from "@/shared/Footer";
import { useCursor } from "@/core/hooks/useCursor";

export default function GuestLayout() {
    useCursor();

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
