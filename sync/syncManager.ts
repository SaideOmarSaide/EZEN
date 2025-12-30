
import { EntityName, SyncAction } from '../types';
import { getStore } from '../db/database';
import { Repository } from '../db/repository';
import { supabase } from '../lib/supabase';

// As defined in db/database.ts
const ENTITY_STORES: EntityName[] = ['sales', 'suppliers', 'cash_sessions', 'cash_movements', 'receivables', 'payables', 'purchases'];

export class SyncManager {
  private static isSyncing = false;
  public static onSyncStatusChange: ((isSyncing: boolean) => void) | null = null;
  private static syncTimeout: NodeJS.Timeout | null = null;

  private static setSyncing(status: boolean) {
    this.isSyncing = status;
    if (this.onSyncStatusChange) {
      this.onSyncStatusChange(status);
    }
  }

  static sync() {
    if (this.syncTimeout) {
      clearTimeout(this.syncTimeout);
    }
    
    this.syncTimeout = setTimeout(() => {
      this.executeSyncInternal();
    }, 1000);
  }

  private static async executeSyncInternal() {
    if (this.isSyncing || !navigator.onLine) return;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    this.setSyncing(true);
    console.log('[Sync] Starting full sync process...');

    try {
      await this.pushLocalChanges(session.user.id);
      await this.pullRemoteChanges(session.user.id);
      console.log('[Sync] Full sync process completed.');
    } catch (err) {
      console.error('[Sync] Error during full sync process:', err);
    } finally {
      this.setSyncing(false);
    }
  }

  private static async pushLocalChanges(userId: string) {
    const syncStore = await getStore('sync_queue', 'readwrite');
    const actions: SyncAction[] = await new Promise((resolve, reject) => {
      const request = syncStore.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    if (actions.length === 0) {
      console.log('[Sync] No local changes to push.');
      return;
    }

    console.log(`[Sync] Pushing ${actions.length} local changes to Supabase...`);

    for (const action of actions) {
      try {
        await this.sendToBackend(action, userId);
        
        // On successful sync, remove from queue
        const store = await getStore('sync_queue', 'readwrite');
        await new Promise<void>((resolve, reject) => {
          const request = store.delete(action.id);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });

        // Update local item status only if it was not a DELETE action
        if (action.action !== 'DELETE') {
           const repo = new Repository<any>(action.entityName);
           await repo.update(action.entityId, { syncStatus: 'synced' });
        }

      } catch (err) {
        console.error(`[Sync] Failed to push action ${action.id}:`, err);
        if (!navigator.onLine) {
          console.log('[Sync] Offline, stopping push process.');
          throw new Error("Network offline, stopping sync.");
        }
      }
    }
     console.log(`[Sync] Finished pushing local changes.`);
  }

  private static async pullRemoteChanges(userId: string) {
    console.log(`[Sync] Pulling remote changes from Supabase...`);

    for (const entityName of ENTITY_STORES) {
      try {
        // 1. Fetch all data from remote
        const { data: remoteData, error } = await supabase
          .from(entityName)
          .select('*')
          .eq('user_id', userId);

        if (error) throw error;

        const repo = new Repository<any>(entityName);

        if (remoteData) {
          // 2. Get remote IDs
          const remoteIds = new Set(remoteData.map(item => item.id));

          // 3. Get local data
          const localData = await repo.getAll();
          const localIdsToDelete = [];

          // 4. Find local items that are no longer on the server
          for (const localItem of localData) {
            // Delete local item if it's not on the server and not pending creation
            if (!remoteIds.has(localItem.id) && localItem.syncStatus !== 'pending') {
              localIdsToDelete.push(localItem.id);
            }
          }

          // 5. Perform local deletion
          if (localIdsToDelete.length > 0) {
            console.log(`[Sync] Deleting ${localIdsToDelete.length} stale local records from '${entityName}'.`);
            await repo.bulkLocalDelete(localIdsToDelete);
          }

          // 6. Upsert remote data into local store
          if (remoteData.length > 0) {
            console.log(`[Sync] Fetched ${remoteData.length} records from '${entityName}'.`);
            await repo.bulkUpsert(remoteData);
          }
        }
      } catch (err) {
        console.error(`[Sync] Error pulling table '${entityName}':`, err);
        if (!navigator.onLine) {
          console.log('[Sync] Offline, stopping pull process.');
          throw new Error("Network offline, stopping sync.");
        }
      }
    }
    console.log(`[Sync] Finished pulling remote changes.`);
  }

  private static async sendToBackend(action: SyncAction, userId: string) {
    let payload: any;

    if (action.action === 'CREATE') {
      payload = { ...action.payload, user_id: userId };
    } else if (action.action === 'UPDATE') {
      payload = {
        id: action.entityId,
        ...action.payload,
        user_id: userId,
        updatedAt: new Date().toISOString(),
      };
    }

    if (action.action === 'DELETE') {
      const { error } = await supabase
        .from(action.entityName)
        .delete()
        .eq('id', action.entityId);
      
      if (error) throw new Error(`Supabase DELETE error: ${error.message}`);

    } else {
      // For CREATE or UPDATE, we use upsert.
      const { error } = await supabase
        .from(action.entityName)
        .upsert(payload);

      if (error) throw new Error(`Supabase UPSERT error: ${error.message}`);
    }
  }
}

// Listen for network changes to trigger sync
window.addEventListener('online', () => {
  console.log('[Sync] Back online, triggering sync.');
  SyncManager.sync();
});
