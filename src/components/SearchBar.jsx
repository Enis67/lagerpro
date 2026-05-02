import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';

/**
 * Debounced SearchBar – verzögert onChange um 200ms
 * um bei schnellem Tippen nicht bei jedem Tastenanschlag zu filtern.
 */
export default function SearchBar({ value, onChange, placeholder = 'Suchen...', debounceMs = 200 }) {
  const [localValue, setLocalValue] = useState(value);
  const timerRef = useRef(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  function handleChange(val) {
    setLocalValue(val);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onChange(val);
    }, debounceMs);
  }

  function handleClear() {
    setLocalValue('');
    onChange('');
    if (timerRef.current) clearTimeout(timerRef.current);
  }

  return (
    <div className="search-bar">
      <Search size={18} className="search-bar-icon" />
      <input
        type="text"
        value={localValue}
        onChange={e => handleChange(e.target.value)}
        placeholder={placeholder}
        enterKeyHint="search"
        autoComplete="off"
      />
      {localValue && (
        <button className="search-bar-clear" onClick={handleClear} aria-label="Suche leeren">
          <X size={16} />
        </button>
      )}
    </div>
  );
}
