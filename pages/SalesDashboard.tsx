
import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, FileText, CheckCircle2, Clock, ShoppingCart, X, UserPlus, Trash2, MapPin, Truck, Box, IndianRupee, Info, AlertCircle, TrendingUp, ChevronDown, Sparkles, Zap, PackagePlus, Wand2 } from 'lucide-react';
import { db } from '../db';
import { SalesOrder, Party, Item } from '../types';

const SalesDashboard: React.FC = () => {
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [showNewOrder, setShowNewOrder] = useState(false);
  const [showNewPartyModal, setShowNewPartyModal] = useState(false);
  const [showNewItemModal, setShowNewItemModal] = useState(false);

  // New Item Form State (for controlled inputs to support auto-generate)
  const [newItemName, setNewItemName] = useState('');
  const [newItemSubCategory, setNewItemSubCategory] = useState('');
  const [newItemSku, setNewItemSku] = useState('');

  // New Order State
  const [selectedParty, setSelectedParty] = useState('');
  const [orderItems, setOrderItems] = useState<{ itemId: string; quantity: number | ''; bags: number | ''; rate: number | ''; searchTerm: string; isDropdownOpen: boolean }[]>([
    { itemId: '', quantity: '', bags: '', rate: '', searchTerm: '', isDropdownOpen: false }
  ]);
  const [taxType, setTaxType] = useState<'INCLUDED' | 'EXCLUDED'>('EXCLUDED');
  const [transportType, setTransportType] = useState<'CUSTOMER' | 'COMPANY'>('CUSTOMER');

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setOrders(db.getSalesOrders());
    setParties(db.getParties().filter(p => p.type !== 'SUPPLIER'));
    setItems(db.getItems());
  };

  const addItemRow = () => {
    setOrderItems([...orderItems, { itemId: '', quantity: '', bags: '', rate: '', searchTerm: '', isDropdownOpen: false }]);
  };

  const removeItemRow = (index: number) => {
    if (orderItems.length > 1) {
      setOrderItems(orderItems.filter((_, i) => i !== index));
    }
  };

  const updateItemRow = (index: number, field: string, value: any) => {
    const newItems = [...orderItems];
    const currentRow = newItems[index];

    if (field === 'itemId') {
      const selectedItem = items.find(i => i.id === value);
      newItems[index] = { 
        ...currentRow, 
        itemId: value, 
        searchTerm: selectedItem ? selectedItem.name : '',
        rate: selectedItem ? selectedItem.price : currentRow.rate,
        isDropdownOpen: false 
      };
      
      // If quantity is already there, auto-calculate bags based on NEW item
      if (selectedItem && currentRow.quantity !== '') {
        const stdWeight = selectedItem.standardBagWeight || 50;
        newItems[index].bags = Math.ceil(Number(currentRow.quantity) / stdWeight);
      }
    } else if (field === 'quantity') {
      const qty = value === '' ? '' : Number(value);
      newItems[index] = { ...currentRow, quantity: qty };
      
      // Auto-calculate bags if item is selected
      const selectedItem = items.find(i => i.id === currentRow.itemId);
      if (selectedItem && qty !== '') {
        const stdWeight = selectedItem.standardBagWeight || 50;
        newItems[index].bags = Math.ceil(qty / stdWeight);
      }
    } else {
      newItems[index] = { ...currentRow, [field]: value };
    }
    setOrderItems(newItems);
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    
    const processedItems = orderItems
      .filter(oi => oi.itemId !== '' && (oi.quantity as number) > 0 && (oi.rate as number) > 0)
      .map(oi => {
        const item = items.find(i => i.id === oi.itemId);
        return {
          itemId: oi.itemId,
          quantity: Number(oi.quantity),
          bags: Number(oi.bags) || 0,
          rate: Number(oi.rate),
          grade: item?.grade
        };
      });

    if (processedItems.length === 0 || !selectedParty) {
      alert("Please select a customer and ensure all item rows have valid Quantity and Rate.");
      return;
    }

    const totalAmount = processedItems.reduce((acc, curr) => acc + (curr.rate * curr.quantity), 0);

    const newOrder: SalesOrder = {
      id: Math.random().toString(36).substr(2, 9),
      orderNumber: `SO-${Date.now().toString().slice(-6)}`,
      partyId: selectedParty,
      items: processedItems,
      totalAmount,
      status: 'PENDING',
      orderDate: new Date().toISOString(),
      taxType,
      transportPaidBy: transportType
    };

    db.addSalesOrder(newOrder);
    refreshData();
    setShowNewOrder(false);
    resetForm();
  };

  const resetForm = () => {
    setSelectedParty('');
    setOrderItems([{ itemId: '', quantity: '', bags: '', rate: '', searchTerm: '', isDropdownOpen: false }]);
    setTaxType('EXCLUDED');
    setTransportType('CUSTOMER');
  };

  const getPartyName = (id: string) => parties.find(p => p.id === id)?.name || 'Unknown';
  
  const getWorkflowStage = (status: string) => {
    const stages = [
      { id: 'PENDING', label: 'Ordered', color: 'bg-slate-200' },
      { id: 'APPROVED', label: 'Approved', color: 'bg-blue-200' },
      { id: 'IN_PRODUCTION', label: 'In Production', color: 'bg-orange-200' },
      { id: 'READY_TO_DISPATCH', label: 'Packed', color: 'bg-indigo-200' },
      { id: 'DISPATCHED', label: 'Shipped', color: 'bg-green-200' },
      { id: 'INVOICED', label: 'Invoiced', color: 'bg-emerald-200' }
    ];
    
    const currentIndex = stages.findIndex(s => s.id === status);
    
    return (
      <div className="flex flex-col gap-1 w-full max-w-[150px]">
        <div className="flex gap-0.5 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
           {stages.map((s, idx) => (
             <div 
               key={s.id} 
               className={`flex-1 ${idx <= currentIndex ? (idx === currentIndex && status !== 'INVOICED' ? 'bg-amber-500 animate-pulse' : 'bg-slate-800') : 'bg-transparent'}`}
             ></div>
           ))}
        </div>
        <div className="flex justify-between items-center">
           <span className="text-[9px] font-black text-slate-800 uppercase tracking-tighter">
             {stages[currentIndex]?.label || status}
           </span>
           <span className="text-[8px] font-bold text-slate-400">
             {currentIndex + 1}/6
           </span>
        </div>
      </div>
    );
  };

  const groupedItems = items.reduce((acc, item) => {
    const cat = item.subCategory || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {} as Record<string, Item[]>);

  const inputNoArrows = "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tighter uppercase leading-none">Sales Hub</h2>
          <p className="text-slate-400 font-bold text-sm mt-3 uppercase tracking-wide">Managing customer pipelines & fulfillment</p>
        </div>
        <button 
          onClick={() => { resetForm(); setShowNewOrder(true); }}
          className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-slate-950 text-white rounded-2xl hover:bg-black shadow-2xl shadow-slate-200 font-black text-xs uppercase tracking-[0.2em] transition-all hover:-translate-y-1 active:scale-95"
        >
          <Plus className="w-5 h-5 text-amber-500" />
          Create Sales Order
        </button>
      </div>

      {showNewOrder && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl flex items-center justify-center z-[100] sm:p-6 lg:p-12">
          <div className="bg-[#F8FAFC] w-full h-full sm:h-auto sm:max-h-[95vh] sm:max-w-5xl sm:rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 relative">
            
            <div className="px-8 py-6 bg-white border-b border-slate-100 flex justify-between items-center z-10 shrink-0">
              <div>
                <h3 className="text-xl font-black text-slate-950 uppercase tracking-tight">New Order Creation</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">FY 2024-25 &bull; Order Draft</p>
              </div>
              <button 
                onClick={() => setShowNewOrder(false)} 
                className="p-3 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-10 space-y-12">
              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-1.5 h-6 bg-amber-500 rounded-full" />
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Step 1: Party Selection</h4>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-4 items-center">
                  <div className="relative flex-1 w-full">
                    <select 
                      value={selectedParty}
                      onChange={(e) => setSelectedParty(e.target.value)}
                      required 
                      className="w-full appearance-none bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-black text-sm text-slate-950 focus:ring-4 focus:ring-amber-500/5 focus:border-amber-500 outline-none transition-all pr-12"
                    >
                      <option value="">Choose Customer...</option>
                      {parties.map(p => <option key={p.id} value={p.id}>{p.name} ({p.city})</option>)}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                  <button 
                    type="button"
                    onClick={() => setShowNewPartyModal(true)}
                    className="w-full sm:w-auto p-4 bg-amber-50 text-amber-600 rounded-2xl hover:bg-amber-100 transition-colors flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest"
                  >
                    <UserPlus className="w-5 h-5" /> New Party
                  </button>
                </div>
              </section>

              <section className="space-y-6">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-amber-500 rounded-full" />
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Step 2: Order Items</h4>
                  </div>
                  <button 
                    type="button"
                    onClick={addItemRow}
                    className="flex items-center gap-2 text-[10px] font-black text-amber-600 hover:text-amber-700 bg-amber-50 px-4 py-2 rounded-xl uppercase transition-all shadow-sm shadow-amber-500/10 border border-amber-100"
                  >
                    <Plus className="w-4 h-4" /> Add Item Row
                  </button>
                </div>
                
                <div className="space-y-6">
                  {orderItems.map((oi, index) => {
                    const selectedItem = items.find(i => i.id === oi.itemId);
                    return (
                      <div key={index} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-visible animate-in slide-in-from-bottom-4 duration-300">
                        <div className="p-6 sm:p-8 space-y-6">
                          <div className="flex flex-col sm:flex-row gap-4 items-start justify-between">
                            <div className="flex-1 w-full relative">
                              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Spice Item</label>
                              <div className="flex gap-2">
                                <div className="relative flex-1">
                                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                  <input 
                                    type="text"
                                    placeholder="Type to find SKU or Category..."
                                    value={oi.searchTerm}
                                    onFocus={() => {
                                      const newItems = [...orderItems];
                                      newItems[index].isDropdownOpen = true;
                                      setOrderItems(newItems);
                                    }}
                                    onChange={(e) => {
                                      const newItems = [...orderItems];
                                      newItems[index].searchTerm = e.target.value;
                                      newItems[index].isDropdownOpen = true;
                                      setOrderItems(newItems);
                                    }}
                                    className="w-full pl-11 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-slate-950 focus:ring-4 focus:ring-amber-500/5 focus:border-amber-500 outline-none text-sm transition-all"
                                  />
                                  
                                  {oi.isDropdownOpen && (
                                    <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-3xl shadow-2xl border border-slate-100 z-[60] max-h-80 overflow-y-auto custom-scrollbar p-2">
                                      {(Object.entries(groupedItems) as [string, Item[]][]).map(([category, catItems]) => {
                                        const filtered = catItems.filter(i => 
                                          i.name.toLowerCase().includes(oi.searchTerm.toLowerCase()) || 
                                          category.toLowerCase().includes(oi.searchTerm.toLowerCase()) ||
                                          i.sku.toLowerCase().includes(oi.searchTerm.toLowerCase())
                                        );
                                        
                                        if (filtered.length === 0) return null;

                                        return (
                                          <div key={category} className="mb-4 last:mb-0">
                                            <div className="px-4 py-2 flex items-center gap-2">
                                              <Zap className="w-3 h-3 text-amber-500" />
                                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{category}</span>
                                            </div>
                                            {filtered.map(item => (
                                              <button
                                                key={item.id}
                                                type="button"
                                                onClick={() => updateItemRow(index, 'itemId', item.id)}
                                                className="w-full text-left px-4 py-3 hover:bg-amber-50 rounded-2xl flex items-center justify-between group transition-all"
                                              >
                                                <div className="flex items-center gap-3">
                                                  <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-white">
                                                    <Box className="w-4 h-4 text-slate-400 group-hover:text-amber-500" />
                                                  </div>
                                                  <div>
                                                    <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{item.name}</p>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase">{item.sku} &bull; {item.grade || 'STD'}</p>
                                                  </div>
                                                </div>
                                                <div className="text-right">
                                                  <p className="text-[10px] font-black text-slate-950">₹{item.price}</p>
                                                  <p className={`text-[8px] font-bold ${item.stock > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                    {item.stock > 0 ? `${item.stock} in Stock` : 'Out of Stock'}
                                                  </p>
                                                </div>
                                              </button>
                                            ))}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                  
                                  {oi.isDropdownOpen && (
                                    <div 
                                      className="fixed inset-0 z-[-1]" 
                                      onClick={() => {
                                        const newItems = [...orderItems];
                                        newItems[index].isDropdownOpen = false;
                                        setOrderItems(newItems);
                                      }}
                                    />
                                  )}
                                </div>
                              </div>
                            </div>
                            {orderItems.length > 1 && (
                              <button 
                                type="button" 
                                onClick={() => removeItemRow(index)}
                                className="p-3 text-rose-500 hover:bg-rose-50 rounded-2xl transition-all self-end"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-3 gap-6 pt-2">
                             <div className="space-y-2">
                               <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Total Quantity (Kg)</label>
                               <input 
                                  type="number" 
                                  placeholder="Kg"
                                  value={oi.quantity}
                                  onChange={(e) => updateItemRow(index, 'quantity', e.target.value)}
                                  required 
                                  min="1"
                                  className={`w-full bg-white border-2 border-slate-100 rounded-2xl p-4 font-black text-slate-950 focus:ring-4 focus:ring-amber-500/5 focus:border-amber-500 outline-none text-base ${inputNoArrows}`}
                                />
                             </div>
                             <div className="space-y-2">
                               <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Total Bags (Physical)</label>
                               <input 
                                  type="number" 
                                  placeholder="Bags"
                                  value={oi.bags}
                                  onChange={(e) => updateItemRow(index, 'bags', e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                                  required 
                                  min="0"
                                  className={`w-full bg-white border-2 border-slate-100 rounded-2xl p-4 font-black text-slate-950 focus:ring-4 focus:ring-amber-500/5 focus:border-amber-500 outline-none text-base ${inputNoArrows}`}
                                />
                                <p className="text-[8px] font-bold text-slate-400 uppercase mt-1 ml-1 italic">Auto-calculated from Packing Master</p>
                             </div>
                             <div className="space-y-2">
                               <label className="text-[9px] font-black text-amber-500 uppercase tracking-widest ml-1">Selling Rate (Manual)</label>
                               <div className="relative">
                                 <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500" />
                                 <input 
                                    type="number" 
                                    placeholder="Rate"
                                    value={oi.rate}
                                    onChange={(e) => updateItemRow(index, 'rate', e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
                                    required 
                                    min="0"
                                    step="0.01"
                                    className={`w-full pl-10 pr-4 py-4 bg-amber-50/50 border-2 border-amber-200 rounded-2xl font-black text-amber-600 focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none text-base ${inputNoArrows}`}
                                  />
                               </div>
                             </div>
                          </div>

                          <div className="pt-4 flex justify-end">
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                               Sub-Total: <span className="text-slate-950 text-xs ml-2">₹ {(Number(oi.rate) * Number(oi.quantity)).toLocaleString('en-IN')}</span>
                             </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="space-y-8 pb-32">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-1.5 h-6 bg-amber-500 rounded-full" />
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Step 3: Logistics & Taxes</h4>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Billing Logic</p>
                        <h5 className="text-sm font-black text-slate-900 uppercase">Tax Configuration</h5>
                      </div>
                    </div>
                    <div className="flex gap-3 p-2 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                      {(['INCLUDED', 'EXCLUDED'] as const).map(type => (
                        <button 
                          key={type}
                          type="button" 
                          onClick={() => setTaxType(type)}
                          className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase transition-all flex flex-col items-center gap-1 ${taxType === type ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                          <span>GST {type}</span>
                          <span className={`text-[8px] opacity-60 ${taxType === type ? 'text-white' : ''}`}>{type === 'INCLUDED' ? '(On Price)' : '(Add Extra)'}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                        <Truck className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Logistics Responsibility</p>
                        <h5 className="text-sm font-black text-slate-900 uppercase">Transport Payment</h5>
                      </div>
                    </div>
                    <div className="flex gap-3 p-2 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                      {(['CUSTOMER', 'COMPANY'] as const).map(p => (
                        <button 
                          key={p}
                          type="button" 
                          onClick={() => setTransportType(p)}
                          className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase transition-all flex flex-col items-center gap-1 ${transportType === p ? 'bg-slate-950 text-white shadow-xl shadow-slate-950/20' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                          <span>{p}</span>
                          <span className={`text-[8px] opacity-60 ${transportType === p ? 'text-white' : ''}`}>{p === 'CUSTOMER' ? '(Paid by Party)' : '(Paid by ABC)'}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            </form>

            <div className="p-6 sm:p-8 bg-white border-t border-slate-100 flex flex-col sm:flex-row gap-6 items-center justify-between shadow-[0_-15px_40px_-15px_rgba(0,0,0,0.08)] z-20 shrink-0">
              <div className="flex flex-col items-center sm:items-start">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Estimated Grand Total</p>
                 <div className="flex items-center gap-3 mt-2">
                    <div className="p-2 bg-amber-500 rounded-xl text-slate-950">
                      <IndianRupee className="w-5 h-5" />
                    </div>
                    <span className="text-4xl font-black text-slate-950 tracking-tighter">
                      {orderItems.reduce((acc, oi) => acc + (Number(oi.rate) * Number(oi.quantity)), 0).toLocaleString('en-IN')}
                    </span>
                 </div>
              </div>
              <div className="w-full sm:w-auto flex gap-3">
                <button type="button" onClick={() => setShowNewOrder(false)} className="flex-1 sm:flex-none px-10 py-5 rounded-[1.75rem] bg-slate-100 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all">Discard Draft</button>
                <button onClick={handleCreateOrder} className="flex-1 sm:flex-none px-12 py-5 bg-slate-950 text-white rounded-[1.75rem] font-black text-[10px] uppercase tracking-[0.25em] shadow-2xl shadow-slate-950/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">Finalize Order <CheckCircle2 className="w-5 h-5 text-amber-500" /></button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Table Section */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 sm:p-8 border-b flex flex-col lg:flex-row justify-between items-center gap-6 bg-slate-50/30">
          <div className="relative w-full lg:max-w-md group">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
            <input type="text" placeholder="Search by order # or party..." className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-amber-500/5 focus:border-amber-500 outline-none transition-all" />
          </div>
          <div className="flex gap-3 w-full lg:w-auto">
            <button onClick={refreshData} className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-4 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:text-slate-900 transition-all font-black text-[10px] uppercase tracking-widest shadow-sm"><Clock className="w-4 h-4" /> Refresh</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">
              <tr>
                <th className="px-8 py-6">Order ID</th>
                <th className="px-8 py-6">Customer</th>
                <th className="px-8 py-6 text-center">Items</th>
                <th className="px-8 py-6 text-right">Amount</th>
                <th className="px-8 py-6 text-center">Status Tracking</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm">
              {orders.map(order => (
                <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <p className="font-black text-slate-900 uppercase tracking-tight">{order.orderNumber}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">{new Date(order.orderDate).toLocaleDateString()}</p>
                  </td>
                  <td className="px-8 py-6">
                    <p className="font-bold text-slate-700 uppercase">{getPartyName(order.partyId)}</p>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className="px-3 py-1 bg-slate-100 rounded-lg font-black text-[9px] text-slate-500">{order.items.length} SKUs</span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <p className="font-black text-slate-950">₹ {order.totalAmount.toLocaleString('en-IN')}</p>
                  </td>
                  <td className="px-8 py-6 flex justify-center">
                    {getWorkflowStage(order.status)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalesDashboard;
