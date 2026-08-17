const RING_SIZES = [80, 160, 260, 380, 520, 680];

export default function GalleryRings() {
    return (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
            {RING_SIZES.map((size, index) => (
                <span
                    key={size}
                    style={{
                        width: size,
                        height: size,
                        animationDelay: `${index * 0.4}s`,
                    }}
                    className="absolute animate-[ringPulse_6s_ease-in-out_infinite] rounded-full border border-gold/8"
                />
            ))}
        </div>
    );
}
