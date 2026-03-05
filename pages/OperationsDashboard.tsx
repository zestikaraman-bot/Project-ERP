
import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../db';
import { SalesOrder, UserRole, Party, Item } from '../types';
import { 
  Check, X, Truck, Box, Search, 
  ChevronRight, Save, IndianRupee, 
  Package, List, CheckCircle2, Receipt, 
  ShieldCheck, AlertCircle, Loader2,
  ArrowRight
} from 'lucide-react';

interface OperationsDashboardProps {
  role?: UserRole;
}

const OperationsDashboard: React.FC<OperationsDashboardProps> = ({ role }) => {
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'PRODUCTION' | 'LOGISTICS' | 'COMPLETED'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [transportFilter, setTransportFilter] = useState('ALL');
  
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const isReadOnly = role === UserRole.SALES;

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = () => {
    setOrders([...db.getSalesOrders()]);
    setParties(db.getParties());
    setItems(db.getItems());
  };

  const refreshOrders = () => {
    setOrders([...db.getSalesOrders()]);
  };

  const selectedOrder = useMemo(() => {
    return orders.find(o => o.id === selectedOrderId) || null;
  }, [orders, selectedOrderId]);

  const getPartyName = (id: string) => parties.find(p => p.id === id)?.name || 'Unknown Party';

  const transporters = useMemo(() => {
    return Array.from(new Set(orders.map(o => o.logistics?.transporter).filter(Boolean))) as string[];
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const partyName = getPartyName(o.partyId).toLowerCase();
      const orderNum = o.orderNumber.toLowerCase();
      const matchesSearch = partyName.includes(searchTerm.toLowerCase()) || orderNum.includes(searchTerm.toLowerCase());
      const matchesTransport = transportFilter === 'ALL' || o.logistics?.transporter === transportFilter;

      if (!matchesSearch || !matchesTransport) return false;

      switch (activeTab) {
        case 'PENDING': return o.status === 'PENDING';
        case 'PRODUCTION': return ['APPROVED', 'IN_PRODUCTION', 'PARTIAL_READY'].includes(o.status);
        case 'LOGISTICS': return o.status === 'READY_TO_DISPATCH' || o.status === 'DISPATCHED';
        case 'COMPLETED': return o.status === 'INVOICED' || o.status === 'CANCELLED';
        default: return true;
      }
    });
  }, [orders, searchTerm, transportFilter, activeTab, parties]);

  const handleUpdateStatus = async (id: string, newStatus: SalesOrder['status']) => {
    setIsProcessing(true);
    try {
      // 1. Force write to DB
      db.updateSalesOrderStatus(id, newStatus);
      
      // 2. Local immediate update to prevent lag
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
      
      // 3. Clear modal after short visual feedback
      setTimeout(() => {
        setIsProcessing(false);
        setSelectedOrderId(null);
      }, 500);
      
    } catch (err) {
      alert("DB Error: Order status update failed.");
      setIsProcessing(false);
    }
  };

  const statusColors: Record<string, string> = {
    'PENDING': 'bg-slate-100 text-slate-600 border-slate-200',
    'APPROVED': 'bg-emerald-100 text-emerald-700 border-emerald-300',
    'IN_PRODUCTION': 'bg-orange-100 text-orange-700 border-orange-300',
    'PARTIAL_READY': 'bg-amber-100 text-amber-700 border-amber-300',
    'READY_TO_DISPATCH': 'bg-indigo-100 text-indigo-700 border-indigo-300',
    'DISPATCHED': 'bg-blue-100 text-blue-700 border-blue-300',
    'INVOICED': 'bg-slate-950 text-white border-slate-900',
    'CANCELLED': 'bg-rose-100 text-rose-700 border-rose-300',
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-950 uppercase tracking-tight">Operations Control</h2>
          <p className="text-slate-400 font-bold text-[11px] uppercase tracking-widest mt-2 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-500" />
            Supply Chain Command Hub &bull; Approval Pipeline
          </p>
        </div>
        
        <div className="flex gap-2 p-1.5 bg-white border border-slate-200 rounded-[1.5rem] shadow-sm overflow-x-auto no-scrollbar max-w-full">
          {(['ALL', 'PENDING', 'PRODUCTION', 'LOGISTICS', 'COMPLETED'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab ? 'bg-slate-950 text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-[3.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b bg-slate-50/50 flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="flex flex-col md:flex-row gap-4 flex-1 w-full">
            <div className="relative flex-1 md:max-w-xs group">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search Orders..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
                className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-amber-500/5 outline-none transition-all" 
              />
            </div>
            <div className="relative">
              <Truck className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <select 
                value={transportFilter} 
                onChange={e => setTransportFilter(e.target.value)} 
                className="appearance-none pl-12 pr-10 py-4 bg-white border border-slate-200 rounded-2xl text-xs font-bold outline-none min-w-[200px]"
              >
                <option value="ALL">All Logistics</option>
                {transporters.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="px-6 py-3 bg-slate-100 rounded-2xl font-black text-[10px] text-slate-400 uppercase tracking-widest">
            {filteredOrders.length} Shipments Visible
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">
              <tr>
                <th className="px-10 py-6">Reference</th>
                <th className="px-10 py-6">Customer Master</th>
                <th className="px-10 py-6 text-center">Net Weight</th>
                <th className="px-10 py-6">State</th>
                <th className="px-10 py-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm font-bold">
              {filteredOrders.map((order) => {
                const totalKgs = order.items.reduce((acc, i) => acc + i.quantity, 0);
                return (
                  <tr key={order.id} className="group hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => setSelectedOrderId(order.id)}>
                    <td className="px-10 py-8">
                      <p className="font-black text-slate-950 uppercase tracking-tight text-base">{order.orderNumber}</p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-1.5">{new Date(order.orderDate).toLocaleDateString()}</p>
                    </td>
                    <td className="px-10 py-8">
                      <p className="uppercase text-slate-700 text-sm tracking-tight font-black">{getPartyName(order.partyId)}</p>
                    </td>
                    <td className="px-10 py-8 text-center font-black text-slate-950 text-lg tracking-tighter">{totalKgs.toLocaleString()} Kg</td>
                    <td className="px-10 py-8">
                      <span className={`inline-flex px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border ${statusColors[order.status]}`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <button className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-300 group-hover:text-slate-950 group-hover:border-slate-950 hover:shadow-xl transition-all">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredOrders.length === 0 && (
            <div className="py-24 text-center">
              <Package className="w-20 h-20 text-slate-100 mx-auto mb-6" />
              <p className="text-slate-400 font-bold uppercase text-[11px] tracking-[0.4em]">Queue Clear</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Hub */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-2xl flex items-center justify-center z-[200] p-4 lg:p-12 overflow-hidden">
          <div className="bg-[#F8FAFC] w-full max-w-6xl h-full max-h-[92vh] rounded-[4rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 border border-white/10">
            <div className="px-12 py-10 bg-white border-b flex justify-between items-center shrink-0">
              <div className="flex items-center gap-10">
                <div className={`p-7 rounded-[2.25rem] border-2 shadow-2xl ${statusColors[selectedOrder.status]}`}>
                  <Package className="w-12 h-12" />
                </div>
                <div>
                  <h3 className="text-5xl font-black text-slate-950 uppercase tracking-tight leading-none">{selectedOrder.orderNumber}</h3>
                  <p className="text-sm font-black text-slate-400 uppercase tracking-widest mt-4">{getPartyName(selectedOrder.partyId)}</p>
                </div>
              </div>
              <button onClick={() => setSelectedOrderId(null)} className="p-6 bg-slate-100 hover:bg-slate-200 rounded-[1.75rem] transition-all">
                <X className="w-8 h-8 text-slate-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-12 space-y-12">
              {selectedOrder.status === 'PENDING' && !isReadOnly && (
                <div className="bg-emerald-600 p-12 rounded-[3.5rem] flex flex-col md:flex-row items-center justify-between gap-12 text-white shadow-2xl shadow-emerald-900/40">
                  <div>
                    <h4 className="text-3xl font-black uppercase tracking-tight">Approve for Production</h4>
                    <p className="text-xs font-bold text-white/70 uppercase tracking-[0.3em] mt-3">Move to factory floor for grinding and packing.</p>
                  </div>
                  <button 
                    disabled={isProcessing}
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'APPROVED')}
                    className="w-full md:w-auto px-20 py-7 bg-white text-emerald-700 rounded-[2.25rem] font-black text-sm uppercase tracking-[0.3em] hover:scale-105 transition-all disabled:opacity-50"
                  >
                    {isProcessing ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : 'APPROVE NOW'}
                  </button>
                </div>
              )}

              {/* Order Content */}
              <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm space-y-10">
                 <h4 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.5em] flex items-center gap-4">
                   <List className="w-6 h-6 text-amber-500" /> Shipment Manifest
                 </h4>
                 <div className="space-y-6">
                    {selectedOrder.items.map((oi, i) => {
                      const itemData = items.find(it => it.id === oi.itemId);
                      return (
                        <div key={i} className="flex items-center justify-between p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                          <div className="flex items-center gap-8">
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center border border-slate-200 shadow-sm">
                               <Box className="w-8 h-8 text-slate-300" />
                            </div>
                            <div>
                              <p className="text-xl font-black text-slate-950 uppercase">{itemData?.name}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{itemData?.sku}</p>
                            </div>
                          </div>
                          <div className="text-right">
                             <p className="text-2xl font-black text-slate-950">{oi.quantity} Kg</p>
                             <p className="text-[10px] font-black text-indigo-500 uppercase">{oi.bags} Bags</p>
                          </div>
                        </div>
                      );
                    })}
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OperationsDashboard;
