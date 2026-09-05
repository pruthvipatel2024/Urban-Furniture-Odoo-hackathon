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
      {/* Top Banner & Quick Actions with Official Urban Furniture Logo */}
      <div className="glass-panel bg-gradient-to-r from-[#060a17] via-[#0e1e38] to-[#060a17] p-6 sm:p-8 rounded-3xl text-white shadow-2xl relative overflow-hidden border border-teak-500/30">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-80 h-80 bg-teak-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 space-y-5">
          {/* Header Top Row: Logo + Badges + 2-Line Title */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
            <div className="flex items-center space-x-5">
              <div className="w-[6.5rem] h-[6.5rem] rounded-2xl bg-white p-1.5 flex items-center justify-center shadow-xl border-2 border-teak-400/50 shrink-0 teak-glow">
                <img
                  src="/logo.png"
                  alt="Urban Furniture Official Logo"
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-teak-300 bg-teak-950/80 px-3 py-0.5 rounded-full border border-teak-700/50 font-display">
                    ERP Double-Entry Accounting
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-400 flex items-center space-x-1 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-800/40">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Ledger 100% Balanced</span>
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-display leading-snug">
                  <div>Urban Furniture</div>
                  <div className="text-teak-300">Accounting Management System</div>
                </h1>
              </div>
            </div>
          </div>

          {/* Subtitle (Shortened to 3 Lines) + Cleanly Aligned Buttons Below */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
              Automated double-entry bookkeeping connecting Sales, Purchases, & Inventory.<br />
              Real-time financial reporting, ledger posting, & department budget control.<br />
              Complete end-to-end ERP accounting system for modern furniture business.
            </p>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                onClick={() => setShowDemoTourModal(true)}
                className="flex items-center space-x-2 bg-gradient-to-r from-teak-500 to-teak-600 hover:from-teak-400 hover:to-teak-500 text-slate-950 text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-teak-500/20 active:scale-95"
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
                className="flex items-center space-x-2 bg-navy-700 hover:bg-navy-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all border border-navy-500/50 shadow-lg active:scale-95"
              >
                <CreditCard className="w-4 h-4" />
                <span>Register Payment</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Primary KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Sales Revenue */}
        <div className="glass-panel p-5 rounded-2xl space-y-2 hover:border-teak-500/40 transition-all">
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
        <div className="glass-panel p-5 rounded-2xl space-y-2 hover:border-teak-500/40 transition-all">
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
        <div className="glass-panel p-5 rounded-2xl space-y-2 hover:border-teak-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Net Profit (P&L)</span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${netProfit >= 0 ? 'bg-teak-500/20 text-teak-300 border border-teak-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'}`}>
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
        <div className="glass-panel p-5 rounded-2xl space-y-2 hover:border-teak-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Bank & Cash Liquidity</span>
            <div className="w-9 h-9 rounded-xl bg-navy-700/50 text-teak-300 flex items-center justify-center border border-teak-500/30">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-teak-300 font-mono">{formatCurrency(totalLiquid)}</h3>
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
            <div className="p-4 bg-[#080e1e] border-b border-[#1e3e62]/40 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileCheck className="w-4 h-4 text-teak-400" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200 font-display">Recent Customer Invoices</h3>
              </div>
              <button
                onClick={() => setActiveTab('sales')}
                className="text-xs text-teak-400 hover:text-teak-300 font-semibold"
              >
                View All Invoices →
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#1e3e62]/40 text-slate-400 text-[11px]">
                    <th className="py-3 px-4">Invoice #</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Total Amount</th>
                    <th className="py-3 px-4">Outstanding</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e3e62]/30">
                  {invoices.slice(0, 5).map((inv) => (
                    <tr key={inv.id} className="hover:bg-navy-900/40 transition-colors">
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
          <div className="p-4 bg-[#080e1e] border-t border-[#1e3e62]/40 grid grid-cols-2 gap-4 text-xs">
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
            <div className="flex items-center space-x-2 pb-3 border-b border-[#1e3e62]/40">
              <PieChart className="w-4 h-4 text-teak-400" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200 font-display">Accounting Ledger Health</h3>
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

            <div className="p-3.5 rounded-xl bg-[#080e1e] border border-[#1e3e62]/40 space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-300">
                <span className="font-semibold font-display">Stock Inventory Status</span>
                <span className="font-mono text-teak-300 font-bold">{products.length} Products</span>
              </div>
              <div className="flex justify-between items-center text-[11px] text-slate-400">
                <span>Low Stock Items:</span>
                <span className={`font-bold font-mono ${lowStockCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {lowStockCount} items
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#1e3e62]/40 space-y-2">
            <button
              onClick={() => setActiveTab('reports')}
              className="w-full py-2.5 bg-gradient-to-r from-teak-600 to-teak-500 hover:from-teak-500 hover:to-teak-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-teak-600/30 transition-all flex items-center justify-center space-x-2 font-display"
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
