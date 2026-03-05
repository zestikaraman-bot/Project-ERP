
import { User, UserRole, Party, Item, SalesOrder, PurchaseOrder, ProductionEntry, Invoice, LedgerEntry } from './types';

const DEFAULT_USERS: User[] = [
  { id: '1', username: 'admin', role: UserRole.ADMIN, fullName: 'System Administrator' },
  { id: '2', username: 'sales_user', role: UserRole.SALES, fullName: 'Sales Manager' },
  { id: '3', username: 'purchase_user', role: UserRole.PURCHASE, fullName: 'Procurement Head' },
  { id: '4', username: 'ops_user', role: UserRole.OPERATIONS, fullName: 'Operations Head' },
  { id: '5', username: 'prod_user', role: UserRole.PRODUCTION, fullName: 'Plant Supervisor' },
  { id: '6', username: 'acc_user', role: UserRole.ACCOUNTS, fullName: 'Finance Lead' },
];

const DEFAULT_ITEMS: Item[] = [
  // BLACK PEPPER
  { id: 'bp1', name: 'SUPER RAAS', category: 'RAW', subCategory: 'BLACK PEPPER', sku: 'BP-SR', price: 775, stock: 1000, reorderLevel: 100, grade: 'Standard', standardBagWeight: 50 },
  { id: 'bp2', name: 'RAAS', category: 'RAW', subCategory: 'BLACK PEPPER', sku: 'BP-R', price: 765, stock: 588, reorderLevel: 100, grade: 'A-Grade', standardBagWeight: 50 },
  { id: 'bp3', name: '570 LTR (SACHHA MOTI)', category: 'RAW', subCategory: 'BLACK PEPPER', sku: 'BP-SM', price: 830, stock: 500, reorderLevel: 100, grade: 'Premium', standardBagWeight: 50 },
  { id: 'bp4', name: '590/600 LTR 12 NO', category: 'RAW', subCategory: 'BLACK PEPPER', sku: 'BP-12N', price: 840, stock: 138, reorderLevel: 100, grade: 'B-Grade', standardBagWeight: 50 },
  { id: 'bp5', name: 'GOLGAPPA', category: 'RAW', subCategory: 'BLACK PEPPER', sku: 'BP-GG', price: 840, stock: 500, reorderLevel: 100, grade: 'Standard', standardBagWeight: 50 },
  
  // CARDAMOM
  { id: 'cd1', name: 'FATOL (8 MM)', category: 'RAW', subCategory: 'CARDAMOM', sku: 'CD-F8', price: 2850, stock: 14, reorderLevel: 5, grade: 'A-Grade', standardBagWeight: 25 },
  { id: 'cd2', name: 'FATOL (7/8 MM)', category: 'RAW', subCategory: 'CARDAMOM', sku: 'CD-F78', price: 2625, stock: 242, reorderLevel: 50, grade: 'B-Grade', standardBagWeight: 25 },
  { id: 'cd3', name: '7 MM', category: 'RAW', subCategory: 'CARDAMOM', sku: 'CD-7M', price: 2800, stock: 133, reorderLevel: 20, grade: 'Standard', standardBagWeight: 25 },
  
  // BLACK PEPPER POWDER
  { id: 'bpp1', name: 'A/3', category: 'FINISHED', subCategory: 'PEPPER POWDER', sku: 'PP-A3', price: 335, stock: 120, reorderLevel: 50, grade: 'Fine', standardBagWeight: 25 },
  { id: 'bpp2', name: 'A/4', category: 'FINISHED', subCategory: 'PEPPER POWDER', sku: 'PP-A4', price: 300, stock: 450, reorderLevel: 50, grade: 'Coarse', standardBagWeight: 25 },
];

const DEFAULT_PARTIES: Party[] = [
  { id: 'p1', name: 'Farmer Connect Cooperative', type: 'SUPPLIER', gstin: '27AAAAA0000A1Z5', city: 'Guntur', state: 'Andhra Pradesh', outstanding: -150000, preferredTransporter: 'VRL Logistics' },
  { id: 'p2', name: 'Spice Route Distributors', type: 'CUSTOMER', gstin: '27BBBBB1111B2Z6', city: 'Mumbai', state: 'Maharashtra', outstanding: 425000, preferredTransporter: 'BlueDart Spices Express' },
];

const DEFAULT_DASHBOARD_CONFIG = {
  showSales: true,
  showCustomers: true,
  showProduction: true,
  showOrders: true,
  showComparisonChart: true,
  showGrowthChart: true,
};

class Database {
  private getData<T>(key: string, defaults: T): T {
    const data = localStorage.getItem(`erp_${key}`);
    return data ? JSON.parse(data) : defaults;
  }

  private setData<T>(key: string, data: T): void {
    localStorage.setItem(`erp_${key}`, JSON.stringify(data));
  }

  getUsers = () => this.getData<User[]>('users', DEFAULT_USERS);
  addUser = (user: User) => {
    const users = this.getUsers();
    this.setData('users', [...users, user]);
  };

  getParties = () => this.getData<Party[]>('parties', DEFAULT_PARTIES);
  addParty = (party: Party) => {
    const parties = this.getParties();
    this.setData('parties', [...parties, party]);
  };

