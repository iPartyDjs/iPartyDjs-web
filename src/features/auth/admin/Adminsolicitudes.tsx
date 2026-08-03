import { useMemo, useState } from "react";
import AdminPageShell from "./AdminPageShell";
import "./Adminsolicitudes.css";

/* ------------------------------------------------------------------ */
/* Tipos                                                               */
/* ------------------------------------------------------------------ */

type EstadoSolicitud = "pendiente" | "en_revision" | "aceptada" | "rechazada";

interface Solicitud {
    id: string;
    clienteNombre: string;
    clienteEmail: string;
    clienteTelefono: string;
    tipoEvento: string; // "Boda", "XV Años", "Corporativo"...
    fechaDeseada: string; // ISO — fecha en la que el cliente quiere el evento
    ubicacion: string;
    mensaje: string;
    fechaSolicitud: string; // ISO — cuándo se envió el formulario
    estado: EstadoSolicitud;
}

/* ------------------------------------------------------------------ */
/* Datos de ejemplo (reemplazar por fetch/React Query en integración)  */
/* ------------------------------------------------------------------ */

const SOLICITUDES_MOCK: Solicitud[] = [
    {
        id: "s1",
        clienteNombre: "Fernanda Ríos",
        clienteEmail: "fernanda.rios@mail.com",
        clienteTelefono: "777 123 4567",
        tipoEvento: "Boda",
        fechaDeseada: "2026-11-14",
        ubicacion: "Jardín Los Encinos, Jiutepec",
        mensaje:
            "Buscamos DJ con ambientación para 150 invitados, ceremonia y recepción en el mismo lugar. Nos interesa el paquete premium con luces.",
        fechaSolicitud: "2026-07-28",
        estado: "pendiente",
    },
    {
        id: "s2",
        clienteNombre: "Javier Ochoa",
        clienteEmail: "j.ochoa@corpmex.com",
        clienteTelefono: "777 890 1122",
        tipoEvento: "Corporativo",
        fechaDeseada: "2026-09-05",
        ubicacion: "Hotel Fiesta Inn, Cuernavaca",
        mensaje:
            "Cena anual de la empresa, 80 personas aproximadamente. Necesitamos audio para presentación y después ambiente para baile.",
        fechaSolicitud: "2026-07-25",
        estado: "en_revision",
    },
    {
        id: "s3",
        clienteNombre: "Paola Sánchez",
        clienteEmail: "paolasanchez15@mail.com",
        clienteTelefono: "777 456 7890",
        tipoEvento: "XV Años",
        fechaDeseada: "2026-10-02",
        ubicacion: "Salón Cristal, Jiutepec",
        mensaje:
            "Quiero incluir el vals, sorpresa con máquina de humo y que el DJ anime el resto de la fiesta. Somos aprox 120 invitados.",
        fechaSolicitud: "2026-07-20",
        estado: "aceptada",
    },
    {
        id: "s4",
        clienteNombre: "Marco Delgado",
        clienteEmail: "marco.delgado@mail.com",
        clienteTelefono: "777 234 5566",
        tipoEvento: "Cumpleaños",
        fechaDeseada: "2026-08-16",
        ubicacion: "Domicilio particular, Temixco",
        mensaje:
            "Fiesta pequeña, 40 personas, solo necesitamos un par de horas de música por la tarde-noche.",
        fechaSolicitud: "2026-07-19",
        estado: "rechazada",
    },
    {
        id: "s5",
        clienteNombre: "Grupo Alta Vista",
        clienteEmail: "eventos@altavista.mx",
        clienteTelefono: "777 998 4433",
        tipoEvento: "Corporativo",
        fechaDeseada: "2026-12-03",
        ubicacion: "Centro de Convenciones, Cuernavaca",
        mensaje:
            "Evento de fin de año con 300 asistentes, requerimos escenario, iluminación robótica y DJ para toda la noche.",
        fechaSolicitud: "2026-07-30",
        estado: "pendiente",
    },
];

const ESTADO_LABEL: Record<EstadoSolicitud, string> = {
    pendiente: "Pendiente",
    en_revision: "En revisión",
    aceptada: "Aceptada",
    rechazada: "Rechazada",
};

// const formateaMoneda = (valor: number) =>
//   valor.toLocaleString("es-MX", {
//     style: "currency",
//     currency: "MXN",
//     maximumFractionDigits: 0,
//   });

