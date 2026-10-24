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
  'Vital signs',
  'Heart & fitness',
  'Body composition',
  'Metabolism',
  'Lipids',
  'Blood count',
  'Iron',
  'Kidney',
  'Liver',
  'Electrolytes & minerals',
  'Vitamins',
  'Thyroid',
  'Hormones',
  'Inflammation',
  'Hydration',
  "Women's health",
  "Men's health",
] as const;

export const OTHER_CATEGORY = 'Other';

// Small helper so each preset reads as one line.
const num = (unit: string, optimal?: InfoSeed['optimal'], label = 'Value'): InfoSeed => ({ label, kind: 'number', unit, optimal });

// General adult reference ranges (mostly MedlinePlus), used only to colour how close a value is.
// Ranges that depend strongly on sex or age (ferritin, hemoglobin, hormones, …) are left without one.
const REF = 'Typical adult reference range — your doctor or lab may use a different one.';

const V = 'Vital signs';
const H = 'Heart & fitness';
const BO = 'Body composition';
const ME = 'Metabolism';
const L = 'Lipids';
const BC = 'Blood count';
const FE = 'Iron';
const K = 'Kidney';
const LI = 'Liver';
const EL = 'Electrolytes & minerals';
const VI = 'Vitamins';
const T = 'Thyroid';
const HO = 'Hormones';
const IN = 'Inflammation';
const D = 'Hydration';
const F = "Women's health";
const MA = "Men's health";

/**
 * Only real biomarkers, following the FDA-NIH BEST definition: "a defined characteristic that is
 * measured as an indicator of normal biological processes, pathogenic processes, or responses to an
 * exposure or intervention" — molecular, histologic, radiographic or physiologic. A biomarker is
 * not an assessment of how a person feels, functions or behaves, so ratings (mood, pain), habits
 * (sleep duration, bedtime), intake (calories, water) and performance tests (grip strength) are excluded.
 */
