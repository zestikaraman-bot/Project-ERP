import React, { useState, useEffect } from 'react';
import { db } from '../db';
import { Item } from '../types';
// Add missing Tag icon import from lucide-react
import { 
  Save, 
  ArrowUp, 
  ArrowDown, 
  Percent, 
  Search, 
  CheckCircle2, 
  RotateCcw, 
  Zap, 
  Filter,
  TrendingUp,
  IndianRupee,
  AlertCircle,
  Layers,
  ChevronDown,
  Tag
} from 'lucide-react';

const RateManager: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [priceUpdates, setPriceUpdates] = useState<Record<string, number>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [subCategoryFilter, setSubCategoryFilter] = useState('ALL');
  const [gradeFilter, setGradeFilter] = useState('ALL');
  
  const [bulkVal, setBulkVal] = useState(0);
  const [bulkType, setBulkType] = useState<'PERCENT' | 'FIXED'>('PERCENT');
  const [isSaving, setIsSaving] = useState(false);
  const [showSavedMsg, setShowSavedMsg] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const allItems = db.getItems();
    setItems(allItems);
    const updates: Record<string, number> = {};
    allItems.forEach(i => updates[i.id] = i.price);
    setPriceUpdates(updates);
  };

  const handlePriceChange = (id: string, value: string) => {
    const num = parseFloat(value) || 0;
    setPriceUpdates(prev => ({ ...prev, [id]: num }));
  };

  const applyBulkToFiltered = () => {
    const filteredIds = filteredItems.map(i => i.id);
    const newUpdates = { ...priceUpdates };
    
    filteredIds.forEach(id => {
      const currentItem = items.find(i => i.id === id);
      if (currentItem) {
        if (bulkType === 'PERCENT') {
          newUpdates[id] = Math.round(currentItem.price * (1 + bulkVal / 100) * 100) / 100;
        } else {
          newUpdates[id] = currentItem.price + bulkVal;
        }
      }
    });
    setPriceUpdates(newUpdates);
  };

  const saveAll = async () => {
    setIsSaving(true);
    const updates: { id: string; price: number }[] = Object.entries(priceUpdates).map(([id, price]) => ({
      id,
      price: price as number
    }));
    db.bulkUpdatePrices(updates);
    
    await new Promise(r => setTimeout(r, 600));
    
    setIsSaving(false);
    setShowSavedMsg(true);
    loadData();
    setTimeout(() => setShowSavedMsg(false), 3000);
  };

  const resetAll = () => {
    if (confirm("Discard all unsaved changes?")) {
      loadData();
    }
  };

  const filteredItems = items.filter(i => {
    const matchSearch = i.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                       i.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = categoryFilter === 'ALL' || i.category === categoryFilter;
    const matchSubCat = subCategoryFilter === 'ALL' || i.subCategory === subCategoryFilter;
    const matchGrade = gradeFilter === 'ALL' || (i.grade || 'Standard') === gradeFilter;
    return matchSearch && matchCat && matchSubCat && matchGrade;
  });

  const categories = Array.from(new Set(items.map(i => i.category)));
  const subCategories = Array.from(new Set(items.map(i => i.subCategory).filter(Boolean))).sort() as string[];
  const grades = Array.from(new Set(items.map(i => i.grade || 'Standard'))).sort();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Rate Manager</h2>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">Spreadsheet Mode • Rapid Update System</p>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={resetAll}
            className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-slate-100 text-slate-400 rounded-2xl hover:text-red-500 hover:border-red-100 transition-all font-black text-xs uppercase tracking-widest"
          >
            <RotateCcw className="w-4 h-4" />
            Discard
          </button>
          <button 
            onClick={saveAll}
            disabled={isSaving}
            className={`flex items-center gap-3 px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl transition-all ${
              showSavedMsg ? 'bg-green-500 text-white shadow-green-100' : 'bg-slate-900 text-white shadow-slate-200 hover:scale-[1.02] active:scale-95'
            }`}
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : showSavedMsg ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4 text-amber-500" />
            )}
            {showSavedMsg ? 'Update Complete' : isSaving ? 'Syncing...' : 'Commit New Rates'}
          </button>
        </div>
      </div>

      {/* Global Action & Filter Bar */}
      <div className="bg-indigo-600 rounded-[2.5rem] p-8 shadow-2xl shadow-indigo-100 space-y-6 text-white">
        <div className="flex flex-wrap gap-8 items-center">
          <div className="flex-1 min-w-[300px] space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Global Adjustment (Filtered Items Only)</span>
            </div>
            <div className="flex gap-3">
              <div className="bg-white/10 rounded-xl p-1 flex border border-white/10">
                  <button 
                    onClick={() => setBulkType('PERCENT')}
                    className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${bulkType === 'PERCENT' ? 'bg-white text-indigo-600 shadow-lg' : 'text-indigo-100 hover:bg-white/5'}`}
                  >
                    <Percent className="w-3 h-3 inline mr-1" /> Percent
                  </button>
                  <button 
                    onClick={() => setBulkType('FIXED')}
                    className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${bulkType === 'FIXED' ? 'bg-white text-indigo-600 shadow-lg' : 'text-indigo-100 hover:bg-white/5'}`}
                  >
                    <IndianRupee className="w-3 h-3 inline mr-1" /> Fixed
                  </button>
              </div>
              <input 
                type="number" 
                placeholder="Val"
                value={bulkVal || ''}
                onChange={e => setBulkVal(parseFloat(e.target.value) || 0)}
                className="w-24 bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white font-black text-sm outline-none focus:bg-white/20 transition-all placeholder:text-white/30"
              />
              <button 
                onClick={applyBulkToFiltered}
                className="bg-white text-indigo-600 px-6 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-indigo-50 transition-all active:scale-95"
              >
                Apply to {filteredItems.length} Visible
              </button>
            </div>
          </div>

          <div className="relative flex-1 min-w-[300px]">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
              <input 
                type="text" 
                placeholder="Find specific items or SKUs..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-2xl pl-12 pr-4 py-4 text-white font-bold text-sm outline-none focus:bg-white/20 transition-all placeholder:text-white/40 shadow-inner"
              />
          </div>
        </div>

        {/* Granular Filters Bar */}
        <div className="flex flex-wrap gap-4 pt-4 border-t border-white/10">
          <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
            <Filter className="w-3.5 h-3.5 text-white/40" />
            <span className="text-[9px] font-black uppercase tracking-widest text-indigo-200">Type:</span>
            <select 
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="bg-transparent text-xs font-bold outline-none cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              {categories.map(c => <option key={c} value={c} className="text-slate-900">{c}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
            <Layers className="w-3.5 h-3.5 text-white/40" />
            <span className="text-[9px] font-black uppercase tracking-widest text-indigo-200">Group:</span>
            <select 
              value={subCategoryFilter}
              onChange={e => setSubCategoryFilter(e.target.value)}
              className="bg-transparent text-xs font-bold outline-none cursor-pointer"
            >
              <option value="ALL">All Spices</option>
              {subCategories.map(sc => <option key={sc} value={sc} className="text-slate-900">{sc}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
            <Tag className="w-3.5 h-3.5 text-white/40" />
            <span className="text-[9px] font-black uppercase tracking-widest text-indigo-200">Grade:</span>
            <select 
              value={gradeFilter}
              onChange={e => setGradeFilter(e.target.value)}
              className="bg-transparent text-xs font-bold outline-none cursor-pointer"
            >
              <option value="ALL">All Grades</option>
              {grades.map(g => <option key={g} value={g} className="text-slate-900">{g}</option>)}
            </select>
          </div>

          <button 
            onClick={() => {setSearchTerm(''); setCategoryFilter('ALL'); setSubCategoryFilter('ALL'); setGradeFilter('ALL');}}
            className="text-[9px] font-black uppercase tracking-widest text-indigo-300 hover:text-white transition-colors ml-auto flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" /> Reset Filters
          </button>
        </div>
      </div>

      {/* Spreadsheet Grid */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden mb-12">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-1/3">Item Master</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Spice Group</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Current (₹)</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">New Rate (₹)</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Margin Shift</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredItems.map(item => {
              const newVal = priceUpdates[item.id] || 0;
              const diff = newVal - item.price;
              const isChanged = diff !== 0;

              return (
                <tr key={item.id} className={`group hover:bg-slate-50/50 transition-colors ${isChanged ? 'bg-amber-50/30' : ''}`}>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="font-black text-slate-800 uppercase tracking-tight">{item.name}</span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">SKU: {item.sku} • {item.grade || 'STD'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className="px-3 py-1 bg-slate-100 rounded-lg text-[9px] font-black text-slate-500 uppercase tracking-tighter">
                      {item.subCategory || 'General'}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-center font-bold text-slate-400 italic">
                    ₹{item.price.toLocaleString('en-IN')}
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className="relative inline-block w-40">
                      <IndianRupee className={`w-3 h-3 absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${isChanged ? 'text-amber-500' : 'text-slate-300'}`} />
                      <input 
                        type="number" 
                        step="0.01"
                        value={newVal}
                        onChange={e => handlePriceChange(item.id, e.target.value)}
                        className={`w-full pl-8 pr-3 py-3 border-2 rounded-xl text-sm font-black outline-none transition-all ${
                          isChanged 
                          ? 'border-amber-400 bg-white text-slate-900 shadow-lg shadow-amber-500/10' 
                          : 'border-slate-100 bg-slate-50/50 text-slate-400 hover:border-slate-200 focus:border-indigo-500 focus:bg-white focus:text-slate-900'
                        }`}
                      />
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    {isChanged ? (
                      <div className={`flex items-center justify-end gap-2 font-black text-xs ${diff > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {diff > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                        <span>{diff > 0 ? '+' : ''}{diff.toFixed(2)}</span>
                        <span className="text-[9px] opacity-40 ml-1">({((diff/item.price)*100).toFixed(1)}%)</span>
                      </div>
                    ) : (
                      <span className="text-[10px] font-black text-slate-200 uppercase tracking-widest">No Change</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredItems.length === 0 && (
          <div className="p-24 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
               <AlertCircle className="w-8 h-8 text-slate-200" />
            </div>
            <h3 className="text-slate-800 font-black uppercase text-sm">No items match your filters</h3>
            <p className="text-slate-400 text-[10px] font-bold uppercase mt-1">Try resetting the filters or check your search term</p>
          </div>
        )}
        
        <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
           <div className="flex gap-12">
              <div className="flex items-center gap-3">
                 <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-200">
                    <TrendingUp className="w-5 h-5 text-indigo-500" />
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Modified Rows</p>
                    <p className="text-xl font-black text-slate-800">
                      {Object.entries(priceUpdates).filter(([id, val]) => {
                        const original = items.find(i => i.id === id)?.price;
                        return val !== original;
                      }).length}
                    </p>
                 </div>
              </div>
           </div>
           
           <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Sync Status</p>
              <div className="flex items-center gap-2 text-green-500 font-black text-[10px] uppercase">
                 <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                 Database Online & Ready
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default RateManager;
