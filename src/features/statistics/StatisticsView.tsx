import { useMemo, useState } from 'react';
import type { ID } from '../../domain/types';
import { useStore } from '../../state/AppStore';
import { formatDateTime } from '../../lib/date';
import { EmptyState } from '../../components/EmptyState';
import { Icon } from '../../components/Icon';
import { BiomarkerStats } from './BiomarkerStats';
import { PERIODS, averageCloseness, inPeriod, pct, scoreTone, type Period } from './stats';

export function StatisticsView({ now }: { now: Date }) {
  const { data } = useStore();
  const [period, setPeriod] = useState<Period>('30');
  const [selected, setSelected] = useState<ID | null>(null);

  const rows = useMemo(() => {
    const entries = inPeriod(data.entries, period, now).sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    return data.biomarkers
      .map((b) => {
        const list = entries.filter((e) => e.biomarkerId === b.id);
        return { biomarker: b, entries: list, score: averageCloseness(b, list) };
      })
      .filter((r) => r.entries.length > 0)
      .sort((a, b) => b.entries[b.entries.length - 1].timestamp.localeCompare(a.entries[a.entries.length - 1].timestamp));
  }, [data, period, now]);

  const current = selected ? rows.find((r) => r.biomarker.id === selected) : undefined;

  const periodFilter = (
    <div className="segmented" role="radiogroup" aria-label="Period">
      {PERIODS.map((p) => (
        <button key={p.id} role="radio" aria-checked={period === p.id} className={period === p.id ? 'on' : ''} onClick={() => setPeriod(p.id)}>
          {p.label}
        </button>
      ))}
    </div>
  );

  if (selected) {
    const biomarker = current?.biomarker ?? data.biomarkers.find((b) => b.id === selected);
    if (biomarker) {
      return (
        <BiomarkerStats
          biomarker={biomarker}
          entries={current?.entries ?? []}
          now={now}
          onBack={() => setSelected(null)}
          toolbar={periodFilter}
        />
      );
    }
  }

  return (
    <section className="view">
      <header className="view-header">
        <h1>Statistics</h1>
      </header>
      {periodFilter}

      {rows.length === 0 ? (
        <EmptyState title="No data in this period">Log some biomarkers on the Today tab and your trends will appear here.</EmptyState>
      ) : (
        <ul className="list">
          {rows.map(({ biomarker, entries, score }) => (
            <li key={biomarker.id}>
              <button className="card card-btn" onClick={() => setSelected(biomarker.id)}>
                <div className="card-main">
                  <strong>{biomarker.name}</strong>
                  <span className="muted small">
                    {entries.length} entr{entries.length === 1 ? 'y' : 'ies'} · last {formatDateTime(new Date(entries[entries.length - 1].timestamp))}
                  </span>
                  {score !== null && (
                    <div className="meter" aria-label={`Closeness to optimal ${pct(score)}`}>
                      <div className={`meter-fill ${scoreTone(score)}`} style={{ width: pct(score) }} />
                    </div>
                  )}
                </div>
                {score !== null && <span className={`badge score ${scoreTone(score)}`}>{pct(score)}</span>}
                <Icon name="chevron" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
