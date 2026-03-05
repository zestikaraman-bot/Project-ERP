
import React, { useState, useEffect } from 'react';
import { Truck, Search, Plus, X, Check, Save, Filter, Download, ChevronDown } from 'lucide-react';
import { db } from '../db';
import { PurchaseOrder, Party, Item } from '../types';

const PurchaseDashboard: React.FC = () => {
  const [purchases, setPurchases] = useState<PurchaseOrder[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [formData, setFormData] = useState<Partial<PurchaseOrder>>({
    orderDate: new Date().toISOString().split('T')[0],
    kgs: 0,
    bags: 0,
    purchaseRate: 0,
    transportRate: 0,
    deliveryType: 'Door Delivery',
    status: 'Pending'
  });

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setPurchases(db.getPurchases());
    setParties(db.getParties().filter(p => p.type !== 'CUSTOMER'));
    setItems(db.getItems().filter(i => i.category === 'RAW'));
  };

  const handleStatusChange = (id: string, newStatus: PurchaseOrder['status']) => {
    db.updatePurchaseStatus(id, newStatus);
    refreshData();
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.partyId || !formData.itemId) return;

    const newEntry: PurchaseOrder = {
      id: Math.random().toString(36).substr(2, 9),
      poNumber: (purchases.length + 1).toString(),
      orderDate: formData.orderDate!,
      partyId: formData.partyId!,
      itemId: formData.itemId!,
      kgs: Number(formData.kgs) || 0,
      bags: Number(formData.bags) || 0,
      purchaseRate: Number(formData.purchaseRate) || 0,
      transportName: formData.transportName || '',
      transportRate: Number(formData.transportRate) || 0,
      lrNumber: formData.lrNumber || '',
      expectedArrivalDate: formData.expectedArrivalDate || '',
      deliveryType: formData.deliveryType as any,
      status: formData.status as any,
    };

    db.addPurchase(newEntry);
    refreshData();
    setShowNewEntry(false);
  };

  const getPartyName = (id: string) => parties.find(p => p.id === id)?.name || 'Unknown';
  const getItemName = (id: string) => items.find(i => i.id === id)?.name || 'Unknown';

  const filteredPurchases = purchases.filter(p => 
    getPartyName(p.partyId).toLowerCase().includes(searchTerm.toLowerCase()) ||
    getItemName(p.itemId).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Purchase & Inward Log</h2>
          <p className="text-gray-500 font-medium">Tracking whole spice procurement and logistics</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => db.exportToExcel('purchases')}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all font-bold text-sm shadow-sm"
          >
            <Download className="w-4 h-4" />
            Excel Export
          </button>
          <button 
            onClick={() => setShowNewEntry(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 shadow-lg shadow-green-100 font-bold transition-all hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" />
            New Purchase Entry
          </button>
        </div>
      </div>

      {/* Excel Style Data Grid */}
      <div className="bg-[#e9f5ed] border border-[#c3e6cb] rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[#c3e6cb] flex items-center justify-between">
           <div className="relative w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search entries..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-[#c3e6cb] rounded-lg text-xs bg-white outline-none focus:ring-2 focus:ring-green-500/20"
              />
           </div>
           <div className="flex items-center gap-4 text-[10px] font-black text-green-700 uppercase tracking-widest">
              <span>View: All Inward</span>
              <Filter className="w-3.5 h-3.5" />
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#d4edda] text-[10px] font-black text-green-800 uppercase border-b border-[#c3e6cb]">
              <tr>
                <th className="px-4 py-3 border-r border-[#c3e6cb] text-center w-12">No.</th>
                <th className="px-4 py-3 border-r border-[#c3e6cb]">Date</th>
                <th className="px-4 py-3 border-r border-[#c3e6cb]">Party Name</th>
                <th className="px-4 py-3 border-r border-[#c3e6cb]">Item Name</th>
                <th className="px-4 py-3 border-r border-[#c3e6cb] text-right">Kgs</th>
                <th className="px-4 py-3 border-r border-[#c3e6cb] text-right">Bags</th>
                <th className="px-4 py-3 border-r border-[#c3e6cb] text-right">Purchase Rate</th>
                <th className="px-4 py-3 border-r border-[#c3e6cb]">Transport</th>
                <th className="px-4 py-3 border-r border-[#c3e6cb] text-right">Transport Rate</th>
                <th className="px-4 py-3 border-r border-[#c3e6cb]">LR NO.</th>
                <th className="px-4 py-3 border-r border-[#c3e6cb]">Expected Arrival</th>
                <th className="px-4 py-3 border-r border-[#c3e6cb]">Type of Delivery</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="text-xs font-semibold text-slate-700">
              {filteredPurchases.map((row, idx) => (
                <tr key={row.id} className="bg-white hover:bg-[#f8fff9] transition-colors border-b border-[#c3e6cb]">
                  <td className="px-4 py-3 border-r border-[#c3e6cb] text-center font-bold text-slate-400">{idx + 1}</td>
                  <td className="px-4 py-3 border-r border-[#c3e6cb] whitespace-nowrap">{row.orderDate}</td>
                  <td className="px-4 py-3 border-r border-[#c3e6cb] font-bold">{getPartyName(row.partyId)}</td>
                  <td className="px-4 py-3 border-r border-[#c3e6cb] font-bold text-green-700">{getItemName(row.itemId)}</td>
                  <td className="px-4 py-3 border-r border-[#c3e6cb] text-right font-black">{row.kgs.toLocaleString()}</td>
                  <td className="px-4 py-3 border-r border-[#c3e6cb] text-right">{row.bags || '-'}</td>
                  <td className="px-4 py-3 border-r border-[#c3e6cb] text-right">₹{row.purchaseRate}</td>
                  <td className="px-4 py-3 border-r border-[#c3e6cb] text-slate-500 uppercase">{row.transportName}</td>
                  <td className="px-4 py-3 border-r border-[#c3e6cb] text-right">₹{row.transportRate || '-'}</td>
                  <td className="px-4 py-3 border-r border-[#c3e6cb] font-mono">{row.lrNumber || '-'}</td>
                  <td className="px-4 py-3 border-r border-[#c3e6cb]">{row.expectedArrivalDate}</td>
                  <td className="px-4 py-3 border-r border-[#c3e6cb]">
                     <select 
                       value={row.deliveryType} 
                       disabled 
                       className="bg-slate-50 border border-slate-200 rounded px-1 text-[10px] font-bold outline-none"
                     >
                        <option>Door Delivery</option>
                        <option>Godown Delivery</option>
                     </select>
                  </td>
                  <td className="px-4 py-3 min-w-[120px]">
                    <div className="relative group/status">
                      <select 
                        value={row.status}
                        onChange={(e) => handleStatusChange(row.id, e.target.value as any)}
                        className={`appearance-none w-full px-2 py-1.5 rounded-lg text-[10px] font-black uppercase border transition-all cursor-pointer outline-none ${
                          row.status === 'Arrived' 
                          ? 'bg-green-100 text-green-700 border-green-300 ring-green-500/10' 
                          : row.status === 'Cancelled'
                          ? 'bg-red-50 text-red-600 border-red-200'
                          : 'bg-amber-100 text-amber-700 border-amber-300 ring-amber-500/10'
                        } focus:ring-4`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Arrived">Arrived</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                      <ChevronDown className={`absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none transition-transform group-hover/status:translate-y-[-40%] ${
                        row.status === 'Arrived' ? 'text-green-600' : 'text-amber-600'
                      }`} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredPurchases.length === 0 && (
            <div className="p-20 text-center bg-white">
               <Truck className="w-12 h-12 text-slate-100 mx-auto mb-4" />
               <p className="text-slate-400 font-bold uppercase text-xs">No purchase entries found</p>
            </div>
          )}
        </div>
      </div>

      {/* New Purchase Modal */}
      {showNewEntry && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
            <div className="bg-slate-50 p-6 border-b flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Purchase Inward Entry</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Core Entry System</p>
              </div>
              <button onClick={() => setShowNewEntry(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-10 space-y-8 max-h-[80vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date</label>
                  <input type="date" value={formData.orderDate} onChange={(e) => setFormData({...formData, orderDate: e.target.value})} className="w-full border-2 border-slate-100 rounded-xl p-3 bg-slate-50 font-bold text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Supplier / Party</label>
                  <select required value={formData.partyId} onChange={(e) => setFormData({...formData, partyId: e.target.value})} className="w-full border-2 border-slate-100 rounded-xl p-3 bg-slate-50 font-bold text-sm">
                    <option value="">Select Party</option>
                    {parties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Item / Material</label>
                  <select required value={formData.itemId} onChange={(e) => setFormData({...formData, itemId: e.target.value})} className="w-full border-2 border-slate-100 rounded-xl p-3 bg-slate-50 font-bold text-sm">
                    <option value="">Select Item</option>
                    {items.map(i => <option key={i.id} value={i.id}>{i.name} ({i.grade})</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kgs</label>
                  <input type="number" step="0.01" required value={formData.kgs} onChange={(e) => setFormData({...formData, kgs: Number(e.target.value)})} className="w-full border-2 border-slate-100 rounded-xl p-3 bg-slate-50 font-bold text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Bags</label>
                  <input type="number" value={formData.bags} onChange={(e) => setFormData({...formData, bags: Number(e.target.value)})} className="w-full border-2 border-slate-100 rounded-xl p-3 bg-slate-50 font-bold text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Purchase Rate</label>
                  <input type="number" step="0.01" required value={formData.purchaseRate} onChange={(e) => setFormData({...formData, purchaseRate: Number(e.target.value)})} className="w-full border-2 border-slate-100 rounded-xl p-3 bg-slate-50 font-bold text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
                  <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value as any})} className="w-full border-2 border-slate-100 rounded-xl p-3 bg-slate-50 font-bold text-sm">
                    <option>Pending</option>
                    <option>Arrived</option>
                    <option>Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Transport Name</label>
                  <input type="text" value={formData.transportName} onChange={(e) => setFormData({...formData, transportName: e.target.value})} className="w-full border-2 border-slate-100 rounded-xl p-3 bg-slate-50 font-bold text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Transport Rate</label>
                  <input type="number" step="0.01" value={formData.transportRate} onChange={(e) => setFormData({...formData, transportRate: Number(e.target.value)})} className="w-full border-2 border-slate-100 rounded-xl p-3 bg-slate-50 font-bold text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">LR Number</label>
                  <input type="text" value={formData.lrNumber} onChange={(e) => setFormData({...formData, lrNumber: e.target.value})} className="w-full border-2 border-slate-100 rounded-xl p-3 bg-slate-50 font-bold text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Expected/Arrival Date</label>
                  <input type="date" value={formData.expectedArrivalDate} onChange={(e) => setFormData({...formData, expectedArrivalDate: e.target.value})} className="w-full border-2 border-slate-100 rounded-xl p-3 bg-slate-50 font-bold text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Type of Delivery</label>
                  <select value={formData.deliveryType} onChange={(e) => setFormData({...formData, deliveryType: e.target.value as any})} className="w-full border-2 border-slate-100 rounded-xl p-3 bg-slate-50 font-bold text-sm">
                    <option>Door Delivery</option>
                    <option>Godown Delivery</option>
                  </select>
                </div>
              </div>

              <div className="pt-6 border-t">
                <button type="submit" className="w-full py-4 bg-green-600 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-green-100 hover:bg-green-700 transition-all flex items-center justify-center gap-3">
                  <Save className="w-5 h-5" />
                  Save Inward Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseDashboard;
