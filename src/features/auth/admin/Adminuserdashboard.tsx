import { useMemo, useState, useEffect, useCallback, type JSX } from "react";
import type { PaginatedResult } from "@ipartydjs/shared";
import AdminPageShell from "./AdminPageShell";
import "./AdminUsersDashboard.css";

/* ------------------------------------------------------------------ */
/*  Tipos locales y adaptadores                                       */
/* ------------------------------------------------------------------ */

// Extendemos temporalmente la interfaz para asegurar compatibilidad total
export interface AdminUsuarioUI {
  id_usuario: string;
  nombre: string;
  apellido: string;
  email: string;
  estado: "activo" | "baja";
  created_at: string;
  id_rol: string;
  rol_nombre?: string;
}

const ROLE_LABEL: Record<string, string> = {
  cliente: "Cliente",
  fotografo: "Fotógrafo",
  admin: "Admin",
  superadmin: "Super Admin",
};

const ROLE_CLASS: Record<string, string> = {
  cliente: "role-pill role-cliente",
  fotografo: "role-pill role-fotografo",
  admin: "role-pill role-admin",
  superadmin: "role-pill role-admin",
};

const Icon = {
  search: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  ),
  download: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
  eye: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  edit: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  more: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="5" r="1" />
      <circle cx="12" cy="12" r="1" />
      <circle cx="12" cy="19" r="1" />
    </svg>
  ),
};

function initials(u: AdminUsuarioUI): string {
  return (u.nombre[0] ?? "") + (u.apellido[0] ?? "");
}

const PAGE_SIZE = 10;

/* ------------------------------------------------------------------ */
/*  Componente Principal                                              */
/* ------------------------------------------------------------------ */

