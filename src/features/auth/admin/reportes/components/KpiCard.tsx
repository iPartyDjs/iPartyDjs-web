interface KpiCardProps {
  label: string;
  valor: string | number;
  destacado?: boolean;
}

export default function KpiCard({ label, valor, destacado }: KpiCardProps) {
  return (
    <div className={"ipdj-stat-card" + (destacado ? " destacado" : "")}>
      <span className="ipdj-stat-valor">{valor}</span>
      <span className="ipdj-stat-label">{label}</span>
    </div>
  );
}
