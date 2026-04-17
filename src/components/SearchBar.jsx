import { Search, X } from 'lucide-react';

export default function SearchBar({ value, onChange, placeholder = 'Suchen...' }) {
  return (
    <div className="search-bar">
      <Search size={18} className="search-bar-icon" />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        enterKeyHint="search"
        autoComplete="off"
      />
      {value && (
        <button className="search-bar-clear" onClick={() => onChange('')} aria-label="Suche leeren">
          <X size={16} />
        </button>
      )}
    </div>
  );
}
