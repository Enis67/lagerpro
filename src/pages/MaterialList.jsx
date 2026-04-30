import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, SlidersHorizontal, X } from 'lucide-react';
import { useStore } from '../hooks/useStore';
import SearchBar from '../components/SearchBar';
import MaterialCard from '../components/MaterialCard';
import EmptyState from '../components/EmptyState';
import { Package } from 'lucide-react';

export default function MaterialList() {
  const navigate = useNavigate();
  const { materials, categories, suppliers } = useStore();
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [supplierFilter, setSupplierFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null); // 'ok', 'warning', 'critical', null

  const statusOptions = [
    { value: 'critical', label: 'Kritisch', color: 'var(--color-danger)' },
    { value: 'warning', label: 'Knapp', color: 'var(--color-warning)' },
    { value: 'ok', label: 'OK', color: 'var(--color-success)' },
  ];

  const filtered = useMemo(() => {
    let result = materials.filter(m => m.active);

    // Textsuche (Name, Artikelnr., Herstellernr., EAN, Lagerort)
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(m =>
        m.name.toLowerCase().includes(q) ||
        m.article_number?.toLowerCase().includes(q) ||
        m.manufacturer_number?.toLowerCase().includes(q) ||
        m.ean_code?.toLowerCase().includes(q) ||
        m.storage_location?.toLowerCase().includes(q)
      );
    }

    // Kategorie-Filter
    if (categoryFilter) {
      result = result.filter(m => m.category_id === categoryFilter);
    }

    // Lieferant-Filter
    if (supplierFilter) {
      result = result.filter(m => m.supplier_id === supplierFilter);
    }

    // Status-Filter
    if (statusFilter === 'critical') {
      result = result.filter(m => m.current_stock <= m.min_stock);
    } else if (statusFilter === 'warning') {
      result = result.filter(m => m.current_stock > m.min_stock && m.current_stock <= m.min_stock * 1.5);
    } else if (statusFilter === 'ok') {
      result = result.filter(m => m.current_stock > m.min_stock * 1.5);
    }

    return result;
  }, [materials, search, categoryFilter, supplierFilter, statusFilter]);

  const activeFilterCount = [categoryFilter, supplierFilter, statusFilter].filter(Boolean).length;

  function clearAllFilters() {
    setCategoryFilter(null);
    setSupplierFilter(null);
    setStatusFilter(null);
  }

  const selectedCategoryName = categories.find(c => c.id === categoryFilter)?.name;
  const selectedSupplierName = suppliers.find(s => s.id === supplierFilter)?.name;
  const selectedStatusLabel = statusOptions.find(s => s.value === statusFilter)?.label;

  return (
    <>
      <header className="page-header">
        <h1>Material</h1>
        <button className="page-header-action" onClick={() => navigate('/material/neu')}>
          <Plus size={20} />
        </button>
      </header>

      <div className="page-content">
        {/* Suche */}
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Material, Artikelnr., Lagerort..."
        />

        {/* Filter-Toggle Button */}
        <div className="filter-toggle-row">
          <button
            className={`btn btn-sm ${showFilters || activeFilterCount > 0 ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal size={14} />
            Filter {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}
          </button>
          {activeFilterCount > 0 && (
            <button className="btn btn-sm btn-ghost" onClick={clearAllFilters}>
              Alle löschen ✕
            </button>
          )}
        </div>

        {/* Aktive Filter als Chips */}
        {activeFilterCount > 0 && (
          <div className="filter-chips">
            {selectedCategoryName && (
              <span className="filter-chip" onClick={() => setCategoryFilter(null)}>
                {selectedCategoryName} <X size={12} />
              </span>
            )}
            {selectedSupplierName && (
              <span className="filter-chip" onClick={() => setSupplierFilter(null)}>
                {selectedSupplierName} <X size={12} />
              </span>
            )}
            {selectedStatusLabel && (
              <span className="filter-chip" onClick={() => setStatusFilter(null)}>
                {selectedStatusLabel} <X size={12} />
              </span>
            )}
          </div>
        )}

        {/* Erweiterte Filter-Dropdowns */}
        {showFilters && (
          <div className="advanced-filters">
            {/* Kategorie */}
            <div className="filter-group">
              <label className="filter-group-label">Kategorie</label>
              <select
                value={categoryFilter || ''}
                onChange={e => setCategoryFilter(e.target.value || null)}
              >
                <option value="">Alle Kategorien</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Lieferant */}
            <div className="filter-group">
              <label className="filter-group-label">Lieferant</label>
              <select
                value={supplierFilter || ''}
                onChange={e => setSupplierFilter(e.target.value || null)}
              >
                <option value="">Alle Lieferanten</option>
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* Bestandsstatus */}
            <div className="filter-group">
              <label className="filter-group-label">Bestandsstatus</label>
              <div className="filter-status-btns">
                {statusOptions.map(opt => (
                  <button
                    key={opt.value}
                    className={`filter-status-btn ${statusFilter === opt.value ? 'active' : ''}`}
                    style={statusFilter === opt.value ? { background: opt.color, borderColor: opt.color, color: 'white' } : { borderColor: opt.color, color: opt.color }}
                    onClick={() => setStatusFilter(statusFilter === opt.value ? null : opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Ergebnis-Zähler */}
        <div className="text-sm text-secondary mb-md">
          {filtered.length} von {materials.filter(m => m.active).length} Artikeln
        </div>

        {/* Material-Liste */}
        {filtered.length > 0 ? (
          <div className="list">
            {filtered.map(m => (
              <MaterialCard key={m.id} material={m} onClick={() => navigate(`/material/${m.id}`)} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Package}
            title="Keine Artikel gefunden"
            text={activeFilterCount > 0 ? 'Versuche andere Filter.' : 'Füge dein erstes Material hinzu.'}
          />
        )}
      </div>
    </>
  );
}
