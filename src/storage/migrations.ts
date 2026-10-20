import { SCHEMA_VERSION, type AppData, type Biomarker } from '../domain/types';
import { PRESETS, fromPreset } from '../domain/presets';

/**
 * Upgrades persisted data from older schema versions.
 * Add a step here whenever the shape of AppData changes, then bump SCHEMA_VERSION.
 */
export function migrate(raw: any): AppData | null {
  if (!raw || typeof raw !== 'object') return null;
  let data: AppData = {
    schemaVersion: raw.schemaVersion ?? 1,
    biomarkers: Array.isArray(raw.biomarkers) ? raw.biomarkers : [],
    plans: Array.isArray(raw.plans) ? raw.plans : [],
    entries: Array.isArray(raw.entries) ? raw.entries : [],
  };

  if (data.schemaVersion < 2) data = toV2(data);

  if (data.schemaVersion > SCHEMA_VERSION) {
    console.warn('Saved data is from a newer app version; loading as-is.');
  }
  return { ...data, schemaVersion: SCHEMA_VERSION };
}

/** Old v1 starter biomarkers that were split up or renamed in v2, and the section they belong to. */
const V1_LEGACY: Record<string, string> = { sleep: 'Sleep', hydration: 'Hydration & Digestion' };

/**
 * v2: biomarkers get sections and the large preset catalogue is added.
 * Starter biomarkers that were never used are swapped for their new versions; anything with
 * logged entries or in a plan is kept as it is (just filed into its section), so no history is lost.
 */
function toV2(data: AppData): AppData {
  const key = (s: string) => s.trim().toLowerCase();
  const presetByName = new Map(PRESETS.map((p) => [key(p.name), p]));
  const used = new Set<string>([
    ...data.entries.map((e) => e.biomarkerId),
    ...data.plans.flatMap((p) => p.items.map((i) => i.biomarkerId)),
  ]);

  const kept: Biomarker[] = [];
  for (const b of data.biomarkers) {
    const preset = presetByName.get(key(b.name));
    const legacy = V1_LEGACY[key(b.name)];
    if (!preset && !legacy) {
      kept.push(b); // the user's own biomarker
    } else if (used.has(b.id)) {
      kept.push({ ...b, category: b.category ?? preset?.category ?? legacy });
    }
    // else: unused starter → replaced by the preset below (or dropped if it was split up)
  }

  const have = new Set(kept.map((b) => key(b.name)));
  const added = PRESETS.filter((p) => !have.has(key(p.name))).map(fromPreset);
  return { ...data, schemaVersion: 2, biomarkers: [...kept, ...added] };
}
