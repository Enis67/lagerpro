import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { v4 as uuid } from 'uuid';
import { ChevronLeft, Save } from 'lucide-react';
import { useStore } from '../hooks/useStore';
import { PROJECT_STATUSES } from '../data/constants';
import Toast from '../components/Toast';

export default function ProjectForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { projects, addProject, editProject } = useStore();
  const [toast, setToast] = useState(null);

  const isNew = id === 'neu';
  const existing = !isNew ? projects.find(p => p.id === id) : null;

  const [form, setForm] = useState({
    name: '',
    customer: '',
    location: '',
    status: 'geplant',
    start_date: '',
    end_date: '',
    notes: '',
  });

  useEffect(() => {
    if (existing) {
      setForm({ ...existing });
    }
  }, [existing]);

  function handleChange(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) {
      setToast({ message: 'Auftragsname ist ein Pflichtfeld.', type: 'error' });
      return;
    }

    try {
      if (isNew) {
        await addProject({ ...form, id: uuid(), active: true });
        setToast({ message: 'Baustelle angelegt! ✓', type: 'success' });
      } else {
        await editProject(id, { ...form, active: existing?.active ?? true });
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
        <h1>{isNew ? 'Neue Baustelle' : 'Bearbeiten'}</h1>
        <div style={{ width: 44 }} />
      </header>

      <div className="page-content">
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Auftragsname *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => handleChange('name', e.target.value)}
              placeholder="z.B. UV-Erweiterung Fam. Müller"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Kunde</label>
            <input
              type="text"
              value={form.customer}
              onChange={e => handleChange('customer', e.target.value)}
              placeholder="z.B. Familie Müller"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Adresse / Standort</label>
            <input
              type="text"
              value={form.location}
              onChange={e => handleChange('location', e.target.value)}
              placeholder="z.B. Mühlenweg 12, 26721 Emden"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Status</label>
              <select value={form.status} onChange={e => handleChange('status', e.target.value)}>
                {PROJECT_STATUSES.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Start</label>
              <input
                type="date"
                value={form.start_date}
                onChange={e => handleChange('start_date', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Ende</label>
              <input
                type="date"
                value={form.end_date}
                onChange={e => handleChange('end_date', e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Notizen</label>
            <textarea
              value={form.notes}
              onChange={e => handleChange('notes', e.target.value)}
              placeholder="z.B. Besonderheiten, Anfahrt, Schlüssel beim Nachbarn..."
              rows={3}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-full btn-lg" style={{ marginTop: 'var(--space-lg)' }}>
            <Save size={20} />
            {isNew ? 'Baustelle anlegen' : 'Änderungen speichern'}
          </button>
        </form>
      </div>
    </>
  );
}
