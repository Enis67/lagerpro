import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuid } from 'uuid';
import {
  ChevronLeft, PackagePlus, Plus, Trash2, Check, AlertTriangle,
} from 'lucide-react';
import { useStore } from '../hooks/useStore';
import { UNIT_LABELS, DEFAULT_USER } from '../data/constants';
import SearchBar from '../components/SearchBar';
import Toast from '../components/Toast';

export default function BatchBooking() {
  const navigate = useNavigate();
  const { materials, addMovement, getMaterialName } = useStore();
  const [rows, setRows] = useState([{ id: uuid(), material_id: '', quantity: 1, type: 'entnahme', search: '' }]);
  const [toast, setToast] = useState(null);

  const activeMaterials = materials.filter(m => m.active);

  function addRow() {
    setRows(prev => [...prev, { id: uuid(), material_id: '', quantity: 1, type: 'entnahme', search: '' }]);
  }

  function removeRow(rowId) {
    setRows(prev => prev.filter(r => r.id !== rowId));
  }

  function updateRow(rowId, updates) {
    setRows(prev => prev.map(r => r.id === rowId ? { ...r, ...updates } : r));
  }

  function getMaterial(row) {
    return activeMaterials.find(m => m.id === row.material_id);
  }

  async function handleBookAll() {
    const validRows = rows.filter(r => r.material_id && r.quantity > 0);
    if (validRows.length === 0) {
      setToast({ message: 'Mindestens eine Zeile mit Artikel ausfüllen', type: 'error' });
      return;
    }

    const results = [];
    for (const row of validRows) {
      try {
        await addMovement({
          id: uuid(),
          material_id: row.material_id,
          project_id: null,
          user_id: DEFAULT_USER.id,
          type: row.type,
          quantity: Number(row.quantity),
          note: `Mehrfachbuchung`,
        });
        results.push({ name: getMaterialName(row.material_id), quantity: row.quantity, type: row.type, ok: true });
      } catch (err) {
        results.push({ name: getMaterialName(row.material_id), quantity: row.quantity, type: row.type, ok: false });
      }
    }

    const successCount = results.filter(r => r.ok).length;
    setToast({
      message: `${successCount} von ${results.length} Buchungen erfolgreich ✓`,
      type: successCount === results.length ? 'success' : 'warning',
    });

    if (successCount > 0) {
      setTimeout(() => {
        setRows([{ id: uuid(), material_id: '', quantity: 1, type: 'entnahme', search: '' }]);
      }, 2000);
    }
  }

  return (
    <>
      <header className="page-header">
        <button className="page-header-back" onClick={() => navigate(-1)}>
          <ChevronLeft size={22} />
        </button>
        <h1>Mehrfachbuchung</h1>
        <div style={{ width: 44 }} />
      </header>

      <div className="page-content">
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

        {rows.map((row, idx) => {
          const mat = getMaterial(row);
          const filtered = row.search
            ? activeMaterials.filter(m =>
                m.name.toLowerCase().includes(row.search.toLowerCase()) ||
                m.article_number.toLowerCase().includes(row.search.toLowerCase())
              )
            : [];

          return (
            <div key={row.id} className="booking-card" style={{ marginBottom: 'var(--space-md)' }}>
              <div className="booking-card-header">
                <span className="font-semibold">Zeile {idx + 1}</span>
                {rows.length > 1 && (
                  <button onClick={() => removeRow(row.id)} className="btn btn--ghost btn--sm" style={{ color: 'var(--color-danger)' }}>
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              {!mat ? (
                <div className="form-group">
                  <label>Artikel suchen</label>
                  <SearchBar
                    value={row.search}
                    onChange={v => updateRow(row.id, { search: v })}
                    placeholder="Name oder Artikelnummer..."
                  />
                  {filtered.slice(0, 5).map(m => (
                    <button
                      key={m.id}
                      onClick={() => updateRow(row.id, { material_id: m.id, search: '' })}
                      className="dropdown-option"
                    >
                      <span className="dropdown-option-main">{m.name}</span>
                      <span className="dropdown-option-sub">{m.article_number} · {UNIT_LABELS[m.unit]}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="selected-material" style={{ marginBottom: 'var(--space-sm)' }}>
                  <div className="selected-material-name">{mat.name}</div>
                  <div className="selected-material-meta">{mat.article_number} · {UNIT_LABELS[mat.unit]}</div>
                  <button onClick={() => updateRow(row.id, { material_id: '', search: '' })} className="btn btn--ghost btn--sm">
                    Ändern
                  </button>
                </div>
              )}

              {mat && (
                <>
                  <div className="form-group">
                    <label>Typ</label>
                    <div className="segmented-control">
                      <button
                        className={row.type === 'entnahme' ? 'segmented-control-active' : ''}
                        onClick={() => updateRow(row.id, { type: 'entnahme' })}
                      >
                        Entnahme
                      </button>
                      <button
                        className={row.type === 'eingang' ? 'segmented-control-active' : ''}
                        onClick={() => updateRow(row.id, { type: 'eingang' })}
                      >
                        Eingang
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Menge</label>
                    <div className="quantity-stepper">
                      <button onClick={() => updateRow(row.id, { quantity: Math.max(1, row.quantity - 1) })} className="btn btn--ghost">
                        <Minus size={18} />
                      </button>
                      <span className="quantity-value">{row.quantity}</span>
                      <button onClick={() => updateRow(row.id, { quantity: row.quantity + 1 })} className="btn btn--ghost">
                        <Plus size={18} />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })}

        <button onClick={addRow} className="btn btn--outline btn--block" style={{ marginBottom: 'var(--space-lg)' }}>
          <Plus size={18} /> Zeile hinzufügen
        </button>

        <button
          onClick={handleBookAll}
          className="btn btn--primary btn--lg btn--block"
          disabled={rows.filter(r => r.material_id).length === 0}
        >
          <Check size={20} /> Alle buchen
        </button>
      </div>
    </>
  );
}
