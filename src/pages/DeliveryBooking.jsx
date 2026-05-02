import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuid } from 'uuid';
import {
  ChevronLeft, PackagePlus, Check, ScanBarcode, Trash2, Minus, Plus,
} from 'lucide-react';
import { useStore } from '../hooks/useStore';
import { UNIT_LABELS, DEFAULT_USER } from '../data/constants';
import SearchBar from '../components/SearchBar';
import Toast from '../components/Toast';
import BarcodeScanner from '../components/BarcodeScanner';

export default function DeliveryBooking() {
  const navigate = useNavigate();
  const { materials, addMovement, getCategoryName } = useStore();
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [deliveryNote, setDeliveryNote] = useState('');
  const [note, setNote] = useState('');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);
  const [showScanner, setShowScanner] = useState(false);

  const filteredMaterials = materials.filter(m =>
    m.active && (
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.article_number.toLowerCase().includes(search.toLowerCase()) ||
      (m.manufacturer_number && m.manufacturer_number.toLowerCase().includes(search.toLowerCase()))
    )
  );

  function handleSelectMaterial(material) {
    setSelectedMaterial(material);
    setQuantity(1);
    setSearch('');
  }

  function updateQuantity(delta) {
    setQuantity(prev => Math.max(1, prev + delta));
  }

  function removeSelected() {
    setSelectedMaterial(null);
    setQuantity(1);
  }

  function handleScanResult(material) {
    setSelectedMaterial(material);
    setQuantity(1);
    setShowScanner(false);
    setToast({ message: `${material.name} erkannt ✓`, type: 'success' });
  }

  async function handleBook() {
    if (!selectedMaterial) return;

    try {
      await addMovement({
        id: uuid(),
        material_id: selectedMaterial.id,
        project_id: null,
        user_id: DEFAULT_USER.id,
        type: 'eingang',
        quantity: Number(quantity),
        note: deliveryNote ? `Lieferschein: ${deliveryNote}${note ? ' · ' + note : ''}` : note,
      });

      setToast({
        message: `${quantity} ${UNIT_LABELS[selectedMaterial.unit]} ${selectedMaterial.name} eingebucht ✓`,
        type: 'success'
      });

      setTimeout(() => {
        setSelectedMaterial(null);
        setQuantity(1);
        setDeliveryNote('');
        setNote('');
        setSearch('');
      }, 1500);
    } catch (err) {
      setToast({ message: 'Fehler beim Buchen: ' + err.message, type: 'error' });
    }
  }

  return (
    <>
      <header className="page-header">
        <button className="page-header-back" onClick={() => navigate(-1)}>
          <ChevronLeft size={22} />
        </button>
        <h1>Lieferung buchen</h1>
        <div style={{ width: 44 }} />
      </header>

      <div className="page-content">
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

        {/* Material-Auswahl */}
        {!selectedMaterial ? (
          <>
            <div style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
              <SearchBar
                placeholder="Material suchen..."
                value={search}
                onChange={setSearch}
                style={{ flex: 1 }}
              />
              <button className="btn btn-primary btn-square" onClick={() => setShowScanner(true)}>
                <ScanBarcode size={20} />
              </button>
            </div>

            {showScanner && (
              <BarcodeScanner
                materials={materials.filter(m => m.active)}
                onScan={handleScanResult}
                onClose={() => setShowScanner(false)}
              />
            )}

            <div className="list">
              {filteredMaterials.map(material => {
                const categoryColor = materials.find(m => m.id === material.id)?.categoryColor || '#6B7280';
                return (
                  <button
                    key={material.id}
                    className="card card-clickable"
                    onClick={() => handleSelectMaterial(material)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                    }}
                  >
                    <div style={{
                      width: 40, height: 40, borderRadius: 12,
                      background: 'var(--color-primary-50)',
                      color: 'var(--color-primary)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}
                    >
                      <PackagePlus size={20} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="flex items-center gap-sm">
                        <div style={{
                          width: 8, height: 8, borderRadius: '50%',
                          background: categoryColor,
                          flexShrink: 0,
                        }} />
                        <span className="font-semibold">{material.name}</span>
                      </div>
                      <div className="text-xs text-tertiary">
                        {material.article_number} · {getCategoryName(material.category_id)}
                      </div>
                      <div className="text-xs text-secondary mt-xs">
                        Aktueller Bestand: {material.current_stock} {UNIT_LABELS[material.unit]}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {filteredMaterials.length === 0 && search && (
              <div className="text-center text-secondary" style={{ padding: '48px 24px' }}>
                Kein Material gefunden.
              </div>
            )}
          </>
        ) : (
          <>
            {/* Ausgewähltes Material */}
            <div className="card mb-lg" style={{ background: 'var(--color-primary-50)', border: '1px solid var(--color-primary)' }}>
              <div className="flex justify-between items-center mb-md">
                <div>
                  <div className="font-semibold" style={{ color: 'var(--color-primary)' }}>
                    {selectedMaterial.name}
                  </div>
                  <div className="text-xs text-tertiary" style={{ fontFamily: 'monospace' }}>
                    {selectedMaterial.article_number}
                  </div>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={removeSelected}>
                  <Trash2 size={14} style={{ color: 'var(--color-danger)' }} />
                </button>
              </div>
              <div className="text-sm text-secondary">
                Aktueller Bestand: {selectedMaterial.current_stock} {UNIT_LABELS[selectedMaterial.unit]}
              </div>
            </div>

            {/* Menge */}
            <div className="card mb-lg">
              <div className="font-semibold mb-md">Menge</div>
              <div className="flex items-center gap-md">
                <button className="quantity-btn" onClick={() => updateQuantity(-1)}>
                  <Minus size={18} />
                </button>
                <span className="quantity-value">{quantity}</span>
                <span className="text-sm text-secondary">{UNIT_LABELS[selectedMaterial.unit]}</span>
                <button className="quantity-btn" onClick={() => updateQuantity(1)}>
                  <Plus size={18} />
                </button>
              </div>
            </div>

            {/* Lieferantenbeleg */}
            <div className="card mb-lg">
              <div className="font-semibold mb-sm">Lieferantenbeleg-Nummer (optional)</div>
              <input
                type="text"
                value={deliveryNote}
                onChange={e => setDeliveryNote(e.target.value)}
                placeholder="z.B. LS-2025-0123"
                style={{ width: '100%' }}
              />
            </div>

            {/* Notiz */}
            <div className="card mb-lg">
              <div className="font-semibold mb-sm">Notiz (optional)</div>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="z.B. Lieferant, Qualität, Schaden..."
                rows={3}
              />
            </div>

            {/* Buchen */}
            <button
              className="btn btn-primary btn-full btn-lg"
              onClick={handleBook}
              style={{ marginTop: 'var(--space-xl)' }}
            >
              <Check size={20} />
              {quantity} {UNIT_LABELS[selectedMaterial.unit]} {selectedMaterial.name} einbuchen
            </button>
          </>
        )}
      </div>
    </>
  );
}
