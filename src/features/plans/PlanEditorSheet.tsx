import { useMemo, useState } from 'react';
import type { ID, Plan, PlanItem } from '../../domain/types';
import { useStore } from '../../state/AppStore';
import { Sheet } from '../../components/Sheet';
import { BiomarkerPicker } from '../../components/BiomarkerPicker';
import { Icon } from '../../components/Icon';
import { newId } from '../../lib/id';
import { ScheduleEditor } from './ScheduleEditor';

interface Props {
  plan?: Plan;
  now: Date;
  onClose: () => void;
}

export function PlanEditorSheet({ plan, now, onClose }: Props) {
  const { data, dispatch } = useStore();
  const [name, setName] = useState(plan?.name ?? '');
  const [active, setActive] = useState(plan?.active ?? true);
  const [items, setItems] = useState<PlanItem[]>(plan?.items ?? []);
  // A new plan starts by choosing biomarkers.
  const [picking, setPicking] = useState(!plan);
  const [selection, setSelection] = useState<Set<ID>>(() => new Set(items.map((i) => i.biomarkerId)));

  const byId = useMemo(() => new Map(data.biomarkers.map((b) => [b.id, b])), [data.biomarkers]);

  const applySelection = () => {
    setItems((prev) => {
      const kept = prev.filter((i) => selection.has(i.biomarkerId));
      const existing = new Set(kept.map((i) => i.biomarkerId));
      const added = [...selection]
        .filter((id) => !existing.has(id))
        .map((biomarkerId): PlanItem => ({ id: newId(), biomarkerId, schedule: { type: 'daily' } }));
      return [...kept, ...added];
    });
    setPicking(false);
  };

  const updateItem = (id: ID, patch: Partial<PlanItem>) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  const save = () => {
    dispatch({
      type: 'plan/upsert',
      plan: {
        id: plan?.id ?? newId(),
        name: name.trim(),
        active,
        items,
        createdAt: plan?.createdAt ?? new Date().toISOString(),
      },
    });
    onClose();
  };

  const remove = () => {
    if (plan && confirm(`Delete plan “${plan.name}”? Logged entries are kept.`)) {
      dispatch({ type: 'plan/delete', id: plan.id });
      onClose();
    }
  };

  if (picking) {
    return (
      <Sheet
        title="Choose biomarkers"
        onClose={onClose}
        leading={
          (plan || items.length > 0) && (
            <button className="icon-btn" onClick={() => setPicking(false)} aria-label="Back">
              <Icon name="back" />
            </button>
          )
        }
        footer={
          <button className="btn primary grow" disabled={selection.size === 0} onClick={applySelection}>
            Continue with {selection.size} selected
          </button>
        }
      >
        <BiomarkerPicker
          biomarkers={data.biomarkers}
          selected={selection}
          onToggle={(b) =>
            setSelection((prev) => {
              const next = new Set(prev);
              if (next.has(b.id)) next.delete(b.id);
              else next.add(b.id);
              return next;
            })
          }
        />
      </Sheet>
    );
  }

  return (
    <Sheet
      title={plan ? 'Edit plan' : 'New plan'}
      onClose={onClose}
      footer={
        <>
          {plan && (
            <button className="btn ghost danger" onClick={remove}>
              Delete
            </button>
          )}
          <button className="btn primary grow" disabled={!name.trim() || items.length === 0} onClick={save}>
            Save plan
          </button>
        </>
      }
    >
      <div className="field">
        <div className="field-label">
          <span>Name</span>
        </div>
        <input autoComplete="off" autoFocus={!plan} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Morning routine" />
      </div>

      <label className="toggle-row">
        <span>Active</span>
        <input type="checkbox" className="switch" checked={active} onChange={(e) => setActive(e.target.checked)} />
      </label>

      <div className="section-title">
        <h3>Biomarkers</h3>
        <button
          className="btn ghost small"
          onClick={() => {
            setSelection(new Set(items.map((i) => i.biomarkerId)));
            setPicking(true);
          }}
        >
          <Icon name="plus" size={16} /> Add / remove
        </button>
      </div>

      <ul className="list">
        {items.map((item) => {
          const b = byId.get(item.biomarkerId);
          if (!b) return null;
          return (
            <li key={item.id} className="card plan-item">
              <div className="plan-item-head">
                <strong>{b.name}</strong>
                <button
                  className="icon-btn"
                  aria-label={`Remove ${b.name}`}
                  onClick={() => setItems((prev) => prev.filter((i) => i.id !== item.id))}
                >
                  <Icon name="trash" size={18} />
                </button>
              </div>
              <ScheduleEditor value={item.schedule} today={now} onChange={(schedule) => updateItem(item.id, { schedule })} />
              <div className="input-row">
                <span className="muted">At</span>
                <input
                  type="time"
                  value={item.time ?? ''}
                  onChange={(e) => updateItem(item.id, { time: e.target.value || undefined })}
                />
                {item.time ? (
                  <button className="link" onClick={() => updateItem(item.id, { time: undefined })}>
                    Any time
                  </button>
                ) : (
                  <span className="muted small">any time of day</span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </Sheet>
  );
}
