import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, SlidersHorizontal } from 'lucide-react';
import { useStore } from '../hooks/useStore';
import SearchBar from '../components/SearchBar';
import FilterBar from '../components/FilterBar';
import MaterialCard from '../components/MaterialCard';
import EmptyState from '../components/EmptyState';
import { Package } from 'lucide-react';

export default function MaterialList() {
  const navigate = useNavigate();
  const { materials, categories } = useStore();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [showLowStock, setShowLowStock] = useState(false);

  const filtered = useMemo(() => {
    let result = materials.filter(m => m.active);

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(m =>
        m.name.toLowerCase().includes(q) ||
        m.article_number.toLowerCase().includes(q) ||
        m.description?.toLowerCase().includes(q) ||
        m.storage_location?.toLowerCase().includes(q)
      );
    }

    if (categoryFilter) {
      result = result.filter(m => m.category_id === categoryFilter);
    }

    if (showLowStock) {
      result = result.filter(m => m.current_stock <= m.min_stock);
    }

    return result.sort((a, b) => a.name.localeCompare(b.name, 'de'));
  }, [materials, search, categoryFilter, showLowStock]);

  return (
    <>
      <header className="page-header">
        <h1>Material</h1>
        <div className="flex items-center gap-sm">
          <button
            className="page-header-action"
            onClick={() => setShowLowStock(!showLowStock)}
            style={showLowStock ? { background: 'rgba(239,68,68,0.3)' } : {}}
            title="Nur kritische Artikel"
          >
            <SlidersHorizontal size={20} />
          </button>
          <button className="page-header-action" onClick={() => navigate('/material/neu')}>
            <Plus size={22} />
          </button>
        </div>
      </header>

      <div className="page-content">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Artikel suchen (Name, Nr., Lagerort)..."
        />

        <FilterBar
          filters={categories}
          activeFilter={categoryFilter}
          onFilterChange={setCategoryFilter}
        />

        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-md)' }}>
          {filtered.length} Artikel {showLowStock ? '(nur kritische)' : ''}
        </div>

        {filtered.length > 0 ? (
          <div className="list">
            {filtered.map(m => (
              <MaterialCard key={m.id} material={m} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Package}
            title="Kein Material gefunden"
            text={search ? 'Versuche einen anderen Suchbegriff.' : 'Lege dein erstes Material an.'}
            action={
              !search && (
                <button className="btn btn-primary" onClick={() => navigate('/material/neu')}>
                  <Plus size={18} /> Material anlegen
                </button>
              )
            }
          />
        )}
      </div>
    </>
  );
}
