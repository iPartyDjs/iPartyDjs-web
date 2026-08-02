import { useMemo, useState } from "react";
import AdminPageShell from "./AdminPageShell";
import "./AdminPhotosGallery.css";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type PhotoStatus = "Aprobada" | "Pendiente" | "Rechazada";

interface PhotoRecord {
  id: string;
  url: string;
  title: string;
  photographer: string;
  eventName: string;
  category: string;
  status: PhotoStatus;
  uploadedAt: string;
}

/* ------------------------------------------------------------------ */
/*  Mock data (swap for API data)                                      */
/* ------------------------------------------------------------------ */

const CATEGORIES = ["Bodas", "XV Años", "Corporativo", "Cumpleaños", "Graduación"];

function makeMock(id: number, status: PhotoStatus, category: string): PhotoRecord {
  const photographers = ["Javier Reyes", "Ana López", "Diego Mora", "Luisa Cano"];
  return {
    id: `p${id}`,
    url: `https://picsum.photos/seed/ipartydjs-${id}/500/500`,
    title: `${category} — sesión ${id}`,
    photographer: photographers[id % photographers.length],
    eventName: `Evento #${100 + id}`,
    category,
    status,
    uploadedAt: `${(id % 27) + 1} jun 2025`,
  };
}

const PHOTOS: PhotoRecord[] = [
  makeMock(1, "Aprobada", "Bodas"),
  makeMock(2, "Pendiente", "XV Años"),
  makeMock(3, "Aprobada", "Corporativo"),
  makeMock(4, "Rechazada", "Cumpleaños"),
  makeMock(5, "Aprobada", "Bodas"),
  makeMock(6, "Pendiente", "Graduación"),
  makeMock(7, "Aprobada", "XV Años"),
  makeMock(8, "Pendiente", "Bodas"),
  makeMock(9, "Aprobada", "Corporativo"),
];

const STATUS_CLASS: Record<PhotoStatus, string> = {
  Aprobada: "status-pill approved",
  Pendiente: "status-pill pending",
  Rechazada: "status-pill rejected",
};

const PAGE_SIZE = 9;

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

