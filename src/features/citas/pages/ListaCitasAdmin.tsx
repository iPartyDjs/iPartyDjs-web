import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useQueries } from "@tanstack/react-query";
import type { z } from "zod";
import {
  RescheduleAppointmentSchema,
  type EstadoCita,
  type RescheduleAppointmentInput,
  type SolicitudEventoDTO,
} from "@ipartydjs/shared";
import {
  useListAllCitas,
  useCancelCita,
  useCompleteCita,
  useRescheduleCita,
} from "@/features/citas/hooks/useCitas";
import { solicitudService } from "@/features/solicitudes/services/solicitud.service";
import AdminPageShell from "@/features/auth/admin/AdminPageShell";
import AgendarCita from "@/features/citas/pages/AgendarCita";
import "@/features/auth/admin/Admincitas.css";
import { zodResolver } from "@hookform/resolvers/zod";

const ESTADO_OPTIONS: EstadoCita[] = ["programada", "realizada", "cancelada"];

const ESTADO_LABEL: Record<EstadoCita, string> = {
  programada: "Programada",
  realizada: "Realizada",
  cancelada: "Cancelada",
};

const PILL_CLASS: Record<EstadoCita, string> = {
  programada: "cita-pill pendiente",
  realizada: "cita-pill completada",
  cancelada: "cita-pill cancelada",
};

const TIPO_EVENTO_LABEL: Record<string, string> = {
  boda: "Boda",
  xv_anos: "XV años",
  cumpleanos: "Cumpleaños",
  corporativo: "Corporativo",
  otro: "Evento",
};

const PAGE_SIZE = 6;

// Mismo patrón z.input/z.output que CitaForm: fecha_hora entra como Date
// vía valueAsDate, y RescheduleAppointmentSchema la valida con FutureDateSchema.
type ReagendarFormValues = z.input<typeof RescheduleAppointmentSchema>;

