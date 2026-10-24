import { SCHEMA_VERSION, type AppData, type Biomarker } from '../domain/types';
import { PRESETS, REMOVED_PRESET_NAMES, fromPreset } from '../domain/presets';

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
  if (data.schemaVersion < 3) data = toV3(data);

  if (data.schemaVersion > SCHEMA_VERSION) {
    console.warn('Saved data is from a newer app version; loading as-is.');
  }
  return { ...data, schemaVersion: SCHEMA_VERSION };
}

const key = (s: string) => s.trim().toLowerCase();

const usedIds = (data: AppData) =>
  new Set<string>([
    ...data.entries.map((e) => e.biomarkerId),
    ...data.plans.flatMap((p) => p.items.map((i) => i.biomarkerId)),
  ]);

/** Old v1 starter biomarkers that were split up or renamed in v2, and the section they belong to. */
const V1_LEGACY: Record<string, string> = { sleep: 'Sleep', hydration: 'Hydration' };

/**
 * v2: biomarkers get sections and the large preset catalogue is added.
 * Starter biomarkers that were never used are swapped for their new versions; anything with
 * logged entries or in a plan is kept as it is (just filed into its section), so no history is lost.
 */
function toV2(data: AppData): AppData {
  const presetByName = new Map(PRESETS.map((p) => [key(p.name), p]));
  const used = usedIds(data);

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

/**
 * v3: the starter catalogue is reduced to real biomarkers. Starter entries that are not biomarkers
 * (mood, calories, bedtime, …) are removed if they were never used; used ones stay with their history.
 * "Hydration & Digestion" is renamed to "Hydration".
 */
function toV3(data: AppData): AppData {
  const used = usedIds(data);
  const removed = new Set(REMOVED_PRESET_NAMES.map(key));
  const biomarkers = data.biomarkers
    .filter((b) => used.has(b.id) || !removed.has(key(b.name)))
    .map((b) =>
      b.category === 'Hydration & Digestion' && !removed.has(key(b.name)) ? { ...b, category: 'Hydration' } : b,
    );
  return { ...data, schemaVersion: 3, biomarkers };
}
