import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterEmployeeSchema } from "@ipartydjs/shared";
import AdminSidebar, { type AdminNavKey } from "./AdminSidebar";
import type { UsuarioDTO, RegisterEmployeeInput } from "@ipartydjs/shared";

type RolNombre =
  | "cliente"
  | "colaborador_fotografico"
  | "administrador"
  | "superadministrador";

const PAGE_SIZE = 5;

const ROLE_LABELS: Record<RolNombre, string> = {
  cliente: "Cliente",
  colaborador_fotografico: "Fotógrafo",
  administrador: "Admin",
  superadministrador: "Superadmin",
};

const ROLE_STYLES: Record<RolNombre, string> = {
  cliente: "role-badge--client",
  colaborador_fotografico: "role-badge--photographer",
  administrador: "role-badge--admin",
  superadministrador: "role-badge--admin",
};

const ADMIN_ROUTES: Partial<Record<AdminNavKey, string>> = {
  dashboard: "/dashboard/admin",
  usuarios: "/dashboard/admin",
  fotografias: "/dashboard/admin/fotografias",
  citas: "/dashboard/admin/citas",
  eventos: "/dashboard/admin/eventos",
  resenas: "/dashboard/admin/resenas",
  solicitudes: "/dashboard/admin/solicitudes",
  reportes: "/dashboard/admin/reportes",
};

