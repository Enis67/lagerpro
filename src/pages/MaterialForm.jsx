import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { v4 as uuid } from 'uuid';
import { ChevronLeft, Save } from 'lucide-react';
import { useStore } from '../hooks/useStore';
import { UNITS } from '../data/constants';
import Toast from '../components/Toast';
import ImageUploader from '../components/ImageUploader';

export default function MaterialForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { materials, categories, suppliers, addMaterial, editMaterial } = useStore();
  const [toast, setToast] = useState(null);

  const isNew = id === 'neu';
  const existing = !isNew ? materials.find(m => m.id === id) : null;

  const [form, setForm] = useState({
    article_number: '',
    manufacturer_number: '',
    ean_code: '',
    name: '',
    category_id: categories[0]?.id || '',
    description: '',
    unit: 'stueck',
    current_stock: 0,
    reserved_stock: 0,
    min_stock: 0,
    reorder_quantity: 0,
    storage_location: '',
    supplier_id: suppliers[0]?.id || '',
    purchase_price: 0,
    packaging_unit: '',
    active: true,
    images: [],
  });
  const [images, setImages] = useState([]);

  useEffect(() => {
    if (existing) {
      setForm({ ...existing });
      // Lade Bilder aus localStorage
      try {
        const stored = localStorage.getItem(`material-images-${existing.id}`);
        if (stored) setImages(JSON.parse(stored));
      } catch { /* ignore */ }
    }
  }, [existing]);

  function handleChange(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.article_number.trim()) {
      setToast({ message: 'Name und Artikelnummer sind Pflichtfelder.', type: 'error' });
      return;
    }

    try {
      if (isNew) {
        await addMaterial({ ...form, id: uuid() });
        setToast({ message: 'Material angelegt! ✓', type: 'success' });
      } else {
        await editMaterial(id, form);
        setToast({ message: 'Änderungen gespeichert! ✓', type: 'success' });
      }
      setTimeout(() => navigate(-1), 1200);
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
        <h1>{isNew ? 'Neues Material' : 'Bearbeiten'}</h1>
        <div style={{ width: 44 }} />
      </header>

      <div className="page-content">
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Artikelname *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => handleChange('name', e.target.value)}
              placeholder="z.B. LS-Schalter B16 1-polig"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Artikelnr. *</label>
              <input
                type="text"
                value={form.article_number}
                onChange={e => handleChange('article_number', e.target.value)}
                placeholder="z.B. LS-B16-1"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Herstellernr.</label>
              <input
                type="text"
                value={form.manufacturer_number}
                onChange={e => handleChange('manufacturer_number', e.target.value)}
                placeholder="z.B. MBN116"
              />
              <span className="form-helper">Für präzise Sonepar-Suche</span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">EAN / GTIN (Barcode)</label>
            <input
              type="text"
              value={form.ean_code}
              onChange={e => handleChange('ean_code', e.target.value)}
              placeholder="z.B. 4012233331126"
              inputMode="numeric"
            />
            <span className="form-helper">13-stellige Nummer vom Produkt-Barcode – wird vom Scanner automatisch erkannt</span>
          </div>

          <div className="form-group">
            <label className="form-label">Einheit</label>
            <select value={form.unit} onChange={e => handleChange('unit', e.target.value)}>
              {UNITS.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Kategorie</label>
              <select value={form.category_id} onChange={e => handleChange('category_id', e.target.value)}>
                <option value="">– Keine –</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Lieferant</label>
              <select value={form.supplier_id} onChange={e => handleChange('supplier_id', e.target.value)}>
                <option value="">– Keiner –</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Beschreibung</label>
            <textarea
              value={form.description}
              onChange={e => handleChange('description', e.target.value)}
              placeholder="Optional: Details zum Artikel"
              rows={2}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Bestand</label>
              <input
                type="number"
                value={form.current_stock}
                onChange={e => handleChange('current_stock', Number(e.target.value))}
                min="0"
                inputMode="numeric"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Mindestbestand</label>
              <input
                type="number"
                value={form.min_stock}
                onChange={e => handleChange('min_stock', Number(e.target.value))}
                min="0"
                inputMode="numeric"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Bestellmenge</label>
              <input
                type="number"
                value={form.reorder_quantity}
                onChange={e => handleChange('reorder_quantity', Number(e.target.value))}
                min="0"
                inputMode="numeric"
              />
            </div>
            <div className="form-group">
              <label className="form-label">EK-Preis (€)</label>
              <input
                type="number"
                step="0.01"
                value={form.purchase_price}
                onChange={e => handleChange('purchase_price', Number(e.target.value))}
                min="0"
                inputMode="decimal"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Lagerort</label>
              <input
                type="text"
                value={form.storage_location}
                onChange={e => handleChange('storage_location', e.target.value)}
                placeholder="z.B. Regal A1"
              />
            </div>
            <div className="form-group">
              <label className="form-label">VPE</label>
              <input
                type="text"
                value={form.packaging_unit}
                onChange={e => handleChange('packaging_unit', e.target.value)}
                placeholder="z.B. 10er Pack"
              />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: 'var(--space-lg)' }}>
            <label className="form-label">Artikelbilder</label>
            <ImageUploader
              materialId={isNew ? 'new' : id}
              images={images}
              onChange={setImages}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-full btn-lg" style={{ marginTop: 'var(--space-lg)' }}>
            <Save size={20} />
            {isNew ? 'Material anlegen' : 'Änderungen speichern'}
          </button>
        </form>
      </div>
    </>
  );
}
