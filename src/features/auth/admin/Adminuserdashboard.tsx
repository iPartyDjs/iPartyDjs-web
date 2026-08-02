import { useMemo, useState, type JSX } from "react";
import AdminPageShell from "./AdminPageShell";
import "./AdminUsersDashboard.css";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Role = "Cliente" | "Fotografo" | "Admin";

interface UserRecord {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: Role;
  active: boolean;
  registeredAt: string;
  lastAccess: string;
}

/* ------------------------------------------------------------------ */
/*  Mock data (swap for API data)                                      */
/* ------------------------------------------------------------------ */

const USERS: UserRecord[] = [
  {
    id: "u1",
    firstName: "María",
    lastName: "González",
    email: "m.gonzalez@gmail.com",
    phone: "777 123 4567",
    role: "Cliente",
    active: true,
    registeredAt: "3 jun 2025",
    lastAccess: "Hoy",
  },
  {
    id: "u2",
    firstName: "Javier",
    lastName: "Reyes",
    email: "javier.reyes@hotmail.com",
    phone: "777 456 7890",
    role: "Fotografo",
    active: true,
    registeredAt: "15 ene 2025",
    lastAccess: "Ayer",
  },
  {
    id: "u3",
    firstName: "Ana",
    lastName: "López",
    email: "ana.lopez@gmail.com",
    phone: "777 321 6540",
    role: "Admin",
    active: true,
    registeredAt: "1 feb 2025",
    lastAccess: "2 jun 2025",
  },
  {
    id: "u4",
    firstName: "Valentina",
    lastName: "Ruiz",
    email: "v.ruiz@outlook.com",
    phone: "777 987 1234",
    role: "Cliente",
    active: true,
    registeredAt: "20 mar 2025",
    lastAccess: "30 may 2025",
  },
  {
    id: "u5",
    firstName: "Carlos",
    lastName: "Pérez",
    email: "cperez@empresa.mx",
    phone: "777 654 3210",
    role: "Cliente",
    active: false,
    registeredAt: "5 abr 2025",
    lastAccess: "10 abr 2025",
  },
];

const ROLE_LABEL: Record<Role, string> = {
  Cliente: "Cliente",
  Fotografo: "Fotógrafo",
  Admin: "Admin",
};

const ROLE_CLASS: Record<Role, string> = {
  Cliente: "role-pill role-cliente",
  Fotografo: "role-pill role-fotografo",
  Admin: "role-pill role-admin",
};

/* ------------------------------------------------------------------ */
/*  Icons                                                               */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

function initials(u: UserRecord): string {
  return (u.firstName[0] ?? "") + (u.lastName[0] ?? "");
}

const PAGE_SIZE = 5;

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

export default function Adminuserdashboard(): JSX.Element {
  const [users, setUsers] = useState<UserRecord[]>(USERS);
  const [selectedId, setSelectedId] = useState<string>(USERS[0].id);
  const [search, setSearch] = useState("");
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [draft, setDraft] = useState<Partial<UserRecord>>({});
  const [page, setPage] = useState(1);

  const selectedUser = useMemo(
    () => users.find((u) => u.id === selectedId) ?? users[0],
    [users, selectedId],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        ROLE_LABEL[u.role].toLowerCase().includes(q),
    );
  }, [users, search]);

  const stats = useMemo(() => {
    const total = users.length;
    const activos = users.filter((u) => u.active).length;
    const fotografos = users.filter((u) => u.role === "Fotografo").length;
    const inactivos = total - activos;
    return { total, activos, fotografos, inactivos };
  }, [users]);

  function selectUser(u: UserRecord) {
    setSelectedId(u.id);
    setDraft({});
  }

  function toggleCheck(id: string) {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleCheckAll(checked: boolean) {
    setCheckedIds(checked ? new Set(filtered.map((u) => u.id)) : new Set());
  }

  function handleDraftChange<K extends keyof UserRecord>(
    key: K,
    value: UserRecord[K],
  ) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  function saveChanges() {
    setUsers((prev) =>
      prev.map((u) => (u.id === selectedUser.id ? { ...u, ...draft } : u)),
    );
    setDraft({});
  }

  function deactivateUser() {
    setUsers((prev) =>
      prev.map((u) => (u.id === selectedUser.id ? { ...u, active: false } : u)),
    );
  }

  const displayFirst = draft.firstName ?? selectedUser.firstName;
  const displayLast = draft.lastName ?? selectedUser.lastName;
  const displayRole = (draft.role ?? selectedUser.role) as Role;
  const displayActive = draft.active ?? selectedUser.active;

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
            onChange={(e) => setSearch(e.target.value)}
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
                  checked={
                    filtered.length > 0 && checkedIds.size === filtered.length
                  }
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
            {filtered.slice(0, PAGE_SIZE).map((u) => (
              <tr
                key={u.id}
                className={u.id === selectedUser.id ? "selected" : ""}
                onClick={() => selectUser(u)}
              >
                <td onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={checkedIds.has(u.id)}
                    onChange={() => toggleCheck(u.id)}
                  />
                </td>
                <td>
                  <div className="ipdj-user-cell">
                    <div className="ipdj-avatar-sm">{initials(u)}</div>
                    <div>
                      <div className="u-name">
                        {u.firstName} {u.lastName}
                      </div>
                      <div className="u-mail">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={ROLE_CLASS[u.role]}>
                    {ROLE_LABEL[u.role]}
                  </span>
                </td>
                <td>
                  <span className={`ipdj-status ${u.active ? "on" : "off"}`}>
                    <span className={`ipdj-dot ${u.active ? "on" : "off"}`} />
                    {u.active ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="cell-muted">{u.registeredAt}</td>
                <td className="cell-muted">{u.lastAccess}</td>
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
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={7}
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
            Mostrando {Math.min(PAGE_SIZE, filtered.length)} de {users.length}{" "}
            usuarios
          </div>
          <div className="ipdj-pagination">
            <button
              className="ipdj-page-btn"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              ‹
            </button>
            {[1, 2, 3].map((n) => (
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
              onClick={() => setPage((p) => p + 1)}
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </>
  );

  const sidePanel = (
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
            {ROLE_LABEL[displayRole]} · {displayActive ? "Activo" : "Inactivo"}
          </div>
        </div>
      </div>

      <div className="ipdj-field">
        <label>Nombre</label>
        <input
          type="text"
          value={displayFirst}
          onChange={(e) => handleDraftChange("firstName", e.target.value)}
        />
      </div>
      <div className="ipdj-field">
        <label>Apellido</label>
        <input
          type="text"
          value={displayLast}
          onChange={(e) => handleDraftChange("lastName", e.target.value)}
        />
      </div>
      <div className="ipdj-field">
        <label>Correo</label>
        <input
          type="text"
          value={draft.email ?? selectedUser.email}
          onChange={(e) => handleDraftChange("email", e.target.value)}
        />
      </div>
      <div className="ipdj-field">
        <label>Teléfono</label>
        <input
          type="text"
          value={draft.phone ?? selectedUser.phone}
          onChange={(e) => handleDraftChange("phone", e.target.value)}
        />
      </div>
      <div className="ipdj-field">
        <label>Rol</label>
        <select
          value={displayRole}
          onChange={(e) => handleDraftChange("role", e.target.value as Role)}
        >
          <option value="Cliente">Cliente</option>
          <option value="Fotografo">Fotógrafo</option>
          <option value="Admin">Admin</option>
        </select>
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
  );

  return (
    <AdminPageShell topbarTitle="Gestión de usuarios" sidePanel={sidePanel}>
      {mainContent}
    </AdminPageShell>
  );
}
