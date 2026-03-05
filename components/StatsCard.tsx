
import React from 'react';
import { LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  color: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
}

const StatsCard: React.FC<StatsCardProps> = ({ label, value, icon: Icon, trend, color }) => {
  const isPositive = trend?.startsWith('+');
  
  const accents = {
    blue: 'text-blue-600 bg-blue-50 border-blue-100',
    green: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    red: 'text-rose-600 bg-rose-50 border-rose-100',
    yellow: 'text-amber-600 bg-amber-50 border-amber-100',
    purple: 'text-indigo-600 bg-indigo-50 border-indigo-100',
  };

  return (
    <div className="group bg-white p-6 sm:p-8 rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 border border-slate-100 transition-all duration-500">
      <div className="flex items-start justify-between mb-6">
        <div className={`p-4 rounded-2xl border ${accents[color]} group-hover:scale-110 transition-transform duration-500`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
            {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {trend.replace('+', '').replace('-', '')}
          </div>
        )}
      </div>
      
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{label}</p>
        <h3 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tighter">{value}</h3>
      </div>
      
      <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
        <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Global Analytics</span>
        <div className="flex gap-1.5">
          <div className="w-1.5 h-1.5 bg-slate-100 rounded-full" />
          <div className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
          <div className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
