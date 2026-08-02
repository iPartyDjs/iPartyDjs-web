import { useMemo, useState } from "react";
import AdminPageShell from "./AdminPageShell";
import "./AdminEventos.css";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface EventTypeRecord {
  id: string;
  name: string;
  category: string;
  description: string;
  priceFrom: number;
  durationHours: number;
  bookings: number;
  active: boolean;
  image: string;
}

/* ------------------------------------------------------------------ */
/*  Mock data (swap for API data)                                      */
/* ------------------------------------------------------------------ */

const CATEGORIES = ["Bodas", "XV Años", "Corporativo", "Cumpleaños", "Graduación", "Aniversario"];

const EVENTS: EventTypeRecord[] = [
  {
    id: "e1",
    name: "Boda Premium",
    category: "Bodas",
    description: "Paquete completo con DJ, iluminación y pista de baile LED.",
    priceFrom: 12000,
    durationHours: 6,
    bookings: 18,
    active: true,
    image: "https://picsum.photos/seed/ipartydjs-event-1/500/320",
  },
  {
    id: "e2",
    name: "XV Años Clásico",
    category: "XV Años",
    description: "DJ + animación + vals sorpresa + luces de pista.",
    priceFrom: 8500,
    durationHours: 5,
    bookings: 24,
    active: true,
    image: "https://picsum.photos/seed/ipartydjs-event-2/500/320",
  },
  {
    id: "e3",
    name: "Evento Corporativo",
    category: "Corporativo",
    description: "Ambientación musical profesional para eventos de empresa.",
    priceFrom: 9000,
    durationHours: 4,
    bookings: 9,
    active: true,
    image: "https://picsum.photos/seed/ipartydjs-event-3/500/320",
  },
  {
    id: "e4",
    name: "Cumpleaños Fiesta",
    category: "Cumpleaños",
    description: "DJ + juegos de luces básicos, ideal para fiestas en casa.",
    priceFrom: 4500,
    durationHours: 3,
    bookings: 31,
    active: true,
    image: "https://picsum.photos/seed/ipartydjs-event-4/500/320",
  },
  {
    id: "e5",
    name: "Graduación Escolar",
    category: "Graduación",
    description: "Paquete escolar con descuento por volumen de invitados.",
    priceFrom: 7000,
    durationHours: 4,
    bookings: 6,
    active: false,
    image: "https://picsum.photos/seed/ipartydjs-event-5/500/320",
  },
  {
    id: "e6",
    name: "Aniversario Romántico",
    category: "Aniversario",
    description: "Ambientación íntima con selección musical personalizada.",
    priceFrom: 6000,
    durationHours: 3,
    bookings: 4,
    active: true,
    image: "https://picsum.photos/seed/ipartydjs-event-6/500/320",
  },
];

const PAGE_SIZE = 6;

