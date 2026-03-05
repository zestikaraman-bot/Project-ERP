
import React from 'react';
import { 
  LayoutDashboard, ShoppingCart, Settings, Truck, Factory, 
  ReceiptIndianRupee, LogOut, ChevronRight, Boxes, FileText, 
  Zap, X, Package, User
} from 'lucide-react';
import { UserRole } from '../types';

interface SidebarProps {
  role: UserRole;
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ role, onLogout, activeTab, setActiveTab, isOpen, onClose }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard, roles: Object.values(UserRole) },
    { id: 'inventory', label: 'Stock Master', icon: Boxes, roles: Object.values(UserRole) },
    { id: 'pricelist', label: 'Rate List', icon: FileText, roles: [UserRole.ADMIN, UserRole.SALES, UserRole.PURCHASE, UserRole.ACCOUNTS] },
    { id: 'ratemanager', label: 'Pricing Hub', icon: Zap, roles: [UserRole.ADMIN, UserRole.ACCOUNTS] },
    { id: 'sales', label: 'Sales Orders', icon: ShoppingCart, roles: [UserRole.ADMIN, UserRole.SALES] },
    { id: 'purchase', label: 'Procurement', icon: Package, roles: [UserRole.ADMIN, UserRole.PURCHASE] },
    { id: 'production', label: 'Factory Floor', icon: Factory, roles: [UserRole.ADMIN, UserRole.PRODUCTION, UserRole.SALES] },
    { id: 'operations', label: 'Operations Control', icon: Truck, roles: [UserRole.ADMIN, UserRole.OPERATIONS, UserRole.SALES] },
    { id: 'accounts', label: 'Finance', icon: ReceiptIndianRupee, roles: [UserRole.ADMIN, UserRole.ACCOUNTS] },
    { id: 'admin', label: 'Settings', icon: Settings, roles: [UserRole.ADMIN] },
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(role));

  return (
    <>
      {/* Mobile Backdrop */}
      <div 
        className={`fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[100] transition-opacity duration-500 lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      {/* Sidebar Container */}
      <aside className={`fixed left-0 top-0 h-full w-72 z-[101] transition-all duration-500 transform lg:translate-x-0 bg-slate-950 text-slate-400 border-r border-white/5 ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Brand Header */}
          <div className="p-8 pb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-500 rounded-2xl flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-amber-500/20">A</div>
              <div>
                <h1 className="text-white font-black text-lg tracking-tight leading-none uppercase">ABC Spice</h1>
                <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest">Enterprise ERP</p>
              </div>
            </div>
            {onClose && (
              <button onClick={onClose} className="lg:hidden p-2 text-slate-500 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar pt-6">
            {filteredItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (onClose) onClose();
                }}
                className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all group ${
                  activeTab === item.id 
                    ? 'bg-white/5 text-white shadow-inner' 
                    : 'hover:bg-white/[0.02] hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-4">
                  <item.icon className={`w-5 h-5 transition-colors ${activeTab === item.id ? 'text-amber-500' : 'text-slate-500 group-hover:text-slate-300'}`} />
                  <span className={`text-sm font-bold tracking-tight ${activeTab === item.id ? 'opacity-100' : 'opacity-60'}`}>
                    {item.label}
                  </span>
                </div>
                {activeTab === item.id && <div className="w-1.5 h-1.5 bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.8)]" />}
              </button>
            ))}
          </nav>

          {/* Bottom User Area */}
          <div className="p-6 mt-auto">
            <div className="bg-white/5 rounded-3xl p-5 border border-white/5">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center border border-white/10 ring-4 ring-slate-900 shadow-xl">
                  <User className="w-5 h-5 text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-white truncate uppercase tracking-tight">{role}</p>
                  <p className="text-[9px] font-bold text-slate-500 truncate uppercase tracking-widest">V3.2.04 Online</p>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-all text-[10px] font-black uppercase tracking-[0.2em]"
              >
                <LogOut className="w-4 h-4" />
                End Session
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
