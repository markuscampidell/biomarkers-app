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
  'Nutrition',
  'Hydration & Digestion',
  'Mind & Mood',
  'Symptoms & Wellbeing',
  "Women's health",
] as const;

export const OTHER_CATEGORY = 'Other';

// Small helpers so each preset reads as one line.
const num = (unit: string, optimal?: InfoSeed['optimal'], label = 'Value'): InfoSeed => ({ label, kind: 'number', unit, optimal });
const scale = (min: number, max: number, optimal?: InfoSeed['optimal'], label = 'Rating'): InfoSeed => ({
  label,
  kind: 'scale',
  min,
  max,
  step: 1,
  optimal,
});
const time = (overnight = false): InfoSeed => ({ label: 'Time', kind: 'time', ...(overnight && { overnight }) });

// General adult reference ranges, used only to colour how close a value is. Ranges that depend
// strongly on sex or age (ferritin, hemoglobin, testosterone, …) are left without an optimal.
const REF = 'Typical adult reference range — your doctor or lab may use a different one.';

const S = 'Sleep';
const H = 'Heart & Circulation';
const B = 'Blood';
const BO = 'Body';
const N = 'Nutrition';
const D = 'Hydration & Digestion';
const M = 'Mind & Mood';
const W = 'Symptoms & Wellbeing';
const F = "Women's health";

export const PRESETS: PresetSeed[] = [
  // Sleep
  { category: S, name: 'Sleep duration', infoTypes: [num('h', { min: 7, max: 9 }, 'Duration')] },
  { category: S, name: 'Sleep quality', infoTypes: [scale(1, 10, { min: 7 })] },
  { category: S, name: 'Bedtime', infoTypes: [time(true)] },
  { category: S, name: 'Wake-up time', infoTypes: [time()] },
  { category: S, name: 'Time to fall asleep', infoTypes: [num('min', { max: 20 }, 'Minutes')] },
  { category: S, name: 'Deep sleep', infoTypes: [num('min', undefined, 'Minutes')] },
  { category: S, name: 'REM sleep', infoTypes: [num('min', undefined, 'Minutes')] },
  { category: S, name: 'Feeling rested', description: 'How rested you feel after waking up.', infoTypes: [scale(1, 10, { min: 7 })] },

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

  // Nutrition
  { category: N, name: 'Calories', infoTypes: [num('kcal', undefined, 'Calories')] },
  { category: N, name: 'Protein', infoTypes: [num('g', undefined, 'Protein')] },
  { category: N, name: 'Carbs', infoTypes: [num('g', undefined, 'Carbs')] },
  { category: N, name: 'Fat', infoTypes: [num('g', undefined, 'Fat')] },
  { category: N, name: 'Fiber', infoTypes: [num('g', { min: 25 }, 'Fiber')] },
  { category: N, name: 'Sugar', infoTypes: [num('g', { max: 50 }, 'Sugar')] },
  { category: N, name: 'Water intake', infoTypes: [num('L', { min: 2 }, 'Water')] },

  // Hydration & Digestion
  { category: D, name: 'Urine color', infoTypes: [{ label: 'Color', kind: 'color', optimal: { color: '#f3e7a1' } }] },
  { category: D, name: 'Bowel movements', infoTypes: [num('per day', undefined, 'Count')] },
  {
    category: D,
    name: 'Stool type (Bristol scale)',
    description: '1 = hard lumps … 4 = smooth and soft … 7 = watery.',
    infoTypes: [scale(1, 7, { min: 3, max: 4 }, 'Type')],
  },
  { category: D, name: 'Bloating', infoTypes: [scale(0, 10, { max: 2 })] },
  { category: D, name: 'Heartburn', infoTypes: [scale(0, 10, { max: 2 })] },

  // Mind & Mood
  { category: M, name: 'Mood', infoTypes: [scale(1, 10, { min: 7 })] },
  { category: M, name: 'Energy', infoTypes: [scale(1, 10, { min: 7 })] },
  { category: M, name: 'Stress', infoTypes: [scale(1, 10, { max: 3 })] },
  { category: M, name: 'Anxiety', infoTypes: [scale(1, 10, { max: 3 })] },
  { category: M, name: 'Focus', infoTypes: [scale(1, 10, { min: 7 })] },
  { category: M, name: 'Motivation', infoTypes: [scale(1, 10, { min: 7 })] },
  { category: M, name: 'Productivity', infoTypes: [scale(1, 10, { min: 7 })] },
  { category: M, name: 'Meditation', infoTypes: [num('min', undefined, 'Minutes')] },
  { category: M, name: 'Journal', description: 'Gratitude, thoughts, anything worth writing down.', infoTypes: [{ label: 'Notes', kind: 'text' }] },

  // Symptoms & Wellbeing
  { category: W, name: 'Headache', infoTypes: [scale(0, 10, { max: 1 }, 'Intensity')] },
  { category: W, name: 'Pain level', infoTypes: [scale(0, 10, { max: 1 }, 'Intensity')] },
  { category: W, name: 'Muscle soreness', infoTypes: [scale(0, 10, { max: 2 }, 'Intensity')] },
  { category: W, name: 'Allergy symptoms', infoTypes: [scale(0, 10, { max: 1 }, 'Intensity')] },
  { category: W, name: 'Sick', infoTypes: [{ label: 'Sick', kind: 'yesno', optimal: { target: 0 } }] },
  { category: W, name: 'Skin condition', infoTypes: [scale(1, 10, { min: 7 })] },
  { category: W, name: 'Libido', infoTypes: [scale(1, 10)] },

  // Women's health
  { category: F, name: 'Cycle day', infoTypes: [num('day', undefined, 'Day of cycle')] },
  {
    category: F,
    name: 'Period flow',
    infoTypes: [{ label: 'Flow', kind: 'scale', min: 0, max: 3, step: 1, labels: ['None', 'Light', 'Medium', 'Heavy'] }],
  },
  { category: F, name: 'Cramps', infoTypes: [scale(0, 10, { max: 2 }, 'Intensity')] },
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
