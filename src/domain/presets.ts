import type { Biomarker, InfoType } from './types';
import { newId } from '../lib/id';

type InfoSeed = Omit<InfoType, 'id'>;

const make = (name: string, infoTypes: InfoSeed[], description?: string): Biomarker => ({
  id: newId(),
  name,
  description,
  infoTypes: infoTypes.map((i) => ({ ...i, id: newId() })),
  createdAt: new Date().toISOString(),
});

/** Example biomarkers seeded on first launch. Users can edit or delete them. */
export function presetBiomarkers(): Biomarker[] {
  return [
    make('Weight', [{ label: 'Weight', kind: 'number', unit: 'kg', optimal: { target: 70 } }]),
    make('Sleep', [
      { label: 'Duration', kind: 'number', unit: 'hours', optimal: { min: 7, max: 9 } },
      { label: 'Quality', kind: 'scale', min: 1, max: 10, step: 1, optimal: { min: 8 } },
    ]),
    make('Blood pressure', [
      { label: 'Systolic', kind: 'number', unit: 'mmHg', optimal: { min: 90, max: 120 } },
      { label: 'Diastolic', kind: 'number', unit: 'mmHg', optimal: { min: 60, max: 80 } },
      { label: 'Pulse', kind: 'number', unit: 'bpm', optimal: { min: 50, max: 80 } },
    ]),
    make('Resting heart rate', [{ label: 'Heart rate', kind: 'number', unit: 'bpm', optimal: { min: 50, max: 70 } }]),
    make('Blood glucose', [{ label: 'Daily low / high', kind: 'range', unit: 'mg/dL', optimal: { min: 70, max: 140 } }]),
    make('Body temperature', [{ label: 'Temperature', kind: 'number', unit: '°C', optimal: { min: 36.1, max: 37.2 } }]),
    make('Mood', [
      { label: 'Mood', kind: 'scale', min: 1, max: 10, step: 1, optimal: { target: 10 } },
      { label: 'Color of the day', kind: 'color' },
    ]),
    make('Hydration', [{ label: 'Urine color', kind: 'color', optimal: { color: '#f3e7a1' } }]),
    make('Journal', [{ label: 'Notes', kind: 'text' }]),
  ];
}
