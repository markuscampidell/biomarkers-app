import type { InfoType, InfoValue } from '../domain/types';
import { describeOptimal, formatTime, formatValue, isRange, parseTime } from '../domain/values';

interface Props {
  info: InfoType;
  value: InfoValue | undefined;
  onChange: (v: InfoValue | undefined) => void;
}

const parseNum = (s: string) => (s.trim() === '' ? NaN : Number(s.replace(',', '.')));
const numStr = (n: number | undefined) => (n === undefined || Number.isNaN(n) ? '' : String(n));

/** Renders the right input control for an info type's kind. */
export function ValueInput({ info, value, onChange }: Props) {
  const optimal = describeOptimal(info);
  const unit = info.unit && <span className="unit">{info.unit}</span>;

  let control;
  switch (info.kind) {
    case 'number':
      control = (
        <div className="input-row">
          <input
            type="number"
            inputMode="decimal"
            step="any"
            value={typeof value === 'number' ? numStr(value) : ''}
            onChange={(e) => {
              const n = parseNum(e.target.value);
              onChange(Number.isNaN(n) ? undefined : n);
            }}
          />
          {unit}
        </div>
      );
      break;
    case 'scale': {
      const min = info.min ?? 1;
      const max = info.max ?? 10;
      const v = typeof value === 'number' ? value : min;
      control = (
        <div className="input-row">
          <input
            type="range"
            min={min}
            max={max}
            step={info.step ?? 1}
            value={v}
            onChange={(e) => onChange(Number(e.target.value))}
          />
          <span className={`scale-value${info.labels ? ' wide' : ''}`}>{formatValue({ ...info, unit: undefined }, v)}</span>
          {unit}
        </div>
      );
      break;
    }
    case 'range': {
      const r = isRange(value) ? value : { low: NaN, high: NaN };
      const set = (k: 'low' | 'high', s: string) => onChange({ ...r, [k]: parseNum(s) });
      control = (
        <div className="input-row">
          <input
            type="number"
            inputMode="decimal"
            step="any"
            placeholder="low"
            value={numStr(r.low)}
            onChange={(e) => set('low', e.target.value)}
          />
          <span className="muted">–</span>
          <input
            type="number"
            inputMode="decimal"
            step="any"
            placeholder="high"
            value={numStr(r.high)}
            onChange={(e) => set('high', e.target.value)}
          />
          {unit}
        </div>
      );
      break;
    }
    case 'color':
      control = (
        <div className="input-row">
          <input
            type="color"
            value={typeof value === 'string' ? value : '#888888'}
            onChange={(e) => onChange(e.target.value)}
          />
          <span className="muted mono">{typeof value === 'string' ? value.toUpperCase() : ''}</span>
          {info.optimal?.color && (
            <button type="button" className="link" onClick={() => onChange(info.optimal!.color)}>
              Use optimal
            </button>
          )}
        </div>
      );
      break;
    case 'time':
      control = (
        <div className="input-row">
          <input
            type="time"
            value={typeof value === 'number' ? formatTime(value) : ''}
            onChange={(e) => onChange(parseTime(e.target.value, info.overnight))}
          />
        </div>
      );
      break;
    case 'yesno':
      control = (
        <div className="segmented" role="group" aria-label={info.label}>
          {[
            { v: 1, label: 'Yes' },
            { v: 0, label: 'No' },
          ].map((o) => (
            <button
              key={o.v}
              type="button"
              className={value === o.v ? 'on' : ''}
              aria-pressed={value === o.v}
              onClick={() => onChange(o.v)}
            >
              {o.label}
            </button>
          ))}
        </div>
      );
      break;
    case 'text':
      control = (
        <textarea rows={3} value={typeof value === 'string' ? value : ''} onChange={(e) => onChange(e.target.value)} />
      );
      break;
  }

  return (
    <div className="field">
      <div className="field-label">
        <span>{info.label}</span>
        {optimal && (
          <span className="muted small">
            optimal{' '}
            {info.kind === 'color' && <span className="swatch" style={{ background: info.optimal!.color }} />}
            {info.kind !== 'color' && optimal}
          </span>
        )}
      </div>
      {control}
    </div>
  );
}