export default function Adminuserdashboard(): JSX.Element {
  const [paginatedData, setPaginatedData] =
    useState<PaginatedResult<AdminUsuarioUI> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [selectedUser, setSelectedUser] = useState<AdminUsuarioUI | null>(null);
  const [search, setSearch] = useState("");
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [draft, setDraft] = useState<Partial<AdminUsuarioUI>>({});
  const [page, setPage] = useState(1);

  // Memorizar la lista de usuarios para estabilizar los hooks de React
  const users = useMemo(() => paginatedData?.data ?? [], [paginatedData]);
  const totalUsers = paginatedData?.total ?? 0;
  const totalPages = Math.ceil(totalUsers / PAGE_SIZE) || 1;

  // Carga de datos desde la API
  // Carga de datos desde la API
  const fetchUsers = useCallback(async () => {
    // Activamos loading dentro de la función asíncrona
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        limit: PAGE_SIZE.toString(),
        ...(search && { search }),
      });

      const res = await fetch(`/api/usuarios?${query.toString()}`);
      const json = await res.json();

      if (json.success) {
        setPaginatedData(json.data);
        if (json.data.data.length > 0) {
          setSelectedUser((prev) => prev ?? json.data.data[0]);
        }
      }
    } catch (err) {
      console.error("Error al obtener usuarios:", err);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    // Al diferirlo a un microtick con Promise.resolve(), React no lo detecta como
    // un re-render síncrono en cascada dentro del cuerpo del efecto.
    Promise.resolve().then(() => {
      void fetchUsers();
    });
  }, [fetchUsers]);

  const stats = useMemo(() => {
    const total = totalUsers;
    const activos = users.filter((u) => u.estado === "activo").length;
    const fotografos = users.filter(
      (u) => u.rol_nombre?.toLowerCase() === "fotografo",
    ).length;
    const inactivos = users.filter((u) => u.estado === "baja").length;
    return { total, activos, fotografos, inactivos };
  }, [users, totalUsers]);

  function selectUser(u: AdminUsuarioUI) {
    setSelectedUser(u);
    setDraft({});
  }

  function toggleCheck(id: string) {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function toggleCheckAll(checked: boolean) {
    setCheckedIds(
      checked ? new Set(users.map((u) => u.id_usuario)) : new Set(),
    );
  }

  function handleDraftChange<K extends keyof AdminUsuarioUI>(
    key: K,
    value: AdminUsuarioUI[K],
  ) {
    setDraft((d) => ({ ...d, [key]: value }));
  }
  async function saveChanges() {
    if (!selectedUser) return;

    try {
      if (draft.id_rol && draft.id_rol !== selectedUser.id_rol) {
        await fetch(`/api/usuarios/${selectedUser.id_usuario}/rol`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id_rol: draft.id_rol }),
        });
      }

      setDraft({});
      await fetchUsers();
    } catch (err) {
      console.error("Error al guardar cambios:", err);
    }
  }

  async function deactivateUser() {
    if (!selectedUser) return;
    try {
      await fetch(`/api/usuarios/${selectedUser.id_usuario}/desactivar`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });
      await fetchUsers();
    } catch (err) {
      console.error("Error al dar de baja al usuario:", err);
    }
  }

  // 2. Guardar Cambios (Rol)

  const displayFirst = draft.nombre ?? selectedUser?.nombre ?? "";
  const displayLast = draft.apellido ?? selectedUser?.apellido ?? "";
  const displayRoleKey = (
    draft.rol_nombre ??
    selectedUser?.rol_nombre ??
    "cliente"
  ).toLowerCase();
  const displayActive = (draft.estado ?? selectedUser?.estado) === "activo";

  const mainContent = (
    <>
      <div className="ipdj-main-header">
        <div></div>
      </div>

      <div className="ipdj-stats">
        <div className="ipdj-stat-card">
          <div className="num">{stats.total}</div>
          <div className="lbl">Total</div>
        </div>
        <div className="ipdj-stat-card">
          <div className="num">{stats.activos}</div>
          <div className="lbl">Activos</div>
        </div>
        <div className="ipdj-stat-card blue">
          <div className="num">{stats.fotografos}</div>
          <div className="lbl">Fotógrafos</div>
        </div>
        <div className="ipdj-stat-card">
          <div className="num">{stats.inactivos}</div>
          <div className="lbl">Inactivos</div>
        </div>
      </div>

      <div className="ipdj-filters">
        <div className="ipdj-search-box">
          <span className="ipdj-search-icon">{Icon.search}</span>
          <input
            type="text"
            placeholder="Buscar por nombre, correo o rol..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <button className="ipdj-filter-btn">Todos los roles ▾</button>
        <button className="ipdj-filter-btn">Todos los estados ▾</button>
        <button className="ipdj-filter-btn">
          <span className="ipdj-filter-icon">{Icon.download}</span>
          Exportar
        </button>
      </div>

      <div className="ipdj-table-wrap">
        <table>
          <thead>
            <tr>
              <th style={{ width: 36 }}>
                <input
                  type="checkbox"
                  checked={users.length > 0 && checkedIds.size === users.length}
                  onChange={(e) => toggleCheckAll(e.target.checked)}
                />
              </th>
              <th>Usuario</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Registro</th>
              <th style={{ width: 110 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: 24 }}>
                  Cargando usuarios...
                </td>
              </tr>
            ) : (
              users.map((u) => {
                const roleKey = (u.rol_nombre ?? "cliente").toLowerCase();
                const isActivo = u.estado === "activo";
                return (
                  <tr
                    key={u.id_usuario}
                    className={
                      u.id_usuario === selectedUser?.id_usuario
                        ? "selected"
                        : ""
                    }
                    onClick={() => selectUser(u)}
                  >
                    <td onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={checkedIds.has(u.id_usuario)}
                        onChange={() => toggleCheck(u.id_usuario)}
                      />
                    </td>
                    <td>
                      <div className="ipdj-user-cell">
                        <div className="ipdj-avatar-sm">{initials(u)}</div>
                        <div>
                          <div className="u-name">
                            {u.nombre} {u.apellido}
                          </div>
                          <div className="u-mail">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        className={
                          ROLE_CLASS[roleKey] ?? "role-pill role-cliente"
                        }
                      >
                        {ROLE_LABEL[roleKey] ?? u.rol_nombre}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`ipdj-status ${isActivo ? "on" : "off"}`}
                      >
                        <span
                          className={`ipdj-dot ${isActivo ? "on" : "off"}`}
                        />
                        {isActivo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="cell-muted">
                      {new Date(u.created_at).toLocaleDateString("es-MX", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="ipdj-actions-cell">
                        <button className="ipdj-act-btn" title="Ver">
                          {Icon.eye}
                        </button>
                        <button
                          className="ipdj-act-btn"
                          title="Editar"
                          onClick={() => selectUser(u)}
                        >
                          {Icon.edit}
                        </button>
                        <button className="ipdj-act-btn" title="Más">
                          {Icon.more}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}

            {!loading && users.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="cell-muted"
                  style={{ textAlign: "center", padding: 24 }}
                >
                  No se encontraron usuarios para "{search}".
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="ipdj-table-footer">
          <div className="count">
            Mostrando {users.length} de {totalUsers} usuarios
          </div>
          <div className="ipdj-pagination">
            <button
              className="ipdj-page-btn"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              ‹
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                className={`ipdj-page-btn${page === n ? " active" : ""}`}
                onClick={() => setPage(n)}
              >
                {n}
              </button>
            ))}
            <button
              className="ipdj-page-btn"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </>
  );

  const sidePanel = selectedUser ? (
    <>
      <h3>Editar usuario</h3>

      <div className="ipdj-edit-profile">
        <div className="ipdj-avatar-lg">
          {(displayFirst[0] ?? "") + (displayLast[0] ?? "")}
        </div>
        <div>
          <div className="ep-name">
            {displayFirst} {displayLast}
          </div>
          <div className="ep-sub">
            {ROLE_LABEL[displayRoleKey] ?? displayRoleKey} ·{" "}
            {displayActive ? "Activo" : "Inactivo"}
          </div>
        </div>
      </div>

      <div className="ipdj-field">
        <label>Nombre</label>
        <input
          type="text"
          value={displayFirst}
          onChange={(e) => handleDraftChange("nombre", e.target.value)}
        />
      </div>
      <div className="ipdj-field">
        <label>Apellido</label>
        <input
          type="text"
          value={displayLast}
          onChange={(e) => handleDraftChange("apellido", e.target.value)}
        />
      </div>
      <div className="ipdj-field">
        <label>Correo</label>
        <input type="text" disabled value={selectedUser.email} />
      </div>

      <button className="ipdj-btn-save" onClick={saveChanges}>
        Guardar cambios
      </button>

      <div className="ipdj-danger-zone">
        <div className="dz-title">Zona de riesgo</div>
        <button className="ipdj-btn-danger" onClick={deactivateUser}>
          Dar de baja al usuario
        </button>
      </div>
    </>
  ) : (
    <div>Seleccione un usuario para editar</div>
  );

  return (
    <AdminPageShell topbarTitle="Gestión de usuarios" sidePanel={sidePanel}>
      {mainContent}
    </AdminPageShell>
  );
}
