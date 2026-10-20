import { useMemo, useState } from 'react';
import type { Biomarker, Entry, ID } from '../../domain/types';
import { agendaFor, type DueStatus } from '../../domain/agenda';
import { useStore } from '../../state/AppStore';
import { formatLongDate, formatTime, greeting, toDayKey } from '../../lib/date';
import { Sheet } from '../../components/Sheet';
import { BiomarkerPicker } from '../../components/BiomarkerPicker';
import { EmptyState } from '../../components/EmptyState';
import { EntryValues } from '../../components/EntryValues';
import { Icon } from '../../components/Icon';
import { LogEntrySheet } from './LogEntrySheet';

type Dialog =
  | { kind: 'pick' }
  | { kind: 'log'; biomarker: Biomarker; entry?: Entry; planItemId?: ID; fromPicker?: boolean }
  | null;

const STATUS_LABEL: Record<DueStatus, string> = {
  done: 'Done',
  overdue: 'Overdue',
  due: 'Due now',
  upcoming: 'Later',
};

export function TodayView({ now }: { now: Date }) {
  const { data } = useStore();
  const [dialog, setDialog] = useState<Dialog>(null);

  const agenda = useMemo(() => agendaFor(data, now), [data, now]);
  const dayKey = toDayKey(now);
  const byId = useMemo(() => new Map(data.biomarkers.map((b) => [b.id, b])), [data.biomarkers]);
  const manual = useMemo(
    () =>
      data.entries
        .filter((e) => !e.planItemId && toDayKey(new Date(e.timestamp)) === dayKey && byId.has(e.biomarkerId))
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp)),
    [data.entries, dayKey, byId],
  );
  const done = agenda.filter((a) => a.status === 'done').length;

  return (
    <section className="view">
      <header className="view-header today-header">
        <div>
          <p className="muted">{greeting(now)}</p>
          <h1>{formatLongDate(now)}</h1>
        </div>
        <div className="clock" aria-label="Current time">
          {formatTime(now)}
        </div>
      </header>

      <button className="btn primary block" onClick={() => setDialog({ kind: 'pick' })}>
        <Icon name="plus" /> Add biomarker
      </button>

      <div className="section-title">
        <h2>From your plans</h2>
        {agenda.length > 0 && (
          <span className="muted small">
            {done} / {agenda.length} done
          </span>
        )}
      </div>
      {agenda.length > 0 && (
        <div className="progress" aria-hidden="true">
          <div style={{ width: `${(done / agenda.length) * 100}%` }} />
        </div>
      )}
      {agenda.length === 0 ? (
        <EmptyState title="Nothing scheduled today">Create a plan to have biomarkers show up here automatically.</EmptyState>
      ) : (
        <ul className="list">
          {agenda.map((a) => (
            <li key={a.item.id}>
              <button
                className={`card card-btn status-${a.status}`}
                onClick={() =>
                  setDialog({ kind: 'log', biomarker: a.biomarker, entry: a.entry, planItemId: a.item.id })
                }
              >
                <span className={`status-dot ${a.status}`}>
                  {a.status === 'done' && <Icon name="check" size={14} />}
                </span>
                <div className="card-main">
                  <strong>{a.biomarker.name}</strong>
                  <span className="muted small">
                    {a.item.time && (
                      <>
                        <Icon name="clock" size={13} /> {a.item.time} ·{' '}
                      </>
                    )}
                    {a.plan.name}
                  </span>
                  {a.entry && <EntryValues biomarker={a.biomarker} entry={a.entry} />}
                </div>
                <span className={`badge ${a.status}`}>{STATUS_LABEL[a.status]}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="section-title">
        <h2>Logged today</h2>
      </div>
      {manual.length === 0 ? (
        <EmptyState title="No extra entries yet">Use “Add biomarker” to log anything else.</EmptyState>
      ) : (
        <ul className="list">
          {manual.map((e) => {
            const b = byId.get(e.biomarkerId)!;
            return (
              <li key={e.id}>
                <button className="card card-btn" onClick={() => setDialog({ kind: 'log', biomarker: b, entry: e })}>
                  <div className="card-main">
                    <strong>{b.name}</strong>
                    <span className="muted small">{formatTime(new Date(e.timestamp))}</span>
                    <EntryValues biomarker={b} entry={e} />
                  </div>
                  <Icon name="chevron" />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {dialog?.kind === 'pick' && (
        <Sheet title="Add biomarker" onClose={() => setDialog(null)}>
          <BiomarkerPicker
            biomarkers={data.biomarkers}
            onPick={(b) => setDialog({ kind: 'log', biomarker: b, fromPicker: true })}
          />
        </Sheet>
      )}
      {dialog?.kind === 'log' && (
        <LogEntrySheet
          biomarker={dialog.biomarker}
          entry={dialog.entry}
          planItemId={dialog.planItemId}
          now={now}
          onClose={() => setDialog(null)}
          onBack={dialog.fromPicker ? () => setDialog({ kind: 'pick' }) : undefined}
        />
      )}
    </section>
  );
}
