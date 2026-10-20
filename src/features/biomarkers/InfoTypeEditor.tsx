import { useState } from 'react';
import type { InfoKind, InfoType, Optimal } from '../../domain/types';
import { KIND_LABELS } from '../../domain/values';
import { Icon } from '../../components/Icon';

type OptimalMode = 'none' | 'target' | 'band';

const optimalMode = (o?: Optimal): OptimalMode =>
  o?.target !== undefined ? 'target' : o?.min !== undefined || o?.max !== undefined ? 'band' : 'none';

const num = (s: string) => (s.trim() === '' ? undefined : Number(s.replace(',', '.')));
const str = (n?: number) => (n === undefined || Number.isNaN(n) ? '' : String(n));

interface Props {
  info: InfoType;
  onChange: (info: InfoType) => void;
  onRemove?: () => void;
}

export function InfoTypeEditor({ info, onChange, onRemove }: Props) {
  const set = (patch: Partial<InfoType>) => onChange({ ...info, ...patch });
  const setOpt = (patch: Partial<Optimal>) => set({ optimal: { ...info.optimal, ...patch } });

  const changeKind = (kind: InfoKind) => {
    const next: InfoType = { id: info.id, label: info.label, kind };
    if (kind !== 'color' && kind !== 'text') next.unit = info.unit;
    if (kind === 'scale') Object.assign(next, { min: 1, max: 10, step: 1 });
    setMode('none');
    onChange(next);
  };

  const [mode, setMode] = useState<OptimalMode>(() => optimalMode(info.optimal));
  const hasUnit = info.kind === 'number' || info.kind === 'scale' || info.kind === 'range';

  return (
    <li className="card info-editor">
      <div className="input-row">
        <input
          className="grow"
          placeholder="Label, e.g. Systolic"
          value={info.label}
          onChange={(e) => set({ label: e.target.value })}
          aria-label="Label"
        />
        {onRemove && (
          <button className="icon-btn" onClick={onRemove} aria-label="Remove info type">
            <Icon name="trash" size={18} />
          </button>
        )}
      </div>

      <div className="grid-2">
        <label className="field compact">
          <span className="field-label">Type</span>
          <select value={info.kind} onChange={(e) => changeKind(e.target.value as InfoKind)}>
            {(Object.keys(KIND_LABELS) as InfoKind[]).map((k) => (
              <option key={k} value={k}>
                {KIND_LABELS[k]}
              </option>
            ))}
          </select>
        </label>
        {hasUnit && (
          <label className="field compact">
            <span className="field-label">Unit / variable</span>
            <input placeholder="kg, mg/dL, hours…" value={info.unit ?? ''} onChange={(e) => set({ unit: e.target.value || undefined })} />
          </label>
        )}
      </div>

      {info.kind === 'scale' && (
        <div className="grid-3">
          <label className="field compact">
            <span className="field-label">Min</span>
            <input type="number" value={str(info.min)} onChange={(e) => set({ min: num(e.target.value) })} />
          </label>
          <label className="field compact">
            <span className="field-label">Max</span>
            <input type="number" value={str(info.max)} onChange={(e) => set({ max: num(e.target.value) })} />
          </label>
          <label className="field compact">
            <span className="field-label">Step</span>
            <input type="number" value={str(info.step)} onChange={(e) => set({ step: num(e.target.value) })} />
          </label>
        </div>
      )}

      {(info.kind === 'number' || info.kind === 'scale') && (
        <div className="field compact">
          <span className="field-label">Optimal</span>
          <div className="segmented">
            {(['none', 'target', 'band'] as OptimalMode[]).map((m) => (
              <button
                key={m}
                type="button"
                className={mode === m ? 'on' : ''}
                onClick={() => {
                  setMode(m);
                  set({
                    optimal:
                      m === 'none' ? undefined : m === 'target' ? { target: info.optimal?.target } : { min: info.optimal?.min, max: info.optimal?.max },
                  });
                }}
              >
                {m === 'none' ? 'None' : m === 'target' ? 'Exact value' : 'Between'}
              </button>
            ))}
          </div>
          {mode === 'target' && (
            <input type="number" step="any" value={str(info.optimal?.target)} onChange={(e) => setOpt({ target: num(e.target.value) })} />
          )}
          {mode === 'band' && <BandInputs info={info} setOpt={setOpt} />}
        </div>
      )}

      {info.kind === 'range' && (
        <div className="field compact">
          <span className="field-label">Optimal band (optional)</span>
          <BandInputs info={info} setOpt={setOpt} />
        </div>
      )}

      {info.kind === 'color' && (
        <label className="toggle-row">
          <span>Optimal color</span>
          <span className="input-row">
            {info.optimal?.color && (
              <input type="color" value={info.optimal.color} onChange={(e) => setOpt({ color: e.target.value })} />
            )}
            <input
              type="checkbox"
              className="switch"
              checked={!!info.optimal?.color}
              onChange={(e) => set({ optimal: e.target.checked ? { color: '#7fbf7f' } : undefined })}
            />
          </span>
        </label>
      )}
    </li>
  );
}

function BandInputs({ info, setOpt }: { info: InfoType; setOpt: (p: Partial<Optimal>) => void }) {
  return (
    <div className="input-row">
      <input type="number" step="any" placeholder="min" value={str(info.optimal?.min)} onChange={(e) => setOpt({ min: num(e.target.value) })} />
      <span className="muted">–</span>
      <input type="number" step="any" placeholder="max" value={str(info.optimal?.max)} onChange={(e) => setOpt({ max: num(e.target.value) })} />
      {info.unit && <span className="unit">{info.unit}</span>}
    </div>
  );
}