export const PRESETS: PresetSeed[] = [
  // Vital signs
  { category: V, name: 'Resting heart rate', infoTypes: [num('bpm', { min: 50, max: 70 }, 'Heart rate')] },
  {
    category: V,
    name: 'Blood pressure',
    infoTypes: [num('mmHg', { min: 90, max: 120 }, 'Systolic'), num('mmHg', { min: 60, max: 80 }, 'Diastolic')],
  },
  { category: V, name: 'Respiratory rate', description: 'Breaths per minute at rest.', infoTypes: [num('/min', { min: 12, max: 18 }, 'Breaths')] },
  { category: V, name: 'Blood oxygen (SpO₂)', infoTypes: [num('%', { min: 95, max: 100 }, 'SpO₂')] },
  { category: V, name: 'Body temperature', infoTypes: [num('°C', { min: 36.1, max: 37.2 }, 'Temperature')] },

  // Heart & fitness
  { category: H, name: 'Heart rate variability (HRV)', infoTypes: [num('ms', undefined, 'HRV')] },
  { category: H, name: 'Max heart rate during exercise', infoTypes: [num('bpm', undefined, 'Heart rate')] },
  {
    category: H,
    name: 'Heart rate recovery',
    description: 'How much your heart rate drops in the first minute after exercise.',
    infoTypes: [num('bpm', { min: 12 }, 'Drop after 1 min')],
  },
  { category: H, name: 'VO₂ max', description: 'Maximal oxygen uptake, a measure of cardiorespiratory fitness.', infoTypes: [num('ml/kg/min', undefined, 'VO₂ max')] },

  // Body composition
  { category: BO, name: 'Weight', infoTypes: [num('kg', undefined, 'Weight')] },
  { category: BO, name: 'BMI', description: REF, infoTypes: [num('kg/m²', { min: 18.5, max: 24.9 }, 'BMI')] },
  { category: BO, name: 'Body fat', infoTypes: [num('%', undefined, 'Body fat')] },
  { category: BO, name: 'Muscle mass', infoTypes: [num('kg', undefined, 'Muscle mass')] },
  { category: BO, name: 'Waist circumference', infoTypes: [num('cm', undefined, 'Waist')] },
  { category: BO, name: 'Hip circumference', infoTypes: [num('cm', undefined, 'Hip')] },
  {
    category: BO,
    name: 'Bone density (T-score)',
    description: 'From a DEXA scan. −1 or higher is normal, −2.5 or lower means osteoporosis.',
    infoTypes: [num('SD', { min: -1 }, 'T-score')],
  },

  // Metabolism
  { category: ME, name: 'Blood glucose', description: REF, infoTypes: [num('mg/dL', { min: 70, max: 140 }, 'Glucose')] },
  { category: ME, name: 'Fasting glucose', description: REF, infoTypes: [num('mg/dL', { min: 70, max: 99 }, 'Glucose')] },
  { category: ME, name: 'HbA1c', description: 'Average blood sugar over the last 2–3 months.', infoTypes: [num('%', { max: 5.6 }, 'HbA1c')] },
  { category: ME, name: 'Fasting insulin', description: 'Together with fasting glucose it shows insulin resistance (HOMA-IR).', infoTypes: [num('µIU/mL', undefined, 'Insulin')] },
  { category: ME, name: 'Uric acid', description: REF, infoTypes: [num('mg/dL', { min: 3.5, max: 7.2 }, 'Uric acid')] },
  { category: ME, name: 'Ketones', infoTypes: [num('mmol/L', undefined, 'Ketones')] },

  // Lipids
  { category: L, name: 'Total cholesterol', description: REF, infoTypes: [num('mg/dL', { max: 200 }, 'Cholesterol')] },
  { category: L, name: 'LDL cholesterol', description: REF, infoTypes: [num('mg/dL', { max: 100 }, 'LDL')] },
  { category: L, name: 'HDL cholesterol', description: REF, infoTypes: [num('mg/dL', { min: 40 }, 'HDL')] },
  { category: L, name: 'Triglycerides', description: REF, infoTypes: [num('mg/dL', { max: 150 }, 'Triglycerides')] },
  { category: L, name: 'Apolipoprotein B (ApoB)', description: 'Number of atherogenic (artery-clogging) particles.', infoTypes: [num('mg/dL', undefined, 'ApoB')] },
  { category: L, name: 'Lipoprotein(a)', description: 'Mostly genetic; a high level raises heart and vessel risk.', infoTypes: [num('mg/dL', undefined, 'Lp(a)')] },

  // Blood count
  { category: BC, name: 'Hemoglobin', infoTypes: [num('g/dL', undefined, 'Hemoglobin')] },
  { category: BC, name: 'Hematocrit', infoTypes: [num('%', undefined, 'Hematocrit')] },
  { category: BC, name: 'Red blood cells', infoTypes: [num('×10⁶/µL', undefined, 'RBC')] },
  { category: BC, name: 'White blood cells', description: REF, infoTypes: [num('×10³/µL', { min: 4.5, max: 11 }, 'WBC')] },
  { category: BC, name: 'Platelets', description: REF, infoTypes: [num('×10³/µL', { min: 150, max: 400 }, 'Platelets')] },
  { category: BC, name: 'MCV', description: 'Average size of your red blood cells.', infoTypes: [num('fL', { min: 80, max: 100 }, 'MCV')] },

  // Iron
  { category: FE, name: 'Ferritin', description: 'Your iron stores.', infoTypes: [num('ng/mL', undefined, 'Ferritin')] },
  { category: FE, name: 'Iron', description: REF, infoTypes: [num('µg/dL', { min: 60, max: 170 }, 'Iron')] },
  { category: FE, name: 'Transferrin saturation', infoTypes: [num('%', undefined, 'Saturation')] },

  // Kidney
  { category: K, name: 'Creatinine (kidney)', description: REF, infoTypes: [num('mg/dL', { min: 0.6, max: 1.3 }, 'Creatinine')] },
  { category: K, name: 'eGFR', description: 'Estimated kidney filtration rate. 90 or more is normal.', infoTypes: [num('mL/min/1.73m²', { min: 90 }, 'eGFR')] },
  { category: K, name: 'Cystatin C', infoTypes: [num('mg/L', undefined, 'Cystatin C')] },
  { category: K, name: 'Blood urea nitrogen (BUN)', description: REF, infoTypes: [num('mg/dL', { min: 6, max: 20 }, 'BUN')] },
  {
    category: K,
    name: 'Urine albumin-to-creatinine ratio',
    description: 'Protein leaking into the urine; under 30 is normal.',
    infoTypes: [num('mg/g', { max: 30 }, 'UACR')],
  },

  // Liver
  {
    category: LI,
    name: 'Liver enzymes (ALT / AST)',
    description: REF,
    infoTypes: [num('U/L', { max: 36 }, 'ALT'), num('U/L', { max: 33 }, 'AST')],
  },
  { category: LI, name: 'GGT', infoTypes: [num('U/L', undefined, 'GGT')] },
  { category: LI, name: 'Alkaline phosphatase (ALP)', description: REF, infoTypes: [num('U/L', { min: 20, max: 130 }, 'ALP')] },
  { category: LI, name: 'Bilirubin', description: REF, infoTypes: [num('mg/dL', { min: 0.1, max: 1.2 }, 'Total bilirubin')] },
  { category: LI, name: 'Albumin', description: REF, infoTypes: [num('g/dL', { min: 3.4, max: 5.4 }, 'Albumin')] },

  // Electrolytes & minerals
  { category: EL, name: 'Sodium', description: REF, infoTypes: [num('mmol/L', { min: 135, max: 145 }, 'Sodium')] },
  { category: EL, name: 'Potassium', description: REF, infoTypes: [num('mmol/L', { min: 3.7, max: 5.2 }, 'Potassium')] },
  { category: EL, name: 'Calcium', description: REF, infoTypes: [num('mg/dL', { min: 8.5, max: 10.2 }, 'Calcium')] },
  { category: EL, name: 'Magnesium', description: REF, infoTypes: [num('mg/dL', { min: 1.7, max: 2.2 }, 'Magnesium')] },

  // Vitamins
  { category: VI, name: 'Vitamin D', description: REF, infoTypes: [num('ng/mL', { min: 30, max: 100 }, '25-OH vitamin D')] },
  { category: VI, name: 'Vitamin B12', description: REF, infoTypes: [num('pg/mL', { min: 200, max: 900 }, 'B12')] },
  { category: VI, name: 'Folate', description: REF, infoTypes: [num('ng/mL', { min: 3 }, 'Folate')] },

  // Thyroid
  { category: T, name: 'TSH (thyroid)', description: REF, infoTypes: [num('mIU/L', { min: 0.4, max: 4 }, 'TSH')] },
  { category: T, name: 'Free T4', infoTypes: [num('ng/dL', undefined, 'Free T4')] },
  { category: T, name: 'Free T3', infoTypes: [num('pg/mL', undefined, 'Free T3')] },

  // Hormones
  { category: HO, name: 'Testosterone', infoTypes: [num('ng/dL', undefined, 'Testosterone')] },
  { category: HO, name: 'Estradiol', infoTypes: [num('pg/mL', undefined, 'Estradiol')] },
  { category: HO, name: 'Progesterone', infoTypes: [num('ng/mL', undefined, 'Progesterone')] },
  { category: HO, name: 'LH', description: 'Luteinizing hormone.', infoTypes: [num('IU/L', undefined, 'LH')] },
  { category: HO, name: 'FSH', description: 'Follicle-stimulating hormone.', infoTypes: [num('IU/L', undefined, 'FSH')] },
  { category: HO, name: 'SHBG', description: 'Sex hormone-binding globulin.', infoTypes: [num('nmol/L', undefined, 'SHBG')] },
  { category: HO, name: 'DHEA-S', infoTypes: [num('µg/dL', undefined, 'DHEA-S')] },
  { category: HO, name: 'Cortisol', infoTypes: [num('µg/dL', undefined, 'Cortisol')] },
  { category: HO, name: 'IGF-1', description: 'Insulin-like growth factor 1 (reflects growth hormone).', infoTypes: [num('ng/mL', undefined, 'IGF-1')] },

  // Inflammation
  { category: IN, name: 'CRP (inflammation)', description: REF, infoTypes: [num('mg/L', { max: 3 }, 'CRP')] },
  { category: IN, name: 'Homocysteine', infoTypes: [num('µmol/L', undefined, 'Homocysteine')] },
  { category: IN, name: 'ESR (sed rate)', infoTypes: [num('mm/h', undefined, 'ESR')] },

  // Hydration
  { category: D, name: 'Urine color', description: 'Pale straw is well hydrated, dark yellow means drink more.', infoTypes: [{ label: 'Color', kind: 'color', optimal: { color: '#f3e7a1' } }] },

  // Women's health
  { category: F, name: 'Basal body temperature', infoTypes: [num('°C', undefined, 'Temperature')] },
  { category: F, name: 'AMH', description: 'Anti-Müllerian hormone, an indicator of ovarian reserve.', infoTypes: [num('ng/mL', undefined, 'AMH')] },

  // Men's health
  { category: MA, name: 'PSA', description: 'Prostate-specific antigen.', infoTypes: [num('ng/mL', undefined, 'PSA')] },
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
 * intake, performance tests). Removed on upgrade unless the user has logged them or put them in a plan.
 */
export const REMOVED_PRESET_NAMES = [
  'Sleep duration', 'Time to fall asleep', 'Deep sleep', 'REM sleep', 'Grip strength',
  'Sleep quality', 'Bedtime', 'Wake-up time', 'Feeling rested',
  'Calories', 'Protein', 'Carbs', 'Fat', 'Fiber', 'Sugar', 'Water intake',
  'Bowel movements', 'Stool type (Bristol scale)', 'Bloating', 'Heartburn',
  'Mood', 'Energy', 'Stress', 'Anxiety', 'Focus', 'Motivation', 'Productivity', 'Meditation', 'Journal',
  'Headache', 'Pain level', 'Muscle soreness', 'Allergy symptoms', 'Sick', 'Skin condition', 'Libido',
  'Cycle day', 'Period flow', 'Cramps',
];

/** Built-in section names from older versions; presets filed there are moved to their new section. */
export const LEGACY_CATEGORIES = [
  'Sleep', 'Heart & Circulation', 'Blood', 'Body', 'Nutrition', 'Hydration & Digestion',
  'Mind & Mood', 'Symptoms & Wellbeing', 'Hydration', "Women's health",
];
