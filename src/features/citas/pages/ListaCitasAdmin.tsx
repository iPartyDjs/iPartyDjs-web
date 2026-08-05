import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { EstadoCita } from "@ipartydjs/shared";
import {
  useListAllCitas,
  useCancelCita,
  useCompleteCita,
} from "@/features/citas/hooks/useCitas";
import AdminPageShell from "@/features/auth/admin/AdminPageShell";

/* ------------------------------------------------------------------ */
/*  NOTA: el tipo `Cita` (de @ipartydjs/shared) solo se sabe con       */
/*  certeza que trae: id_cita, id_solicitud, fecha_hora, estado.       */
/*  Si el backend expone más campos (cliente, evento, dj, ubicacion,   */
/*  observaciones...) agrégalos aquí y en el panel lateral. No los     */
/*  invento porque no están confirmados en el componente original.     */
/* ------------------------------------------------------------------ */

const ESTADO_OPTIONS: EstadoCita[] = ["programada", "realizada", "cancelada"];

const ESTADO_LABEL: Record<EstadoCita, string> = {
  programada: "Programada",
  realizada: "Realizada",
  cancelada: "Cancelada",
};

// Reutiliza las clases badge-cita-* ya existentes en el proyecto original.
const PILL_CLASS: Record<EstadoCita, string> = {
  programada: "cita-pill pendiente",
  realizada: "cita-pill completada",
  cancelada: "cita-pill cancelada",
};

const PAGE_SIZE = 6;

