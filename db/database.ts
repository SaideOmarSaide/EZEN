
import { EntityName } from '../types';

const DB_NAME = 'FinManagerDB';
const DB_VERSION = 7; // Incrementado para adicionar índices

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
          const objectStore = db.createObjectStore(storeName, { keyPath: 'id' });
          objectStore.createIndex('createdAt', 'createdAt', { unique: false });
          objectStore.createIndex('syncStatus', 'syncStatus', { unique: false });

          if (storeName === 'sales') {
            objectStore.createIndex('paymentMethod', 'paymentMethod', { unique: false });
          }
          
          if (storeName === 'cash_movements') {
            objectStore.createIndex('sessionId', 'sessionId', { unique: false });
            objectStore.createIndex('type', 'type', { unique: false });
          }
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
