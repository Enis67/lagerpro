import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ShoppingCart, AlertTriangle, PackagePlus } from 'lucide-react';
import { useStore } from '../hooks/useStore';
import { UNIT_LABELS } from '../data/constants';
import { useState } from 'react';
import Toast from '../components/Toast';

export default function OrderList() {
  const navigate = useNavigate();
  const { materials, categories, suppliers } = useStore();
  const [toast, setToast] = useState(null);
  const [addedIds, setAddedIds] = useState(new Set());

  // Artikel mit current_stock < min_stock, sortiert nach Mangel absteigend
  const orderItems = materials
    .filter(m => m.active && m.current_stock < m.min_stock)
    .map(m => {
      const cat = categories.find(c => c.id === m.category_id);
      const sup = suppliers.find(s => s.id === m.supplier_id);
      return {
        ...m,
        deficit: m.min_stock - m.current_stock,
        categoryName: cat?.name || 'Unbekannt',
        categoryColor: cat?.color || '#6B7280',
        supplierName: sup?.name || 'Unbekannt',
      };
    })
    .sort((a, b) => b.deficit - a.deficit);

  // Gruppiert nach Kategorie
  const byCategory = {};
  orderItems.forEach(item => {
    if (!byCategory[item.categoryName]) {
      byCategory[item.categoryName] = { items: [], color: item.categoryColor };
    }
    byCategory[item.categoryName].items.push(item);
  });

  function handleAddToOrder(item) {
    setAddedIds(prev => new Set(prev).add(item.id));
    setToast({ message: `${item.name} zur Bestellung hinzugefügt ✓`, type: 'success' });
  }

  return (
    <>
      <header className="page-header">
        <button className="page-header-back" onClick={() => navigate(-1)}>
          <ChevronLeft size={22} />
        </button>
        <h1>Bestellliste</h1>
        <div style={{ width: 44 }} />
      </header>

      <div className="page-content">
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

        {orderItems.length === 0 ? (
          <div className="text-center text-secondary" style={{ padding: '48px 24px' }}>
            <PackagePlus size={48} style={{ color: 'var(--color-border)', marginBottom: 'var(--space-md)' }} />
            <div className="font-semibold">Alles auf Lager! ✓</div>
            <div className="text-sm mt-sm">Keine Artikel unter dem Mindestbestand.</div>
          </div>
        ) : (
          <>
            <div style={{
              background: 'var(--color-danger-bg)',
              padding: 'var(--space-md) var(--space-lg)',
              borderRadius: 'var(--radius-lg)',
              marginBottom: 'var(--space-xl)',
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-danger)',
              fontWeight: 'var(--font-weight-semibold)',
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--space-sm)',
            }}>
              <AlertTriangle size={18} />
              {orderItems.length} Artikel unter Mindestbestand
            </div>

            {Object.entries(byCategory).map(([catName, { items, color }]) => (
              <div key={catName} className="section" style={{ marginBottom: 'var(--space-xl)' }}>
                <div className="section-header">
                  <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                    <span style={{
                      width: 10, height: 10, borderRadius: '50%',
                      background: color, display: 'inline-block',
                    }} />
                    {catName}
                  </h2>
                  <span className="text-sm text-secondary">{items.length} Artikel</span>
                </div>

                <div className="list">
                  {items.map(item => {
                    const isAdded = addedIds.has(item.id);
                    return (
                      <div key={item.id} className="card">
                        <div className="flex justify-between items-start mb-md">
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div className="font-semibold">{item.name}</div>
                            <div className="text-xs text-tertiary" style={{ fontFamily: 'monospace' }}>
                              {item.article_number}
                            </div>
                            <div className="text-xs text-secondary mt-xs">
                              📍 {item.storage_location || '–'} · {item.supplierName}
                            </div>
                          </div>
                          <span className="stock-badge stock-badge--critical" style={{ flexShrink: 0 }}>
                            <span className="stock-dot stock-dot--critical" />
                            {item.current_stock === 0 ? 'Leer' : 'Kritisch'}
                          </span>
                        </div>

                        <div className="flex items-center gap-sm text-sm mb-md" style={{ flexWrap: 'wrap' }}>
                          <div style={{
                            background: 'var(--color-bg-elevated)',
                            padding: '4px 10px',
                            borderRadius: 'var(--radius-md)',
                          }}>
                            Bestand: <strong>{item.current_stock}</strong> {UNIT_LABELS[item.unit]}
                          </div>
                          <div style={{
                            background: 'var(--color-bg-elevated)',
                            padding: '4px 10px',
                            borderRadius: 'var(--radius-md)',
                          }}>
                            Min: <strong>{item.min_stock}</strong> {UNIT_LABELS[item.unit]}
                          </div>
                          <div style={{
                            background: 'var(--color-danger-bg)',
                            color: 'var(--color-danger)',
                            padding: '4px 10px',
                            borderRadius: 'var(--radius-md)',
                            fontWeight: 600,
                          }}>
                            Fehlt: {item.deficit} {UNIT_LABELS[item.unit]}
                          </div>
                          <div style={{
                            background: 'var(--color-primary-50)',
                            color: 'var(--color-primary)',
                            padding: '4px 10px',
                            borderRadius: 'var(--radius-md)',
                            fontWeight: 600,
                          }}>
                            Bestellen: {item.reorder_quantity} {UNIT_LABELS[item.unit]}
                          </div>
                        </div>

                        <button
                          className={`btn btn-full ${isAdded ? 'btn-success' : 'btn-primary'}`}
                          onClick={() => handleAddToOrder(item)}
                          disabled={isAdded}
                          style={{
                            opacity: isAdded ? 0.7 : 1,
                            background: isAdded ? 'var(--color-success)' : undefined,
                          }}
                        >
                          <ShoppingCart size={16} />
                          {isAdded ? 'Hinzugefügt' : 'Zur Bestellung hinzufügen'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </>
  );
}
