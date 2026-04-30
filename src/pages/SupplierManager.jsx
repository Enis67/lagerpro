import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, Edit2, Trash2, Check, X, Mail, Phone } from 'lucide-react';
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

        {/* Neuer Lieferant */}
        {showAdd && (
          <div className="card mb-lg" style={{ border: '2px solid var(--color-primary)', animation: 'fadeIn 0.2s' }}>
            <div className="font-semibold mb-md">Neuer Lieferant</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              <input
                type="text"
                value={form.name}
                onChange={e => handleChange('name', e.target.value)}
                placeholder="Firmenname *"
                autoFocus
              />
              <input
                type="email"
                value={form.contact_email}
                onChange={e => handleChange('contact_email', e.target.value)}
                placeholder="E-Mail (optional)"
              />
              <input
                type="tel"
                value={form.contact_phone}
                onChange={e => handleChange('contact_phone', e.target.value)}
                placeholder="Telefon (optional)"
              />
              <input
                type="text"
                value={form.notes}
                onChange={e => handleChange('notes', e.target.value)}
                placeholder="Notiz (optional)"
              />
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

        {/* Liste */}
        <div className="list">
          {suppliers.map(sup => (
            <div key={sup.id} className="card">
              {editingId === sup.id ? (
                /* Edit Mode */
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                  <input
                    type="text" value={form.name}
                    onChange={e => handleChange('name', e.target.value)}
                    placeholder="Firmenname *" autoFocus
                  />
                  <input
                    type="email" value={form.contact_email}
                    onChange={e => handleChange('contact_email', e.target.value)}
                    placeholder="E-Mail"
                  />
                  <input
                    type="tel" value={form.contact_phone}
                    onChange={e => handleChange('contact_phone', e.target.value)}
                    placeholder="Telefon"
                  />
                  <input
                    type="text" value={form.notes}
                    onChange={e => handleChange('notes', e.target.value)}
                    placeholder="Notiz"
                  />
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
                /* View Mode */
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 'var(--radius-md)',
                    background: 'var(--color-primary-50)', color: 'var(--color-primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: 'var(--font-size-sm)', flexShrink: 0,
                  }}>
                    {sup.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="font-semibold">{sup.name}</div>
                    <div className="text-xs text-tertiary" style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-sm)', marginTop: 2 }}>
                      {sup.contact_email && (
                        <a href={`mailto:${sup.contact_email}`} style={{ color: 'var(--color-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Mail size={10} /> {sup.contact_email}
                        </a>
                      )}
                      {sup.contact_phone && (
                        <a href={`tel:${sup.contact_phone}`} style={{ color: 'var(--color-text-tertiary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Phone size={10} /> {sup.contact_phone}
                        </a>
                      )}
                    </div>
                    <div className="text-xs text-tertiary" style={{ marginTop: 2 }}>
                      {getMaterialCount(sup.id)} Artikel{sup.notes ? ` · ${sup.notes}` : ''}
                    </div>
                  </div>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => startEdit(sup)}
                    style={{ padding: 'var(--space-sm)' }}
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => setDeleteTarget(sup)}
                    style={{ padding: 'var(--space-sm)', color: 'var(--color-danger)' }}
                    disabled={getMaterialCount(sup.id) > 0}
                    title={getMaterialCount(sup.id) > 0 ? 'Hat noch zugeordnete Artikel' : ''}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {suppliers.length === 0 && (
          <div className="text-center text-secondary" style={{ padding: 'var(--space-4xl)' }}>
            Noch keine Lieferanten angelegt.
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
