import { useEffect, useRef, useState } from 'react';
import { useNow } from './hooks/useNow';
import { Icon, type IconName } from './components/Icon';
import { TodayView } from './features/today/TodayView';
import { PlansView } from './features/plans/PlansView';
import { BiomarkersView } from './features/biomarkers/BiomarkersView';
import { StatisticsView } from './features/statistics/StatisticsView';
import { InstallBanner } from './components/InstallBanner';

type Tab = 'today' | 'plans' | 'biomarkers' | 'statistics';

const TABS: { id: Tab; label: string; icon: IconName }[] = [
  { id: 'today', label: 'Today', icon: 'today' },
  { id: 'plans', label: 'Plans', icon: 'plans' },
  { id: 'biomarkers', label: 'Biomarkers', icon: 'biomarkers' },
  { id: 'statistics', label: 'Statistics', icon: 'stats' },
];

const tabFromHash = (): Tab => {
  const h = window.location.hash.slice(1);
  return TABS.some((t) => t.id === h) ? (h as Tab) : 'today';
};

export function App() {
  const now = useNow();
  const [tab, setTab] = useState<Tab>(tabFromHash);
  // Bumped on every nav tap so re-tapping a tab resets it (e.g. leaves a detail view).
  const [navKey, setNavKey] = useState(0);

  // Keep the tab in the URL hash so refresh / back button work.
  useEffect(() => {
    const onHash = () => setTab(tabFromHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // Direction of the last tab change, used for the slide-in animation.
  const [slide, setSlide] = useState<'left' | 'right' | null>(null);

  const go = (t: Tab, from: 'tap' | 'swipe' = 'tap') => {
    if (t !== tab) {
      const dir = TABS.findIndex((x) => x.id === t) > TABS.findIndex((x) => x.id === tab) ? 'left' : 'right';
      setSlide(from === 'swipe' ? dir : null);
      window.location.hash = t;
    }
    setNavKey((k) => k + 1);
    window.scrollTo({ top: 0 });
  };

  // Swipe left/right anywhere on the page to move between the four tabs.
  const touch = useRef<{ x: number; y: number; t: number } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    const target = e.target as HTMLElement;
    // Leave gestures alone inside sheets/dialogs, form fields and charts (which scrub on touch).
    if (e.touches.length !== 1 || target.closest('.sheet-backdrop, input, textarea, select, .chart, [data-no-swipe]')) {
      touch.current = null;
      return;
    }
    const p = e.touches[0];
    touch.current = { x: p.clientX, y: p.clientY, t: Date.now() };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touch.current;
    touch.current = null;
    if (!start) return;
    const p = e.changedTouches[0];
    const dx = p.clientX - start.x;
    const dy = p.clientY - start.y;
    // A clear, mostly horizontal flick: far enough, much more sideways than vertical, not a slow drag.
    if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.5 || Date.now() - start.t > 700) return;
    const i = TABS.findIndex((x) => x.id === tab);
    const next = TABS[i + (dx < 0 ? 1 : -1)];
    if (next) go(next.id, 'swipe');
  };

  return (
    <div className="app" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <nav className="nav" aria-label="Sections">
        <div className="nav-brand">Biomarkers</div>
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`nav-item ${tab === t.id ? 'active' : ''}`}
            aria-current={tab === t.id ? 'page' : undefined}
            onClick={() => go(t.id)}
          >
            <Icon name={t.icon} size={22} />
            <span>{t.label}</span>
          </button>
        ))}
      </nav>
      <main className={`main${slide ? ` slide-${slide}` : ''}`} key={navKey}>
        <InstallBanner />
        {tab === 'today' && <TodayView now={now} />}
        {tab === 'plans' && <PlansView now={now} />}
        {tab === 'biomarkers' && <BiomarkersView />}
        {tab === 'statistics' && <StatisticsView now={now} />}
      </main>
    </div>
  );
}
