
import React, { useState, useEffect } from 'react';
import { db } from '../db';
import { Item } from '../types';
import { Printer, Search, Tag, Layers, Edit3, Save, X, CheckCircle2, IndianRupee, Filter, RotateCcw } from 'lucide-react';

const PriceList: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [subCategoryFilter, setSubCategoryFilter] = useState('ALL');
  const [editedPrices, setEditedPrices] = useState<Record<string, number>>({});
  const [showSavedMsg, setShowSavedMsg] = useState(false);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    const allItems = db.getItems();
    setItems(allItems);
    const initialPrices: Record<string, number> = {};
    allItems.forEach(item => {
      initialPrices[item.id] = item.price;
    });
    setEditedPrices(initialPrices);
  };

  const handlePriceChange = (id: string, value: string) => {
    setEditedPrices(prev => ({
      ...prev,
      [id]: parseFloat(value) || 0
    }));
  };

  const handleSave = () => {
    const updates: { id: string; price: number }[] = Object.entries(editedPrices).map(([id, price]) => ({
      id,
      price: price as number
    }));
    db.bulkUpdatePrices(updates);
    setIsEditMode(false);
    setShowSavedMsg(true);
    refreshData();
    setTimeout(() => setShowSavedMsg(false), 3000);
  };

  const handleCancel = () => {
    refreshData();
    setIsEditMode(false);
  };

  // Extract unique values for filters
  const allSubCategories = Array.from(new Set(items.map(i => i.subCategory).filter(Boolean))).sort() as string[];
  const allCategories = Array.from(new Set(items.map(i => i.category))).sort();

  // Determine which sub-categories should be shown based on category filter
  const activeSubCategories = allSubCategories.filter(sc => {
      const isSubCatMatch = subCategoryFilter === 'ALL' || sc === subCategoryFilter;
      const isCatMatch = categoryFilter === 'ALL' || items.some(i => i.subCategory === sc && i.category === categoryFilter);
      return isSubCatMatch && isCatMatch;
  });

  const groupedItems = activeSubCategories.reduce((acc, cat) => {
    acc[cat] = items.filter(item => 
      item.subCategory === cat && 
      (categoryFilter === 'ALL' || item.category === categoryFilter) &&
      (item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
       cat.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    return acc;
  }, {} as Record<string, Item[]>);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto print:m-0 print:p-0">
      {/* Controls - Hidden on Print */}
      <div className="flex flex-col gap-6 print:hidden">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Master Price List</h2>
            <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.2em] mt-1 text-amber-600">
              {isEditMode ? 'Editing Active Rates...' : 'Sync with Inventory Master'}
            </p>
          </div>
          
          <div className="flex gap-3">
            {!isEditMode ? (
              <>
                <button 
                  onClick={() => setIsEditMode(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-amber-100 text-amber-700 rounded-xl hover:bg-amber-200 transition-all font-black text-xs uppercase tracking-widest border border-amber-200"
                >
                  <Edit3 className="w-4 h-4" />
                  Quick Edit
                </button>
                <button 
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-black transition-all font-black text-xs uppercase tracking-widest shadow-lg"
                >
                  <Printer className="w-4 h-4" />
                  Print List
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-6 py-2.5 bg-white border-2 border-slate-100 text-slate-400 rounded-xl hover:text-red-500 hover:border-red-100 transition-all font-black text-xs uppercase tracking-widest"
                >
                  <X className="w-4 h-4" />
                  Discard
                </button>
                <button 
                  onClick={handleSave}
                  className="flex items-center gap-3 px-8 py-2.5 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all active:scale-95"
                >
                  <Save className="w-4 h-4 text-amber-500" />
                  Commit Changes
                </button>
              </>
            )}
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-wrap items-center gap-4 shadow-sm">
           <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search spices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:border-amber-500 outline-none transition-all"
              />
           </div>

           <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Type:</span>
              <select 
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="bg-transparent text-xs font-bold outline-none cursor-pointer"
              >
                <option value="ALL">All Categories</option>
                {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
           </div>

           <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Group:</span>
              <select 
                value={subCategoryFilter}
                onChange={e => setSubCategoryFilter(e.target.value)}
                className="bg-transparent text-xs font-bold outline-none cursor-pointer"
              >
                <option value="ALL">All Groups</option>
                {allSubCategories.map(sc => <option key={sc} value={sc}>{sc}</option>)}
              </select>
           </div>

           <button 
             onClick={() => {setSearchTerm(''); setCategoryFilter('ALL'); setSubCategoryFilter('ALL');}}
             className="p-2 text-slate-400 hover:text-amber-600 transition-colors"
             title="Clear Filters"
           >
             <RotateCcw className="w-4 h-4" />
           </button>
        </div>
      </div>

      {/* The Actual Price List Document */}
      <div className={`bg-white p-10 shadow-2xl border transition-all rounded-[3rem] print:shadow-none print:border-none print:p-0 animate-in fade-in zoom-in-95 duration-500 ${isEditMode ? 'border-amber-400 ring-4 ring-amber-500/5' : 'border-slate-100'}`}>
        {showSavedMsg && (
          <div className="mb-6 bg-green-50 text-green-700 p-4 rounded-2xl flex items-center gap-3 font-black text-xs uppercase tracking-widest animate-in slide-in-from-top-4">
            <CheckCircle2 className="w-5 h-5" />
            Database Updated Successfully
          </div>
        )}

        <div className="border-[3px] border-slate-900 overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-3 border-b-[3px] border-slate-900 text-center font-black uppercase text-[10px]">
            <div className="p-4 border-r-[3px] border-slate-900 flex flex-col items-center justify-center">
               <span className="text-xs">ABC SPICE INDUSTRIES</span>
               <span className="text-[8px] text-slate-500">GRINDING & BLENDING SPECIALIST</span>
            </div>
            <div className={`p-4 border-r-[3px] border-slate-900 flex items-center justify-center text-lg tracking-widest transition-colors ${isEditMode ? 'bg-amber-400 text-slate-900' : 'bg-slate-50'}`}>
               {isEditMode ? 'RATE UPDATE' : 'PRICE LIST'}
            </div>
            <div className="p-4 flex flex-col items-center justify-center">
               <span>DATE: {new Date().toLocaleDateString('en-GB')}</span>
               <span className="text-[8px] text-slate-400 mt-1 uppercase">Valid for 24 Hours Only</span>
            </div>
          </div>

          {/* Grid Layout for Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 divide-x-[3px] divide-slate-900">
            {activeSubCategories.map((cat) => {
              const catItems = groupedItems[cat] || [];
              if (catItems.length === 0) return null;
              
              return (
                <div key={cat} className="border-b-[3px] border-slate-900 last:border-b-0 even:border-l-[3px] even:border-slate-900">
                  <table className="w-full text-[10px] uppercase font-bold">
                    <thead className="bg-slate-900 text-white border-b-[3px] border-slate-900">
                      <tr>
                        <th className="p-3 text-left border-r-2 border-white/20 w-7/12">{cat}</th>
                        <th className="p-3 text-center border-r-2 border-white/20">STOCK</th>
                        <th className="p-3 text-center">RATE (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-[1px] divide-slate-200">
                      {catItems.map((item) => {
                        const isModified = editedPrices[item.id] !== item.price;
                        return (
                          <tr key={item.id} className={`hover:bg-slate-50 transition-colors ${isModified ? 'bg-amber-50/50' : ''}`}>
                            <td className="p-3 border-r-[3px] border-slate-900 font-black flex items-center justify-between">
                               {item.name}
                               <span className="text-[8px] text-slate-400 ml-2">({item.grade || 'STD'})</span>
                            </td>
                            <td className={`p-3 border-r-[3px] border-slate-900 text-center ${item.stock <= 0 ? 'text-red-500 font-black italic bg-red-50/50' : ''}`}>
                              {item.stock > 0 ? `${item.stock.toLocaleString()} KG` : 'NIL'}
                            </td>
                            <td className={`p-0 text-center font-black ${isEditMode ? 'bg-white' : 'bg-slate-50/50 text-slate-900'}`}>
                              {isEditMode ? (
                                <div className="flex items-center px-2">
                                  <IndianRupee className={`w-2.5 h-2.5 mr-1 ${isModified ? 'text-amber-600' : 'text-slate-300'}`} />
                                  <input 
                                    type="number"
                                    step="0.01"
                                    value={editedPrices[item.id] || 0}
                                    onChange={(e) => handlePriceChange(item.id, e.target.value)}
                                    className={`w-full py-3 bg-transparent border-none outline-none text-center font-black text-[11px] ${isModified ? 'text-amber-700' : 'text-slate-600'}`}
                                  />
                                </div>
                              ) : (
                                <div className="py-3">
                                  {item.price.toLocaleString('en-IN')}
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Disclaimer */}
        <div className="mt-8 flex justify-between items-end print:hidden">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-slate-400">
              <Tag className="w-4 h-4" />
              <span className="text-[9px] font-black uppercase tracking-widest italic leading-none">All rates are ex-factory, GST extra as applicable.</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Layers className="w-4 h-4" />
              <span className="text-[9px] font-black uppercase tracking-widest italic leading-none">Stock levels are live and subject to pending sales orders.</span>
            </div>
          </div>
          <div className="text-right">
             <p className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em]">ABC SPICE MANAGER</p>
             <div className="w-48 h-[2px] bg-slate-900 mt-6 ml-auto opacity-20"></div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body { background: white !important; }
          .ml-64 { margin-left: 0 !important; }
          header, sidebar, footer, .print\\:hidden, .flex-col.gap-6.print\\:hidden { display: none !important; }
          .max-w-5xl { max-width: 100% !important; }
          .shadow-2xl { box-shadow: none !important; }
          .rounded-[3rem] { border-radius: 0 !important; }
          .p-10 { padding: 0 !important; }
          .max-w-5xl.mx-auto { margin: 0 !important; }
        }
      `}</style>
    </div>
  );
};

export default PriceList;
