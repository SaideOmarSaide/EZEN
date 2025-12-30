import { BaseEntity, EntityName, SyncAction, CashSession, Sale, CashMovement } from '../types';
import { getStore } from './database';

export class Repository<T extends BaseEntity> {
  constructor(private entityName: EntityName) {}

  async getAll(): Promise<T[]> {
    const store = await getStore(this.entityName);
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getById(id: string): Promise<T | undefined> {
    const store = await getStore(this.entityName);
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async save(data: Omit<T, keyof BaseEntity>): Promise<T> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    
    const entity: T = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
      syncStatus: 'pending'
    } as T;

    // 1. Save to main store
    const store = await getStore(this.entityName, 'readwrite');
    await new Promise((resolve, reject) => {
      const request = store.add(entity);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    // 2. Add to sync queue
    const syncQueue = await getStore('sync_queue', 'readwrite');
    const syncAction: SyncAction = {
      id: crypto.randomUUID(),
      entityName: this.entityName,
      entityId: id,
      action: 'CREATE',
      payload: entity,
      timestamp: now
    };
    
    await new Promise((resolve, reject) => {
      const request = syncQueue.add(syncAction);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    return entity;
  }

  // Generic update method to handle partial updates and sync queueing
  async update(id: string, updates: Partial<T>): Promise<void> {
    const entity = await this.getById(id);
    if (!entity) return;

    const now = new Date().toISOString();
    const updatedEntity: T = {
      ...entity,
      ...updates,
      updatedAt: now,
      // Default to 'updated' sync status unless explicitly set (e.g., to 'synced')
      syncStatus: (updates.syncStatus || 'updated') as T['syncStatus']
    };

    const store = await getStore(this.entityName, 'readwrite');
    // Fix: Added <void> to Promise constructor to allow resolve() without arguments
    await new Promise<void>((resolve, reject) => {
      const request = store.put(updatedEntity);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    // If this is a local update (not just marking as synced by the SyncManager), add to sync queue
    if (updatedEntity.syncStatus !== 'synced') {
      const syncQueue = await getStore('sync_queue', 'readwrite');
      const syncAction: SyncAction = {
        id: crypto.randomUUID(),
        entityName: this.entityName,
        entityId: id,
        action: 'UPDATE',
        payload: updatedEntity,
        timestamp: now
      };
      
      // Fix: Added <void> to Promise constructor to allow resolve() without arguments
      await new Promise<void>((resolve, reject) => {
        const request = syncQueue.add(syncAction);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }
  }

  async updateStatus(id: string, status: T['syncStatus']): Promise<void> {
    return this.update(id, { syncStatus: status } as Partial<T>);
  }

  async delete(id: string): Promise<void> {
    // 1. Add to sync queue
    const syncQueue = await getStore('sync_queue', 'readwrite');
    const syncAction: SyncAction = {
      id: crypto.randomUUID(),
      entityName: this.entityName,
      entityId: id,
      action: 'DELETE',
      payload: { id },
      timestamp: new Date().toISOString()
    };

    await new Promise<void>((resolve, reject) => {
      const request = syncQueue.add(syncAction);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
    
    // 2. Delete from main store
    const store = await getStore(this.entityName, 'readwrite');
    await new Promise<void>((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async bulkLocalDelete(ids: string[]): Promise<void> {
    const store = await getStore(this.entityName, 'readwrite');
    const transaction = store.transaction;

    return new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);

      ids.forEach(id => {
        store.delete(id);
      });
    });
  }

  async bulkUpsert(items: T[]): Promise<void> {
    const store = await getStore(this.entityName, 'readwrite');
    const transaction = store.transaction;

    return new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);

      items.forEach(item => {
        // Here we explicitly set syncStatus to 'synced'
        // because we assume data coming from the server is the source of truth.
        const itemToUpsert: T = { ...item, syncStatus: 'synced' };
        store.put(itemToUpsert);
      });
    });
  }
}


export const getClosedCashierSessions = async (): Promise<CashSession[]> => {
  const store = await getStore('cash_sessions');
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => {
      const sessions = request.result as CashSession[];
      resolve(sessions.filter(s => s.status === 'closed'));
    };
    request.onerror = () => reject(request.error);
  });
};

export const getCashierSessionWithDetails = async (sessionId: string) => {
  const sessionRepo = new Repository<CashSession>('cash_sessions');
  const salesRepo = new Repository<Sale>('sales');
  const movementRepo = new Repository<CashMovement>('cash_movements');

  const session = await sessionRepo.getById(sessionId);
  if (!session) {
    return null;
  }

  const [allSales, allMovements] = await Promise.all([
    salesRepo.getAll(),
    movementRepo.getAll()
  ]);

  const sessionSales = allSales.filter(s => {
    const saleTime = new Date(s.createdAt).getTime();
    const startTime = new Date(session.openingTime).getTime();
    const endTime = session.closingTime ? new Date(session.closingTime).getTime() : Infinity;
    return saleTime >= startTime && saleTime <= endTime;
  });

  const sessionMovements = allMovements.filter(m => m.sessionId === session.id);

  return {
    session,
    sales: sessionSales,
    movements: sessionMovements,
  };
};