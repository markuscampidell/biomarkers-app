import type { Schedule } from './types';
import { WEEKDAYS_SHORT, daysBetween, formatShortDate, fromDayKey, toDayKey } from '../lib/date';

/** Does a schedule fall on the given calendar day? */
export function isScheduledOn(schedule: Schedule, day: Date): boolean {
  switch (schedule.type) {
    case 'daily':
      return true;
    case 'interval': {
      const diff = daysBetween(fromDayKey(schedule.startDate), day);
      return diff >= 0 && diff % Math.max(1, schedule.everyDays) === 0;
    }
    case 'weekly':
      return schedule.weekdays.includes(day.getDay());
    case 'monthly': {
      // Clamp e.g. "31st" to the last day of shorter months.
      const last = new Date(day.getFullYear(), day.getMonth() + 1, 0).getDate();
      return day.getDate() === Math.min(schedule.dayOfMonth, last);
    }
    case 'once':
      return schedule.date === toDayKey(day);
  }
}

export function describeSchedule(schedule: Schedule): string {
  switch (schedule.type) {
    case 'daily':
      return 'Every day';
    case 'interval':
      return schedule.everyDays === 1
        ? 'Every day'
        : `Every ${schedule.everyDays} days from ${formatShortDate(fromDayKey(schedule.startDate))}`;
    case 'weekly': {
      if (schedule.weekdays.length === 0) return 'No days selected';
      if (schedule.weekdays.length === 7) return 'Every day';
      const order = [1, 2, 3, 4, 5, 6, 0];
      const days = order.filter((d) => schedule.weekdays.includes(d)).map((d) => WEEKDAYS_SHORT[d]);
      return `Every ${days.join(', ')}`;
    }
    case 'monthly':
      return `Monthly on day ${schedule.dayOfMonth}`;
    case 'once':
      return `On ${formatShortDate(fromDayKey(schedule.date))}`;
  }
}

export function defaultSchedule(type: Schedule['type'], today: Date): Schedule {
  switch (type) {
    case 'daily':
      return { type };
    case 'interval':
      return { type, everyDays: 2, startDate: toDayKey(today) };
    case 'weekly':
      return { type, weekdays: [today.getDay()] };
    case 'monthly':
      return { type, dayOfMonth: today.getDate() };
    case 'once':
      return { type, date: toDayKey(today) };
  }
}
