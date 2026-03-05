
import React, { useState, useEffect } from 'react';
import { IndianRupee, FileText, TrendingUp, Wallet, ArrowUpRight, ArrowDownLeft, Receipt, CheckCircle } from 'lucide-react';
import StatsCard from '../components/StatsCard';
import { db } from '../db';
import { SalesOrder } from '../types';

const AccountsDashboard: React.FC = () => {
  const [pendingInvoices, setPendingInvoices] = useState<SalesOrder[]>([]);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setPendingInvoices(db.getSalesOrders().filter(o => o.status === 'DISPATCHED'));
  };

  const generateInvoice = (orderId: string) => {
    db.updateSalesOrderStatus(orderId, 'INVOICED');
    // In a real app, this would also add a Ledger entry and GST record
    refreshData();
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Accounts & Finance</h2>
          <p className="text-gray-500">Invoicing, GST and Party Ledgers</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard label="Net Profit" value="₹ 4.52L" icon={TrendingUp} color="green" />
        <StatsCard label="Total Outstanding" value="₹ 12.80L" icon={Wallet} color="red" />
        <StatsCard label="GST Payable" value="₹ 85,200" icon={FileText} color="blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pending Invoicing Queue (NEW) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b bg-blue-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-gray-800 uppercase text-sm">Pending GST Invoicing</h3>
            </div>
            <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">{pendingInvoices.length}</span>
          </div>
          <div className="divide-y">
            {pendingInvoices.map(order => (
              <div key={order.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div>
                  <p className="font-bold text-gray-900">{order.orderNumber}</p>
                  <p className="text-xs text-gray-500">Disp. Via: {order.logistics?.transporter} (LR: {order.logistics?.lrNumber})</p>
                  <p className="text-xs font-bold text-blue-600 mt-1">₹ {order.totalAmount.toLocaleString()}</p>
                </div>
                <button 
                  onClick={() => generateInvoice(order.id)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 shadow-sm"
                >
                  <CheckCircle className="w-3 h-3" />
                  Generate Invoice
                </button>
              </div>
            ))}
            {pendingInvoices.length === 0 && (
              <p className="text-center py-12 text-gray-400 italic text-sm">No orders pending invoice.</p>
            )}
          </div>
        </div>

        {/* Tax Summary */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            GSTR-1 Summary
          </h3>
          <div className="space-y-6">
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase">Taxable Value</p>
                <h4 className="text-lg font-black text-gray-900">₹ 8,45,000</h4>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-gray-400 uppercase">Output GST</p>
                <h4 className="text-lg font-black text-blue-600">₹ 1,52,100</h4>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 border rounded-xl">
                <p className="text-[10px] font-bold text-gray-400 uppercase">Sales Today</p>
                <p className="font-black text-gray-800">₹ 42,500</p>
              </div>
              <div className="p-3 border rounded-xl">
                <p className="text-[10px] font-bold text-gray-400 uppercase">Collections</p>
                <p className="font-black text-green-600">₹ 31,000</p>
              </div>
            </div>
            <button className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all text-sm shadow-xl shadow-gray-200">
              Generate Comprehensive Audit Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountsDashboard;
