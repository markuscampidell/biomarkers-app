/**
 * Core domain model. Everything persisted by the app is described here,
 * so a future backend / native wrapper only needs to speak these types.
 */

export type ID = string;

/** ISO date without time, e.g. "2026-10-10" (local calendar day). */
export type DayKey = string;

/** "HH:MM" in 24h local time. */
export type TimeOfDay = string;

/**
 * - time: a clock time, stored as hours since midnight (23.5 = 23:30).
 * - yesno: stored as 1 (yes) or 0 (no).
 */
export type InfoKind = 'number' | 'scale' | 'range' | 'color' | 'text' | 'time' | 'yesno';

/** What "good" looks like for an info type. All fields optional. */
export interface Optimal {
  /** Exact target number (number / scale). */
  target?: number;
  /** Acceptable band (number / scale / range). */
  min?: number;
  max?: number;
  /** Target color as hex (color). */
  color?: string;
}

/** One measurable field of a biomarker, e.g. "Systolic" in mmHg. */
export interface InfoType {
  id: ID;
  label: string;
  kind: InfoKind;
  /** Free text unit / variable name, e.g. "kg", "mg/dL", "hours". */
  unit?: string;
  /** Bounds for `scale` (slider). */
  min?: number;
  max?: number;
  step?: number;
  /** Optional names for each step of a `scale`, from min upwards (e.g. None, Light, Medium, Heavy). */
  labels?: string[];
  /**
   * For `time`: the value usually falls around midnight (e.g. bedtime). Times before noon are then
   * stored as 24+ hours so 23:30 → 00:30 charts as a small step, not a jump.
   */
  overnight?: boolean;
  optimal?: Optimal;
}

export interface Biomarker {
  id: ID;
  name: string;
  description?: string;
  /** Section the biomarker is listed under, e.g. "Sleep". */
  category?: string;
  infoTypes: InfoType[];
  createdAt: string;
}

export interface RangeValue {
  low: number;
  high: number;
}

export type InfoValue = number | string | RangeValue;

/** A single logged measurement of a biomarker. */
export interface Entry {
  id: ID;
  biomarkerId: ID;
  /** Full local timestamp (ISO string). */
  timestamp: string;
  values: Record<ID, InfoValue>;
  note?: string;
  /** Set when the entry fulfils a scheduled plan item. */
  planItemId?: ID;
}

export type Schedule =
  | { type: 'daily' }
  | { type: 'interval'; everyDays: number; startDate: DayKey }
  | { type: 'weekly'; weekdays: number[] } // 0 = Sunday … 6 = Saturday
  | { type: 'monthly'; dayOfMonth: number }
  | { type: 'once'; date: DayKey };

export interface PlanItem {
  id: ID;
  biomarkerId: ID;
  schedule: Schedule;
  /** Optional time of day the biomarker is due. */
  time?: TimeOfDay;
}

export interface Plan {
  id: ID;
  name: string;
  active: boolean;
  items: PlanItem[];
  createdAt: string;
}

export interface AppData {
  schemaVersion: number;
  biomarkers: Biomarker[];
  plans: Plan[];
  entries: Entry[];
}

export const SCHEMA_VERSION = 5;
