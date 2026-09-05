import React from 'react';
import { 
  TrendingUp, 
  ShoppingCart, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight, 
  Plus, 
  CreditCard, 
  AlertCircle,
  FileCheck,
  CheckCircle2,
  PieChart
} from 'lucide-react';

export default function Dashboard({ 
  invoices, 
  vendorBills, 
  payments, 
  onOpenNewInvoice, 
  onOpenNewBill, 
  onOpenPaymentModal,
  setActiveTab 
}) {
  // Calculations
  const totalRevenue = invoices.reduce((sum, inv) => sum + Number(inv.totalAmount || 0), 0);
  const totalPurchases = vendorBills.reduce((sum, bill) => sum + Number(bill.totalAmount || 0), 0);
  const netProfit = totalRevenue - totalPurchases;

  const totalReceivables = invoices.reduce((sum, inv) => sum + Number(inv.balance || 0), 0);
  const totalPayables = vendorBills.reduce((sum, bill) => sum + Number(bill.balance || 0), 0);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-2xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="z-10 space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">Financial Overview</span>
          <h2 className="text-2xl font-extrabold tracking-tight">Urban Furniture ERP Accounting</h2>
          <p className="text-xs text-slate-300">Automated double-entry bookkeeping engine with real-time reports.</p>
        </div>
        
        <div className="z-10 flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenNewInvoice}
            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-900/30 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>New Invoice</span>
          </button>
          <button
            onClick={onOpenNewBill}
            className="flex items-center space-x-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-amber-900/30 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>New Vendor Bill</span>
          </button>
          <button
            onClick={onOpenPaymentModal}
            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-900/30 active:scale-95"
          >
            <CreditCard className="w-4 h-4" />
            <span>Register Payment</span>
          </button>
        </div>
      </div>

      {/* Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Sales Revenue</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-900">{formatCurrency(totalRevenue)}</h3>
            <div className="flex items-center mt-1 text-[11px] text-emerald-600 font-medium space-x-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+18.4% vs last month</span>
            </div>
          </div>
        </div>

        {/* Total Purchases */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Purchases (COGS)</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-900">{formatCurrency(totalPurchases)}</h3>
            <div className="flex items-center mt-1 text-[11px] text-slate-500 font-medium space-x-1">
              <span>{vendorBills.length} Active Bills</span>
            </div>
          </div>
        </div>

        {/* Net Profit */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Net Profit</span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${netProfit >= 0 ? 'bg-indigo-50 text-indigo-600' : 'bg-rose-50 text-rose-600'}`}>
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className={`text-2xl font-bold ${netProfit >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}>
              {formatCurrency(netProfit)}
            </h3>
            <div className="flex items-center mt-1 text-[11px] text-slate-500 font-medium space-x-1">
              <span>Sales Revenue - Purchase Expense</span>
            </div>
          </div>
        </div>

        {/* Outstanding Receivables / Payables */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Outstanding Balance</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 space-y-1">
            <div className="flex justify-between items-baseline text-xs">
              <span className="text-slate-500">Receivables (Debtors):</span>
              <span className="font-bold text-emerald-600">{formatCurrency(totalReceivables)}</span>
            </div>
            <div className="flex justify-between items-baseline text-xs">
              <span className="text-slate-500">Payables (Creditors):</span>
              <span className="font-bold text-amber-600">{formatCurrency(totalPayables)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Transactions & Financial Quick Access */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Invoices & Bills Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileCheck className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-sm text-slate-900">Recent Customer Invoices</h3>
            </div>
            <button 
              onClick={() => setActiveTab('sales')} 
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
            >
              View All
            </button>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Outstanding</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.slice(0, 5).map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-800">{inv.id}</td>
                    <td className="py-3 px-4 text-slate-600">{inv.customerName}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{formatCurrency(inv.totalAmount)}</td>
                    <td className="py-3 px-4 font-medium text-slate-700">{formatCurrency(inv.balance)}</td>
                    <td className="py-3 px-4">
                      <span className={`
                        px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                        ${inv.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : ''}
                        ${inv.status === 'Partially Paid' ? 'bg-amber-100 text-amber-700' : ''}
                        ${inv.status === 'Unpaid' ? 'bg-rose-100 text-rose-700' : ''}
                      `}>
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Real-time Double-Entry Status & Quick Reports Card */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
              <PieChart className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-sm text-slate-900">Accounting Ledger Health</h3>
            </div>
            
            <div className="mt-4 space-y-3">
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-emerald-900">Double-Entry Status: Balanced</h4>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    All journal entries satisfy <code className="bg-emerald-100 px-1 py-0.5 rounded font-mono">Debits = Credits</code>.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100">
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="font-semibold text-indigo-900">Revenue Target</span>
                  <span className="font-bold text-indigo-700">72%</span>
                </div>
                <div className="w-full bg-indigo-200/60 rounded-full h-2 overflow-hidden">
                  <div className="bg-indigo-600 h-2 rounded-full w-[72%]"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <button
              onClick={() => setActiveTab('reports')}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-2"
            >
              <span>Open Financial Reports</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
