import { useMemo, useState, useEffect } from "react";
import AdminPageShell from "./AdminPageShell";
import "./AdminPhotosGallery.css";

/* ------------------------------------------------------------------ *
 *  Types                                                             *
 * ------------------------------------------------------------------ */
type PhotoStatus = "Aprobada" | "Pendiente" | "Rechazada";

interface PhotoRecord {
  id: string;
  url: string;
  title: string;
  description?: string;
  photographer: string;
  eventName: string;
  category: string;
  status: PhotoStatus;
  uploadedAt: string;
}

interface ApiPhotoItem {
  id?: string;
  url?: string;
  imageUrl?: string;
  titulo?: string;
  title?: string;
  descripcion?: string;
  description?: string;
  fotografo?: string;
  photographer?: string;
  eventName?: string;
  category?: string;
  estado?: string;
  uploadedAt?: string;
}

/* ------------------------------------------------------------------ *
 *  Mock data (swap for API data)                                     *
 * ------------------------------------------------------------------ */
const CATEGORIES = [
  "Bodas",
  "XV Años",
  "Corporativo",
  "Cumpleaños",
  "Graduación",
];

function makeMock(
  id: number,
  status: PhotoStatus,
  category: string,
): PhotoRecord {
  const photographers = [
    "Javier Reyes",
    "Ana López",
    "Diego Mora",
    "Luisa Cano",
  ];
  return {
    id: `p${id}`,
    url: `https://picsum.photos/seed/ipartydjs-${id}/500/500`,
    title: `${category} — sesión ${id}`,
    description: `Descripción detallada de la sesión ${id}`,
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
  makeMock(10, "Aprobada", "Bodas"),
  makeMock(11, "Pendiente", "XV Años"),
  makeMock(12, "Aprobada", "Corporativo"),
  makeMock(13, "Aprobada", "Cumpleaños"),
];

const STATUS_CLASS: Record<PhotoStatus, string> = {
  Aprobada: "status-pill approved",
  Pendiente: "status-pill pending",
  Rechazada: "status-pill rejected",
};

const PAGE_SIZE = 9;

/* ------------------------------------------------------------------ *
 *  Component                                                         *
 * ------------------------------------------------------------------ */
export default function AdminPhotosGallery() {
  const [photos, setPhotos] = useState<PhotoRecord[]>(PHOTOS);
  const [selectedId, setSelectedId] = useState<string>(PHOTOS[0].id);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"Todos" | PhotoStatus>(
    "Todos",
  );
  const [draft, setDraft] = useState<Partial<PhotoRecord>>({});
  // Estado para la paginación activa
  const [currentPage, setCurrentPage] = useState(1);
  // Estados para el Modal de Subida y su formulario
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newFile, setNewFile] = useState<File | null>(null);
  // Estado para cambiar entre Vista de Cuadrícula (Grid) o Vista de Tabla
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");

  // Efecto para sincronizar o traer datos del backend de forma limpia
  useEffect(() => {
    async function fetchPhotosFromAPI() {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || "http://localhost:3000/api"}/fotografias`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token") || localStorage.getItem("auth_token") || ""}`,
            },
          },
        );
        const data = await response.json();
        const rawData = data.success
          ? data.data || data.fotografias
          : Array.isArray(data)
            ? data
            : [];
        if (rawData && rawData.length > 0) {
          const mapped: PhotoRecord[] = rawData.map(
            (item: ApiPhotoItem, idx: number) => ({
              id: item.id || String(idx),
              url:
                item.url ||
                item.imageUrl ||
                `https://picsum.photos/seed/api-${idx}/500/500`,
              title: item.titulo || item.title || "Sin título",
              description: item.descripcion || item.description || "",
              photographer:
                item.fotografo || item.photographer || "Administrador",
              eventName: item.eventName || "Evento iPartyDjs",
              category: item.category || "Bodas",
              status:
                item.estado === "APROBADA"
                  ? "Aprobada"
                  : item.estado === "RECHAZADA"
                    ? "Rechazada"
                    : "Pendiente",
              uploadedAt: item.uploadedAt || "Reciente",
            }),
          );
          if (mapped.length > 0) {
            setPhotos(mapped);
            setSelectedId(mapped[0].id);
          }
        }
      } catch (error) {
        console.log("Usando datos locales simulados (Mock)", error);
      }
    }
    fetchPhotosFromAPI();
  }, []);

  const selected = useMemo(
    () => photos.find((p) => p.id === selectedId) ?? photos[0],
    [photos, selectedId],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return photos.filter((p) => {
      const matchesQuery =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.photographer.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === "Todos" || p.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [photos, search, statusFilter]);

  // Cálculo total de páginas basado en el filtro actual
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;

  // Manejadores seguros para evitar renders en cascada
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setStatusFilter(e.target.value as "Todos" | PhotoStatus);
    setCurrentPage(1);
  };

  // Datos paginados que se van a mostrar en pantalla
  const paginatedPhotos = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

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

  async function setStatus(id: string, status: PhotoStatus) {
    setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
    try {
      const dbStatus =
        status === "Aprobada"
          ? "APROBADA"
          : status === "Rechazada"
            ? "RECHAZADA"
            : "PENDIENTE";
      await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3000/api"}/fotografias/${id}/estado`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token") || localStorage.getItem("auth_token") || ""}`,
          },
          body: JSON.stringify({ estado: dbStatus }),
        },
      );
    } catch (err) {
      console.error("Error al sincronizar estado con el servidor:", err);
    }
  }

  function handleDraftChange<K extends keyof PhotoRecord>(
    key: K,
    value: PhotoRecord[K],
  ) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  function saveChanges() {
    setPhotos((prev) =>
      prev.map((p) => (p.id === selected.id ? { ...p, ...draft } : p)),
    );
    setDraft({});
  }

  // FUNCIÓN DE ELIMINACIÓN LIMPIA: Obliga a pegarle al servidor siempre por DELETE
  async function deletePhoto() {
    if (
      !confirm("¿Estás seguro de eliminar esta fotografía de forma permanente?")
    ) {
      return;
    }
    const photoId = selected.id;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3000/api"}/fotografias/${photoId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || localStorage.getItem("auth_token") || ""}`,
          },
        },
      );

      const contentType = response.headers.get("content-type");
      let data: Record<string, unknown> = {};
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      }

      if (response.ok) {
        setPhotos((prev) => prev.filter((p) => p.id !== photoId));
        const remaining = photos.filter((p) => p.id !== photoId);
        if (remaining.length > 0) {
          setSelectedId(remaining[0].id);
        }
        alert(
          "¡Fotografía eliminada con éxito de la base de datos y de ImageKit!",
        );
      } else {
        const errorMsg =
          (typeof data.message === "string" ? data.message : null) ||
          (typeof data.error === "string" ? data.error : null) ||
          "No se pudo borrar la fotografía";
        alert(`Error al eliminar: ${errorMsg}`);
      }
    } catch (error) {
      console.error("Error de red al eliminar:", error);
      alert("Ocurrió un error de conexión al intentar eliminar la fotografía.");
    }
  }

  async function handleUploadSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newFile) {
      alert("Por favor selecciona una imagen.");
      return;
    }
    const formData = new FormData();
    formData.append("foto", newFile);
    formData.append("titulo", newTitle);
    formData.append("descripcion", newDescription);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3000/api"}/fotografias`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || localStorage.getItem("auth_token") || ""}`,
          },
          body: formData,
        },
      );
      const data = await response.json();
      if (response.ok) {
        alert("¡Fotografía subida con éxito!");
        setIsModalOpen(false);
        setNewTitle("");
        setNewDescription("");
        setNewFile(null);
        const item = data.data || data.fotografia || data;
        const nuevaFoto: PhotoRecord = {
          id: item.id || String(Date.now()),
          url: item.url || item.imageUrl || URL.createObjectURL(newFile),
          title: item.titulo || item.title || newTitle,
          description: item.descripcion || item.description || newDescription,
          photographer: item.fotografo || item.photographer || "Administrador",
          eventName: item.eventName || "Evento iPartyDjs",
          category: item.category || "Bodas",
          status: "Pendiente",
          uploadedAt: "Hace un momento",
        };
        setPhotos((prev) => [nuevaFoto, ...prev]);
        setSelectedId(nuevaFoto.id);
      } else {
        alert(`Error al subir: ${data.error || "Verifica los datos"}`);
      }
    } catch (error) {
      console.error("Error de red:", error);
      alert("Ocurrió un error de conexión con el servidor.");
    }
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
          <p>
            Modera y administra las fotografías subidas por fotógrafos y
            clientes.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <div
            style={{
              background: "#18181b",
              padding: "4px",
              borderRadius: "8px",
              border: "1px solid #27272a",
              display: "flex",
              gap: "4px",
            }}
          >
            <button
              onClick={() => setViewMode("table")}
              style={{
                background: viewMode === "table" ? "#27272a" : "transparent",
                color: viewMode === "table" ? "#fff" : "#a1a1aa",
                border: "none",
                padding: "6px 12px",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: "600",
              }}
            >
              Tabla
            </button>
            <button
              onClick={() => setViewMode("grid")}
              style={{
                background: viewMode === "grid" ? "#27272a" : "transparent",
                color: viewMode === "grid" ? "#fff" : "#a1a1aa",
                border: "none",
                padding: "6px 12px",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: "600",
              }}
            >
              Tarjetas
            </button>
          </div>
          <button
            className="ipdj-btn-gold"
            onClick={() => setIsModalOpen(true)}
          >
            + Subir fotografía
          </button>
        </div>
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
            placeholder="Buscar por título, fotógrafo o categoría..."
            value={search}
            onChange={handleSearchChange}
          />
        </div>
        <select
          className="ipdj-filter-select"
          value={statusFilter}
          onChange={handleStatusFilterChange}
        >
          <option value="Todos">Todos los estados</option>
          <option value="Aprobada">Aprobadas</option>
          <option value="Pendiente">Pendientes</option>
          <option value="Rechazada">Rechazadas</option>
        </select>
      </div>

      {viewMode === "table" ? (
        <div
          style={{
            width: "100%",
            overflowX: "auto",
            background: "#18181b",
            border: "1px solid #27272a",
            borderRadius: "12px",
            padding: "16px",
            marginTop: "16px",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              textAlign: "left",
            }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: "1px solid #27272a",
                  color: "#a1a1aa",
                  fontSize: "12px",
                  textTransform: "uppercase",
                }}
              >
                <th style={{ padding: "12px 16px", width: "15%" }}>
                  Vista previa
                </th>
                <th style={{ padding: "12px 16px", width: "25%" }}>Título</th>
                <th style={{ padding: "12px 16px", width: "20%" }}>
                  Fotógrafo
                </th>
                <th style={{ padding: "12px 16px", width: "15%" }}>
                  Categoría
                </th>
                <th style={{ padding: "12px 16px", width: "12%" }}>Estado</th>
                <th
                  style={{
                    padding: "12px 16px",
                    width: "13%",
                    textAlign: "center",
                  }}
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedPhotos.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      padding: "24px",
                      textAlign: "center",
                      color: "#71717a",
                    }}
                  >
                    No se encontraron fotografías para “{search}”.
                  </td>
                </tr>
              ) : (
                paginatedPhotos.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => select(p)}
                    style={{
                      borderBottom: "1px solid #27272a",
                      cursor: "pointer",
                      background:
                        p.id === selected.id ? "#27272a88" : "transparent",
                    }}
                  >
                    <td style={{ padding: "12px 16px" }}>
                      <img
                        src={p.url}
                        alt={p.title}
                        style={{
                          width: "64px",
                          height: "48px",
                          objectFit: "cover",
                          borderRadius: "6px",
                          border: "1px solid #3f3f46",
                        }}
                      />
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        fontWeight: "600",
                        color: "#fff",
                      }}
                    >
                      {p.title}
                    </td>
                    <td style={{ padding: "12px 16px", color: "#a1a1aa" }}>
                      {p.photographer}
                    </td>
                    <td style={{ padding: "12px 16px", color: "#a1a1aa" }}>
                      {p.category}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span className={STATUS_CLASS[p.status]}>{p.status}</span>
                    </td>
                    <td
                      style={{ padding: "12px 16px", textAlign: "center" }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: "6px",
                          justifyContent: "center",
                        }}
                      >
                        <button
                          onClick={() => setStatus(p.id, "Aprobada")}
                          style={{
                            background: "rgba(16, 185, 129, 0.2)",
                            color: "#6ee7b7",
                            border: "1px solid rgba(16, 185, 129, 0.3)",
                            padding: "6px 10px",
                            borderRadius: "6px",
                            fontSize: "11px",
                            cursor: "pointer",
                            fontWeight: "600",
                          }}
                        >
                          Aprobar
                        </button>
                        <button
                          onClick={() => setStatus(p.id, "Rechazada")}
                          style={{
                            background: "rgba(244, 63, 94, 0.2)",
                            color: "#fca5a5",
                            border: "1px solid rgba(244, 63, 94, 0.3)",
                            padding: "6px 10px",
                            borderRadius: "6px",
                            fontSize: "11px",
                            cursor: "pointer",
                            fontWeight: "600",
                          }}
                        >
                          Rechazar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="ipdj-photo-grid">
          {paginatedPhotos.map((p) => (
            <div
              key={p.id}
              className={`ipdj-photo-card${p.id === selected.id ? " selected" : ""}`}
              onClick={() => select(p)}
            >
              <div className="ipdj-photo-thumb">
                <img src={p.url} alt={p.title} loading="lazy" />
                <span className={STATUS_CLASS[p.status]}>{p.status}</span>
                <div
                  className="ipdj-photo-hover-actions"
                  onClick={(e) => e.stopPropagation()}
                >
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
          {paginatedPhotos.length === 0 && (
            <div className="ipdj-photo-empty">
              No se encontraron fotografías para “{search}”.
            </div>
          )}
        </div>
      )}

      <div className="ipdj-table-footer">
        <div className="count">
          Mostrando del{" "}
          {filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1} al{" "}
          {Math.min(currentPage * PAGE_SIZE, filtered.length)} de{" "}
          {filtered.length} fotografías
        </div>
        <div className="ipdj-pagination">
          <button
            className="ipdj-page-btn"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            style={{
              opacity: currentPage === 1 ? 0.4 : 1,
              cursor: currentPage === 1 ? "not-allowed" : "pointer",
            }}
          >
            ‹
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              className={`ipdj-page-btn ${currentPage === page ? "active" : ""}`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}
          <button
            className="ipdj-page-btn"
            disabled={currentPage === totalPages}
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            style={{
              opacity: currentPage === totalPages ? 0.4 : 1,
              cursor: currentPage === totalPages ? "not-allowed" : "pointer",
            }}
          >
            ›
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div
          className="ipdj-modal"
          style={{
            display: "flex",
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.6)",
            zIndex: 1000,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            className="ipdj-modal-content"
            style={{
              background: "#1e1e1e",
              padding: "24px",
              borderRadius: "8px",
              width: "400px",
              maxWidth: "90%",
            }}
          >
            <h3 style={{ marginBottom: "16px", color: "#fff" }}>
              Subir Nueva Fotografía
            </h3>
            <form onSubmit={handleUploadSubmit}>
              <div className="ipdj-field" style={{ marginBottom: "12px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    color: "#ccc",
                  }}
                >
                  Archivo de Imagen
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setNewFile(e.target.files ? e.target.files[0] : null)
                  }
                  required
                  style={{ width: "100%", color: "#fff" }}
                />
              </div>
              <div className="ipdj-field" style={{ marginBottom: "12px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    color: "#ccc",
                  }}
                >
                  Título
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ej. Boda sesión 1"
                  required
                  style={{
                    width: "100%",
                    padding: "8px",
                    background: "#2a2a2a",
                    border: "1px solid #444",
                    color: "#fff",
                    borderRadius: "4px",
                  }}
                />
              </div>
              <div className="ipdj-field" style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    color: "#ccc",
                  }}
                >
                  Descripción
                </label>
                <input
                  type="text"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Breve detalle de la foto"
                  style={{
                    width: "100%",
                    padding: "8px",
                    background: "#2a2a2a",
                    border: "1px solid #444",
                    color: "#fff",
                    borderRadius: "4px",
                  }}
                />
              </div>
              <button
                type="submit"
                className="ipdj-btn-save"
                style={{
                  width: "100%",
                  padding: "10px",
                  background: "#d4af37",
                  border: "none",
                  fontWeight: "bold",
                  cursor: "pointer",
                  borderRadius: "4px",
                  marginBottom: "8px",
                }}
              >
                Guardar y Enviar a Pendientes
              </button>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{
                  width: "100%",
                  padding: "8px",
                  background: "transparent",
                  border: "1px solid #555",
                  color: "#ccc",
                  cursor: "pointer",
                  borderRadius: "4px",
                }}
              >
                Cancelar
              </button>
            </form>
          </div>
        </div>
      )}
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
          onChange={(e) =>
            handleDraftChange("status", e.target.value as PhotoStatus)
          }
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
