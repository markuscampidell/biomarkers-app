import { useState } from 'react';
import type { Biomarker, Entry, ID, InfoValue } from '../../domain/types';
import { emptyValue, isValueComplete } from '../../domain/values';
import { Sheet } from '../../components/Sheet';
import { ValueInput } from '../../components/ValueInput';
import { Icon } from '../../components/Icon';
import { useStore } from '../../state/AppStore';
import { newId } from '../../lib/id';
import { toLocalInput } from '../../lib/date';

interface Props {
  biomarker: Biomarker;
  /** Editing an existing entry. */
  entry?: Entry;
  /** Logging a scheduled plan item. */
  planItemId?: ID;
  now: Date;
  onClose: () => void;
  onBack?: () => void;
}

/** Form for recording (or editing) the values of a biomarker. */
export function LogEntrySheet({ biomarker, entry, planItemId, now, onClose, onBack }: Props) {
  const { dispatch } = useStore();
  const [values, setValues] = useState<Record<ID, InfoValue | undefined>>(() => {
    const init: Record<ID, InfoValue | undefined> = {};
    for (const i of biomarker.infoTypes) init[i.id] = entry?.values[i.id] ?? emptyValue(i);
    return init;
  });
  const [when, setWhen] = useState(() => toLocalInput(entry ? new Date(entry.timestamp) : now));
  const [note, setNote] = useState(entry?.note ?? '');

  const complete = biomarker.infoTypes.filter((i) => isValueComplete(i, values[i.id]));
  const canSave = complete.length > 0 && when !== '';

  const save = () => {
    const stored: Record<ID, InfoValue> = {};
    for (const i of complete) stored[i.id] = values[i.id]!;
    dispatch({
      type: 'entry/upsert',
      entry: {
        id: entry?.id ?? newId(),
        biomarkerId: biomarker.id,
        timestamp: new Date(when).toISOString(),
        values: stored,
        note: note.trim() || undefined,
        planItemId: entry?.planItemId ?? planItemId,
      },
    });
    onClose();
  };

  const remove = () => {
    if (entry && confirm('Delete this entry?')) {
      dispatch({ type: 'entry/delete', id: entry.id });
      onClose();
    }
  };

  return (
    <Sheet
      title={biomarker.name}
      onClose={onClose}
      leading={
        onBack && (
          <button className="icon-btn" onClick={onBack} aria-label="Back">
            <Icon name="back" />
          </button>
        )
      }
      footer={
        <>
          {entry && (
            <button className="btn ghost danger" onClick={remove}>
              Delete
            </button>
          )}
          <button className="btn primary grow" disabled={!canSave} onClick={save}>
            {entry ? 'Save changes' : 'Save'}
          </button>
        </>
      }
    >
      {biomarker.infoTypes.map((i) => (
        <ValueInput
          key={i.id}
          info={i}
          value={values[i.id]}
          onChange={(v) => setValues((prev) => ({ ...prev, [i.id]: v }))}
        />
      ))}
      <div className="field">
        <div className="field-label">
          <span>Time</span>
        </div>
        <input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} />
      </div>
      <div className="field">
        <div className="field-label">
          <span>Note</span>
          <span className="muted small">optional</span>
        </div>
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Anything worth remembering" />
      </div>
    </Sheet>
  );
}
