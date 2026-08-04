import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { FotografiaDTO, EstadoFotografia } from "@ipartydjs/shared";
import {
  listFotografias,
  uploadFotografia,
  editFotografiaMetadata,
  approveFotografia,
  rejectFotografia,
  deleteFotografia,
} from "@/core/api/fotografiaApi";
import AdminPageShell from "./AdminPageShell";
import "./AdminPhotosGallery.css";

const PAGE_SIZE = 9;

/** Estado real (EstadoFotografia de @ipartydjs/shared) -> etiqueta visible en UI. */
const STATUS_LABELS: Record<EstadoFotografia, string> = {
  pendiente: "Pendiente",
  visible: "Aprobada",
  rechazada: "Rechazada",
  baja: "Baja",
};

const STATUS_CLASS: Record<EstadoFotografia, string> = {
  pendiente: "status-pill pending",
  visible: "status-pill approved",
  rechazada: "status-pill rejected",
  baja: "status-pill rejected",
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Ocurrió un error. Intenta de nuevo.";
}

export default function AdminPhotosGallery() {
  const queryClient = useQueryClient();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"Todos" | EstadoFotografia>(
    "Todos",
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  const [toast, setToast] = useState<string | null>(null);

  // Draft de edición de metadatos (solo título/descripción, es lo único que existe)
  const [draftTitulo, setDraftTitulo] = useState<string | null>(null);
  const [draftDescripcion, setDraftDescripcion] = useState<string | null>(null);

  // Modal de subida
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitulo, setNewTitulo] = useState("");
  const [newDescripcion, setNewDescripcion] = useState("");
  const [newFile, setNewFile] = useState<File | null>(null);

  // Modal de rechazo (motivo opcional)
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectMotivo, setRejectMotivo] = useState("");

  // Confirmación de baja (patrón doble-tap, consistente con el resto del panel)
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(
    null,
  );

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 3000);
  };

  // -------- Datos --------
  // Solo filtramos por estado en el backend (PhotoFiltersInput no acepta
  // búsqueda de texto libre) — el buscador de abajo filtra en el cliente
  // sobre este resultado.
  const fotosQuery = useQuery({
    queryKey: ["fotografias", statusFilter],
    queryFn: () =>
      listFotografias(statusFilter === "Todos" ? {} : { estado: statusFilter }),
  });

  const photos = useMemo(() => fotosQuery.data ?? [], [fotosQuery.data]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return photos;
    return photos.filter((p) => p.titulo.toLowerCase().includes(q));
  }, [photos, search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const paginatedPhotos = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  const selected = photos.find((p) => p.id_fotografia === selectedId) ?? null;

  const stats = useMemo(() => {
    const total = photos.length;
    const visibles = photos.filter((p) => p.estado === "visible").length;
    const pendientes = photos.filter((p) => p.estado === "pendiente").length;
    const rechazadas = photos.filter((p) => p.estado === "rechazada").length;
    return { total, visibles, pendientes, rechazadas };
  }, [photos]);

  // -------- Mutaciones --------
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["fotografias"] });

  const approveMutation = useMutation({
    mutationFn: (id: string) => approveFotografia(id),
    onSuccess: () => {
      invalidate();
      showToast("Fotografía aprobada.");
    },
    onError: (error) => showToast(getErrorMessage(error)),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, motivo }: { id: string; motivo?: string }) =>
      rejectFotografia(id, { motivo }),
    onSuccess: () => {
      invalidate();
      setRejectingId(null);
      setRejectMotivo("");
      showToast("Fotografía rechazada.");
    },
    onError: (error) => showToast(getErrorMessage(error)),
  });

  const editMutation = useMutation({
    mutationFn: ({
      id,
      titulo,
      descripcion,
    }: {
      id: string;
      titulo?: string;
      descripcion?: string;
    }) => editFotografiaMetadata(id, { titulo, descripcion }),
    onSuccess: () => {
      invalidate();
      setDraftTitulo(null);
      setDraftDescripcion(null);
      showToast("Cambios guardados.");
    },
    onError: (error) => showToast(getErrorMessage(error)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteFotografia(id),
    onSuccess: () => {
      invalidate();
      setSelectedId(null);
      setConfirmingDeleteId(null);
      showToast("Fotografía eliminada.");
    },
    onError: (error) => showToast(getErrorMessage(error)),
  });

  const uploadMutation = useMutation({
    mutationFn: () => {
      if (!newFile) throw new Error("Selecciona una imagen.");
      return uploadFotografia(
        { titulo: newTitulo, descripcion: newDescripcion },
        newFile,
      );
    },
    onSuccess: (result) => {
      invalidate();
      setIsModalOpen(false);
      setNewTitulo("");
      setNewDescripcion("");
      setNewFile(null);
      setSelectedId(result.id_fotografia);
      showToast("Fotografía subida. Queda pendiente de aprobación.");
    },
    onError: (error) => showToast(getErrorMessage(error)),
  });

  function select(p: FotografiaDTO) {
    setSelectedId(p.id_fotografia);
    setDraftTitulo(null);
    setDraftDescripcion(null);
    setConfirmingDeleteId(null);
  }

  function handleDelete(id: string) {
    if (confirmingDeleteId !== id) {
      setConfirmingDeleteId(id);
      return;
    }
    deleteMutation.mutate(id);
  }

  const displayTitulo = draftTitulo ?? selected?.titulo ?? "";
  const displayDescripcion = draftDescripcion ?? selected?.descripcion ?? "";
  const hasChanges = draftTitulo !== null || draftDescripcion !== null;

  const mainContent = (
    <>
      <div className="ipdj-main-header">
        <div>
          <h2>Fotografías</h2>
          <p>Modera y administra las fotografías subidas por fotógrafos.</p>
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
          <div className="num">{stats.visibles}</div>
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
            placeholder="Buscar por título..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <select
          className="ipdj-filter-select"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as "Todos" | EstadoFotografia);
            setCurrentPage(1);
          }}
        >
          <option value="Todos">Todos los estados</option>
          <option value="visible">Aprobadas</option>
          <option value="pendiente">Pendientes</option>
          <option value="rechazada">Rechazadas</option>
          <option value="baja">Baja</option>
        </select>
      </div>

      {fotosQuery.isLoading ? (
        <p style={{ color: "#a1a1aa", padding: "24px", textAlign: "center" }}>
          Cargando fotografías...
        </p>
      ) : fotosQuery.isError ? (
        <p style={{ color: "#fca5a5", padding: "24px", textAlign: "center" }}>
          No pudimos cargar las fotografías. {getErrorMessage(fotosQuery.error)}{" "}
          (si tu cuenta es "administrador" en vez de "superadministrador", este
          módulo no está en tu alcance de permisos — solo superadmin tiene
          FOTOGRAFIA:*)
        </p>
      ) : viewMode === "table" ? (
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
                <th style={{ padding: "12px 16px", width: "35%" }}>Título</th>
                <th style={{ padding: "12px 16px", width: "17%" }}>Estado</th>
                <th style={{ padding: "12px 16px", width: "17%" }}>Subida</th>
                <th
                  style={{
                    padding: "12px 16px",
                    width: "16%",
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
                    colSpan={5}
                    style={{
                      padding: "24px",
                      textAlign: "center",
                      color: "#71717a",
                    }}
                  >
                    No se encontraron fotografías
                    {search ? ` para "${search}"` : ""}.
                  </td>
                </tr>
              ) : (
                paginatedPhotos.map((p) => (
                  <tr
                    key={p.id_fotografia}
                    onClick={() => select(p)}
                    style={{
                      borderBottom: "1px solid #27272a",
                      cursor: "pointer",
                      background:
                        p.id_fotografia === selectedId
                          ? "#27272a88"
                          : "transparent",
                    }}
                  >
                    <td style={{ padding: "12px 16px" }}>
                      <img
                        src={p.url_imagen}
                        alt={p.titulo}
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
                      {p.titulo}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span className={STATUS_CLASS[p.estado]}>
                        {STATUS_LABELS[p.estado]}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", color: "#a1a1aa" }}>
                      {new Date(p.created_at).toLocaleDateString("es-MX")}
                    </td>
                    <td
                      style={{ padding: "12px 16px", textAlign: "center" }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {p.estado === "pendiente" ? (
                        <div
                          style={{
                            display: "flex",
                            gap: "6px",
                            justifyContent: "center",
                          }}
                        >
                          <button
                            onClick={() =>
                              approveMutation.mutate(p.id_fotografia)
                            }
                            disabled={approveMutation.isPending}
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
                            onClick={() => setRejectingId(p.id_fotografia)}
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
                      ) : (
                        <span style={{ color: "#52525b", fontSize: "11px" }}>
                          —
                        </span>
                      )}
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
              key={p.id_fotografia}
              className={`ipdj-photo-card${p.id_fotografia === selectedId ? " selected" : ""}`}
              onClick={() => select(p)}
            >
              <div className="ipdj-photo-thumb">
                <img src={p.url_imagen} alt={p.titulo} loading="lazy" />
                <span className={STATUS_CLASS[p.estado]}>
                  {STATUS_LABELS[p.estado]}
                </span>
                {p.estado === "pendiente" && (
                  <div
                    className="ipdj-photo-hover-actions"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="quick-act approve"
                      title="Aprobar"
                      onClick={() => approveMutation.mutate(p.id_fotografia)}
                    >
                      ✓
                    </button>
                    <button
                      className="quick-act reject"
                      title="Rechazar"
                      onClick={() => setRejectingId(p.id_fotografia)}
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
              <div className="ipdj-photo-info">
                <div className="photo-title">{p.titulo}</div>
                <div className="photo-meta">
                  {new Date(p.created_at).toLocaleDateString("es-MX")}
                </div>
              </div>
            </div>
          ))}
          {paginatedPhotos.length === 0 && (
            <div className="ipdj-photo-empty">
              No se encontraron fotografías{search ? ` para "${search}"` : ""}.
            </div>
          )}
        </div>
      )}

      {!fotosQuery.isLoading && !fotosQuery.isError && (
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
      )}

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
              Subir nueva fotografía
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                uploadMutation.mutate();
              }}
            >
              <div style={{ marginBottom: "12px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    color: "#ccc",
                  }}
                >
                  Archivo de imagen
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
              <div style={{ marginBottom: "12px" }}>
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
                  value={newTitulo}
                  onChange={(e) => setNewTitulo(e.target.value)}
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
              <div style={{ marginBottom: "16px" }}>
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
                  value={newDescripcion}
                  onChange={(e) => setNewDescripcion(e.target.value)}
                  placeholder="Breve detalle de la foto (mín. 10 caracteres)"
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

              {uploadMutation.isError && (
                <p
                  style={{
                    color: "#fca5a5",
                    fontSize: "12px",
                    marginBottom: "12px",
                  }}
                >
                  {getErrorMessage(uploadMutation.error)}
                </p>
              )}

              <button
                type="submit"
                className="ipdj-btn-save"
                disabled={uploadMutation.isPending}
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
                {uploadMutation.isPending
                  ? "Subiendo..."
                  : "Guardar y enviar a pendientes"}
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

      {rejectingId && (
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
            style={{
              background: "#1e1e1e",
              padding: "24px",
              borderRadius: "8px",
              width: "380px",
              maxWidth: "90%",
            }}
          >
            <h3 style={{ marginBottom: "8px", color: "#fff" }}>
              Rechazar fotografía
            </h3>
            <p
              style={{
                color: "#a1a1aa",
                fontSize: "12.5px",
                marginBottom: "14px",
              }}
            >
              Motivo opcional (5–500 caracteres si lo escribes). El backend lo
              valida pero actualmente no lo guarda en la base de datos.
            </p>
            <textarea
              value={rejectMotivo}
              onChange={(e) => setRejectMotivo(e.target.value)}
              rows={3}
              placeholder="Ej. La imagen no cumple con los estándares de calidad..."
              style={{
                width: "100%",
                padding: "8px",
                background: "#2a2a2a",
                border: "1px solid #444",
                color: "#fff",
                borderRadius: "4px",
                marginBottom: "14px",
                resize: "vertical",
              }}
            />
            {rejectMutation.isError && (
              <p
                style={{
                  color: "#fca5a5",
                  fontSize: "12px",
                  marginBottom: "10px",
                }}
              >
                {getErrorMessage(rejectMutation.error)}
              </p>
            )}
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                type="button"
                onClick={() => {
                  setRejectingId(null);
                  setRejectMotivo("");
                }}
                style={{
                  flex: 1,
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
              <button
                type="button"
                disabled={rejectMutation.isPending}
                onClick={() =>
                  rejectMutation.mutate({
                    id: rejectingId,
                    motivo: rejectMotivo.trim() || undefined,
                  })
                }
                style={{
                  flex: 1,
                  padding: "8px",
                  background: "rgba(244, 63, 94, 0.2)",
                  color: "#fca5a5",
                  border: "1px solid rgba(244, 63, 94, 0.3)",
                  cursor: "pointer",
                  borderRadius: "4px",
                  fontWeight: 600,
                }}
              >
                {rejectMutation.isPending ? "Rechazando..." : "Rechazar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  const sidePanel = selected ? (
    <>
      <h3>Detalle de fotografía</h3>
      <div className="ipdj-photo-preview">
        <img src={selected.url_imagen} alt={selected.titulo} />
        <span className={STATUS_CLASS[selected.estado]}>
          {STATUS_LABELS[selected.estado]}
        </span>
      </div>
      <div className="ipdj-field">
        <label>Título</label>
        <input
          type="text"
          value={displayTitulo}
          onChange={(e) => setDraftTitulo(e.target.value)}
        />
      </div>
      <div className="ipdj-field">
        <label>Descripción</label>
        <input
          type="text"
          value={displayDescripcion}
          onChange={(e) => setDraftDescripcion(e.target.value)}
        />
      </div>
      <div className="ipdj-field">
        <label>Fecha de subida</label>
        <input
          type="text"
          value={new Date(selected.created_at).toLocaleDateString("es-MX")}
          readOnly
        />
      </div>

      {editMutation.isError && (
        <p style={{ color: "#fca5a5", fontSize: "12px", marginBottom: "10px" }}>
          {getErrorMessage(editMutation.error)}
        </p>
      )}

      <button
        className="ipdj-btn-save"
        disabled={!hasChanges || editMutation.isPending}
        onClick={() =>
          editMutation.mutate({
            id: selected.id_fotografia,
            titulo: draftTitulo ?? undefined,
            descripcion: draftDescripcion ?? undefined,
          })
        }
      >
        {editMutation.isPending ? "Guardando..." : "Guardar cambios"}
      </button>

      <div className="ipdj-danger-zone">
        <div className="dz-title">Zona de riesgo</div>
        <button
          className="ipdj-btn-danger"
          disabled={deleteMutation.isPending}
          onClick={() => handleDelete(selected.id_fotografia)}
        >
          {confirmingDeleteId === selected.id_fotografia
            ? "¿Confirmar? Toca de nuevo"
            : "Eliminar fotografía"}
        </button>
      </div>
    </>
  ) : (
    <p
      style={{
        color: "#71717a",
        fontSize: "13px",
        textAlign: "center",
        marginTop: "40px",
      }}
    >
      Selecciona una fotografía para ver su detalle.
    </p>
  );

  return (
    <AdminPageShell topbarTitle="Fotografías" sidePanel={sidePanel}>
      {mainContent}
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