export default function ListaCitasAdmin() {
  const [estado, setEstado] = useState<EstadoCita | undefined>(undefined);
  const [desde, setDesde] = useState<string>("");
  const [hasta, setHasta] = useState<string>("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modalId, setModalId] = useState<string | null>(null);
  const [editModalId, setEditModalId] = useState<string | null>(null);
  const [isNewCitaModalOpen, setIsNewCitaModalOpen] = useState(false);
  const [observaciones, setObservaciones] = useState("");

  const {
    data: citas,
    isLoading,
    isError,
    error,
  } = useListAllCitas(desde || undefined, hasta || undefined, estado);

  const cancel = useCancelCita();
  const complete = useCompleteCita();
  const reschedule = useRescheduleCita();

  // Reset de página al cambiar cualquier filtro, para no quedar en una
  // página que ya no existe con el nuevo conjunto filtrado.
  useEffect(() => {
    setPage(1);
  }, [estado, desde, hasta, search]);

  const idsSolicitudUnicos = useMemo(() => {
    if (!citas) return [];
    return Array.from(new Set(citas.map((c) => c.id_solicitud)));
  }, [citas]);

  const solicitudQueries = useQueries({
    queries: idsSolicitudUnicos.map((id) => ({
      queryKey: ["solicitud", id],
      queryFn: () => solicitudService.getById(id),
      enabled: Boolean(id),
    })),
  });

  const solicitudPorId = useMemo(() => {
    const map = new Map<string, SolicitudEventoDTO>();
    idsSolicitudUnicos.forEach((id, index) => {
      const data = solicitudQueries[index]?.data;
      if (data) map.set(id, data);
    });
    return map;
  }, [idsSolicitudUnicos, solicitudQueries]);

  function solicitudLabel(id_solicitud: string): string {
    const s = solicitudPorId.get(id_solicitud);
    if (!s) return "Cargando...";
    const tipo = TIPO_EVENTO_LABEL[s.tipo_evento] ?? s.tipo_evento;
    return `${tipo} — ${s.fecha_deseada}`;
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q || !citas) return citas ?? [];
    return citas.filter((c) =>
      solicitudLabel(c.id_solicitud).toLowerCase().includes(q),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [citas, search, solicitudPorId]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = useMemo(
    () =>
      filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filtered, currentPage],
  );

  const selected = useMemo(() => {
    if (!citas || citas.length === 0) return undefined;
    return citas.find((c) => c.id_cita === selectedId) ?? citas[0];
  }, [citas, selectedId]);

  const modalCita = useMemo(() => {
    if (!citas || !modalId) return undefined;
    return citas.find((c) => c.id_cita === modalId);
  }, [citas, modalId]);

  const editCita = useMemo(() => {
    if (!citas || !editModalId) return undefined;
    return citas.find((c) => c.id_cita === editModalId);
  }, [citas, editModalId]);

  const modalSolicitud = modalCita
    ? solicitudPorId.get(modalCita.id_solicitud)
    : undefined;

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

  function openModal(id: string) {
    setSelectedId(id);
    setModalId(id);
    setObservaciones("");
  }

  function closeModal() {
    setModalId(null);
  }

  function openEditModal(id: string) {
    setModalId(null);
    setEditModalId(id);
  }

  function closeEditModal() {
    setEditModalId(null);
  }

  function openNewCitaModal() {
    setIsNewCitaModalOpen(true);
  }

  function closeNewCitaModal() {
    setIsNewCitaModalOpen(false);
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
        <button
          className="ipdj-btn-gold"
          onClick={openNewCitaModal}
          type="button"
        >
          + Nueva cita
        </button>
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
            placeholder="Buscar por tipo de evento..."
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
              <th>Solicitud</th>
              <th>Fecha y hora de la cita</th>
              <th>Estado</th>
              <th style={{ width: 90 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td
                  colSpan={4}
                  className="cell-muted"
                  style={{ textAlign: "center", padding: 24 }}
                >
                  Cargando...
                </td>
              </tr>
            )}
            {!isLoading &&
              paginated.map((c) => (
                <tr
                  key={c.id_cita}
                  className={c.id_cita === selected?.id_cita ? "selected" : ""}
                  onClick={() => select(c.id_cita)}
                >
                  <td className="u-name">{solicitudLabel(c.id_solicitud)}</td>
                  <td className="cell-muted">
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
                        onClick={(e) => {
                          e.stopPropagation();
                          openModal(c.id_cita);
                        }}
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
            {!isLoading && filtered.length === 0 && (
              <tr>
                <td
                  colSpan={4}
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
            Mostrando{" "}
            {paginated.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}
            {"–"}
            {(currentPage - 1) * PAGE_SIZE + paginated.length} de{" "}
            {filtered.length} citas
          </div>
          <div className="ipdj-pagination">
            <button
              className="ipdj-page-btn"
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              ‹
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                className={`ipdj-page-btn ${n === currentPage ? "active" : ""}`}
                onClick={() => setPage(n)}
              >
                {n}
              </button>
            ))}
            <button
              className="ipdj-page-btn"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <AdminPageShell navKey="citas" topbarTitle="Citas">
      <div className="mc-main">{mainContent}</div>

      {modalCita && (
        <div
          className="ms-modal-backdrop"
          role="dialog"
          aria-modal="true"
          onClick={closeModal}
        >
          <div className="ms-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ms-modal-header">
              <div>
                <h3>Detalle de cita</h3>
                <p
                  style={{
                    margin: "10px 0 0",
                    color: "#8a8578",
                    fontSize: "0.95rem",
                  }}
                >
                  Revisa la información y ejecuta acciones directamente desde
                  aquí.
                </p>
              </div>
              <button
                type="button"
                className="ms-modal-close"
                onClick={closeModal}
                aria-label="Cerrar modal"
              >
                ×
              </button>
            </div>

            <div className="ms-modal-content">
              <div className="ipdj-field">
                <label>Solicitud</label>
                <input
                  type="text"
                  value={
                    modalSolicitud
                      ? `${TIPO_EVENTO_LABEL[modalSolicitud.tipo_evento] ?? modalSolicitud.tipo_evento} — ${modalSolicitud.fecha_deseada}`
                      : "Cargando..."
                  }
                  disabled
                />
              </div>
              {modalSolicitud && (
                <div className="ipdj-field">
                  <label>Dirección de la solicitud</label>
                  <input
                    type="text"
                    value={modalSolicitud.direccion}
                    disabled
                  />
                </div>
              )}
              <div className="ipdj-field">
                <label>Fecha y hora de la cita</label>
                <input
                  type="text"
                  value={new Date(modalCita.fecha_hora).toLocaleString()}
                  disabled
                />
              </div>
              <div className="ipdj-field">
                <label>Enlace de videollamada</label>
                <input
                  type="text"
                  value={modalCita.enlace_videollamada}
                  disabled
                />
              </div>
              <div className="ipdj-field">
                <label>Estado</label>
                <span className={PILL_CLASS[modalCita.estado]}>
                  {ESTADO_LABEL[modalCita.estado]}
                </span>
              </div>

              {modalCita.observaciones && (
                <div className="ipdj-field">
                  <label>Observaciones</label>
                  <textarea rows={3} value={modalCita.observaciones} disabled />
                </div>
              )}

              {modalCita.estado === "programada" && (
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

                  <div
                    className="ipdj-actions-cell"
                    style={{ marginBottom: 12 }}
                  >
                    <button
                      className="ipdj-btn-save"
                      disabled={complete.isPending}
                      onClick={() => handleComplete("aceptado")}
                    >
                      Aceptar continuar
                    </button>
                    <button
                      className="ipdj-btn-save"
                      disabled={complete.isPending}
                      onClick={() => handleComplete("rechazado")}
                    >
                      Rechazar continuar
                    </button>
                  </div>
                  <button
                    className="ipdj-filter-btn"
                    style={{
                      marginTop: 8,
                      width: "100%",
                      justifyContent: "center",
                    }}
                    onClick={() => openEditModal(modalCita.id_cita)}
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
            </div>
          </div>
        </div>
      )}

      {editCita && (
        <ReagendarModal
          cita={editCita}
          solicitud={solicitudPorId.get(editCita.id_solicitud)}
          onClose={closeEditModal}
          onSubmit={(data) => {
            reschedule.mutate(
              { id: editCita.id_cita, data },
              { onSuccess: () => closeEditModal() },
            );
          }}
          isLoading={reschedule.isPending}
          errorMsg={
            reschedule.isError
              ? reschedule.error instanceof Error
                ? reschedule.error.message
                : "No se pudo reagendar la cita."
              : null
          }
        />
      )}

      {isNewCitaModalOpen && (
        <div
          className="ms-modal-backdrop"
          role="dialog"
          aria-modal="true"
          onClick={closeNewCitaModal}
        >
          <div className="ms-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ms-modal-header">
              <div>
                <h3>Agendar nueva cita</h3>
                <p
                  style={{
                    margin: "10px 0 0",
                    color: "#8a8578",
                    fontSize: "0.95rem",
                  }}
                >
                  Completa el formulario para crear una cita sin salir de la
                  lista.
                </p>
              </div>
              <button
                type="button"
                className="ms-modal-close"
                onClick={closeNewCitaModal}
                aria-label="Cerrar modal"
              >
                ×
              </button>
            </div>
            <div className="ms-modal-content">
              <AgendarCita hideTitle onSuccess={closeNewCitaModal} />
            </div>
          </div>
        </div>
      )}
    </AdminPageShell>
  );
}

/* ------------------------------------------------------------------ */
/* Modal de reagendamiento — mismos estilos ms-modal / ipdj-field que  */
/* el resto de la página, en vez de navegar a una ruta aparte.         */
/* ------------------------------------------------------------------ */
interface ReagendarModalProps {
  cita: {
    id_cita: string;
    id_solicitud: string;
    fecha_hora: string;
    enlace_videollamada: string;
  };
  solicitud?: SolicitudEventoDTO;
  onClose: () => void;
  onSubmit: (data: RescheduleAppointmentInput) => void;
  isLoading: boolean;
  errorMsg: string | null;
}

function ReagendarModal({
  cita,
  solicitud,
  onClose,
  onSubmit,
  isLoading,
  errorMsg,
}: ReagendarModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReagendarFormValues, unknown, RescheduleAppointmentInput>({
    resolver: zodResolver(RescheduleAppointmentSchema),
    defaultValues: {
      id_solicitud: cita.id_solicitud,
      fecha_hora: new Date(cita.fecha_hora),
      enlace_videollamada: cita.enlace_videollamada,
      observaciones: "",
    },
  });

  return (
    <div
      className="ms-modal-backdrop"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div className="ms-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ms-modal-header">
          <div>
            <h3>Reagendar cita</h3>
            <p
              style={{
                margin: "10px 0 0",
                color: "#8a8578",
                fontSize: "0.95rem",
              }}
            >
              Se creará una nueva cita y la actual quedará marcada como
              cancelada.
            </p>
          </div>
          <button
            type="button"
            className="ms-modal-close"
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            ×
          </button>
        </div>

        <form
          className="ms-modal-content"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          {solicitud && (
            <div className="ipdj-field">
              <label>Solicitud</label>
              <input
                type="text"
                value={`${TIPO_EVENTO_LABEL[solicitud.tipo_evento] ?? solicitud.tipo_evento} — ${solicitud.fecha_deseada}`}
                disabled
              />
            </div>
          )}

          <input type="hidden" {...register("id_solicitud")} />

          <div className="ipdj-field">
            <label htmlFor="reagendar-fecha_hora">Nueva fecha y hora</label>
            <input
              id="reagendar-fecha_hora"
              type="datetime-local"
              {...register("fecha_hora", { valueAsDate: true })}
            />
            {errors.fecha_hora && (
              <span className="field-error">{errors.fecha_hora.message}</span>
            )}
          </div>

          <div className="ipdj-field">
            <label htmlFor="reagendar-enlace">Enlace de videollamada</label>
            <input
              id="reagendar-enlace"
              type="url"
              {...register("enlace_videollamada")}
            />
            {errors.enlace_videollamada && (
              <span className="field-error">
                {errors.enlace_videollamada.message}
              </span>
            )}
          </div>

          <div className="ipdj-field">
            <label htmlFor="reagendar-observaciones">
              Observaciones (opcional)
            </label>
            <textarea
              id="reagendar-observaciones"
              rows={3}
              {...register("observaciones")}
            />
            {errors.observaciones && (
              <span className="field-error">
                {errors.observaciones.message}
              </span>
            )}
          </div>

          {errorMsg && <p className="error-text">{errorMsg}</p>}

          <div className="ipdj-actions-cell" style={{ marginTop: 12 }}>
            <button
              type="submit"
              className="ipdj-btn-save"
              disabled={isLoading}
            >
              {isLoading ? "Guardando..." : "Confirmar reagendamiento"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
