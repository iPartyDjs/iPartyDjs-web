import { useEffect, useRef, useState } from "react";

const stats = [
    { value: 250, suffix: "+", label: "Eventos realizados" },
    { value: 10, suffix: " años", label: "De experiencia" },
    { value: 100, suffix: "%", label: "Clientes satisfechos" },
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
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center shadow-[0_20px_60px_rgba(15,23,42,0.28)] backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1 md:p-8">
            <div className="flex items-end justify-center gap-1 text-4xl font-black tracking-tight text-white md:text-5xl">
                <span className="text-gold">{count}</span>
                <span className="pb-1 text-base text-slate-300 md:text-lg">
                    {suffix}
                </span>
            </div>
            <div className="mt-3 text-xs font-medium uppercase tracking-[0.2em] text-slate-300 md:text-sm">
                {label}
            </div>
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
        <section
            ref={ref}
            className="
        relative overflow-hidden
        bg-surface
        bg-[radial-gradient(ellipse_60%_50%_at_0%_0%,color-mix(in_srgb,var(--color-gold)_14%,transparent),transparent_70%),radial-gradient(ellipse_60%_50%_at_100%_0%,color-mix(in_srgb,var(--color-gold-light)_12%,transparent),transparent_70%)]
        p-8 text-cream"
        >
            <div className="mx-auto grid max-w-6xl gap-6 px-4 sm:grid-cols-2 lg:grid-cols-3">
                {stats.map((s) => (
                    <StatItem key={s.label} {...s} active={active} />
                ))}
            </div>
        </section>
    );
};

export default Stats;
