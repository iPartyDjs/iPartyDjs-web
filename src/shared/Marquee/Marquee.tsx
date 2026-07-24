import "@/styles/legacy/Marquee.css";

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
    <div className="marquee-wrapper">
        <div className="marquee-track">
            {[...items, ...items].map((item, i) => (
                <span
                    key={i}
                    className={item === "✦" ? "marquee-dot" : "marquee-item"}
                >
                    {item}
                </span>
            ))}
        </div>
    </div>
);

export default Marquee;
