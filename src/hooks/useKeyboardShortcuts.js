import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * useKeyboardShortcuts – Globale Tastenkombinationen für Desktop-UX.
 * 
 * Shortcuts:
 *   Ctrl+1 → Dashboard (/)
 *   Ctrl+2 → Schnell buchen (/buchen)
 *   Ctrl+3 → Materialien (/material)
 *   Ctrl+4 → Baustellen (/baustellen)
 *   Ctrl+K → Suche fokussieren
 *   Ctrl+? → Shortcut-Hilfe anzeigen
 */
export function useKeyboardShortcuts({ onShowHelp } = {}) {
  const navigate = useNavigate();

  useEffect(() => {
    function handleKeyDown(e) {
      const target = e.target;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      ) {
        return;
      }

      if (!e.ctrlKey) return;

      switch (e.key) {
        case '1':
          e.preventDefault();
          navigate('/');
          break;
        case '2':
          e.preventDefault();
          navigate('/buchen');
          break;
        case '3':
          e.preventDefault();
          navigate('/material');
          break;
        case '4':
          e.preventDefault();
          navigate('/baustellen');
          break;
        case 'k':
          e.preventDefault();
          document.querySelector('.search-bar input')?.focus();
          break;
        case '?':
          e.preventDefault();
          onShowHelp?.();
          break;
        default:
          break;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, onShowHelp]);

  return {};
}
