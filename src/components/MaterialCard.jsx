import { useNavigate } from 'react-router-dom';
import { Package } from 'lucide-react';
import { useStore } from '../hooks/useStore';
import StockBadge from './StockBadge';
import { UNIT_LABELS } from '../data/constants';

export default function MaterialCard({ material }) {
  const navigate = useNavigate();
  const { getCategoryName, getCategoryColor } = useStore();
  const available = material.current_stock - material.reserved_stock;

  return (
    <div
      className="material-card"
      onClick={() => navigate(`/material/${material.id}`)}
      role="button"
      tabIndex={0}
    >
      <div
        className="material-card-icon"
        style={{ background: getCategoryColor(material.category_id) + '18', color: getCategoryColor(material.category_id) }}
      >
        <Package size={20} />
      </div>
      <div className="material-card-content">
        <div className="material-card-name">{material.name}</div>
        <div className="material-card-meta">
          <span className="category-badge">
            <span className="category-dot" style={{ background: getCategoryColor(material.category_id) }} />
            {getCategoryName(material.category_id)}
          </span>
          {material.article_number && (
            <span className="text-xs text-tertiary">{material.article_number}</span>
          )}
        </div>
      </div>
      <div className="material-card-stock">
        <div className="material-card-stock-value" style={{
          color: material.current_stock <= material.min_stock ? 'var(--color-danger)' :
            material.current_stock <= material.min_stock * 1.5 ? 'var(--color-warning)' :
            'var(--color-text)'
        }}>
          {available}
        </div>
        <div className="material-card-stock-unit">
          {UNIT_LABELS[material.unit] || material.unit}
          {material.reserved_stock > 0 && (
            <span style={{ color: 'var(--color-warning)', display: 'block', fontSize: '10px' }}>
              +{material.reserved_stock} res.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
