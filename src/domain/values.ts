import type { InfoKind, InfoType, InfoValue, Optimal, RangeValue } from './types';

export const KIND_LABELS: Record<InfoKind, string> = {
  number: 'Number',
  scale: 'Scale (slider)',
  range: 'Range (low – high)',
  color: 'Color',
  text: 'Text',
};

export const isRange = (v: unknown): v is RangeValue =>
  typeof v === 'object' && v !== null && 'low' in v && 'high' in v;

/** Numeric kinds can be charted as a line. */
export const isNumericKind = (k: InfoKind) => k === 'number' || k === 'scale' || k === 'range';

export function hasOptimal(o?: Optimal): boolean {
  if (!o) return false;
  return o.target !== undefined || o.min !== undefined || o.max !== undefined || !!o.color;
}

const fmtNum = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.?0+$/, ''));

export function formatValue(info: InfoType, value: InfoValue | undefined): string {
  if (value === undefined || value === '') return '—';
  const unit = info.unit ? ` ${info.unit}` : '';
  if (isRange(value)) return `${fmtNum(value.low)} – ${fmtNum(value.high)}${unit}`;
  if (typeof value === 'number') return `${fmtNum(value)}${unit}`;
  return value;
}

export function describeOptimal(info: InfoType): string | null {
  const o = info.optimal;
  if (!o || !hasOptimal(o)) return null;
  const unit = info.unit ? ` ${info.unit}` : '';
  if (info.kind === 'color') return o.color ? o.color.toUpperCase() : null;
  if (o.target !== undefined) return `${fmtNum(o.target)}${unit}`;
  if (o.min !== undefined && o.max !== undefined) return `${fmtNum(o.min)} – ${fmtNum(o.max)}${unit}`;
  if (o.min !== undefined) return `≥ ${fmtNum(o.min)}${unit}`;
  if (o.max !== undefined) return `≤ ${fmtNum(o.max)}${unit}`;
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