function formatMXN(value: number): string {
  return value.toLocaleString("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 });
}

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

export default function AdminEventos() {
  const [events, setEvents] = useState<EventTypeRecord[]>(EVENTS);
  const [selectedId, setSelectedId] = useState<string>(EVENTS[0].id);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"Todas" | string>("Todas");
  const [draft, setDraft] = useState<Partial<EventTypeRecord>>({});

  const selected = useMemo(
    () => events.find((e) => e.id === selectedId) ?? events[0],
    [events, selectedId]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return events.filter((e) => {
      const matchesQuery =
        !q || e.name.toLowerCase().includes(q) || e.category.toLowerCase().includes(q);
      const matchesCategory = categoryFilter === "Todas" || e.category === categoryFilter;
      return matchesQuery && matchesCategory;
    });
  }, [events, search, categoryFilter]);

  const stats = useMemo(() => {
    const total = events.length;
    const activos = events.filter((e) => e.active).length;
    const inactivos = total - activos;
    const reservasTotales = events.reduce((sum, e) => sum + e.bookings, 0);
    return { total, activos, inactivos, reservasTotales };
  }, [events]);

  function select(e: EventTypeRecord) {
    setSelectedId(e.id);
    setDraft({});
  }

  function toggleActive(id: string) {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, active: !e.active } : e)));
  }

  function handleDraftChange<K extends keyof EventTypeRecord>(key: K, value: EventTypeRecord[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  function saveChanges() {
    setEvents((prev) => prev.map((e) => (e.id === selected.id ? { ...e, ...draft } : e)));
    setDraft({});
  }

  function deleteEvent() {
    setEvents((prev) => prev.filter((e) => e.id !== selected.id));
  }

  const displayName = draft.name ?? selected.name;
  const displayCategory = (draft.category ?? selected.category) as string;
  const displayDescription = draft.description ?? selected.description;
  const displayPrice = draft.priceFrom ?? selected.priceFrom;
  const displayDuration = draft.durationHours ?? selected.durationHours;
  const displayActive = draft.active ?? selected.active;

  const mainContent = (
    <>
      <div className="ipdj-main-header">
        <div>
          <h2>Eventos</h2>
          <p>Administra los tipos de evento y paquetes que ofrece la plataforma.</p>
        </div>
        <button className="ipdj-btn-gold">+ Nuevo tipo de evento</button>
      </div>

      <div className="ipdj-stats">
        <div className="ipdj-stat-card">
          <div className="num">{stats.total}</div>
          <div className="lbl">Total</div>
        </div>
        <div className="ipdj-stat-card green">
          <div className="num">{stats.activos}</div>
          <div className="lbl">Activos</div>
        </div>
        <div className="ipdj-stat-card red">
          <div className="num">{stats.inactivos}</div>
          <div className="lbl">Inactivos</div>
        </div>
        <div className="ipdj-stat-card gold">
          <div className="num">{stats.reservasTotales}</div>
          <div className="lbl">Reservas totales</div>
        </div>
      </div>

      <div className="ipdj-filters">
        <div className="ipdj-search-box">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            placeholder="Buscar por nombre o categoría..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="ipdj-filter-select"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="Todas">Todas las categorías</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <button className="ipdj-filter-btn">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Exportar
        </button>
      </div>

      <div className="ipdj-event-grid">
        {filtered.slice(0, PAGE_SIZE).map((e) => (
          <div
            key={e.id}
            className={`ipdj-event-card${e.id === selected.id ? " selected" : ""}${
              !e.active ? " inactive" : ""
            }`}
            onClick={() => select(e)}
          >
            <div className="ipdj-event-thumb">
              <img src={e.image} alt={e.name} loading="lazy" />
              <span className="ipdj-event-category">{e.category}</span>
              {!e.active && <span className="ipdj-event-inactive-badge">Inactivo</span>}
            </div>
            <div className="ipdj-event-info">
              <div className="event-title-row">
                <div className="event-title">{e.name}</div>
                <label className="ipdj-toggle" onClick={(ev) => ev.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={e.active}
                    onChange={() => toggleActive(e.id)}
                  />
                  <span className="ipdj-toggle-slider" />
                </label>
              </div>
              <div className="event-desc">{e.description}</div>
              <div className="event-meta">
                <span className="event-price">Desde {formatMXN(e.priceFrom)}</span>
                <span className="event-duration">{e.durationHours} hrs</span>
                <span className="event-bookings">{e.bookings} reservas</span>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="ipdj-event-empty">
            No se encontraron tipos de evento para “{search}”.
          </div>
        )}
      </div>

      <div className="ipdj-table-footer">
        <div className="count">
          Mostrando {Math.min(PAGE_SIZE, filtered.length)} de {events.length} tipos de evento
        </div>
        <div className="ipdj-pagination">
          <button className="ipdj-page-btn">‹</button>
          <button className="ipdj-page-btn active">1</button>
          <button className="ipdj-page-btn">›</button>
        </div>
      </div>
    </>
  );

  const sidePanel = (
    <>
      <h3>Editar tipo de evento</h3>

      <div className="ipdj-event-preview">
        <img src={selected.image} alt={selected.name} />
        {!displayActive && <span className="ipdj-event-inactive-badge">Inactivo</span>}
      </div>

      <div className="ipdj-field">
        <label>Nombre</label>
        <input type="text" value={displayName} onChange={(e) => handleDraftChange("name", e.target.value)} />
      </div>
      <div className="ipdj-field">
        <label>Categoría</label>
        <select value={displayCategory} onChange={(e) => handleDraftChange("category", e.target.value)}>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div className="ipdj-field">
        <label>Descripción</label>
        <textarea
          rows={3}
          value={displayDescription}
          onChange={(e) => handleDraftChange("description", e.target.value)}
        />
      </div>
      <div className="ipdj-field-row">
        <div className="ipdj-field">
          <label>Precio desde (MXN)</label>
          <input
            type="number"
            value={displayPrice}
            onChange={(e) => handleDraftChange("priceFrom", Number(e.target.value))}
          />
        </div>
        <div className="ipdj-field">
          <label>Duración (hrs)</label>
          <input
            type="number"
            value={displayDuration}
            onChange={(e) => handleDraftChange("durationHours", Number(e.target.value))}
          />
        </div>
      </div>
      <div className="ipdj-field ipdj-field-toggle">
        <label>Estado</label>
        <label className="ipdj-toggle">
          <input
            type="checkbox"
            checked={displayActive}
            onChange={(e) => handleDraftChange("active", e.target.checked)}
          />
          <span className="ipdj-toggle-slider" />
        </label>
        <span className="ipdj-toggle-label">{displayActive ? "Activo" : "Inactivo"}</span>
      </div>

      <button className="ipdj-btn-save" onClick={saveChanges}>
        Guardar cambios
      </button>

      <div className="ipdj-danger-zone">
        <div className="dz-title">Zona de riesgo</div>
        <button className="ipdj-btn-danger" onClick={deleteEvent}>
          Eliminar tipo de evento
        </button>
      </div>
    </>
  );

  return (
    <AdminPageShell topbarTitle="Eventos" sidePanel={sidePanel}>
      {mainContent}
    </AdminPageShell>
  );
}
