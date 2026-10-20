import { useState } from 'react';
import type { Biomarker, InfoType } from '../../domain/types';
import { useStore } from '../../state/AppStore';
import { Sheet } from '../../components/Sheet';
import { Icon } from '../../components/Icon';
import { newId } from '../../lib/id';
import { InfoTypeEditor } from './InfoTypeEditor';

const blankInfo = (label = ''): InfoType => ({ id: newId(), label, kind: 'number' });

export function BiomarkerEditorSheet({ biomarker, onClose }: { biomarker?: Biomarker; onClose: () => void }) {
  const { data, dispatch } = useStore();
  const [name, setName] = useState(biomarker?.name ?? '');
  const [description, setDescription] = useState(biomarker?.description ?? '');
  const [infoTypes, setInfoTypes] = useState<InfoType[]>(biomarker?.infoTypes ?? [blankInfo('Value')]);

  const entryCount = biomarker ? data.entries.filter((e) => e.biomarkerId === biomarker.id).length : 0;
  const valid = name.trim() !== '' && infoTypes.length > 0 && infoTypes.every((i) => i.label.trim() !== '');

  const save = () => {
    dispatch({
      type: 'biomarker/upsert',
      biomarker: {
        id: biomarker?.id ?? newId(),
        name: name.trim(),
        description: description.trim() || undefined,
        infoTypes: infoTypes.map((i) => ({ ...i, label: i.label.trim() })),
        createdAt: biomarker?.createdAt ?? new Date().toISOString(),
      },
    });
    onClose();
  };

  const remove = () => {
    if (!biomarker) return;
    const warn = entryCount > 0 ? ` This also deletes ${entryCount} logged entr${entryCount === 1 ? 'y' : 'ies'}.` : '';
    if (confirm(`Delete “${biomarker.name}”?${warn}`)) {
      dispatch({ type: 'biomarker/delete', id: biomarker.id });
      onClose();
    }
  };

  return (
    <Sheet
      title={biomarker ? 'Edit biomarker' : 'New biomarker'}
      onClose={onClose}
      footer={
        <>
          {biomarker && (
            <button className="btn ghost danger" onClick={remove}>
              Delete
            </button>
          )}
          <button className="btn primary grow" disabled={!valid} onClick={save}>
            Save
          </button>
        </>
      }
    >
      <div className="field">
        <div className="field-label">
          <span>Name</span>
        </div>
        <input autoFocus={!biomarker} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Vitamin D" />
      </div>
      <div className="field">
        <div className="field-label">
          <span>Description</span>
          <span className="muted small">optional</span>
        </div>
        <input value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>

      <div className="section-title">
        <h3>What to record</h3>
      </div>
      <ul className="list">
        {infoTypes.map((info) => (
          <InfoTypeEditor
            key={info.id}
            info={info}
            onChange={(next) => setInfoTypes((prev) => prev.map((i) => (i.id === info.id ? next : i)))}
            onRemove={infoTypes.length > 1 ? () => setInfoTypes((prev) => prev.filter((i) => i.id !== info.id)) : undefined}
          />
        ))}
      </ul>
      <button className="btn ghost block" onClick={() => setInfoTypes((prev) => [...prev, blankInfo()])}>
        <Icon name="plus" size={18} /> Add info type
      </button>
    </Sheet>
  );
}
