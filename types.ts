
export enum UserRole {
  ADMIN = 'ADMIN',
  SALES = 'SALES',
  PURCHASE = 'PURCHASE',
  OPERATIONS = 'OPERATIONS',
  PRODUCTION = 'PRODUCTION',
  ACCOUNTS = 'ACCOUNTS'
}

export interface User {
  id: string;
  username: string;
  role: UserRole;
  fullName: string;
}

export interface Party {
  id: string;
  name: string;
  type: 'CUSTOMER' | 'SUPPLIER' | 'BOTH';
  gstin: string;
  city: string;
  state: string;
  outstanding: number;
  preferredTransporter?: string;
}

export interface Item {
  id: string;
  name: string;
  category: 'RAW' | 'FINISHED';
  subCategory?: string;
  sku: string;
  price: number;
  stock: number;
  reorderLevel: number;
  grade?: string;
  standardBagWeight?: number;
}

export interface SalesOrder {
  id: string;
  orderNumber: string;
  partyId: string;
  items: { 
    itemId: string; 
    quantity: number; 
    bags: number;     
    rate: number; 
    grade?: string; 
  }[];
  totalAmount: number;
  status: 'PENDING' | 'APPROVED' | 'IN_PRODUCTION' | 'PARTIAL_READY' | 'READY_TO_DISPATCH' | 'DISPATCHED' | 'INVOICED' | 'CANCELLED';
  orderDate: string;
  taxType: 'INCLUDED' | 'EXCLUDED';
  transportPaidBy: 'CUSTOMER' | 'COMPANY';
  approvalDate?: string;
  logistics?: {
    transporter: string;
    lrNumber: string;
    dispatchDate: string;
    totalBags: number;
  };
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  orderDate: string;
  partyId: string;
  itemId: string;
  kgs: number;
  bags: number;
  purchaseRate: number;
  transportName: string;
  transportRate: number;
  lrNumber: string;
  expectedArrivalDate: string;
  deliveryType: 'Door Delivery' | 'Godown Delivery';
  status: 'Pending' | 'Arrived' | 'Cancelled';
}

export interface ProductionEntry {
  id: string;
  batchNumber: string;
  orderId: string;
  itemId: string;
  quantityProduced: number;
  entryDate: string;
  status: 'IN_PROGRESS' | 'COMPLETED';
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  orderId: string;
  partyId: string;
  date: string;
  amount: number;
  taxAmount: number;
  total: number;
  type: 'SALES' | 'PURCHASE';
}

export interface LedgerEntry {
  id: string;
  partyId: string;
  date: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
}
