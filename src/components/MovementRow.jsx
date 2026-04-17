import { useStore } from '../hooks/useStore';
import { MOVEMENT_TYPE_LABELS, MOVEMENT_TYPE_COLORS, UNIT_LABELS } from '../data/constants';
import { PackagePlus, PackageMinus, PackageCheck, PenLine, BookmarkPlus, BookmarkMinus } from 'lucide-react';

const iconMap = {
  eingang: PackagePlus,
  entnahme: PackageMinus,
  rueckgabe: PackageCheck,
  korrektur: PenLine,
  reservierung: BookmarkPlus,
  reservierung_aufloesen: BookmarkMinus,
};

function formatTime(isoString) {
  const d = new Date(isoString);
  const now = new Date();
  const diffMs = now - d;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'Gerade eben';
  if (diffMin < 60) return `vor ${diffMin} Min`;
  if (diffHours < 24) return `vor ${diffHours} Std`;
  if (diffDays < 7) return `vor ${diffDays} Tag${diffDays > 1 ? 'en' : ''}`;
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
}

export default function MovementRow({ movement }) {
  const { getMaterialName, getProjectName } = useStore();
  const Icon = iconMap[movement.type] || PenLine;
  const color = MOVEMENT_TYPE_COLORS[movement.type] || '#6B7280';
  const material = getMaterialName(movement.material_id);

  const isPositive = ['eingang', 'rueckgabe'].includes(movement.type);
  const isNeutral = ['korrektur', 'reservierung', 'reservierung_aufloesen'].includes(movement.type);
  const qtyClass = isPositive ? 'positive' : isNeutral ? 'neutral' : 'negative';
  const qtyPrefix = isPositive ? '+' : movement.type === 'entnahme' ? '-' : '';

  return (
    <div className="movement-row">
      <div className="movement-icon" style={{ background: color + '18', color }}>
        <Icon size={18} />
      </div>
      <div className="movement-content">
        <div className="movement-title">{material || 'Unbekannt'}</div>
        <div className="movement-meta">
          {MOVEMENT_TYPE_LABELS[movement.type]}
          {movement.project_id && ` · ${getProjectName(movement.project_id)}`}
          {' · '}{formatTime(movement.created_at)}
        </div>
      </div>
      <div className={`movement-quantity ${qtyClass}`}>
        {qtyPrefix}{movement.quantity}
      </div>
    </div>
  );
}
