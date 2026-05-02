import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Star, StarOff, LayoutGrid, List, RotateCcw } from 'lucide-react';
import { useStore } from '../hooks/useStore';
import { UNIT_LABELS } from '../data/constants';
import SearchBar from '../components/SearchBar';
import usePullToRefresh from '../hooks/usePullToRefresh';

export default function MaterialList() {
  const navigate = useNavigate();
  const {
    materials, categories, getCategoryName, getCategoryColor, getSupplierName,
    toggleFavorite, incrementUsage
  } = useStore();

  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('my'); // 'my' | 'all'
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  // Materialien filtern
  const baseMaterials = activeTab === 'my'
    ? materials.filter(m => m.active && (m.is_favorite || (m.usage_count || 0) > 0))
    : materials.filter(m => m.active);

  const filtered = baseMaterials.filter(m => {
    const matchesSearch = !search ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.article_number?.toLowerCase().includes(search.toLowerCase()) ||
      m.manufacturer_number?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || m.category_id === categoryFilter;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'stock') return b.current_stock - a.current_stock;
    if (sortBy === 'usage') return (b.usage_count || 0) - (a.usage_count || 0);
    return 0;
  });

  const myMaterialsCount = materials.filter(m => m.active && (m.is_favorite || (m.usage_count || 0) > 0)).length;
  const allMaterialsCount = materials.filter(m => m.active).length;

  return (
    <>
      <header className="page-header">
        <h1>Material</h1>
        <button className="page-header-action" onClick={() => navigate('/material/neu')}>
          <Plus size={20} />
        </button>
      </header>

      <div className="page-content">
        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: 'var(--space-xs)',
          marginBottom: 'var(--space-md)',
          background: 'var(--color-card)',
          borderRadius: 'var(--radius-lg)',
          padding: 4,
        }}>
          <button
            onClick={() => setActiveTab('my')}
            style={{
              flex: 1,
              padding: 'var(--space-sm) var(--space-md)',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: activeTab === 'my' ? 'var(--color-primary)' : 'transparent',
              color: activeTab === 'my' ? 'white' : 'var(--color-text-secondary)',
              fontWeight: 600,
              fontSize: 'var(--font-size-sm)',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            ⭐ Meine Artikel ({myMaterialsCount})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            style={{
              flex: 1,
              padding: 'var(--space-sm) var(--space-md)',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: activeTab === 'all' ? 'var(--color-primary)' : 'transparent',
              color: activeTab === 'all' ? 'white' : 'var(--color-text-secondary)',
              fontWeight: 600,
              fontSize: 'var(--font-size-sm)',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            📦 Alle Artikel ({allMaterialsCount})
          </button>
        </div>

        {/* Suche & Filter */}
        <div style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)', alignItems: 'center' }}>
          <SearchBar
            placeholder={activeTab === 'my' ? "Meine Artikel suchen..." : "Alle Artikel suchen..."}
            value={search}
            onChange={setSearch}
            style={{ flex: 1 }}
          />
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            style={{ width: 'auto', fontSize: 'var(--font-size-sm)', padding: 'var(--space-sm)' }}
          >
            <option value="name">Name</option>
            <option value="stock">Bestand</option>
            <option value="usage">Häufigkeit</option>
          </select>
        </div>

        {/* Kategorie-Filter (nur bei "Alle") */}
        {activeTab === 'all' && (
          <div style={{ display: 'flex', gap: 'var(--space-xs)', overflowX: 'auto', marginBottom: 'var(--space-md)', paddingBottom: 'var(--space-xs)' }}>
            <button
              onClick={() => setCategoryFilter('all')}
              style={{
                padding: 'var(--space-xs) var(--space-md)',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: categoryFilter === 'all' ? 'var(--color-primary)' : 'var(--color-card)',
                color: categoryFilter === 'all' ? 'white' : 'var(--color-text)',
                fontSize: 'var(--font-size-xs)',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              Alle
            </button>
            {categories.filter(c => c.active).map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(categoryFilter === cat.id ? 'all' : cat.id)}
                style={{
                  padding: 'var(--space-xs) var(--space-md)',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  background: categoryFilter === cat.id ? cat.color : 'var(--color-card)',
                  color: categoryFilter === cat.id ? 'white' : 'var(--color-text)',
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Liste */}
        <div className="list">
          {filtered.map(material => {
            const categoryColor = getCategoryColor(material.category_id);
            const isCrit = material.current_stock <= material.min_stock;
            return (
              <div
                key={material.id}
                className="card card-clickable"
                onClick={() => navigate(`/material/${material.id}`)}
                style={{ width: '100%' }}
              >
                <div className="flex justify-between items-start">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="flex items-center gap-sm">
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: categoryColor, flexShrink: 0 }} />
                      <span className="font-semibold">{material.name}</span>
                    </div>
                    <div className="text-xs text-tertiary mt-xs">
                      {material.article_number && <span className="mr-md">Art.Nr.: {material.article_number}</span>}
                      {material.manufacturer_number && <span>Herst.Nr.: {material.manufacturer_number}</span>}
                    </div>
                    <div className="text-xs text-tertiary">
                      {getCategoryName(material.category_id)} · {getSupplierName(material.supplier_id)}
                      {material.storage_location && ` · ${material.storage_location}`}
                    </div>
                    {(material.usage_count || 0) > 0 && (
                      <div className="text-xs" style={{ color: 'var(--color-accent)', marginTop: 2 }}>
                        {material.usage_count}x verwendet
                        {material.last_used && ` · ${new Date(material.last_used).toLocaleDateString('de-DE')}`}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 'var(--space-xs)' }}>
                    {/* Stern / Favorit */}
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={e => {
                        e.stopPropagation();
                        toggleFavorite(material.id);
                      }}
                      style={{ padding: 4 }}
                    >
                      {material.is_favorite
                        ? <Star size={18} fill="var(--color-accent)" color="var(--color-accent)" />
                        : <StarOff size={18} color="var(--color-text-tertiary)" />
                      }
                    </button>

                    <div className="text-sm" style={{
                      color: isCrit ? 'var(--color-danger)' : 'var(--color-text-secondary)',
                      fontWeight: isCrit ? 700 : 400,
                    }}>
                      {material.current_stock} {UNIT_LABELS[material.unit]}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center text-secondary" style={{ padding: 'var(--space-4xl)' }}>
            {activeTab === 'my'
              ? 'Noch keine "Meine Artikel". Tippe auf den Stern ⭐ bei Artikeln, die du häufig verwendest.'
              : 'Kein Material gefunden.'
            }
          </div>
        )}

        {activeTab === 'my' && myMaterialsCount === 0 && (
          <div className="card mt-lg" style={{ background: 'var(--color-primary-50)', textAlign: 'center' }}>
            <div className="font-semibold mb-sm">💡 Tipp</div>
            <div className="text-sm text-secondary">
              Wechsle zu "Alle Artikel" und tippe auf den Stern ⭐ bei Artikeln, die du oft brauchst.
              Diese erscheinen dann hier unter "Meine Artikel".
            </div>
            <button
              className="btn btn-primary btn-sm mt-md"
              onClick={() => setActiveTab('all')}
            >
              Zu Alle Artikel wechseln
            </button>
          </div>
        )}

        <div style={{ height: 80 }} />
      </div>
    </>
  );
}
