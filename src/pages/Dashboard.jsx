import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle, ShoppingCart, ArrowDownUp, PackageMinus, ChevronRight,
  RotateCcw, Mic, TrendingUp, DollarSign, BarChart3, Archive, Wrench,
  Zap, ScanBarcode, HardHat, Package, Calendar, ArrowUpRight,
} from 'lucide-react';
import { useStore } from '../hooks/useStore';
import KpiCard from '../components/KpiCard';
import MovementRow from '../components/MovementRow';
import VoiceBooking from '../components/VoiceBooking';
import Toast from '../components/Toast';
import { UNIT_LABELS } from '../data/constants';
import { useState, useMemo, useEffect } from 'react';
import { v4 as uuid } from 'uuid';
import {
  sendNotification,
  updateBadge,
  wasNotifiedToday,
  markNotifiedToday,
  getNotificationsEnabled,
} from '../services/notifications.js';

export default function Dashboard() {
  const navigate = useNavigate();
  const {
    materials, movements, projects, categories,
    addMovement, editMaterial, getMaterialName,
    getStockLevel, getCriticalCount, getMyMaterials,
    getTodaysWithdrawals,
  } = useStore();
  const [showVoice, setShowVoice] = useState(false);
  const [toast, setToast] = useState(null);

  // ── Push Notifications + Badge (einmal pro Tag) ──
  useEffect(() => {
    const criticalCount = materials.filter(m => m.active && (m.current_stock || 0) <= m.min_stock).length;

    // Badge immer setzen (auch ohne Notification)
    updateBadge(criticalCount);

    if (criticalCount > 0 && getNotificationsEnabled() && !wasNotifiedToday()) {
      sendNotification(
        `⚠️ ${criticalCount} Artikel kritisch`,
        {
          body: `${criticalCount} Artikel befinden sich unter dem Mindestbestand.`,
          tag: 'lagerpro-critical-daily',
        }
      );
      markNotifiedToday();
    }
  }, [materials]);

  // ── Statistiken ──
  const totalItems = materials.filter(m => m.active).length;

  const inventoryValue = materials
    .filter(m => m.active)
    .reduce((sum, m) => sum + (m.price_per_unit || 0) * (m.current_stock || 0), 0);

  // Top 5 meistgebuchte Artikel
  const usageMap = {};
  movements.forEach(m => {
    if (m.type === 'entnahme') {
      usageMap[m.material_id] = (usageMap[m.material_id] || 0) + m.quantity;
    }
  });
  const top5 = Object.entries(usageMap)
    .map(([id, count]) => {
      const mat = materials.find(m => m.id === id);
      return mat ? { ...mat, totalQuantity: count } : null;
    })
    .filter(Boolean)
    .sort((a, b) => b.totalQuantity - a.totalQuantity)
    .slice(0, 5);

  // Kritische Artikel
  const criticalItems = materials.filter(m => m.active && (m.current_stock || 0) <= m.min_stock);

  // Werkzeug-Stats
  const toolCategory = categories.find(c => c.name === 'Werkzeug');
  const tools = useMemo(() => {
    if (!toolCategory) return [];
    return materials.filter(m => m.category_id === toolCategory.id);
  }, [materials, toolCategory]);
  const toolsMissing = tools.filter(t => (t.current_stock || 0) === 0).length;
  const toolsAvailable = tools.filter(t => (t.current_stock || 0) > 0).length;

  // Kategorien-Verteilung
  const catCounts = {};
  materials.filter(m => m.active).forEach(m => {
    catCounts[m.category_id] = (catCounts[m.category_id] || 0) + 1;
  });
  const catDistribution = categories
    .filter(c => c.active)
    .map(c => ({
      ...c,
      count: catCounts[c.id] || 0,
      percent: totalItems > 0 ? ((catCounts[c.id] || 0) / totalItems) * 100 : 0,
    }))
    .filter(c => c.count > 0)
    .sort((a, b) => b.count - a.count);
  const maxCatCount = Math.max(...catDistribution.map(c => c.count), 1);

  // KPIs für Karten
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
        current_stock: Math.max(0, (lastMaterial.current_stock || 0) - lastWithdrawal.quantity),
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

        {/* ── Schnellzugriff-Buttons ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 'var(--space-sm)',
          marginBottom: 'var(--space-lg)',
        }}>
          <QuickAction icon={Zap} label="Buchen" color="#F59E0B" onClick={() => navigate('/buchen')} />
          <QuickAction icon={Wrench} label="Werkzeuge" color="#3B82F6" onClick={() => navigate('/werkzeuge')} />
          <QuickAction icon={ScanBarcode} label="Inventur" color="#10B981" onClick={() => navigate('/inventur')} />
          <QuickAction icon={HardHat} label="Baustellen" color="#8B5CF6" onClick={() => navigate('/baustellen')} />
        </div>

        {/* KPI Grid */}
        <div className="kpi-grid">
          <KpiCard
            icon={Archive}
            value={totalItems}
            label="Artikel gesamt"
            color="#3B82F6"
            bgColor="#EFF6FF"
            onClick={() => navigate('/material')}
          />
          <KpiCard
            icon={DollarSign}
            value={`${inventoryValue.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} €`}
            label="Lagerwert"
            color="#10B981"
            bgColor="#ECFDF5"
          />
          <KpiCard
            icon={AlertTriangle}
            value={criticalItems.length}
            label="Kritisch"
            color={criticalItems.length > 0 ? '#EF4444' : '#10B981'}
            bgColor={criticalItems.length > 0 ? '#FEF2F2' : '#ECFDF5'}
            onClick={() => navigate('/bestellliste')}
          />
          <KpiCard
            icon={ArrowDownUp}
            value={movements.length}
            label="Buchungen"
            color="#8B5CF6"
            bgColor="#F5F3FF"
            onClick={() => navigate('/bewegungen')}
          />
        </div>

        {/* Heutige Übersicht */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 'var(--space-sm)',
          marginBottom: 'var(--space-lg)',
        }}>
          <div style={{
            background: 'var(--color-surface)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-md)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-md)',
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              background: '#FEF2F2',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Calendar size={20} style={{ color: '#EF4444' }} />
            </div>
            <div>
              <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700 }}>{todaysWithdrawalCount}</div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>Heutige Entnahmen</div>
            </div>
          </div>
          <div style={{
            background: 'var(--color-surface)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-md)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-md)',
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              background: '#ECFDF5',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Wrench size={20} style={{ color: '#10B981' }} />
            </div>
            <div>
              <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700 }}>
                {toolsAvailable}/{tools.length}
              </div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                Werkzeuge verfügbar
              </div>
            </div>
          </div>
        </div>

        {/* Werkzeug-Warnung */}
        {toolsMissing > 0 && (
          <div
            onClick={() => navigate('/werkzeuge')}
            style={{
              background: '#FEF2F2',
              border: '1px solid #FECACA',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-md) var(--space-lg)',
              marginBottom: 'var(--space-lg)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-md)',
              cursor: 'pointer',
            }}
          >
            <AlertTriangle size={20} style={{ color: '#EF4444', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', color: '#DC2626' }}>
                {toolsMissing} Werkzeug{toolsMissing > 1 ? 'e' : ''} fehlend
              </div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: '#EF4444' }}>
                Jetzt ansehen →
              </div>
            </div>
            <ChevronRight size={16} style={{ color: '#EF4444' }} />
          </div>
        )}

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

        {/* Top 5 meistgebuchte Artikel */}
        {top5.length > 0 && (
          <div className="section">
            <div className="section-header">
              <h2 className="section-title">
                <TrendingUp size={16} style={{ verticalAlign: 'text-bottom', marginRight: 4 }} />
                Top 5 meistgebucht
              </h2>
            </div>
            <div className="list">
              {top5.map((item, idx) => (
                <div
                  key={item.id}
                  className="card card-clickable"
                  onClick={() => navigate(`/material/${item.id}`)}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-sm" style={{ flex: 1, minWidth: 0 }}>
                      <span style={{
                        width: 24, height: 24, borderRadius: '50%',
                        background: idx < 3 ? 'var(--color-primary)' : 'var(--color-border)',
                        color: idx < 3 ? 'white' : 'var(--color-text-secondary)',
                        fontSize: 'var(--font-size-xs)', fontWeight: 700,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        {idx + 1}
                      </span>
                      <div style={{ minWidth: 0 }}>
                        <div className="font-semibold" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.name}
                        </div>
                        <div className="text-xs text-tertiary">
                          {item.article_number} · {UNIT_LABELS[item.unit]}
                        </div>
                      </div>
                    </div>
                    <div className="text-right" style={{ flexShrink: 0 }}>
                      <div className="font-bold" style={{ fontSize: '16px', color: 'var(--color-primary)' }}>
                        {item.totalQuantity}
                      </div>
                      <div className="text-xs text-tertiary">gebucht</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Kategorien-Verteilung */}
        {catDistribution.length > 0 && (
          <div className="section">
            <div className="section-header">
              <h2 className="section-title">
                <BarChart3 size={16} style={{ verticalAlign: 'text-bottom', marginRight: 4 }} />
                Kategorien
              </h2>
            </div>
            <div className="card">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                {catDistribution.map(cat => (
                  <div key={cat.id}>
                    <div className="flex justify-between items-center mb-xs">
                      <span className="text-sm font-medium">{cat.name}</span>
                      <span className="text-xs text-secondary">{cat.count} ({cat.percent.toFixed(0)}%)</span>
                    </div>
                    <div style={{
                      width: '100%', height: 8, borderRadius: 4,
                      background: 'var(--color-border)',
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        width: `${(cat.count / maxCatCount) * 100}%`,
                        height: '100%',
                        background: cat.color,
                        borderRadius: 4,
                        transition: 'width 0.5s ease',
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Kritische Artikel */}
        {criticalItems.length > 0 && (
          <div className="section">
            <div className="section-header">
              <h2 className="section-title" style={{ color: 'var(--color-danger)' }}>
                <AlertTriangle size={16} style={{ verticalAlign: 'text-bottom', marginRight: 4 }} />
                Kritischer Bestand
              </h2>
              <button className="section-action" onClick={() => navigate('/bestellliste')}>
                Alle <ChevronRight size={14} style={{ verticalAlign: 'middle' }} />
              </button>
            </div>
            <div className="list">
              {criticalItems.slice(0, 5).map(item => {
                const smartId = item.manufacturer_number?.trim()
                  ? item.manufacturer_number
                  : item.article_number;
                return (
                  <div
                    key={item.id}
                    className="card card-clickable"
                    onClick={() => navigate(`/material/${item.id}`)}
                    style={{ borderLeft: `4px solid ${(item.current_stock || 0) === 0 ? 'var(--color-danger)' : 'var(--color-warning)'}` }}
                  >
                    <div className="flex justify-between items-center">
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="font-semibold">{item.name}</div>
                        <div className="text-sm text-secondary" style={{ fontFamily: 'monospace' }}>{smartId}</div>
                        {item.storage_location && (
                          <div className="text-xs text-tertiary mt-sm">📍 {item.storage_location}</div>
                        )}
                      </div>
                      <div className="text-right" style={{ flexShrink: 0 }}>
                        <div className="font-bold" style={{ color: (item.current_stock || 0) === 0 ? 'var(--color-danger)' : 'var(--color-warning)', fontSize: '18px' }}>
                          {item.current_stock || 0}
                        </div>
                        <div className="text-xs text-tertiary">Min: {item.min_stock}</div>
                        <div className="text-xs text-danger mt-xs">Fehlt: {item.min_stock - (item.current_stock || 0)}</div>
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

// ── Quick-Action Button ───────────────────────────
function QuickAction({ icon: Icon, label, color, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--space-xs)',
        padding: 'var(--space-md) var(--space-sm)',
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        cursor: 'pointer',
        transition: 'transform 0.1s, box-shadow 0.1s',
      }}
      onMouseDown={e => e.currentTarget.style.transform = 'scale(0.96)'}
      onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
      onTouchStart={e => e.currentTarget.style.transform = 'scale(0.96)'}
      onTouchEnd={e => e.currentTarget.style.transform = 'scale(1)'}
    >
      <div style={{
        width: 44, height: 44, borderRadius: '50%',
        background: `${color}15`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={22} style={{ color }} />
      </div>
      <span style={{
        fontSize: 'var(--font-size-xs)',
        fontWeight: 600,
        color: 'var(--color-text)',
      }}>
        {label}
      </span>
    </button>
  );
}
