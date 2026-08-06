import { useMemo, useState } from "react";
import AdminPageShell from "./AdminPageShell";
import "./Admincitas.css";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type CitaStatus = "Confirmada" | "Pendiente" | "Cancelada" | "Completada";

interface CitaRecord {
  id: string;
  cliente: string;
  clienteEmail: string;
  evento: string;
  fecha: string; // dd/mm/yyyy para el input date
  fechaLabel: string; // texto bonito para mostrar
  hora: string;
  dj: string;
  ubicacion: string;
  status: CitaStatus;
  notas: string;
}

/* ------------------------------------------------------------------ */
/*  Mock data (swap for API data)                                      */
/* ------------------------------------------------------------------ */

const DJS = ["Javier Reyes", "Diego Mora", "Luisa Cano", "Por asignar"];

const CITAS: CitaRecord[] = [
  {
    id: "c1",
    cliente: "María González",
    clienteEmail: "m.gonzalez@gmail.com",
    evento: "Boda — Jardín Las Fuentes",
    fecha: "2025-08-14",
    fechaLabel: "14 ago 2025",
    hora: "17:00",
    dj: "Javier Reyes",
    ubicacion: "Cuernavaca, Mor.",
    status: "Confirmada",
    notas: "Cliente pidió lista de reproducción especial para el vals.",
  },
  {
    id: "c2",
    cliente: "Valentina Ruiz",
    clienteEmail: "v.ruiz@outlook.com",
    evento: "XV Años — Salón Imperial",
    fecha: "2025-08-16",
    fechaLabel: "16 ago 2025",
    hora: "19:30",
    dj: "Diego Mora",
    ubicacion: "Jiutepec, Mor.",
    status: "Pendiente",
    notas: "Falta confirmar hora exacta del vals sorpresa.",
  },
  {
    id: "c3",
    cliente: "Carlos Pérez",
    clienteEmail: "cperez@empresa.mx",
    evento: "Evento corporativo — Grupo Empresa MX",
    fecha: "2025-08-05",
    fechaLabel: "5 ago 2025",
    hora: "09:00",
    dj: "Luisa Cano",
    ubicacion: "Temixco, Mor.",
    status: "Completada",
    notas: "",
  },
  {
    id: "c4",
    cliente: "Ana López",
    clienteEmail: "ana.lopez@gmail.com",
    evento: "Cumpleaños — Casa particular",
    fecha: "2025-08-20",
    fechaLabel: "20 ago 2025",
    hora: "15:00",
    dj: "Por asignar",
    ubicacion: "Cuernavaca, Mor.",
    status: "Pendiente",
    notas: "Cliente aún no confirma número de invitados.",
  },
  {
    id: "c5",
    cliente: "Javier Reyes Jr.",
    clienteEmail: "jr.reyes@gmail.com",
    evento: "Graduación — Prepa Morelos",
    fecha: "2025-07-28",
    fechaLabel: "28 jul 2025",
    hora: "20:00",
    dj: "Javier Reyes",
    ubicacion: "Cuernavaca, Mor.",
    status: "Cancelada",
    notas: "Cliente canceló por cambio de sede.",
  },
  {
    id: "c6",
    cliente: "Valentina Ruiz",
    clienteEmail: "v.ruiz@outlook.com",
    evento: "Aniversario — Terraza Vista Hermosa",
    fecha: "2025-08-30",
    fechaLabel: "30 ago 2025",
    hora: "18:00",
    dj: "Diego Mora",
    ubicacion: "Cuernavaca, Mor.",
    status: "Confirmada",
    notas: "",
  },
];

const STATUS_CLASS: Record<CitaStatus, string> = {
  Confirmada: "cita-pill confirmada",
  Pendiente: "cita-pill pendiente",
  Cancelada: "cita-pill cancelada",
  Completada: "cita-pill completada",
};

const PAGE_SIZE = 6;

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

