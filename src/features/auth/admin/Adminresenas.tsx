import { useMemo, useState, useRef } from "react";
//import html2pdf from "html2pdf.js";
import AdminPageShell from "./AdminPageShell";
import "./Adminresenas.css";

/* ------------------------------------------------------------------ */
/* Tipos */
/* ------------------------------------------------------------------ */
type EstadoResena = "pendiente" | "aprobada" | "rechazada";

interface Resena {
    id: string;
    clienteNombre: string;
    clienteAvatarUrl?: string;
    tipoEvento: string;
    calificacion: 1 | 2 | 3 | 4 | 5;
    comentario: string;
    fecha: string;
    estado: EstadoResena;
}

/* ------------------------------------------------------------------ */
/* Datos de ejemplo */
/* ------------------------------------------------------------------ */
const RESENAS_MOCK: Resena[] = [
    {
        id: "r1",
        clienteNombre: "Ana Torres",
        tipoEvento: "Boda",
        calificacion: 5,
        comentario:
            "El DJ leyó perfecto el ambiente, la pista nunca se vació. La coordinación con el equipo de iPartyDJs fue impecable desde la primera llamada.",
        fecha: "2026-07-18",
        estado: "pendiente",
    },
    {
        id: "r2",
        clienteNombre: "Carlos Medina",
        tipoEvento: "XV Años",
        calificacion: 4,
        comentario:
            "Muy buen servicio en general, aunque el sonido tardó un poco en ajustarse al inicio. Después de eso, todo excelente.",
        fecha: "2026-07-15",
        estado: "aprobada",
    },
    {
        id: "r3",
        clienteNombre: "Grupo Vantex",
        tipoEvento: "Corporativo",
        calificacion: 2,
        comentario:
            "El equipo llegó tarde al montaje y eso retrasó el arranque del evento. La música estuvo bien pero la puntualidad no.",
        fecha: "2026-07-10",
        estado: "pendiente",
    },
    {
        id: "r4",
        clienteNombre: "Lucía Fernández",
        tipoEvento: "Boda",
        calificacion: 5,
        comentario:
            "Superó nuestras expectativas. El DJ se adaptó a nuestra playlist personalizada sin ningún problema.",
        fecha: "2026-07-05",
        estado: "aprobada",
    },
    {
        id: "r5",
        clienteNombre: "Roberto Aguilar",
        tipoEvento: "Cumpleaños",
        calificacion: 1,
        comentario:
            "El equipo de sonido falló a la mitad del evento y no hubo respuesta rápida del soporte técnico.",
        fecha: "2026-06-29",
        estado: "rechazada",
    },
];

const ESTADO_LABEL: Record<EstadoResena, string> = {
    pendiente: "Pendiente",
    aprobada: "Aprobada",
    rechazada: "Rechazada",
};

