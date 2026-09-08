import { useEffect, useState } from "react";
import { Button } from "@/shared/ui";
import heroMedia from "@/config/media";

export default function HeroV2() {
    const [videoError, setVideoError] = useState(false);
    const media = heroMedia.dark;

    useEffect(() => {
        // ensure accessible title handled at page level
    }, []);

    return (
        <section id="inicio" className="relative h-screen w-full overflow-hidden">
            {/* Video background */}
            {!videoError ? (
                <video
                    className="absolute inset-0 h-full w-full object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                    poster={media.poster}
                    onError={() => setVideoError(true)}
                >
                    <source src={media.video} type="video/mp4" />
                </video>
            ) : (
                <div
                    aria-hidden
                    className="absolute inset-0 bg-gradient-to-br from-black via-gray-800 to-gray-700"
                />
            )}

            {/* Overlay to ensure contrast */}
            <div className="absolute inset-0 bg-black/50" />

            {/* Header (logo + hamburger) */}
            <header className="relative z-10 flex items-center justify-between px-6 pt-6">
                <div className="text-white font-bold">BATIZ</div>
                <button aria-label="menu" className="text-white text-2xl">☰</button>
            </header>

            {/* Content */}
            <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-center px-6">
                <div className="grid gap-8 lg:grid-cols-2">
                    <div className="max-w-xl text-white">
                        <p className="mb-4 text-sm font-medium tracking-widest text-gold uppercase">
                            Producción &amp; Coordinación de Eventos
                        </p>
                        <h2 className="text-4xl font-display leading-tight sm:text-5xl">
                            Creamos <em className="italic">experiencias</em> que se convierten en <span className="text-gold">memorias eternas.</span>
                        </h2>
                        <p className="mt-6 text-base text-gray-200">
                            Bodas · XV Años · Cumpleaños · Eventos Empresariales
                            <br />
                            Dirección musical, diseño sonoro y visual de clase mundial.
                        </p>
                        <div className="mt-8 flex gap-4">
                            <Button href="/#contacto">Cotiza tu Evento</Button>
                            <Button href="/#galeria" variant="outline">Ver Galería</Button>
                        </div>
                    </div>

                    <div className="max-w-xl text-white">
                        <h3 className="text-3xl font-semibold">Propuesta de valor</h3>
                        <p className="mt-4 text-gray-200">
                            Entregamos producción integral, dirección musical y diseño visual para eventos que buscan trascender.
                        </p>
                        <a href="/showroom" className="mt-6 inline-block text-gold underline">Showroom</a>
                    </div>
                </div>
            </div>

            {/* Scroll indicator and carousel/indicator */}
            <div className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 text-[0.65rem] tracking-[0.3em] text-gold uppercase sm:flex z-10">
                <span className="h-10 w-px bg-gold/40" />
                Scroll
            </div>

            <div className="absolute right-6 top-1/2 hidden -translate-y-1/2 flex-col items-center gap-3 text-sm text-white/90 sm:flex z-10">
                <div className="text-xs uppercase">ACTUAL</div>
                <div className="text-2xl font-bold">/</div>
                <div className="text-xs uppercase">SIGUIENTE</div>
            </div>
        </section>
    );
}
