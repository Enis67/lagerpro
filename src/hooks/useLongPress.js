import { useCallback, useRef } from 'react';

const LONG_PRESS_DURATION = 500;
const MOVE_THRESHOLD = 10;

/**
 * Hook für Long-Press Erkennung (Touch + Maus).
 * - 500ms Halten = Long-Press
 * - Bewegung > 10px bricht ab
 * - Normaler Klick wird nur ausgeführt, wenn kein Long-Press stattfand
 */
export default function useLongPress({ onLongPress, onClick }) {
  const timerRef = useRef(null);
  const isLongPressRef = useRef(false);
  const startPosRef = useRef({ x: 0, y: 0 });

  const clear = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const start = useCallback(
    (e) => {
      isLongPressRef.current = false;
      const touch = e.touches?.[0];
      const clientX = touch ? touch.clientX : e.clientX;
      const clientY = touch ? touch.clientY : e.clientY;
      startPosRef.current = { x: clientX, y: clientY };

      timerRef.current = setTimeout(() => {
        isLongPressRef.current = true;
        onLongPress({ x: clientX, y: clientY });
      }, LONG_PRESS_DURATION);
    },
    [onLongPress]
  );

  const move = useCallback(
    (e) => {
      if (!timerRef.current) return;
      const touch = e.touches?.[0];
      const clientX = touch ? touch.clientX : e.clientX;
      const clientY = touch ? touch.clientY : e.clientY;
      const dx = clientX - startPosRef.current.x;
      const dy = clientY - startPosRef.current.y;
      if (Math.sqrt(dx * dx + dy * dy) > MOVE_THRESHOLD) {
        clear();
      }
    },
    [clear]
  );

  const end = useCallback(
    (e) => {
      clear();
      const wasLongPress = isLongPressRef.current;
      isLongPressRef.current = false;

      if (!wasLongPress && onClick) {
        onClick(e);
      }

      // Verhindere native Context-Menu & Click nach Long-Press
      if (wasLongPress) {
        e.preventDefault?.();
        e.stopPropagation?.();
      }
    },
    [clear, onClick]
  );

  return {
    onMouseDown: start,
    onMouseMove: move,
    onMouseUp: end,
    onMouseLeave: clear,
    onTouchStart: start,
    onTouchMove: move,
    onTouchEnd: end,
    onContextMenu: (e) => {
      // Natives Context-Menu immer unterdrücken
      e.preventDefault();
    },
  };
}