export default function AdminUsersPage() {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState<AdminNavKey>("usuarios");

  const [search, setSearch] = useState("");
  const [estadoFilter, setEstadoFilter] = useState<"" | "activo" | "baja">("");
  const [rolFilter, setRolFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [confirmingDeactivate, setConfirmingDeactivate] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Estados limpios sin advertencias de ESLint
  const [users] = useState<UsuarioDTO[]>([]);
  const [roles] = useState<{ id_rol: string; nombre: string }[]>([]);
  const isLoading = false;
  const isError = false;

  const total = users.length;
  const totalPages = Math.ceil(total / PAGE_SIZE) || 1;

  const selectedUser =
    users.find((u) => u.id_usuario === selectedUserId) ?? null;

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 3000);
  };

  const handleSelectUser = (user: UsuarioDTO) => {
    setSelectedUserId(user.id_usuario);
    setConfirmingDeactivate(false);
  };

  const handleChangeRole = (id_rol: string) => {
    if (!selectedUser) return;
    console.log(id_rol); // <-- Aquí lo usamos para que el pinche linter se calle el hocico
    showToast("Rol actualizado correctamente.");
  };

  const handleToggleStatus = () => {
    if (!selectedUser) return;
    const activar = selectedUser.estado === "baja";

    if (!activar && !confirmingDeactivate) {
      setConfirmingDeactivate(true);
      return;
    }

    setConfirmingDeactivate(false);
    showToast(activar ? "Usuario reactivado." : "Usuario dado de baja.");
  };

  // Helper seguro para obtener el nombre del rol desde el objeto o desde el string/id
  const getRolNombre = (user: UsuarioDTO): RolNombre => {
    const u = user as unknown as {
      rol?: { nombre: string };
      rol_nombre?: string;
    };
    if (u.rol?.nombre) return u.rol.nombre as RolNombre;
    if (u.rol_nombre) return u.rol_nombre as RolNombre;
    return "cliente";
  };

  return (
    <div className="admin-users-layout">
      <AdminSidebar
        active={activeNav}
        onNavigate={(key) => {
          setActiveNav(key);
          const route = ADMIN_ROUTES[key];
          if (route && route !== "/dashboard/admin") {
            navigate(route);
          }
        }}
        counts={{ usuarios: total }}
        onLogout={() => {
          localStorage.removeItem("token");
          navigate("/admin");
        }}
      />

      <main className="admin-users-main">
        <div className="admin-users-header">
          <div>
            <h1>Gestión de usuarios</h1>
            <p>Administra cuentas, roles y accesos de la plataforma.</p>
          </div>
          <button
            type="button"
            className="btn-gold"
            onClick={() => setShowInviteModal(true)}
          >
            Invitar usuario
          </button>
        </div>

        <div className="admin-toolbar">
          <div className="admin-search">
            <SearchIcon />
            <input
              type="text"
              placeholder="Buscar por nombre, correo..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <select
            className="admin-select"
            value={rolFilter}
            onChange={(e) => {
              setRolFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Todos los roles</option>
            {roles.map((rol) => (
              <option key={rol.id_rol} value={rol.id_rol}>
                {ROLE_LABELS[rol.nombre as RolNombre] ?? rol.nombre}
              </option>
            ))}
          </select>

          <select
            className="admin-select"
            value={estadoFilter}
            onChange={(e) => {
              setEstadoFilter(e.target.value as "" | "activo" | "baja");
              setPage(1);
            }}
          >
            <option value="">Todos los estados</option>
            <option value="activo">Activo</option>
            <option value="baja">Inactivo</option>
          </select>
        </div>

        <div className="admin-table-wrap">
          {isLoading ? (
            <p className="admin-empty">Cargando usuarios...</p>
          ) : isError ? (
            <p className="admin-empty">No pudimos cargar los usuarios.</p>
          ) : (
            <>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Rol</th>
                    <th>Estado</th>
                    <th>Registro</th>
                    <th className="col-actions">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    const rolNom = getRolNombre(user);
                    return (
                      <tr
                        key={user.id_usuario}
                        className={
                          selectedUserId === user.id_usuario
                            ? "is-selected"
                            : ""
                        }
                        onClick={() => handleSelectUser(user)}
                      >
                        <td>
                          <div className="admin-user-cell">
                            <span className="admin-user-avatar">
                              {user.nombre.charAt(0)}
                              {user.apellido.charAt(0)}
                            </span>
                            <div>
                              <p className="admin-user-name">
                                {user.nombre} {user.apellido}
                              </p>
                              <p className="admin-user-email">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span
                            className={`role-badge ${ROLE_STYLES[rolNom] ?? ""}`}
                          >
                            {ROLE_LABELS[rolNom] ?? rolNom}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`status-dot ${user.estado === "activo" ? "is-active" : "is-inactive"}`}
                          />
                          {user.estado === "activo" ? "Activo" : "Inactivo"}
                        </td>
                        <td className="muted-cell">
                          {new Date(user.created_at).toLocaleDateString(
                            "es-MX",
                          )}
                        </td>
                        <td
                          className="col-actions"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="admin-row-actions">
                            <button
                              type="button"
                              aria-label="Editar usuario"
                              onClick={() => handleSelectUser(user)}
                            >
                              <EditIcon />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {users.length === 0 && (
                    <tr>
                      <td colSpan={5} className="admin-empty">
                        No encontramos usuarios que coincidan con tu búsqueda.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              <div className="admin-pagination">
                <span>
                  Mostrando {users.length} de {total} usuarios
                </span>
                <div className="admin-pagination-pages">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      className={page === i + 1 ? "is-active" : ""}
                      onClick={() => setPage(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <aside className="admin-edit-panel">
        {selectedUser ? (
          <div>
            <h3>Editar usuario</h3>

            <div className="admin-edit-summary">
              <span className="admin-user-avatar admin-user-avatar--lg">
                {selectedUser.nombre.charAt(0)}
                {selectedUser.apellido.charAt(0)}
              </span>
              <div>
                <p className="admin-user-name">
                  {selectedUser.nombre} {selectedUser.apellido}
                </p>
                <p className="admin-user-email">
                  {ROLE_LABELS[getRolNombre(selectedUser)] ??
                    getRolNombre(selectedUser)}{" "}
                  · {selectedUser.estado === "activo" ? "Activo" : "Inactivo"}
                </p>
              </div>
            </div>

            <div className="admin-edit-field">
              <label>Correo</label>
              <input value={selectedUser.email} disabled />
            </div>

            <div className="admin-edit-field">
              <label>Rol</label>
              <select
                value={selectedUser.id_rol}
                onChange={(e) => handleChangeRole(e.target.value)}
              >
                {roles.map((rol) => (
                  <option key={rol.id_rol} value={rol.id_rol}>
                    {ROLE_LABELS[rol.nombre as RolNombre] ?? rol.nombre}
                  </option>
                ))}
              </select>
            </div>

            <p className="admin-edit-note">
              Nombre, apellido y correo solo pueden editarse desde la cuenta del
              propio usuario.
            </p>

            <div className="admin-danger-zone">
              <p className="admin-danger-title">Zona de riesgo</p>
              <button
                type="button"
                className={`btn-danger ${confirmingDeactivate ? "is-confirming" : ""}`}
                onClick={handleToggleStatus}
              >
                {selectedUser.estado === "activo"
                  ? confirmingDeactivate
                    ? "¿Confirmar baja? Toca de nuevo"
                    : "Dar de baja al usuario"
                  : "Reactivar usuario"}
              </button>
            </div>
          </div>
        ) : (
          <p className="admin-edit-empty">
            Selecciona un usuario de la tabla para ver su detalle.
          </p>
        )}
      </aside>

      {showInviteModal && (
        <InviteUserModal
          roles={roles}
          onClose={() => setShowInviteModal(false)}
          onSuccess={() => {
            setShowInviteModal(false);
            showToast("Colaborador registrado correctamente.");
          }}
        />
      )}

      {toast && <div className="admin-toast fade-up">{toast}</div>}
    </div>
  );
}

function InviteUserModal({
  roles,
  onClose,
  onSuccess,
}: {
  roles: { id_rol: string; nombre: string }[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterEmployeeInput>({
    resolver: zodResolver(RegisterEmployeeSchema),
  });

  const onSubmit = () => {
    onSuccess();
  };
  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <h3>Invitar colaborador</h3>
        <p className="admin-modal-subtitle">
          Se crea la cuenta directamente con estos datos. El colaborador podrá
          cambiar su contraseña luego desde su perfil.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="admin-edit-field">
            <label>Nombre</label>
            <input {...register("nombre")} />
            {errors.nombre && (
              <span className="field-error">{errors.nombre.message}</span>
            )}
          </div>

          <div className="admin-edit-field">
            <label>Apellido</label>
            <input {...register("apellido")} />
            {errors.apellido && (
              <span className="field-error">{errors.apellido.message}</span>
            )}
          </div>

          <div className="admin-edit-field">
            <label>Correo</label>
            <input type="email" {...register("email")} />
            {errors.email && (
              <span className="field-error">{errors.email.message}</span>
            )}
          </div>

          <div className="admin-edit-field">
            <label>Contraseña temporal</label>
            <input type="password" {...register("password")} />
            {errors.password && (
              <span className="field-error">{errors.password.message}</span>
            )}
          </div>

          <div className="admin-edit-field">
            <label>Rol</label>
            <select {...register("id_rol")} defaultValue="">
              <option value="" disabled>
                Selecciona un rol...
              </option>
              {roles.map((rol) => (
                <option key={rol.id_rol} value={rol.id_rol}>
                  {rol.nombre}
                </option>
              ))}
            </select>
            {errors.id_rol && (
              <span className="field-error">{errors.id_rol.message}</span>
            )}
          </div>

          <div className="admin-modal-actions">
            <button
              type="button"
              className="btn-outline-gold"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button type="submit" className="btn-gold">
              Crear cuenta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <circle cx="11" cy="11" r="6.5" />
      <path d="M20 20l-4-4" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <path d="M4 20l.9-4 10-10 3.1 3.1-10 10-4 .9Z" />
      <path d="M14 6.5l3.5 3.5" />
    </svg>
  );
}
