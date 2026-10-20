import { useMemo, useState, type ReactNode } from 'react';
import type { Biomarker } from '../domain/types';
import { CATEGORIES, OTHER_CATEGORY, PRESETS } from '../domain/presets';

// Catalogue order inside a section (most common first); the user's own biomarkers follow alphabetically.
const presetRank = new Map(PRESETS.map((p, i) => [p.name.toLowerCase(), i]));
const itemRank = (b: Biomarker) => presetRank.get(b.name.trim().toLowerCase()) ?? Infinity;
import { Icon } from './Icon';

/** Section name a biomarker is listed under. */
export const categoryOf = (b: Biomarker) => b.category?.trim() || OTHER_CATEGORY;

/** Known sections first (in their set order), then the user's own alphabetically, "Other" last. */
export function groupBiomarkers(list: Biomarker[]): [string, Biomarker[]][] {
  const groups = new Map<string, Biomarker[]>();
  for (const b of list) {
    const c = categoryOf(b);
    groups.set(c, [...(groups.get(c) ?? []), b]);
  }
  const rank = (c: string) => {
    const i = (CATEGORIES as readonly string[]).indexOf(c);
    return i !== -1 ? i : c === OTHER_CATEGORY ? Infinity : CATEGORIES.length;
  };
  return [...groups.entries()]
    .sort(([a], [b]) => rank(a) - rank(b) || a.localeCompare(b))
    .map(([c, items]) => [c, items.sort((x, y) => itemRank(x) - itemRank(y) || x.name.localeCompare(y.name))]);
}

interface Props {
  biomarkers: Biomarker[];
  /** When searching, every section with a match is shown open. */
  searching: boolean;
  renderItem: (b: Biomarker) => ReactNode;
  /** Optional extra text next to a section's count, e.g. "2 selected". */
  badge?: (items: Biomarker[]) => string | null;
}

/** Biomarkers split into sections that open and close like chapters. All start closed. */
export function BiomarkerGroups({ biomarkers, searching, renderItem, badge }: Props) {
  const [open, setOpen] = useState<Set<string>>(() => new Set());
  const groups = useMemo(() => groupBiomarkers(biomarkers), [biomarkers]);

  const toggle = (c: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(c)) next.delete(c);
      else next.add(c);
      return next;
    });

  return (
    <div className="groups">
      {groups.map(([category, items]) => {
        const isOpen = searching || open.has(category);
        const extra = badge?.(items);
        return (
          <section key={category} className={`group ${isOpen ? 'open' : ''}`}>
            <button
              type="button"
              className="group-head"
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
    </div>
  );
}
