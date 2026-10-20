import type { InfoKind, InfoType, InfoValue, Optimal, RangeValue } from './types';

export const KIND_LABELS: Record<InfoKind, string> = {
  number: 'Number',
  scale: 'Scale (slider)',
  range: 'Range (low – high)',
  color: 'Color',
  text: 'Text',
  time: 'Time of day',
  yesno: 'Yes / No',
};

export const isRange = (v: unknown): v is RangeValue =>
  typeof v === 'object' && v !== null && 'low' in v && 'high' in v;

/** Numeric kinds can be charted as a line. */
export const isNumericKind = (k: InfoKind) =>
  k === 'number' || k === 'scale' || k === 'range' || k === 'time' || k === 'yesno';

export function hasOptimal(o?: Optimal): boolean {
  if (!o) return false;
  return o.target !== undefined || o.min !== undefined || o.max !== undefined || !!o.color;
}

const fmtNum = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.?0+$/, ''));

/** Hours since midnight (may be ≥ 24 for overnight values) → "HH:MM". */
export function formatTime(hours: number): string {
  const total = Math.round((((hours % 24) + 24) % 24) * 60) % (24 * 60);
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** "HH:MM" → hours since midnight; overnight times before noon count as the next day (24+). */
export function parseTime(hhmm: string, overnight?: boolean): number | undefined {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm);
  if (!m) return undefined;
  const h = Number(m[1]) + Number(m[2]) / 60;
  return overnight && h < 12 ? h + 24 : h;
}

/** Name of a scale step when the info type has labels, e.g. 2 → "Medium". */
const stepLabel = (info: InfoType, v: number) => info.labels?.[Math.round(v - (info.min ?? 0))];

/** One number as it should read for this info type (no unit). */
function fmtFor(info: InfoType, n: number): string {
  if (info.kind === 'time') return formatTime(n);
  if (info.kind === 'yesno') return n >= 0.5 ? 'Yes' : 'No';
  if (info.kind === 'scale') return stepLabel(info, n) ?? fmtNum(n);
  return fmtNum(n);
}

export function formatValue(info: InfoType, value: InfoValue | undefined): string {
  if (value === undefined || value === '') return '—';
  const unit = info.unit ? ` ${info.unit}` : '';
  if (isRange(value)) return `${fmtNum(value.low)} – ${fmtNum(value.high)}${unit}`;
  if (typeof value === 'number') {
    if (info.kind === 'time' || info.kind === 'yesno' || (info.kind === 'scale' && stepLabel(info, value))) return fmtFor(info, value);
    return `${fmtNum(value)}${unit}`;
  }
  return value;
}

export function describeOptimal(info: InfoType): string | null {
  const o = info.optimal;
  if (!o || !hasOptimal(o)) return null;
  const unit = info.unit ? ` ${info.unit}` : '';
  if (info.kind === 'color') return o.color ? o.color.toUpperCase() : null;
  const f = (n: number) => fmtFor(info, n);
  const u = info.kind === 'time' || info.kind === 'yesno' ? '' : unit;
  if (o.target !== undefined) return `${f(o.target)}${u}`;
  if (o.min !== undefined && o.max !== undefined) return `${f(o.min)} – ${f(o.max)}${u}`;
  if (o.min !== undefined) return `≥ ${f(o.min)}${u}`;
  if (o.max !== undefined) return `≤ ${f(o.max)}${u}`;
  return null;
}

/** Initial value used when opening an empty log form. */
export function emptyValue(info: InfoType): InfoValue | undefined {
  switch (info.kind) {
    case 'scale': {
      const min = info.min ?? 1;
      const max = info.max ?? 10;
      return Math.round((min + max) / 2);
    }
    case 'color':
      return info.optimal?.color ?? '#888888';
    default:
      return undefined;
  }
}

export function isValueComplete(info: InfoType, v: InfoValue | undefined): boolean {
  if (v === undefined) return false;
  if (info.kind === 'range') return isRange(v) && Number.isFinite(v.low) && Number.isFinite(v.high);
  if (info.kind === 'text') return typeof v === 'string' && v.trim() !== '';
  if (info.kind === 'color') return typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v);
  return typeof v === 'number' && Number.isFinite(v);
}
