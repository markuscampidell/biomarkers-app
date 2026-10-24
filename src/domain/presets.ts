import type { Biomarker, InfoType } from './types';
import { newId } from '../lib/id';

type InfoSeed = Omit<InfoType, 'id'>;

export interface PresetSeed {
  name: string;
  category: string;
  description?: string;
  infoTypes: InfoSeed[];
}

/** Sections in display order. Biomarkers in other (user-made) sections are listed after these. */
export const CATEGORIES = [
  'Sleep',
  'Heart & Circulation',
  'Blood',
  'Body',
  'Hydration',
  "Women's health",
] as const;

export const OTHER_CATEGORY = 'Other';

// Small helpers so each preset reads as one line.
const num = (unit: string, optimal?: InfoSeed['optimal'], label = 'Value'): InfoSeed => ({ label, kind: 'number', unit, optimal });

// General adult reference ranges, used only to colour how close a value is. Ranges that depend
// strongly on sex or age (ferritin, hemoglobin, testosterone, …) are left without an optimal.
const REF = 'Typical adult reference range — your doctor or lab may use a different one.';

const S = 'Sleep';
const H = 'Heart & Circulation';
const B = 'Blood';
const BO = 'Body';
const D = 'Hydration';
const F = "Women's health";

/**
 * Only real biomarkers: objectively measurable characteristics of the body that indicate a normal
 * biological process, a disease process or a response to an intervention (NIH/FDA BEST definition).
 * Subjective ratings (mood, pain, …), behaviours (bedtime, meditation, …) and intake (calories,
 * water, …) are not biomarkers and are deliberately not in this list.
 */
