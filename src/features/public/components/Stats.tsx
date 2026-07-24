import { useEffect, useRef, useState } from "react";

const stats = [
    { value: 250, suffix: "+", label: "Eventos realizados" },
    { value: 8, suffix: " años", label: "De experiencia" },
    { value: 98, suffix: "%", label: "Clientes satisfechos" },
    { value: 5, suffix: " ciudades", label: "De cobertura" },
];

const useCounter = (target: number, active: boolean, duration = 1800) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
        if (!active) return;
        let start = 0;
        const step = Math.ceil(target / (duration / 16));
        const timer = setInterval(() => {
            start += step;
            if (start >= target) {
                setCount(target);
                clearInterval(timer);
            } else setCount(start);
        }, 16);
        return () => clearInterval(timer);
    }, [active, target, duration]);
    return count;
};

const StatItem = ({
    value,
    suffix,
    label,
    active,
}: {
    value: number;
    suffix: string;
    label: string;
    active: boolean;
}) => {
    const count = useCounter(value, active);
    return (
        <div className="stat-item">
            <div className="stat-value">
                <span className="stat-num">{count}</span>
                <span className="stat-suffix">{suffix}</span>
            </div>
            <div className="stat-label">{label}</div>
        </div>
    );
};

const Stats = () => {
    const ref = useRef<HTMLElement>(null);
    const [active, setActive] = useState(false);

    useEffect(() => {
        const obs = new IntersectionObserver(
            ([e]) => {
                if (e.isIntersecting) setActive(true);
            },
            { threshold: 0.3 },
        );
        if (ref.current) obs.observe(ref.current);
        return () => obs.disconnect();
    }, []);

    return (
        <section ref={ref} className="stats">
            <div className="stats-inner">
                {stats.map((s) => (
                    <StatItem key={s.label} {...s} active={active} />
                ))}
            </div>
        </section>
    );
};

export default Stats;
