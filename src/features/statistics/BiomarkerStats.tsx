import { useState, type ReactNode } from 'react';
import type { Biomarker, Entry, InfoType, RangeValue } from '../../domain/types';
import { closeness } from '../../domain/score';
import { describeOptimal, formatValue, isRange } from '../../domain/values';
import { formatDateTime } from '../../lib/date';
import { LineChart, type Series } from '../../components/LineChart';
import { EntryValues } from '../../components/EntryValues';
import { Icon } from '../../components/Icon';
import { LogEntrySheet } from '../today/LogEntrySheet';
import { averageCloseness, pct, scoreTone } from './stats';

interface Props {
  biomarker: Biomarker;
  entries: Entry[]; // already filtered to the period, oldest first
  now: Date;
  onBack: () => void;
  toolbar?: ReactNode;
}

export function BiomarkerStats({ biomarker, entries, now, onBack, toolbar }: Props) {
  const [editing, setEditing] = useState<Entry | null>(null);

  return (
    <section className="view">
      <header className="view-header">
        <button className="icon-btn" onClick={onBack} aria-label="Back to all statistics">
          <Icon name="back" />
        </button>
        <h1 className="grow">{biomarker.name}</h1>
      </header>
      {toolbar}

      {entries.length === 0 ? (
        <p className="muted">No entries in this period.</p>
      ) : (
        biomarker.infoTypes.map((info) => <InfoStats key={info.id} info={info} biomarker={biomarker} entries={entries} />)
      )}

      <div className="section-title">
        <h2>History</h2>
      </div>
      <ul className="list">
        {[...entries].reverse().map((e) => (
          <li key={e.id}>
            <button className="card card-btn" onClick={() => setEditing(e)}>
              <div className="card-main">
                <span className="muted small">{formatDateTime(new Date(e.timestamp))}</span>
                <EntryValues biomarker={biomarker} entry={e} />
                {e.note && <span className="muted small">“{e.note}”</span>}
              </div>
              <Icon name="chevron" />
            </button>
          </li>
        ))}
      </ul>

      {editing && <LogEntrySheet biomarker={biomarker} entry={editing} now={now} onClose={() => setEditing(null)} />}
    </section>
  );
}

