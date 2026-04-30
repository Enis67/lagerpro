import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, TrendingUp, Package, Euro, BarChart3, ArrowDownUp } from 'lucide-react';
import { useStore } from '../hooks/useStore';
import { MOVEMENT_TYPE_LABELS, MOVEMENT_TYPE_COLORS, UNIT_LABELS } from '../data/constants';

export default function Statistics() {
  const navigate = useNavigate();
  const { materials, movements, suppliers, categories } = useStore();

  const stats = useMemo(() => {
    // ── Lagerwert ─────────────────────────────────
    const totalValue = materials
      .filter(m => m.active)
      .reduce((sum, m) => sum + (m.current_stock * (m.purchase_price || 0)), 0);

    const totalItems = materials.filter(m => m.active).length;
    const totalStock = materials.filter(m => m.active).reduce((sum, m) => sum + m.current_stock, 0);
    const criticalCount = materials.filter(m => m.active && m.current_stock <= m.min_stock).length;

    // ── Top 5 meistgebuchte Materialien ───────────
    const materialBookings = {};
    movements.forEach(m => {
      if (!materialBookings[m.material_id]) materialBookings[m.material_id] = 0;
      materialBookings[m.material_id] += m.quantity;
    });

    const topMaterials = Object.entries(materialBookings)
      .map(([id, total]) => ({ material: materials.find(m => m.id === id), total }))
      .filter(e => e.material)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    const maxBookingTotal = topMaterials.length > 0 ? topMaterials[0].total : 1;

    // ── Top 5 Entnahmen (Verbrauch) ───────────────
    const entnahmen = {};
    movements.filter(m => m.type === 'entnahme').forEach(m => {
      if (!entnahmen[m.material_id]) entnahmen[m.material_id] = 0;
      entnahmen[m.material_id] += m.quantity;
    });

    const topEntnahmen = Object.entries(entnahmen)
      .map(([id, total]) => ({ material: materials.find(m => m.id === id), total }))
      .filter(e => e.material)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    const maxEntnahmeTotal = topEntnahmen.length > 0 ? topEntnahmen[0].total : 1;

    // ── Buchungen pro Typ ─────────────────────────
    const byType = {};
    movements.forEach(m => {
      if (!byType[m.type]) byType[m.type] = 0;
      byType[m.type]++;
    });

    const typeStats = Object.entries(byType)
      .map(([type, count]) => ({ type, label: MOVEMENT_TYPE_LABELS[type] || type, count, color: MOVEMENT_TYPE_COLORS[type] || '#6B7280' }))
      .sort((a, b) => b.count - a.count);

    const maxTypeCount = typeStats.length > 0 ? typeStats[0].count : 1;

    // ── Buchungen letzte 7 Tage ───────────────────
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStr = date.toISOString().split('T')[0];
      const dayLabel = date.toLocaleDateString('de-DE', { weekday: 'short' });
      const count = movements.filter(m => {
        const mDate = new Date(m.created_at).toISOString().split('T')[0];
        return mDate === dayStr;
      }).length;
      last7Days.push({ dayLabel, count, date: dayStr });
    }

    const maxDayCount = Math.max(...last7Days.map(d => d.count), 1);

    // ── Wert nach Kategorie ───────────────────────
    const valueByCategory = {};
    materials.filter(m => m.active).forEach(m => {
      const catName = categories.find(c => c.id === m.category_id)?.name || 'Sonstige';
      if (!valueByCategory[catName]) valueByCategory[catName] = 0;
      valueByCategory[catName] += m.current_stock * (m.purchase_price || 0);
    });

    const categoryValues = Object.entries(valueByCategory)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    const maxCatValue = categoryValues.length > 0 ? categoryValues[0].value : 1;

    return {
      totalValue, totalItems, totalStock, criticalCount,
      topMaterials, maxBookingTotal,
      topEntnahmen, maxEntnahmeTotal,
      typeStats, maxTypeCount,
      last7Days, maxDayCount,
      categoryValues, maxCatValue,
    };
  }, [materials, movements, categories, suppliers]);

  return (
    <>
      <header className="page-header">
        <button className="page-header-back" onClick={() => navigate(-1)}>
          <ChevronLeft size={22} />
        </button>
        <h1>Statistiken</h1>
        <div style={{ width: 44 }} />
      </header>

      <div className="page-content">
        {/* KPI Übersicht */}
        <div className="stats-kpi-grid">
          <div className="stats-kpi-card">
            <Euro size={20} style={{ color: 'var(--color-primary)' }} />
            <div className="stats-kpi-value">{stats.totalValue.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} €</div>
            <div className="stats-kpi-label">Lagerwert</div>
          </div>
          <div className="stats-kpi-card">
            <Package size={20} style={{ color: 'var(--color-info)' }} />
            <div className="stats-kpi-value">{stats.totalItems}</div>
            <div className="stats-kpi-label">Artikelarten</div>
          </div>
          <div className="stats-kpi-card">
            <BarChart3 size={20} style={{ color: '#10B981' }} />
            <div className="stats-kpi-value">{stats.totalStock.toLocaleString('de-DE')}</div>
            <div className="stats-kpi-label">Gesamtbestand</div>
          </div>
          <div className="stats-kpi-card">
            <TrendingUp size={20} style={{ color: 'var(--color-danger)' }} />
            <div className="stats-kpi-value">{stats.criticalCount}</div>
            <div className="stats-kpi-label">Kritisch</div>
          </div>
        </div>

        {/* Buchungen letzte 7 Tage */}
        <div className="section">
          <h3 className="detail-section-title">📊 Buchungen – Letzte 7 Tage</h3>
          <div className="card">
            <div className="stats-bar-chart">
              {stats.last7Days.map((day, i) => (
                <div key={i} className="stats-bar-col">
                  <div className="stats-bar-value">{day.count || ''}</div>
                  <div className="stats-bar-wrapper">
                    <div
                      className="stats-bar"
                      style={{
                        height: `${Math.max(4, (day.count / stats.maxDayCount) * 100)}%`,
                        background: day.count > 0 ? 'var(--color-primary)' : 'var(--color-border)',
                      }}
                    />
                  </div>
                  <div className="stats-bar-label">{day.dayLabel}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top 5 meistgebuchte Materialien */}
        <div className="section">
          <h3 className="detail-section-title">🔥 Top 5 – Meistgebucht</h3>
          <div className="card">
            {stats.topMaterials.length > 0 ? (
              stats.topMaterials.map((entry, i) => (
                <div
                  key={entry.material.id}
                  className="stats-ranking-row"
                  onClick={() => navigate(`/material/${entry.material.id}`)}
                >
                  <span className="stats-ranking-pos">{i + 1}</span>
                  <div className="stats-ranking-info">
                    <div className="stats-ranking-name">{entry.material.name}</div>
                    <div className="stats-ranking-bar-bg">
                      <div
                        className="stats-ranking-bar"
                        style={{ width: `${(entry.total / stats.maxBookingTotal) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="stats-ranking-value">{entry.total}</span>
                </div>
              ))
            ) : (
              <div className="text-center text-secondary" style={{ padding: 'var(--space-xl)' }}>
                Noch keine Buchungen vorhanden
              </div>
            )}
          </div>
        </div>

        {/* Top 5 Verbrauch (Entnahmen) */}
        <div className="section">
          <h3 className="detail-section-title">📦 Top 5 – Verbrauch (Entnahmen)</h3>
          <div className="card">
            {stats.topEntnahmen.length > 0 ? (
              stats.topEntnahmen.map((entry, i) => (
                <div
                  key={entry.material.id}
                  className="stats-ranking-row"
                  onClick={() => navigate(`/material/${entry.material.id}`)}
                >
                  <span className="stats-ranking-pos">{i + 1}</span>
                  <div className="stats-ranking-info">
                    <div className="stats-ranking-name">{entry.material.name}</div>
                    <div className="stats-ranking-bar-bg">
                      <div
                        className="stats-ranking-bar"
                        style={{ width: `${(entry.total / stats.maxEntnahmeTotal) * 100}%`, background: 'var(--color-danger)' }}
                      />
                    </div>
                  </div>
                  <span className="stats-ranking-value">{entry.total}</span>
                </div>
              ))
            ) : (
              <div className="text-center text-secondary" style={{ padding: 'var(--space-xl)' }}>
                Noch keine Entnahmen vorhanden
              </div>
            )}
          </div>
        </div>

        {/* Buchungen nach Typ */}
        <div className="section">
          <h3 className="detail-section-title">📋 Buchungen nach Typ</h3>
          <div className="card">
            {stats.typeStats.map(entry => (
              <div key={entry.type} className="stats-type-row">
                <div className="stats-type-dot" style={{ background: entry.color }} />
                <div className="stats-type-label">{entry.label}</div>
                <div className="stats-type-bar-bg">
                  <div
                    className="stats-type-bar"
                    style={{
                      width: `${(entry.count / stats.maxTypeCount) * 100}%`,
                      background: entry.color,
                    }}
                  />
                </div>
                <div className="stats-type-value">{entry.count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Lagerwert nach Kategorie */}
        <div className="section" style={{ paddingBottom: 'var(--space-2xl)' }}>
          <h3 className="detail-section-title">💰 Lagerwert nach Kategorie</h3>
          <div className="card">
            {stats.categoryValues.map(entry => (
              <div key={entry.name} className="stats-type-row">
                <div className="stats-type-label" style={{ minWidth: 100 }}>{entry.name}</div>
                <div className="stats-type-bar-bg">
                  <div
                    className="stats-type-bar"
                    style={{
                      width: `${(entry.value / stats.maxCatValue) * 100}%`,
                      background: 'var(--color-accent)',
                    }}
                  />
                </div>
                <div className="stats-type-value" style={{ minWidth: 65, textAlign: 'right' }}>
                  {entry.value.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} €
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
