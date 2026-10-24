import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';

const HOLD_MS = 450;
const MOVE_TOLERANCE = 10;
const EDGE = 70;

export interface DragState {
  id: string;
  label: string;
  x: number;
  y: number;
  /** Section under the pointer ('' = outside any section), or null when not over a drop zone. */
  over: string | null;
}

/** Drop zone under a point: the closest element with a `data-drop` attribute. */
function dropTargetAt(x: number, y: number): string | null {
  const el = document.elementFromPoint(x, y)?.closest<HTMLElement>('[data-drop]');
  return el ? el.dataset.drop ?? '' : null;
}

/**
 * Long-press an item to pick it up, drag it over a `data-drop` zone and release to drop it there.
 * A short tap still works as a normal click. Releasing outside a drop zone cancels the move.
 */
export function useDragToSection(onDrop: (id: string, section: string) => void) {
  const [drag, setDrag] = useState<DragState | null>(null);
  const press = useRef<{ x: number; y: number; timer: number } | null>(null);
  const dragging = useRef(false);
  const swallowClick = useRef(false);
  const onDropRef = useRef(onDrop);
  onDropRef.current = onDrop;

  const cancelPress = () => {
    if (press.current) window.clearTimeout(press.current.timer);
    press.current = null;
  };

  // Stop the page from scrolling under the finger while an item is held. Registered up front and
  // non-passive, because browsers decide whether a touch may scroll when it starts.
  useEffect(() => {
    const block = (e: TouchEvent) => {
      if (dragging.current && e.cancelable) e.preventDefault();
    };
    document.addEventListener('touchmove', block, { passive: false });
    return () => document.removeEventListener('touchmove', block);
  }, []);

  const dragId = drag?.id;
  useEffect(() => {
    if (!dragId) return;
    dragging.current = true;
    document.body.classList.add('is-dragging');

    const move = (e: PointerEvent) => {
      if (e.clientY < EDGE) window.scrollBy(0, -12);
      else if (e.clientY > window.innerHeight - EDGE) window.scrollBy(0, 12);
      setDrag((d) => d && { ...d, x: e.clientX, y: e.clientY, over: dropTargetAt(e.clientX, e.clientY) });
    };
    const end = (e: PointerEvent, cancelled: boolean) => {
      const target = cancelled ? null : dropTargetAt(e.clientX, e.clientY);
      setDrag(null);
      swallowClick.current = true;
      window.setTimeout(() => (swallowClick.current = false), 350);
      if (target !== null) onDropRef.current(dragId, target);
    };
    const up = (e: PointerEvent) => end(e, false);
    const cancel = (e: PointerEvent) => end(e, true);

    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', cancel);
    return () => {
      dragging.current = false;
      document.body.classList.remove('is-dragging');
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', cancel);
    };
  }, [dragId]);

  /** Spread onto the element that can be picked up. */
  const handle = useCallback(
    (id: string, label: string) => ({
      onPointerDown: (e: ReactPointerEvent) => {
        if (e.button !== 0) return;
        cancelPress();
        const { clientX: x, clientY: y } = e;
        press.current = {
          x,
          y,
          timer: window.setTimeout(() => {
            press.current = null;
            navigator.vibrate?.(15);
            setDrag({ id, label, x, y, over: dropTargetAt(x, y) });
          }, HOLD_MS),
        };
      },
      onPointerMove: (e: ReactPointerEvent) => {
        const p = press.current;
        if (p && Math.hypot(e.clientX - p.x, e.clientY - p.y) > MOVE_TOLERANCE) cancelPress();
      },
      onPointerUp: cancelPress,
      onPointerCancel: cancelPress,
      onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
      onClickCapture: (e: React.MouseEvent) => {
        if (!swallowClick.current) return;
        swallowClick.current = false;
        e.preventDefault();
        e.stopPropagation();
      },
    }),
    [],
  );

  return { drag, handle };
}
