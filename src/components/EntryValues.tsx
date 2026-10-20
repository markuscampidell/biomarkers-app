import type { Biomarker, Entry } from '../domain/types';
import { formatValue } from '../domain/values';

/** One-line rendering of the values stored in an entry. */
export function EntryValues({ biomarker, entry }: { biomarker: Biomarker; entry: Entry }) {
  const parts = biomarker.infoTypes.filter((i) => entry.values[i.id] !== undefined);
  if (parts.length === 0) return null;
  return (
    <span className="entry-values">
      {parts.map((i) => {
        const v = entry.values[i.id];
        return (
          <span key={i.id} className="entry-value">
            {i.kind === 'color' && typeof v === 'string' ? (
              <span className="swatch" style={{ background: v }} title={v} />
            ) : (
              formatValue(i, v)
            )}
          </span>
        );
      })}
    </span>
  );
}
