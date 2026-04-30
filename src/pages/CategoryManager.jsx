import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, Edit2, Trash2, Check, X } from 'lucide-react';
import { v4 as uuid } from 'uuid';
import { useStore } from '../hooks/useStore';
import ConfirmDialog from '../components/ConfirmDialog';
import Toast from '../components/Toast';

export default function CategoryManager() {
  const navigate = useNavigate();
  const { categories, materials, addCategory, editCategory, removeCategory } = useStore();
  const [toast, setToast] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('#6B7280');
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#3B82F6');
  const [deleteTarget, setDeleteTarget] = useState(null);

  const presetColors = [
    '#3B82F6', '#EF4444', '#10B981', '#8B5CF6', '#F59E0B',
    '#EC4899', '#6B7280', '#14B8A6', '#F97316', '#84CC16',
    '#06B6D4', '#A855F7',
  ];

  function getMaterialCount(catId) {
    return materials.filter(m => m.category_id === catId && m.active).length;
  }

  async function handleAdd() {
    if (!newName.trim()) {
      setToast({ message: 'Name darf nicht leer sein.', type: 'error' });
      return;
    }
    try {
      await addCategory({ id: uuid(), name: newName.trim(), color: newColor });
      setNewName('');
      setNewColor('#3B82F6');
      setShowAdd(false);
      setToast({ message: 'Kategorie erstellt ✓', type: 'success' });
    } catch (err) {
      setToast({ message: 'Fehler: ' + err.message, type: 'error' });
    }
  }

  async function handleSaveEdit() {
    if (!editName.trim()) return;
    try {
      await editCategory(editingId, { name: editName.trim(), color: editColor });
      setEditingId(null);
      setToast({ message: 'Gespeichert ✓', type: 'success' });
    } catch (err) {
      setToast({ message: 'Fehler: ' + err.message, type: 'error' });
    }
  }

  async function handleDelete() {
    try {
      await removeCategory(deleteTarget.id);
      setDeleteTarget(null);
      setToast({ message: 'Kategorie gelöscht.', type: 'info' });
    } catch (err) {
      setToast({ message: 'Fehler: ' + err.message, type: 'error' });
    }
  }

  function startEdit(cat) {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditColor(cat.color || '#6B7280');
  }

  return (
    <>
      <header className="page-header">
        <button className="page-header-back" onClick={() => navigate(-1)}>
          <ChevronLeft size={22} />
        </button>
        <h1>Kategorien</h1>
        <button className="page-header-action" onClick={() => setShowAdd(!showAdd)}>
          <Plus size={20} />
        </button>
      </header>

      <div className="page-content">
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

        {/* Neue Kategorie */}
        {showAdd && (
          <div className="card mb-lg" style={{ border: '2px solid var(--color-primary)', animation: 'fadeIn 0.2s' }}>
            <div className="font-semibold mb-md">Neue Kategorie</div>
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="z.B. Photovoltaik"
              autoFocus
              style={{ marginBottom: 'var(--space-md)' }}
            />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 'var(--space-md)' }}>
              {presetColors.map(c => (
                <button
                  key={c}
                  onClick={() => setNewColor(c)}
                  style={{
                    width: 28, height: 28, borderRadius: '50%', background: c, border: 'none',
                    outline: newColor === c ? '3px solid var(--color-primary)' : '2px solid transparent',
                    outlineOffset: 2, cursor: 'pointer', transition: 'outline 0.15s',
                  }}
                />
              ))}
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
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
          {categories.map(cat => (
            <div key={cat.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
              {editingId === cat.id ? (
                /* Edit Mode */
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                  <input
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    autoFocus
                    style={{ fontSize: 'var(--font-size-sm)' }}
                  />
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {presetColors.map(c => (
                      <button
                        key={c}
                        onClick={() => setEditColor(c)}
                        style={{
                          width: 22, height: 22, borderRadius: '50%', background: c, border: 'none',
                          outline: editColor === c ? '2px solid var(--color-primary)' : 'none',
                          outlineOffset: 2, cursor: 'pointer',
                        }}
                      />
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                    <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={handleSaveEdit}>
                      <Check size={14} /> Speichern
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setEditingId(null)}>
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ) : (
                /* View Mode */
                <>
                  <div
                    style={{
                      width: 36, height: 36, borderRadius: 'var(--radius-md)',
                      background: (cat.color || '#6B7280') + '20',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}
                  >
                    <div style={{
                      width: 14, height: 14, borderRadius: '50%', background: cat.color || '#6B7280',
                    }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="font-semibold">{cat.name}</div>
                    <div className="text-xs text-tertiary">{getMaterialCount(cat.id)} Artikel</div>
                  </div>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => startEdit(cat)}
                    style={{ padding: 'var(--space-sm)' }}
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => setDeleteTarget(cat)}
                    style={{ padding: 'var(--space-sm)', color: 'var(--color-danger)' }}
                    disabled={getMaterialCount(cat.id) > 0}
                    title={getMaterialCount(cat.id) > 0 ? 'Kategorie hat noch Artikel' : ''}
                  >
                    <Trash2 size={16} />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>

        {categories.length === 0 && (
          <div className="text-center text-secondary" style={{ padding: 'var(--space-4xl)' }}>
            Noch keine Kategorien angelegt.
          </div>
        )}

        {deleteTarget && (
          <ConfirmDialog
            title="Kategorie löschen?"
            message={`„${deleteTarget.name}" wird gelöscht. Materialien werden keiner Kategorie zugeordnet.`}
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
