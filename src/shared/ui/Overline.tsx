type OverlineProps = { children: React.ReactNode };

export default function Overline({ children }: OverlineProps) {
    return (
        <div className="flex items-center gap-4 text-gold text-xs tracking-[0.3em] uppercase">
            <span className="h-px w-8 bg-gold/50" />
            {children}
            <span className="h-px w-8 bg-gold/50" />
        </div>
    );
}
