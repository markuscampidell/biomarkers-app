import type { Biomarker } from '../../domain/types';
import { KIND_LABELS, describeOptimal } from '../../domain/values';
import { Sheet } from '../../components/Sheet';

/** Read-only view of a built-in biomarker. */
export function DefaultBiomarkerSheet({ biomarker, onClose }: { biomarker: Biomarker; onClose: () => void }) {
  return (
    <Sheet title="Default biomarker" onClose={onClose}>
      <dl className="readonly">
        <div>
          <dt>Name</dt>
          <dd>{biomarker.name}</dd>
        </div>
        <div>
          <dt>Description</dt>
          <dd className={biomarker.description ? '' : 'muted'}>{biomarker.description ?? '—'}</dd>
        </div>
        <div>
          <dt>Section</dt>
          <dd className={biomarker.category ? '' : 'muted'}>{biomarker.category ?? '—'}</dd>
        </div>
      </dl>

      <div className="section-title">
        <h3>What it records</h3>
      </div>
      <ul className="list">
        {biomarker.infoTypes.map((info) => {
          const optimal = describeOptimal(info);
          return (
            <li key={info.id} className="card readonly-info">
              <strong>{info.label}</strong>
              <span className="muted small">
                {KIND_LABELS[info.kind]}
                {info.unit && ` · ${info.unit}`}
              </span>
              {optimal && (
                <span className="small">
                  Optimal:{' '}
                  {info.kind === 'color' && info.optimal?.color ? (
                    <span className="swatch" style={{ background: info.optimal.color }} />
                  ) : (
                    optimal
                  )}
                </span>
              )}
            </li>
          );
        })}
      </ul>
      <p className="muted small">Default biomarkers can't be changed. To track something different, create your own with “New”.</p>
    </Sheet>
  );
}
