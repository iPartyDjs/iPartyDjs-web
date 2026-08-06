import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { SolicitudEventoDTO, EstadoSolicitud } from "@ipartydjs/shared";
import {
  listSolicitudes,
  approveSolicitud,
  rejectSolicitud,
  completeSolicitud,
} from "@/core/api/Solicitudapi";
import AdminPageShell from "./AdminPageShell";
import "./Adminsolicitudes.css";

/* ------------------------------------------------------------------ */
/* Constantes                                                          */
/* ------------------------------------------------------------------ */

const PAGE_SIZE = 10;

const ESTADO_LABEL: Record<EstadoSolicitud, string> = {
  pendiente: "Pendiente",
  en_proceso: "En proceso",
  completada: "Completada",
  rechazada: "Rechazada",
};

const formateaFecha = (iso: string, opts?: Intl.DateTimeFormatOptions) =>
  new Date(iso).toLocaleDateString(
    "es-MX",
    opts ?? { day: "2-digit", month: "short", year: "numeric" },
  );

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Ocurrió un error. Intenta de nuevo.";
}

function nombreCompleto(s: SolicitudEventoDTO): string {
  const nombre = [s.nombre_cliente, s.apellido_cliente]
    .filter(Boolean)
    .join(" ");
  return nombre || `Cliente ${s.id_cliente.slice(0, 8)}…`;
}

/* ------------------------------------------------------------------ */
/* Componente                                                          */
/* ------------------------------------------------------------------ */

