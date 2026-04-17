import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useStore } from '../hooks/useStore';
import SearchBar from '../components/SearchBar';
import FilterBar from '../components/FilterBar';
import ProjectCard from '../components/ProjectCard';
import EmptyState from '../components/EmptyState';
import { HardHat } from 'lucide-react';
import { PROJECT_STATUSES } from '../data/constants';

export default function ProjectList() {
  const navigate = useNavigate();
  const { projects } = useStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(null);

  const statusFilters = PROJECT_STATUSES.map(s => ({ id: s.value, name: s.label, color: s.color }));

  const filtered = useMemo(() => {
    let result = [...projects];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.customer.toLowerCase().includes(q) ||
        p.address?.toLowerCase().includes(q)
      );
    }

    if (statusFilter) {
      result = result.filter(p => p.status === statusFilter);
    }

    return result.sort((a, b) => {
      const order = { aktiv: 0, geplant: 1, pausiert: 2, abgeschlossen: 3 };
      return (order[a.status] || 9) - (order[b.status] || 9);
    });
  }, [projects, search, statusFilter]);

  return (
    <>
      <header className="page-header">
        <h1>Baustellen</h1>
        <button className="page-header-action" onClick={() => navigate('/baustellen/neu')}>
          <Plus size={22} />
        </button>
      </header>

      <div className="page-content">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Baustelle oder Kunde suchen..."
        />

        <FilterBar
          filters={statusFilters}
          activeFilter={statusFilter}
          onFilterChange={setStatusFilter}
        />

        {filtered.length > 0 ? (
          <div className="list">
            {filtered.map(p => <ProjectCard key={p.id} project={p} />)}
          </div>
        ) : (
          <EmptyState
            icon={HardHat}
            title="Keine Baustellen"
            text={search ? 'Keine Treffer für diese Suche.' : 'Lege deine erste Baustelle an.'}
            action={
              !search && (
                <button className="btn btn-primary" onClick={() => navigate('/baustellen/neu')}>
                  <Plus size={18} /> Baustelle anlegen
                </button>
              )
            }
          />
        )}
      </div>
    </>
  );
}
