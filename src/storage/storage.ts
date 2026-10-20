import type { AppData } from '../domain/types';

/**
 * Persistence boundary. The UI never touches localStorage directly, so this
 * can later be swapped for IndexedDB, a native store or a sync backend.
 */
export interface StorageAdapter {
  load(): AppData | null;
  save(data: AppData): void;
}
