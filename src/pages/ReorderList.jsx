import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ShoppingCart, ExternalLink, Mail, Download } from 'lucide-react';
import { useStore } from '../hooks/useStore';
import { UNIT_LABELS } from '../data/constants';
import EmptyState from '../components/EmptyState';
import { CheckCircle } from 'lucide-react';
import { openSoneparForMaterial, getSoneparSearchUrl, generateOrderMailto } from '../services/sonepar';
import { exportReorderCSV } from '../services/exportUtils';

export default function ReorderList() {
  const navigate = useNavigate();
  const { materials, suppliers } = useStore();

  const reorderItems = materials
    .filter(m => m.active && m.current_stock <= m.min_stock)
    .map(m => ({
      ...m,
      supplier_name: suppliers.find(s => s.id === m.supplier_id)?.name || 'Unbekannt',
      supplier_obj: suppliers.find(s => s.id === m.supplier_id),
      deficit: m.min_stock - m.current_stock,
    }))
    .sort((a, b) => a.current_stock - b.current_stock);

  // Gruppiert nach Lieferant
  const bySupplier = {};
  reorderItems.forEach(item => {
    if (!bySupplier[item.supplier_name]) bySupplier[item.supplier_name] = [];
    bySupplier[item.supplier_name].push(item);
  });

  function handleOrderAllSonepar(items) {
    // Öffne Sonepar für den ersten Artikel – der Nutzer kann dann die anderen suchen
    // In der Praxis öffnet man einen Artikel nach dem anderen
    items.forEach((item, i) => {
      setTimeout(() => {
        window.open(getSoneparSearchUrl(item), '_blank', 'noopener,noreferrer');
      }, i * 300); // Leichte Verzögerung damit der Browser nicht blockt
    });
  }

  function handleEmailOrder(supplierName, items) {
    const supplier = items[0]?.supplier_obj;
    const email = supplier?.contact_email || '';
    const url = generateOrderMailto(items, email, supplierName);
    window.location.href = url;
  }

  return (
    <>
      <header className="page-header">
        <button className="page-header-back" onClick={() => navigate(-1)}>
          <ChevronLeft size={22} />
        </button>
        <h1>Nachbestellen</h1>
        <button
          className="page-header-action"
          onClick={() => exportReorderCSV(reorderItems)}
          title="Als CSV exportieren"
          disabled={reorderItems.length === 0}
        >
          <Download size={20} />
        </button>
      </header>

      <div className="page-content">
        {reorderItems.length > 0 ? (
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
            }}>
              {reorderItems.length} Artikel unter Mindestbestand
            </div>

            {Object.entries(bySupplier).map(([supplierName, items]) => {
              const isSonepar = supplierName.toLowerCase().includes('sonepar');
              const totalCost = items.reduce((sum, i) => sum + (i.purchase_price * i.reorder_quantity), 0);
              
              return (
                <div key={supplierName} className="section">
                  <div className="section-header">
                    <h2 className="section-title">{supplierName}</h2>
                    <span className="text-sm text-secondary">{items.length} Artikel</span>
                  </div>
                  <div className="list">
                    {items.map(item => (
                      <div
                        key={item.id}
                        className="reorder-card"
                      >
                        <div className="reorder-card-header" onClick={() => navigate(`/material/${item.id}`)}>
                          <div>
                            <div className="reorder-card-name">{item.name}</div>
                            <div className="reorder-card-number">{item.article_number}</div>
                          </div>
                          <span className="stock-badge stock-badge--critical">
                            <span className="stock-dot stock-dot--critical" />
                            {item.current_stock === 0 ? 'Leer' : 'Kritisch'}
                          </span>
                        </div>
                        <div className="reorder-card-stats">
                          <span>Bestand: <span className="reorder-card-stat-value">{item.current_stock}</span></span>
                          <span>Min: <span className="reorder-card-stat-value">{item.min_stock}</span></span>
                          <span>Bestellen: <span className="reorder-card-stat-value" style={{ color: 'var(--color-primary)' }}>{item.reorder_quantity} {UNIT_LABELS[item.unit]}</span></span>
                        </div>
                        {item.purchase_price > 0 && (
                          <div className="reorder-card-footer">
                            <span className="text-sm text-secondary">
                              VPE: {item.packaging_unit || '–'}
                            </span>
                            <span className="text-sm font-semibold">
                              EK: {(item.purchase_price * item.reorder_quantity).toFixed(2)} €
                            </span>
                          </div>
                        )}
                        {/* Sonepar Bestell-Button pro Artikel */}
                        <button
                          className="btn-sonepar"
                          onClick={(e) => openSoneparForMaterial(e, item)}
                        >
                          <ExternalLink size={15} />
                          Bei Sonepar bestellen
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Sammel-Aktionen pro Lieferant */}
                  <div className="reorder-supplier-actions">
                    {isSonepar && items.length > 1 && (
                      <button
                        className="btn btn-sonepar-group"
                        onClick={() => handleOrderAllSonepar(items)}
                      >
                        <ShoppingCart size={18} />
                        Alle {items.length} Artikel bei Sonepar öffnen
                      </button>
                    )}
                    {!isSonepar && (
                      <button
                        className="btn btn-sonepar-group btn-sonepar-group--alt"
                        onClick={() => handleOrderAllSonepar(items)}
                      >
                        <ExternalLink size={18} />
                        Alle im Sonepar-Shop suchen
                      </button>
                    )}
                    <div className="reorder-supplier-total">
                      Geschätzter EK-Wert: <strong>{totalCost.toFixed(2)} €</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        ) : (
          <EmptyState
            icon={CheckCircle}
            title="Alles auf Lager! ✓"
            text="Aktuell sind keine Artikel unter ihrem Mindestbestand."
          />
        )}
      </div>
    </>
  );
}
