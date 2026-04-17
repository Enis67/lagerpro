import { UNIT_LABELS } from '../data/constants';

export default function StockBadge({ material }) {
  const { current_stock, reserved_stock, min_stock } = material;
  const available = current_stock - reserved_stock;

  let status, label;
  if (current_stock === 0) {
    status = 'empty';
    label = 'Leer';
  } else if (current_stock <= min_stock) {
    status = 'critical';
    label = 'Kritisch';
  } else if (current_stock <= min_stock * 1.5) {
    status = 'warning';
    label = 'Knapp';
  } else {
    status = 'ok';
    label = 'OK';
  }

  return (
    <span className={`stock-badge stock-badge--${status}`}>
      <span className={`stock-dot stock-dot--${status}`} />
      {available} {UNIT_LABELS[material.unit] || material.unit}
    </span>
  );
}

export function StockDot({ material }) {
  const { current_stock, min_stock } = material;
  let status;
  if (current_stock === 0) status = 'empty';
  else if (current_stock <= min_stock) status = 'critical';
  else if (current_stock <= min_stock * 1.5) status = 'warning';
  else status = 'ok';
  return <span className={`stock-dot stock-dot--${status}`} />;
}
