import { useEffect, useMemo, useState } from "react";
import AdminPageShell from "./AdminPageShell";
import { eventoService } from "../../eventos/services/evento.service";
import { solicitudService } from "@/features/solicitudes/services/solicitud.service";
import type { EventoDTO, SolicitudEventoDTO } from "@ipartydjs/shared";
import "./Admineventos.css";

/* ------------------------------------------------------------------ */
/*  Constants (Basadas estrictamente en el backend)                     */
/* ------------------------------------------------------------------ */

const CATEGORIES: EventoDTO["tipo_evento"][] = [
  "boda",
  "xv_anos",
  "corporativo",
  "cumpleanos",
  "otro",
];

const CATEGORY_LABELS: Record<EventoDTO["tipo_evento"], string> = {
  boda: "Boda",
  xv_anos: "XV Años",
  corporativo: "Corporativo",
  cumpleanos: "Cumpleaños",
  otro: "Otro",
};

const STATUS_OPTIONS: EventoDTO["estado"][] = [
  "confirmado",
  "en_preparacion",
  "realizado",
];

const STATUS_LABELS: Record<EventoDTO["estado"], string> = {
  confirmado: "Confirmado",
  en_preparacion: "En preparación",
  realizado: "Realizado",
};

const PAGE_SIZE = 6;

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

