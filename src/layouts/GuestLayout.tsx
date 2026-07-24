import { Outlet } from "react-router-dom";
import Navbar from "@/shared/Navbar/Navbar";
import Footer from "@/shared/Footer/Footer";

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
