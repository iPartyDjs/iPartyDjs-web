const items = [
    "Bodas",
    "✦",
    "XV Años",
    "✦",
    "Cumpleaños",
    "✦",
    "Eventos Corporativos",
    "✦",
    "Graduaciones",
    "✦",
    "Fiestas Privadas",
    "✦",
];

const Marquee = () => (
    <div className="group overflow-hidden whitespace-nowrap bg-gold py-3.5">
        <div className="inline-flex animate-marquee-scroll gap-8 group-hover:[animation-play-state:paused]">
            {[...items, ...items].map((item, i) => (
                <span
                    key={i}
                    className={
                        item === "✦"
                            ? "text-[0.5rem] text-surface"
                            : "font-semibold text-[0.6rem] uppercase tracking-[0.3em] text-surface"
                    }
                >
                    {item}
                </span>
            ))}
        </div>
    </div>
);

export default Marquee;
