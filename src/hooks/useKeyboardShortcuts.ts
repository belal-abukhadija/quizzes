import { useEffect, useRef } from 'react';

interface Handlers {
  /** 1-9 pressed, reported as a zero-based option index. */
  onDigit?: (index: number) => void;
  onEnter?: () => void;
  /** Left/right arrows, as -1 or 1. */
  onStep?: (direction: -1 | 1) => void;
  enabled?: boolean;
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  return ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
}

export function useKeyboardShortcuts({ onDigit, onEnter, onStep, enabled = true }: Handlers): void {
  // Kept in a ref so changing handlers never re-binds the listener.
  const handlers = useRef({ onDigit, onEnter, onStep });
  handlers.current = { onDigit, onEnter, onStep };

  useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
      if (isTypingTarget(event.target)) return;

      const { onDigit: digit, onEnter: enter, onStep: step } = handlers.current;

      if (digit && /^[1-9]$/.test(event.key)) {
        event.preventDefault();
        digit(Number(event.key) - 1);
        return;
      }
      if (enter && event.key === 'Enter') {
        event.preventDefault();
        enter();
        return;
      }
      if (step && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
        event.preventDefault();
        step(event.key === 'ArrowLeft' ? -1 : 1);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [enabled]);
}
