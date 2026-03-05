
import React, { useState } from 'react';
import { User, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { UserRole } from '../types';

interface LoginProps {
  onLogin: (role: UserRole) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.ADMIN);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(selectedRole);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Dynamic Background */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-amber-600 rounded-full mix-blend-multiply filter blur-[140px] opacity-15 animate-pulse"></div>
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-[140px] opacity-15 animate-pulse delay-700"></div>

      <div className="w-full max-w-md z-10 animate-in fade-in zoom-in-95 duration-1000">
        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-gradient-to-br from-amber-500 to-amber-700 rounded-[2.5rem] mx-auto mb-8 flex items-center justify-center shadow-2xl rotate-6 ring-8 ring-white/5">
             <span className="text-4xl font-black text-slate-950">A</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tighter mb-3 uppercase leading-none">ABC Industries</h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.4em]">Proprietary ERP v3.2</p>
        </div>

        <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 p-8 sm:p-12 rounded-[3.5rem] shadow-2xl relative">
          <div className="absolute -top-4 -right-4 bg-amber-500 text-slate-950 p-3 rounded-2xl shadow-xl shadow-amber-500/20 animate-bounce">
            <ShieldCheck className="w-5 h-5" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 ml-1 uppercase tracking-widest">Choose Department</label>
              <div className="grid grid-cols-2 gap-3">
                {Object.values(UserRole).map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setSelectedRole(role)}
                    className={`px-4 py-4 rounded-2xl text-[10px] font-black transition-all border-2 uppercase tracking-tight ${
                      selectedRole === role 
                        ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xl shadow-amber-500/20' 
                        : 'bg-white/5 border-white/10 text-slate-500 hover:border-white/20 hover:text-slate-300'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="relative group">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-amber-500 transition-colors" />
                <input 
                  type="text" 
                  placeholder="USERNAME" 
                  defaultValue="admin"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-4 py-5 text-white font-bold text-sm focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all placeholder:text-slate-700"
                />
              </div>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-amber-500 transition-colors" />
                <input 
                  type="password" 
                  placeholder="SECURITY KEY" 
                  defaultValue="password"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-4 py-5 text-white font-bold text-sm focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all placeholder:text-slate-700"
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full py-5 bg-white text-slate-950 rounded-3xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl hover:bg-slate-100 active:scale-[0.98] transition-all flex items-center justify-center gap-3 group"
            >
              Access ERP
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>
        
        <div className="mt-16 flex flex-col items-center gap-4 opacity-40">
           <div className="flex gap-4">
              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
           </div>
           <p className="text-center text-white text-[9px] font-black uppercase tracking-[0.4em] leading-relaxed">
             Secure FSSAI-Compliant Core System
           </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
