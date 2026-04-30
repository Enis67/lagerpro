import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Download, Calendar } from 'lucide-react';
import { useStore } from '../hooks/useStore';
import { MOVEMENT_TYPES } from '../data/constants';
import { exportMovementsCSV } from '../services/csvExport';
import SearchBar from '../components/SearchBar';
import FilterBar from '../components/FilterBar';
import MovementRow from '../components/MovementRow';
import EmptyState from '../components/EmptyState';
import Toast from '../components/Toast';
import { ArrowDownUp } from 'lucide-react';

export default function MovementLog() {
  const navigate = useNavigate();
  const { movements, materials, projects } = useStore();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [toast, setToast] = useState(null);

  const typeFilters = MOVEMENT_TYPES.map(t => ({ id: t.value, name: t.label, color: t.color }));

  const materialMap = useMemo(() => Object.fromEntries(materials.map(m => [m.id, m])), [materials]);

  const filtered = useMemo(() => {
    let result = [...movements];

    if (typeFilter) {
      result = result.filter(m => m.type === typeFilter);
    }

    // Datumsfilter
    if (dateFrom) {
      const from = new Date(dateFrom + 'T00:00:00');
      result = result.filter(m => new Date(m.created_at) >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo + 'T23:59:59');
      result = result.filter(m => new Date(m.created_at) <= to);
    }

    // Suche: in Notiz UND Materialname
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(m => {
        const mat = materialMap[m.material_id];
        return (
          m.note?.toLowerCase().includes(q) ||
          m.type.toLowerCase().includes(q) ||
          mat?.name?.toLowerCase().includes(q) ||
          mat?.article_number?.toLowerCase().includes(q)
        );
      });
    }

    return result;
  }, [movements, search, typeFilter, dateFrom, dateTo, materialMap]);

  function handleExport() {
    try {
      exportMovementsCSV(filtered, materials, projects);
      setToast({ message: `${filtered.length} Buchungen als CSV exportiert ✓`, type: 'success' });
    } catch (err) {
      setToast({ message: 'Export fehlgeschlagen: ' + err.message, type: 'error' });
    }
  }

  function clearDateFilter() {
    setDateFrom('');
    setDateTo('');
    setShowDateFilter(false);
  }

  const hasDateFilter = dateFrom || dateTo;

  return (
    <>
      <header className="page-header">
        <button className="page-header-back" onClick={() => navigate(-1)}>
          <ChevronLeft size={22} />
        </button>
        <h1>Lagerbewegungen</h1>
        <button className="page-header-action" onClick={handleExport} title="Als CSV exportieren">
          <Download size={18} />
        </button>
      </header>

      <div className="page-content">
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Material oder Notiz suchen..."
        />

        <FilterBar
          filters={typeFilters}
          activeFilter={typeFilter}
          onFilterChange={setTypeFilter}
        />

        {/* Datumsfilter Toggle */}
        <div className="date-filter-row">
          <button
            className={`btn btn-sm ${showDateFilter || hasDateFilter ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setShowDateFilter(!showDateFilter)}
          >
            <Calendar size={14} />
            {hasDateFilter ? 'Zeitraum aktiv' : 'Zeitraum'}
          </button>
          {hasDateFilter && (
            <button className="btn btn-sm btn-ghost" onClick={clearDateFilter}>
              Filter löschen ✕
            </button>
          )}
        </div>

        {/* Datumsfilter Felder */}
        {showDateFilter && (
          <div className="date-filter-fields">
            <div className="date-filter-field">
              <label className="text-xs text-secondary">Von</label>
              <input
                type="date"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
              />
            </div>
            <div className="date-filter-field">
              <label className="text-xs text-secondary">Bis</label>
              <input
                type="date"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="text-sm text-secondary mb-md">
          {filtered.length} Buchungen{hasDateFilter ? ' (gefiltert)' : ''}
        </div>

        {filtered.length > 0 ? (
          <div className="card">
            {filtered.map(m => <MovementRow key={m.id} movement={m} />)}
          </div>
        ) : (
          <EmptyState
            icon={ArrowDownUp}
            title="Keine Buchungen"
            text="Hier erscheinen alle Lagerbewegungen."
          />
        )}
      </div>
    </>
  );
}
