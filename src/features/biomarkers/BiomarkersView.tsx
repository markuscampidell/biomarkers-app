import { useMemo, useState } from 'react';
import type { Biomarker } from '../../domain/types';
import { useStore } from '../../state/AppStore';
import { EmptyState } from '../../components/EmptyState';
import { Icon } from '../../components/Icon';
import { InfoChips } from '../../components/InfoChips';
import { BiomarkerEditorSheet } from './BiomarkerEditorSheet';

export function BiomarkersView() {
  const { data } = useStore();
  const [editing, setEditing] = useState<Biomarker | 'new' | null>(null);
  const [query, setQuery] = useState('');

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.biomarkers
      .filter((b) => !q || b.name.toLowerCase().includes(q))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [data.biomarkers, query]);

  return (
    <section className="view">
      <header className="view-header">
        <h1>Biomarkers</h1>
        <button className="btn primary" onClick={() => setEditing('new')}>
          <Icon name="plus" /> New
        </button>
      </header>

      <label className="search">
        <Icon name="search" size={18} />
        <input placeholder="Search" value={query} onChange={(e) => setQuery(e.target.value)} />
      </label>

      {list.length === 0 ? (
        <EmptyState title={query ? 'No matches' : 'No biomarkers yet'} />
      ) : (
        <ul className="list">
          {list.map((b) => (
            <li key={b.id}>
              <button className="card card-btn" onClick={() => setEditing(b)}>
                <div className="card-main">
                  <strong>{b.name}</strong>
                  {b.description && <span className="muted small">{b.description}</span>}
                  <InfoChips infoTypes={b.infoTypes} />
                </div>
                <Icon name="chevron" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {editing && (
        <BiomarkerEditorSheet biomarker={editing === 'new' ? undefined : editing} onClose={() => setEditing(null)} />
      )}
    </section>
  );
}
