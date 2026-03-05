
import React, { useState, useEffect } from 'react';
import { db } from '../db';
import { UserRole, Item } from '../types';
import { 
  Users, 
  Database, 
  FileSpreadsheet, 
  HardDriveDownload, 
  ShieldCheck, 
  MapPin, 
  IndianRupee, 
  Save, 
  ArrowUp, 
  ArrowDown, 
  Percent,
  Search,
  CheckCircle2
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'masters' | 'users' | 'rates' | 'backup'>('masters');
  const [items, setItems] = useState<Item[]>([]);
  const [priceUpdates, setPriceUpdates] = useState<Record<string, number>>({});
  const [bulkAdjustment, setBulkAdjustment] = useState({ type: 'percentage', value: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const allItems = db.getItems();
    setItems(allItems);
    const initialUpdates: Record<string, number> = {};
    allItems.forEach(item => {
      initialUpdates[item.id] = item.price;
    });
    setPriceUpdates(initialUpdates);
  }, [activeTab === 'rates']);

  const handlePriceChange = (id: string, value: string) => {
    setPriceUpdates(prev => ({ ...prev, [id]: parseFloat(value) || 0 }));
    setIsSaved(false);
  };

  const applyBulkAdjustment = () => {
    const updated = { ...priceUpdates };
    items.forEach(item => {
      if (bulkAdjustment.type === 'percentage') {
        const factor = 1 + (bulkAdjustment.value / 100);
        updated[item.id] = Math.round(item.price * factor * 100) / 100;
      } else {
        updated[item.id] = item.price + bulkAdjustment.value;
      }
    });
    setPriceUpdates(updated);
  };

  const handleSaveAllPrices = () => {
    // Fix: Explicitly map priceUpdates to the expected format and cast price to number to resolve 'unknown' type error.
    const updates: { id: string; price: number }[] = Object.entries(priceUpdates).map(([id, price]) => ({
      id,
      price: price as number
    }));
    db.bulkUpdatePrices(updates);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const filteredItems = items.filter(i => 
    i.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    i.subCategory?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const adminActions = [
    { label: 'Party Master', icon: Users, color: 'text-blue-600' },
    { label: 'Item Master', icon: Database, color: 'text-green-600' },
    { label: 'Supplier Master', icon: ShieldCheck, color: 'text-purple-600' },
    { label: 'State & City Master', icon: MapPin, color: 'text-orange-600' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Administrator Panel</h2>
          <p className="text-gray-500 font-medium">System configuration, user management and bulk rate control</p>
        </div>
      </div>

      <div className="flex border-b border-gray-200 overflow-x-auto custom-scrollbar">
        <button 
          onClick={() => setActiveTab('masters')}
          className={`px-6 py-4 font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'masters' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400'}`}
        >
          Master Settings
        </button>
        <button 
          onClick={() => setActiveTab('rates')}
          className={`px-6 py-4 font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'rates' ? 'text-amber-600 border-b-2 border-amber-600' : 'text-gray-400'}`}
        >
          Bulk Rate Update
        </button>
        <button 
          onClick={() => setActiveTab('users')}
          className={`px-6 py-4 font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'users' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400'}`}
        >
          User Management
        </button>
        <button 
          onClick={() => setActiveTab('backup')}
          className={`px-6 py-4 font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'backup' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400'}`}
        >
          Backup & Export
        </button>
      </div>

      {activeTab === 'masters' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {adminActions.map((action) => (
            <button key={action.label} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center gap-4 hover:shadow-md hover:-translate-y-1 transition-all group">
              <div className={`p-5 rounded-2xl bg-gray-50 ${action.color} group-hover:scale-110 transition-transform`}>
                <action.icon className="w-8 h-8" />
              </div>
              <span className="font-black text-[10px] uppercase tracking-widest text-gray-800">{action.label}</span>
            </button>
          ))}
        </div>
      )}

      {activeTab === 'rates' && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
          <div className="bg-amber-50 border border-amber-100 p-8 rounded-[2rem] flex flex-wrap gap-8 items-end">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-amber-700 uppercase tracking-widest ml-1">Adjustment Type</label>
              <div className="flex bg-white rounded-xl p-1 border border-amber-200">
                <button 
                  onClick={() => setBulkAdjustment(p => ({ ...p, type: 'percentage' }))}
                  className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${bulkAdjustment.type === 'percentage' ? 'bg-amber-600 text-white' : 'text-amber-600 hover:bg-amber-50'}`}
                >
                  <Percent className="w-3 h-3 inline mr-1" /> Percentage
                </button>
                <button 
                  onClick={() => setBulkAdjustment(p => ({ ...p, type: 'fixed' }))}
                  className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${bulkAdjustment.type === 'fixed' ? 'bg-amber-600 text-white' : 'text-amber-600 hover:bg-amber-50'}`}
                >
                  <IndianRupee className="w-3 h-3 inline mr-1" /> Fixed Amt
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-amber-700 uppercase tracking-widest ml-1">Change Value (+/-)</label>
              <div className="flex items-center gap-3">
                <input 
                  type="number" 
                  value={bulkAdjustment.value}
                  onChange={(e) => setBulkAdjustment(p => ({ ...p, value: parseFloat(e.target.value) || 0 }))}
                  className="w-32 border-2 border-amber-200 rounded-xl p-3 font-black text-sm bg-white focus:border-amber-500 outline-none"
                />
                <button 
                  onClick={applyBulkAdjustment}
                  className="bg-amber-600 text-white px-6 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-amber-200 hover:bg-amber-700 active:scale-95 transition-all"
                >
                  Apply to All Rows
                </button>
              </div>
            </div>

            <div className="ml-auto flex items-center gap-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Filter by name..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 bg-white border border-amber-200 rounded-xl text-xs font-bold w-64 outline-none focus:ring-4 focus:ring-amber-500/5 focus:border-amber-500"
                />
              </div>
              <button 
                onClick={handleSaveAllPrices}
                className="flex items-center gap-2 bg-slate-900 text-white px-8 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all"
              >
                {isSaved ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Save className="w-4 h-4 text-amber-500" />}
                {isSaved ? 'Rates Updated!' : 'Save All Changes'}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Item Master</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Spice Group</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Current Rate (₹)</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">New Rate (₹)</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm">
                {filteredItems.map(item => {
                  const newPrice = priceUpdates[item.id] || 0;
                  const diff = newPrice - item.price;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-8 py-5">
                        <div className="flex flex-col">
                          <span className="font-black text-slate-800 uppercase tracking-tight">{item.name}</span>
                          <span className="text-[9px] font-bold text-slate-400">SKU: {item.sku}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-center font-bold text-slate-500 text-[10px] uppercase">{item.subCategory || 'General'}</td>
                      <td className="px-8 py-5 text-center font-black text-slate-400">₹ {item.price.toLocaleString()}</td>
                      <td className="px-8 py-5 text-center">
                        <div className="relative inline-block w-32">
                          <IndianRupee className="w-3 h-3 absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                          <input 
                            type="number" 
                            step="0.01"
                            value={newPrice}
                            onChange={(e) => handlePriceChange(item.id, e.target.value)}
                            className="w-full pl-8 pr-3 py-2 border-2 border-slate-100 rounded-lg text-xs font-black text-slate-800 focus:border-amber-500 outline-none bg-slate-50/50"
                          />
                        </div>
                      </td>
                      <td className="px-8 py-5 text-center">
                        {diff !== 0 && (
                          <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full ${diff > 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                            {diff > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                            {diff > 0 ? '+' : ''}{diff.toFixed(2)}
                          </span>
                        )}
                        {diff === 0 && <span className="text-[10px] font-black text-slate-300">NO CHANGE</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Full Name</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Username</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Role</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm">
              {db.getUsers().map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-8 py-5 font-bold text-gray-900">{user.fullName}</td>
                  <td className="px-8 py-5 text-gray-500 font-medium">{user.username}</td>
                  <td className="px-8 py-5">
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg font-black text-[9px] uppercase tracking-tighter">{user.role}</span>
                  </td>
                  <td className="px-8 py-5">
                    <span className="flex items-center gap-2 text-green-600 font-black text-[10px] uppercase tracking-widest"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div> Active</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'backup' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 flex flex-col gap-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-blue-100 text-blue-600 rounded-2xl">
                <HardDriveDownload className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">System Backup</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Full Snapshot Generation</p>
              </div>
            </div>
            <p className="text-gray-500 text-sm font-medium leading-relaxed">Download a complete snapshot of all database tables (Parties, Items, Orders, Users) in JSON format for safe storage and recovery.</p>
            <button 
              onClick={() => db.backupAll()}
              className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
            >
              Run Full Backup
            </button>
          </div>

          <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 flex flex-col gap-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-green-100 text-green-600 rounded-2xl">
                <FileSpreadsheet className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Excel Bulk Import</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Legacy Data Migration</p>
              </div>
            </div>
            <p className="text-gray-500 text-sm font-medium leading-relaxed">Import your existing master records via Excel (.xlsx or .csv) to quickly populate the ERP system from your previous software.</p>
            <label className="w-full py-6 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-all group">
              <span className="text-xs font-black text-gray-400 uppercase tracking-widest group-hover:text-green-600 transition-colors">Drag files here or click to browse</span>
              <input type="file" className="hidden" />
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