export const PRESETS: PresetSeed[] = [
  // Sleep
  { category: S, name: 'Sleep duration', infoTypes: [num('h', { min: 7, max: 9 }, 'Duration')] },
  { category: S, name: 'Time to fall asleep', infoTypes: [num('min', { max: 20 }, 'Minutes')] },
  { category: S, name: 'Deep sleep', infoTypes: [num('min', undefined, 'Minutes')] },
  { category: S, name: 'REM sleep', infoTypes: [num('min', undefined, 'Minutes')] },

  // Heart & Circulation
  { category: H, name: 'Resting heart rate', infoTypes: [num('bpm', { min: 50, max: 70 }, 'Heart rate')] },
  {
    category: H,
    name: 'Blood pressure',
    infoTypes: [num('mmHg', { min: 90, max: 120 }, 'Systolic'), num('mmHg', { min: 60, max: 80 }, 'Diastolic')],
  },
  { category: H, name: 'Heart rate variability (HRV)', infoTypes: [num('ms', undefined, 'HRV')] },
  { category: H, name: 'Max heart rate during exercise', infoTypes: [num('bpm', undefined, 'Heart rate')] },
  { category: H, name: 'Blood oxygen (SpO₂)', infoTypes: [num('%', { min: 95, max: 100 }, 'SpO₂')] },
  {
    category: H,
    name: 'Heart rate recovery',
    description: 'How much your heart rate drops in the first minute after exercise.',
    infoTypes: [num('bpm', { min: 12 }, 'Drop after 1 min')],
  },
  { category: H, name: 'VO₂ max', infoTypes: [num('ml/kg/min', undefined, 'VO₂ max')] },

  // Blood (lab values)
  { category: B, name: 'Blood glucose', description: REF, infoTypes: [num('mg/dL', { min: 70, max: 140 }, 'Glucose')] },
  { category: B, name: 'Fasting glucose', description: REF, infoTypes: [num('mg/dL', { min: 70, max: 99 }, 'Glucose')] },
  { category: B, name: 'HbA1c', description: REF, infoTypes: [num('%', { max: 5.6 }, 'HbA1c')] },
  { category: B, name: 'Total cholesterol', description: REF, infoTypes: [num('mg/dL', { max: 200 }, 'Cholesterol')] },
  { category: B, name: 'LDL cholesterol', description: REF, infoTypes: [num('mg/dL', { max: 100 }, 'LDL')] },
  { category: B, name: 'HDL cholesterol', description: REF, infoTypes: [num('mg/dL', { min: 40 }, 'HDL')] },
  { category: B, name: 'Triglycerides', description: REF, infoTypes: [num('mg/dL', { max: 150 }, 'Triglycerides')] },
  { category: B, name: 'Ferritin', infoTypes: [num('ng/mL', undefined, 'Ferritin')] },
  { category: B, name: 'Iron', description: REF, infoTypes: [num('µg/dL', { min: 60, max: 170 }, 'Iron')] },
  { category: B, name: 'Hemoglobin', infoTypes: [num('g/dL', undefined, 'Hemoglobin')] },
  { category: B, name: 'Vitamin D', description: REF, infoTypes: [num('ng/mL', { min: 30, max: 100 }, '25-OH vitamin D')] },
  { category: B, name: 'Vitamin B12', description: REF, infoTypes: [num('pg/mL', { min: 200, max: 900 }, 'B12')] },
  { category: B, name: 'Folate', description: REF, infoTypes: [num('ng/mL', { min: 3 }, 'Folate')] },
  { category: B, name: 'Magnesium', description: REF, infoTypes: [num('mg/dL', { min: 1.7, max: 2.2 }, 'Magnesium')] },
  { category: B, name: 'TSH (thyroid)', description: REF, infoTypes: [num('mIU/L', { min: 0.4, max: 4 }, 'TSH')] },
  { category: B, name: 'CRP (inflammation)', description: REF, infoTypes: [num('mg/L', { max: 3 }, 'CRP')] },
  { category: B, name: 'Testosterone', infoTypes: [num('ng/dL', undefined, 'Testosterone')] },
  { category: B, name: 'Cortisol', infoTypes: [num('µg/dL', undefined, 'Cortisol')] },
  { category: B, name: 'Creatinine (kidney)', infoTypes: [num('mg/dL', undefined, 'Creatinine')] },
  {
    category: B,
    name: 'Liver enzymes (ALT / AST)',
    description: REF,
    infoTypes: [num('U/L', { max: 40 }, 'ALT'), num('U/L', { max: 40 }, 'AST')],
  },
  { category: B, name: 'Uric acid', description: REF, infoTypes: [num('mg/dL', { min: 3.5, max: 7.2 }, 'Uric acid')] },
  { category: B, name: 'Ketones', infoTypes: [num('mmol/L', undefined, 'Ketones')] },

  // Body
  { category: BO, name: 'Weight', infoTypes: [num('kg', undefined, 'Weight')] },
  { category: BO, name: 'Body fat', infoTypes: [num('%', undefined, 'Body fat')] },
  { category: BO, name: 'Muscle mass', infoTypes: [num('kg', undefined, 'Muscle mass')] },
  { category: BO, name: 'BMI', description: REF, infoTypes: [num('kg/m²', { min: 18.5, max: 24.9 }, 'BMI')] },
  { category: BO, name: 'Waist circumference', infoTypes: [num('cm', undefined, 'Waist')] },
  { category: BO, name: 'Hip circumference', infoTypes: [num('cm', undefined, 'Hip')] },
  { category: BO, name: 'Body temperature', infoTypes: [num('°C', { min: 36.1, max: 37.2 }, 'Temperature')] },
  { category: BO, name: 'Grip strength', infoTypes: [num('kg', undefined, 'Grip strength')] },

  // Hydration
  { category: D, name: 'Urine color', infoTypes: [{ label: 'Color', kind: 'color', optimal: { color: '#f3e7a1' } }] },

  // Women's health
  { category: F, name: 'Basal body temperature', infoTypes: [num('°C', undefined, 'Temperature')] },
];

export function fromPreset(p: PresetSeed): Biomarker {
  return {
    id: newId(),
    name: p.name,
    category: p.category,
    description: p.description,
    infoTypes: p.infoTypes.map((i) => ({ ...i, id: newId() })),
    createdAt: new Date().toISOString(),
  };
}

/** Biomarkers seeded on first launch. Users can edit or delete them. */
export function presetBiomarkers(): Biomarker[] {
  return PRESETS.map(fromPreset);
}

/**
 * Starter entries from older versions that are not real biomarkers (subjective ratings, habits,
 * intake). Removed on upgrade unless the user has logged them or put them in a plan.
 */
export const REMOVED_PRESET_NAMES = [
  'Sleep quality', 'Bedtime', 'Wake-up time', 'Feeling rested',
  'Calories', 'Protein', 'Carbs', 'Fat', 'Fiber', 'Sugar', 'Water intake',
  'Bowel movements', 'Stool type (Bristol scale)', 'Bloating', 'Heartburn',
  'Mood', 'Energy', 'Stress', 'Anxiety', 'Focus', 'Motivation', 'Productivity', 'Meditation', 'Journal',
  'Headache', 'Pain level', 'Muscle soreness', 'Allergy symptoms', 'Sick', 'Skin condition', 'Libido',
  'Cycle day', 'Period flow', 'Cramps',
];
