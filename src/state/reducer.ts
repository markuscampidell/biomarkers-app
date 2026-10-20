import type { AppData, Biomarker, Entry, ID, Plan } from '../domain/types';

export type Action =
  | { type: 'biomarker/upsert'; biomarker: Biomarker }
  | { type: 'biomarker/delete'; id: ID }
  | { type: 'plan/upsert'; plan: Plan }
  | { type: 'plan/delete'; id: ID }
  | { type: 'entry/upsert'; entry: Entry }
  | { type: 'entry/delete'; id: ID }
  | { type: 'data/replace'; data: AppData };

function upsert<T extends { id: ID }>(list: T[], item: T): T[] {
  const i = list.findIndex((x) => x.id === item.id);
  if (i === -1) return [...list, item];
  const copy = list.slice();
  copy[i] = item;
  return copy;
}

export function reducer(state: AppData, action: Action): AppData {
  switch (action.type) {
    case 'biomarker/upsert':
      return { ...state, biomarkers: upsert(state.biomarkers, action.biomarker) };
    case 'biomarker/delete':
      // Removing a biomarker also removes it from plans and drops its history.
      return {
        ...state,
        biomarkers: state.biomarkers.filter((b) => b.id !== action.id),
        plans: state.plans.map((p) => ({ ...p, items: p.items.filter((i) => i.biomarkerId !== action.id) })),
        entries: state.entries.filter((e) => e.biomarkerId !== action.id),
      };
    case 'plan/upsert':
      return { ...state, plans: upsert(state.plans, action.plan) };
    case 'plan/delete':
      return { ...state, plans: state.plans.filter((p) => p.id !== action.id) };
    case 'entry/upsert':
      return { ...state, entries: upsert(state.entries, action.entry) };
    case 'entry/delete':
      return { ...state, entries: state.entries.filter((e) => e.id !== action.id) };
    case 'data/replace':
      return action.data;
  }
}
