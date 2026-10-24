import { useMemo, useState } from 'react';
import type { Biomarker } from '../../domain/types';
import { useStore } from '../../state/AppStore';
import { EmptyState } from '../../components/EmptyState';
import { Icon } from '../../components/Icon';
import { InfoChips } from '../../components/InfoChips';
import { BiomarkerEditorSheet } from './BiomarkerEditorSheet';
import { DefaultBiomarkerSheet } from './DefaultBiomarkerSheet';
import { BiomarkerGroups, categoryOf } from '../../components/BiomarkerGroups';
import { BiomarkerIntro, isFirstBiomarkersVisit } from './BiomarkerIntro';
import { useDragToSection } from './useDragToSection';

export function BiomarkersView() {
  const { data, dispatch } = useStore();
  const [editing, setEditing] = useState<Biomarker | 'new' | null>(null);
  const [query, setQuery] = useState('');
  const [introOpen, setIntroOpen] = useState(isFirstBiomarkersVisit);

  const { mine, defaults } = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = data.biomarkers.filter(
      (b) => !q || b.name.toLowerCase().includes(q) || (b.category ?? '').toLowerCase().includes(q),
    );
    return { mine: list.filter((b) => !b.builtin), defaults: list.filter((b) => b.builtin) };
  }, [data.biomarkers, query]);

  // Hold one of your own biomarkers to move it into a section (or out of all sections).
  const { drag, handle } = useDragToSection((id, section) => {
    const b = data.biomarkers.find((x) => x.id === id);
    if (!b || b.builtin || categoryOf(b) === section) return;
    dispatch({ type: 'biomarker/upsert', biomarker: { ...b, category: section || undefined } });
  });

  const searching = query.trim() !== '';
  const dragged = drag ? data.biomarkers.find((b) => b.id === drag.id) : undefined;
  const draggedInSection = !!dragged && categoryOf(dragged) !== '';
  const entriesOf = (ids: Set<string>) => data.entries.filter((e) => ids.has(e.biomarkerId)).length;
  const entriesNote = (n: number) => (n > 0 ? ` This also deletes ${n} logged entr${n === 1 ? 'y' : 'ies'}.` : '');

  const deleteBiomarker = (b: Biomarker) => {
    if (confirm(`Delete “${b.name}”?${entriesNote(entriesOf(new Set([b.id])))}`)) {
      dispatch({ type: 'biomarker/delete', id: b.id });
    }
  };

  const deleteSection = (category: string, items: Biomarker[]) => {
    const n = items.length;
    const ids = new Set(items.map((b) => b.id));
    const what = `the section “${category}” and its ${n === 1 ? 'biomarker' : `${n} biomarkers`}`;
    if (confirm(`Delete ${what}?${entriesNote(entriesOf(ids))}`)) {
      dispatch({ type: 'biomarker/deleteMany', ids: [...ids] });
    }
  };

  const renderCard = (b: Biomarker, mine: boolean) => {
    const card = (
      <button
        className={`card card-btn ${mine ? 'movable has-x' : ''} ${drag?.id === b.id ? 'lifted' : ''}`}
        onClick={() => setEditing(b)}
        {...(mine ? handle(b.id, b.name) : {})}
      >
        <div className="card-main">
          <strong>{b.name}</strong>
          {b.description && <span className="muted small">{b.description}</span>}
          <InfoChips infoTypes={b.infoTypes} />
        </div>
        {!mine && <Icon name="chevron" />}
      </button>
    );
    if (!mine) return card;
    return (
      <div className="with-x">
        {card}
        <button className="icon-btn x-btn" aria-label={`Delete ${b.name}`} onClick={() => deleteBiomarker(b)}>
          <Icon name="close" size={18} />
        </button>
      </div>
    );
  };

  return (
    <section className="view">
      <header className="view-header">
        <h1>Biomarkers</h1>
        <div className="header-actions">
          <button
            className={'icon-btn' + (introOpen ? ' active' : '')}
            onClick={() => setIntroOpen((o) => !o)}
            aria-label={introOpen ? 'Hide explanation' : 'What is a biomarker?'}
            aria-expanded={introOpen}
            title="What is a biomarker?"
          >
            <Icon name="info" size={22} />
          </button>
          <button className="btn primary" onClick={() => setEditing('new')}>
            <Icon name="plus" /> New
          </button>
        </div>
      </header>

      {introOpen && <BiomarkerIntro onClose={() => setIntroOpen(false)} />}

      <label className="search">
        <Icon name="search" size={18} />
        <input type="search" name="biomarker-search" autoComplete="off" placeholder="Search" value={query} onChange={(e) => setQuery(e.target.value)} />
      </label>

      <div className="list-heading">
        <h2>My biomarkers</h2>
        {mine.length > 0 && !searching && <span className="muted small">Hold one to move it</span>}
      </div>
      <div className={`drop-zone ${drag?.over === '' ? 'drop-over' : ''}`} data-drop="">
        {mine.length === 0 ? (
          <EmptyState title={searching ? 'No matches' : 'None yet'}>
            {!searching && 'Biomarkers you create with “New” appear here.'}
          </EmptyState>
        ) : (
          <BiomarkerGroups
            biomarkers={mine}
            searching={searching}
            droppable
            dropOver={drag?.over}
            onDeleteSection={deleteSection}
            renderItem={(b) => renderCard(b, true)}
          />
        )}
        {draggedInSection && (
          <div className={`drop-outside ${drag?.over === '' ? 'over' : ''}`}>Drop here to take it out of the section</div>
        )}
      </div>

      <div className="list-heading">
        <h2>Default biomarkers</h2>
      </div>
      {defaults.length === 0 ? (
        <EmptyState title={searching ? 'No matches' : 'No default biomarkers'} />
      ) : (
        <BiomarkerGroups biomarkers={defaults} searching={searching} renderItem={(b) => renderCard(b, false)} />
      )}

      {drag && (
        <div className="drag-ghost" style={{ left: drag.x, top: drag.y }} aria-hidden="true">
          {drag.label}
        </div>
      )}

      {editing &&
        (editing !== 'new' && editing.builtin ? (
          <DefaultBiomarkerSheet biomarker={editing} onClose={() => setEditing(null)} />
        ) : (
          <BiomarkerEditorSheet biomarker={editing === 'new' ? undefined : editing} onClose={() => setEditing(null)} />
        ))}
    </section>
  );
}
