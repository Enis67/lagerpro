import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ShoppingCart, ArrowDownUp, PackageMinus, TrendingDown, ChevronRight } from 'lucide-react';
import { useStore } from '../hooks/useStore';
import KpiCard from '../components/KpiCard';
import MovementRow from '../components/MovementRow';

export default function Dashboard() {
  const navigate = useNavigate();
  const { materials, movements, projects } = useStore();

  // KPIs berechnen
  const criticalItems = materials.filter(m => m.active && m.current_stock <= m.min_stock);
  const reorderCount = criticalItems.length;

  const today = new Date().toDateString();
  const todaysWithdrawals = movements.filter(m => m.type === 'entnahme' && new Date(m.created_at).toDateString() === today);
  const todaysWithdrawalCount = todaysWithdrawals.reduce((sum, m) => sum + m.quantity, 0);

  const recentMovements = movements.slice(0, 8);
  const activeProjects = projects.filter(p => p.status === 'aktiv');

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
              {criticalItems.slice(0, 3).map(item => (
                <div
                  key={item.id}
                  className="card card-clickable"
                  onClick={() => navigate(`/material/${item.id}`)}
                  style={{ borderLeft: `4px solid ${item.current_stock === 0 ? 'var(--color-danger)' : 'var(--color-warning)'}` }}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold">{item.name}</div>
                      <div className="text-sm text-secondary">{item.article_number}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold" style={{ color: item.current_stock === 0 ? 'var(--color-danger)' : 'var(--color-warning)', fontSize: '18px' }}>
                        {item.current_stock}
                      </div>
                      <div className="text-xs text-tertiary">Min: {item.min_stock}</div>
                    </div>
                  </div>
                </div>
              ))}
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
    </>
  );
}
