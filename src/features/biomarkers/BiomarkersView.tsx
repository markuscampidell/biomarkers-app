import { useMemo, useState } from 'react';
import type { Biomarker } from '../../domain/types';
import { useStore } from '../../state/AppStore';
import { EmptyState } from '../../components/EmptyState';
import { Icon } from '../../components/Icon';
import { InfoChips } from '../../components/InfoChips';
import { BiomarkerEditorSheet } from './BiomarkerEditorSheet';
import { BiomarkerGroups } from '../../components/BiomarkerGroups';
import { BiomarkerIntro, isFirstBiomarkersVisit } from './BiomarkerIntro';

export function BiomarkersView() {
  const { data } = useStore();
  const [editing, setEditing] = useState<Biomarker | 'new' | null>(null);
  const [query, setQuery] = useState('');
  const [introOpen, setIntroOpen] = useState(isFirstBiomarkersVisit);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.biomarkers.filter(
      (b) => !q || b.name.toLowerCase().includes(q) || (b.category ?? '').toLowerCase().includes(q),
    );
  }, [data.biomarkers, query]);

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

      {list.length === 0 ? (
        <EmptyState title={query ? 'No matches' : 'No biomarkers yet'} />
      ) : (
        <BiomarkerGroups
          biomarkers={list}
          searching={query.trim() !== ''}
          renderItem={(b) => (
            <button className="card card-btn" onClick={() => setEditing(b)}>
              <div className="card-main">
                <strong>{b.name}</strong>
                {b.description && <span className="muted small">{b.description}</span>}
                <InfoChips infoTypes={b.infoTypes} />
              </div>
              <Icon name="chevron" />
            </button>
          )}
        />
      )}

      {editing && (
        <BiomarkerEditorSheet biomarker={editing === 'new' ? undefined : editing} onClose={() => setEditing(null)} />
      )}
    </section>
  );
}
