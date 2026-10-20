import type { InfoType, InfoValue } from './types';
import { hasOptimal, isRange } from './values';

/**
 * How close a value is to the optimal, from 0 (far) to 1 (spot on).
 * Returns null when the info type has no optimal or the value can't be scored.
 */
export function closeness(info: InfoType, value: InfoValue | undefined): number | null {
  const o = info.optimal;
  if (!o || !hasOptimal(o) || value === undefined) return null;

  if (info.kind === 'color') {
    if (!o.color || typeof value !== 'string') return null;
    return colorCloseness(value, o.color);
  }

  if (info.kind === 'range' && isRange(value)) {
    const a = numericCloseness(info, value.low);
    const b = numericCloseness(info, value.high);
    return a === null || b === null ? null : (a + b) / 2;
  }

  if (typeof value === 'number') return numericCloseness(info, value);
  return null;
}

function numericCloseness(info: InfoType, v: number): number | null {
  const o = info.optimal!;
  let deviation: number;
  let reference: number;

  if (o.min !== undefined || o.max !== undefined) {
    const lo = o.min ?? -Infinity;
    const hi = o.max ?? Infinity;
    if (v >= lo && v <= hi) return 1;
    const bound = v < lo ? lo : hi;
    deviation = Math.abs(v - bound);
    reference = Math.abs(bound);
  } else if (o.target !== undefined) {
    deviation = Math.abs(v - o.target);
    reference = Math.abs(o.target);
  } else {
    return null;
  }

  // On a slider the whole scale is the yardstick; otherwise a 50% miss scores 0.
  const scale =
    info.kind === 'scale' && info.min !== undefined && info.max !== undefined
      ? Math.max(1e-9, info.max - info.min)
      : Math.max(1, reference * 0.5);
  return clamp01(1 - deviation / scale);
}

function hexToRgb(hex: string): [number, number, number] | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function colorCloseness(a: string, b: string): number | null {
  const ra = hexToRgb(a);
  const rb = hexToRgb(b);
  if (!ra || !rb) return null;
  // Weighted ("redmean") RGB distance — cheap and roughly perceptual.
  const rm = (ra[0] + rb[0]) / 2;
  const dr = ra[0] - rb[0];
  const dg = ra[1] - rb[1];
  const db = ra[2] - rb[2];
  const dist = Math.sqrt((2 + rm / 256) * dr * dr + 4 * dg * dg + (2 + (255 - rm) / 256) * db * db);
  return clamp01(1 - dist / 300);
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
