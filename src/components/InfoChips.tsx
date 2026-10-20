import type { InfoType } from '../domain/types';
import { describeOptimal } from '../domain/values';

/** Compact summary of a biomarker's info types. */
export function InfoChips({ infoTypes }: { infoTypes: InfoType[] }) {
  return (
    <div className="chips">
      {infoTypes.map((i) => {
        const opt = describeOptimal(i);
        return (
          <span className="chip" key={i.id}>
            {i.kind === 'color' && i.optimal?.color && (
              <span className="swatch" style={{ background: i.optimal.color }} />
            )}
            {i.label}
            {i.unit && <span className="muted"> · {i.unit}</span>}
            {opt && i.kind !== 'color' && <span className="muted"> · ◎ {opt}</span>}
          </span>
        );
      })}
    </div>
  );
}
