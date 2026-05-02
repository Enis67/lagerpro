import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from '../hooks/useStore';
import { 
  PackagePlus, PackageMinus, Check, X, ChevronRight, ArrowLeft
} from 'lucide-react';
import { MOVEMENT_TYPES, UNIT_LABELS, DEFAULT_USER } from '../data/constants';

export default function QuickBooking() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { materials, constructionSites, addMovement } = useStore();

  const [type, setType] = useState(searchParams.get('type') || 'entnahme');
  const [materialId, setMaterialId] = useState(searchParams.get('material') || '');
  const [quantity, setQuantity] = useState('1');
  const [siteId, setSiteId] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [showScanner, setShowScanner] = useState(false);

  const selectedMaterial = materials.find(m => m.id === materialId);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!materialId || !quantity) return;
    setLoading(true);
    try {
      const qty = parseFloat(quantity);
      const finalQty = type === 'entnahme' ? -Math.abs(qty) : Math.abs(qty);
      await addMovement({
        material_id: materialId,
        type,
        quantity: finalQty,
        construction_site_id: siteId || null,
        note: note || null,
        user_id: DEFAULT_USER.id,
      });
      setToast({ message: '✓ Buchung erfolgreich', type: 'success' });
      setTimeout(() => setToast(null), 2000);
      setMaterialId('');
      setQuantity('1');
      setSiteId('');
      setNote('');
    } catch (err) {
      setToast({ message: '✗ ' + err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  const iconMap = {
    entnahme: PackageMinus,
    zugang: PackagePlus,
    korrektur: Check,
  };

  return (
    <div className="page">
      <div className="page-header">
        <button onClick={() => navigate(-1)} className="btn-icon" style={{ marginRight: 'var(--space-sm)' }}>
          <ArrowLeft size={20} />
        </button>
        <h1>Schnellbuchen</h1>
      </div>

      {toast && (
        <div className={`toast toast-${toast.type}`}>{toast.message}</div>
      )}

      <form onSubmit={handleSubmit} style={{ marginTop: 'var(--space-md)' }}>
        <div className="card" style={{ marginBottom: 'var(--space-md)' }}>
          <h3>Buchungstyp</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-sm)', marginTop: 'var(--space-sm)' }}>
            {MOVEMENT_TYPES.filter(t => t.id !== 'rueckgabe').map(t => {
              const Icon = iconMap[t.id] || PackageMinus;
              const isSelected = type === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setType(t.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 'var(--space-sm)',
                    justifyContent: 'center',
                    border: isSelected ? '2px solid var(--color-primary)' : '2px solid transparent',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: '50%', background: isSelected ? 'var(--color-primary)' : 'var(--color-surface)', color: isSelected ? 'white' : 'var(--color-text)' }}>
                    <Icon size={20} />
                  </div>
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="card" style={{ marginBottom: 'var(--space-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Material</h3>
          </div>
          <select
            className="input"
            value={materialId}
            onChange={e => setMaterialId(e.target.value)}
            style={{ marginTop: 'var(--space-sm)' }}
          >
            <option value="">Material auswählen...</option>
            {materials.filter(m => m.active).map(m => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.article_number}) — {(m.current_stock || 0)} {UNIT_LABELS[m.unit] || m.unit}
              </option>
            ))}
          </select>
          {selectedMaterial && (
            <div style={{ marginTop: 'var(--space-sm)', padding: 'var(--space-sm)', background: 'var(--color-surface)', borderRadius: 'var(--radius-md)' }}>
              <div><strong>{selectedMaterial.name}</strong></div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                Bestand: {(selectedMaterial.current_stock || 0)} {UNIT_LABELS[selectedMaterial.unit] || selectedMaterial.unit}
              </div>
            </div>
          )}
        </div>

        <div className="card" style={{ marginBottom: 'var(--space-md)' }}>
          <h3>Details</h3>
          <div style={{ display: 'grid', gap: 'var(--space-sm)', marginTop: 'var(--space-sm)' }}>
            <div>
              <label>Menge</label>
              <input
                type="number"
                className="input"
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                min="0.01"
                step="0.01"
                required
              />
            </div>
            <div>
              <label>Baustelle</label>
              <select
                className="input"
                value={siteId}
                onChange={e => setSiteId(e.target.value)}
              >
                <option value="">Baustelle wählen (optional)</option>
                {constructionSites.filter(s => s.status === 'active').map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label>Notiz</label>
              <input
                type="text"
                className="input"
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Optional..."
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading || !materialId}
          style={{ width: '100%' }}
        >
          {loading ? 'Wird gebucht...' : 'Buchen'}
        </button>
      </form>
    </div>
  );
}
