import { Button, DecorativeShape } from "@/shared/ui";
import Overline from "@/shared/ui/Overline";

export default function Hero() {
    return (
        <section
            id="inicio"
            className="relative isolate overflow-hidden bg-surface px-6 pt-14 lg:px-8"
        >
            {/* Blob decorativo superior */}
            <DecorativeShape
                kind="blob"
                className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
                innerClassName="relative left-[calc(50%-11rem)] aspect-1155/678 w-144.5 -translate-x-1/2 rotate-30 bg-linear-to-tr from-gold-dark to-gold opacity-20 sm:left-[calc(50%-30rem)] sm:w-288.75"
            />

            <div className="mx-auto max-w-3xl py-32 sm:py-48 lg:py-56">
                {/* Overline */}
                <div className="mb-8 flex justify-center">
                    <Overline
                        children={"Producción & Coordinación de Eventos"}
                    />
                </div>

                <div className="text-center">
                    <h1 className="font-display text-5xl font-normal text-balance text-cream sm:text-7xl">
                        Creamos{" "}
                        <em className="italic text-cream-dim">experiencias</em>
                        <br className="hidden sm:block" /> que se convierten en{" "}
                        <span className="text-gold not-italic">
                            memorias eternas.
                        </span>
                    </h1>

                    <p className="mt-8 font-body text-sm text-pretty text-cream-dim sm:text-base">
                        Bodas · XV Años · Cumpleaños · Eventos Empresariales
                        <br />
                        Dirección musical, diseño sonoro y visual de clase
                        mundial.
                    </p>

                    <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                        <Button href="/#contacto" size="lg">
                            Cotiza tu Evento
                        </Button>
                        <Button href="/#galeria" variant="outline" size="lg">
                            Ver Galería
                        </Button>
                    </div>
                </div>
            </div>

            {/* Indicador de scroll */}
            <div className="absolute bottom-10 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 text-[0.65rem] tracking-[0.3em] text-gold uppercase sm:flex">
                <span className="h-10 w-px bg-gold/40" />
                Scroll
            </div>

            {/* Ubicación */}
            <div className="absolute bottom-10 right-6 hidden text-[0.65rem] tracking-[0.3em] text-cream-dim uppercase sm:block lg:right-8">
                Morelos · MX
            </div>

            {/* Blob decorativo inferior */}
            <div
                aria-hidden="true"
                className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
            >
                <div
                    style={{
                        clipPath:
                            "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
                    }}
                    className="relative left-[calc(50%+3rem)] aspect-1155/678 w-144.5 -translate-x-1/2 bg-linear-to-tr from-gold-dark to-gold opacity-25 sm:left-[calc(50%+36rem)] sm:w-288.75"
                />
            </div>
        </section>
    );
}