export default function AdminEventos() {
  const [events, setEvents] = useState<EventoDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string>("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<
    "Todas" | EventoDTO["tipo_evento"]
  >("Todas");
  const [draft, setDraft] = useState<Partial<EventoDTO>>({});

  // Estado del modal "Nuevo evento"
  const [showNewEventModal, setShowNewEventModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    id_solicitud: "",
    fecha_hora: "",
    direccion: "",
    tipo_evento: CATEGORIES[0] as EventoDTO["tipo_evento"],
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Solicitudes elegibles para convertirse en evento: estado "completada"
  // (cita concluida con aceptación) y sin evento creado todavía.
  const [solicitudesDisponibles, setSolicitudesDisponibles] = useState<
    SolicitudEventoDTO[]
  >([]);
  const [loadingSolicitudes, setLoadingSolicitudes] = useState(false);
  const [errorSolicitudes, setErrorSolicitudes] = useState<string | null>(null);

  // Cargar eventos reales desde el backend al montar el componente de forma segura
  useEffect(() => {
    let isMounted = true;

    // Misma extracción robusta que usamos para solicitudes: no asumimos
    // que la propiedad se llama ".items", probamos varios nombres comunes.
    function extractEventItems(result: unknown): EventoDTO[] {
      if (Array.isArray(result)) return result;
      if (result && typeof result === "object") {
        const obj = result as Record<string, unknown>;
        const candidate = obj.items ?? obj.data ?? obj.results ?? obj.eventos;
        if (Array.isArray(candidate)) return candidate as EventoDTO[];
      }
      return [];
    }

    async function fetchEvents() {
      try {
        setLoading(true);
        setError(null);
        const result = await eventoService.listAll();
        const items = extractEventItems(result);

        if (isMounted) {
          setEvents(items);
          if (items.length > 0 && !selectedId) {
            setSelectedId(items[0].id_evento);
          }
        }
      } catch (err: unknown) {
        if (isMounted) {
          const errorObj = err as { message?: string };
          setError(errorObj.message || "Error al cargar los eventos");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchEvents();

    return () => {
      isMounted = false;
    };
  }, [selectedId]);

  // Cargar solicitudes elegibles cada vez que se abre el modal de "Nuevo evento".
  // Solo se consideran elegibles las solicitudes en estado "completada"
  // (cita concluida con aceptación) que aún no tengan un evento creado.
  // Las que están "en_proceso" todavía siguen en negociación y no están
  // listas para agendarse como evento.
  useEffect(() => {
    if (!showNewEventModal) return;

    let isMounted = true;

    // Extrae el array de resultados sin importar cómo se llame la propiedad
    // dentro del objeto paginado (items, data, results, etc.), para no
    // depender de una forma exacta de PaginatedResult que aún no confirmamos.
    function extractItems(result: unknown): SolicitudEventoDTO[] {
      if (Array.isArray(result)) return result;
      if (result && typeof result === "object") {
        const obj = result as Record<string, unknown>;
        const candidate =
          obj.items ?? obj.data ?? obj.results ?? obj.solicitudes;
        if (Array.isArray(candidate)) return candidate as SolicitudEventoDTO[];
      }
      return [];
    }

    async function fetchSolicitudes() {
      try {
        setLoadingSolicitudes(true);
        setErrorSolicitudes(null);

        const result = await solicitudService.listAll("completada", 1, 100);
        const items = extractItems(result);

        // Excluye solicitudes que ya tienen un evento creado.
        const idsConEvento = new Set(events.map((e) => e.id_solicitud));
        const disponibles = items.filter(
          (s) => !idsConEvento.has(s.id_solicitud),
        );

        if (isMounted) {
          setSolicitudesDisponibles(disponibles);
        }
      } catch (err: unknown) {
        if (isMounted) {
          const errorObj = err as { message?: string };
          setErrorSolicitudes(
            errorObj.message || "Error al cargar las solicitudes",
          );
        }
      } finally {
        if (isMounted) {
          setLoadingSolicitudes(false);
        }
      }
    }

    fetchSolicitudes();

    return () => {
      isMounted = false;
    };
  }, [showNewEventModal, events]);

  const selected = useMemo(
    () => events.find((e) => e.id_evento === selectedId) ?? events[0],
    [events, selectedId],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return events.filter((e) => {
      const address = e.direccion ?? "";
      const category = e.tipo_evento ?? "";
      const matchesQuery =
        !q ||
        address.toLowerCase().includes(q) ||
        category.toLowerCase().includes(q);
      const matchesCategory =
        categoryFilter === "Todas" || category === categoryFilter;
      return matchesQuery && matchesCategory;
    });
  }, [events, search, categoryFilter]);

  const stats = useMemo(() => {
    const total = events.length;
    const confirmados = events.filter((e) => e.estado === "confirmado").length;
    const enPreparacion = events.filter(
      (e) => e.estado === "en_preparacion",
    ).length;
    const realizados = events.filter((e) => e.estado === "realizado").length;
    return { total, confirmados, enPreparacion, realizados };
  }, [events]);

  function select(e: EventoDTO) {
    setSelectedId(e.id_evento);
    setDraft({});
  }

  function handleDraftChange(key: string, value: unknown) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  async function saveChanges() {
    if (!selected) return;
    const id = selected.id_evento;
    if (!id) return;

    try {
      const updated = await eventoService.update(id, draft as unknown);
      setEvents((prev) =>
        prev.map((e) => (e.id_evento === id ? { ...e, ...updated } : e)),
      );
      setDraft({});
      alert("Cambios guardados con éxito");
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      alert(errorObj.message || "Error al guardar los cambios");
    }
  }

  async function markAsRealizado() {
    if (!selected) return;
    const id = selected.id_evento;
    if (!id) return;

    if (!confirm("¿Estás seguro de realizar esta acción?")) return;

    try {
      // El estado no se cambia con el PATCH genérico /eventos/:id (ese
      // endpoint solo acepta fecha_hora, direccion, tipo_evento). La
      // transición a "realizado" tiene su propio endpoint dedicado:
      // PATCH /eventos/:id/completar, sin body.
      const updated = await eventoService.complete(id);
      setEvents((prev) =>
        prev.map((e) => (e.id_evento === id ? { ...e, ...updated } : e)),
      );
      setDraft({});
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      alert(errorObj.message || "Error al actualizar el evento");
    }
  }

  function openNewEventModal() {
    setNewEvent({
      id_solicitud: "",
      fecha_hora: "",
      direccion: "",
      tipo_evento: CATEGORIES[0],
    });
    setCreateError(null);
    setShowNewEventModal(true);
  }

  function selectSolicitud(s: SolicitudEventoDTO) {
    setNewEvent((n) => ({
      ...n,
      id_solicitud: s.id_solicitud,
      // Se precargan como ayuda; el admin puede seguir editándolos abajo.
      direccion: s.direccion ?? n.direccion,
      tipo_evento: (s.tipo_evento as EventoDTO["tipo_evento"]) ?? n.tipo_evento,
    }));
  }

  async function handleCreateEvent() {
    if (creating) return; // Evita doble envío (doble clic) que causaba 409 Conflict.

    setCreateError(null);

    if (!newEvent.id_solicitud) {
      setCreateError("Selecciona una solicitud de la tabla");
      return;
    }
    if (!newEvent.fecha_hora || !newEvent.direccion) {
      setCreateError("Completa todos los campos obligatorios");
      return;
    }

    try {
      setCreating(true);
      const created = await eventoService.crear({
        id_solicitud: newEvent.id_solicitud,
        fecha_hora: new Date(newEvent.fecha_hora),
        direccion: newEvent.direccion,
        tipo_evento: newEvent.tipo_evento,
      });
      setEvents((prev) => [created, ...prev]);
      setSelectedId(created.id_evento);
      setShowNewEventModal(false);
      setNewEvent({
        id_solicitud: "",
        fecha_hora: "",
        direccion: "",
        tipo_evento: CATEGORIES[0],
      });
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      setCreateError(errorObj.message || "Error al crear el evento");
    } finally {
      setCreating(false);
    }
  }

  const displayFechaHora = draft.fecha_hora ?? selected?.fecha_hora ?? "";
  const displayDireccion = draft.direccion ?? selected?.direccion ?? "";
  const displayCategory =
    draft.tipo_evento ?? selected?.tipo_evento ?? CATEGORIES[0];
  const displayEstado = draft.estado ?? selected?.estado ?? STATUS_OPTIONS[0];

  const mainContent = (
    <>
      <div className="ipdj-main-header">
        <div>
          <h2>Eventos</h2>
          <p>Administra los eventos registrados en la plataforma.</p>
        </div>
        <button className="ipdj-btn-gold" onClick={openNewEventModal}>
          + Nuevo evento
        </button>
      </div>

      {error && (
        <div
          className="ipdj-error-banner"
          style={{ color: "red", marginBottom: "1rem" }}
        >
          {error}
        </div>
      )}

      <div className="ipdj-stats">
        <div className="ipdj-stat-card">
          <div className="num">{stats.total}</div>
          <div className="lbl">Total</div>
        </div>
        <div className="ipdj-stat-card green">
          <div className="num">{stats.confirmados}</div>
          <div className="lbl">Confirmados</div>
        </div>
        <div className="ipdj-stat-card gold">
          <div className="num">{stats.enPreparacion}</div>
          <div className="lbl">En preparación</div>
        </div>
        <div
          className="ipdj-stat-card blue"
          style={{
            background: "#1e293b",
            color: "#fff",
            padding: "1rem",
            borderRadius: "8px",
          }}
        >
          <div className="num">{stats.realizados}</div>
          <div className="lbl">Realizados</div>
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
            placeholder="Buscar por dirección o categoría..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="ipdj-filter-select"
          value={categoryFilter}
          onChange={(e) =>
            setCategoryFilter(
              e.target.value as "Todas" | EventoDTO["tipo_evento"],
            )
          }
        >
          <option value="Todas">Todas las categorías</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_LABELS[c]}
            </option>
          ))}
        </select>
        <button className="ipdj-filter-btn">
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Exportar
        </button>
      </div>

      {loading ? (
        <div className="ipdj-loading">Cargando eventos...</div>
      ) : (
        <div className="ipdj-event-grid">
          {filtered.slice(0, PAGE_SIZE).map((e) => {
            const id = e.id_evento;
            const fechaHora = e.fecha_hora ?? "";
            const direccion = e.direccion ?? "Sin dirección";
            const categoryKey = e.tipo_evento ?? "otro";
            const categoryName = CATEGORY_LABELS[categoryKey] ?? categoryKey;
            const statusKey = e.estado ?? "confirmado";
            const statusName = STATUS_LABELS[statusKey] ?? statusKey;

            const fechaFormateada = fechaHora
              ? new Date(fechaHora).toLocaleString("es-MX", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Sin fecha";

            return (
              <div
                key={id}
                className={`ipdj-event-card${id === selected?.id_evento ? " selected" : ""}`}
                onClick={() => select(e)}
                style={{ padding: "1rem" }}
              >
                {/* Sin placeholder de imagen: EventoDTO no tiene campo de
                    foto, así que solo mostramos badges + datos reales. */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "0.75rem",
                  }}
                >
                  <span className="ipdj-event-category">{categoryName}</span>
                  <span
                    className="ipdj-event-inactive-badge"
                    style={{
                      background:
                        statusKey === "confirmado"
                          ? "#10b981"
                          : statusKey === "en_preparacion"
                            ? "#f59e0b"
                            : "#6366f1",
                    }}
                  >
                    {statusName}
                  </span>
                </div>
                <div className="ipdj-event-info">
                  <div className="event-title-row">
                    <div className="event-title">{direccion}</div>
                  </div>
                  <div className="event-desc">
                    Fecha y hora: {fechaFormateada}
                  </div>
                  <div className="event-meta">
                    <span className="event-duration">
                      Solicitud: {e.id_solicitud}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="ipdj-event-empty">
              No se encontraron eventos para “{search}”.
            </div>
          )}
        </div>
      )}

      <div className="ipdj-table-footer">
        <div className="count">
          Mostrando {Math.min(PAGE_SIZE, filtered.length)} de {events.length}{" "}
          eventos
        </div>
        <div className="ipdj-pagination">
          <button className="ipdj-page-btn">‹</button>
          <button className="ipdj-page-btn active">1</button>
          <button className="ipdj-page-btn">›</button>
        </div>
      </div>
    </>
  );

  const sidePanel = selected ? (
    <>
      <h3>Editar Evento</h3>

      <div className="ipdj-field">
        <label>Fecha y Hora</label>
        <input
          type="text"
          value={displayFechaHora as string}
          onChange={(e) => handleDraftChange("fecha_hora", e.target.value)}
        />
      </div>
      <div className="ipdj-field">
        <label>Dirección</label>
        <input
          type="text"
          value={displayDireccion}
          onChange={(e) => handleDraftChange("direccion", e.target.value)}
        />
      </div>
      <div className="ipdj-field">
        <label>Tipo de Evento</label>
        <select
          value={displayCategory}
          onChange={(e) =>
            handleDraftChange(
              "tipo_evento",
              e.target.value as EventoDTO["tipo_evento"],
            )
          }
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_LABELS[c]}
            </option>
          ))}
        </select>
      </div>
      <div className="ipdj-field">
        <label>Estado del Evento</label>
        <select
          value={displayEstado}
          onChange={(e) =>
            handleDraftChange("estado", e.target.value as EventoDTO["estado"])
          }
        >
          {STATUS_OPTIONS.map((st) => (
            <option key={st} value={st}>
              {STATUS_LABELS[st]}
            </option>
          ))}
        </select>
      </div>

      <button className="ipdj-btn-save" onClick={saveChanges}>
        Guardar cambios
      </button>

      <div className="ipdj-danger-zone">
        <div className="dz-title">Zona de riesgo</div>
        <button className="ipdj-btn-danger" onClick={markAsRealizado}>
          Marcar como realizado
        </button>
      </div>
    </>
  ) : (
    <div>Selecciona un evento</div>
  );

  const newEventModal = showNewEventModal ? (
    <div
      className="ipdj-modal-overlay"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={() => setShowNewEventModal(false)}
    >
      <div
        className="ipdj-modal"
        style={{
          background: "#1e293b",
          padding: "1.5rem",
          borderRadius: "8px",
          width: "560px",
          maxWidth: "92vw",
          maxHeight: "88vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ marginTop: 0, color: "#fff" }}>Nuevo evento</h3>

        {createError && (
          <div style={{ color: "red", marginBottom: "1rem" }}>
            {createError}
          </div>
        )}

        {/* --------------------------------------------------------- */}
        {/* Tabla de solicitudes elegibles (completadas, sin evento)  */}
        {/* --------------------------------------------------------- */}
        <div className="ipdj-field">
          <label>Solicitud</label>

          {loadingSolicitudes && (
            <div className="cell-muted" style={{ padding: "0.5rem 0" }}>
              Cargando solicitudes...
            </div>
          )}

          {errorSolicitudes && (
            <div style={{ color: "red", padding: "0.5rem 0" }}>
              {errorSolicitudes}
            </div>
          )}

          {!loadingSolicitudes &&
            !errorSolicitudes &&
            solicitudesDisponibles.length === 0 && (
              <div className="cell-muted" style={{ padding: "0.5rem 0" }}>
                No hay solicitudes completadas pendientes de convertirse en
                evento.
              </div>
            )}

          {!loadingSolicitudes && solicitudesDisponibles.length > 0 && (
            <div
              style={{
                maxHeight: "220px",
                overflowY: "auto",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "6px",
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", padding: "0.5rem" }}>
                      Tipo
                    </th>
                    <th style={{ textAlign: "left", padding: "0.5rem" }}>
                      Fecha deseada
                    </th>
                    <th style={{ textAlign: "left", padding: "0.5rem" }}>
                      Dirección
                    </th>
                    <th style={{ padding: "0.5rem" }}></th>
                  </tr>
                </thead>
                <tbody>
                  {solicitudesDisponibles.map((s) => {
                    const isSelected = s.id_solicitud === newEvent.id_solicitud;
                    const tipoLabel =
                      CATEGORY_LABELS[
                        s.tipo_evento as EventoDTO["tipo_evento"]
                      ] ?? s.tipo_evento;

                    return (
                      <tr
                        key={s.id_solicitud}
                        onClick={() => selectSolicitud(s)}
                        style={{
                          cursor: "pointer",
                          background: isSelected
                            ? "rgba(201,168,76,0.18)"
                            : "transparent",
                        }}
                      >
                        <td style={{ padding: "0.5rem" }}>{tipoLabel}</td>
                        <td
                          style={{ padding: "0.5rem" }}
                          className="cell-muted"
                        >
                          {s.fecha_deseada}
                        </td>
                        <td
                          style={{ padding: "0.5rem" }}
                          className="cell-muted"
                        >
                          {s.direccion}
                        </td>
                        <td style={{ padding: "0.5rem", textAlign: "right" }}>
                          {isSelected ? (
                            <span style={{ color: "#c9a84c" }}>
                              ✓ Seleccionada
                            </span>
                          ) : (
                            <button
                              type="button"
                              className="ipdj-filter-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                selectSolicitud(s);
                              }}
                            >
                              Seleccionar
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {!loadingSolicitudes &&
            solicitudesDisponibles.length > 0 &&
            !newEvent.id_solicitud && (
              <div
                style={{
                  color: "#c9a84c",
                  fontSize: "0.85rem",
                  padding: "0.5rem 0 0",
                }}
              >
                ↑ Haz clic en una fila de la tabla para seleccionar la solicitud
                antes de crear el evento.
              </div>
            )}
        </div>

        <div className="ipdj-field">
          <label>Fecha y Hora del Evento</label>
          <input
            type="datetime-local"
            value={newEvent.fecha_hora}
            onChange={(e) =>
              setNewEvent((n) => ({ ...n, fecha_hora: e.target.value }))
            }
          />
        </div>

        <div className="ipdj-field">
          <label>Dirección</label>
          <input
            type="text"
            value={newEvent.direccion}
            onChange={(e) =>
              setNewEvent((n) => ({ ...n, direccion: e.target.value }))
            }
          />
        </div>

        <div className="ipdj-field">
          <label>Tipo de Evento</label>
          <select
            value={newEvent.tipo_evento}
            onChange={(e) =>
              setNewEvent((n) => ({
                ...n,
                tipo_evento: e.target.value as EventoDTO["tipo_evento"],
              }))
            }
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
        </div>

        {createError && (
          <div style={{ color: "red", marginTop: "0.75rem" }}>
            {createError}
          </div>
        )}

        <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
          <button
            className="ipdj-btn-gold"
            onClick={handleCreateEvent}
            disabled={creating || !newEvent.id_solicitud}
            title={
              !newEvent.id_solicitud
                ? "Selecciona una solicitud de la tabla primero"
                : undefined
            }
          >
            {creating ? "Creando..." : "Crear evento"}
          </button>
          <button onClick={() => setShowNewEventModal(false)}>Cancelar</button>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <AdminPageShell
      topbarTitle="Eventos"
      navKey="eventos"
      sidePanel={sidePanel}
    >
      {mainContent}
      {newEventModal}
    </AdminPageShell>
  );
}
