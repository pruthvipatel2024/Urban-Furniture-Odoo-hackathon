import React from 'react';
import { useAccounting } from '../context/AccountingContext';
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
  PieChart,
  Package,
  Layers,
  Sparkles,
  ShieldCheck,
  Scale
} from 'lucide-react';

export default function Dashboard({
  onOpenNewInvoice,
  onOpenNewBill,
  onOpenPaymentModal
}) {
  const {
    invoices,
    vendorBills,
    products,
    chartOfAccounts,
    pnlData,
    balanceSheetData,
    stockReportData,
    setActiveTab,
    setShowDemoTourModal,
    formatCurrency
  } = useAccounting();

  const totalRevenue = pnlData.totalRevenue;
  const totalPurchases = pnlData.purchaseExpense;
  const netProfit = pnlData.netProfit;
  const totalReceivables = balanceSheetData.debtorsAcc;
  const totalPayables = balanceSheetData.creditorsAcc;
  const totalLiquid = balanceSheetData.cashAcc + balanceSheetData.bankAcc;
  const inventoryValuation = balanceSheetData.inventoryValuation;

  const lowStockCount = stockReportData.filter(p => p.isLowStock).length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="glass-panel bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 p-6 sm:p-8 rounded-3xl text-white shadow-2xl relative overflow-hidden border border-indigo-500/30">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-950/80 px-3 py-1 rounded-full border border-indigo-800/60">
                ERP Double-Entry Accounting
              </span>
              <span className="text-[11px] font-semibold text-emerald-400 flex items-center space-x-1 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-800/40">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Ledger 100% Balanced</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Urban Furniture — Enterprise Accounting Engine
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Automated double-entry bookkeeping connecting Contacts, Products, Orders, Bills, Invoices, Payments, Budgets, and Live Financial Statements.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowDemoTourModal(true)}
              className="flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-amber-500/20 active:scale-95"
            >
              <Sparkles className="w-4 h-4 fill-slate-950" />
              <span>14-Step Demo Tour</span>
            </button>

            <button
              onClick={onOpenNewInvoice}
              className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-900/30 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>New Sales Order</span>
            </button>

            <button
              onClick={onOpenNewBill}
              className="flex items-center space-x-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-amber-900/30 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>New Purchase Order</span>
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
      </div>

      {/* Primary KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Sales Revenue */}
        <div className="glass-panel p-5 rounded-2xl space-y-2 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Sales Revenue</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-500/30">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-100 font-mono">{formatCurrency(totalRevenue)}</h3>
            <div className="flex items-center mt-1 text-[11px] text-emerald-400 font-medium space-x-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>{invoices.length} Active Customer Invoices</span>
            </div>
          </div>
        </div>

        {/* Total Purchases (COGS) */}
        <div className="glass-panel p-5 rounded-2xl space-y-2 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Cost of Goods Sold (COGS)</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-500/30">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-100 font-mono">{formatCurrency(totalPurchases)}</h3>
            <div className="flex items-center mt-1 text-[11px] text-slate-400 font-medium space-x-1">
              <span>{vendorBills.length} Vendor Bills</span>
            </div>
          </div>
        </div>

        {/* Net Profit */}
        <div className="glass-panel p-5 rounded-2xl space-y-2 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Net Profit (P&L)</span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${netProfit >= 0 ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'}`}>
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className={`text-2xl font-bold font-mono ${netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatCurrency(netProfit)}
            </h3>
            <div className="flex items-center mt-1 text-[11px] text-slate-400 font-medium space-x-1">
              <span>Margin: {pnlData.profitMarginPercent}%</span>
            </div>
          </div>
        </div>

        {/* Liquid Liquidity & Inventory */}
        <div className="glass-panel p-5 rounded-2xl space-y-2 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Bank & Cash Liquidity</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center border border-indigo-500/30">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-indigo-300 font-mono">{formatCurrency(totalLiquid)}</h3>
            <div className="flex justify-between items-center text-[11px] text-slate-400">
              <span>Stock Valuation:</span>
              <span className="font-bold text-slate-200 font-mono">{formatCurrency(inventoryValuation)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Invoices & Bills Feed */}
        <div className="lg:col-span-2 glass-panel rounded-2xl overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileCheck className="w-4 h-4 text-indigo-400" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200">Recent Customer Invoices</h3>
              </div>
              <button
                onClick={() => setActiveTab('sales')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
              >
                View All Invoices →
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800/60 text-slate-400 text-[11px]">
                    <th className="py-3 px-4">Invoice #</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Total Amount</th>
                    <th className="py-3 px-4">Outstanding</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {invoices.slice(0, 5).map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-emerald-400">{inv.id}</td>
                      <td className="py-3 px-4 text-slate-200 font-semibold">{inv.customerName}</td>
                      <td className="py-3 px-4 font-bold text-slate-100 font-mono">{formatCurrency(inv.totalAmount)}</td>
                      <td className="py-3 px-4 font-bold text-emerald-400 font-mono">{formatCurrency(inv.balance)}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            inv.status === 'Paid'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : inv.status === 'Partially Paid'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Outstanding Receivables vs Payables Pill */}
          <div className="p-4 bg-slate-950/60 border-t border-slate-800 grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-500 block">Trade Receivables (Debtors):</span>
              <p className="font-extrabold text-emerald-400 font-mono text-sm">{formatCurrency(totalReceivables)}</p>
            </div>
            <div className="text-right">
              <span className="text-slate-500 block">Trade Payables (Creditors):</span>
              <p className="font-extrabold text-amber-400 font-mono text-sm">{formatCurrency(totalPayables)}</p>
            </div>
          </div>
        </div>

        {/* Accounting Health & Inventory Widget */}
        <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-800">
              <PieChart className="w-4 h-4 text-indigo-400" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200">Accounting Ledger Health</h3>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
              <div className="flex items-center space-x-2 text-emerald-300 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Double-Entry Balanced</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                All transactional debits strictly match credits ($Assets = Liabilities + Capital$).
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-800/40 space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-300">
                <span className="font-semibold">Stock Inventory Status</span>
                <span className="font-mono text-indigo-300 font-bold">{products.length} Products</span>
              </div>
              <div className="flex justify-between items-center text-[11px] text-slate-400">
                <span>Low Stock Items:</span>
                <span className={`font-bold font-mono ${lowStockCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {lowStockCount} items
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 space-y-2">
            <button
              onClick={() => setActiveTab('reports')}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2"
            >
              <span>View Financial Statements</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
