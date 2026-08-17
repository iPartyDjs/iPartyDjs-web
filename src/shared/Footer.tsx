const navLinks = [
    { label: "Inicio", href: "#inicio" },
    { label: "Servicios", href: "#servicios" },
    { label: "Proceso", href: "#proceso" },
    { label: "Galería", href: "#galeria" },
    { label: "Contacto", href: "#contacto" },
];

const eventLinks = [
    { label: "Bodas", href: "#contacto" },
    { label: "XV Años", href: "#contacto" },
    { label: "Cumpleaños", href: "#contacto" },
    { label: "Corporativos", href: "#contacto" },
    { label: "Graduaciones", href: "#contacto" },
];

const accessLinks = [
    { label: "Iniciar sesión", href: "/login" },
    { label: "Registrarse", href: "/register" },
    { label: "Administración", href: "/admin" },
];

const FooterColumn = ({
    title,
    links,
}: {
    title: string;
    links: { label: string; href: string }[];
}) => (
    <div>
        <span className="font-body text-[0.68rem] font-semibold tracking-[0.25em] uppercase text-gold">
            {title}
        </span>
        <ul className="mt-5 space-y-3">
            {links.map((link) => (
                <li key={link.label}>
                    <a
                        href={link.href}
                        className="font-body text-sm text-cream-dim transition-colors duration-300 hover:text-cream"
                    >
                        {link.label}
                    </a>
                </li>
            ))}
        </ul>
    </div>
);

const Footer = () => {
    const year = new Date().getFullYear();

    return (
        <footer className="bg-surface">
            <div className="mx-auto max-w-7xl px-6 pt-20 pb-10 lg:px-8">
                <div className="grid grid-cols-1 gap-14 lg:grid-cols-5 lg:gap-10">
                    {/* Marca — 2/5 */}
                    <div className="lg:col-span-2">
                        <a
                            href="/"
                            className="font-display text-2xl font-semibold tracking-wide"
                        >
                            <span className="text-cream">iParty</span>
                            <span className="text-gold">DJs</span>
                        </a>

                        <div className="mt-6 flex items-center gap-4 text-gold/70">
                            <span className="h-px w-8 bg-gold/40" />
                            <span className="font-body text-[0.6rem] tracking-[0.25em] uppercase">
                                Cuernavaca, Morelos
                            </span>
                        </div>

                        <p className="mt-4 max-w-xs font-body text-sm text-cream-dim">
                            Producción &amp; Coordinación de Eventos Sociales de
                            clase mundial.
                        </p>
                    </div>

                    {/* Columnas de navegación — 3/5 */}
                    <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:col-span-3">
                        <FooterColumn title="Navegación" links={navLinks} />
                        <FooterColumn title="Eventos" links={eventLinks} />
                        <FooterColumn title="Acceso" links={accessLinks} />
                    </div>
                </div>

                <div className="mt-16 flex flex-col-reverse items-center justify-between gap-6 border-t border-gold/10 pt-8 sm:flex-row">
                    <p className="font-body text-xs text-cream-faint">
                        © {year} iPartyDJs. Todos los derechos reservados.
                    </p>

                    <div className="flex gap-6">
                        <a
                            href="https://www.instagram.com/iparty_djs/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-body text-[0.68rem] font-semibold tracking-[0.2em] uppercase text-cream-dim transition-colors duration-300 hover:text-gold"
                        >
                            Instagram
                        </a>
                        <a
                            href="https://wa.me/527775102313"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-body text-[0.68rem] font-semibold tracking-[0.2em] uppercase text-cream-dim transition-colors duration-300 hover:text-gold"
                        >
                            WhatsApp
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
