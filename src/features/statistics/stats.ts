import type { Biomarker, Entry, InfoType } from '../../domain/types';
import { closeness } from '../../domain/score';

export type Period = '7' | '30' | '90' | 'all';

export const PERIODS: { id: Period; label: string }[] = [
  { id: '7', label: '7 days' },
  { id: '30', label: '30 days' },
  { id: '90', label: '90 days' },
  { id: 'all', label: 'All' },
];

export function inPeriod(entries: Entry[], period: Period, now: Date): Entry[] {
  if (period === 'all') return entries;
  const from = now.getTime() - Number(period) * 86_400_000;
  return entries.filter((e) => new Date(e.timestamp).getTime() >= from);
}

/** Average closeness to optimal across all scorable values, or null. */
export function averageCloseness(biomarker: Biomarker, entries: Entry[], only?: InfoType): number | null {
  const scores: number[] = [];
  for (const e of entries) {
    for (const info of only ? [only] : biomarker.infoTypes) {
      const s = closeness(info, e.values[info.id]);
      if (s !== null) scores.push(s);
    }
  }
  return scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
}

export const pct = (n: number) => `${Math.round(n * 100)}%`;

/** Status token for a 0–1 score. */
export const scoreTone = (n: number) => (n >= 0.9 ? 'good' : n >= 0.7 ? 'warning' : 'critical');
