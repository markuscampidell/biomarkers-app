import { SCHEMA_VERSION } from '../domain/types';
import type { StorageAdapter } from './storage';
import { migrate } from './migrations';

const KEY = 'biomarkers-app/data';

export const localStorageAdapter: StorageAdapter = {
  load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return null;
      return migrate(JSON.parse(raw));
    } catch (err) {
      console.error('Could not load saved data', err);
      return null;
    }
  },
  save(data) {
    try {
      localStorage.setItem(KEY, JSON.stringify({ ...data, schemaVersion: SCHEMA_VERSION }));
    } catch (err) {
      console.error('Could not save data', err);
    }
  },
};
