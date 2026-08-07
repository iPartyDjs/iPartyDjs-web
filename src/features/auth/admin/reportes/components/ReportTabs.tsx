import "./ReportTabs.css";

export type ReportTabKey = "eventos" | "solicitudes" | "resenias";

interface ReportTabsProps {
  active: ReportTabKey;
  onChange: (key: ReportTabKey) => void;
}

const TABS: { key: ReportTabKey; label: string }[] = [
  { key: "eventos", label: "Reservas por Evento" },
  { key: "solicitudes", label: "Solicitudes por Estado" },
  { key: "resenias", label: "Distribución de Calificaciones" },
];

export default function ReportTabs({ active, onChange }: ReportTabsProps) {
  return (
    <div className="rep-tabs" role="tablist">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          type="button"
          role="tab"
          aria-selected={active === tab.key}
          className={`rep-tab ${active === tab.key ? "is-active" : ""}`}
          onClick={() => onChange(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
