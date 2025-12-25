
export type SyncStatus = 'pending' | 'synced' | 'updated' | 'deleted';

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
  syncStatus: SyncStatus;
}

export interface User extends BaseEntity {
  name: string;
  email: string;
}

export interface Sale extends BaseEntity {
  itemDescription: string;
  quantity: number;
  unitPrice: number;
  total: number;
  paymentMethod: 'cash' | 'm-pesa' | 'transfer';
}

export interface CashSession extends BaseEntity {
  operatorName: string;
  openingBalance: number;
  closingBalance?: number;
  actualBalance?: number;
  status: 'open' | 'closed';
  openingTime: string;
  closingTime?: string;
  notes?: string;
}

export interface CashMovement extends BaseEntity {
  sessionId: string;
  type: 'entrance' | 'exit';
  description: string;
  category: string;
  amount: number;
}

export interface Receivable extends BaseEntity {
  customerName: string;
  description: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'overdue' | 'received';
  notes?: string;
}

export interface Payable extends BaseEntity {
  supplierName: string;
  description: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'overdue' | 'paid';
  notes?: string;
}

export interface Supplier extends BaseEntity {
  name: string;
  representative: string;
  phone: string;
  email: string;
  category: string;
  bankDetails: string;
  status: 'active' | 'blocked';
}

export interface Purchase extends BaseEntity {
  supplierId: string;
  date: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  invoiceNumber: string;
}

export type EntityName = 'sales' | 'suppliers' | 'cash_sessions' | 'cash_movements' | 'receivables' | 'payables' | 'purchases';

export interface SyncAction {
  id: string; 
  entityName: EntityName;
  entityId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  payload: any;
  timestamp: string;
}
