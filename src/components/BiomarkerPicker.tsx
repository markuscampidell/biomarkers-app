import { useMemo, useState } from 'react';
import type { Biomarker, ID } from '../domain/types';
import { Icon } from './Icon';
import { InfoChips } from './InfoChips';
import { BiomarkerGroups } from './BiomarkerGroups';

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
    return biomarkers.filter(
      (b) => !q || b.name.toLowerCase().includes(q) || (b.category ?? '').toLowerCase().includes(q),
    );
  }, [biomarkers, query]);

  return (
    <div className="picker">
      <label className="search">
        <Icon name="search" size={18} />
        <input
          type="search"
          name="biomarker-picker-search"
          autoComplete="off"
          autoFocus
          placeholder="Search biomarkers"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </label>
      {list.length === 0 ? (
        <p className="muted pad">No biomarkers match “{query}”.</p>
      ) : (
        <BiomarkerGroups
          biomarkers={list}
          searching={query.trim() !== ''}
          badge={selected ? (items) => {
            const n = items.filter((b) => selected.has(b.id)).length;
            return n ? `${n} selected` : null;
          } : undefined}
          renderItem={(b) => {
            const isSel = selected?.has(b.id);
            return (
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
            );
          }}
        />
      )}
    </div>
  );
}
