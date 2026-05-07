import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, Edit2, Trash2, Check, X, Mail, Phone, TrendingDown, AlertTriangle, Calculator } from 'lucide-react';
import { v4 as uuid } from 'uuid';
import { useStore } from '../hooks/useStore';
import ConfirmDialog from '../components/ConfirmDialog';
import Toast from '../components/Toast';

const QUOTE_STORAGE_KEY = 'lagerpro_supplier_quotes_v1';

function readStoredQuotes() {
  try {
    const raw = localStorage.getItem(QUOTE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export default function SupplierManager() {
  const navigate = useNavigate();
  const { suppliers, materials, addSupplier, editSupplier, removeSupplier } = useStore();
  const [toast, setToast] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [quoteInputs, setQuoteInputs] = useState(() => readStoredQuotes());

  const emptyForm = { name: '', contact_email: '', contact_phone: '', notes: '' };
  const [form, setForm] = useState(emptyForm);

  const supplierInsights = useMemo(() => {
    const activeMaterials = materials.filter(m => m.active);
    return suppliers.reduce((acc, supplier) => {
      const ownMaterials = activeMaterials.filter(m => m.supplier_id === supplier.id);
      const criticalCount = ownMaterials.filter(m => (m.current_stock || 0) <= (m.min_stock || 0)).length;

      const savingsCandidates = ownMaterials
        .map(material => {
          const key = `${supplier.id}_${material.id}`;
          const quotePrice = Number(quoteInputs[key]);
          const currentPrice = Number(material.price_per_unit || 0);
          const reorderQty = Math.max(Number(material.reorder_quantity || 1), 1);
          const valid = Number.isFinite(quotePrice) && quotePrice > 0 && quotePrice < currentPrice;
          const potentialSavings = valid ? (currentPrice - quotePrice) * reorderQty : 0;

          return {
            materialId: material.id,
            materialName: material.name,
            currentPrice,
            quotePrice,
            reorderQty,
            potentialSavings,
            hasValidQuote: valid,
          };
        })
        .filter(item => item.hasValidQuote)
        .sort((a, b) => b.potentialSavings - a.potentialSavings)
        .slice(0, 5);

      acc[supplier.id] = {
        criticalCount,
        totalPotentialSavings: savingsCandidates.reduce((sum, item) => sum + item.potentialSavings, 0),
        savingsCandidates,
      };

      return acc;
    }, {});
  }, [materials, suppliers, quoteInputs]);

  function persistQuotes(next) {
    setQuoteInputs(next);
    localStorage.setItem(QUOTE_STORAGE_KEY, JSON.stringify(next));
  }

  function updateQuote(supplierId, materialId, value) {
    const key = `${supplierId}_${materialId}`;
    persistQuotes({ ...quoteInputs, [key]: value });
  }

  function getMaterialCount(supId) {
    return materials.filter(m => m.supplier_id === supId && m.active).length;
  }

  function handleChange(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleAdd() {
    if (!form.name.trim()) return setToast({ message: 'Name darf nicht leer sein.', type: 'error' });
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
    setForm({ name: sup.name, contact_email: sup.contact_email || '', contact_phone: sup.contact_phone || '', notes: sup.notes || '' });
  }

  return (
    <>
      <header className="page-header">
        <button className="page-header-back" onClick={() => navigate(-1)}><ChevronLeft size={22} /></button>
        <h1>Lieferanten</h1>
        <button className="page-header-action" onClick={() => { setShowAdd(!showAdd); setForm(emptyForm); }}><Plus size={20} /></button>
      </header>

      <div className="page-content">
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

        {showAdd && (
          <div className="card mb-lg" style={{ border: '2px solid var(--color-primary)' }}>
            <div className="font-semibold mb-md">Neuer Lieferant</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              <input type="text" value={form.name} onChange={e => handleChange('name', e.target.value)} placeholder="Firmenname *" autoFocus />
              <input type="email" value={form.contact_email} onChange={e => handleChange('contact_email', e.target.value)} placeholder="E-Mail (optional)" />
              <input type="tel" value={form.contact_phone} onChange={e => handleChange('contact_phone', e.target.value)} placeholder="Telefon (optional)" />
              <input type="text" value={form.notes} onChange={e => handleChange('notes', e.target.value)} placeholder="Notiz (optional)" />
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-md)' }}>
              <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={handleAdd}><Check size={16} /> Erstellen</button>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowAdd(false)}><X size={16} /></button>
            </div>
          </div>
        )}

        <div className="list">
          {suppliers.map(sup => {
            const insight = supplierInsights[sup.id] || { criticalCount: 0, totalPotentialSavings: 0, savingsCandidates: [] };
            const ownMaterials = materials.filter(m => m.active && m.supplier_id === sup.id).slice(0, 4);
            return (
              <div key={sup.id} className="card">
                {editingId === sup.id ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                    <input type="text" value={form.name} onChange={e => handleChange('name', e.target.value)} placeholder="Firmenname *" autoFocus />
                    <input type="email" value={form.contact_email} onChange={e => handleChange('contact_email', e.target.value)} placeholder="E-Mail" />
                    <input type="tel" value={form.contact_phone} onChange={e => handleChange('contact_phone', e.target.value)} placeholder="Telefon" />
                    <input type="text" value={form.notes} onChange={e => handleChange('notes', e.target.value)} placeholder="Notiz" />
                    <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                      <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={handleSaveEdit}><Check size={14} /> Speichern</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => { setEditingId(null); setForm(emptyForm); }}><X size={14} /></button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                      <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-50)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>
                        {sup.name.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="font-semibold">{sup.name}</div>
                        <div className="text-xs text-tertiary" style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
                          {sup.contact_email && <a href={`mailto:${sup.contact_email}`} style={{ color: 'var(--color-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 2 }}><Mail size={10} /> {sup.contact_email}</a>}
                          {sup.contact_phone && <a href={`tel:${sup.contact_phone}`} style={{ color: 'var(--color-text-tertiary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 2 }}><Phone size={10} /> {sup.contact_phone}</a>}
                        </div>
                        <div className="text-xs text-tertiary">{getMaterialCount(sup.id)} Artikel{sup.notes ? ` · ${sup.notes}` : ''}</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: 8 }}>
                          <span className="chip" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><TrendingDown size={12} /> Validiertes Sparpotenzial: {insight.totalPotentialSavings.toFixed(2)}€</span>
                          <span className="chip" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><AlertTriangle size={12} /> Kritisch: {insight.criticalCount}</span>
                        </div>
                      </div>
                      <button className="btn btn-ghost btn-sm" onClick={() => startEdit(sup)} style={{ padding: 'var(--space-sm)' }}><Edit2 size={16} /></button>
                      <button className="btn btn-ghost btn-sm" onClick={() => setDeleteTarget(sup)} style={{ padding: 'var(--space-sm)', color: 'var(--color-danger)' }} disabled={getMaterialCount(sup.id) > 0}><Trash2 size={16} /></button>
                    </div>

                    <div style={{ marginTop: 'var(--space-md)', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-md)' }}>
                      <div className="text-sm font-semibold" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Calculator size={14} /> Angebotsvergleich (Top 4 Artikel)</div>
                      <div style={{ display: 'grid', gap: 'var(--space-sm)', marginTop: 'var(--space-sm)' }}>
                        {ownMaterials.length === 0 && <div className="text-xs text-tertiary">Keine Artikel diesem Lieferanten zugeordnet.</div>}
                        {ownMaterials.map(material => {
                          const key = `${sup.id}_${material.id}`;
                          const quote = quoteInputs[key] || '';
                          const currentPrice = Number(material.price_per_unit || 0);
                          const savings = quote && Number(quote) > 0 ? (currentPrice - Number(quote)) * Math.max(material.reorder_quantity || 1, 1) : 0;
                          return (
                            <div key={material.id} style={{ display: 'grid', gridTemplateColumns: '1fr 110px', gap: 'var(--space-sm)', alignItems: 'center' }}>
                              <div>
                                <div className="text-sm">{material.name}</div>
                                <div className="text-xs text-tertiary">Aktuell: {currentPrice.toFixed(2)}€ · Bestellmenge: {material.reorder_quantity || 1}</div>
                              </div>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={quote}
                                onChange={e => updateQuote(sup.id, material.id, e.target.value)}
                                placeholder="Angebot €"
                                title={savings > 0 ? `Potenzial: ${savings.toFixed(2)}€` : 'Nur Werte unter aktuellem Preis zählen als Sparpotenzial'}
                              />
                            </div>
                          );
                        })}
                      </div>
                      {insight.savingsCandidates.length > 0 && (
                        <div className="text-xs text-tertiary" style={{ marginTop: 8 }}>
                          Beste Chancen: {insight.savingsCandidates.slice(0, 2).map(item => `${item.materialName} (${item.potentialSavings.toFixed(2)}€)`).join(' · ')}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {deleteTarget && <ConfirmDialog title="Lieferant löschen?" message={`„${deleteTarget.name}" wird gelöscht. Materialien werden keinem Lieferanten zugeordnet.`} confirmText="Löschen" danger onCancel={() => setDeleteTarget(null)} onConfirm={handleDelete} />}
      </div>
    </>
  );
}
