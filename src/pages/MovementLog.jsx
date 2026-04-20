import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Download } from 'lucide-react';
import { useStore } from '../hooks/useStore';
import { MOVEMENT_TYPES } from '../data/constants';
import SearchBar from '../components/SearchBar';
import FilterBar from '../components/FilterBar';
import MovementRow from '../components/MovementRow';
import EmptyState from '../components/EmptyState';
import { ArrowDownUp } from 'lucide-react';
import { exportMovementsCSV } from '../services/exportUtils';

export default function MovementLog() {
  const navigate = useNavigate();
  const { movements, materials, projects } = useStore();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState(null);

  const typeFilters = MOVEMENT_TYPES.map(t => ({ id: t.value, name: t.label, color: t.color }));

  const filtered = useMemo(() => {
    let result = [...movements];

    if (typeFilter) {
      result = result.filter(m => m.type === typeFilter);
    }

    // Suche wird über MaterialName gemacht, hier wir brauchen den Store
    // Vereinfacht: nach note suchen
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(m =>
        m.note?.toLowerCase().includes(q) ||
        m.type.toLowerCase().includes(q)
      );
    }

    return result;
  }, [movements, search, typeFilter]);

  return (
    <>
      <header className="page-header">
        <button className="page-header-back" onClick={() => navigate(-1)}>
          <ChevronLeft size={22} />
        </button>
        <h1>Lagerbewegungen</h1>
        <button
          className="page-header-action"
          onClick={() => exportMovementsCSV(filtered, materials, projects)}
          title="Als CSV exportieren"
          disabled={filtered.length === 0}
        >
          <Download size={20} />
        </button>
      </header>

      <div className="page-content">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="In Notizen suchen..."
        />

        <FilterBar
          filters={typeFilters}
          activeFilter={typeFilter}
          onFilterChange={setTypeFilter}
        />

        <div className="text-sm text-secondary mb-md">
          {filtered.length} Buchungen
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
