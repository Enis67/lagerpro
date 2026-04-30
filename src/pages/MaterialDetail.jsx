import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Edit, Trash2, Zap, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { useStore } from '../hooks/useStore';
import { UNIT_LABELS } from '../data/constants';
import { openSoneparForMaterial } from '../services/sonepar';
import MovementRow from '../components/MovementRow';
import ConfirmDialog from '../components/ConfirmDialog';

export default function MaterialDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { materials, movements, getCategoryName, getSupplierName, removeMaterial } = useStore();
  const [showDelete, setShowDelete] = useState(false);

  const material = materials.find(m => m.id === id);
  if (!material) {
    return (
      <>
        <header className="page-header">
          <button className="page-header-back" onClick={() => navigate(-1)}><ChevronLeft size={22} /></button>
          <h1>Nicht gefunden</h1>
          <div style={{ width: 44 }} />
        </header>
        <div className="page-content text-center text-secondary" style={{ paddingTop: 'var(--space-4xl)' }}>
          Material nicht gefunden.
        </div>
      </>
    );
  }

  const available = material.current_stock - material.reserved_stock;
  const materialMovements = movements.filter(m => m.material_id === material.id).slice(0, 10);
  const isCritical = material.current_stock <= material.min_stock;
  const isWarning = material.current_stock <= material.min_stock * 1.5;

  async function handleDelete() {
    await removeMaterial(material.id);
    navigate('/material');
  }

  return (
    <>
      <header className="page-header">
        <button className="page-header-back" onClick={() => navigate(-1)}>
          <ChevronLeft size={22} />
        </button>
        <h1 style={{ fontSize: 'var(--font-size-lg)' }} className="truncate">{material.name}</h1>
        <div className="flex items-center gap-sm">
          <span style={{
            fontFamily: 'monospace',
            fontSize: 'var(--font-size-xs)',
            opacity: 0.85,
            color: 'white',
            background: 'rgba(255,255,255,0.15)',
            padding: '2px 8px',
            borderRadius: 'var(--radius-sm)',
            maxWidth: 110,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {material.manufacturer_number?.trim() || material.article_number}
          </span>
          <button className="page-header-action" onClick={() => navigate(`/material/${id}/edit`)}>
            <Edit size={18} />
          </button>
        </div>
      </header>

      <div className="page-content">
        {/* Bestandsübersicht */}
        <div className="stock-bars">
          <div className="stock-bar" style={{
            background: isCritical ? 'var(--color-danger-bg)' : isWarning ? 'var(--color-warning-bg)' : 'var(--color-success-bg)'
          }}>
            <div className="stock-bar-value" style={{
              color: isCritical ? 'var(--color-danger)' : isWarning ? 'var(--color-warning)' : 'var(--color-success)'
            }}>
              {available}
            </div>
            <div className="stock-bar-label" style={{
              color: isCritical ? 'var(--color-danger)' : isWarning ? 'var(--color-warning)' : 'var(--color-success)'
            }}>
              Verfügbar
            </div>
          </div>
          <div className="stock-bar" style={{ background: 'var(--color-warning-bg)' }}>
            <div className="stock-bar-value" style={{ color: 'var(--color-accent-dark)' }}>
              {material.reserved_stock}
            </div>
            <div className="stock-bar-label" style={{ color: 'var(--color-accent-dark)' }}>Reserviert</div>
          </div>
          <div className="stock-bar" style={{ background: 'var(--color-info-bg)' }}>
            <div className="stock-bar-value" style={{ color: 'var(--color-info)' }}>
              {material.current_stock}
            </div>
            <div className="stock-bar-label" style={{ color: 'var(--color-info)' }}>Gesamt</div>
          </div>
        </div>

        {/* Schnell-Buchen Button */}
        <button
          className="btn btn-accent btn-full btn-lg mb-lg"
          onClick={() => navigate('/buchen')}
        >
          <Zap size={20} /> Schnell buchen
        </button>

        {/* Sonepar Nachbestellen – nur bei kritischem / niedrigem Bestand */}
        {isCritical && (
          <button
            className="btn-sonepar btn-sonepar--detail"
            onClick={(e) => openSoneparForMaterial(e, material)}
          >
            <ExternalLink size={17} />
            Bei Sonepar nachbestellen
          </button>
        )}

        {/* Details */}
        <div className="detail-section">
          <h3 className="detail-section-title">Artikeldaten</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <div className="detail-item-label">Artikelnr.</div>
              <div className="detail-item-value">{material.article_number}</div>
            </div>
            {material.manufacturer_number && (
              <div className="detail-item">
                <div className="detail-item-label">Herstellernr.</div>
                <div className="detail-item-value" style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                  {material.manufacturer_number}
                </div>
              </div>
            )}
            {material.ean_code && (
              <div className="detail-item">
                <div className="detail-item-label">EAN / GTIN</div>
                <div className="detail-item-value" style={{ fontFamily: 'monospace', fontSize: 'var(--font-size-sm)' }}>
                  {material.ean_code}
                </div>
              </div>
            )}
            <div className="detail-item">
              <div className="detail-item-label">Einheit</div>
              <div className="detail-item-value">{UNIT_LABELS[material.unit] || material.unit}</div>
            </div>
            <div className="detail-item">
              <div className="detail-item-label">Kategorie</div>
              <div className="detail-item-value">{getCategoryName(material.category_id)}</div>
            </div>
            <div className="detail-item">
              <div className="detail-item-label">Lagerort</div>
              <div className="detail-item-value">{material.storage_location || '–'}</div>
            </div>
            <div className="detail-item">
              <div className="detail-item-label">Mindestbestand</div>
              <div className="detail-item-value">{material.min_stock} {UNIT_LABELS[material.unit]}</div>
            </div>
            <div className="detail-item">
              <div className="detail-item-label">Bestellmenge</div>
              <div className="detail-item-value">{material.reorder_quantity} {UNIT_LABELS[material.unit]}</div>
            </div>
            <div className="detail-item">
              <div className="detail-item-label">Lieferant</div>
              <div className="detail-item-value">{getSupplierName(material.supplier_id) || '–'}</div>
            </div>
            <div className="detail-item">
              <div className="detail-item-label">EK-Preis</div>
              <div className="detail-item-value">{material.purchase_price?.toFixed(2)} €</div>
            </div>
            {material.packaging_unit && (
              <div className="detail-item">
                <div className="detail-item-label">VPE</div>
                <div className="detail-item-value">{material.packaging_unit}</div>
              </div>
            )}
            {material.description && (
              <div className="detail-item detail-item--full">
                <div className="detail-item-label">Beschreibung</div>
                <div className="detail-item-value">{material.description}</div>
              </div>
            )}
          </div>
        </div>

        {/* Letzte Bewegungen */}
        <div className="detail-section">
          <h3 className="detail-section-title">Letzte Buchungen</h3>
          <div className="card">
          {materialMovements.length > 0 ? (
              materialMovements.map(m => <MovementRow key={m.id} movement={m} />)
            ) : (
              <div className="text-center text-secondary" style={{ padding: 'var(--space-xl)' }}>
                Noch keine Buchungen
              </div>
            )}
          </div>
        </div>

        {/* Löschen */}
        <button
          className="btn btn-ghost btn-full"
          style={{ color: 'var(--color-danger)', marginTop: 'var(--space-xl)' }}
          onClick={() => setShowDelete(true)}
        >
          <Trash2 size={16} /> Material löschen
        </button>

        {showDelete && (
          <ConfirmDialog
            title="Material löschen?"
            message={`„${material.name}" wird unwiderruflich gelöscht.`}
            confirmText="Löschen"
            danger
            onCancel={() => setShowDelete(false)}
            onConfirm={handleDelete}
          />
        )}
      </div>
    </>
  );
}
