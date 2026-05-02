import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, PackageMinus, FileText, CalendarDays } from 'lucide-react';
import { useStore } from '../hooks/useStore';
import { UNIT_LABELS } from '../data/constants';
import EmptyState from '../components/EmptyState';

const DATE_PRESETS = [
  { label: 'Heute', days: 0 },
  { label: 'Gestern', days: 1 },
  { label: 'Letzte 7 Tage', days: 7 },
];

function isSameDay(d1, d2) {
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
}

function withinLastDays(date, days) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const diffMs = now - d;
  return diffMs >= 0 && diffMs <= days * 86400000;
}

export default function DailyReport() {
  const navigate = useNavigate();
  const { movements, materials, getProjectName, getMaterialName } = useStore();
  const [preset, setPreset] = useState(0); // 0=Heute, 1=Gestern, 2=7 Tage

  const materialMap = useMemo(() => {
    const map = new Map();
    materials.forEach(m => map.set(m.id, m));
    return map;
  }, [materials]);

  const filteredMovements = useMemo(() => {
    return movements.filter(m => {
      if (m.type !== 'entnahme') return false;
      const d = new Date(m.created_at);
      if (preset === 0) return isSameDay(d, new Date());
      if (preset === 1) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return isSameDay(d, yesterday);
      }
      return withinLastDays(d, 7);
    });
  }, [movements, preset]);

  // Nach Baustelle gruppiert
  const byProject = useMemo(() => {
    const map = new Map();
    filteredMovements.forEach(m => {
      const pid = m.project_id || 'keine';
      if (!map.has(pid)) map.set(pid, []);
      map.get(pid).push(m);
    });
    return Array.from(map.entries()).map(([pid, items]) => ({
      projectId: pid,
      projectName: pid === 'keine' ? 'Ohne Baustelle' : getProjectName(pid),
      items,
    }));
  }, [filteredMovements, getProjectName]);

  // Nach Material gruppiert
  const byMaterial = useMemo(() => {
    const map = new Map();
    filteredMovements.forEach(m => {
      const mid = m.material_id;
      if (!map.has(mid)) map.set(mid, { material: materialMap.get(mid), total: 0 });
      map.get(mid).total += m.quantity;
    });
    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [filteredMovements, materialMap]);

  // Gesamt-EK-Wert
  const totalValue = useMemo(() => {
    return filteredMovements.reduce((sum, m) => {
      const mat = materialMap.get(m.material_id);
      return sum + (m.quantity * (mat?.purchase_price || 0));
    }, 0);
  }, [filteredMovements, materialMap]);

  const totalQuantity = useMemo(() => filteredMovements.reduce((s, m) => s + m.quantity, 0), [filteredMovements]);

  const label = DATE_PRESETS[preset].label;

  return (
    <>
      <header className="page-header">
        <button className="page-header-back" onClick={() => navigate(-1)}>
          <ChevronLeft size={22} />
        </button>
        <h1>Tagesbericht</h1>
        <div style={{ width: 44 }} />
      </header>

      <div className="page-content">
        {/* Datum-Selektor */}
        <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
          <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
            {DATE_PRESETS.map((p, i) => (
              <button
                key={p.label}
                className={`btn btn-sm ${preset === i ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setPreset(i)}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                <CalendarDays size={14} />
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* KPI */}
        <div className="stats-kpi-grid" style={{ marginBottom: 'var(--space-lg)' }}>
          <div className="stats-kpi-card">
            <PackageMinus size={20} style={{ color: 'var(--color-danger)' }} />
            <div className="stats-kpi-value">{filteredMovements.length}</div>
            <div className="stats-kpi-label">Entnahmen</div>
          </div>
          <div className="stats-kpi-card">
            <FileText size={20} style={{ color: 'var(--color-primary)' }} />
            <div className="stats-kpi-value">{totalQuantity}</div>
            <div className="stats-kpi-label">Stück / Einh.</div>
          </div>
          <div className="stats-kpi-card">
            <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-accent)' }}>€</span>
            <div className="stats-kpi-value">
              {totalValue.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="stats-kpi-label">EK-Wert</div>
          </div>
        </div>

        {filteredMovements.length === 0 ? (
          <EmptyState
            icon={PackageMinus}
            title={`Keine Entnahmen ${label}`}
            text="Für den gewählten Zeitraum liegen keine Entnahmen vor."
          />
        ) : (
          <>
            {/* Nach Baustelle */}
            <div className="section">
              <h3 className="detail-section-title">🏗 Nach Baustelle</h3>
              {byProject.map(proj => (
                <div key={proj.projectId} className="card" style={{ marginBottom: 'var(--space-md)' }}>
                  <div style={{
                    fontWeight: 700,
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--color-primary)',
                    paddingBottom: 'var(--space-sm)',
                    borderBottom: '1px solid var(--color-border)',
                    marginBottom: 'var(--space-sm)',
                  }}>
                    {proj.projectName}
                  </div>
                  {proj.items.map(m => {
                    const mat = materialMap.get(m.material_id);
                    return (
                      <div key={m.id} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: 'var(--space-xs) 0',
                        borderBottom: '1px solid var(--color-surface)',
                      }}>
                        <div>
                          <div className="font-semibold" style={{ fontSize: 'var(--font-size-sm)' }}>
                            {getMaterialName(m.material_id)}
                          </div>
                          {mat?.article_number && (
                            <div className="text-xs text-tertiary">{mat.article_number}</div>
                          )}
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)' }}>
                            -{m.quantity} {UNIT_LABELS[mat?.unit] || mat?.unit || ''}
                          </div>
                          <div className="text-xs text-tertiary">
                            {(m.quantity * (mat?.purchase_price || 0)).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Nach Material */}
            <div className="section" style={{ paddingBottom: 'var(--space-2xl)' }}>
              <h3 className="detail-section-title">📦 Nach Material</h3>
              <div className="card">
                {byMaterial.map((entry, i) => (
                  <div key={entry.material?.id || i} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: 'var(--space-sm) 0',
                    borderBottom: i < byMaterial.length - 1 ? '1px solid var(--color-surface)' : 'none',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', flex: 1 }}>
                      <span style={{
                        fontSize: 'var(--font-size-xs)',
                        fontWeight: 700,
                        color: 'var(--color-text-tertiary)',
                        minWidth: 20,
                      }}>
                        {i + 1}
                      </span>
                      <div>
                        <div className="font-semibold" style={{ fontSize: 'var(--font-size-sm)' }}>
                          {entry.material?.name || 'Unbekannt'}
                        </div>
                        {entry.material?.article_number && (
                          <div className="text-xs text-tertiary">{entry.material.article_number}</div>
                        )}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)' }}>
                        -{entry.total} {UNIT_LABELS[entry.material?.unit] || entry.material?.unit || ''}
                      </div>
                      <div className="text-xs text-tertiary">
                        {(entry.total * (entry.material?.purchase_price || 0)).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
