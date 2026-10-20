import { useEffect, useState } from 'react';

// Chrome/Edge/Samsung fire this event when the app can be installed. It can fire before React
// mounts, so it is captured at module load and handed to the banner when it appears.
type InstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };
let deferred: InstallPromptEvent | null = null;
const listeners = new Set<() => void>();
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferred = e as InstallPromptEvent;
  listeners.forEach((l) => l());
});
window.addEventListener('appinstalled', () => {
  deferred = null;
  listeners.forEach((l) => l());
});

const DISMISS_KEY = 'biomarkers-app/install-dismissed';

const isInstalled = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true;

// iPhone/iPad (iPadOS reports itself as a Mac with touch).
const isIOS = () =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

const wasDismissed = () => {
  try {
    return localStorage.getItem(DISMISS_KEY) === '1';
  } catch {
    return false;
  }
};

export function InstallBanner() {
  const [, rerender] = useState(0);
  const [hidden, setHidden] = useState(() => isInstalled() || wasDismissed());

  useEffect(() => {
    const l = () => rerender((n) => n + 1);
    listeners.add(l);
    return () => void listeners.delete(l);
  }, []);

  if (hidden) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, '1');
    } catch {
      /* ignore */
    }
    setHidden(true);
  };

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    deferred = null;
    if (outcome === 'accepted') setHidden(true);
    else rerender((n) => n + 1);
  };

  let body: React.ReactNode = null;
  if (deferred) {
    body = (
      <>
        <span className="grow">Install Biomarkers on this device for quick access, even offline.</span>
        <button className="btn primary small" onClick={install}>
          Install app
        </button>
      </>
    );
  } else if (isIOS()) {
    body = (
      <span className="grow">
        Install this app: tap <ShareGlyph /> <strong>Share</strong>, then <strong>Add to Home Screen</strong>.
      </span>
    );
  }
  if (!body) return null;

  return (
    <div className="install-banner" role="region" aria-label="Install app">
      {body}
      <button className="install-close" aria-label="Dismiss" onClick={dismiss}>
        ×
      </button>
    </div>
  );
}

function ShareGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ verticalAlign: '-3px' }}>
      <path d="M12 3v12M8 7l4-4 4 4M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" />
    </svg>
  );
}