export default function ListaCitasAdmin() {
  const [estado, setEstado] = useState<EstadoCita | undefined>(undefined);
  const [desde, setDesde] = useState<string>("");
  const [hasta, setHasta] = useState<string>("");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [observaciones, setObservaciones] = useState("");

  const {
    data: citas,
    isLoading,
    isError,
    error,
  } = useListAllCitas(desde || undefined, hasta || undefined, estado);

  const cancel = useCancelCita();
  const complete = useCompleteCita();
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q || !citas) return citas ?? [];
    return citas.filter(
      (c) =>
        c.id_cita.toLowerCase().includes(q) ||
        c.id_solicitud.toLowerCase().includes(q),
    );
  }, [citas, search]);

  const selected = useMemo(() => {
    if (!citas || citas.length === 0) return undefined;
    return citas.find((c) => c.id_cita === selectedId) ?? citas[0];
  }, [citas, selectedId]);

  const stats = useMemo(() => {
    const total = citas?.length ?? 0;
    const programadas =
      citas?.filter((c) => c.estado === "programada").length ?? 0;
    const realizadas =
      citas?.filter((c) => c.estado === "realizada").length ?? 0;
    const canceladas =
      citas?.filter((c) => c.estado === "cancelada").length ?? 0;
    return { total, programadas, realizadas, canceladas };
  }, [citas]);

  function select(id: string) {
    setSelectedId(id);
    setObservaciones("");
  }

  function handleCancel() {
    if (!selected) return;
    cancel.mutate({ id: selected.id_cita, data: { observaciones } });
    setObservaciones("");
  }

  function handleComplete(decision: "aceptado" | "rechazado") {
    if (!selected) return;
    complete.mutate({
      id: selected.id_cita,
      data: { decision, observaciones },
    });
    setObservaciones("");
  }

  const mainContent = (
    <>
      <div className="ipdj-main-header">
        <div>
          <h2>Citas</h2>
          <p>Administra y reprograma las citas agendadas con clientes.</p>
        </div>
        <button className="ipdj-btn-gold">+ Nueva cita</button>
      </div>

      <div className="ipdj-stats">
        <div className="ipdj-stat-card">
          <div className="num">{stats.total}</div>
          <div className="lbl">Total</div>
        </div>
        <div className="ipdj-stat-card gold">
          <div className="num">{stats.programadas}</div>
          <div className="lbl">Programadas</div>
        </div>
        <div className="ipdj-stat-card green">
          <div className="num">{stats.realizadas}</div>
          <div className="lbl">Realizadas</div>
        </div>
        <div className="ipdj-stat-card red">
          <div className="num">{stats.canceladas}</div>
          <div className="lbl">Canceladas</div>
        </div>
      </div>

      <div className="ipdj-filters">
        <div className="ipdj-search-box">
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            placeholder="Buscar por ID de cita o solicitud..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="ipdj-filter-select"
          value={estado ?? ""}
          onChange={(e) =>
            setEstado(
              e.target.value ? (e.target.value as EstadoCita) : undefined,
            )
          }
        >
          <option value="">Todos los estados</option>
          {ESTADO_OPTIONS.map((e) => (
            <option key={e} value={e}>
              {ESTADO_LABEL[e]}
            </option>
          ))}
        </select>
        <input
          type="date"
          className="ipdj-filter-select"
          value={desde}
          onChange={(e) => setDesde(e.target.value)}
          title="Desde"
        />
        <input
          type="date"
          className="ipdj-filter-select"
          value={hasta}
          onChange={(e) => setHasta(e.target.value)}
          title="Hasta"
        />
      </div>

      {isError && (
        <p className="error-text">
          {error instanceof Error ? error.message : "Error al cargar citas"}
        </p>
      )}

      <div className="ipdj-table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID cita</th>
              <th>Solicitud</th>
              <th>Fecha y hora</th>
              <th>Estado</th>
              <th style={{ width: 90 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td
                  colSpan={5}
                  className="cell-muted"
                  style={{ textAlign: "center", padding: 24 }}
                >
                  Cargando...
                </td>
              </tr>
            )}
            {!isLoading &&
              filtered?.slice(0, PAGE_SIZE).map((c) => (
                <tr
                  key={c.id_cita}
                  className={c.id_cita === selected?.id_cita ? "selected" : ""}
                  onClick={() => select(c.id_cita)}
                >
                  <td className="u-name">{c.id_cita}</td>
                  <td className="cell-muted">{c.id_solicitud}</td>
                  <td className="u-name">
                    {new Date(c.fecha_hora).toLocaleString()}
                  </td>
                  <td>
                    <span className={PILL_CLASS[c.estado]}>
                      {ESTADO_LABEL[c.estado]}
                    </span>
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div className="ipdj-actions-cell">
                      <button
                        className="ipdj-act-btn"
                        title="Ver detalle"
                        onClick={() => navigate(`/citas/${c.id_cita}`)}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            {!isLoading && filtered?.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="cell-muted"
                  style={{ textAlign: "center", padding: 24 }}
                >
                  {citas?.length === 0
                    ? "No hay citas registradas."
                    : `No se encontraron citas para "${search}".`}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="ipdj-table-footer">
          <div className="count">
            Mostrando {Math.min(PAGE_SIZE, filtered?.length ?? 0)} de{" "}
            {citas?.length ?? 0} citas
          </div>
          <div className="ipdj-pagination">
            <button className="ipdj-page-btn">‹</button>
            <button className="ipdj-page-btn active">1</button>
            <button className="ipdj-page-btn">2</button>
            <button className="ipdj-page-btn">›</button>
          </div>
        </div>
      </div>
    </>
  );

  const sidePanel = !selected ? (
    <p className="cell-muted">Selecciona una cita para ver el detalle.</p>
  ) : (
    <>
      <h3>Detalle de cita</h3>

      <div className="ipdj-field">
        <label>ID de cita</label>
        <input type="text" value={selected.id_cita} disabled />
      </div>
      <div className="ipdj-field">
        <label>ID de solicitud</label>
        <input type="text" value={selected.id_solicitud} disabled />
      </div>
      <div className="ipdj-field">
        <label>Fecha y hora</label>
        <input
          type="text"
          value={new Date(selected.fecha_hora).toLocaleString()}
          disabled
        />
      </div>
      <div className="ipdj-field">
        <label>Estado</label>
        <span className={PILL_CLASS[selected.estado]}>
          {ESTADO_LABEL[selected.estado]}
        </span>
      </div>

      {/* TODO: si el tipo Cita real incluye cliente/evento/dj/ubicacion,
          agregar sus campos aquí siguiendo el mismo patrón. */}

      {selected.estado === "programada" && (
        <>
          <div className="ipdj-field">
            <label>Observaciones (opcional)</label>
            <textarea
              rows={3}
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Añade una nota para esta acción..."
            />
          </div>

          <button
            className="ipdj-btn-save"
            disabled={complete.isPending}
            onClick={() => handleComplete("aceptado")}
          >
            Aceptar continuar
          </button>
          <button
            className="ipdj-btn-save"
            style={{ marginTop: 8 }}
            disabled={complete.isPending}
            onClick={() => handleComplete("rechazado")}
          >
            Rechazar continuar
          </button>
          <button
            className="ipdj-filter-btn"
            style={{ marginTop: 8, width: "100%", justifyContent: "center" }}
            onClick={() => navigate(`/citas/${selected.id_cita}/reagendar`)}
          >
            Reagendar
          </button>

          <div className="ipdj-danger-zone">
            <div className="dz-title">Zona de riesgo</div>
            <button
              className="ipdj-btn-danger"
              disabled={cancel.isPending}
              onClick={handleCancel}
            >
              Cancelar cita
            </button>
          </div>
        </>
      )}

      <button
        className="ipdj-filter-btn"
        style={{ marginTop: 12, width: "100%", justifyContent: "center" }}
        onClick={() => navigate(`/citas/${selected.id_cita}`)}
      >
        Ver detalle completo
      </button>
    </>
  );

  return (
    <AdminPageShell topbarTitle="Citas" sidePanel={sidePanel}>
      {mainContent}
    </AdminPageShell>
  );
}
