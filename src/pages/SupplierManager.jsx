import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, Edit2, Trash2, Check, X, Mail, Phone, Sparkles, TrendingDown, AlertTriangle } from 'lucide-react';
import { v4 as uuid } from 'uuid';
import { useStore } from '../hooks/useStore';
import ConfirmDialog from '../components/ConfirmDialog';
import Toast from '../components/Toast';

export default function SupplierManager() {
  const navigate = useNavigate();
  const { suppliers, materials, addSupplier, editSupplier, removeSupplier } = useStore();
  const [toast, setToast] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const emptyForm = { name: '', contact_email: '', contact_phone: '', notes: '' };
  const [form, setForm] = useState(emptyForm);

  const supplierInsights = useMemo(() => {
    const activeMaterials = materials.filter(m => m.active);

    const categoryBenchmarks = activeMaterials.reduce((acc, material) => {
      const key = material.category_id || 'unknown';
      if (!acc[key]) acc[key] = [];
      if (Number.isFinite(material.price_per_unit) && material.price_per_unit > 0) {
        acc[key].push(material.price_per_unit);
      }
      return acc;
    }, {});

    const avgByCategory = Object.fromEntries(
      Object.entries(categoryBenchmarks).map(([categoryId, values]) => [
        categoryId,
        values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null,
      ])
    );

    return suppliers
      .map(supplier => {
        const ownMaterials = activeMaterials.filter(m => m.supplier_id === supplier.id);

        const savingsCandidates = ownMaterials
          .filter(m => Number.isFinite(m.price_per_unit) && m.price_per_unit > 0)
          .map(material => {
            const benchmark = avgByCategory[material.category_id || 'unknown'];
            const reorderQty = Math.max(material.reorder_quantity || 1, 1);
            const potentialSavings = benchmark && material.price_per_unit > benchmark
              ? (material.price_per_unit - benchmark) * reorderQty
              : 0;

            return {
              materialName: material.name,
              articleNumber: material.article_number,
              currentPrice: material.price_per_unit,
              benchmarkPrice: benchmark || material.price_per_unit,
              reorderQuantity: reorderQty,
              potentialSavings,
            };
          })
          .filter(item => item.potentialSavings > 0.5)
          .sort((a, b) => b.potentialSavings - a.potentialSavings)
          .slice(0, 3);

        const criticalCount = ownMaterials.filter(m => (m.current_stock || 0) <= (m.min_stock || 0)).length;
        const totalPotentialSavings = savingsCandidates.reduce((sum, item) => sum + item.potentialSavings, 0);
        const missingArticleNumbers = ownMaterials.filter(m => !m.article_number || !m.article_number.trim()).length;

        return {
          supplierId: supplier.id,
          criticalCount,
          totalPotentialSavings,
          savingsCandidates,
          missingArticleNumbers,
          materialsCount: ownMaterials.length,
        };
      })
      .reduce((acc, insight) => {
        acc[insight.supplierId] = insight;
        return acc;
      }, {});
  }, [materials, suppliers]);

  function getMaterialCount(supId) {
    return materials.filter(m => m.supplier_id === supId && m.active).length;
  }

  function handleChange(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleAdd() {
    if (!form.name.trim()) {
      setToast({ message: 'Name darf nicht leer sein.', type: 'error' });
      return;
    }
    try {
      await addSupplier({ id: uuid(), ...form, name: form.name.trim() });
      setForm(emptyForm);
      setShowAdd(false);
      setToast({ message: 'Lieferant erstellt ✓', type: 'success' });
    } catch (err) {
      setToast({ message: 'Fehler: ' + err.message, type: 'error' });
    }
  }

  async function handleSaveEdit() {
    if (!form.name.trim()) return;
    try {
      await editSupplier(editingId, { ...form, name: form.name.trim() });
      setEditingId(null);
      setForm(emptyForm);
      setToast({ message: 'Gespeichert ✓', type: 'success' });
    } catch (err) {
      setToast({ message: 'Fehler: ' + err.message, type: 'error' });
    }
  }

  async function handleDelete() {
    try {
      await removeSupplier(deleteTarget.id);
      setDeleteTarget(null);
      setToast({ message: 'Lieferant gelöscht.', type: 'info' });
    } catch (err) {
      setToast({ message: 'Fehler: ' + err.message, type: 'error' });
    }
  }

  function startEdit(sup) {
    setEditingId(sup.id);
    setForm({
      name: sup.name,
      contact_email: sup.contact_email || '',
      contact_phone: sup.contact_phone || '',
      notes: sup.notes || '',
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  return (
    <>
      <header className="page-header">
        <button className="page-header-back" onClick={() => navigate(-1)}>
          <ChevronLeft size={22} />
        </button>
        <h1>Lieferanten</h1>
        <button className="page-header-action" onClick={() => { setShowAdd(!showAdd); setForm(emptyForm); }}>
          <Plus size={20} />
        </button>
      </header>

      <div className="page-content">
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

        {showAdd && (
          <div className="card mb-lg" style={{ border: '2px solid var(--color-primary)', animation: 'fadeIn 0.2s' }}>
            <div className="font-semibold mb-md">Neuer Lieferant</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              <input type="text" value={form.name} onChange={e => handleChange('name', e.target.value)} placeholder="Firmenname *" autoFocus />
              <input type="email" value={form.contact_email} onChange={e => handleChange('contact_email', e.target.value)} placeholder="E-Mail (optional)" />
              <input type="tel" value={form.contact_phone} onChange={e => handleChange('contact_phone', e.target.value)} placeholder="Telefon (optional)" />
              <input type="text" value={form.notes} onChange={e => handleChange('notes', e.target.value)} placeholder="Notiz (optional)" />
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-md)' }}>
              <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={handleAdd}>
                <Check size={16} /> Erstellen
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowAdd(false)}>
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        <div className="list">
          {suppliers.map(sup => {
            const insight = supplierInsights[sup.id];
            const hoverComparison = insight?.savingsCandidates?.length
              ? insight.savingsCandidates
                  .map(item => `${item.materialName} (${item.articleNumber || "ohne Art.-Nr."}): ${item.currentPrice.toFixed(2)}€ -> Ø ${item.benchmarkPrice.toFixed(2)}€ | Potenzial ${item.potentialSavings.toFixed(2)}€`)
                  .join('\n')
              : 'Noch keine Preisvergleichsdaten verfügbar';

            return (
              <div key={sup.id} className="card">
                {editingId === sup.id ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                    <input type="text" value={form.name} onChange={e => handleChange('name', e.target.value)} placeholder="Firmenname *" autoFocus />
                    <input type="email" value={form.contact_email} onChange={e => handleChange('contact_email', e.target.value)} placeholder="E-Mail" />
                    <input type="tel" value={form.contact_phone} onChange={e => handleChange('contact_phone', e.target.value)} placeholder="Telefon" />
                    <input type="text" value={form.notes} onChange={e => handleChange('notes', e.target.value)} placeholder="Notiz" />
                    <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                      <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={handleSaveEdit}>
                        <Check size={14} /> Speichern
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={cancelEdit}>
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-50)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 'var(--font-size-sm)', flexShrink: 0 }}>
                      {sup.name.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="font-semibold">{sup.name}</div>
                      <div className="text-xs text-tertiary" style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-sm)', marginTop: 2 }}>
                        {sup.contact_email && <a href={`mailto:${sup.contact_email}`} style={{ color: 'var(--color-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 2 }}><Mail size={10} /> {sup.contact_email}</a>}
                        {sup.contact_phone && <a href={`tel:${sup.contact_phone}`} style={{ color: 'var(--color-text-tertiary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 2 }}><Phone size={10} /> {sup.contact_phone}</a>}
                      </div>
                      <div className="text-xs text-tertiary" style={{ marginTop: 2 }}>
                        {getMaterialCount(sup.id)} Artikel{sup.notes ? ` · ${sup.notes}` : ''}
                      </div>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                        <span className="chip" title={hoverComparison} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'help' }}>
                          <TrendingDown size={12} /> Sparpotenzial: {insight?.totalPotentialSavings?.toFixed(2) || '0.00'}€
                        </span>
                        <span className="chip" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <AlertTriangle size={12} /> Kritische Artikel: {insight?.criticalCount || 0}
                        </span>
                        <span className="chip" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <Sparkles size={12} /> Fehlende Art.-Nr.: {insight?.missingArticleNumbers || 0}
                        </span>
                      </div>
                    </div>
                    <button className="btn btn-ghost btn-sm" onClick={() => startEdit(sup)} style={{ padding: 'var(--space-sm)' }}>
                      <Edit2 size={16} />
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setDeleteTarget(sup)} style={{ padding: 'var(--space-sm)', color: 'var(--color-danger)' }} disabled={getMaterialCount(sup.id) > 0} title={getMaterialCount(sup.id) > 0 ? 'Hat noch zugeordnete Artikel' : ''}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {suppliers.length === 0 && <div className="text-center text-secondary" style={{ padding: 'var(--space-4xl)' }}>Noch keine Lieferanten angelegt.</div>}

        {suppliers.length > 0 && (
          <div className="card" style={{ marginTop: 'var(--space-lg)', border: '1px dashed var(--color-primary-200)' }}>
            <div className="font-semibold" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={16} color="var(--color-primary)" /> KI-Einkaufsimpuls
            </div>
            <div className="text-sm text-secondary" style={{ marginTop: 'var(--space-sm)' }}>
              Priorisiere Lieferanten mit hohem Sparpotenzial, kritischen Artikeln und unvollständigen Stammdaten. Mouseover auf „Sparpotenzial“ zeigt Benchmark-Vergleiche pro Artikel auf Basis des Durchschnittspreises in der Kategorie.
            </div>
          </div>
        )}

        {deleteTarget && (
          <ConfirmDialog
            title="Lieferant löschen?"
            message={`„${deleteTarget.name}" wird gelöscht. Materialien werden keinem Lieferanten zugeordnet.`}
            confirmText="Löschen"
            danger
            onCancel={() => setDeleteTarget(null)}
            onConfirm={handleDelete}
          />
        )}
      </div>
    </>
  );
}
