import { useEffect, useState } from 'react';
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

  const go = (t: Tab) => {
    if (t !== tab) window.location.hash = t;
    setNavKey((k) => k + 1);
    window.scrollTo({ top: 0 });
  };

  return (
    <div className="app">
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
      <main className="main" key={navKey}>
        <InstallBanner />
        {tab === 'today' && <TodayView now={now} />}
        {tab === 'plans' && <PlansView now={now} />}
        {tab === 'biomarkers' && <BiomarkersView />}
        {tab === 'statistics' && <StatisticsView now={now} />}
      </main>
    </div>
  );
}
