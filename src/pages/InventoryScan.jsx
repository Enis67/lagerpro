import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ScanBarcode, Trash2, Plus, Check, AlertTriangle, PackageCheck } from 'lucide-react';
import { useStore } from '../hooks/useStore';
import { v4 as uuid } from 'uuid';
import BarcodeScanner from '../components/BarcodeScanner';
import Toast from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';

export default function InventoryScan() {
  const navigate = useNavigate();
  const { materials, addMovement } = useStore();
  const [scannedItems, setScannedItems] = useState([]);
  const [showScanner, setShowScanner] = useState(false);
  const [toast, setToast] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const activeMaterials = materials.filter(m => m.active);

  const handleScanResult = useCallback((material) => {
    setShowScanner(false);
    // Prüfen ob bereits gescannt
    setScannedItems(prev => {
      if (prev.find(item => item.id === material.id)) {
        setToast({ message: `${material.name} bereits gescannt`, type: 'warning' });
        return prev;
      }
      return [...prev, {
        id: material.id,
        name: material.name,
        article_number: material.article_number,
        manufacturer_number: material.manufacturer_number,
        current_stock: material.current_stock,
        actual_stock: material.current_stock,
        unit: material.unit,
      }];
    });
    setToast({ message: `${material.name} gescannt ✓`, type: 'success' });
  }, []);

  function updateActual(id, value) {
    const num = parseInt(value);
    if (isNaN(num) || num < 0) return;
    setScannedItems(prev => prev.map(item =>
      item.id === id ? { ...item, actual_stock: num } : item
    ));
  }

  function removeItem(id) {
    setScannedItems(prev => prev.filter(item => item.id !== id));
  }

  function getDiff(item) {
    return item.actual_stock - item.current_stock;
  }

  function getTotalDiff() {
    return scannedItems.reduce((sum, item) => sum + getDiff(item), 0);
  }

  async function handleApply() {
    try {
      for (const item of scannedItems) {
        const diff = getDiff(item);
        if (diff === 0) continue;
        await addMovement({
          id: uuid(),
          material_id: item.id,
          type: 'korrektur',
          quantity: Math.abs(diff),
          note: `Inventur: ${diff > 0 ? '+' : ''}${diff} ${item.unit}`,
          created_at: new Date().toISOString(),
        });
      }
      setShowConfirm(false);
      setToast({ message: 'Inventur-Buchungen erfolgreich ✓', type: 'success' });
      setTimeout(() => navigate('/bewegungen'), 1200);
    } catch (err) {
      setToast({ message: 'Fehler: ' + err.message, type: 'error' });
    }
  }

  return (
    <>
      <header className="page-header">
        <button className="page-header-back" onClick={() => navigate(-1)}>
          <ChevronLeft size={22} />
        </button>
        <h1>Inventur</h1>
        <button className="page-header-action" onClick={() => setShowScanner(true)}>
          <ScanBarcode size={20} />
        </button>
      </header>

      <div className="page-content">
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

        {/* Scanner Overlay */}
        {showScanner && (
          <BarcodeScanner
            materials={activeMaterials}
            onScan={handleScanResult}
            onClose={() => setShowScanner(false)}
          />
        )}

        {/* Übersicht */}
        <div className="card mb-lg" style={{ background: 'var(--color-primary-50)' }}>
          <div className="flex justify-between items-center">
            <div>
              <div className="font-semibold">{scannedItems.length} Artikel gescannt</div>
              <div className="text-sm text-secondary">
                Gesamtdifferenz: {getTotalDiff() > 0 ? '+' : ''}{getTotalDiff()}
              </div>
            </div>
            {scannedItems.length > 0 && (
              <button className="btn btn-primary btn-sm" onClick={() => setShowConfirm(true)}>
                <PackageCheck size={16} /> Anwenden
              </button>
            )}
          </div>
        </div>

        {/* Gescannte Artikel */}
        {scannedItems.length === 0 ? (
          <div className="text-center text-secondary" style={{ padding: 'var(--space-4xl)' }}>
            <ScanBarcode size={48} style={{ color: 'var(--color-border)', marginBottom: 'var(--space-md)' }} />
            <div>Noch keine Artikel gescannt</div>
            <div className="text-sm mt-sm">Tippe auf 📷 um zu starten</div>
          </div>
        ) : (
          <div className="list">
            {scannedItems.map(item => {
              const diff = getDiff(item);
              return (
                <div key={item.id} className="card">
                  <div className="flex justify-between items-center mb-md">
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="font-semibold">{item.name}</div>
                      <div className="text-xs text-tertiary">
                        {item.article_number || item.manufacturer_number}
                      </div>
                    </div>
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ color: 'var(--color-danger)' }}
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="flex items-center gap-md">
                    <div style={{ flex: 1 }}>
                      <div className="text-xs text-tertiary mb-xs">Soll-Bestand: {item.current_stock}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                        <button
                          className="quantity-btn"
                          onClick={() => updateActual(item.id, item.actual_stock - 1)}
                        >
                          <Minus size={18} />
                        </button>
                        <input
                          type="number"
                          className="quantity-value"
                          value={item.actual_stock}
                          onChange={e => updateActual(item.id, e.target.value)}
                          min="0"
                          inputMode="numeric"
                          style={{ width: 80, textAlign: 'center' }}
                        />
                        <button
                          className="quantity-btn"
                          onClick={() => updateActual(item.id, item.actual_stock + 1)}
                        >
                          <Plus size={18} />
                        </button>
                      </div>
                    </div>

                    <div style={{
                      textAlign: 'center',
                      minWidth: 60,
                      padding: 'var(--space-sm)',
                      borderRadius: 'var(--radius-md)',
                      background: diff === 0 ? 'var(--color-success-bg)' : diff > 0 ? 'var(--color-info-bg)' : 'var(--color-warning-bg)',
                      color: diff === 0 ? 'var(--color-success)' : diff > 0 ? 'var(--color-info)' : 'var(--color-warning)',
                      fontWeight: 700,
                      fontSize: 'var(--font-size-sm)',
                    }}>
                      {diff > 0 ? '+' : ''}{diff}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {showConfirm && (
          <ConfirmDialog
            title="Inventur anwenden?"
            message={`${scannedItems.length} Artikel werden als Korrektur-Buchungen gespeichert. Gesamtdifferenz: ${getTotalDiff() > 0 ? '+' : ''}${getTotalDiff()}`}
            confirmText="Buchungen erstellen"
            onCancel={() => setShowConfirm(false)}
            onConfirm={handleApply}
          />
        )}
      </div>
    </>
  );
}
