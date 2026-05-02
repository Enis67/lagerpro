import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PackageMinus, Star, Info, X } from 'lucide-react';
import { useStore } from '../hooks/useStore';

/**
 * Long-Press Context Menu – absolut positioniertes Overlay.
 * Schließt bei Klick außerhalb oder nach Auswahl.
 */
export default function LongPressMenu({ materialId, x, y, onClose }) {
  const navigate = useNavigate();
  const { materials, toggleFavorite } = useStore();
  const menuRef = useRef(null);

  const material = materials.find((m) => m.id === materialId);
  if (!material) return null;

  /* ── Klick außerhalb → schließen ── */
  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('touchstart', handleClick);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('touchstart', handleClick);
    };
  }, [onClose]);

  /* ── Position (nicht über den Rand) ── */
  const getStyle = () => {
    const menuWidth = 210;
    const menuHeight = 150;
    let left = x - menuWidth / 2;
    let top = y + 12;
    const maxW = window.innerWidth - 16;
    const maxH = window.innerHeight - 16;
    if (left < 8) left = 8;
    if (left + menuWidth > maxW) left = maxW - menuWidth;
    if (top + menuHeight > maxH) top = y - menuHeight - 12;
    if (top < 8) top = 8;
    return { left, top };
  };

  const handleQuickBook = () => {
    onClose();
    navigate('/buchen');
  };

  const handleFavorite = () => {
    onClose();
    toggleFavorite(materialId);
  };

  const handleDetails = () => {
    onClose();
    navigate(`/material/${materialId}`);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 250,
          background: 'rgba(0,0,0,0.25)',
          backdropFilter: 'blur(2px)',
        }}
        onClick={onClose}
        onTouchStart={onClose}
      />
      {/* Menu */}
      <div
        ref={menuRef}
        className="context-menu"
        style={{
          position: 'fixed',
          zIndex: 251,
          ...getStyle(),
        }}
      >
        <div className="context-menu-header">
          <span className="context-menu-title">{material.name}</span>
          <button className="context-menu-close" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <button className="context-menu-item" onClick={handleQuickBook}>
          <PackageMinus size={18} color="var(--color-primary)" />
          <span>Schnell buchen</span>
        </button>

        <button className="context-menu-item" onClick={handleFavorite}>
          {material.is_favorite ? (
            <Star size={18} fill="var(--color-accent)" color="var(--color-accent)" />
          ) : (
            <Star size={18} color="var(--color-accent)" />
          )}
          <span>
            {material.is_favorite ? 'Favorit entfernen' : 'Als Favorit markieren'}
          </span>
        </button>

        <button className="context-menu-item" onClick={handleDetails}>
          <Info size={18} color="var(--color-info)" />
          <span>Details</span>
        </button>
      </div>
    </>
  );
}
