import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench, ChevronLeft, AlertTriangle, Package, ArrowDownUp, Plus, Minus } from 'lucide-react';
import { useStore } from '../hooks/useStore';
import SearchBar from '../components/SearchBar';
import StockBadge from '../components/StockBadge';
import Toast from '../components/Toast';

export default function ToolsPage() {
  const navigate = useNavigate();
  const { materials, categories, addMovement, getStockLevel } = useStore();
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);

  const toolCategory = categories.find(c => c.name === 'Werkzeug');
  const tools = useMemo(() => {
    if (!toolCategory) return [];
    return materials
      .filter(m => m.category_id === toolCategory.id)
      .filter(m => !search || m.name.toLowerCase().includes(search.toLowerCase()) || 
                   m.article_number?.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => {
        const levelA = getStockLevel(a.id);
        const levelB = getStockLevel(b.id);
        // Kritische zuerst, dann alphabetisch
        if (levelA === 'critical' && levelB !== 'critical') return -1;
        if (levelB === 'critical' && levelA !== 'critical') return 1;
        return a.name.localeCompare(b.name);
      });
  }, [materials, toolCategory, search, getStockLevel]);

  const stats = useMemo(() => {
    const total = tools.length;
    const critical = tools.filter(t => getStockLevel(t.id) === 'critical').length;
    const warning = tools.filter(t => getStockLevel(t.id) === 'warning').length;
    const available = tools.filter(t => getStockLevel(t.id) === 'ok').length;
    const totalValue = tools.reduce((sum, t) => sum + (t.price_per_unit || 0) * (t.current_stock || 0), 0);
    return { total, critical, warning, available, totalValue };
  }, [tools, getStockLevel]);

  async function quickBook(toolId, type) {
    try {
      const tool = materials.find(m => m.id === toolId);
      await addMovement({
        material_id: toolId,
        type,
        quantity: type === 'out' ? 1 : 1,
        note: `Werkzeug ${type === 'out' ? 'Ausgabe' : 'Rückgabe'}: ${tool.name}`,
      });
      setToast({ message: `${tool.name} ${type === 'out' ? 'ausgegeben' : 'zurückgebucht'} ✓`, type: 'success' });
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    }
  }

  if (!toolCategory) {
    return (
      <div className="page-content center">
        <p>Keine Werkzeug-Kategorie gefunden.</p>
      </div>
    );
  }

  return (
    <>
      <header className="page-header">
        <button className="page-header-back" onClick={() => navigate('/mehr')}>
          <ChevronLeft size={22} />
        </button>
        <h1><Wrench size={20} /> Werkzeuge & Equipment</h1>
        <div style={{ width: 44 }} />
      </header>

      <div className="page-content">
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

        {/* KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
          <div style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-md)', textAlign: 'center' }}>
            <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700 }}>{stats.total}</div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>Werkzeuge</div>
          </div>
          <div style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-md)', textAlign: 'center' }}>
            <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: stats.critical > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>
              {stats.critical}
            </div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>Fehlend</div>
          </div>
          <div style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-md)', textAlign: 'center' }}>
            <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--color-success)' }}>{stats.available}</div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>Verfügbar</div>
          </div>
        </div>

        {/* Search */}
        <SearchBar value={search} onChange={setSearch} placeholder="Werkzeug suchen..." />

        {/* Tools List */}
        {tools.length === 0 ? (
          <div className="center" style={{ padding: 'var(--space-xl)' }}>
            <Package size={48} style={{ color: 'var(--color-text-tertiary)', marginBottom: 'var(--space-md)' }} />
            <p style={{ color: 'var(--color-text-secondary)' }}>Keine Werkzeuge gefunden.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', marginTop: 'var(--space-md)' }}>
            {tools.map(tool => {
              const level = getStockLevel(tool.id);
              return (
                <div
                  key={tool.id}
                  className="material-card"
                  onClick={() => navigate(`/material/${tool.id}`)}
                  style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 'var(--space-md)', padding: 'var(--space-md)' }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                      <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 600, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {tool.name}
                      </h3>
                      {level === 'critical' && <AlertTriangle size={16} style={{ color: 'var(--color-danger)', flexShrink: 0 }} />}
                    </div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginTop: 'var(--space-xs)' }}>
                      {tool.article_number} · {tool.manufacturer_number}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginTop: 'var(--space-xs)' }}>
                      <StockBadge level={level} stock={tool.current_stock} min={tool.min_stock} />
                      {tool.current_stock === 0 && (
                        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-danger)', fontWeight: 600 }}>
                          NICHT VORHANDEN
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div style={{ display: 'flex', gap: 'var(--space-xs)', flexShrink: 0 }}>
                    <button
                      className="btn btn-sm"
                      style={{ padding: '6px 10px' }}
                      onClick={e => { e.stopPropagation(); quickBook(tool.id, 'out'); }}
                      disabled={tool.current_stock <= 0}
                      title="Ausgeben"
                    >
                      <Minus size={16} />
                    </button>
                    <button
                      className="btn btn-sm btn-secondary"
                      style={{ padding: '6px 10px' }}
                      onClick={e => { e.stopPropagation(); quickBook(tool.id, 'in'); }}
                      title="Zurückgeben"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
