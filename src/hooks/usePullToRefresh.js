import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * usePullToRefresh – Pull-to-Refresh für Mobile.
 * Zeigt einen Refresh-Indikator wenn der User nach unten zieht.
 * 
 * @param {function} onRefresh – Callback beim Release
 * @returns {object} – { ref, isPulling, pullProgress }
 */
export default function usePullToRefresh(onRefresh) {
  const ref = useRef(null);
  const [isPulling, setIsPulling] = useState(false);
  const [pullProgress, setPullProgress] = useState(0);
  const startY = useRef(0);
  const currentY = useRef(0);
  const isActive = useRef(false);

  const handleTouchStart = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    // Nur aktiv wenn am Top des Scrollbereichs
    if (el.scrollTop > 0) return;
    
    startY.current = e.touches[0].clientY;
    isActive.current = true;
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!isActive.current) return;
    
    currentY.current = e.touches[0].clientY;
    const diff = currentY.current - startY.current;
    
    if (diff > 0) {
      // Nach unten ziehen
      e.preventDefault();
      const progress = Math.min(diff / 120, 1); // 120px = 100%
      setPullProgress(progress);
      setIsPulling(progress > 0.1);
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!isActive.current) return;
    
    const diff = currentY.current - startY.current;
    if (diff > 120) {
      // Trigger refresh
      onRefresh();
    }
    
    isActive.current = false;
    setIsPulling(false);
    setPullProgress(0);
    startY.current = 0;
    currentY.current = 0;
  }, [onRefresh]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    el.addEventListener('touchend', handleTouchEnd);

    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return { ref, isPulling, pullProgress };
}
