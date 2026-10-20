import { useEffect, useState } from 'react';

/**
 * Current date & time, re-rendering on every minute boundary and when the
 * app comes back to the foreground (so "today" rolls over at midnight).
 */
export function useNow(): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let timer: number;
    const tick = () => {
      const d = new Date();
      setNow(d);
      timer = window.setTimeout(tick, 60_000 - (d.getSeconds() * 1000 + d.getMilliseconds()) + 50);
    };
    timer = window.setTimeout(tick, 60_000 - (new Date().getSeconds() * 1000) + 50);

    const onVisible = () => document.visibilityState === 'visible' && setNow(new Date());
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  return now;
}
