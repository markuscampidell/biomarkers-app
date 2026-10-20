import { useMemo, useState } from 'react';
import type { Biomarker, ID } from '../domain/types';
import { Icon } from './Icon';
import { InfoChips } from './InfoChips';

interface PickerProps {
  biomarkers: Biomarker[];
  /** Single mode: called on tap. */
  onPick?: (b: Biomarker) => void;
  /** Multi mode: controlled selection. */
  selected?: Set<ID>;
  onToggle?: (b: Biomarker) => void;
}

/** Searchable, scrollable list of biomarkers. */
export function BiomarkerPicker({ biomarkers, onPick, selected, onToggle }: PickerProps) {
  const [query, setQuery] = useState('');
  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return biomarkers
      .filter((b) => !q || b.name.toLowerCase().includes(q))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [biomarkers, query]);

  return (
    <div className="picker">
      <label className="search">
        <Icon name="search" size={18} />
        <input
          autoFocus
          placeholder="Search biomarkers"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </label>
      <ul className="list">
        {list.map((b) => {
          const isSel = selected?.has(b.id);
          return (
            <li key={b.id}>
              <button
                className={`card card-btn ${isSel ? 'selected' : ''}`}
                onClick={() => (onToggle ? onToggle(b) : onPick?.(b))}
                aria-pressed={onToggle ? isSel : undefined}
              >
                <div className="card-main">
                  <strong>{b.name}</strong>
                  <InfoChips infoTypes={b.infoTypes} />
                </div>
                {onToggle ? (
                  <span className={`tick ${isSel ? 'on' : ''}`}>{isSel && <Icon name="check" size={16} />}</span>
                ) : (
                  <Icon name="chevron" />
                )}
              </button>
            </li>
          );
        })}
        {list.length === 0 && <li className="muted pad">No biomarkers match “{query}”.</li>}
      </ul>
    </div>
  );
}
