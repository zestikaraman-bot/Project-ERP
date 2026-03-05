
import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ShoppingBag, Users, PackageCheck, Banknote, Sparkles, TrendingUp, Calendar, ChevronRight } from 'lucide-react';
import StatsCard from '../components/StatsCard';
import { db } from '../db';

const initialChartData = [
  { name: 'Jan', sales: 4000, production: 2400 },
  { name: 'Feb', sales: 3000, production: 1398 },
  { name: 'Mar', sales: 2000, production: 9800 },
  { name: 'Apr', sales: 2780, production: 3908 },
  { name: 'May', sales: 1890, production: 4800 },
  { name: 'Jun', sales: 2390, production: 3800 },
];

const Dashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'year'>('month');
  const [config] = useState(db.getDashboardConfig());
  const [stats, setStats] = useState({
    sales: '₹ 12.45L',
    customers: '842',
    production: '3,400',
    orders: '18',
    salesTrend: '+12.5%',
    custTrend: '+3.2%',
    prodTrend: '+8.1%',
    orderTrend: '-2.4%',
  });
  const [chartData, setChartData] = useState(initialChartData);

  useEffect(() => {
    const multiplier = timeRange === 'today' ? 0.05 : timeRange === 'week' ? 0.25 : timeRange === 'month' ? 1 : 12;
    setStats({
      sales: `₹ ${(12.45 * multiplier).toFixed(2)}L`,
      customers: Math.floor(842 * (multiplier / 2 + 0.5)).toString(),
      production: Math.floor(3400 * multiplier).toLocaleString(),
      orders: Math.floor(18 * multiplier).toString(),
      salesTrend: timeRange === 'today' ? '+1.2%' : '+12.5%',
      custTrend: '+3.2%',
      prodTrend: '+8.1%',
      orderTrend: '-2.4%',
    });

    setChartData(initialChartData.map(d => ({
        ...d,
        sales: d.sales * (0.8 + Math.random() * 0.4),
        production: d.production * (0.8 + Math.random() * 0.4)
    })));
  }, [timeRange]);

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Welcome Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="text-[10px] font-black text-amber-600 uppercase tracking-[0.4em]">Operational Pulse</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tighter uppercase leading-none">Factory Overview</h2>
          <p className="text-slate-400 font-bold text-sm mt-3 uppercase tracking-wide">Monitoring real-time spice production</p>
        </div>
        
        <div className="w-full md:w-auto flex items-center gap-4 bg-white p-2 rounded-3xl border border-slate-100 shadow-sm overflow-x-auto custom-scrollbar">
          <div className="flex items-center gap-2 px-5 py-2 border-r border-slate-100 whitespace-nowrap">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Range:</span>
          </div>
          <div className="flex gap-1.5 pr-2">
            {(['today', 'week', 'month', 'year'] as const).map(range => (
               <button 
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${timeRange === range ? 'bg-slate-950 text-white shadow-xl shadow-slate-900/20' : 'text-slate-400 hover:text-slate-950 hover:bg-slate-50'}`}
               >
                 {range}
               </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
        {config.showSales && <StatsCard label="Net Revenue" value={stats.sales} icon={Banknote} trend={stats.salesTrend} color="yellow" />}
        {config.showCustomers && <StatsCard label="Active Partners" value={stats.customers} icon={Users} trend={stats.custTrend} color="blue" />}
        {config.showProduction && <StatsCard label="Total Processed" value={stats.production} icon={PackageCheck} trend={stats.prodTrend} color="green" />}
        {config.showOrders && <StatsCard label="Daily Orders" value={stats.orders} icon={ShoppingBag} trend={stats.orderTrend} color="red" />}
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 bg-white p-6 sm:p-10 rounded-[3rem] shadow-sm border border-slate-50 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full -translate-y-24 translate-x-24 blur-3xl group-hover:bg-amber-500/10 transition-colors duration-700" />
          
          <div className="flex justify-between items-center mb-12 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-1.5 h-10 bg-amber-500 rounded-full" />
              <div>
                <h4 className="text-lg font-black text-slate-950 uppercase tracking-tight">Market Trajectory</h4>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Comparing Sales vs Raw Processing</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Sales</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Production</span>
              </div>
            </div>
          </div>
          
          <div className="h-80 sm:h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', fontWeight: 900, fontSize: '11px', textTransform: 'uppercase' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#f59e0b" strokeWidth={4} fillOpacity={1} fill="url(#colorSales)" />
                <Area type="monotone" dataKey="production" stroke="#cbd5e1" strokeWidth={2} fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-8">
           <div className="bg-slate-950 p-8 sm:p-10 rounded-[3rem] text-white shadow-2xl shadow-slate-950/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full -translate-y-12 translate-x-12 blur-3xl group-hover:scale-150 transition-transform duration-700" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-amber-500" />
                  </div>
                  <h4 className="text-xl font-black tracking-tight uppercase">Master Adjust</h4>
                </div>
                <p className="text-slate-400 text-[10px] font-bold leading-relaxed mb-10 uppercase tracking-[0.15em]">Detected pricing shifts in the Cardamom (8MM) segment.</p>
                <button className="w-full py-5 bg-amber-500 text-slate-950 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-amber-500/20 hover:bg-amber-400 active:scale-95 transition-all flex items-center justify-center gap-3">
                  Pricing Hub <ChevronRight className="w-4 h-4" />
                </button>
              </div>
           </div>

           <div className="bg-white p-8 sm:p-10 rounded-[3rem] border border-slate-100 shadow-sm">
             <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8">Recent Events</h4>
             <div className="space-y-8">
               {[
                 { title: 'PO #882', time: '2m ago', desc: 'Arrived: Black Pepper (R)', color: 'bg-emerald-500' },
                 { title: 'SO-12', time: '15m ago', desc: 'Approved by Finance', color: 'bg-blue-500' },
                 { title: 'Batch P-44', time: '1h ago', desc: 'Packing Completed', color: 'bg-amber-500' },
               ].map((activity, i) => (
                 <div key={i} className="flex gap-6 group cursor-pointer items-start">
                   <div className={`w-2.5 h-2.5 rounded-full ${activity.color} mt-1.5 shadow-[0_0_8px_rgba(0,0,0,0.1)] transition-transform group-hover:scale-125`} />
                   <div>
                     <div className="flex items-center gap-3 mb-1">
                       <p className="text-xs font-black text-slate-950 uppercase tracking-tight">{activity.title}</p>
                       <span className="text-[9px] font-bold text-slate-300 uppercase">{activity.time}</span>
                     </div>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide leading-tight">{activity.desc}</p>
                   </div>
                 </div>
               ))}
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