export default function AdminPhotosGallery() {
  const [photos, setPhotos] = useState<PhotoRecord[]>(PHOTOS);
  const [selectedId, setSelectedId] = useState<string>(PHOTOS[0].id);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"Todos" | PhotoStatus>("Todos");
  const [draft, setDraft] = useState<Partial<PhotoRecord>>({});

  const selected = useMemo(
    () => photos.find((p) => p.id === selectedId) ?? photos[0],
    [photos, selectedId]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return photos.filter((p) => {
      const matchesQuery =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.photographer.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "Todos" || p.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [photos, search, statusFilter]);

  const stats = useMemo(() => {
    const total = photos.length;
    const aprobadas = photos.filter((p) => p.status === "Aprobada").length;
    const pendientes = photos.filter((p) => p.status === "Pendiente").length;
    const rechazadas = photos.filter((p) => p.status === "Rechazada").length;
    return { total, aprobadas, pendientes, rechazadas };
  }, [photos]);

  function select(p: PhotoRecord) {
    setSelectedId(p.id);
    setDraft({});
  }

  function setStatus(id: string, status: PhotoStatus) {
    setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
  }

  function handleDraftChange<K extends keyof PhotoRecord>(key: K, value: PhotoRecord[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  function saveChanges() {
    setPhotos((prev) =>
      prev.map((p) => (p.id === selected.id ? { ...p, ...draft } : p))
    );
    setDraft({});
  }

  function deletePhoto() {
    setPhotos((prev) => prev.filter((p) => p.id !== selected.id));
  }

  const displayTitle = draft.title ?? selected.title;
  const displayCategory = (draft.category ?? selected.category) as string;
  const displayEvent = draft.eventName ?? selected.eventName;
  const displayStatus = (draft.status ?? selected.status) as PhotoStatus;

  const mainContent = (
    <>
      <div className="ipdj-main-header">
        <div>
          <h2>Fotografías</h2>
          <p>Modera y administra las fotografías subidas por fotógrafos y clientes.</p>
        </div>
        <button className="ipdj-btn-gold">+ Subir fotografía</button>
      </div>

      <div className="ipdj-stats">
        <div className="ipdj-stat-card">
          <div className="num">{stats.total}</div>
          <div className="lbl">Total</div>
        </div>
        <div className="ipdj-stat-card green">
          <div className="num">{stats.aprobadas}</div>
          <div className="lbl">Aprobadas</div>
        </div>
        <div className="ipdj-stat-card gold">
          <div className="num">{stats.pendientes}</div>
          <div className="lbl">Pendientes</div>
        </div>
        <div className="ipdj-stat-card red">
          <div className="num">{stats.rechazadas}</div>
          <div className="lbl">Rechazadas</div>
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
            placeholder="Buscar por título, fotógrafo o categoría..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="ipdj-filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as "Todos" | PhotoStatus)}
        >
          <option value="Todos">Todos los estados</option>
          <option value="Aprobada">Aprobadas</option>
          <option value="Pendiente">Pendientes</option>
          <option value="Rechazada">Rechazadas</option>
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

      <div className="ipdj-photo-grid">
        {filtered.slice(0, PAGE_SIZE).map((p) => (
          <div
            key={p.id}
            className={`ipdj-photo-card${p.id === selected.id ? " selected" : ""}`}
            onClick={() => select(p)}
          >
            <div className="ipdj-photo-thumb">
              <img src={p.url} alt={p.title} loading="lazy" />
              <span className={STATUS_CLASS[p.status]}>{p.status}</span>

              <div className="ipdj-photo-hover-actions" onClick={(e) => e.stopPropagation()}>
                <button
                  className="quick-act approve"
                  title="Aprobar"
                  onClick={() => setStatus(p.id, "Aprobada")}
                >
                  ✓
                </button>
                <button
                  className="quick-act reject"
                  title="Rechazar"
                  onClick={() => setStatus(p.id, "Rechazada")}
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="ipdj-photo-info">
              <div className="photo-title">{p.title}</div>
              <div className="photo-meta">
                {p.photographer} · {p.uploadedAt}
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="ipdj-photo-empty">
            No se encontraron fotografías para “{search}”.
          </div>
        )}
      </div>

      <div className="ipdj-table-footer">
        <div className="count">
          Mostrando {Math.min(PAGE_SIZE, filtered.length)} de {photos.length} fotografías
        </div>
        <div className="ipdj-pagination">
          <button className="ipdj-page-btn">‹</button>
          <button className="ipdj-page-btn active">1</button>
          <button className="ipdj-page-btn">2</button>
          <button className="ipdj-page-btn">›</button>
        </div>
      </div>
    </>
  );

  const sidePanel = (
    <>
      <h3>Detalle de fotografía</h3>

      <div className="ipdj-photo-preview">
        <img src={selected.url} alt={selected.title} />
        <span className={STATUS_CLASS[displayStatus]}>{displayStatus}</span>
      </div>

      <div className="ipdj-field">
        <label>Título</label>
        <input
          type="text"
          value={displayTitle}
          onChange={(e) => handleDraftChange("title", e.target.value)}
        />
      </div>
      <div className="ipdj-field">
        <label>Categoría</label>
        <select
          value={displayCategory}
          onChange={(e) => handleDraftChange("category", e.target.value)}
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div className="ipdj-field">
        <label>Evento asociado</label>
        <input
          type="text"
          value={displayEvent}
          onChange={(e) => handleDraftChange("eventName", e.target.value)}
        />
      </div>
      <div className="ipdj-field">
        <label>Fotógrafo</label>
        <input type="text" value={selected.photographer} readOnly />
      </div>
      <div className="ipdj-field">
        <label>Estado</label>
        <select
          value={displayStatus}
          onChange={(e) => handleDraftChange("status", e.target.value as PhotoStatus)}
        >
          <option value="Aprobada">Aprobada</option>
          <option value="Pendiente">Pendiente</option>
          <option value="Rechazada">Rechazada</option>
        </select>
      </div>
      <div className="ipdj-field">
        <label>Fecha de subida</label>
        <input type="text" value={selected.uploadedAt} readOnly />
      </div>

      <button className="ipdj-btn-save" onClick={saveChanges}>
        Guardar cambios
      </button>

      <div className="ipdj-danger-zone">
        <div className="dz-title">Zona de riesgo</div>
        <button className="ipdj-btn-danger" onClick={deletePhoto}>
          Eliminar fotografía
        </button>
      </div>
    </>
  );

  return (
    <AdminPageShell topbarTitle="Fotografías" sidePanel={sidePanel}>
      {mainContent}
    </AdminPageShell>
  );
}
