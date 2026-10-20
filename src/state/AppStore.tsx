import { createContext, useContext, useEffect, useReducer, type Dispatch, type ReactNode } from 'react';
import { SCHEMA_VERSION, type AppData } from '../domain/types';
import { presetBiomarkers } from '../domain/presets';
import type { StorageAdapter } from '../storage/storage';
import { reducer, type Action } from './reducer';

interface Store {
  data: AppData;
  dispatch: Dispatch<Action>;
}

const StoreContext = createContext<Store | null>(null);

function initialData(storage: StorageAdapter): AppData {
  return (
    storage.load() ?? {
      schemaVersion: SCHEMA_VERSION,
      biomarkers: presetBiomarkers(),
      plans: [],
      entries: [],
    }
  );
}

export function AppStoreProvider({ storage, children }: { storage: StorageAdapter; children: ReactNode }) {
  const [data, dispatch] = useReducer(reducer, storage, initialData);

  useEffect(() => {
    storage.save(data);
  }, [data, storage]);

  return <StoreContext.Provider value={{ data, dispatch }}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const store = useContext(StoreContext);
  if (!store) throw new Error('useStore must be used inside <AppStoreProvider>');
  return store;
}
