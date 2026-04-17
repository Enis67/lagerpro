import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuid } from 'uuid';
import {
  ChevronLeft, PackagePlus, PackageMinus, PackageCheck, PenLine,
  BookmarkPlus, BookmarkMinus, Minus, Plus, Check, Search
} from 'lucide-react';
import { useStore } from '../hooks/useStore';
import { MOVEMENT_TYPES, UNIT_LABELS, DEFAULT_USER } from '../data/constants';
import SearchBar from '../components/SearchBar';
import Toast from '../components/Toast';

const iconMap = {
  eingang: PackagePlus, entnahme: PackageMinus, rueckgabe: PackageCheck,
  korrektur: PenLine, reservierung: BookmarkPlus, reservierung_aufloesen: BookmarkMinus,
};

export default function QuickBooking() {
  const navigate = useNavigate();
  const { materials, projects, addMovement } = useStore();
  const [step, setStep] = useState(1);
  const [bookingType, setBookingType] = useState('entnahme');
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');
  const [search, setSearch] = useState('');
  const [projectSearch, setProjectSearch] = useState('');
  const [toast, setToast] = useState(null);

  const activeProjects = projects.filter(p => p.status !== 'abgeschlossen');

  const filteredMaterials = materials.filter(m =>
    m.active && (
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.article_number.toLowerCase().includes(search.toLowerCase())
    )
  );

  const filteredProjects = activeProjects.filter(p =>
    p.name.toLowerCase().includes(projectSearch.toLowerCase()) ||
    p.customer.toLowerCase().includes(projectSearch.toLowerCase())
  );

  const needsProject = ['entnahme', 'reservierung', 'reservierung_aufloesen'].includes(bookingType);

  async function handleBook() {
    if (!selectedMaterial || quantity <= 0) return;

    try {
      await addMovement({
        id: uuid(),
        material_id: selectedMaterial.id,
        project_id: selectedProject?.id || null,
        user_id: DEFAULT_USER.id,
        type: bookingType,
        quantity: Number(quantity),
        note,
      });

      setToast({ message: 'Buchung erfolgreich! ✓', type: 'success' });

      setTimeout(() => {
        // Reset für nächste Buchung
        setStep(1);
        setSelectedMaterial(null);
        setSelectedProject(null);
        setQuantity(1);
        setNote('');
        setSearch('');
      }, 1500);
    } catch (err) {
      setToast({ message: 'Fehler beim Buchen: ' + err.message, type: 'error' });
    }
  }

  const stepTitles = ['Buchungsart', 'Material', 'Menge & Buchen'];

  return (
    <>
      <header className="page-header">
        <button className="page-header-back" onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)}>
          <ChevronLeft size={22} />
        </button>
        <h1>Buchen</h1>
        <div style={{ width: 44 }} />
      </header>

      <div className="page-content">
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

        {/* Steps Indicator */}
        <div className="booking-steps">
          {stepTitles.map((title, i) => (
            <div key={i} style={{ display: 'contents' }}>
              <div className={`booking-step ${step === i + 1 ? 'active' : step > i + 1 ? 'done' : ''}`}>
                <div className="booking-step-number">
                  {step > i + 1 ? <Check size={14} /> : i + 1}
                </div>
                <span className="booking-step-label">{title}</span>
              </div>
              {i < stepTitles.length - 1 && (
                <div className={`booking-step-line ${step > i + 1 ? 'done' : ''}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Buchungsart */}
        {step === 1 && (
          <div>
            <div className="booking-type-grid">
              {MOVEMENT_TYPES.map(type => {
                const Icon = iconMap[type.value];
                return (
                  <button
                    key={type.value}
                    className={`booking-type-btn ${bookingType === type.value ? 'active' : ''}`}
                    onClick={() => setBookingType(type.value)}
                  >
                    <Icon size={24} style={{ color: type.color }} />
                    {type.label}
                  </button>
                );
              })}
            </div>
            <button className="btn btn-primary btn-full btn-lg" onClick={() => setStep(2)}>
              Weiter → Material wählen
            </button>
          </div>
        )}

        {/* Step 2: Material auswählen */}
        {step === 2 && (
          <div>
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Material suchen..."
            />
            <div className="list">
              {filteredMaterials.map(m => (
                <div
                  key={m.id}
                  className={`card card-clickable ${selectedMaterial?.id === m.id ? '' : ''}`}
                  style={selectedMaterial?.id === m.id ? {
                    border: '2px solid var(--color-primary)',
                    background: 'var(--color-primary-50)'
                  } : {}}
                  onClick={() => {
                    setSelectedMaterial(m);
                    if (needsProject && activeProjects.length > 0) {
                      // Zeige Baustellen-Auswahl inline
                    }
                  }}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold">{m.name}</div>
                      <div className="text-sm text-secondary">{m.article_number} · {UNIT_LABELS[m.unit]}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{m.current_stock - m.reserved_stock}</div>
                      <div className="text-xs text-tertiary">verfügbar</div>
                    </div>
                  </div>
                </div>
              ))}
              {filteredMaterials.length === 0 && (
                <div className="text-center text-secondary" style={{ padding: 'var(--space-4xl)' }}>
                  Kein Material gefunden
                </div>
              )}
            </div>
            {selectedMaterial && (
              <div style={{ position: 'sticky', bottom: 'var(--space-lg)', paddingTop: 'var(--space-lg)' }}>
                <button className="btn btn-primary btn-full btn-lg" onClick={() => setStep(3)}>
                  Weiter → Menge eingeben
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Menge, Baustelle, Buchen */}
        {step === 3 && selectedMaterial && (
          <div>
            {/* Ausgewähltes Material */}
            <div className="card mb-lg">
              <div className="text-sm text-secondary mb-md">Ausgewähltes Material</div>
              <div className="font-bold">{selectedMaterial.name}</div>
              <div className="text-sm text-secondary">{selectedMaterial.article_number}</div>
              <div className="text-sm mt-sm">
                Verfügbar: <strong>{selectedMaterial.current_stock - selectedMaterial.reserved_stock} {UNIT_LABELS[selectedMaterial.unit]}</strong>
              </div>
            </div>

            {/* Menge */}
            <div className="quantity-input">
              <button
                className="quantity-btn"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus size={22} />
              </button>
              <input
                type="number"
                className="quantity-value"
                value={quantity}
                onChange={e => setQuantity(Math.max(0, parseInt(e.target.value) || 0))}
                min="0"
                inputMode="numeric"
              />
              <button
                className="quantity-btn"
                onClick={() => setQuantity(quantity + 1)}
              >
                <Plus size={22} />
              </button>
            </div>
            <div className="quantity-unit">{UNIT_LABELS[selectedMaterial.unit]}</div>

            {/* Baustelle (optional) */}
            {needsProject && (
              <div className="form-group">
                <label className="form-label">Baustelle (optional)</label>
                <SearchBar
                  value={projectSearch}
                  onChange={setProjectSearch}
                  placeholder="Baustelle suchen..."
                />
                <div className="list" style={{ maxHeight: 200, overflowY: 'auto' }}>
                  {selectedProject && (
                    <div
                      className="card"
                      style={{ border: '2px solid var(--color-primary)', background: 'var(--color-primary-50)', marginBottom: 'var(--space-sm)' }}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-semibold">{selectedProject.name}</div>
                          <div className="text-sm text-secondary">{selectedProject.customer}</div>
                        </div>
                        <button className="btn btn-sm btn-ghost" onClick={() => setSelectedProject(null)}>✕</button>
                      </div>
                    </div>
                  )}
                  {!selectedProject && filteredProjects.map(p => (
                    <div
                      key={p.id}
                      className="card card-clickable"
                      style={{ marginBottom: 'var(--space-sm)' }}
                      onClick={() => setSelectedProject(p)}
                    >
                      <div className="font-semibold">{p.name}</div>
                      <div className="text-sm text-secondary">{p.customer}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notiz */}
            <div className="form-group">
              <label className="form-label">Notiz (optional)</label>
              <input
                type="text"
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="z.B. UV-Erweiterung 2. OG"
              />
            </div>

            {/* Buchen Button */}
            <button
              className="btn btn-accent btn-full btn-lg"
              onClick={handleBook}
              disabled={quantity <= 0}
              style={{ marginTop: 'var(--space-lg)' }}
            >
              <Check size={20} />
              {MOVEMENT_TYPES.find(t => t.value === bookingType)?.label} buchen
            </button>
          </div>
        )}
      </div>
    </>
  );
}
