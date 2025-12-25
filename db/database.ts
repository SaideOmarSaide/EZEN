
import { EntityName } from '../types';

const DB_NAME = 'FinManagerDB';
const DB_VERSION = 6; // Incrementado para store de purchases

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      const stores: EntityName[] = ['sales', 'suppliers', 'cash_sessions', 'cash_movements', 'receivables', 'payables', 'purchases'];
      stores.forEach(storeName => {
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: 'id' });
        }
      });

      if (!db.objectStoreNames.contains('sync_queue')) {
        db.createObjectStore('sync_queue', { keyPath: 'id' });
      }
    };
  });
};

export const getStore = async (storeName: string, mode: IDBTransactionMode = 'readonly') => {
  const db = await initDB();
  const transaction = db.transaction(storeName, mode);
  return transaction.objectStore(storeName);
};
