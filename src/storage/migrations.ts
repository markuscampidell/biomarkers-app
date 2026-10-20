import { SCHEMA_VERSION, type AppData } from '../domain/types';

/**
 * Upgrades persisted data from older schema versions.
 * Add a step here whenever the shape of AppData changes, then bump SCHEMA_VERSION.
 */
export function migrate(raw: any): AppData | null {
  if (!raw || typeof raw !== 'object') return null;
  const data = { ...raw };
  const version: number = data.schemaVersion ?? 1;

  // Example for the future:
  // if (version < 2) { data.entries = data.entries.map(...); }

  if (version > SCHEMA_VERSION) {
    console.warn('Saved data is from a newer app version; loading as-is.');
  }

  return {
    schemaVersion: SCHEMA_VERSION,
    biomarkers: Array.isArray(data.biomarkers) ? data.biomarkers : [],
    plans: Array.isArray(data.plans) ? data.plans : [],
    entries: Array.isArray(data.entries) ? data.entries : [],
  };
}
