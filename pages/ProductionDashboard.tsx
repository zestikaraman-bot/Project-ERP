
import React, { useState, useEffect } from 'react';
import { db } from '../db';
import { SalesOrder, UserRole, Party, Item } from '../types';
import { 
  Play, CheckCircle, Flame, Beaker, Archive, Eye, 
  MapPin, Truck, Box, Package, ListChecks, 
  AlertCircle, ChevronRight, Activity, Zap, X, Save, Scale
} from 'lucide-react';

interface ProductionDashboardProps {
  role?: UserRole;
}

const ProductionDashboard: React.FC<ProductionDashboardProps> = ({ role }) => {
  const [activeOrders, setActiveOrders] = useState<SalesOrder[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  
  // Partial Ready States
  const [showPartialModal, setShowPartialModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null);
  const [partialQtys, setPartialQtys] = useState<Record<string, number>>({});

  const isReadOnly = role === UserRole.SALES;

  useEffect(() => {
    refreshAllData();
    const interval = setInterval(refreshAllData, 5000);
    return () => clearInterval(interval);
  }, []);

  const refreshAllData = () => {
    const all = db.getSalesOrders().filter(o => 
      ['APPROVED', 'IN_PRODUCTION', 'PARTIAL_READY'].includes(o.status)
    );
    setActiveOrders(all);
    setParties(db.getParties());
    setItems(db.getItems());
  };

  const updateOrder = (id: string, status: SalesOrder['status']) => {
    db.updateSalesOrderStatus(id, status);
    refreshAllData();
  };

  const openPartialModal = (order: SalesOrder) => {
    setSelectedOrder(order);
    const initialQtys: Record<string, number> = {};
    order.items.forEach(i => initialQtys[i.itemId] = i.quantity);
    setPartialQtys(initialQtys);
    setShowPartialModal(true);
  };

  const handlePartialSubmit = () => {
    if (!selectedOrder) return;

    const producedItems: any[] = [];
    const remainingItems: any[] = [];

    selectedOrder.items.forEach(item => {
      const readyQty = partialQtys[item.itemId] || 0;
      const leftover = item.quantity - readyQty;

      if (readyQty > 0) {
        producedItems.push({ 
          ...item, 
          quantity: readyQty, 
          bags: Math.ceil(readyQty / (items.find(i => i.id === item.itemId)?.standardBagWeight || 50)) 
        });
      }

      if (leftover > 0) {
        remainingItems.push({ 
          ...item, 
          quantity: leftover,
          bags: Math.ceil(leftover / (items.find(i => i.id === item.itemId)?.standardBagWeight || 50))
        });
      }
    });

    if (producedItems.length === 0) {
      alert("Please enter at least some quantity produced.");
      return;
    }

    db.splitSalesOrder(selectedOrder.id, producedItems, remainingItems);
    setShowPartialModal(false);
    setSelectedOrder(null);
    refreshAllData();
  };

  const getParty = (id: string) => parties.find(p => p.id === id);
  const getItem = (id: string) => items.find(i => i.id === id);

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-700">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-950 uppercase tracking-tight">Processing Floor</h2>
          <p className="text-slate-400 font-bold text-[11px] uppercase tracking-widest mt-2 flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500" />
            Live Batch Tracking &bull; Grinding Terminal
          </p>
        </div>
        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
           <div className="px-6 py-2.5 bg-slate-950 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">
              {activeOrders.length} Active Batches
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Main Processing Queue */}
        <div className="lg:col-span-8 space-y-6">
          {activeOrders.map(order => {
            const party = getParty(order.partyId);
            const totalKg = order.items.reduce((acc, i) => acc + i.quantity, 0);
            const totalBags = order.items.reduce((acc, i) => acc + i.bags, 0);

            return (
              <div key={order.id} className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden hover:shadow-2xl hover:shadow-slate-200/50 transition-all group">
                <div className="p-10 flex flex-col md:flex-row gap-10">
                  <div className="md:w-1/4 flex flex-col items-center justify-center p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100 text-center">
                    <div className={`p-5 rounded-2xl mb-4 ${
                      order.status === 'PARTIAL_READY' ? 'bg-amber-100 text-amber-600' :
                      order.status === 'IN_PRODUCTION' ? 'bg-orange-100 text-orange-600' : 'bg-slate-200 text-slate-400'
                    }`}>
                      {order.status === 'PARTIAL_READY' ? <Activity className="w-8 h-8" /> : <Box className="w-8 h-8" />}
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">Batch Status</p>
                    <p className={`text-xs font-black uppercase mt-2 ${
                      order.status === 'PARTIAL_READY' ? 'text-amber-600' :
                      order.status === 'IN_PRODUCTION' ? 'text-orange-600' : 'text-slate-400'
                    }`}>
                      {order.status.replace('_', ' ')}
                    </p>
                  </div>

                  <div className="flex-1 space-y-8">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-3xl font-black text-slate-950 uppercase tracking-tight leading-none">{order.orderNumber}</h3>
                        <div className="flex items-center gap-4 mt-3">
                          <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
                             <MapPin className="w-3 h-3" /> {party?.city || 'Unknown City'}
                          </span>
                          <span className="text-[10px] font-black text-slate-950 uppercase tracking-widest">{party?.name}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Ship Via</p>
                        <p className="text-sm font-black text-indigo-600 uppercase flex items-center gap-2 justify-end mt-1">
                          <Truck className="w-4 h-4" /> {order.logistics?.transporter || 'Self/TBD'}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {order.items.map((it, idx) => {
                        const itemData = getItem(it.itemId);
                        return (
                          <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex justify-between items-center">
                            <div>
                               <p className="text-[10px] font-black text-slate-400 uppercase">{itemData?.subCategory}</p>
                               <p className="text-sm font-black text-slate-900 uppercase">{itemData?.name}</p>
                            </div>
                            <div className="text-right">
                               <p className="text-sm font-black text-slate-950">{it.quantity} Kg</p>
                               <p className="text-[9px] font-bold text-slate-400 uppercase">{it.bags} Bags</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {!isReadOnly && (
                      <div className="flex gap-4">
                        {order.status === 'APPROVED' ? (
                          <button 
                            onClick={() => updateOrder(order.id, 'IN_PRODUCTION')}
                            className="flex-1 py-5 bg-orange-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-orange-700 active:scale-95 transition-all flex items-center justify-center gap-3"
                          >
                            <Play className="w-4 h-4 fill-current" /> Ignite Production
                          </button>
                        ) : (
                          <>
                            <button 
                              onClick={() => openPartialModal(order)}
                              className="px-8 py-5 bg-amber-500 text-slate-950 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-amber-400 active:scale-95 transition-all flex items-center justify-center gap-3"
                            >
                              <Scale className="w-4 h-4" /> Partial Ready
                            </button>
                            <button 
                              onClick={() => updateOrder(order.id, 'READY_TO_DISPATCH')}
                              className="flex-1 py-5 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center gap-3"
                            >
                              <CheckCircle className="w-4 h-4" /> Finish Entire Batch
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {activeOrders.length === 0 && (
            <div className="py-32 text-center bg-white rounded-[4rem] border border-dashed border-slate-200">
              <Activity className="w-16 h-16 text-slate-100 mx-auto mb-6" />
              <h3 className="text-slate-400 font-black uppercase text-xs tracking-[0.3em]">No Active Grinding Batches</h3>
            </div>
          )}
        </div>

        {/* Floor Analytics Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-slate-950 p-10 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-10">
                <Beaker className="w-40 h-40 rotate-12" />
             </div>
             <div className="relative z-10">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-8 flex items-center gap-2">
                   <div className="w-2 h-2 bg-amber-500 rounded-full" />
                   Quality Controls
                </h4>
                <div className="space-y-6">
                   {[
                     { l: 'Black Pepper', v: 9.2, limit: 11 },
                     { l: 'Cumin Pwd.', v: 7.5, limit: 9 },
                     { l: 'Turmeric Pwd.', v: 6.8, limit: 10 }
                   ].map(test => (
                     <div key={test.l} className="space-y-2">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                           <span>{test.l}</span>
                           <span className="text-amber-500">{test.v}%</span>
                        </div>
                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                           <div className="bg-amber-500 h-full" style={{ width: `${(test.v/test.limit)*100}%` }}></div>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Partial Ready Modal */}
      {showPartialModal && selectedOrder && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center z-[300] p-6">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
            <div className="p-8 border-b bg-slate-50 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Partial Completion</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Order: {selectedOrder.orderNumber}</p>
              </div>
              <button onClick={() => setShowPartialModal(false)} className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100 hover:bg-rose-50 hover:text-rose-500 transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-10 space-y-10">
              <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 flex gap-4">
                 <AlertCircle className="w-6 h-6 text-amber-500 shrink-0" />
                 <p className="text-xs font-bold text-amber-800 leading-relaxed uppercase tracking-wide">
                   Specify exactly how many Kgs are ready. The remaining balance will stay in the production queue as a pending part.
                 </p>
              </div>

              <div className="space-y-6">
                {selectedOrder.items.map((it, idx) => {
                  const itemData = getItem(it.itemId);
                  return (
                    <div key={idx} className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-6">
                         <div className="w-14 h-14 bg-white rounded-2xl border border-slate-200 flex items-center justify-center shadow-inner">
                            <Box className="w-7 h-7 text-slate-300" />
                         </div>
                         <div>
                            <p className="text-sm font-black text-slate-900 uppercase">{itemData?.name}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase">Max Order: {it.quantity} Kg</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right mr-4">
                           <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Produced (Kg)</p>
                           <input 
                              type="number"
                              value={partialQtys[it.itemId] || 0}
                              onChange={(e) => setPartialQtys({...partialQtys, [it.itemId]: Math.min(it.quantity, parseFloat(e.target.value) || 0)})}
                              className="w-24 p-3 bg-white border-2 border-slate-200 rounded-xl text-center font-black text-slate-900 focus:border-amber-500 outline-none"
                           />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button 
                onClick={handlePartialSubmit}
                className="w-full py-6 bg-slate-950 text-white rounded-[2rem] font-black text-sm uppercase tracking-[0.4em] shadow-2xl hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-4"
              >
                <Save className="w-5 h-5 text-amber-500" /> Process Partial Batch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductionDashboard;