function InfoStats({ info, biomarker, entries }: { info: InfoType; biomarker: Biomarker; entries: Entry[] }) {
  const withValue = entries.filter((e) => e.values[info.id] !== undefined);
  if (withValue.length === 0) return null;

  const avg = averageCloseness(biomarker, withValue, info);
  const optimal = describeOptimal(info);
  const t = (e: Entry) => new Date(e.timestamp).getTime();
  // Axis/tile formatting; yes/no and named scale steps only label whole steps.
  const fmt = (v: number) =>
    (info.kind === 'yesno' || info.labels) && !Number.isInteger(v)
      ? ''
      : info.kind === 'yesno'
        ? v === 1 ? 'Yes' : v === 0 ? 'No' : ''
        : formatValue({ ...info, unit: undefined }, v);

  let body;
  if (info.kind === 'number' || info.kind === 'scale' || info.kind === 'time' || info.kind === 'yesno') {
    const pts = withValue.map((e) => ({ t: t(e), v: e.values[info.id] as number }));
    const vals = pts.map((p) => p.v);
    const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
    const first = vals[0];
    const last = vals[vals.length - 1];
    const diff = last - first;
    // Time differences read as "+0:45", not as a clock time.
    const change =
      info.kind === 'time'
        ? `${diff >= 0 ? '+' : '−'}${Math.floor(Math.abs(diff))}:${String(Math.round((Math.abs(diff) % 1) * 60)).padStart(2, '0')} h`
        : `${diff >= 0 ? '+' : ''}${fmt(+diff.toFixed(2))}`;
    const yes = vals.filter((v) => v >= 0.5).length;
    const domain: [number, number] | undefined =
      info.kind === 'yesno'
        ? [0, 1]
        : info.kind === 'scale' && info.min !== undefined && info.max !== undefined
          ? [info.min, info.max]
          : undefined;
    body = (
      <>
        <div className="tiles">
          <Tile label="Latest" value={formatValue(info, last)} />
          {info.kind === 'yesno' ? (
            <Tile label="Yes" value={`${yes} of ${vals.length} (${Math.round((yes / vals.length) * 100)}%)`} />
          ) : (
            <>
              <Tile label="Average" value={formatValue(info, +mean.toFixed(2))} />
              <Tile label="Min / Max" value={`${fmt(Math.min(...vals))} / ${fmt(Math.max(...vals))}`} />
              <Tile label="Change" value={change} />
            </>
          )}
        </div>
        <LineChart
          series={[{ name: info.label, color: 'var(--series-1)', points: pts }]}
          band={info.optimal && { min: info.optimal.min, max: info.optimal.max }}
          target={info.optimal?.target}
          format={fmt}
          yDomain={domain}
        />
      </>
    );
  } else if (info.kind === 'range') {
    const ranged = withValue.filter((e) => isRange(e.values[info.id]));
    const series: Series[] = [
      { name: 'High', color: 'var(--series-2)', points: ranged.map((e) => ({ t: t(e), v: (e.values[info.id] as RangeValue).high })) },
      { name: 'Low', color: 'var(--series-1)', points: ranged.map((e) => ({ t: t(e), v: (e.values[info.id] as RangeValue).low })) },
    ];
    body = (
      <>
        <div className="tiles">
          <Tile label="Latest" value={formatValue(info, ranged[ranged.length - 1]?.values[info.id])} />
          <Tile label="Lowest" value={fmt(Math.min(...series[1].points.map((p) => p.v)))} />
          <Tile label="Highest" value={fmt(Math.max(...series[0].points.map((p) => p.v)))} />
        </div>
        <LineChart series={series} band={info.optimal && { min: info.optimal.min, max: info.optimal.max }} format={fmt} />
      </>
    );
  } else if (info.kind === 'color') {
    const scored = withValue
      .map((e) => ({ t: t(e), v: closeness(info, e.values[info.id]) }))
      .filter((p): p is { t: number; v: number } => p.v !== null)
      .map((p) => ({ t: p.t, v: Math.round(p.v * 100) }));
    body = (
      <>
        <div className="color-strip" role="list" aria-label="Logged colors over time">
          {withValue.map((e) => (
            <span
              role="listitem"
              key={e.id}
              className="swatch big"
              style={{ background: e.values[info.id] as string }}
              title={`${formatDateTime(new Date(e.timestamp))} · ${String(e.values[info.id]).toUpperCase()}`}
            />
          ))}
        </div>
        {scored.length > 0 && (
          <>
            <p className="muted small">Closeness to optimal color</p>
            <LineChart
              series={[{ name: 'Closeness', color: 'var(--series-1)', points: scored }]}
              format={(v) => `${v}%`}
              yDomain={[0, 100]}
              height={160}
            />
          </>
        )}
      </>
    );
  } else {
    body = (
      <ul className="text-log">
        {[...withValue].reverse().slice(0, 10).map((e) => (
          <li key={e.id}>
            <span className="muted small">{formatDateTime(new Date(e.timestamp))}</span>
            <p>{String(e.values[info.id])}</p>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <article className="card stat-card">
      <div className="stat-card-head">
        <div>
          <h3>{info.label}</h3>
          <span className="muted small">
            {withValue.length} entr{withValue.length === 1 ? 'y' : 'ies'}
            {optimal && (
              <>
                {' · optimal '}
                {info.kind === 'color' ? <span className="swatch" style={{ background: info.optimal!.color }} /> : optimal}
              </>
            )}
          </span>
        </div>
        {avg !== null && (
          <span className={`badge score ${scoreTone(avg)}`} title="Average closeness to optimal">
            {pct(avg)}
          </span>
        )}
      </div>
      {body}
    </article>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="tile">
      <span className="muted small">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
