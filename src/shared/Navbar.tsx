import { useState, useEffect } from "react";

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => {
            setScrolled(document.body.scrollTop > 60);
        };
        document.body.addEventListener("scroll", onScroll);
        return () => document.body.removeEventListener("scroll", onScroll);
    }, []);

    const navLinks = [
        { label: "Inicio", sub: "Empieza aquí", href: "/#inicio" },
        { label: "Servicios", sub: "Lo que hacemos", href: "/#servicios" },
        { label: "Proceso", sub: "Cómo trabajamos", href: "/#proceso" },
        { label: "Galería", sub: "Nuestros eventos", href: "/#galeria" },
        { label: "Contacto", sub: "Hablemos", href: "/#contacto" },
    ];

    return (
        <>
            <nav
                className={`fixed top-0 left-0 right-0 z-1000 flex items-center justify-between px-6 md:px-15 transition-all duration-500 ${
                    scrolled
                        ? "py-3.5 md:py-4 bg-surface/50 backdrop-blur-3xl border-b border-gold/15"
                        : "py-5 md:py-7"
                }`}
            >
                {/* Logo */}
                <a
                    href="/"
                    className="z-1001 font-display text-[1.8rem] font-semibold tracking-wide"
                >
                    <span className="text-cream">iParty</span>
                    <span className="text-gold">DJs</span>
                </a>

                {/* Links */}
                <div
                    className={`flex items-center gap-9 md:gap-12 fixed md:static top-0 -right-full md:right-auto w-70 md:w-auto h-screen md:h-auto bg-surface-1 md:bg-transparent border-l border-gold/20 md:border-none flex-col md:flex-row justify-center px-10 py-16 md:p-0 transition-[right] duration-400 z-999 ${
                        menuOpen ? "right-0!" : ""
                    }`}
                >
                    {navLinks.map((link) => (
                        <a
                            key={link.label}
                            href={link.href}
                            onClick={() => setMenuOpen(false)}
                            className="group relative flex flex-col items-center gap-0.5"
                        >
                            <span className="font-body text-[0.85rem] md:text-[0.72rem] font-medium tracking-[0.15em] uppercase text-cream transition-colors duration-300 group-hover:text-gold">
                                {link.label}
                            </span>
                            <span className="font-display text-[0.65rem] italic text-gold opacity-0 -translate-y-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                                {link.sub}
                            </span>
                            <span className="absolute -bottom-1 left-0 h-px w-0 bg-gold transition-all duration-400 group-hover:w-full" />
                        </a>
                    ))}
                </div>

                {/* Right side */}
                <div className="flex items-center gap-6 z-1001">
                    <a
                        href="/#contacto"
                        className="inline-flex items-center justify-center px-5 h-10 text-sm text-surface font-semibold bg-linear-to-r from-gold-dark via-gold to-gold-dark rounded-lg shadow-lg hover:scale-105 duration-200 hover:drop-shadow-2xl hover:shadow-gold/50 transition-all"
                    >
                        Cotizar Evento
                    </a>

                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="hidden max-md:flex flex-col gap-1.25 p-1"
                    >
                        <span
                            className={`block w-6 h-px bg-cream transition-all duration-300 origin-center ${
                                menuOpen
                                    ? "translate-y-1.5 rotate-45 bg-gold"
                                    : ""
                            }`}
                        />
                        <span
                            className={`block w-6 h-px bg-cream transition-all duration-300 origin-center ${
                                menuOpen ? "opacity-0" : ""
                            }`}
                        />
                        <span
                            className={`block w-6 h-px bg-cream transition-all duration-300 origin-center ${
                                menuOpen
                                    ? "-translate-y-1.5 -rotate-45 bg-gold"
                                    : ""
                            }`}
                        />
                    </button>
                </div>
            </nav>

            {menuOpen && (
                <div
                    onClick={() => setMenuOpen(false)}
                    className="fixed inset-0 bg-black/50 z-998"
                />
            )}
        </>
    );
};

export default Navbar;