export default function AdminSolicitudes() {
  const queryClient = useQueryClient();

  const [filtroEstado, setFiltroEstado] = useState<EstadoSolicitud | "todas">(
    "todas",
  );
  const [busqueda, setBusqueda] = useState("");
  const [page, setPage] = useState(1);
  const [seleccionId, setSeleccionId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [confirmingReject, setConfirmingReject] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 3000);
  };

  /* -------- Datos -------- */
  // Query de la tabla: respeta el filtro de estado + paginación real del backend.
  const solicitudesQuery = useQuery({
    queryKey: ["solicitudes", filtroEstado, page],
    queryFn: () =>
      listSolicitudes(
        filtroEstado === "todas" ? {} : { estado: filtroEstado },
        { page, limit: PAGE_SIZE },
      ),
  });

  // Query aparte, siempre sin filtro, exclusiva para las tarjetas de stats —
  // mismo patrón que ya usamos en Fotografías para que no se vayan a 0 al filtrar.
  const statsQuery = useQuery({
    queryKey: ["solicitudes", "stats"],
    queryFn: () => listSolicitudes({}, { page: 1, limit: 100 }),
  });

  const solicitudes = useMemo(
    () => solicitudesQuery.data?.data ?? [],
    [solicitudesQuery.data],
  );
  const total = solicitudesQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const solicitudesFiltradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return solicitudes;
    // No hay búsqueda de texto en el backend (SolicitudFiltersSchema solo
    // acepta `estado`) — se filtra en el cliente sobre la página actual.
    return solicitudes.filter((s) => {
      return (
        s.tipo_evento.toLowerCase().includes(q) ||
        s.direccion.toLowerCase().includes(q) ||
        nombreCompleto(s).toLowerCase().includes(q) ||
        (s.email_cliente ?? "").toLowerCase().includes(q)
      );
    });
  }, [solicitudes, busqueda]);

  const stats = useMemo(() => {
    const todas = statsQuery.data?.data ?? [];
    return {
      total: statsQuery.data?.total ?? 0,
      pendientes: todas.filter((s) => s.estado === "pendiente").length,
      enProceso: todas.filter((s) => s.estado === "en_proceso").length,
      completadas: todas.filter((s) => s.estado === "completada").length,
      rechazadas: todas.filter((s) => s.estado === "rechazada").length,
    };
  }, [statsQuery.data]);

  const seleccionada =
    solicitudes.find((s) => s.id_solicitud === seleccionId) ?? null;

  /* -------- Mutaciones -------- */
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["solicitudes"] });

  const approveMutation = useMutation({
    mutationFn: (id: string) => approveSolicitud(id),
    onSuccess: () => {
      invalidate();
      showToast("Solicitud aprobada — ahora está en proceso.");
    },
    onError: (error) => showToast(getErrorMessage(error)),
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => rejectSolicitud(id, {}),
    onSuccess: () => {
      invalidate();
      setConfirmingReject(null);
      showToast("Solicitud rechazada.");
    },
    onError: (error) => showToast(getErrorMessage(error)),
  });

  const completeMutation = useMutation({
    mutationFn: (id: string) => completeSolicitud(id),
    onSuccess: () => {
      invalidate();
      showToast("Solicitud marcada como completada.");
    },
    onError: (error) => showToast(getErrorMessage(error)),
  });

  const handleReject = (id: string) => {
    if (confirmingReject !== id) {
      setConfirmingReject(id);
      return;
    }
    rejectMutation.mutate(id);
  };

  return (
    <AdminPageShell
      topbarTitle="Solicitudes"
      navKey="solicitudes"
      sidePanel={
        seleccionada ? (
          <PanelDetalleSolicitud
            solicitud={seleccionada}
            onAprobar={() => approveMutation.mutate(seleccionada.id_solicitud)}
            onRechazar={() => handleReject(seleccionada.id_solicitud)}
            onCompletar={() =>
              completeMutation.mutate(seleccionada.id_solicitud)
            }
            confirmandoRechazo={confirmingReject === seleccionada.id_solicitud}
            cargando={
              approveMutation.isPending ||
              rejectMutation.isPending ||
              completeMutation.isPending
            }
            onCerrar={() => setSeleccionId(null)}
          />
        ) : (
          <p
            style={{
              color: "#71717a",
              fontSize: "13px",
              textAlign: "center",
              marginTop: "40px",
            }}
          >
            Selecciona una solicitud para ver su detalle.
          </p>
        )
      }
    >
      {/* Estadísticas */}
      <div className="ipdj-solic-stats">
        <StatCard label="Total de solicitudes" valor={stats.total} />
        <StatCard label="Pendientes" valor={stats.pendientes} destacado />
        <StatCard label="En proceso" valor={stats.enProceso} />
        <StatCard label="Completadas" valor={stats.completadas} />
        <StatCard label="Rechazadas" valor={stats.rechazadas} />
      </div>

      {/* Filtros */}
      <div className="ipdj-solic-filtros">
        <input
          type="text"
          className="ipdj-solic-buscador"
          placeholder="Buscar por cliente, tipo de evento o dirección..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <div className="ipdj-solic-chip-group">
          {(
            [
              "todas",
              "pendiente",
              "en_proceso",
              "completada",
              "rechazada",
            ] as const
          ).map((opcion) => (
            <button
              key={opcion}
              className={
                "ipdj-solic-chip" + (filtroEstado === opcion ? " active" : "")
              }
              onClick={() => {
                setFiltroEstado(opcion);
                setPage(1);
              }}
            >
              {opcion === "todas" ? "Todas" : ESTADO_LABEL[opcion]}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla */}
      <div className="ipdj-solic-tabla-wrap">
        {solicitudesQuery.isLoading ? (
          <p
            style={{
              color: "#a1a1aa",
              padding: "24px",
              textAlign: "center",
            }}
          >
            Cargando solicitudes...
          </p>
        ) : solicitudesQuery.isError ? (
          <p
            style={{
              color: "#fca5a5",
              padding: "24px",
              textAlign: "center",
            }}
          >
            No pudimos cargar las solicitudes.{" "}
            {getErrorMessage(solicitudesQuery.error)}
          </p>
        ) : (
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
                  <td colSpan={5} className="ipdj-solic-vacio">
                    No hay solicitudes que coincidan con el filtro.
                  </td>
                </tr>
              )}
              {solicitudesFiltradas.map((s) => (
                <tr
                  key={s.id_solicitud}
                  className={
                    s.id_solicitud === seleccionId ? "seleccionada" : ""
                  }
                  onClick={() => {
                    setSeleccionId(s.id_solicitud);
                    setConfirmingReject(null);
                  }}
                >
                  <td>
                    <div className="ipdj-solic-cliente-cell">
                      <span className="ipdj-solic-avatar">
                        {nombreCompleto(s).charAt(0)}
                      </span>
                      <div>
                        <div className="ipdj-solic-cliente-nombre">
                          {nombreCompleto(s)}
                        </div>
                        <div className="ipdj-solic-cliente-email">
                          {s.email_cliente ?? "—"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>{s.tipo_evento}</td>
                  <td>{formateaFecha(s.fecha_deseada)}</td>
                  <td>{formateaFecha(s.created_at)}</td>
                  <td>
                    <EstadoBadge estado={s.estado} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!solicitudesQuery.isLoading && !solicitudesQuery.isError && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 4px",
              fontSize: "12px",
              color: "#a1a1aa",
            }}
          >
            <span>
              Mostrando {solicitudes.length} de {total} solicitudes
            </span>
            <div style={{ display: "flex", gap: "6px" }}>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "8px",
                    border: "1px solid #3f3f46",
                    background: page === i + 1 ? "#d4af37" : "transparent",
                    color: page === i + 1 ? "#000" : "#a1a1aa",
                    fontWeight: page === i + 1 ? 700 : 400,
                    cursor: "pointer",
                  }}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            background: "#1e1e1e",
            border: "1px solid rgba(201,168,76,0.3)",
            color: "#fff",
            padding: "12px 20px",
            borderRadius: "10px",
            fontSize: "13px",
            zIndex: 1100,
          }}
        >
          {toast}
        </div>
      )}
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
  onAprobar,
  onRechazar,
  onCompletar,
  confirmandoRechazo,
  cargando,
  onCerrar,
}: {
  solicitud: SolicitudEventoDTO;
  onAprobar: () => void;
  onRechazar: () => void;
  onCompletar: () => void;
  confirmandoRechazo: boolean;
  cargando: boolean;
  onCerrar: () => void;
}) {
  const nombre = nombreCompleto(solicitud);

  return (
    <div className="ipdj-panel-solic">
      <div className="ipdj-panel-solic-header">
        <h2>Detalle de solicitud</h2>
        <button className="ipdj-panel-cerrar" onClick={onCerrar}>
          ×
        </button>
      </div>

      <div className="ipdj-panel-solic-cliente">
        <div className="ipdj-solic-avatar grande">{nombre.charAt(0)}</div>
        <div>
          <h3>{nombre}</h3>
          <span className="ipdj-panel-solic-contacto">
            {solicitud.email_cliente ?? "Correo no disponible"}
          </span>
        </div>
      </div>

      <EstadoBadge estado={solicitud.estado} />

      <dl className="ipdj-panel-solic-datos">
        <div>
          <dt>Tipo de evento</dt>
          <dd>{solicitud.tipo_evento}</dd>
        </div>
        <div>
          <dt>Fecha deseada</dt>
          <dd>
            {formateaFecha(solicitud.fecha_deseada, {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </dd>
        </div>
        <div>
          <dt>Dirección</dt>
          <dd>{solicitud.direccion}</dd>
        </div>
      </dl>

      <span className="ipdj-panel-solic-fecha">
        Enviada el{" "}
        {formateaFecha(solicitud.created_at, {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })}
      </span>

      {/* Acciones según el estado real del ciclo de vida:
          pendiente -> (aprobar) en_proceso -> (completar) completada
          pendiente -> (rechazar) rechazada
          completada/rechazada son terminales, sin acciones. */}
      <div className="ipdj-panel-solic-acciones">
        {solicitud.estado === "pendiente" && (
          <>
            <button
              className="ipdj-btn-aprobar"
              onClick={onAprobar}
              disabled={cargando}
            >
              Aprobar
            </button>
            <button
              className="ipdj-btn-rechazar"
              onClick={onRechazar}
              disabled={cargando}
            >
              {confirmandoRechazo ? "¿Confirmar? Toca de nuevo" : "Rechazar"}
            </button>
          </>
        )}
        {solicitud.estado === "en_proceso" && (
          <button
            className="ipdj-btn-aprobar"
            onClick={onCompletar}
            disabled={cargando}
          >
            Completar
          </button>
        )}
        {(solicitud.estado === "completada" ||
          solicitud.estado === "rechazada") && (
          <p
            style={{
              color: "#71717a",
              fontSize: "12px",
              textAlign: "center",
            }}
          >
            Esta solicitud ya está en un estado final.
          </p>
        )}
      </div>
    </div>
  );
}
