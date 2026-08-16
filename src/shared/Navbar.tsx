import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import { Button, NavLink } from "@/shared/ui";

const navLinks = [
    { label: "Inicio", sub: "Empieza aquí", href: "/#inicio" },
    { label: "Servicios", sub: "Lo que hacemos", href: "/#servicios" },
    { label: "Proceso", sub: "Cómo trabajamos", href: "/#proceso" },
    { label: "Galería", sub: "Nuestros eventos", href: "/#galeria" },
    { label: "Contacto", sub: "Hablemos", href: "/#contacto" },
];

type MobileMenuProps = {
    open: boolean;
    onClose: () => void;
};

// Se monta vía Portal directo en document.body: así escapa del <header>
// (que usa backdrop-blur al hacer scroll). backdrop-filter crea un nuevo
// "containing block" para descendientes con position:fixed, lo que
// confinaba este panel a la altura del navbar en vez de la pantalla completa.
const MobileMenu = ({ open, onClose }: MobileMenuProps) => {
    return createPortal(
        <div
            className={clsx(
                "fixed inset-0 z-100 lg:hidden",
                open ? "pointer-events-auto" : "pointer-events-none",
            )}
        >
            {/* Backdrop */}
            <div
                onClick={onClose}
                className={clsx(
                    "fixed inset-0 bg-black/60 transition-opacity duration-300",
                    open ? "opacity-100" : "opacity-0",
                )}
            />

            {/* Panel */}
            <div
                className={clsx(
                    "fixed inset-y-0 right-0 w-full max-w-sm overflow-y-auto bg-surface-1 px-6 py-6 ring-1 ring-gold/10 transition-transform duration-300",
                    open ? "translate-x-0" : "translate-x-full",
                )}
            >
                <div className="flex items-center justify-between">
                    <a href="/" className="font-display text-xl font-semibold">
                        <span className="text-cream">iParty</span>
                        <span className="text-gold">DJs</span>
                    </a>
                    <button
                        type="button"
                        onClick={onClose}
                        className="-m-2.5 rounded-md p-2.5"
                    >
                        <span className="sr-only">Cerrar menú</span>
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            aria-hidden="true"
                            className="size-6 text-cream"
                        >
                            <path
                                d="M6 18 18 6M6 6l12 12"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </button>
                </div>

                <div className="mt-10 flex flex-col gap-1">
                    {navLinks.map((link) => (
                        <a
                            key={link.label}
                            href={link.href}
                            onClick={onClose}
                            className="-mx-3 block rounded-lg px-3 py-3 font-body text-base font-semibold tracking-wide uppercase text-cream hover:bg-gold/10 hover:text-gold"
                        >
                            {link.label}
                        </a>
                    ))}
                </div>

                <div className="mt-8">
                    <Button
                        href="/#contacto"
                        size="sm"
                        className="w-full"
                        onClick={onClose}
                    >
                        Cotizar Evento
                    </Button>
                </div>
            </div>
        </div>,
        document.body,
    );
};

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(document.body.scrollTop > 60);
        document.body.addEventListener("scroll", onScroll);
        return () => document.body.removeEventListener("scroll", onScroll);
    }, []);

    // Bloquea el scroll del body mientras el menú móvil está abierto
    useEffect(() => {
        document.body.style.overflow = menuOpen ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [menuOpen]);

    return (
        <>
            <header
                className={clsx(
                    "fixed inset-x-0 top-0 z-50 transition-all duration-500",
                    scrolled
                        ? "bg-surface/70 backdrop-blur-xl border-b border-gold/15"
                        : "bg-transparent",
                )}
            >
                <nav
                    aria-label="Global"
                    className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8"
                >
                    {/* Logo */}
                    <div className="flex lg:flex-1">
                        <a
                            href="/"
                            className="font-display text-[1.8rem] font-semibold tracking-wide"
                        >
                            <span className="text-cream">iParty</span>
                            <span className="text-gold">DJs</span>
                        </a>
                    </div>

                    {/* Hamburger (mobile) */}
                    <div className="flex lg:hidden">
                        <button
                            type="button"
                            onClick={() => setMenuOpen(true)}
                            className="-m-2.5 inline-flex items-center justify-center p-2.5"
                        >
                            <span className="sr-only">Abrir menú</span>
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                aria-hidden="true"
                                className="size-6 text-cream"
                            >
                                <path
                                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </button>
                    </div>

                    {/* Links (desktop) */}
                    <div className="hidden lg:flex lg:gap-x-12">
                        {navLinks.map((link) => (
                            <NavLink key={link.label} {...link} />
                        ))}
                    </div>

                    {/* Botón (desktop) */}
                    <div className="hidden lg:flex lg:flex-1 lg:justify-end">
                        <Button href="/#contacto" size="sm">
                            Cotizar Evento
                        </Button>
                    </div>
                </nav>
            </header>

            <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
        </>
    );
};

export default Navbar;
