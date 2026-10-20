import type { AppData, Biomarker, Entry, Plan, PlanItem } from './types';
import { isScheduledOn } from './schedule';
import { minutesOfDay, toDayKey } from '../lib/date';

export type DueStatus = 'done' | 'overdue' | 'due' | 'upcoming';

export interface AgendaItem {
  plan: Plan;
  item: PlanItem;
  biomarker: Biomarker;
  entry?: Entry;
  status: DueStatus;
}

/** Minutes a timed item stays "due" before it counts as overdue. */
const GRACE_MINUTES = 60;

/** Everything plans schedule for the day of `now`, with status relative to the current time. */
export function agendaFor(data: AppData, now: Date): AgendaItem[] {
  const dayKey = toDayKey(now);
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const byId = new Map(data.biomarkers.map((b) => [b.id, b]));
  const todays = data.entries.filter((e) => e.planItemId && toDayKey(new Date(e.timestamp)) === dayKey);

  const items: AgendaItem[] = [];
  for (const plan of data.plans) {
    if (!plan.active) continue;
    for (const item of plan.items) {
      const biomarker = byId.get(item.biomarkerId);
      if (!biomarker || !isScheduledOn(item.schedule, now)) continue;
      const entry = todays.find((e) => e.planItemId === item.id);
      let status: DueStatus = 'due';
      if (entry) status = 'done';
      else if (item.time) {
        const t = minutesOfDay(item.time);
        if (nowMin < t) status = 'upcoming';
        else if (nowMin > t + GRACE_MINUTES) status = 'overdue';
      }
      items.push({ plan, item, biomarker, entry, status });
    }
  }

  const order: Record<DueStatus, number> = { overdue: 0, due: 1, upcoming: 2, done: 3 };
  return items.sort(
    (a, b) =>
      order[a.status] - order[b.status] ||
      (a.item.time ? minutesOfDay(a.item.time) : -1) - (b.item.time ? minutesOfDay(b.item.time) : -1) ||
      a.biomarker.name.localeCompare(b.biomarker.name),
  );
}
