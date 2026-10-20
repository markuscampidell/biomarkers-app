import { useMemo, useState } from 'react';
import type { Plan } from '../../domain/types';
import { describeSchedule, isScheduledOn } from '../../domain/schedule';
import { useStore } from '../../state/AppStore';
import { EmptyState } from '../../components/EmptyState';
import { Icon } from '../../components/Icon';
import { PlanEditorSheet } from './PlanEditorSheet';

export function PlansView({ now }: { now: Date }) {
  const { data, dispatch } = useStore();
  const [editing, setEditing] = useState<Plan | 'new' | null>(null);
  const byId = useMemo(() => new Map(data.biomarkers.map((b) => [b.id, b])), [data.biomarkers]);

  return (
    <section className="view">
      <header className="view-header">
        <h1>Plans</h1>
        <button className="btn primary" onClick={() => setEditing('new')}>
          <Icon name="plus" /> New plan
        </button>
      </header>

      {data.plans.length === 0 ? (
        <EmptyState title="No plans yet">
          A plan is a named list of biomarkers with a schedule — e.g. weight every morning, blood pressure every Monday.
        </EmptyState>
      ) : (
        <ul className="list">
          {data.plans.map((plan) => {
            const dueToday = plan.items.filter((i) => isScheduledOn(i.schedule, now)).length;
            return (
              <li key={plan.id} className={`card plan-card ${plan.active ? '' : 'inactive'}`}>
                <div className="plan-card-head">
                  <button className="plan-title" onClick={() => setEditing(plan)}>
                    <strong>{plan.name}</strong>
                    <span className="muted small">
                      {plan.items.length} biomarker{plan.items.length === 1 ? '' : 's'}
                      {plan.active && dueToday > 0 && ` · ${dueToday} today`}
                    </span>
                  </button>
                  <input
                    type="checkbox"
                    className="switch"
                    aria-label={`${plan.name} active`}
                    checked={plan.active}
                    onChange={(e) => dispatch({ type: 'plan/upsert', plan: { ...plan, active: e.target.checked } })}
                  />
                </div>
                <ul className="plan-lines" onClick={() => setEditing(plan)}>
                  {plan.items.map((i) => (
                    <li key={i.id}>
                      <span>{byId.get(i.biomarkerId)?.name ?? 'Deleted biomarker'}</span>
                      <span className="muted small">
                        {describeSchedule(i.schedule)}
                        {i.time && ` · ${i.time}`}
                      </span>
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ul>
      )}

      {editing && (
        <PlanEditorSheet plan={editing === 'new' ? undefined : editing} now={now} onClose={() => setEditing(null)} />
      )}
    </section>
  );
}