export default function AdminCitas() {
  const [citas, setCitas] = useState<CitaRecord[]>(CITAS);
  const [selectedId, setSelectedId] = useState<string>(CITAS[0].id);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"Todos" | CitaStatus>(
    "Todos",
  );
  const [draft, setDraft] = useState<Partial<CitaRecord>>({});

  const selected = useMemo(
    () => citas.find((c) => c.id === selectedId) ?? citas[0],
    [citas, selectedId],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return citas.filter((c) => {
      const matchesQuery =
        !q ||
        c.cliente.toLowerCase().includes(q) ||
        c.evento.toLowerCase().includes(q) ||
        c.dj.toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === "Todos" || c.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [citas, search, statusFilter]);

  const stats = useMemo(() => {
    const total = citas.length;
    const confirmadas = citas.filter((c) => c.status === "Confirmada").length;
    const pendientes = citas.filter((c) => c.status === "Pendiente").length;
    const canceladas = citas.filter((c) => c.status === "Cancelada").length;
    return { total, confirmadas, pendientes, canceladas };
  }, [citas]);

  function select(c: CitaRecord) {
    setSelectedId(c.id);
    setDraft({});
  }

  function handleDraftChange<K extends keyof CitaRecord>(
    key: K,
    value: CitaRecord[K],
  ) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  function saveChanges() {
    setCitas((prev) =>
      prev.map((c) => (c.id === selected.id ? { ...c, ...draft } : c)),
    );
    setDraft({});
  }

  function cancelCita() {
    setCitas((prev) =>
      prev.map((c) =>
        c.id === selected.id ? { ...c, status: "Cancelada" } : c,
      ),
    );
  }

  const displayEvento = draft.evento ?? selected.evento;
  const displayFecha = draft.fecha ?? selected.fecha;
  const displayHora = draft.hora ?? selected.hora;
  const displayDj = (draft.dj ?? selected.dj) as string;
  const displayUbicacion = draft.ubicacion ?? selected.ubicacion;
  const displayStatus = (draft.status ?? selected.status) as CitaStatus;
  const displayNotas = draft.notas ?? selected.notas;

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
        <div className="ipdj-stat-card green">
          <div className="num">{stats.confirmadas}</div>
          <div className="lbl">Confirmadas</div>
        </div>
        <div className="ipdj-stat-card gold">
          <div className="num">{stats.pendientes}</div>
          <div className="lbl">Pendientes</div>
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
            placeholder="Buscar por cliente, evento o DJ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="ipdj-filter-select"
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as "Todos" | CitaStatus)
          }
        >
          <option value="Todos">Todos los estados</option>
          <option value="Confirmada">Confirmadas</option>
          <option value="Pendiente">Pendientes</option>
          <option value="Completada">Completadas</option>
          <option value="Cancelada">Canceladas</option>
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

      <div className="ipdj-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Evento</th>
              <th>Fecha y hora</th>
              <th>DJ asignado</th>
              <th>Estado</th>
              <th style={{ width: 90 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, PAGE_SIZE).map((c) => (
              <tr
                key={c.id}
                className={c.id === selected.id ? "selected" : ""}
                onClick={() => select(c)}
              >
                <td>
                  <div className="u-name">{c.cliente}</div>
                  <div className="u-mail">{c.clienteEmail}</div>
                </td>
                <td className="cell-muted">{c.evento}</td>
                <td>
                  <div className="u-name">{c.fechaLabel}</div>
                  <div className="u-mail">{c.hora} hrs</div>
                </td>
                <td className="cell-muted">{c.dj}</td>
                <td>
                  <span className={STATUS_CLASS[c.status]}>{c.status}</span>
                </td>
                <td onClick={(e) => e.stopPropagation()}>
                  <div className="ipdj-actions-cell">
                    <button
                      className="ipdj-act-btn"
                      title="Editar"
                      onClick={() => select(c)}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="cell-muted"
                  style={{ textAlign: "center", padding: 24 }}
                >
                  No se encontraron citas para "{search}".
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="ipdj-table-footer">
          <div className="count">
            Mostrando {Math.min(PAGE_SIZE, filtered.length)} de {citas.length}{" "}
            citas
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

  const sidePanel = (
    <>
      <h3>Detalle de cita</h3>

      <div className="ipdj-cita-client">
        <div className="ipdj-avatar-lg">
          {selected.cliente
            .split(" ")
            .slice(0, 2)
            .map((w) => w[0])
            .join("")}
        </div>
        <div>
          <div className="ep-name">{selected.cliente}</div>
          <div className="ep-sub">{selected.clienteEmail}</div>
        </div>
      </div>

      <div className="ipdj-field">
        <label>Evento</label>
        <input
          type="text"
          value={displayEvento}
          onChange={(e) => handleDraftChange("evento", e.target.value)}
        />
      </div>
      <div className="ipdj-field-row">
        <div className="ipdj-field">
          <label>Fecha</label>
          <input
            type="date"
            value={displayFecha}
            onChange={(e) => handleDraftChange("fecha", e.target.value)}
          />
        </div>
        <div className="ipdj-field">
          <label>Hora</label>
          <input
            type="time"
            value={displayHora}
            onChange={(e) => handleDraftChange("hora", e.target.value)}
          />
        </div>
      </div>
      <div className="ipdj-field">
        <label>DJ asignado</label>
        <select
          value={displayDj}
          onChange={(e) => handleDraftChange("dj", e.target.value)}
        >
          {DJS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>
      <div className="ipdj-field">
        <label>Ubicación</label>
        <input
          type="text"
          value={displayUbicacion}
          onChange={(e) => handleDraftChange("ubicacion", e.target.value)}
        />
      </div>
      <div className="ipdj-field">
        <label>Estado</label>
        <select
          value={displayStatus}
          onChange={(e) =>
            handleDraftChange("status", e.target.value as CitaStatus)
          }
        >
          <option value="Confirmada">Confirmada</option>
          <option value="Pendiente">Pendiente</option>
          <option value="Completada">Completada</option>
          <option value="Cancelada">Cancelada</option>
        </select>
      </div>
      <div className="ipdj-field">
        <label>Notas internas</label>
        <textarea
          rows={3}
          value={displayNotas}
          onChange={(e) => handleDraftChange("notas", e.target.value)}
        />
      </div>

      <button className="ipdj-btn-save" onClick={saveChanges}>
        Guardar cambios
      </button>

      <div className="ipdj-danger-zone">
        <div className="dz-title">Zona de riesgo</div>
        <button className="ipdj-btn-danger" onClick={cancelCita}>
          Cancelar cita
        </button>
      </div>
    </>
  );

  return (
    <AdminPageShell topbarTitle="Citas" navKey="citas" sidePanel={sidePanel}>
      {mainContent}
    </AdminPageShell>
  );
}
