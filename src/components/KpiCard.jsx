export default function KpiCard({ icon: Icon, value, label, color, bgColor, onClick }) {
  return (
    <div className="kpi-card" onClick={onClick} role={onClick ? 'button' : undefined} tabIndex={onClick ? 0 : undefined}>
      <div className="kpi-card-icon" style={{ background: bgColor || (color + '18'), color }}>
        <Icon size={20} />
      </div>
      <div className="kpi-card-value" style={{ color }}>{value}</div>
      <div className="kpi-card-label">{label}</div>
    </div>
  );
}
