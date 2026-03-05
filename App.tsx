
import React, { useState, useEffect } from 'react';
import { HashRouter as Router } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import SalesDashboard from './pages/SalesDashboard';
import PurchaseDashboard from './pages/PurchaseDashboard';
import OperationsDashboard from './pages/OperationsDashboard';
import ProductionDashboard from './pages/ProductionDashboard';
import AccountsDashboard from './pages/AccountsDashboard';
import AdminDashboard from './pages/AdminDashboard';
import InventoryDashboard from './pages/InventoryDashboard';
import PriceList from './pages/PriceList';
import RateManager from './pages/RateManager';
import Login from './pages/Login';
import { UserRole } from './types';
import { Menu, Search, Bell, Command, Scan } from 'lucide-react';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const savedRole = localStorage.getItem('erp_session_role');
    if (savedRole) {
      setUserRole(savedRole as UserRole);
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (role: UserRole) => {
    setUserRole(role);
    setIsAuthenticated(true);
    localStorage.setItem('erp_session_role', role);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    localStorage.removeItem('erp_session_role');
  };

  if (!isAuthenticated || !userRole) {
    return <Login onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'ratemanager': return <RateManager />;
      case 'inventory': return <InventoryDashboard role={userRole} />;
      case 'pricelist': return <PriceList />;
      case 'sales': return <SalesDashboard />;
      case 'purchase': return <PurchaseDashboard />;
      case 'operations': return <OperationsDashboard role={userRole} />;
      case 'production': return <ProductionDashboard role={userRole} />;
      case 'accounts': return <AccountsDashboard />;
      case 'admin': return <AdminDashboard />;
      default: return <Dashboard />;
    }
  };

  return (
    <Router>
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col lg:flex-row transition-all duration-500">
        <Sidebar 
          role={userRole} 
          onLogout={handleLogout} 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        
        <div className="flex-1 lg:ml-72 flex flex-col min-h-screen w-full overflow-hidden">
          {/* Responsive Header */}
          <header className="px-6 lg:px-12 py-5 flex items-center justify-between sticky top-0 bg-white/70 backdrop-blur-2xl z-40 border-b border-slate-100">
             <div className="flex items-center gap-4 lg:gap-8 flex-1">
                <button 
                  onClick={() => setIsSidebarOpen(true)}
                  className="lg:hidden p-3 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-all"
                >
                  <Menu className="w-5 h-5 text-slate-700" />
                </button>
                
                {/* Mobile Search Icon vs Desktop Search Bar */}
                <div className="hidden sm:flex items-center flex-1 max-w-md relative group">
                  <Search className="absolute left-4 w-4 h-4 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Quick search commands..." 
                    className="w-full bg-slate-100 border-none rounded-2xl pl-11 pr-4 py-3.5 text-xs font-bold focus:ring-2 focus:ring-amber-500/20 transition-all placeholder:text-slate-400"
                  />
                  <div className="absolute right-4 hidden lg:flex items-center gap-1 px-1.5 py-1 bg-white rounded-lg border border-slate-200 text-[8px] font-black text-slate-400 uppercase">
                    <Command className="w-2 h-2" /> K
                  </div>
                </div>

                <button className="sm:hidden p-3 bg-slate-100 rounded-2xl">
                  <Search className="w-5 h-5 text-slate-700" />
                </button>
             </div>
             
             <div className="flex items-center gap-3 lg:gap-8">
                <button className="hidden sm:flex items-center gap-2 p-3 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-all">
                  <Scan className="w-5 h-5 text-slate-700" />
                </button>

                <button className="relative p-3 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-all group">
                  <Bell className="w-5 h-5 text-slate-700 group-hover:rotate-12 transition-transform" />
                  <div className="absolute top-3 right-3 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
                </button>

                <div className="h-8 w-px bg-slate-100 hidden sm:block" />

                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-black text-slate-900 leading-none">ABC Industries</p>
                    <p className="text-[9px] font-bold text-amber-600 mt-1 uppercase tracking-widest">FY 2024-25</p>
                  </div>
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-slate-950 rounded-2xl flex items-center justify-center text-white font-black text-xs lg:text-sm shadow-xl shadow-slate-200 ring-4 ring-white">
                    {userRole.charAt(0)}
                  </div>
                </div>
             </div>
          </header>

          <main className="flex-1 px-4 sm:px-8 lg:px-12 pb-12 pt-6 sm:pt-10">
            <div className="max-w-7xl mx-auto">
              {renderContent()}
              
              <footer className="mt-24 pt-12 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-black text-[10px] text-slate-400">ABC</div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] text-center sm:text-left">
                    &copy; 2025 Spice Industries &bull; Secure Encrypted Session
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-8">
                  <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">Documentation</button>
                  <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">Support</button>
                  <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">Privacy</button>
                </div>
              </footer>
            </div>
          </main>
        </div>
      </div>
    </Router>
  );
};

export default App;