const formateaFecha = (iso: string, opts?: Intl.DateTimeFormatOptions) =>
    new Date(iso).toLocaleDateString(
        "es-MX",
        opts ?? { day: "2-digit", month: "short", year: "numeric" },
    );

/* ------------------------------------------------------------------ */
/* Componente                                                          */
/* ------------------------------------------------------------------ */

export default function AdminSolicitudes() {
    const [solicitudes, setSolicitudes] =
        useState<Solicitud[]>(SOLICITUDES_MOCK);
    const [filtroEstado, setFiltroEstado] = useState<EstadoSolicitud | "todas">(
        "todas",
    );
    const [busqueda, setBusqueda] = useState("");
    const [seleccionId, setSeleccionId] = useState<string | null>(null);

    const solicitudesFiltradas = useMemo(() => {
        return solicitudes
            .filter(
                (s) => filtroEstado === "todas" || s.estado === filtroEstado,
            )
            .filter((s) => {
                if (busqueda.trim() === "") return true;
                const q = busqueda.toLowerCase();
                return (
                    s.clienteNombre.toLowerCase().includes(q) ||
                    s.tipoEvento.toLowerCase().includes(q) ||
                    s.ubicacion.toLowerCase().includes(q)
                );
            })
            .sort(
                (a, b) =>
                    new Date(b.fechaSolicitud).getTime() -
                    new Date(a.fechaSolicitud).getTime(),
            );
    }, [solicitudes, filtroEstado, busqueda]);

    const stats = useMemo(() => {
        const total = solicitudes.length;
        const pendientes = solicitudes.filter(
            (s) => s.estado === "pendiente",
        ).length;
        const enRevision = solicitudes.filter(
            (s) => s.estado === "en_revision",
        ).length;
        const aceptadas = solicitudes.filter(
            (s) => s.estado === "aceptada",
        ).length;
        return { total, pendientes, enRevision, aceptadas };
    }, [solicitudes]);

    const seleccionada = solicitudes.find((s) => s.id === seleccionId) ?? null;

    const cambiarEstado = (id: string, estado: EstadoSolicitud) => {
        setSolicitudes((prev) =>
            prev.map((s) => (s.id === id ? { ...s, estado } : s)),
        );
    };

    return (
        <AdminPageShell
            topbarTitle="Solicitudes"
            sidePanel={
                seleccionada && (
                    <PanelDetalleSolicitud
                        solicitud={seleccionada}
                        onEnRevision={() =>
                            cambiarEstado(seleccionada.id, "en_revision")
                        }
                        onAceptar={() =>
                            cambiarEstado(seleccionada.id, "aceptada")
                        }
                        onRechazar={() =>
                            cambiarEstado(seleccionada.id, "rechazada")
                        }
                        onCerrar={() => setSeleccionId(null)}
                    />
                )
            }
        >
            {/* Estadísticas */}
            <div className="ipdj-solic-stats">
                <StatCard label="Total de solicitudes" valor={stats.total} />
                <StatCard
                    label="Pendientes"
                    valor={stats.pendientes}
                    destacado
                />
                <StatCard label="En revisión" valor={stats.enRevision} />
                <StatCard label="Aceptadas" valor={stats.aceptadas} />
            </div>

            {/* Filtros */}
            <div className="ipdj-solic-filtros">
                <input
                    type="text"
                    className="ipdj-solic-buscador"
                    placeholder="Buscar por cliente, tipo de evento o ubicación..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                />
                <div className="ipdj-solic-chip-group">
                    {(
                        [
                            "todas",
                            "pendiente",
                            "en_revision",
                            "aceptada",
                            "rechazada",
                        ] as const
                    ).map((opcion) => (
                        <button
                            key={opcion}
                            className={
                                "ipdj-solic-chip" +
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

            {/* Tabla */}
            <div className="ipdj-solic-tabla-wrap">
                <table className="ipdj-solic-tabla">
                    <thead>
                        <tr>
                            <th>Cliente</th>
                            <th>Evento</th>
                            <th>Fecha deseada</th>
                            <th>Solicitado</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {solicitudesFiltradas.length === 0 && (
                            <tr>
                                <td colSpan={6} className="ipdj-solic-vacio">
                                    No hay solicitudes que coincidan con el
                                    filtro.
                                </td>
                            </tr>
                        )}
                        {solicitudesFiltradas.map((s) => (
                            <tr
                                key={s.id}
                                className={
                                    s.id === seleccionId ? "seleccionada" : ""
                                }
                                onClick={() => setSeleccionId(s.id)}
                            >
                                <td>
                                    <div className="ipdj-solic-cliente-cell">
                                        <span className="ipdj-solic-avatar">
                                            {s.clienteNombre.charAt(0)}
                                        </span>
                                        <div>
                                            <div className="ipdj-solic-cliente-nombre">
                                                {s.clienteNombre}
                                            </div>
                                            <div className="ipdj-solic-cliente-email">
                                                {s.clienteEmail}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td>{s.tipoEvento}</td>
                                <td>{formateaFecha(s.fechaDeseada)}</td>
                                <td>{formateaFecha(s.fechaSolicitud)}</td>
                                <td>
                                    <EstadoBadge estado={s.estado} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AdminPageShell>
    );
}

/* ------------------------------------------------------------------ */
/* Subcomponentes                                                      */
/* ------------------------------------------------------------------ */

function StatCard({
    label,
    valor,
    destacado,
}: {
    label: string;
    valor: string | number;
    destacado?: boolean;
}) {
    return (
        <div className={"ipdj-stat-card" + (destacado ? " destacado" : "")}>
            <span className="ipdj-stat-valor">{valor}</span>
            <span className="ipdj-stat-label">{label}</span>
        </div>
    );
}

function EstadoBadge({ estado }: { estado: EstadoSolicitud }) {
    return (
        <span className={`ipdj-solic-badge estado-${estado}`}>
            {ESTADO_LABEL[estado]}
        </span>
    );
}

function PanelDetalleSolicitud({
    solicitud,
    onEnRevision,
    onAceptar,
    onRechazar,
    onCerrar,
}: {
    solicitud: Solicitud;
    onEnRevision: () => void;
    onAceptar: () => void;
    onRechazar: () => void;
    onCerrar: () => void;
}) {
    return (
        <div className="ipdj-panel-solic">
            <div className="ipdj-panel-solic-header">
                <h2>Detalle de solicitud</h2>
                <button className="ipdj-panel-cerrar" onClick={onCerrar}>
                    ×
                </button>
            </div>

            <div className="ipdj-panel-solic-cliente">
                <div className="ipdj-solic-avatar grande">
                    {solicitud.clienteNombre.charAt(0)}
                </div>
                <div>
                    <h3>{solicitud.clienteNombre}</h3>
                    <span className="ipdj-panel-solic-contacto">
                        {solicitud.clienteEmail}
                    </span>
                    <span className="ipdj-panel-solic-contacto">
                        {solicitud.clienteTelefono}
                    </span>
                </div>
            </div>

            <EstadoBadge estado={solicitud.estado} />

            <dl className="ipdj-panel-solic-datos">
                <div>
                    <dt>Tipo de evento</dt>
                    <dd>{solicitud.tipoEvento}</dd>
                </div>
                <div>
                    <dt>Fecha deseada</dt>
                    <dd>
                        {formateaFecha(solicitud.fechaDeseada, {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                        })}
                    </dd>
                </div>
                <div>
                    <dt>Ubicación</dt>
                    <dd>{solicitud.ubicacion}</dd>
                </div>
            </dl>

            <div className="ipdj-panel-solic-mensaje">
                <span className="ipdj-panel-solic-mensaje-label">
                    Mensaje del cliente
                </span>
                <p>{solicitud.mensaje}</p>
            </div>

            <span className="ipdj-panel-solic-fecha">
                Enviada el{" "}
                {formateaFecha(solicitud.fechaSolicitud, {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                })}
            </span>

            <div className="ipdj-panel-solic-acciones">
                <button
                    className="ipdj-btn-revision"
                    onClick={onEnRevision}
                    disabled={solicitud.estado === "en_revision"}
                >
                    En revisión
                </button>
                <button
                    className="ipdj-btn-aprobar"
                    onClick={onAceptar}
                    disabled={solicitud.estado === "aceptada"}
                >
                    Aceptar
                </button>
                <button
                    className="ipdj-btn-rechazar"
                    onClick={onRechazar}
                    disabled={solicitud.estado === "rechazada"}
                >
                    Rechazar
                </button>
            </div>
        </div>
    );
}