/* ------------------------------------------------------------------ */
/* Componente Principal */
/* ------------------------------------------------------------------ */
export default function AdminResenas() {
    const [resenas, setResenas] = useState<Resena[]>(RESENAS_MOCK);
    const [filtroEstado, setFiltroEstado] = useState<EstadoResena | "todas">(
        "todas",
    );
    const [busqueda, setBusqueda] = useState("");
    const [seleccionId, setSeleccionId] = useState<string | null>(null);
    //const [generandoPdf, setGenerandoPdf] = useState(false);

    // Referencia para capturar el área del PDF
    const pdfAreaRef = useRef<HTMLDivElement>(null);

    const resenasFiltradas = useMemo(() => {
        return resenas.filter((r) => {
            const coincideEstado =
                filtroEstado === "todas" || r.estado === filtroEstado;
            const coincideBusqueda =
                busqueda.trim() === "" ||
                r.clienteNombre
                    .toLowerCase()
                    .includes(busqueda.toLowerCase()) ||
                r.tipoEvento.toLowerCase().includes(busqueda.toLowerCase());
            return coincideEstado && coincideBusqueda;
        });
    }, [resenas, filtroEstado, busqueda]);

    const stats = useMemo(() => {
        const total = resenas.length;
        const pendientes = resenas.filter(
            (r) => r.estado === "pendiente",
        ).length;
        const aprobadas = resenas.filter((r) => r.estado === "aprobada").length;
        const promedio =
            total === 0
                ? 0
                : resenas.reduce((acc, r) => acc + r.calificacion, 0) / total;
        return { total, pendientes, aprobadas, promedio };
    }, [resenas]);

    const seleccionada = resenas.find((r) => r.id === seleccionId) ?? null;

    const cambiarEstado = (id: string, estado: EstadoResena) => {
        setResenas((prev) =>
            prev.map((r) => (r.id === id ? { ...r, estado } : r)),
        );
    };

    const eliminarResena = (id: string) => {
        setResenas((prev) => prev.filter((r) => r.id !== id));
        if (seleccionId === id) setSeleccionId(null);
    };

    // const elemento = pdfAreaRef.current;
    // const opciones = {
    //   margin: [10, 10, 10, 10],
    //   filename: `Reporte_Estadisticas_${new Date().toISOString().slice(0, 10)}.pdf`,
    //   image: { type: "jpeg", quality: 0.98 },
    //   html2canvas: {
    //     scale: 2,
    //     useCORS: true,
    //     backgroundColor: "#121212",
    //   },
    //   jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    // };

    //     html2pdf()
    //       .set(opciones)
    //       .from(elemento)
    //       .save()
    //       .then(() => setGenerandoPdf(false))
    //       .catch(() => setGenerandoPdf(false));
    //   };

    return (
        <AdminPageShell
            topbarTitle="Reseñas"
            key="resenas"
            sidePanel={
                seleccionada && (
                    <PanelDetalleResena
                        resena={seleccionada}
                        onAprobar={() =>
                            cambiarEstado(seleccionada.id, "aprobada")
                        }
                        onRechazar={() =>
                            cambiarEstado(seleccionada.id, "rechazada")
                        }
                        onEliminar={() => eliminarResena(seleccionada.id)}
                        onCerrar={() => setSeleccionId(null)}
                    />
                )
            }
        >
            {/* Botón de exportación posicionado arriba a la derecha */}
            <div className="ipdj-resenas-header-actions">
                {/* <BotonExportarPDF onClick={exportarAPDF} cargando={generandoPdf} /> */}
            </div>

            {/* Área que se convertirá a PDF */}
            <div ref={pdfAreaRef} className="ipdj-pdf-container">
                {/* Estadísticas */}
                <div className="ipdj-resenas-stats">
                    <StatCard label="Total de reseñas" valor={stats.total} />
                    <StatCard
                        label="Pendientes"
                        valor={stats.pendientes}
                        destacado
                    />
                    <StatCard label="Aprobadas" valor={stats.aprobadas} />
                    <StatCard
                        label="Calificación promedio"
                        valor={stats.promedio.toFixed(1)}
                        sufijo="★"
                    />
                </div>

                {/* Filtros */}
                <div className="ipdj-resenas-filtros">
                    <input
                        type="text"
                        className="ipdj-resenas-buscador"
                        placeholder="Buscar por cliente o tipo de evento..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                    />
                    <div className="ipdj-resenas-chip-group">
                        {(
                            [
                                "todas",
                                "pendiente",
                                "aprobada",
                                "rechazada",
                            ] as const
                        ).map((opcion) => (
                            <button
                                key={opcion}
                                className={
                                    "ipdj-resenas-chip" +
                                    (filtroEstado === opcion ? " active" : "")
                                }
                                onClick={() => setFiltroEstado(opcion)}
                            >
                                {opcion === "todas"
                                    ? "Todas"
                                    : ESTADO_LABEL[opcion]}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grid de tarjetas */}
                <div className="ipdj-resenas-grid">
                    {resenasFiltradas.length === 0 && (
                        <p className="ipdj-resenas-vacio">
                            No hay reseñas que coincidan con el filtro.
                        </p>
                    )}
                    {resenasFiltradas.map((resena) => (
                        <TarjetaResena
                            key={resena.id}
                            resena={resena}
                            seleccionada={resena.id === seleccionId}
                            onClick={() => setSeleccionId(resena.id)}
                        />
                    ))}
                </div>
            </div>
        </AdminPageShell>
    );
}

//   /* Subcomponente del Botón PDF */
//   function BotonExportarPDF({
//     onClick,
//     cargando,
//   }: {
//     onClick: () => void;
//     cargando: boolean;
//   }) {
//     return (
//       <button
//         type="button"
//         className="ipdj-btn-pdf"
//         onClick={onClick}
//         disabled={cargando}
//       >
//         <svg
//           className="ipdj-btn-pdf-icon"
//           viewBox="0 0 24 24"
//           fill="none"
//           stroke="currentColor"
//           strokeWidth="2"
//           strokeLinecap="round"
//           strokeLinejoin="round"
//         >
//           <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
//           <polyline points="14 2 14 8 20 8" />
//           <line x1="16" y1="13" x2="8" y2="13" />
//           <line x1="16" y1="17" x2="8" y2="17" />
//           <polyline points="10 9 9 9 8 9" />
//         </svg>
//         <span>{cargando ? "Generando PDF..." : "Exportar Reporte PDF"}</span>
//       </button>
//     );
//   }

function StatCard({
    label,
    valor,
    sufijo,
    destacado,
}: {
    label: string;
    valor: string | number;
    sufijo?: string;
    destacado?: boolean;
}) {
    return (
        <div className={"ipdj-stat-card" + (destacado ? " destacado" : "")}>
            <span className="ipdj-stat-valor">
                {valor}
                {sufijo && <span className="ipdj-stat-sufijo"> {sufijo}</span>}
            </span>
            <span className="ipdj-stat-label">{label}</span>
        </div>
    );
}

function Estrellas({ calificacion }: { calificacion: number }) {
    return (
        <div className="ipdj-estrellas" aria-label={`${calificacion} de 5`}>
            {[1, 2, 3, 4, 5].map((n) => (
                <span key={n} className={n <= calificacion ? "llena" : "vacia"}>
                    ★
                </span>
            ))}
        </div>
    );
}

function EstadoBadge({ estado }: { estado: EstadoResena }) {
    return (
        <span className={`ipdj-estado-badge estado-${estado}`}>
            {ESTADO_LABEL[estado]}
        </span>
    );
}

function TarjetaResena({
    resena,
    seleccionada,
    onClick,
}: {
    resena: Resena;
    seleccionada: boolean;
    onClick: () => void;
}) {
    return (
        <article
            className={
                "ipdj-resena-card" + (seleccionada ? " seleccionada" : "")
            }
            onClick={onClick}
        >
            <header className="ipdj-resena-card-header">
                <div className="ipdj-resena-avatar">
                    {resena.clienteNombre.charAt(0)}
                </div>
                <div>
                    <h3>{resena.clienteNombre}</h3>
                    <span className="ipdj-resena-tipo">
                        {resena.tipoEvento}
                    </span>
                </div>
                <EstadoBadge estado={resena.estado} />
            </header>
            <Estrellas calificacion={resena.calificacion} />
            <p className="ipdj-resena-comentario">{resena.comentario}</p>
            <footer className="ipdj-resena-card-footer">
                <span>
                    {new Date(resena.fecha).toLocaleDateString("es-MX", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                    })}
                </span>
            </footer>
        </article>
    );
}

function PanelDetalleResena({
    resena,
    onAprobar,
    onRechazar,
    onEliminar,
    onCerrar,
}: {
    resena: Resena;
    onAprobar: () => void;
    onRechazar: () => void;
    onEliminar: () => void;
    onCerrar: () => void;
}) {
    return (
        <div className="ipdj-panel-resena">
            <div className="ipdj-panel-resena-header">
                <h2>Detalle de reseña</h2>
                <button className="ipdj-panel-cerrar" onClick={onCerrar}>
                    ×
                </button>
            </div>
            <div className="ipdj-panel-resena-cliente">
                <div className="ipdj-resena-avatar grande">
                    {resena.clienteNombre.charAt(0)}
                </div>
                <div>
                    <h3>{resena.clienteNombre}</h3>
                    <span className="ipdj-resena-tipo">
                        {resena.tipoEvento}
                    </span>
                </div>
            </div>
            <Estrellas calificacion={resena.calificacion} />
            <EstadoBadge estado={resena.estado} />
            <p className="ipdj-panel-resena-comentario">{resena.comentario}</p>
            <span className="ipdj-panel-resena-fecha">
                Publicada el{" "}
                {new Date(resena.fecha).toLocaleDateString("es-MX", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                })}
            </span>
            <div className="ipdj-panel-resena-acciones">
                <button
                    className="ipdj-btn-aprobar"
                    onClick={onAprobar}
                    disabled={resena.estado === "aprobada"}
                >
                    Aprobar
                </button>
                <button
                    className="ipdj-btn-rechazar"
                    onClick={onRechazar}
                    disabled={resena.estado === "rechazada"}
                >
                    Rechazar
                </button>
                <button className="ipdj-btn-eliminar" onClick={onEliminar}>
                    Eliminar
                </button>
            </div>
        </div>
    );
}