  getItems = () => this.getData<Item[]>('items', DEFAULT_ITEMS);
  addItem = (item: Item) => {
    const items = this.getItems();
    this.setData('items', [...items, item]);
  };

  updateItemStock = (itemId: string, diff: number) => {
    const items = this.getItems();
    const updated = items.map(it => it.id === itemId ? { ...it, stock: it.stock + diff } : it);
    this.setData('items', updated);
  };
  
  updateItem = (updatedItem: Item) => {
    const items = this.getItems();
    const updated = items.map(it => it.id === updatedItem.id ? updatedItem : it);
    this.setData('items', updated);
  };

  bulkUpdatePrices = (updates: { id: string, price: number }[]) => {
    const items = this.getItems();
    const updated = items.map(item => {
      const update = updates.find(u => u.id === item.id);
      return update ? { ...item, price: update.price } : item;
    });
    this.setData('items', updated);
  };

  getSalesOrders = () => this.getData<SalesOrder[]>('sales_orders', []);
  addSalesOrder = (order: SalesOrder) => {
    const orders = this.getSalesOrders();
    this.setData('sales_orders', [...orders, order]);
    // Deduct stock immediately on order creation
    order.items.forEach(item => {
      this.updateItemStock(item.itemId, -item.quantity);
    });
  };

  updateSalesOrder = (updatedOrder: SalesOrder) => {
    const orders = this.getSalesOrders();
    const updated = orders.map(o => o.id === updatedOrder.id ? updatedOrder : o);
    this.setData('sales_orders', updated);
  };

  // Logic to handle partial completion by splitting orders
  splitSalesOrder = (originalOrderId: string, producedItems: any[], remainingItems: any[]) => {
    const orders = this.getSalesOrders();
    const original = orders.find(o => o.id === originalOrderId);
    if (!original) return;

    const remainingOrders = orders.filter(o => o.id !== originalOrderId);

    // 1. New Order for PRODUCED part (Status: READY_TO_DISPATCH)
    const producedOrder: SalesOrder = {
      ...original,
      id: Math.random().toString(36).substr(2, 9),
      orderNumber: `${original.orderNumber}-PART`,
      items: producedItems,
      totalAmount: producedItems.reduce((acc, i) => acc + (i.rate * i.quantity), 0),
      status: 'READY_TO_DISPATCH',
      approvalDate: original.approvalDate || new Date().toISOString(),
    };

    let updatedOrders = [...remainingOrders, producedOrder];

    // 2. If there are remaining items, keep original order but update it
    if (remainingItems.length > 0) {
      const updatedOriginal: SalesOrder = {
        ...original,
        items: remainingItems,
        totalAmount: remainingItems.reduce((acc, i) => acc + (i.rate * i.quantity), 0),
        status: 'APPROVED' // Reset to approved/pending for floor
      };
      updatedOrders.push(updatedOriginal);
    }

    this.setData('sales_orders', updatedOrders);
  };

  updateSalesOrderStatus = (orderId: string, status: SalesOrder['status']) => {
    const orders = this.getSalesOrders();
    const updated = orders.map(o => {
      if (o.id === orderId) {
        // Handle stock return for cancellations
        if (status === 'CANCELLED' && o.status !== 'CANCELLED') {
          o.items.forEach(item => {
            this.updateItemStock(item.itemId, item.quantity);
          });
        }
        
        // Handle Approval Date tracking
        const approvalDate = status === 'APPROVED' ? new Date().toISOString() : o.approvalDate;
        
        return { ...o, status, approvalDate };
      }
      return o;
    });
    this.setData('sales_orders', updated);
  };

  getPurchases = () => this.getData<PurchaseOrder[]>('purchases', []);
  addPurchase = (entry: PurchaseOrder) => {
    const purchases = this.getPurchases();
    this.setData('purchases', [...purchases, entry]);
    if (entry.status === 'Arrived') {
      this.updateItemStock(entry.itemId, entry.kgs);
    }
  };
  updatePurchaseStatus = (id: string, status: PurchaseOrder['status']) => {
    const purchases = this.getPurchases();
    const updated = purchases.map(p => {
      if (p.id === id) {
        if (status === 'Arrived' && p.status !== 'Arrived') {
          this.updateItemStock(p.itemId, p.kgs);
        } else if (status !== 'Arrived' && p.status === 'Arrived') {
          this.updateItemStock(p.itemId, -p.kgs);
        }
        return { ...p, status };
      }
      return p;
    });
    this.setData('purchases', updated);
  };

  getDashboardConfig = () => this.getData('dashboard_config', DEFAULT_DASHBOARD_CONFIG);
  setDashboardConfig = (config: typeof DEFAULT_DASHBOARD_CONFIG) => this.setData('dashboard_config', config);

  exportToExcel = (table: string) => {
    const data = localStorage.getItem(`erp_${table}`);
    if (!data) return;
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `spice_erp_${table}.json`;
    a.click();
  };

  backupAll = () => {
    const fullState = {
      users: this.getUsers(),
      parties: this.getParties(),
      items: this.getItems(),
      sales_orders: this.getSalesOrders(),
      purchases: this.getPurchases(),
      dashboard_config: this.getDashboardConfig()
    };
    const blob = new Blob([JSON.stringify(fullState)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `spice_full_backup_${new Date().toISOString()}.json`;
    a.click();
  };
}

export const db = new Database();
