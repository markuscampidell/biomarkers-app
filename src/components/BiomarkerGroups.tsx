import { useMemo, useState, type ReactNode } from 'react';
import type { Biomarker } from '../domain/types';
import { Icon } from './Icon';

/** Section a biomarker is listed under; '' means it is not in any section. */
export const categoryOf = (b: Biomarker) => b.category?.trim() ?? '';

const alpha = (a: string, b: string) => a.localeCompare(b, undefined, { sensitivity: 'base', numeric: true });

/** Sections alphabetically (each with its biomarkers alphabetically), plus biomarkers outside any section. */
export function groupBiomarkers(list: Biomarker[]): { sections: [string, Biomarker[]][]; loose: Biomarker[] } {
  const groups = new Map<string, Biomarker[]>();
  const loose: Biomarker[] = [];
  for (const b of list) {
    const c = categoryOf(b);
    if (!c) loose.push(b);
    else groups.set(c, [...(groups.get(c) ?? []), b]);
  }
  const byName = (x: Biomarker, y: Biomarker) => alpha(x.name, y.name);
  return {
    sections: [...groups.entries()].sort(([a], [b]) => alpha(a, b)).map(([c, items]) => [c, items.sort(byName)]),
    loose: loose.sort(byName),
  };
}

interface Props {
  biomarkers: Biomarker[];
  /** When searching, every section with a match is shown open. */
  searching: boolean;
  renderItem: (b: Biomarker) => ReactNode;
  /** Optional extra text next to a section's count, e.g. "2 selected". */
  badge?: (items: Biomarker[]) => string | null;
  /** Mark sections as drop targets for dragging biomarkers (see useDragToSection). */
  droppable?: boolean;
  /** Section currently hovered while dragging. */
  dropOver?: string | null;
  /** When set, each section header gets an × button that calls this. */
  onDeleteSection?: (category: string, items: Biomarker[]) => void;
}

/** Sections that open and close like folders (all start closed), then biomarkers outside any section. */
export function BiomarkerGroups({ biomarkers, searching, renderItem, badge, droppable, dropOver, onDeleteSection }: Props) {
  const [open, setOpen] = useState<Set<string>>(() => new Set());
  const { sections, loose } = useMemo(() => groupBiomarkers(biomarkers), [biomarkers]);

  const toggle = (c: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(c)) next.delete(c);
      else next.add(c);
      return next;
    });

  return (
    <div className="groups">
      {sections.map(([category, items]) => {
        const isOpen = searching || open.has(category);
        const extra = badge?.(items);
        return (
          <section
            key={category}
            className={`group ${isOpen ? 'open' : ''} ${dropOver === category ? 'drop-over' : ''}`}
            data-drop={droppable ? category : undefined}
          >
            <div className="with-x">
              <button
                type="button"
                className={`group-head ${onDeleteSection ? 'has-x' : ''}`}
                aria-expanded={isOpen}
                onClick={() => !searching && toggle(category)}
              >
                <span className="group-chevron">
                  <Icon name="chevron" size={18} />
                </span>
                <span className="group-title">{category}</span>
                {extra && <span className="badge good">{extra}</span>}
                <span className="group-count">{items.length}</span>
              </button>
              {onDeleteSection && (
                <button
                  type="button"
                  className="icon-btn x-btn"
                  aria-label={`Delete section ${category}`}
                  onClick={() => onDeleteSection(category, items)}
                >
                  <Icon name="close" size={18} />
                </button>
              )}
            </div>
            {isOpen && (
              <ul className="list group-body">
                {items.map((b) => (
                  <li key={b.id}>{renderItem(b)}</li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
      {loose.length > 0 && (
        <ul className="list">
          {loose.map((b) => (
            <li key={b.id}>{renderItem(b)}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
