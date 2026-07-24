import { useState, useEffect } from "react";
import "@/styles/legacy/Navbar.css";

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 60);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const navLinks = [
        { label: "Inicio", sub: "Empieza aquí", href: "#inicio" },
        { label: "Servicios", sub: "Lo que hacemos", href: "#servicios" },
        { label: "Proceso", sub: "Cómo trabajamos", href: "#proceso" },
        { label: "Galería", sub: "Nuestros eventos", href: "#galeria" },
        { label: "Contacto", sub: "Hablemos", href: "#contacto" },
    ];

    return (
        <>
            <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
                <a href="#inicio" className="navbar-logo">
                    <span className="logo-text">iParty</span>
                    <span className="logo-accent">DJs</span>
                </a>

                <div className={`navbar-links ${menuOpen ? "open" : ""}`}>
                    {navLinks.map((link) => (
                        <a
                            key={link.label}
                            href={link.href}
                            className="nav-link"
                            onClick={() => setMenuOpen(false)}
                        >
                            <span className="nav-label">{link.label}</span>
                            <span className="nav-sub">{link.sub}</span>
                        </a>
                    ))}
                </div>

                <div className="navbar-right">
                    <a href="#contacto" className="btn-gold">
                        Cotizar Evento
                    </a>
                    <button
                        className={`hamburger ${menuOpen ? "open" : ""}`}
                        onClick={() => setMenuOpen(!menuOpen)}
                    >
                        <span />
                        <span />
                        <span />
                    </button>
                </div>
            </nav>

            {menuOpen && (
                <div
                    className="nav-overlay"
                    onClick={() => setMenuOpen(false)}
                />
            )}
        </>
    );
};

export default Navbar;
