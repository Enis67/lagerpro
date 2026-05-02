import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { v4 as uuid } from 'uuid';
import {
  ChevronLeft, PackagePlus, PackageMinus, PackageCheck, PenLine,
  BookmarkPlus, BookmarkMinus, Minus, Plus, Check, ScanBarcode, Trash2
} from 'lucide-react';
import { useStore } from '../hooks/useStore';
import { MOVEMENT_TYPES, UNIT_LABELS, DEFAULT_USER } from '../data/constants';
import SearchBar from '../components/SearchBar';
import Toast from '../components/Toast';
import BarcodeScanner from '../components/BarcodeScanner';

const iconMap = {
  eingang: PackagePlus, entnahme: PackageMinus, rueckgabe: PackageCheck,
  korrektur: PenLine, reservierung: BookmarkPlus, reservierung_aufloesen: BookmarkMinus,
};

export default function QuickBooking() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectMaterialId = searchParams.get('material');

  const { materials, projects, categories, addMovement, getCategoryName, incrementUsage } = useStore();
  const [step, setStep] = useState(1);
  const [bookingType, setBookingType] = useState('entnahme');
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [quantities, setQuantities] = useState({});
  const [note, setNote] = useState('');
  const [search, setSearch] = useState('');
  const [projectSearch, setProjectSearch] = useState('');
  const [toast, setToast] = useState(null);
  const [showScanner, setShowScanner] = useState(false);

  const activeProjects = projects.filter(p => p.status !== 'abgeschlossen');

  const filteredMaterials = materials.filter(m =>
    m.active && (
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.article_number.toLowerCase().includes(search.toLowerCase()) ||
      (m.manufacturer_number && m.manufacturer_number.toLowerCase().includes(search.toLowerCase()))
    )
  );

  const filteredProjects = activeProjects.filter(p =>
    p.name.toLowerCase().includes(projectSearch.toLowerCase()) ||
    p.customer.toLowerCase().includes(projectSearch.toLowerCase())
  );

  // Pre-select material from URL ?material=ID
  useEffect(() => {
    if (preselectMaterialId && materials.length > 0) {
      const mat = materials.find(m => m.id === preselectMaterialId);
      if (mat && !selectedMaterials.find(m => m.id === mat.id)) {
        setSelectedMaterials(prev => [...prev, mat]);
        setQuantities(prev => ({ ...prev, [mat.id]: 1 }));
        // Auto-advance to step 2 (material selection) if we're still on step 1
        setStep(2);
      }
    }
  }, [preselectMaterialId, materials]);

  const needsProject = ['entnahme', 'reservierung', 'reservierung_aufloesen'].includes(bookingType);

  function toggleMaterial(material) {
    setSelectedMaterials(prev => {
      const exists = prev.find(m => m.id === material.id);
      if (exists) {
        // Entfernen
        const updated = prev.filter(m => m.id !== material.id);
        setQuantities(q => {
          const newQ = { ...q };
          delete newQ[material.id];
          return newQ;
        });
        return updated;
      } else {
        // Hinzufügen mit Default-Menge 1
        setQuantities(q => ({ ...q, [material.id]: 1 }));
        return [...prev, material];
      }
    });
  }

  function updateQuantity(materialId, delta) {
    setQuantities(prev => ({
      ...prev,
      [materialId]: Math.max(1, (prev[materialId] || 1) + delta)
    }));
  }

  function removeSelected(id) {
    setSelectedMaterials(prev => prev.filter(m => m.id !== id));
    setQuantities(prev => {
      const newQ = { ...prev };
      delete newQ[id];
      return newQ;
    });
  }

  async function handleBook() {
    if (selectedMaterials.length === 0) return;

    try {
      for (const material of selectedMaterials) {
        await addMovement({
          id: uuid(),
          material_id: material.id,
          project_id: selectedProject?.id || null,
          user_id: DEFAULT_USER.id,
          type: bookingType,
          quantity: Number(quantities[material.id] || 1),
          note,
        });
        // Nutzung zählen für "Meine Artikel"
        incrementUsage(material.id);
      }

      setToast({
        message: `${selectedMaterials.length} Buchung(en) erfolgreich! ✓`,
        type: 'success'
      });

      setTimeout(() => {
        setStep(1);
        setSelectedMaterials([]);
        setSelectedProject(null);
        setQuantities({});
        setNote('');
        setSearch('');
      }, 1500);
    } catch (err) {
      setToast({ message: 'Fehler beim Buchen: ' + err.message, type: 'error' });
    }
  }

  function handleScanResult(material) {
    if (!selectedMaterials.find(m => m.id === material.id)) {
      setSelectedMaterials(prev => [...prev, material]);
      setQuantities(prev => ({ ...prev, [material.id]: 1 }));
    }
    setShowScanner(false);
    setToast({ message: `${material.name} erkannt ✓`, type: 'success' });
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
          <div className="list">
            {MOVEMENT_TYPES.map(type => {
              const Icon = iconMap[type.id];
              const isSelected = bookingType === type.id;
              return (
                <button
                  key={type.id}
                  className={`card card-clickable ${isSelected ? 'ring-2' : ''}`}
                  onClick={() => { setBookingType(type.id); setStep(2); }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    border: isSelected ? '2px solid var(--color-primary)' : undefined,
                  }}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: 12,
                    background: isSelected ? 'var(--color-primary)' : 'var(--color-primary-50)',
                    color: isSelected ? 'white' : 'var(--color-primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                  >
                    <Icon size={20} />
                  </div>
                  <div>
                    <div className="font-semibold">{type.label}</div>
                    <div className="text-sm text-secondary">{type.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Step 2: Material-Auswahl */}
        {step === 2 && (
          <>
            <div style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
              <SearchBar
                placeholder="Material suchen..."
                value={search}
                onChange={setSearch}
                style={{ flex: 1 }}
              />
              <button className="btn btn-primary btn-square" onClick={() => setShowScanner(true)}>
                <ScanBarcode size={20} />
              </button>
            </div>

            {showScanner && (
              <BarcodeScanner
                materials={materials.filter(m => m.active)}
                onScan={handleScanResult}
                onClose={() => setShowScanner(false)}
              />
            )}

            {/* Ausgewählte Materialien */}
            {selectedMaterials.length > 0 && (
              <div className="card mb-md" style={{ background: 'var(--color-primary-50)' }}>
                <div className="font-semibold mb-sm">{selectedMaterials.length} ausgewählt</div>
                {selectedMaterials.map(m => (
                  <div key={m.id} className="flex justify-between items-center py-sm">
                    <div>{m.name}</div>
                    <button className="btn btn-ghost btn-sm" onClick={() => removeSelected(m.id)}>
                      <Trash2 size={14} style={{ color: 'var(--color-danger)' }} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="list">
              {filteredMaterials.map(material => {
                const isSelected = selectedMaterials.find(m => m.id === material.id);
                const categoryColor = categories.find(c => c.id === material.category_id)?.color || '#6B7280';
                return (
                  <button
                    key={material.id}
                    className={`card card-clickable ${isSelected ? 'ring-2' : ''}`}
                    onClick={() => toggleMaterial(material)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      border: isSelected ? '2px solid var(--color-primary)' : undefined,
                    }}
                  >
                    <div style={{
                      width: 20, height: 20, borderRadius: 4,
                      border: '2px solid var(--color-primary)',
                      background: isSelected ? 'var(--color-primary)' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}
                    >
                      {isSelected && <Check size={14} color="white" />}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="flex items-center gap-sm">
                        <div style={{
                          width: 8, height: 8, borderRadius: '50%',
                          background: categoryColor,
                          flexShrink: 0,
                        }} />
                        <span className="font-semibold">{material.name}</span>
                      </div>
                      <div className="text-xs text-tertiary">
                        {material.article_number} · {getCategoryName(material.category_id)}
                      </div>
                    </div>

                    <div className="text-sm" style={{ color: material.current_stock <= material.min_stock ? 'var(--color-danger)' : 'var(--color-text-secondary)' }}>
                      {material.current_stock} {UNIT_LABELS[material.unit]}
                    </div>
                  </button>
                );
              })}
            </div>

            {filteredMaterials.length === 0 && search && (
              <div className="text-center text-secondary" style={{ padding: '48px 24px' }}>
                Kein Material gefunden.
              </div>
            )}

            <div style={{ height: 80 }} />
          </>
        )}

        {/* Step 3: Menge & Buchen */}
        {step === 3 && (
          <>
            {/* Projekt-Auswahl (falls benötigt) */}
            {needsProject && (
              <div className="card mb-lg">
                <div className="font-semibold mb-md">Baustelle</div>
                <SearchBar
                  placeholder="Baustelle suchen..."
                  value={projectSearch}
                  onChange={setProjectSearch}
                />
                <div className="list mt-md" style={{ maxHeight: 200, overflowY: 'auto' }}>
                  {filteredProjects.map(project => (
                    <button
                      key={project.id}
                      className="card card-clickable"
                      onClick={() => setSelectedProject(project)}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        border: selectedProject?.id === project.id ? '2px solid var(--color-primary)' : undefined,
                      }}
                    >
                      <div className="font-semibold">{project.name}</div>
                      <div className="text-xs text-tertiary">{project.customer} · {project.location}</div>
                    </button>
                  ))}
                </div>
                {filteredProjects.length === 0 && projectSearch && (
                  <div className="text-sm text-secondary mt-sm">Keine Baustelle gefunden.</div>
                )}
              </div>
            )}

            {/* Mengen für jedes Material */}
            <div className="font-semibold mb-md">Menge</div>
            <div className="list">
              {selectedMaterials.map(material => (
                <div key={material.id} className="card">
                  <div className="flex justify-between items-center mb-md">
                    <span className="font-semibold">{material.name}</span>
                    <button className="btn btn-ghost btn-sm" onClick={() => removeSelected(material.id)}>
                      <Trash2 size={14} style={{ color: 'var(--color-danger)' }} />
                    </button>
                  </div>
                  <div className="flex items-center gap-md">
                    <button className="quantity-btn" onClick={() => updateQuantity(material.id, -1)}>
                      <Minus size={18} />
                    </button>
                    <span className="quantity-value">{quantities[material.id] || 1}</span>
                    <span className="text-sm text-secondary">{UNIT_LABELS[material.unit]}</span>
                    <button className="quantity-btn" onClick={() => updateQuantity(material.id, 1)}>
                      <Plus size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Notiz */}
            <div className="card mt-lg">
              <div className="font-semibold mb-sm">Notiz (optional)</div>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="z.B. Bestellnummer, Grund..."
                rows={3}
              />
            </div>

            {/* Buchungs-Button */}
            <button
              className="btn btn-primary btn-full btn-lg"
              onClick={handleBook}
              disabled={selectedMaterials.length === 0 || (needsProject && !selectedProject)}
              style={{ marginTop: 'var(--space-xl)' }}
            >
              <Check size={20} />
              {selectedMaterials.length} Buchung{selectedMaterials.length !== 1 && 'en'} speichern
            </button>
          </>
        )}

        {/* Weiter-Button (Step 2 → 3) */}
        {step === 2 && selectedMaterials.length > 0 && (
          <div style={{
            position: 'fixed',
            bottom: 80,
            left: 0,
            right: 0,
            padding: 'var(--space-md) var(--space-lg)',
            background: 'var(--color-bg)',
            borderTop: '1px solid var(--color-border)',
            zIndex: 50,
          }}>
            <button
              className="btn btn-primary btn-full btn-lg"
              onClick={() => setStep(3)}
            >
              Weiter ({selectedMaterials.length} Material{selectedMaterials.length !== 1 && 'ien'})
            </button>
          </div>
        )}
      </div>
    </>
  );
}
