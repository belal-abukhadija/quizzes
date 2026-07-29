import { useEffect, useRef, useState } from 'react';

/**
 * Wall-clock countdown to `deadline`. Returns null when there is no deadline.
 * `onExpire` fires once, and survives a refresh because the deadline is derived
 * from the persisted session start time.
 */
export function useCountdown(deadline: number | null, onExpire: () => void): number | null {
  const [remaining, setRemaining] = useState<number | null>(() =>
    deadline === null ? null : Math.max(0, deadline - Date.now()),
  );

  const expire = useRef(onExpire);
  expire.current = onExpire;

  useEffect(() => {
    if (deadline === null) {
      setRemaining(null);
      return;
    }

    let fired = false;
    const tick = () => {
      const next = Math.max(0, deadline - Date.now());
      setRemaining(next);
      if (next === 0 && !fired) {
        fired = true;
        expire.current();
      }
    };

    tick();
    const timer = window.setInterval(tick, 500);
    return () => window.clearInterval(timer);
  }, [deadline]);

  return remaining;
}
