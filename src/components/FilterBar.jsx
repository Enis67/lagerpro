export default function FilterBar({ filters, activeFilter, onFilterChange }) {
  return (
    <div className="filter-bar">
      <button
        className={`filter-chip ${activeFilter === null ? 'active' : ''}`}
        onClick={() => onFilterChange(null)}
      >
        Alle
      </button>
      {filters.map(f => (
        <button
          key={f.id}
          className={`filter-chip ${activeFilter === f.id ? 'active' : ''}`}
          onClick={() => onFilterChange(f.id)}
        >
          {f.color && <span className="category-dot" style={{ background: f.color }} />}
          {f.name}
        </button>
      ))}
    </div>
  );
}
