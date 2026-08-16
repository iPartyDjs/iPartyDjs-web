type NavLinkProps = {
    href: string;
    label: string;
    sub: string;
    onClick?: () => void;
};

export default function NavLink({ href, label, sub, onClick }: NavLinkProps) {
    return (
        <a
            href={href}
            onClick={onClick}
            className="group relative flex flex-col items-center gap-0.5"
        >
            <span className="font-body text-[0.85rem] md:text-[0.72rem] font-medium tracking-[0.15em] uppercase text-cream transition-colors duration-300 group-hover:text-gold">
                {label}
            </span>
            <span className="font-display text-[0.65rem] italic text-gold opacity-0 -translate-y-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                {sub}
            </span>
            <span className="absolute -bottom-1 left-0 h-px w-0 bg-gold transition-all duration-400 group-hover:w-full" />
        </a>
    );
}
