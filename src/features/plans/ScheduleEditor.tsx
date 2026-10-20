import type { Schedule } from '../../domain/types';
import { defaultSchedule } from '../../domain/schedule';
import { WEEKDAYS_SHORT } from '../../lib/date';

const TYPES: { type: Schedule['type']; label: string }[] = [
  { type: 'daily', label: 'Every day' },
  { type: 'weekly', label: 'Weekdays' },
  { type: 'interval', label: 'Every N days' },
  { type: 'monthly', label: 'Monthly' },
  { type: 'once', label: 'Date' },
];

const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

export function ScheduleEditor({
  value,
  onChange,
  today,
}: {
  value: Schedule;
  onChange: (s: Schedule) => void;
  today: Date;
}) {
  return (
    <div className="schedule-editor">
      <div className="segmented" role="radiogroup" aria-label="Repeat">
        {TYPES.map((t) => (
          <button
            key={t.type}
            type="button"
            role="radio"
            aria-checked={value.type === t.type}
            className={value.type === t.type ? 'on' : ''}
            onClick={() => value.type !== t.type && onChange(defaultSchedule(t.type, today))}
          >
            {t.label}
          </button>
        ))}
      </div>

      {value.type === 'weekly' && (
        <div className="weekdays">
          {WEEK_ORDER.map((d) => {
            const on = value.weekdays.includes(d);
            return (
              <button
                key={d}
                type="button"
                className={`day ${on ? 'on' : ''}`}
                aria-pressed={on}
                onClick={() =>
                  onChange({
                    ...value,
                    weekdays: on ? value.weekdays.filter((x) => x !== d) : [...value.weekdays, d],
                  })
                }
              >
                {WEEKDAYS_SHORT[d].slice(0, 2)}
              </button>
            );
          })}
        </div>
      )}

      {value.type === 'interval' && (
        <div className="input-row wrap">
          <span>Every</span>
          <input
            type="number"
            min={1}
            className="narrow"
            value={value.everyDays}
            onChange={(e) => onChange({ ...value, everyDays: Math.max(1, Number(e.target.value) || 1) })}
          />
          <span>days, starting</span>
          <input
            type="date"
            value={value.startDate}
            onChange={(e) => e.target.value && onChange({ ...value, startDate: e.target.value })}
          />
        </div>
      )}

      {value.type === 'monthly' && (
        <div className="input-row">
          <span>On day</span>
          <input
            type="number"
            min={1}
            max={31}
            className="narrow"
            value={value.dayOfMonth}
            onChange={(e) =>
              onChange({ ...value, dayOfMonth: Math.min(31, Math.max(1, Number(e.target.value) || 1)) })
            }
          />
          <span>of each month</span>
        </div>
      )}

      {value.type === 'once' && (
        <div className="input-row">
          <input type="date" value={value.date} onChange={(e) => e.target.value && onChange({ ...value, date: e.target.value })} />
        </div>
      )}
    </div>
  );
}
