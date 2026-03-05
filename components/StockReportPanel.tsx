
import React, { useState, useEffect } from 'react';
import { db } from '../db';
import { Item, UserRole } from '../types';
import { Box, Search, AlertTriangle, TrendingDown, Package2, DollarSign } from 'lucide-react';

interface StockReportPanelProps {
  role: UserRole;
}

const StockReportPanel: React.FC<StockReportPanelProps> = ({ role }) => {
  const [items, setItems] = useState<Item[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setItems(db.getItems());
    const interval = setInterval(() => {
      setItems(db.getItems());
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const filteredItems = items
    .filter(item => {
      if (role === UserRole.SALES || role === UserRole.OPERATIONS) return item.category === 'FINISHED';
      if (role === UserRole.PURCHASE) return item.category === 'RAW';
      return true;
    })
    .filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const getStatusBadge = (item: Item) => {
    if (item.stock <= item.reorderLevel / 2) {
      return <span className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-100"><AlertTriangle className="w-3 h-3" /> CRITICAL</span>;
    }
    if (item.stock <= item.reorderLevel) {
      return <span className="flex items-center gap-1 text-[10px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-100"><TrendingDown className="w-3 h-3" /> LOW</span>;
    }
    return <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded border border-green-100">HEALTHY</span>;
  };

  return (
    <div className="w-80 h-[calc(100vh-140px)] bg-white border-l border-gray-200 sticky top-24 flex flex-col shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)] rounded-tl-3xl overflow-hidden">
      <div className="p-6 border-b border-gray-100 bg-slate-50/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black text-gray-800 flex items-center gap-2 uppercase text-xs tracking-tighter">
            <Package2 className="w-4 h-4 text-amber-600" />
            Inventory Status
          </h3>
        </div>
        
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search spices/pouches..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {filteredItems.map(item => (
          <div key={item.id} className="p-3 rounded-xl border border-gray-50 bg-white hover:border-amber-200 hover:shadow-sm transition-all group">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-[11px] font-black text-gray-900 leading-tight group-hover:text-amber-700 transition-colors uppercase tracking-tight">{item.name}</p>
                <p className="text-[9px] text-gray-400 font-bold">BATCH REF: {item.sku.split('-').pop()}</p>
              </div>
              {getStatusBadge(item)}
            </div>
            
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[9px] font-bold text-gray-400 uppercase">Available Stock</p>
                <p className="text-lg font-black text-slate-900 leading-none">
                  {item.stock.toLocaleString()} <span className="text-[9px] text-slate-400 font-bold uppercase">{item.category === 'RAW' ? 'Kg' : 'Pks'}</span>
                </p>
              </div>
              
              {(role === UserRole.ACCOUNTS || role === UserRole.ADMIN) && (
                <div className="text-right">
                  <p className="text-[9px] font-bold text-gray-400 uppercase">Value</p>
                  <p className="text-xs font-black text-amber-600">
                    ₹{(item.stock * item.price).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <Box className="w-10 h-10 text-slate-100 mx-auto mb-2" />
            <p className="text-xs text-slate-400 font-medium italic">No matches found</p>
          </div>
        )}
      </div>

      <div className="p-4 bg-slate-900 text-white mt-auto">
        <div className="flex justify-between items-center mb-3">
           <span className="text-[10px] font-bold text-slate-400 uppercase">Stock Valuation</span>
           <span className="text-sm font-black text-amber-400">₹42.50L</span>
        </div>
        <button className="w-full py-2 bg-amber-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-amber-500 transition-colors shadow-lg shadow-amber-900/20">
          Export Master Inventory
        </button>
      </div>
    </div>
  );
};

export default StockReportPanel;
