import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ShoppingCart, ArrowDownUp, PackageMinus, ChevronRight, Mic, RotateCcw } from 'lucide-react';
import { useStore } from '../hooks/useStore';
import KpiCard from '../components/KpiCard';
import MovementRow from '../components/MovementRow';
import VoiceBooking from '../components/VoiceBooking';
import Toast from '../components/Toast';
import { UNIT_LABELS } from '../data/constants';
import { v4 as uuid } from 'uuid';

export default function Dashboard() {
  const navigate = useNavigate();
  const { materials, movements, projects, addMovement, editMaterial, getMaterialName } = useStore();
  const [showVoice, setShowVoice] = useState(false);
  const [toast, setToast] = useState(null);

  // KPIs berechnen
  const criticalItems = materials.filter(m => m.active && m.current_stock <= m.min_stock);
  const reorderCount = criticalItems.length;

  const today = new Date().toDateString();
  const todaysWithdrawals = movements.filter(m => m.type === 'entnahme' && new Date(m.created_at).toDateString() === today);
  const todaysWithdrawalCount = todaysWithdrawals.reduce((sum, m) => sum + m.quantity, 0);

  const recentMovements = movements.slice(0, 8);
  const activeProjects = projects.filter(p => p.status === 'aktiv');

  // Letzte Entnahme für Quick-Repeat
  const lastWithdrawal = movements.find(m => m.type === 'entnahme');
  const lastMaterial = lastWithdrawal ? materials.find(m => m.id === lastWithdrawal.material_id) : null;

  async function handleQuickRepeat() {
    if (!lastWithdrawal || !lastMaterial) return;
    try {
      const movement = {
        id: uuid(),
        material_id: lastMaterial.id,
        type: 'entnahme',
        quantity: lastWithdrawal.quantity,
        project_id: lastWithdrawal.project_id || null,
        notes: `🔁 Wiederholung: ${lastWithdrawal.quantity}× ${lastMaterial.name}`,
        created_at: new Date().toISOString(),
      };
      await addMovement(movement);
      await editMaterial(lastMaterial.id, {
        current_stock: Math.max(0, lastMaterial.current_stock - lastWithdrawal.quantity),
      });
      if (navigator.vibrate) navigator.vibrate(100);
      setToast({ message: `${lastWithdrawal.quantity}× ${lastMaterial.name} gebucht ✓`, type: 'success' });
    } catch (err) {
      setToast({ message: 'Fehler: ' + err.message, type: 'error' });
    }
  }

  return (
    <>
      <header className="page-header">
        <div>
          <h1>LagerPro</h1>
          <div style={{ fontSize: 'var(--font-size-xs)', opacity: 0.7, marginTop: 2 }}>
            Materialverwaltung
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
          {/* Sprachbuchung-Button */}
          <button
            onClick={() => setShowVoice(true)}
            style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: 'none', color: 'white', cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            title="Sprachbuchung"
          >
            <Mic size={18} />
          </button>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '14px', fontWeight: 700, color: 'white'
          }}>
            C
          </div>
        </div>
      </header>

      <div className="page-content">
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

        {/* KPI Grid */}
        <div className="kpi-grid">
          <KpiCard
            icon={AlertTriangle}
            value={reorderCount}
            label="Kritische Artikel"
            color={reorderCount > 0 ? '#EF4444' : '#10B981'}
            bgColor={reorderCount > 0 ? '#FEF2F2' : '#ECFDF5'}
            onClick={() => navigate('/nachbestellen')}
          />
          <KpiCard
            icon={ShoppingCart}
            value={reorderCount}
            label="Nachbestellen"
            color="#F59E0B"
            bgColor="#FFFBEB"
            onClick={() => navigate('/nachbestellen')}
          />
          <KpiCard
            icon={ArrowDownUp}
            value={movements.length}
            label="Buchungen gesamt"
            color="#3B82F6"
            bgColor="#EFF6FF"
            onClick={() => navigate('/bewegungen')}
          />
          <KpiCard
            icon={PackageMinus}
            value={todaysWithdrawalCount}
            label="Entnahmen heute"
            color="#8B5CF6"
            bgColor="#F5F3FF"
          />
        </div>

        {/* Quick-Repeat letzte Buchung */}
        {lastMaterial && lastWithdrawal && (
          <button
            onClick={handleQuickRepeat}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 'var(--space-md)',
              padding: 'var(--space-md) var(--space-lg)',
              background: 'var(--color-primary-50)', border: '1px dashed var(--color-primary)',
              borderRadius: 'var(--radius-lg)', cursor: 'pointer', marginBottom: 'var(--space-xl)',
              transition: 'background 0.15s',
            }}
          >
            <RotateCcw size={20} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
            <div style={{ textAlign: 'left', flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-primary)', fontWeight: 600 }}>
                Letzte Buchung wiederholen
              </div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {lastWithdrawal.quantity}× {lastMaterial.name}
              </div>
            </div>
            <span style={{
              fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-primary)',
              background: 'white', padding: '4px 10px', borderRadius: 'var(--radius-md)',
              whiteSpace: 'nowrap',
            }}>
              Buchen
            </span>
          </button>
        )}

        {/* Kritische Artikel */}
        {criticalItems.length > 0 && (
          <div className="section">
            <div className="section-header">
              <h2 className="section-title">⚠️ Kritischer Bestand</h2>
              <button className="section-action" onClick={() => navigate('/nachbestellen')}>
                Alle <ChevronRight size={14} style={{ verticalAlign: 'middle' }} />
              </button>
            </div>
            <div className="list">
              {criticalItems.slice(0, 3).map(item => {
                const smartId = item.manufacturer_number?.trim()
                  ? item.manufacturer_number
                  : item.article_number;
                return (
                  <div
                    key={item.id}
                    className="card card-clickable"
                    onClick={() => navigate(`/material/${item.id}`)}
                    style={{ borderLeft: `4px solid ${item.current_stock === 0 ? 'var(--color-danger)' : 'var(--color-warning)'}` }}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-semibold">{item.name}</div>
                        <div className="text-sm text-secondary" style={{ fontFamily: 'monospace' }}>{smartId}</div>
                        {item.storage_location && (
                          <div className="text-xs text-tertiary mt-sm">📍 {item.storage_location}</div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-bold" style={{ color: item.current_stock === 0 ? 'var(--color-danger)' : 'var(--color-warning)', fontSize: '18px' }}>
                          {item.current_stock}
                        </div>
                        <div className="text-xs text-tertiary">Min: {item.min_stock}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Aktive Baustellen */}
        {activeProjects.length > 0 && (
          <div className="section">
            <div className="section-header">
              <h2 className="section-title">🏗️ Aktive Baustellen</h2>
              <button className="section-action" onClick={() => navigate('/baustellen')}>
                Alle <ChevronRight size={14} style={{ verticalAlign: 'middle' }} />
              </button>
            </div>
            <div className="list">
              {activeProjects.slice(0, 3).map(project => (
                <div
                  key={project.id}
                  className="card card-clickable"
                  onClick={() => navigate(`/baustellen/${project.id}`)}
                >
                  <div className="font-semibold">{project.name}</div>
                  <div className="text-sm text-secondary mt-sm">{project.customer}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Letzte Bewegungen */}
        <div className="section">
          <div className="section-header">
            <h2 className="section-title">📋 Letzte Buchungen</h2>
            <button className="section-action" onClick={() => navigate('/bewegungen')}>
              Alle <ChevronRight size={14} style={{ verticalAlign: 'middle' }} />
            </button>
          </div>
          <div className="card">
            {recentMovements.length > 0 ? (
              recentMovements.map(m => <MovementRow key={m.id} movement={m} />)
            ) : (
              <div className="text-center text-secondary" style={{ padding: 'var(--space-xl)' }}>
                Noch keine Buchungen vorhanden
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Voice Booking Overlay */}
      {showVoice && (
        <VoiceBooking
          onClose={() => setShowVoice(false)}
          onComplete={() => {
            setShowVoice(false);
            setToast({ message: 'Sprachbuchung erfolgreich ✓', type: 'success' });
          }}
        />
      )}
    </>
  );
}
