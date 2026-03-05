
import React, { useState, useEffect } from 'react';
import { db } from '../db';
import { Item, UserRole } from '../types';
import { Box, Search, AlertTriangle, TrendingDown, Package2, Download, Edit3, X, Save, Filter, Plus, ChevronDown, Layers, ArrowRight } from 'lucide-react';

interface InventoryDashboardProps {
  role: UserRole;
}

const InventoryDashboard: React.FC<InventoryDashboardProps> = ({ role }) => {
  const [items, setItems] = useState<Item[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'RAW' | 'FINISHED'>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  const canEdit = role === UserRole.ADMIN || role === UserRole.PURCHASE;

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 5000);
    return () => clearInterval(interval);
  }, []);

  const refreshData = () => {
    setItems(db.getItems());
  };

  const filteredItems = items
    .filter(item => {
      if (role === UserRole.SALES || role === UserRole.OPERATIONS) return item.category === 'FINISHED';
      if (role === UserRole.PURCHASE) return item.category === 'RAW';
      return true;
    })
    .filter(item => categoryFilter === 'ALL' || item.category === categoryFilter)
    .filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const getStatusBadge = (item: Item) => {
    if (item.stock <= item.reorderLevel / 2) {
      return <div className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-600 rounded-xl text-[9px] font-black uppercase tracking-widest border border-rose-100"><AlertTriangle className="w-3 h-3" /> Critical</div>;
    }
    if (item.stock <= item.reorderLevel) {
      return <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-600 rounded-xl text-[9px] font-black uppercase tracking-widest border border-amber-100"><TrendingDown className="w-3 h-3" /> Low</div>;
    }
    return <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl text-[9px] font-black uppercase tracking-widest border border-emerald-100">Healthy</div>;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tighter uppercase">Stock Master</h2>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-2">Live Inventory Control • Units in Kg</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button 
            onClick={() => db.exportToExcel('items')}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-white border border-slate-200 text-slate-700 rounded-2xl hover:bg-slate-50 transition-all font-black text-[10px] uppercase tracking-widest shadow-sm"
          >
            <Download className="w-4 h-4" />
            Excel
          </button>
          {canEdit && (
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-950 text-white rounded-2xl hover:bg-black transition-all font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-slate-200"
            >
              <Plus className="w-4 h-4" />
              New SKU
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 sm:p-8 border-b flex flex-col lg:flex-row gap-6 items-center justify-between bg-slate-50/30">
          <div className="relative flex-1 w-full lg:max-w-md group">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search by SKU or Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-amber-500/5 focus:border-amber-500 outline-none transition-all"
            />
          </div>
          
          <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 w-full lg:w-auto overflow-x-auto overflow-y-hidden no-scrollbar">
            {(['ALL', 'RAW', 'FINISHED'] as const).map(cat => (
              <button 
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`flex-1 lg:flex-none px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${categoryFilter === cat ? 'bg-white text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {cat === 'ALL' ? 'Total Stock' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Responsive Layout: Table on Desktop, Cards on Mobile */}
        <div className="hidden lg:block">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">
              <tr>
                <th className="px-10 py-6">Item Master</th>
                <th className="px-10 py-6">Category</th>
                <th className="px-10 py-6 text-center">In Stock (Kg)</th>
                <th className="px-10 py-6 text-center">Health</th>
                <th className="px-10 py-6 text-right">Value (₹)</th>
                <th className="px-10 py-6 text-center w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm">
              {filteredItems.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-4">
                      <div className={`p-4 rounded-2xl ${item.category === 'RAW' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'}`}>
                        <Package2 className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-black text-slate-950 uppercase tracking-tight leading-none text-base">{item.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">SKU: {item.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{item.subCategory || 'Other'}</span>
                      <span className="text-[9px] font-bold text-slate-300 mt-1 uppercase tracking-tighter">{item.grade || 'Standard Grade'}</span>
                    </div>
                  </td>
                  <td className="px-10 py-8 text-center">
                    <p className="text-2xl font-black text-slate-950 tracking-tighter">{item.stock.toLocaleString()}</p>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Available Kg</p>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex justify-center">{getStatusBadge(item)}</div>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <p className="font-black text-slate-950">₹ {(item.stock * item.price).toLocaleString('en-IN')}</p>
                    <p className="text-[10px] font-bold text-slate-400 mt-1">@ ₹{item.price}/Kg</p>
                  </td>
                  <td className="px-10 py-8 text-center">
                    <button className="p-3 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-2xl transition-all">
                      <Edit3 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View: Cards */}
        <div className="lg:hidden p-4 space-y-4">
          {filteredItems.map(item => (
            <div key={item.id} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col gap-6 active:scale-[0.98] transition-transform">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${item.category === 'RAW' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'}`}>
                    <Package2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-950 uppercase tracking-tight">{item.name}</h4>
                    <p className="text-[9px] font-bold text-slate-400 mt-0.5 uppercase tracking-widest">{item.sku}</p>
                  </div>
                </div>
                {getStatusBadge(item)}
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">In Stock</p>
                  <p className="text-xl font-black text-slate-950">{item.stock.toLocaleString()} Kg</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Inventory Value</p>
                  <p className="text-xl font-black text-amber-600">₹ {(item.stock * item.price).toLocaleString('en-IN')}</p>
                </div>
              </div>
              
              <button className="w-full py-4 bg-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                <Edit3 className="w-4 h-4" /> View Details
              </button>
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="p-32 text-center">
            <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 border border-slate-100">
              <Box className="w-10 h-10 text-slate-200" />
            </div>
            <h3 className="text-slate-950 font-black uppercase tracking-tight text-lg">No Results Found</h3>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Try adjusting your filters or search term</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryDashboard;
